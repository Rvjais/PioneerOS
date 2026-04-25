import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { acquireLock, releaseLock } from '@/server/db/distributedLock'

export const maxDuration = 300

const CRON_SECRET = process.env.CRON_SECRET

// SLA thresholds per severity (in hours)
const ESCALATION_SLA_HOURS: Record<string, number> = {
  CRITICAL: 24,
  HIGH: 48,
  MEDIUM: 72,
  LOW: 120,
}

/**
 * HR Notification Cron Job
 * Triggers: Daily at 9:00 AM IST
 *
 * Sends:
 * 1. Appraisal due alerts
 * 2. Escalation SLA breach alerts
 * 3. Leave approval reminders
 * 4. PIP milestone reminders
 * 5. Work anniversary alerts
 * 6. Probation end alerts
 * 7. Learning hours deficit alerts
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret - REQUIRED for security
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
    }
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Acquire distributed lock to prevent duplicate runs
    const lock = await acquireLock('hr-notifications-daily', 300)
    if (!lock.acquired) {
      return NextResponse.json({ message: 'Already running', skipped: true })
    }

    const results = {
      appraisalAlerts: 0,
      escalationSlaBreaches: 0,
      leaveApprovalReminders: 0,
      pipMilestoneReminders: 0,
      workAnniversaryAlerts: 0,
      probationEndAlerts: 0,
      learningHoursDeficits: 0,
      errors: [] as string[],
    }

    // Use IST (UTC+5:30) for date calculations
    const nowUtc = new Date()
    const istOffsetMs = 5.5 * 60 * 60 * 1000
    const istNow = new Date(nowUtc.getTime() + istOffsetMs)
    const today = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate())

    // Fetch HR users once (used by multiple checks)
    const hrUsers = await prisma.user.findMany({
      where: { department: 'HR', status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    })
    const hrUserIds = hrUsers.map((u) => u.id)

    try {
      // =============================================
      // 1. APPRAISAL DUE ALERTS
      // =============================================
      const elevenMonthsAgo = new Date(today)
      elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11)
      const elevenMonthsAgoStart = new Date(elevenMonthsAgo.getFullYear(), elevenMonthsAgo.getMonth(), 1)
      const elevenMonthsAgoEnd = new Date(elevenMonthsAgo.getFullYear(), elevenMonthsAgo.getMonth() + 1, 0)

      // Users who joined 11 months ago (appraisal coming in 1 month)
      const appraisalDueSoon = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          joiningDate: {
            gte: elevenMonthsAgoStart,
            lte: elevenMonthsAgoEnd,
          },
        },
        select: { id: true, firstName: true, lastName: true },
      })

      // Users who joined 12+ months ago with no active appraisal this cycle
      const twelveMonthsAgo = new Date(today)
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
      const currentYear = istNow.getFullYear()

      const overdueAppraisalUsers = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          joiningDate: { lte: twelveMonthsAgo },
          selfAppraisals: {
            none: {
              cycleYear: currentYear,
              status: { in: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'MANAGER_REVIEW'] },
            },
          },
        },
        select: { id: true, firstName: true, lastName: true },
      })

      const appraisalNotifications = [
        ...appraisalDueSoon.map((user) => ({
          userId: user.id,
          type: 'HR_ALERT',
          title: 'Annual Appraisal Due Soon',
          message: 'Your annual appraisal is due. Ensure you have 72+ learning hours.',
          link: '/hr/appraisal',
          priority: 'HIGH',
        })),
        ...overdueAppraisalUsers.map((user) => ({
          userId: user.id,
          type: 'HR_ALERT',
          title: 'Annual Appraisal Overdue',
          message: 'Your annual appraisal is due. Ensure you have 72+ learning hours.',
          link: '/hr/appraisal',
          priority: 'URGENT',
        })),
      ]

      if (appraisalNotifications.length > 0) {
        await prisma.notification.createMany({ data: appraisalNotifications })
        results.appraisalAlerts = appraisalNotifications.length
      }
    } catch (error) {
      results.errors.push(`Appraisal alerts failed: ${error}`)
    }

    try {
      // =============================================
      // 2. ESCALATION SLA BREACH ALERTS
      // =============================================
      const openEscalations = await prisma.employeeEscalation.findMany({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true } },
        },
      })

      const slaBreachedNotifications: {
        userId: string
        type: string
        title: string
        message: string
        link: string
        priority: string
      }[] = []

      for (const escalation of openEscalations) {
        const slaHours = ESCALATION_SLA_HOURS[escalation.severity] ?? 72
        const ageMs = nowUtc.getTime() - new Date(escalation.createdAt).getTime()
        const ageHours = ageMs / (1000 * 60 * 60)

        if (ageHours > slaHours) {
          const employeeName = `${escalation.employee.firstName} ${escalation.employee.lastName || ''}`.trim()

          // Notify the reporter (who is typically the manager handling it)
          slaBreachedNotifications.push({
            userId: escalation.reportedBy,
            type: 'HR_ALERT',
            title: 'Escalation SLA Breached',
            message: `Escalation SLA breached: ${employeeName} - ${escalation.type}`,
            link: '/hr/escalations',
            priority: escalation.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
          })

          // Also notify HR users
          for (const hrId of hrUserIds) {
            if (hrId !== escalation.reportedBy) {
              slaBreachedNotifications.push({
                userId: hrId,
                type: 'HR_ALERT',
                title: 'Escalation SLA Breached',
                message: `Escalation SLA breached: ${employeeName} - ${escalation.type}`,
                link: '/hr/escalations',
                priority: escalation.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
              })
            }
          }
        }
      }

      if (slaBreachedNotifications.length > 0) {
        await prisma.notification.createMany({ data: slaBreachedNotifications })
        results.escalationSlaBreaches = slaBreachedNotifications.length
      }
    } catch (error) {
      results.errors.push(`Escalation SLA alerts failed: ${error}`)
    }

    try {
      // =============================================
      // 3. LEAVE APPROVAL REMINDERS
      // =============================================
      const twentyFourHoursAgo = new Date(nowUtc.getTime() - 24 * 60 * 60 * 1000)

      const pendingLeaves = await prisma.leaveRequest.findMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: twentyFourHoursAgo },
        },
        select: { id: true },
      })

      if (pendingLeaves.length > 0 && hrUserIds.length > 0) {
        const leaveNotifications = hrUserIds.map((userId) => ({
          userId,
          type: 'HR_ALERT',
          title: 'Leave Requests Pending Approval',
          message: `${pendingLeaves.length} leave request${pendingLeaves.length > 1 ? 's' : ''} pending approval for more than 24 hours`,
          link: '/hr/leave',
          priority: 'HIGH',
        }))

        await prisma.notification.createMany({ data: leaveNotifications })
        results.leaveApprovalReminders = leaveNotifications.length
      }
    } catch (error) {
      results.errors.push(`Leave approval reminders failed: ${error}`)
    }

    try {
      // =============================================
      // 4. PIP MILESTONE REMINDERS
      // =============================================
      const threeDaysFromNow = new Date(today)
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

      const upcomingMilestones = await prisma.pIPMilestone.findMany({
        where: {
          status: 'PENDING',
          targetDate: {
            gte: today,
            lte: threeDaysFromNow,
          },
          pipPlan: {
            status: 'ACTIVE',
          },
        },
        include: {
          pipPlan: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              manager: { select: { id: true } },
            },
          },
        },
      })

      const pipNotifications = upcomingMilestones.map((milestone) => {
        const employeeName = `${milestone.pipPlan.user.firstName} ${milestone.pipPlan.user.lastName || ''}`.trim()
        const dueDate = milestone.targetDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        return {
          userId: milestone.pipPlan.manager.id,
          type: 'HR_ALERT',
          title: 'PIP Milestone Review Due',
          message: `PIP milestone review due for ${employeeName} on ${dueDate}`,
          link: '/hr/pip',
          priority: 'HIGH',
        }
      })

      if (pipNotifications.length > 0) {
        await prisma.notification.createMany({ data: pipNotifications })
        results.pipMilestoneReminders = pipNotifications.length
      }
    } catch (error) {
      results.errors.push(`PIP milestone reminders failed: ${error}`)
    }

    try {
      // =============================================
      // 5. WORK ANNIVERSARY ALERTS
      // =============================================
      const activeUsers = await prisma.user.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        select: { id: true, firstName: true, lastName: true, joiningDate: true },
      })

      const anniversaryNotifications: {
        userId: string
        type: string
        title: string
        message: string
        link: string
        priority: string
      }[] = []

      for (const user of activeUsers) {
        const joiningDate = new Date(user.joiningDate)
        // Check if anniversary falls within the next 7 days
        for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
          const checkDate = new Date(today)
          checkDate.setDate(checkDate.getDate() + dayOffset)

          if (
            joiningDate.getMonth() === checkDate.getMonth() &&
            joiningDate.getDate() === checkDate.getDate() &&
            joiningDate.getFullYear() < checkDate.getFullYear()
          ) {
            const years = checkDate.getFullYear() - joiningDate.getFullYear()
            const employeeName = `${user.firstName} ${user.lastName || ''}`.trim()
            const anniversaryDate = checkDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })

            for (const hrId of hrUserIds) {
              anniversaryNotifications.push({
                userId: hrId,
                type: 'HR_ALERT',
                title: 'Work Anniversary',
                message: `${employeeName} completes ${years} year${years > 1 ? 's' : ''} on ${anniversaryDate}`,
                link: '/hr/team',
                priority: 'NORMAL',
              })
            }
            break // Only one match per user
          }
        }
      }

      if (anniversaryNotifications.length > 0) {
        await prisma.notification.createMany({ data: anniversaryNotifications })
        results.workAnniversaryAlerts = anniversaryNotifications.length
      }
    } catch (error) {
      results.errors.push(`Work anniversary alerts failed: ${error}`)
    }

    try {
      // =============================================
      // 6. PROBATION END ALERTS
      // =============================================
      // Find users whose joining date was ~6 months ago (probation ending soon)
      const sixMonthsFromNow = new Date(today)
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() - 6)
      // Window: users who joined between 5 months 3 weeks ago and 6 months ago
      const probationWindowStart = new Date(sixMonthsFromNow)
      probationWindowStart.setDate(probationWindowStart.getDate() - 7)
      const probationWindowEnd = new Date(sixMonthsFromNow)

      const probationEndUsers = await prisma.user.findMany({
        where: {
          status: { in: ['ACTIVE', 'PROBATION'] },
          deletedAt: null,
          joiningDate: {
            gte: probationWindowStart,
            lte: probationWindowEnd,
          },
        },
        select: { id: true, firstName: true, lastName: true, joiningDate: true },
      })

      const probationNotifications: {
        userId: string
        type: string
        title: string
        message: string
        link: string
        priority: string
      }[] = []

      for (const user of probationEndUsers) {
        const probationEndDate = new Date(user.joiningDate)
        probationEndDate.setMonth(probationEndDate.getMonth() + 6)
        const employeeName = `${user.firstName} ${user.lastName || ''}`.trim()
        const endDateStr = probationEndDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

        // Notify HR users
        for (const hrId of hrUserIds) {
          probationNotifications.push({
            userId: hrId,
            type: 'HR_ALERT',
            title: 'Probation Period Ending',
            message: `${employeeName} probation period ends on ${endDateStr}. Review required.`,
            link: '/hr/team',
            priority: 'HIGH',
          })
        }
      }

      if (probationNotifications.length > 0) {
        await prisma.notification.createMany({ data: probationNotifications })
        results.probationEndAlerts = probationNotifications.length
      }
    } catch (error) {
      results.errors.push(`Probation end alerts failed: ${error}`)
    }

    try {
      // =============================================
      // 7. LEARNING HOURS DEFICIT (25th+ of month)
      // =============================================
      const dayOfMonth = istNow.getDate()

      if (dayOfMonth >= 25) {
        const monthStart = new Date(istNow.getFullYear(), istNow.getMonth(), 1)
        const targetMinutes = 6 * 60 // 6 hours = 360 minutes

        // Get all active users' learning logs for current month
        const usersWithLearning = await prisma.user.findMany({
          where: { status: 'ACTIVE', deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            learningLogs: {
              where: {
                month: { gte: monthStart },
              },
              select: { minutesWatched: true },
            },
          },
        })

        const learningDeficitNotifications: {
          userId: string
          type: string
          title: string
          message: string
          link: string
          priority: string
        }[] = []

        for (const user of usersWithLearning) {
          const totalMinutes = user.learningLogs.reduce((sum, log) => sum + log.minutesWatched, 0)

          if (totalMinutes < targetMinutes) {
            const hours = Math.round((totalMinutes / 60) * 10) / 10
            learningDeficitNotifications.push({
              userId: user.id,
              type: 'HR_ALERT',
              title: 'Learning Hours Deficit',
              message: `You have ${hours} learning hours this month. Target is 6 hours.`,
              link: '/learning',
              priority: 'NORMAL',
            })
          }
        }

        if (learningDeficitNotifications.length > 0) {
          await prisma.notification.createMany({ data: learningDeficitNotifications })
          results.learningHoursDeficits = learningDeficitNotifications.length
        }
      }
    } catch (error) {
      results.errors.push(`Learning hours deficit alerts failed: ${error}`)
    }

    // Release the lock
    if (lock.lockId) {
      await releaseLock(lock.lockId)
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: nowUtc.toISOString(),
    })
  } catch (error) {
    console.error('[HR Notifications Cron] Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
