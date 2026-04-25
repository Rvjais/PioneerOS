import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { calculateOverallScore } from '@/shared/constants/kpiDefinitions'
import { ADMIN_ROLES } from '@/shared/constants/roles'
import { withAuth } from '@/server/auth/withAuth'

// GET - Fetch scorecard
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || user.id
    const month = searchParams.get('month')

    // Only managers/admins can view other users' scorecards
    if (userId !== user.id && !ADMIN_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetMonth = month ? new Date(month) : new Date()
    targetMonth.setDate(1)
    targetMonth.setHours(0, 0, 0, 0)

    const scorecard = await prisma.employeeScorecard.findUnique({
      where: {
        userId_month: {
          userId,
          month: targetMonth,
        },
      },
    })

    return NextResponse.json({ scorecard })
  } catch (error) {
    console.error('Failed to fetch scorecard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Calculate and update scorecard
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const { userId, month: monthStr } = body

    const targetUserId = userId || user.id
    const targetMonth = monthStr ? new Date(monthStr) : new Date()
    targetMonth.setDate(1)
    targetMonth.setHours(0, 0, 0, 0)

    // Only managers can calculate scores for others
    if (targetUserId !== user.id && !['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user info
    const dbUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, department: true, joiningDate: true, appraisalDate: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate Performance Score (from tactical meetings)
    const tacticalMeeting = await prisma.tacticalMeeting.findUnique({
      where: {
        userId_month: {
          userId: targetUserId,
          month: targetMonth,
        },
      },
      include: { kpiEntries: true },
    })

    let performanceScore = 0
    if (tacticalMeeting?.kpiEntries) {
      const growths = tacticalMeeting.kpiEntries
        .map(e => e.trafficGrowth)
        .filter(v => v !== null) as number[]
      if (growths.length > 0) {
        // Normalize growth to 0-100 scale (assuming -50% to +100% range)
        const avgGrowth = growths.reduce((a, b) => a + b, 0) / growths.length
        performanceScore = Math.max(0, Math.min(100, (avgGrowth + 50) * (100 / 150)))
      }
    }

    // Calculate Accountability Score (projects managed vs expected)
    const clientAssignments = await prisma.clientTeamMember.count({
      where: { userId: targetUserId },
    })

    // Get expected based on role/department (simplified - could be from config)
    const expectedProjects = 5 // Default expectation
    const accountabilityScore = Math.min(100, (clientAssignments / expectedProjects) * 100)

    // Calculate Client Satisfaction Score
    const clientFeedbacks = await prisma.clientFeedback.findMany({
      where: {
        month: targetMonth,
        client: {
          teamMembers: {
            some: { userId: targetUserId },
          },
        },
      },
    })

    // Default to neutral score (50) when no feedback data exists, rather than
    // an optimistic 70 which would inflate scores for employees with no data
    let clientSatisfactionScore = 50
    if (clientFeedbacks.length > 0) {
      const avgNps = clientFeedbacks.reduce((sum, f) => sum + (f.overallSatisfaction || 7), 0) / clientFeedbacks.length
      const escalations = clientFeedbacks.filter(f => f.hadEscalation).length
      const churned = clientFeedbacks.filter(f => f.churnedThisMonth).length

      // NPS contributes 70%, escalations -10% each, churn -20% each
      clientSatisfactionScore = (avgNps / 10) * 100 * 0.7 - (escalations * 10) - (churned * 20)
      clientSatisfactionScore = Math.max(0, Math.min(100, clientSatisfactionScore))
    }

    // Calculate Learning Hours
    const learningLogs = await prisma.learningLog.findMany({
      where: {
        userId: targetUserId,
        month: targetMonth,
      },
    })

    const learningMinutes = learningLogs.reduce((sum, log) => sum + log.minutesWatched, 0)
    const learningHoursCompleted = learningMinutes / 60
    const learningCompliant = learningHoursCompleted >= 6

    // Calculate appraisal delay
    let appraisalDelayMonths = 0
    if (!learningCompliant) {
      // Count consecutive months of non-compliance
      const prevMonths: Date[] = []
      for (let i = 1; i <= 12; i++) {
        const m = new Date(targetMonth)
        m.setMonth(m.getMonth() - i)
        prevMonths.push(m)
      }

      // Fetch all previous months' learning logs in a single query
      const allLogs = await prisma.learningLog.findMany({
        where: { userId: targetUserId, month: { in: prevMonths } },
        select: { month: true, minutesWatched: true },
      })

      // Group by month
      const logsByMonth = new Map<string, number>()
      for (const log of allLogs) {
        const key = log.month.toISOString()
        logsByMonth.set(key, (logsByMonth.get(key) || 0) + log.minutesWatched)
      }

      // Check consecutive non-compliance (prevMonths are already ordered from most recent)
      for (const pm of prevMonths) {
        const minutes = logsByMonth.get(pm.toISOString()) || 0
        const hours = minutes / 60
        if (hours < 6) {
          appraisalDelayMonths++
        } else {
          break
        }
      }
    }

    // Calculate overall score
    const overallScore = calculateOverallScore(
      performanceScore,
      accountabilityScore,
      clientSatisfactionScore
    )

    // Calculate department rank (filtered to same department)
    const departmentScores = await prisma.employeeScorecard.findMany({
      where: {
        month: targetMonth,
        userId: {
          not: targetUserId,
        },
        user: {
          department: dbUser.department,
        },
      },
      select: { userId: true, overallScore: true },
    })

    const allScores = [...departmentScores.map(s => s.overallScore), overallScore].sort((a, b) => b - a)
    const departmentRank = allScores.indexOf(overallScore) + 1

    // Upsert scorecard
    const scorecard = await prisma.employeeScorecard.upsert({
      where: {
        userId_month: {
          userId: targetUserId,
          month: targetMonth,
        },
      },
      create: {
        userId: targetUserId,
        month: targetMonth,
        performanceScore,
        accountabilityScore,
        projectsManaged: clientAssignments,
        projectsExpected: expectedProjects,
        clientSatisfactionScore,
        learningHoursCompleted,
        learningCompliant,
        appraisalDelayMonths,
        overallScore,
        departmentRank,
        isAppraisalEligible: learningCompliant && appraisalDelayMonths === 0,
      },
      update: {
        performanceScore,
        accountabilityScore,
        projectsManaged: clientAssignments,
        projectsExpected: expectedProjects,
        clientSatisfactionScore,
        learningHoursCompleted,
        learningCompliant,
        appraisalDelayMonths,
        overallScore,
        departmentRank,
        isAppraisalEligible: learningCompliant && appraisalDelayMonths === 0,
      },
    })

    // Update user's appraisal date if delayed (calculate from joining date to avoid compounding)
    if (appraisalDelayMonths > 0 && dbUser.joiningDate && dbUser.appraisalDate) {
      // Calculate the standard appraisal date based on joining date anniversary
      const joiningDate = new Date(dbUser.joiningDate)
      const standardAppraisalDate = new Date(joiningDate)
      // Move to the next anniversary year relative to current date
      while (standardAppraisalDate < new Date()) {
        standardAppraisalDate.setFullYear(standardAppraisalDate.getFullYear() + 1)
      }
      const newAppraisalDate = new Date(standardAppraisalDate)
      newAppraisalDate.setMonth(newAppraisalDate.getMonth() + appraisalDelayMonths)
      await prisma.user.update({
        where: { id: targetUserId },
        data: { appraisalDate: newAppraisalDate },
      })
    }

    return NextResponse.json({ scorecard })
  } catch (error) {
    console.error('Failed to calculate scorecard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
