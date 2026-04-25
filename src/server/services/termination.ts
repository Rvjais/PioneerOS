import { prisma } from '@/server/db/prisma'

// Termination status constants
export const TERMINATION_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  HANDOVER: 'HANDOVER',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type TerminationStatus = (typeof TERMINATION_STATUS)[keyof typeof TERMINATION_STATUS]

// Client termination status constants
export const CLIENT_TERMINATION_STATUS = {
  NONE: 'NONE',
  IN_NOTICE: 'IN_NOTICE',
  TERMINATED: 'TERMINATED',
} as const

export type ClientTerminationStatus = (typeof CLIENT_TERMINATION_STATUS)[keyof typeof CLIENT_TERMINATION_STATUS]

// Status colors for UI
export const TERMINATION_STATUS_COLORS: Record<TerminationStatus, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-800' },
  HANDOVER: { bg: 'bg-purple-100', text: 'text-purple-800' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-800' },
}

export const TERMINATION_STATUS_LABELS: Record<TerminationStatus, string> = {
  PENDING: 'Pending Review',
  ACTIVE: 'Notice Period',
  HANDOVER: 'Handover Phase',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// Termination reason options
export const TERMINATION_REASONS = [
  { value: 'BUDGET', label: 'Budget constraints' },
  { value: 'IN_HOUSE', label: 'Moving to in-house team' },
  { value: 'SWITCHING_PROVIDER', label: 'Switching to another provider' },
  { value: 'BUSINESS_CLOSED', label: 'Business closing/restructuring' },
  { value: 'SERVICE_QUALITY', label: 'Service quality concerns' },
  { value: 'NOT_NEEDED', label: 'Services no longer needed' },
  { value: 'OTHER', label: 'Other reason' },
]

// Notice period in days
export const NOTICE_PERIOD_DAYS = 30

// Pro-rata calculation types
export interface ProRataMonth {
  month: string // "MM/YYYY" format
  year: number
  monthIndex: number // 0-11
  daysInMonth: number
  daysServed: number
  serviceStartDate: string
  serviceEndDate: string
  amount: number
}

export interface ProRataCalculation {
  months: ProRataMonth[]
  totalProRata: number
  pendingDues: number
  totalDue: number
}

/**
 * Calculate the notice end date (30 days from start)
 */
export function calculateNoticeEndDate(noticeStartDate: Date): Date {
  const endDate = new Date(noticeStartDate)
  endDate.setDate(endDate.getDate() + NOTICE_PERIOD_DAYS)
  return endDate
}

/**
 * Get days in a specific month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Calculate pro-rata amounts for the notice period
 */
export function calculateProRata(
  monthlyFee: number,
  noticeStartDate: Date,
  noticeEndDate: Date
): ProRataMonth[] {
  const results: ProRataMonth[] = []
  const currentDate = new Date(noticeStartDate)

  while (currentDate <= noticeEndDate) {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)

    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    // Service start for this month
    const serviceStart = currentDate > monthStart ? new Date(currentDate) : monthStart
    // Service end for this month
    const serviceEnd = noticeEndDate < monthEnd ? new Date(noticeEndDate) : monthEnd

    // Calculate days served (inclusive)
    const daysServed = Math.ceil(
      (serviceEnd.getTime() - serviceStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

    // Pro-rata amount for this month
    const amount = Math.round((monthlyFee / daysInMonth) * daysServed)

    results.push({
      month: `${(month + 1).toString().padStart(2, '0')}/${year}`,
      year,
      monthIndex: month,
      daysInMonth,
      daysServed,
      serviceStartDate: serviceStart.toISOString().split('T')[0],
      serviceEndDate: serviceEnd.toISOString().split('T')[0],
      amount,
    })

    // Move to next month
    currentDate.setDate(1)
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return results
}

/**
 * Get pending dues from unpaid invoices for a client
 */
export async function getPendingDues(clientId: string): Promise<number> {
  const pendingInvoices = await prisma.invoice.findMany({
    where: {
      clientId,
      status: { in: ['SENT', 'OVERDUE', 'PARTIAL'] },
    },
    select: {
      total: true,
      paidAmount: true,
    },
  })

  return pendingInvoices.reduce((sum, inv) => {
    return sum + ((inv.total || 0) - (inv.paidAmount || 0))
  }, 0)
}

/**
 * Full pro-rata calculation including pending dues
 */
export async function calculateFullProRata(
  clientId: string,
  monthlyFee: number,
  noticeStartDate: Date,
  noticeEndDate: Date
): Promise<ProRataCalculation> {
  const months = calculateProRata(monthlyFee, noticeStartDate, noticeEndDate)
  const totalProRata = months.reduce((sum, m) => sum + m.amount, 0)
  const pendingDues = await getPendingDues(clientId)

  return {
    months,
    totalProRata,
    pendingDues,
    totalDue: totalProRata + pendingDues,
  }
}

/**
 * Get the number of days remaining in notice period
 */
export function getDaysRemaining(noticeEndDate: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(noticeEndDate)
  end.setHours(0, 0, 0, 0)

  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

/**
 * Get the number of days elapsed in notice period
 */
export function getDaysElapsed(noticeStartDate: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const start = new Date(noticeStartDate)
  start.setHours(0, 0, 0, 0)

  const diff = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.min(diff, NOTICE_PERIOD_DAYS))
}

/**
 * Get notice period progress percentage
 */
export function getNoticeProgress(noticeStartDate: Date, noticeEndDate: Date): number {
  const elapsed = getDaysElapsed(noticeStartDate)
  const total = NOTICE_PERIOD_DAYS
  return Math.round((elapsed / total) * 100)
}

/**
 * Check if client has an active termination request
 */
export async function hasActiveTermination(clientId: string): Promise<boolean> {
  const count = await prisma.serviceTermination.count({
    where: {
      clientId,
      status: { in: ['PENDING', 'ACTIVE', 'HANDOVER'] },
    },
  })
  return count > 0
}

/**
 * Get the active termination request for a client
 */
export async function getActiveTermination(clientId: string) {
  return prisma.serviceTermination.findFirst({
    where: {
      clientId,
      status: { in: ['PENDING', 'ACTIVE', 'HANDOVER'] },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Create a termination request
 */
export interface CreateTerminationInput {
  clientId: string
  requestedBy: string
  reason?: string
  feedback?: string
}

export async function createTerminationRequest(input: CreateTerminationInput) {
  const { clientId, requestedBy, reason, feedback } = input

  // Check for existing active termination
  const existing = await hasActiveTermination(clientId)
  if (existing) {
    throw new Error('An active termination request already exists for this client')
  }

  // Get client info
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { monthlyFee: true, pendingAmount: true },
  })

  if (!client) {
    throw new Error('Client not found')
  }

  const monthlyFee = client.monthlyFee || 0
  const noticeStartDate = new Date()
  const noticeEndDate = calculateNoticeEndDate(noticeStartDate)

  // Calculate pro-rata
  const proRataCalc = await calculateFullProRata(clientId, monthlyFee, noticeStartDate, noticeEndDate)

  // Get first month for legacy fields
  const firstMonth = proRataCalc.months[0]

  return prisma.$transaction(async (tx) => {
    // Create termination request
    const termination = await tx.serviceTermination.create({
      data: {
        clientId,
        requestedBy,
        reason,
        feedback,
        noticeStartDate,
        noticeEndDate,
        lastServiceDate: noticeEndDate,
        monthlyFee,
        daysInMonth: firstMonth?.daysInMonth || 30,
        daysServed: proRataCalc.months.reduce((sum, m) => sum + m.daysServed, 0),
        proRataAmount: proRataCalc.totalProRata,
        proRataBreakdown: JSON.stringify(proRataCalc.months),
        pendingDues: proRataCalc.pendingDues,
        totalDue: proRataCalc.totalDue,
        status: 'ACTIVE', // Immediately active - auto-start notice period
      },
    })

    // Update client termination status
    await tx.client.update({
      where: { id: clientId },
      data: { terminationStatus: 'IN_NOTICE' },
    })

    return termination
  })
}

/**
 * Cancel a termination request
 */
export async function cancelTerminationRequest(
  terminationId: string,
  reason: string,
  cancelledBy: string
) {
  const termination = await prisma.serviceTermination.findUnique({
    where: { id: terminationId },
  })

  if (!termination) {
    throw new Error('Termination request not found')
  }

  if (termination.status === 'COMPLETED' || termination.status === 'CANCELLED') {
    throw new Error('Cannot cancel a completed or already cancelled termination')
  }

  return prisma.$transaction(async (tx) => {
    // Update termination
    const updated = await tx.serviceTermination.update({
      where: { id: terminationId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledReason: reason,
        processedBy: cancelledBy,
        processedAt: new Date(),
      },
    })

    // Reset client termination status
    await tx.client.update({
      where: { id: termination.clientId },
      data: { terminationStatus: null },
    })

    return updated
  })
}

/**
 * Record a payment for termination
 */
export async function recordTerminationPayment(
  terminationId: string,
  amount: number,
  recordedBy: string
) {
  const termination = await prisma.serviceTermination.findUnique({
    where: { id: terminationId },
  })

  if (!termination) {
    throw new Error('Termination request not found')
  }

  const newAmountPaid = termination.amountPaid + amount
  const isCleared = newAmountPaid >= termination.totalDue

  return prisma.serviceTermination.update({
    where: { id: terminationId },
    data: {
      amountPaid: newAmountPaid,
      paymentCleared: isCleared,
      paymentClearedAt: isCleared ? new Date() : null,
      dataExportEnabled: isCleared, // Enable data export when payment cleared
      adminNotes: termination.adminNotes
        ? `${termination.adminNotes}\n[${new Date().toISOString()}] Payment of Rs. ${amount} recorded by ${recordedBy}`
        : `[${new Date().toISOString()}] Payment of Rs. ${amount} recorded by ${recordedBy}`,
    },
  })
}

/**
 * Schedule handover call for termination
 */
export async function scheduleHandoverCall(
  terminationId: string,
  scheduledDate: Date,
  notes?: string
) {
  const termination = await prisma.serviceTermination.findUnique({
    where: { id: terminationId },
  })

  if (!termination) {
    throw new Error('Termination request not found')
  }

  return prisma.serviceTermination.update({
    where: { id: terminationId },
    data: {
      handoverCallScheduled: true,
      handoverCallDate: scheduledDate,
      handoverCallNotes: notes,
      status: termination.status === 'ACTIVE' ? 'HANDOVER' : termination.status,
    },
  })
}

/**
 * Complete handover call
 */
export async function completeHandoverCall(terminationId: string, notes?: string) {
  const termination = await prisma.serviceTermination.findUnique({
    where: { id: terminationId },
  })

  if (!termination) {
    throw new Error('Termination request not found')
  }

  return prisma.serviceTermination.update({
    where: { id: terminationId },
    data: {
      handoverCallCompleted: true,
      handoverCallNotes: notes || termination.handoverCallNotes,
    },
  })
}

/**
 * Complete termination after notice period
 */
export async function completeTermination(terminationId: string, completedBy: string) {
  const termination = await prisma.serviceTermination.findUnique({
    where: { id: terminationId },
  })

  if (!termination) {
    throw new Error('Termination request not found')
  }

  return prisma.$transaction(async (tx) => {
    // Update termination
    const updated = await tx.serviceTermination.update({
      where: { id: terminationId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        processedBy: completedBy,
        processedAt: new Date(),
      },
    })

    // Update client status
    await tx.client.update({
      where: { id: termination.clientId },
      data: {
        terminationStatus: 'TERMINATED',
        lifecycleStage: 'CHURNED',
        isLost: true,
        lostReason: termination.reason || 'Service terminated by client',
        stoppedServices: true,
      },
    })

    return updated
  })
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
