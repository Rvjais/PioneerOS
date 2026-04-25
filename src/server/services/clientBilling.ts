/**
 * Client Billing Utilities
 * Handles tier/fee determination and billing lifecycle triggers
 */

import { prisma } from '@/server/db/prisma'

// ============================================
// TIER AND FEE CONFIGURATION
// ============================================

// Per-client revenue per tier (for revenue calculations)
export const TIER_REVENUE = {
  MICRO: 1,       // ₹1 per client
  STARTER: 2,     // ₹2 per client (maps to STANDARD tier)
  STANDARD: 2,    // ₹2 per client
  PREMIUM: 3,     // ₹3 per client
  ENTERPRISE: 4,  // ₹4 per client
} as const

// MyKohi subaccount revenue (in USD)
export const MYKOHI_REVENUE_USD = 1 // $1 per subaccount

// MyKohi subaccount names
export const MYKOHI_SUBACCOUNTS = [
  'Options',
  'Karma',
  'GlobeCore',
  'Dr Ritesh',
  'Resiliency',
  'Upshaw Dental',
] as const

// Default monthly fees by tier (in INR)
export const TIER_DEFAULTS = {
  MICRO: {
    minFee: 0,
    defaultFee: 10000,
    maxFee: 14999,
  },
  STARTER: {
    minFee: 15000,
    defaultFee: 20000,
    maxFee: 24999,
  },
  STANDARD: {
    minFee: 25000,
    defaultFee: 50000,
    maxFee: 99999,
  },
  PREMIUM: {
    minFee: 100000,
    defaultFee: 150000,
    maxFee: 299999,
  },
  ENTERPRISE: {
    minFee: 300000,
    defaultFee: 500000,
    maxFee: null, // No upper limit
  },
} as const

export type ClientTier = keyof typeof TIER_DEFAULTS

/**
 * Normalize a budget string to a numeric INR value.
 * Handles formats like "2L", "50K", "₹25,000", "1.5 lakh", "under 15K", "5L-10L" (uses upper bound).
 */
export function parseBudgetToNumber(budget: string): number | null {
  const cleaned = budget.trim().toLowerCase()

  // Handle range formats like "5L-10L", "25K-50K" — use the upper bound
  const rangeMatch = cleaned.match(/[\d.]+\s*[lk]?\s*[-–to]+\s*([\d.]+)\s*([lk])?/i)
  if (rangeMatch) {
    const value = parseFloat(rangeMatch[1])
    const unit = rangeMatch[2]?.toLowerCase()
    if (!isNaN(value)) {
      if (unit === 'l') return value * 100000
      if (unit === 'k') return value * 1000
      return value
    }
  }

  // Handle "10L+", "5L", "2 lakh", "1.5L"
  const lakhMatch = cleaned.match(/([\d.]+)\s*(?:l(?:akh|ac)?|lac)\+?/i)
  if (lakhMatch) {
    const value = parseFloat(lakhMatch[1])
    if (!isNaN(value)) return value * 100000
  }

  // Handle "50K", "25k", "15K+"
  const kMatch = cleaned.match(/([\d.]+)\s*k\+?/i)
  if (kMatch) {
    const value = parseFloat(kMatch[1])
    if (!isNaN(value)) return value * 1000
  }

  // Handle "under 15K" — use the stated value as-is
  const underMatch = cleaned.match(/under\s*([\d.]+)\s*([lk])?/i)
  if (underMatch) {
    const value = parseFloat(underMatch[1])
    const unit = underMatch[2]?.toLowerCase()
    if (!isNaN(value)) {
      if (unit === 'l') return value * 100000
      if (unit === 'k') return value * 1000
      return value
    }
  }

  // Plain numeric: "₹25,000", "300000", "25000"
  const numericValue = parseFloat(cleaned.replace(/[₹$,\s]/g, ''))
  if (!isNaN(numericValue)) return numericValue

  return null
}

/**
 * Map a numeric budget (INR) to the appropriate tier.
 */
function tierFromAmount(amount: number): ClientTier {
  if (amount >= 300000) return 'ENTERPRISE'
  if (amount >= 100000) return 'PREMIUM'
  if (amount >= 25000) return 'STANDARD'
  if (amount >= 15000) return 'STARTER'
  return 'MICRO'
}

/**
 * Determine tier and default fee from budget string.
 * Normalizes the budget to a number first, then maps to tier.
 */
