/**
 * Client Data Integrity Utilities
 * Ensures data consistency across related records
 */

import { prisma } from '@/server/db/prisma'

// ============================================
// HEALTH SCORE CONFIGURATION
// ============================================

export const HEALTH_CONFIG = {
  /** Days without a meeting before communication penalty applies */
  meetingWindowDays: 30,
  /** Open ticket count thresholds */
  tickets: {
    /** More than this = full penalty */
    criticalThreshold: 3,
    /** More than this = mild penalty */
    warningThreshold: 1,
  },
  /** Months of scope data to consider for deliverable completion */
  scopeLookbackMonths: 3,
  /** Months without feedback before gap penalty */
  feedbackGapMonths: 2,
  /** Score thresholds for health status */
  thresholds: {
    healthy: 80,
    warning: 50,
  },
  /** Penalty/bonus values */
  penalties: {
    paymentOverdue: 40,
    paymentPartial: 20,
    paymentPending: 10,
    deliverablesBelow50: 30,
    deliverablesBelow80: 15,
    deliverablesBelow100: 5,
    noMeetings: 10,
    ticketsCritical: 15,
    ticketsWarning: 5,
    feedbackLow: 15,
    feedbackMediocre: 5,
    feedbackGap: 5,
    feedbackBonus: -5, // negative = bonus
  },
  /** Number of recent scores to evaluate for trend */
  trendWindowSize: 4,
  /** Score drop over trend window that counts as declining */
  trendDeclineThreshold: 15,
} as const

// Valid lifecycle stage transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  LEAD: ['WON', 'CHURNED'],
  WON: ['ONBOARDING', 'CHURNED'],
  ONBOARDING: ['ACTIVE', 'AT_RISK', 'CHURNED'],
  ACTIVE: ['RETENTION', 'AT_RISK', 'CHURNED'],
  RETENTION: ['ACTIVE', 'AT_RISK', 'CHURNED'],
  AT_RISK: ['ACTIVE', 'RETENTION', 'CHURNED'],
  CHURNED: ['ACTIVE'], // Can be reactivated
}

// Status to lifecycle stage mapping
const STATUS_TO_LIFECYCLE: Record<string, string> = {
  ACTIVE: 'ACTIVE',
  LOST: 'CHURNED',
  ON_HOLD: 'AT_RISK',
  ONBOARDING: 'ONBOARDING',
}

const LIFECYCLE_TO_STATUS: Record<string, string> = {
  LEAD: 'ONBOARDING',
  WON: 'ONBOARDING',
  ONBOARDING: 'ONBOARDING',
  ACTIVE: 'ACTIVE',
  RETENTION: 'ACTIVE',
  AT_RISK: 'ON_HOLD',
  CHURNED: 'LOST',
}

/**
 * Validate a lifecycle stage transition
 */
export function isValidTransition(fromStage: string, toStage: string): boolean {
  const validNextStages = VALID_TRANSITIONS[fromStage]
  return validNextStages?.includes(toStage) ?? false
}

/**
 * Sync payment status fields for a client
 * Ensures paymentStatus and currentPaymentStatus are consistent
 */
export async function syncPaymentStatus(clientId: string): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      paymentStatus: true,
      currentPaymentStatus: true,
      paymentDueDay: true,
    },
  })

  if (!client) return

  // Get latest payment collection
  const latestPayment = await prisma.paymentCollection.findFirst({
    where: { clientId },
    orderBy: { collectedAt: 'desc' },
    select: {
      status: true,
      collectedAt: true,
    },
  })

  // Get latest invoice status
  const latestInvoice = await prisma.invoice.findFirst({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: {
      status: true,
      dueDate: true,
    },
  })

  // Determine current payment status
  let newStatus = 'PENDING'

  if (latestPayment?.status === 'CONFIRMED') {
    newStatus = 'DONE'
  } else if (latestInvoice) {
    if (latestInvoice.status === 'PAID') {
      newStatus = 'DONE'
    } else if (latestInvoice.status === 'PARTIAL') {
      newStatus = 'PARTIAL'
    } else if (latestInvoice.dueDate && new Date(latestInvoice.dueDate) < new Date()) {
      newStatus = 'OVERDUE'
    }
  }

  // Update if changed
  if (client.currentPaymentStatus !== newStatus) {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        currentPaymentStatus: newStatus,
        paymentStatus: newStatus === 'DONE' ? 'PAID' : newStatus === 'OVERDUE' ? 'OVERDUE' : 'PENDING',
      },
    })
  }
}

