import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { calculateGrowth } from '@/shared/constants/kpiDefinitions'
import { withAuth } from '@/server/auth/withAuth'

// GET - Fetch tactical meetings
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const requestedUserId = searchParams.get('userId')
    const teamView = searchParams.get('teamView') === 'true'

    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')

    // SECURITY FIX: Users can only view their own meetings unless they're a manager
    let userId = user.id
    if (requestedUserId && requestedUserId !== user.id) {
      if (!isManager) {
        return NextResponse.json({ error: 'Forbidden - Cannot view other users meetings' }, { status: 403 })
      }
      userId = requestedUserId
    }

    // Build date filter
    let dateFilter = {}
    if (month && year) {
      const targetDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      dateFilter = { month: targetDate }
    }

    // Build where clause
    const whereClause: Record<string, unknown> = { ...dateFilter }

    if (teamView && isManager) {
      // Get all team members in same department
      whereClause.user = { department: user.department }
    } else {
      whereClause.userId = userId
    }

    const meetings = await prisma.tacticalMeeting.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            empId: true,
          },
        },
        kpiEntries: {
          include: {
            client: { select: { id: true, name: true } },
            property: { select: { id: true, name: true, type: true } },
          },
        },
      },
      orderBy: { month: 'desc' },
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error('Failed to fetch tactical meetings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Create or update tactical meeting
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const { month, reportingMonth, kpiEntries, submit } = body

    const userId = user.id
    const monthDate = new Date(month)
    monthDate.setHours(0, 0, 0, 0)
    const reportingMonthDate = new Date(reportingMonth)
    reportingMonthDate.setHours(0, 0, 0, 0)

    // Check if meeting already exists
    const existingMeeting = await prisma.tacticalMeeting.findUnique({
      where: {
        userId_month: {
          userId,
          month: monthDate,
        },
      },
    })

    // Check if before deadline (3rd of the month AFTER the target month)
    const now = new Date()
    const targetMonth = monthDate.getMonth()
    const targetYear = monthDate.getFullYear()
    // Deadline is the 3rd of the month following the target month
    const deadlineMonth = targetMonth === 11 ? 0 : targetMonth + 1
    const deadlineYear = targetMonth === 11 ? targetYear + 1 : targetYear
    const deadline = new Date(deadlineYear, deadlineMonth, 3, 23, 59, 59, 999)
    const isBeforeDeadline = now <= deadline

    if (existingMeeting && existingMeeting.status === 'SUBMITTED') {
      return NextResponse.json({ error: 'Meeting already submitted' }, { status: 400 })
    }

    // Calculate growth percentages for each entry
    const processedEntries = kpiEntries.map((entry: Record<string, unknown>) => {
      const trafficGrowth = calculateGrowth(
        entry.organicTraffic as number | null,
        entry.prevOrganicTraffic as number | null
      )
      const leadsGrowth = calculateGrowth(
        entry.leads as number | null,
        entry.prevLeads as number | null
      )
      const callsGrowth = calculateGrowth(
        entry.gbpCalls as number | null,
        entry.prevGbpCalls as number | null
      )
      const keywordsGrowth = calculateGrowth(
        entry.keywordsTop3 as number | null,
        entry.prevKeywordsTop3 as number | null
      )

      return {
        ...entry,
        trafficGrowth,
        leadsGrowth,
        callsGrowth,
        keywordsGrowth,
      }
    })

    // Calculate average performance score
    const growthValues = processedEntries
      .map((e: Record<string, number | null>) => e.trafficGrowth)
      .filter((v: number | null) => v !== null)
    const avgPerformance = growthValues.length > 0
      ? growthValues.reduce((a: number, b: number | null) => a + (b || 0), 0) / growthValues.length
      : null

    // Upsert the meeting
    const meeting = await prisma.tacticalMeeting.upsert({
      where: {
        userId_month: {
          userId,
          month: monthDate,
        },
      },
      create: {
        userId,
        month: monthDate,
        reportingMonth: reportingMonthDate,
        status: submit ? 'SUBMITTED' : 'DRAFT',
        submittedAt: submit ? now : null,
        submittedOnTime: submit ? isBeforeDeadline : false,
        performanceScore: avgPerformance,
      },
      update: {
        reportingMonth: reportingMonthDate,
        status: submit ? 'SUBMITTED' : 'DRAFT',
        submittedAt: submit ? now : null,
        submittedOnTime: submit ? isBeforeDeadline : false,
        performanceScore: avgPerformance,
      },
    })

    // Delete existing KPI entries and create new ones atomically
    await prisma.$transaction(async (tx) => {
      await tx.tacticalKPIEntry.deleteMany({
        where: { meetingId: meeting.id },
      })

      // Create KPI entries
      for (const entry of processedEntries) {
        await tx.tacticalKPIEntry.create({
          data: {
            meetingId: meeting.id,
            clientId: entry.clientId,
            propertyId: entry.propertyId || null,
            department: user.department,
            // SEO KPIs
            organicTraffic: entry.organicTraffic,
            prevOrganicTraffic: entry.prevOrganicTraffic,
            leads: entry.leads,
            prevLeads: entry.prevLeads,
            gbpCalls: entry.gbpCalls,
            prevGbpCalls: entry.prevGbpCalls,
            gbpDirections: entry.gbpDirections,
            prevGbpDirections: entry.prevGbpDirections,
            keywordsTop3: entry.keywordsTop3,
            prevKeywordsTop3: entry.prevKeywordsTop3,
            keywordsTop10: entry.keywordsTop10,
            prevKeywordsTop10: entry.prevKeywordsTop10,
            keywordsTop20: entry.keywordsTop20,
            prevKeywordsTop20: entry.prevKeywordsTop20,
            backlinksBuilt: entry.backlinksBuilt,
            prevBacklinksBuilt: entry.prevBacklinksBuilt,
            // ADS KPIs
            adSpend: entry.adSpend,
            prevAdSpend: entry.prevAdSpend,
            impressions: entry.impressions,
            prevImpressions: entry.prevImpressions,
            clicks: entry.clicks,
            prevClicks: entry.prevClicks,
            conversions: entry.conversions,
            prevConversions: entry.prevConversions,
            costPerConversion: entry.costPerConversion,
            prevCostPerConversion: entry.prevCostPerConversion,
            roas: entry.roas,
            prevRoas: entry.prevRoas,
            // SOCIAL KPIs
            followers: entry.followers,
            prevFollowers: entry.prevFollowers,
            engagement: entry.engagement,
            prevEngagement: entry.prevEngagement,
            postsPublished: entry.postsPublished,
            prevPostsPublished: entry.prevPostsPublished,
            reachTotal: entry.reachTotal,
            prevReachTotal: entry.prevReachTotal,
            videoViews: entry.videoViews,
            prevVideoViews: entry.prevVideoViews,
            // WEB KPIs
            pageSpeed: entry.pageSpeed,
            prevPageSpeed: entry.prevPageSpeed,
            bounceRate: entry.bounceRate,
            prevBounceRate: entry.prevBounceRate,
            avgSessionDuration: entry.avgSessionDuration,
            prevAvgSessionDuration: entry.prevAvgSessionDuration,
            pagesBuilt: entry.pagesBuilt,
            prevPagesBuilt: entry.prevPagesBuilt,
            // Custom metrics
            customMetrics: entry.customMetrics ? JSON.stringify(entry.customMetrics) : null,
            // Calculated growth
            trafficGrowth: entry.trafficGrowth,
            leadsGrowth: entry.leadsGrowth,
            callsGrowth: entry.callsGrowth,
            keywordsGrowth: entry.keywordsGrowth,
            // Notes
            achievements: entry.achievements,
            challenges: entry.challenges,
            nextMonthPlan: entry.nextMonthPlan,
          },
        })
      }
    })

    // Fetch updated meeting with entries
    const updatedMeeting = await prisma.tacticalMeeting.findUnique({
      where: { id: meeting.id },
      include: {
        kpiEntries: {
          include: {
            client: { select: { id: true, name: true } },
            property: { select: { id: true, name: true, type: true } },
          },
        },
      },
    })

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error('Failed to save tactical meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