export function determineTierAndFee(
  budget?: string | null,
  segment?: string
): { tier: ClientTier; defaultFee: number } {
  // MyKohi whitelabel subaccounts — $1 USD revenue each
  if (segment === 'MYKOHI_WHITELABEL') {
    return { tier: 'PREMIUM', defaultFee: TIER_DEFAULTS.PREMIUM.defaultFee }
  }

  if (!budget) {
    return { tier: 'STANDARD', defaultFee: TIER_DEFAULTS.STANDARD.defaultFee }
  }

  const amount = parseBudgetToNumber(budget)
  if (amount !== null && amount > 0) {
    const tier = tierFromAmount(amount)
    // Use amount as fee if it falls within tier range, otherwise use tier default
    const tierDef = TIER_DEFAULTS[tier]
    const fee = (amount >= tierDef.minFee && (tierDef.maxFee === null || amount <= tierDef.maxFee))
      ? amount
      : tierDef.defaultFee
    return { tier, defaultFee: fee }
  }

  return { tier: 'STANDARD', defaultFee: TIER_DEFAULTS.STANDARD.defaultFee }
}

// ============================================
// REVENUE CALCULATION
// ============================================

/**
 * Get per-client revenue based on tier
 * Micro: ₹1, Starter/Standard: ₹2, Premium: ₹3, Enterprise: ₹4
 * MyKohi subaccounts: $1 USD each
 */
export function getClientRevenue(tier: string, segment?: string): { amount: number; currency: 'INR' | 'USD' } {
  if (segment === 'MYKOHI_WHITELABEL') {
    return { amount: MYKOHI_REVENUE_USD, currency: 'USD' }
  }
  const revenue = TIER_REVENUE[tier as keyof typeof TIER_REVENUE] ?? TIER_REVENUE.STANDARD
  return { amount: revenue, currency: 'INR' }
}

/**
 * Calculate total revenue across all clients
 */
export async function calculateTotalRevenue(): Promise<{
  totalINR: number
  totalUSD: number
  breakdown: { tier: string; count: number; revenuePerClient: number; currency: string; total: number }[]
}> {
  const clients = await prisma.client.findMany({
    where: { status: { not: 'CHURNED' }, isLost: false },
    select: { id: true, tier: true, clientSegment: true },
  })

  const breakdown: Record<string, { count: number; revenuePerClient: number; currency: string }> = {}
  let totalINR = 0
  let totalUSD = 0

  for (const client of clients) {
    const { amount, currency } = getClientRevenue(client.tier, client.clientSegment)
    const key = client.clientSegment === 'MYKOHI_WHITELABEL' ? 'MYKOHI' : (client.tier || 'STANDARD')

    if (!breakdown[key]) {
      breakdown[key] = { count: 0, revenuePerClient: amount, currency }
    }
    breakdown[key].count++

    if (currency === 'USD') {
      totalUSD += amount
    } else {
      totalINR += amount
    }
  }

  return {
    totalINR,
    totalUSD,
    breakdown: Object.entries(breakdown).map(([tier, data]) => ({
      tier,
      count: data.count,
      revenuePerClient: data.revenuePerClient,
      currency: data.currency,
      total: data.count * data.revenuePerClient,
    })),
  }
}

// ============================================
// BILLING LIFECYCLE TRIGGERS
// ============================================

/**
 * Check if client should have invoice generated
 * Returns true if client is due for invoicing
 */
export async function shouldGenerateInvoice(clientId: string): Promise<{
  shouldGenerate: boolean
  reason?: string
}> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      status: true,
      isLost: true,
      monthlyFee: true,
      invoiceDayOfMonth: true,
      billingType: true,
      startDate: true,
    },
  })

  if (!client) {
    return { shouldGenerate: false, reason: 'Client not found' }
  }

  // Don't generate for lost or inactive clients
  if (client.isLost || client.status === 'LOST') {
    return { shouldGenerate: false, reason: 'Client is lost' }
  }

  // Don't generate if no monthly fee set
  if (!client.monthlyFee || client.monthlyFee <= 0) {
    return { shouldGenerate: false, reason: 'No monthly fee configured' }
  }

  // Check if retainer has started
  if (client.startDate && new Date(client.startDate) > new Date()) {
    return { shouldGenerate: false, reason: 'Retainer has not started yet' }
  }

  // Check if there's already an invoice for this month
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      clientId,
      createdAt: { gte: currentMonth },
      status: { not: 'CANCELLED' },
    },
  })

  if (existingInvoice) {
    return { shouldGenerate: false, reason: 'Invoice already exists for this month' }
  }

  return { shouldGenerate: true }
}