/**
 * Create a lifecycle event and send notifications
 */
export async function recordLifecycleTransition(
  clientId: string,
  fromStage: string,
  toStage: string,
  triggeredBy: string,
  notes?: string
): Promise<void> {
  // Validate transition
  if (!isValidTransition(fromStage, toStage)) {
    console.warn(`Invalid lifecycle transition: ${fromStage} -> ${toStage}`)
  }

  // Create lifecycle event
  await prisma.clientLifecycleEvent.create({
    data: {
      clientId,
      fromStage,
      toStage,
      triggeredBy,
      notes,
    },
  })

  // Send notifications based on transition type
  await sendLifecycleNotifications(clientId, fromStage, toStage)
}

/**
 * Send notifications for lifecycle transitions
 */
async function sendLifecycleNotifications(
  clientId: string,
  fromStage: string,
  toStage: string
): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      accountManagerId: true,
      teamMembers: {
        where: { isPrimary: true },
        select: { userId: true },
      },
    },
  })

  if (!client) return

  const recipientIds: string[] = []

  // Always notify account manager
  if (client.accountManagerId) {
    recipientIds.push(client.accountManagerId)
  }

  // Notify primary team members
  client.teamMembers.forEach((tm) => {
    if (!recipientIds.includes(tm.userId)) {
      recipientIds.push(tm.userId)
    }
  })

  // Determine notification type and message
  let title = ''
  let message = ''
  let priority: 'NORMAL' | 'URGENT' = 'NORMAL'

  switch (toStage) {
    case 'CHURNED': {
      title = 'Client Lost'
      message = `${client.name} has been marked as churned. Please ensure all final processes are completed.`
      priority = 'URGENT'
      // Also notify accounts team for final invoicing
      const accountsUsers = await prisma.user.findMany({
        where: { OR: [{ role: 'ACCOUNTS' }, { department: 'ACCOUNTS' }] },
        select: { id: true },
      })
      accountsUsers.forEach((u) => {
        if (!recipientIds.includes(u.id)) {
          recipientIds.push(u.id)
        }
      })
      break
    }

    case 'AT_RISK': {
      title = 'Client At Risk'
      message = `${client.name} has been flagged as at-risk. Immediate attention required.`
      priority = 'URGENT'
      // Notify managers
      const managers = await prisma.user.findMany({
        where: { role: { in: ['MANAGER', 'SUPER_ADMIN'] } },
        select: { id: true },
      })
      managers.forEach((u) => {
        if (!recipientIds.includes(u.id)) {
          recipientIds.push(u.id)
        }
      })
      break
    }

    case 'ACTIVE': {
      if (fromStage === 'ONBOARDING') {
        title = 'Client Activated'
        message = `${client.name} has completed onboarding and is now active.`
      } else if (fromStage === 'AT_RISK') {
        title = 'Client Recovered'
        message = `${client.name} is no longer at risk and has been reactivated.`
      }
      break
    }

    case 'ONBOARDING': {
      title = 'New Client Onboarding'
      message = `${client.name} is ready for onboarding. Please begin the onboarding process.`
      break
    }

    default:
      return // No notification for other transitions
  }

  if (title && recipientIds.length > 0) {
    await prisma.notification.createMany({
      data: recipientIds.map((userId) => ({
        userId,
        type: 'CLIENT_LIFECYCLE',
        title,
        message,
        link: `/clients/${clientId}`,
        priority,
      })),
    })
  }
}

