/**
 * Self-Appraisal System
 *
 * Auto-triggers appraisal forms based on:
 * 1. Joining date anniversary (12 months after joining)
 * 2. Learning hours (min 6 hours/month = 72 hours/year)
 * 3. Manager-initiated appraisals
 */

import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import {
  APPRAISAL_LEARNING_HOURS_REQUIRED,
  APPRAISAL_LEARNING_HOURS_MONTHLY,
  APPRAISAL_POSTPONE_DAYS,
} from '@/shared/constants/hr'

interface AppraisalEligibility {
  isEligible: boolean
  reason?: string
  learningHours: number
  requiredHours: number
  joiningDate: Date
  appraisalDueDate: Date | null
  daysTillAppraisal: number | null
  blockers: string[]
}

/**
 * Calculate appraisal eligibility for a user
 */
export async function checkAppraisalEligibility(userId: string): Promise<AppraisalEligibility> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      joiningDate: true,
      appraisalDate: true,
      status: true,
    },
  })

  if (!user) {
    return {
      isEligible: false,
      reason: 'User not found',
      learningHours: 0,
      requiredHours: APPRAISAL_LEARNING_HOURS_REQUIRED,
      joiningDate: new Date(),
      appraisalDueDate: null,
      daysTillAppraisal: null,
      blockers: ['User not found'],
    }
  }

  // Get learning hours for the past 12 months
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const learningLogs = await prisma.learningLog.aggregate({
    where: {
      userId,
      createdAt: { gte: twelveMonthsAgo },
    },
    _sum: { minutesWatched: true },
  })

  const learningHours = (learningLogs._sum.minutesWatched || 0) / 60
  const requiredHours = APPRAISAL_LEARNING_HOURS_REQUIRED

  // Calculate appraisal due date (joining date + 12 months)
  const joiningDate = new Date(user.joiningDate)
  const appraisalDueDate = user.appraisalDate ? new Date(user.appraisalDate) : null
  const now = new Date()

  const blockers: string[] = []

  // Check learning hours requirement
  if (learningHours < requiredHours) {
    const deficit = requiredHours - learningHours
    blockers.push(`Need ${deficit.toFixed(1)} more learning hours (current: ${learningHours.toFixed(1)}h / required: ${requiredHours}h)`)
  }

  // Check if user is on probation or PIP
  if (user.status === 'PROBATION') {
    blockers.push('Currently on probation - appraisal will be after confirmation')
  }
  if (user.status === 'PIP') {
    blockers.push('Currently on Performance Improvement Plan')
  }

  // Calculate days till appraisal
  let daysTillAppraisal: number | null = null
  if (appraisalDueDate) {
    daysTillAppraisal = Math.ceil((appraisalDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const isEligible = blockers.length === 0 && appraisalDueDate !== null && appraisalDueDate <= now

  return {
    isEligible,
    reason: isEligible ? 'Eligible for appraisal' : blockers.join('; '),
    learningHours,
    requiredHours,
    joiningDate,
    appraisalDueDate,
    daysTillAppraisal,
    blockers,
  }
}

/**
 * Get or create appraisal for current cycle
 */
export async function getOrCreateAppraisal(userId: string) {
  const currentYear = new Date().getFullYear()

  // Use transaction to prevent race condition (duplicate appraisals)
  return await prisma.$transaction(async (tx) => {
    // Check if appraisal exists for current cycle
    let appraisal = await tx.selfAppraisal.findFirst({
      where: {
        userId,
        cycleYear: currentYear,
        cyclePeriod: 'ANNUAL',
      },
    })

    if (!appraisal) {
      // Get user's learning hours
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

      const learningLogs = await tx.learningLog.aggregate({
        where: {
          userId,
          createdAt: { gte: twelveMonthsAgo },
        },
        _sum: { minutesWatched: true },
      })

      const learningHoursThisYear = (learningLogs._sum.minutesWatched || 0) / 60

      // Create new appraisal
      appraisal = await tx.selfAppraisal.create({
        data: {
          userId,
          cycleYear: currentYear,
          cyclePeriod: 'ANNUAL',
          status: 'PENDING',
          learningHoursThisYear,
        },
      })
    }

    return appraisal
  })
}

/**
 * Auto-trigger appraisals for eligible users
 * Should be called by a cron job daily
 */
export async function triggerEligibleAppraisals() {
  const now = new Date()
  const currentYear = now.getFullYear()

  // Find users whose appraisal date is due and don't have an appraisal this year
  const eligibleUsers = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      appraisalDate: { lte: now },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      empId: true,
      appraisalDate: true,
    },
  })

  // Batch query: find all existing appraisals for this year in one query (fixes N+1)
  const existingAppraisals = await prisma.selfAppraisal.findMany({
    where: {
      userId: { in: eligibleUsers.map(u => u.id) },
      cycleYear: currentYear,
    },
    select: { userId: true },
  })
  const usersWithAppraisal = new Set(existingAppraisals.map(a => a.userId))

  const results: Array<{
    userId: string
    empId: string
    name: string
    appraisalId?: string
    status: string
    reason?: string
  }> = []

  for (const user of eligibleUsers) {
    // Skip users who already have appraisal this year (checked via batch query)
    if (usersWithAppraisal.has(user.id)) {
      continue
    }

    try {
      // Check eligibility (learning hours)
      const eligibility = await checkAppraisalEligibility(user.id)

      if (eligibility.isEligible) {
        // Create appraisal
        const appraisal = await getOrCreateAppraisal(user.id)

        // Create notification for employee
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'GENERAL',
            title: 'Annual Self-Appraisal Due',
            message: 'Your annual self-appraisal form is now available. Please complete it within 7 days.',
            link: '/hr/appraisals/self',
            priority: 'HIGH',
          },
        })

        results.push({
          userId: user.id,
          empId: user.empId,
          name: `${user.firstName} ${user.lastName || ''}`,
          appraisalId: appraisal.id,
          status: 'TRIGGERED',
        })
      } else {
        // Push appraisal date if not eligible (insufficient learning hours)
        if (eligibility.blockers.some(b => b.includes('learning hours'))) {
          // Push appraisal date by 30 days
          const newAppraisalDate = new Date(user.appraisalDate || now)
          newAppraisalDate.setDate(newAppraisalDate.getDate() + APPRAISAL_POSTPONE_DAYS)

          await prisma.user.update({
            where: { id: user.id },
            data: { appraisalDate: newAppraisalDate },
          })

          // Notify user
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'GENERAL',
              title: 'Appraisal Postponed',
              message: `Your appraisal has been postponed by ${APPRAISAL_POSTPONE_DAYS} days due to insufficient learning hours. Please complete ${(eligibility.requiredHours - eligibility.learningHours).toFixed(1)} more hours.`,
              link: '/learning',
              priority: 'NORMAL',
            },
          })

          results.push({
            userId: user.id,
            empId: user.empId,
            name: `${user.firstName} ${user.lastName || ''}`,
            status: 'POSTPONED',
            reason: eligibility.reason,
          })
        }
      }
    } catch (error) {
      console.error(`Failed to process appraisal for user ${user.empId} (${user.id}):`, error)
      results.push({
        userId: user.id,
        empId: user.empId,
        name: `${user.firstName} ${user.lastName || ''}`,
        status: 'ERROR',
        reason: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}

/**
 * Calculate learning hours per month for a user
 */
export async function getLearningHoursByMonth(userId: string, months = 12) {
  const results: Array<{ month: string; hours: number; required: number }> = []
  const now = new Date()

  for (let i = 0; i < months; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    const logs = await prisma.learningLog.aggregate({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: { minutesWatched: true },
    })

    results.push({
      month: formatDateDDMMYYYY(monthStart),
      hours: (logs._sum.minutesWatched || 0) / 60,
      required: APPRAISAL_LEARNING_HOURS_MONTHLY,
    })
  }

  return results.reverse()
}

/**
 * Get appraisal statistics for HR dashboard
 */
export async function getAppraisalStats() {
  const currentYear = new Date().getFullYear()

  const [pending, inProgress, submitted, completed, total] = await Promise.all([
    prisma.selfAppraisal.count({
      where: { cycleYear: currentYear, status: 'PENDING' },
    }),
    prisma.selfAppraisal.count({
      where: { cycleYear: currentYear, status: 'IN_PROGRESS' },
    }),
    prisma.selfAppraisal.count({
      where: { cycleYear: currentYear, status: 'SUBMITTED' },
    }),
    prisma.selfAppraisal.count({
      where: { cycleYear: currentYear, status: 'COMPLETED' },
    }),
    prisma.selfAppraisal.count({
      where: { cycleYear: currentYear },
    }),
  ])

  // Get users due for appraisal in next 30 days
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const upcomingCount = await prisma.user.count({
    where: {
      status: 'ACTIVE',
      appraisalDate: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
  })

  return {
    pending,
    inProgress,
    submitted,
    completed,
    total,
    upcoming: upcomingCount,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
