import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { calculateGrowth } from '@/shared/constants/kpiDefinitions'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const kpiEntrySchema = z.object({
      clientId: z.string().min(1),
      propertyId: z.string().optional(),
      organicTraffic: z.number().nullable().optional(),
      prevOrganicTraffic: z.number().nullable().optional(),
      leads: z.number().nullable().optional(),
      prevLeads: z.number().nullable().optional(),
      gbpCalls: z.number().nullable().optional(),
      prevGbpCalls: z.number().nullable().optional(),
      gbpDirections: z.number().nullable().optional(),
      prevGbpDirections: z.number().nullable().optional(),
      keywordsTop3: z.number().nullable().optional(),
      prevKeywordsTop3: z.number().nullable().optional(),
      keywordsTop10: z.number().nullable().optional(),
      prevKeywordsTop10: z.number().nullable().optional(),
      keywordsTop20: z.number().nullable().optional(),
      prevKeywordsTop20: z.number().nullable().optional(),
      backlinksBuilt: z.number().nullable().optional(),
      prevBacklinksBuilt: z.number().nullable().optional(),
      adSpend: z.number().nullable().optional(),
      prevAdSpend: z.number().nullable().optional(),
      impressions: z.number().nullable().optional(),
      prevImpressions: z.number().nullable().optional(),
      clicks: z.number().nullable().optional(),
      prevClicks: z.number().nullable().optional(),
      conversions: z.number().nullable().optional(),
      prevConversions: z.number().nullable().optional(),
      costPerConversion: z.number().nullable().optional(),
      prevCostPerConversion: z.number().nullable().optional(),
      roas: z.number().nullable().optional(),
      prevRoas: z.number().nullable().optional(),
      followers: z.number().nullable().optional(),
      prevFollowers: z.number().nullable().optional(),
      engagement: z.number().nullable().optional(),
      prevEngagement: z.number().nullable().optional(),
      postsPublished: z.number().nullable().optional(),
      prevPostsPublished: z.number().nullable().optional(),
      reachTotal: z.number().nullable().optional(),
      prevReachTotal: z.number().nullable().optional(),
      videoViews: z.number().nullable().optional(),
      prevVideoViews: z.number().nullable().optional(),
      pageSpeed: z.number().nullable().optional(),
      prevPageSpeed: z.number().nullable().optional(),
      bounceRate: z.number().nullable().optional(),
      prevBounceRate: z.number().nullable().optional(),
      avgSessionDuration: z.number().nullable().optional(),
      prevAvgSessionDuration: z.number().nullable().optional(),
      pagesBuilt: z.number().nullable().optional(),
      prevPagesBuilt: z.number().nullable().optional(),
      bugsFixed: z.number().nullable().optional(),
      prevBugsFixed: z.number().nullable().optional(),
      customMetrics: z.string().nullable().optional(),
      achievements: z.string().nullable().optional(),
      challenges: z.string().nullable().optional(),
      nextMonthPlan: z.string().nullable().optional(),
    }).passthrough()

    const schema = z.object({
      userId: z.string().min(1),
      department: z.string().min(1).max(100),
      kpiEntries: z.array(kpiEntrySchema).min(1),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { userId, department, kpiEntries } = result.data

    // Security: Only allow submitting for self unless SUPER_ADMIN/MANAGER
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (userId !== user.id && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get current month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get or create tactical meeting
    let meeting = await prisma.tacticalMeeting.findFirst({
      where: {
        userId,
        month: monthStart,
      },
    })

    if (!meeting) {
      meeting = await prisma.tacticalMeeting.create({
        data: {
          userId,
          month: monthStart,
          reportingMonth: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          status: 'DRAFT',
        },
      })
    }

    // Get previous month's KPIs for growth calculation
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMeeting = await prisma.tacticalMeeting.findFirst({
      where: {
        userId,
        month: prevMonthStart,
      },
      include: {
        kpiEntries: true,
      },
    })

    const prevKpis = prevMeeting?.kpiEntries.reduce((acc, entry) => {
      acc[entry.clientId] = entry
      return acc
    }, {} as Record<string, typeof prevMeeting.kpiEntries[0]>) || {}

    // Process and upsert each KPI entry
    const results: unknown[] = []
    let totalGrowth = 0
    let growthCount = 0

    for (const entry of kpiEntries) {
      const { clientId, ...kpiValues } = entry
      const prevEntry = prevKpis[clientId]

      // Calculate growth for performance score (not stored, computed by growthScore service)
      const calcAndTrack = (current: number | null | undefined, prev: number | null | undefined) => {
        if (current !== null && current !== undefined && prev !== null && prev !== undefined && prev !== 0) {
          const growth = calculateGrowth(current, prev)
          if (growth !== null) {
            totalGrowth += growth
            growthCount++
          }
        }
      }
      calcAndTrack(kpiValues.organicTraffic, prevEntry?.organicTraffic)
      calcAndTrack(kpiValues.conversions, prevEntry?.conversions)
      calcAndTrack(kpiValues.roas, prevEntry?.roas)
      calcAndTrack(kpiValues.followers, prevEntry?.followers)

      // Upsert KPI entry
      const existingEntry = await prisma.tacticalKPIEntry.findFirst({
        where: {
          meetingId: meeting.id,
          clientId,
        },
      })

      const entryData = {
        ...kpiValues,
        department,
        prevOrganicTraffic: prevEntry?.organicTraffic ?? null,
        prevLeads: prevEntry?.leads ?? null,
        prevFollowers: prevEntry?.followers ?? null,
        prevReachTotal: prevEntry?.reachTotal ?? null,
        prevEngagement: prevEntry?.engagement ?? null,
        prevConversions: prevEntry?.conversions ?? null,
        prevRoas: prevEntry?.roas ?? null,
      }

      if (existingEntry) {
        const result = await prisma.tacticalKPIEntry.update({
          where: { id: existingEntry.id },
          data: entryData,
        })
        results.push(result)
      } else {
        const result = await prisma.tacticalKPIEntry.create({
          data: {
            meetingId: meeting.id,
            clientId,
            ...entryData,
          },
        })
        results.push(result)
      }
    }

    // Calculate and update performance score
    const avgGrowth = growthCount > 0 ? totalGrowth / growthCount : 0
    const performanceScore = Math.min(100, Math.max(0, 50 + avgGrowth))

    await prisma.tacticalMeeting.update({
      where: { id: meeting.id },
      data: {
        performanceScore,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      meeting: meeting.id,
      entriesUpdated: results.length,
      performanceScore,
    })
  } catch (error) {
    console.error('Failed to save KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to save KPIs' },
      { status: 500 }
    )
  }
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || user.id
    const month = searchParams.get('month')

    const monthDate = month ? new Date(month) : new Date()
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)

    const meeting = await prisma.tacticalMeeting.findFirst({
      where: {
        userId,
        month: monthStart,
      },
      include: {
        kpiEntries: {
          include: {
            client: {
              select: { id: true, name: true, brandName: true },
            },
          },
        },
      },
    })

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Failed to fetch KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    )
  }
})