/**
 * Calculate and update client health score
 * Based on payment status, deliverable completion, and engagement
 *
 * HEALTH SCORE ALGORITHM (0-100 scale, starts at 100, penalties subtracted):
 *
 * 1. Payment Status (40% weight / max -40 points):
 *    - DONE: no penalty
 *    - PENDING: -10 points
 *    - PARTIAL: -20 points
 *    - OVERDUE: -40 points (full weight penalty)
 *
 * 2. Deliverables Completion (30% weight / max -30 points):
 *    - Looks at ClientScope records from the last 3 months
 *    - Compares delivered vs target quantity
 *    - Completion < 50%: -30 points
 *    - Completion 50-79%: -15 points
 *    - Completion 80-99%: -5 points
 *    - Completion >= 100%: no penalty
 *
 * 3. Communication Frequency (15% weight / max -10 points):
 *    - Counts meetings in the last 30 days
 *    - Zero meetings: -10 points
 *
 * 4. Team Responsiveness / Support Load (15% weight / max -15 points):
 *    - Counts open/in-progress support tickets
 *    - More than 3 open tickets: -15 points
 *    - 2-3 open tickets: -5 points
 *
 * 5. Client Feedback (bonus/penalty):
 *    - Latest survey from current or last month
 *    - Avg rating >= 4: +5 bonus
 *    - Avg rating < 2.5: -15 penalty
 *    - Avg rating 2.5-3.5: -5 penalty
 *    - No feedback in 2 months: -5 penalty (feedback gap)
 *
 * Final score is clamped to [0, 100] and mapped to health status:
 *    - >= 80: HEALTHY
 *    - 50-79: WARNING
 *    - < 50: AT_RISK
 */
