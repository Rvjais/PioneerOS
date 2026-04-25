import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { calculateGrowth } from '@/shared/constants/kpiDefinitions'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const schema = z.object({
      userId: z.string().min(1),
      department: z.string().min(1).max(100),
      kpiEntries: z.array(z.object({
        clientId: z.string().min(1),
        organicTraffic: z.number().optional(),
        leads: z.number().optional(),
        followers: z.number().optional(),
        reachTotal: z.number().optional(),
        engagement: z.number().optional(),
        conversions: z.number().optional(),
        roas: z.number().optional(),
      })).min(1),
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

      // Calculate growth values
      const prevEntry = prevKpis[clientId]
      const growthValues: Record<string, number | null> = {}

      // SEO growth
      if (kpiValues.organicTraffic && prevEntry?.organicTraffic) {
        growthValues.trafficGrowth = calculateGrowth(kpiValues.organicTraffic, prevEntry.organicTraffic)
        if (growthValues.trafficGrowth !== null) {
          totalGrowth += growthValues.trafficGrowth
          growthCount++
        }
      }

      // ADS growth
      if (kpiValues.conversions && prevEntry?.conversions) {
        growthValues.conversionGrowth = calculateGrowth(kpiValues.conversions, prevEntry.conversions)
        if (growthValues.conversionGrowth !== null) {
          totalGrowth += growthValues.conversionGrowth
          growthCount++
        }
      }
      if (kpiValues.roas && prevEntry?.roas) {
        growthValues.roasGrowth = calculateGrowth(kpiValues.roas, prevEntry.roas)
        if (growthValues.roasGrowth !== null) {
          totalGrowth += growthValues.roasGrowth
          growthCount++
        }
      }

      // Social growth
      if (kpiValues.followers && prevEntry?.followers) {
        growthValues.followerGrowth = calculateGrowth(kpiValues.followers, prevEntry.followers)
        if (growthValues.followerGrowth !== null) {
          totalGrowth += growthValues.followerGrowth
          growthCount++
        }
      }
      if (kpiValues.reachTotal && prevEntry?.reachTotal) {
        growthValues.reachGrowth = calculateGrowth(kpiValues.reachTotal, prevEntry.reachTotal)
        if (growthValues.reachGrowth !== null) {
          totalGrowth += growthValues.reachGrowth
          growthCount++
        }
      }

      // Upsert KPI entry
      const existingEntry = await prisma.tacticalKPIEntry.findFirst({
        where: {
          meetingId: meeting.id,
          clientId,
        },
      })

      const entryData = {
        ...kpiValues,
        ...growthValues,
        department,
        // Store previous values for reference
        prevOrganicTraffic: prevEntry?.organicTraffic || null,
        prevLeads: prevEntry?.leads || null,
        prevFollowers: prevEntry?.followers || null,
        prevReachTotal: prevEntry?.reachTotal || null,
        prevEngagement: prevEntry?.engagement || null,
        prevConversions: prevEntry?.conversions || null,
        prevRoas: prevEntry?.roas || null,
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