/**
 * Create billing notification for accounts team
 */
export async function notifyAccountsTeam(
  type: 'INVOICE_DUE' | 'PAYMENT_OVERDUE' | 'NEW_CLIENT' | 'CLIENT_ACTIVATED',
  clientId: string,
  details?: string
): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, monthlyFee: true },
  })

  if (!client) return

  const accountsUsers = await prisma.user.findMany({
    where: {
      OR: [{ role: 'ACCOUNTS' }, { department: 'ACCOUNTS' }],
    },
    select: { id: true },
  })

  if (accountsUsers.length === 0) return

  const messages: Record<string, { title: string; message: string; priority: 'NORMAL' | 'URGENT' }> = {
    INVOICE_DUE: {
      title: 'Invoice Due',
      message: `Invoice for ${client.name} is due for generation. Monthly fee: ₹${client.monthlyFee?.toLocaleString('en-IN')}`,
      priority: 'NORMAL',
    },
    PAYMENT_OVERDUE: {
      title: 'Payment Overdue',
      message: `Payment for ${client.name} is overdue. ${details || ''}`,
      priority: 'URGENT',
    },
    NEW_CLIENT: {
      title: 'New Client for Billing Setup',
      message: `New client ${client.name} has been created. Please set up billing details.`,
      priority: 'NORMAL',
    },
    CLIENT_ACTIVATED: {
      title: 'Client Activated - Invoice Ready',
      message: `${client.name} has been activated. Monthly fee: ₹${client.monthlyFee?.toLocaleString('en-IN')}. Please generate first invoice.`,
      priority: 'NORMAL',
    },
  }

  const notification = messages[type]
  if (!notification) return

  await prisma.notification.createMany({
    data: accountsUsers.map((user) => ({
      userId: user.id,
      type: 'BILLING',
      title: notification.title,
      message: notification.message,
      link: `/clients/${clientId}`,
      priority: notification.priority,
    })),
  })
}

/**
 * Update client billing when tier changes
 */
export async function syncBillingWithTier(
  clientId: string,
  newTier: ClientTier
): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, monthlyFee: true, tier: true },
  })

  if (!client) return

  const tierDefaults = TIER_DEFAULTS[newTier]

  // If monthlyFee is not set or is below new tier minimum, update it
  if (!client.monthlyFee || client.monthlyFee < tierDefaults.minFee) {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        tier: newTier,
        monthlyFee: tierDefaults.defaultFee,
      },
    })
  }
}

// ============================================
// WORK ENTRY TO INVOICE LINKING
// ============================================

/**
 * Get unbilled work entries for a client
 */
export async function getUnbilledWorkEntries(clientId: string): Promise<{
  entries: Array<{
    id: string
    category: string
    deliverableType: string
    quantity: number
    hoursSpent: number | null
    date: Date
  }>
  totalHours: number
  summary: Record<string, number>
}> {
  const entries = await prisma.workEntry.findMany({
    where: {
      clientId,
      status: 'APPROVED',
      invoiceId: null,
    },
    select: {
      id: true,
      category: true,
      deliverableType: true,
      quantity: true,
      hoursSpent: true,
      date: true,
    },
    orderBy: { date: 'asc' },
  })

  // Calculate totals
  const totalHours = entries.reduce((sum, e) => sum + (e.hoursSpent || 0), 0)
  const summary: Record<string, number> = {}

  for (const entry of entries) {
    const key = `${entry.category}:${entry.deliverableType}`
    summary[key] = (summary[key] || 0) + entry.quantity
  }

  return { entries, totalHours, summary }
}

/**
 * Generate invoice line items from work entries
 */
export function generateInvoiceItemsFromWork(
  workSummary: Record<string, number>,
  hourlyRate: number = 500
): Array<{ description: string; quantity: number; rate: number; amount: number }> {
  const items: Array<{ description: string; quantity: number; rate: number; amount: number }> = []

  for (const [key, quantity] of Object.entries(workSummary)) {
    const [category, type] = key.split(':')
    items.push({
      description: `${category} - ${type}`,
      quantity,
      rate: hourlyRate,
      amount: quantity * hourlyRate,
    })
  }

  return items
}