export async function calculateHealthScore(clientId: string): Promise<number> {
  const cfg = HEALTH_CONFIG
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      currentPaymentStatus: true,
      lifecycleStage: true,
      healthScore: true,
      tier: true,
    },
  })

  if (!client) return 0

  const previousScore = client.healthScore

  let score = 100

  // Payment factor (40% weight)
  switch (client.currentPaymentStatus) {
    case 'DONE':
      break
    case 'PENDING':
      score -= cfg.penalties.paymentPending
      break
    case 'PARTIAL':
      score -= cfg.penalties.paymentPartial
      break
    case 'OVERDUE':
      score -= cfg.penalties.paymentOverdue
      break
  }

  // Check recent deliverables (30% weight)
  const now = new Date()
  const scopeLookback = new Date(now.getFullYear(), now.getMonth() - (cfg.scopeLookbackMonths - 1), 1)

  const recentScope = await prisma.clientScope.findMany({
    where: {
      clientId,
      month: { gte: scopeLookback },
    },
    select: {
      quantity: true,
      delivered: true,
    },
  })

  if (recentScope.length > 0) {
    const totalTarget = recentScope.reduce((sum, s) => sum + (s.quantity || 0), 0)
    const totalDelivered = recentScope.reduce((sum, s) => sum + (s.delivered || 0), 0)

    if (totalTarget > 0) {
      const completionRate = totalDelivered / totalTarget
      if (completionRate < 0.5) {
        score -= cfg.penalties.deliverablesBelow50
      } else if (completionRate < 0.8) {
        score -= cfg.penalties.deliverablesBelow80
      } else if (completionRate < 1) {
        score -= cfg.penalties.deliverablesBelow100
      }
    }
  }

  // Communication factor (15% weight)
  const meetingCutoff = new Date(Date.now() - cfg.meetingWindowDays * 24 * 60 * 60 * 1000)
  const recentMeetings = await prisma.meeting.count({
    where: {
      clientId,
      date: { gte: meetingCutoff },
    },
  })

  if (recentMeetings === 0) {
    score -= cfg.penalties.noMeetings
  }

  // Support tickets factor (15% weight)
  const openTickets = await prisma.supportTicket.count({
    where: {
      clientUser: { clientId },
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
  })

  if (openTickets > cfg.tickets.criticalThreshold) {
    score -= cfg.penalties.ticketsCritical
  } else if (openTickets > cfg.tickets.warningThreshold) {
    score -= cfg.penalties.ticketsWarning
  }

  // Client feedback factor
  const feedbackGapDate = new Date(now.getFullYear(), now.getMonth() - cfg.feedbackGapMonths, 1)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const latestFeedback = await prisma.clientFeedback.findFirst({
    where: {
      clientId,
      month: {
        gte: lastMonthStart,
        lte: currentMonthStart,
      },
    },
    orderBy: { month: 'desc' },
    select: {
      overallSatisfaction: true,
      communicationRating: true,
      deliveryRating: true,
      valueRating: true,
    },
  })

  if (latestFeedback) {
    const ratings = [
      latestFeedback.overallSatisfaction,
      latestFeedback.communicationRating,
      latestFeedback.deliveryRating,
      latestFeedback.valueRating,
    ].filter((r): r is number => r !== null)

    if (ratings.length > 0) {
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
      if (avgRating >= 4) {
        score -= cfg.penalties.feedbackBonus // negative penalty = bonus
      } else if (avgRating < 2.5) {
        score -= cfg.penalties.feedbackLow
      } else if (avgRating < 3.5) {
        score -= cfg.penalties.feedbackMediocre
      }
    }
  } else {
    const anyRecentFeedback = await prisma.clientFeedback.findFirst({
      where: {
        clientId,
        month: { gte: feedbackGapDate },
      },
    })
    if (!anyRecentFeedback) {
      score -= cfg.penalties.feedbackGap
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  // Determine health status
  let healthStatus: string
  if (score >= cfg.thresholds.healthy) {
    healthStatus = 'HEALTHY'
  } else if (score >= cfg.thresholds.warning) {
    healthStatus = 'WARNING'
  } else {
    healthStatus = 'AT_RISK'
  }

  // Trend detection: compare against previous score
  const trend = detectHealthTrend(previousScore, score)

  // Update client
  await prisma.client.update({
    where: { id: clientId },
    data: {
      healthScore: score,
      healthStatus,
    },
  })

  // If score is declining significantly, notify based on tier priority
  if (trend === 'DECLINING' && previousScore !== null) {
    await notifyHealthDecline(clientId, client.tier, previousScore, score)
  }

  return score
}

/**
 * Detect health score trend by comparing current to previous score.
 * Returns 'DECLINING' if the drop exceeds the configured threshold.
 */
function detectHealthTrend(
  previousScore: number | null,
  currentScore: number
): 'STABLE' | 'IMPROVING' | 'DECLINING' {
  if (previousScore === null) return 'STABLE'

  const delta = currentScore - previousScore
  if (delta <= -HEALTH_CONFIG.trendDeclineThreshold) return 'DECLINING'
  if (delta >= HEALTH_CONFIG.trendDeclineThreshold) return 'IMPROVING'
  return 'STABLE'
}

/**
 * Notify stakeholders when a client's health score is declining.
 * Higher-tier clients trigger notifications to managers in addition to the account team.
 */
async function notifyHealthDecline(
  clientId: string,
  tier: string,
  previousScore: number,
  currentScore: number
): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      name: true,
      accountManagerId: true,
      teamMembers: {
        where: { isPrimary: true },
        select: { userId: true },
      },
    },
  })

  if (!client) return

  const recipientIds: string[] = []

  if (client.accountManagerId) {
    recipientIds.push(client.accountManagerId)
  }
  client.teamMembers.forEach((tm) => {
    if (!recipientIds.includes(tm.userId)) {
      recipientIds.push(tm.userId)
    }
  })

  // For PREMIUM/ENTERPRISE clients, also notify managers
  const highValueTiers = ['PREMIUM', 'ENTERPRISE']
  if (highValueTiers.includes(tier)) {
    const managers = await prisma.user.findMany({
      where: { role: { in: ['MANAGER', 'SUPER_ADMIN'] } },
      select: { id: true },
    })
    managers.forEach((m) => {
      if (!recipientIds.includes(m.id)) {
        recipientIds.push(m.id)
      }
    })
  }

  if (recipientIds.length === 0) return

  const priority = highValueTiers.includes(tier) ? 'URGENT' : 'NORMAL'

  await prisma.notification.createMany({
    data: recipientIds.map((userId) => ({
      userId,
      type: 'CLIENT_LIFECYCLE',
      title: 'Health Score Declining',
      message: `${client.name} health score dropped from ${previousScore} to ${currentScore}. Immediate review recommended.`,
      link: `/clients/${clientId}`,
      priority: priority as 'NORMAL' | 'URGENT',
    })),
  })
}

/**
 * Bulk update health scores for all active clients
 */
export async function updateAllHealthScores(): Promise<{ updated: number; errors: number }> {
  const clients = await prisma.client.findMany({
    where: {
      status: 'ACTIVE',
      isLost: false,
    },
    select: { id: true },
  })

  let updated = 0
  let errors = 0

  for (const client of clients) {
    try {
      await calculateHealthScore(client.id)
      updated++
    } catch (error) {
      console.error(`Failed to update health score for client ${client.id}:`, error)
      errors++
    }
  }

  return { updated, errors }
}
