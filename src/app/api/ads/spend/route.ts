import { NextRequest, NextResponse } from 'next/server'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Helper: get client IDs the user is assigned to
async function getAssignedClientIds(userId: string): Promise<string[]> {
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true },
  })
  return assignments.map((a) => a.clientId)
}

const createSpendSchema = z.object({
  campaignId: z.string().min(1),
  clientId: z.string().min(1),
  date: z.string().datetime(),
  platform: z.enum(['GOOGLE', 'META', 'LINKEDIN', 'YOUTUBE']),
  amount: z.number().min(0),
  currency: z.string().default('INR'),
  impressions: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  conversions: z.number().int().min(0).default(0),
  leads: z.number().int().min(0).default(0),
  cpc: z.number().nullable().optional(),
  cpl: z.number().nullable().optional(),
  ctr: z.number().nullable().optional(),
  roas: z.number().nullable().optional(),
})

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const campaignId = searchParams.get('campaignId')
    const platform = searchParams.get('platform')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const aggregation = searchParams.get('aggregation') // day, week, month
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '90', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (clientId) {
        if (!assignedClientIds.includes(clientId)) {
          return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
        }
        where.clientId = clientId
      } else {
        where.clientId = { in: assignedClientIds }
      }
    } else if (clientId) {
      where.clientId = clientId
    }

    if (campaignId) where.campaignId = campaignId
    if (platform) where.platform = platform

    // Validate date params before using them
    if (startDate && isNaN(new Date(startDate).getTime())) {
      return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 })
    }
    if (endDate && isNaN(new Date(endDate).getTime())) {
      return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 })
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
      where.date = dateFilter
    }

    // If aggregation is requested, use groupBy
    if (aggregation && where.clientId) {
      const spendRecords = await prisma.adSpend.findMany({
        where,
        orderBy: { date: 'asc' },
      })

      const aggregated = aggregateSpendData(spendRecords, aggregation)

      return NextResponse.json({ spend: aggregated, aggregation })
    }

    const [spendRecords, totalCount] = await Promise.all([
      prisma.adSpend.findMany({
        where,
        include: {
          campaign: { select: { id: true, name: true, platform: true } },
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip,
      }),
      prisma.adSpend.count({ where }),
    ])

    return NextResponse.json({
      spend: spendRecords,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch spend data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = createSpendSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({ where: { id: data.campaignId }, select: { id: true, clientId: true } })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (!assignedClientIds.includes(data.clientId)) {
        return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
      }
    }

    // Auto-calculate metrics if not provided
    const cpc = data.cpc ?? (data.clicks > 0 ? data.amount / data.clicks : null)
    const cpl = data.cpl ?? (data.leads > 0 ? data.amount / data.leads : null)
    const ctr = data.ctr ?? (data.impressions > 0 ? (data.clicks / data.impressions) * 100 : null)

    // Upsert to handle duplicate date entries
    const spendRecord = await prisma.adSpend.upsert({
      where: {
        campaignId_date: {
          campaignId: data.campaignId,
          date: new Date(data.date),
        },
      },
      update: {
        amount: data.amount,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        leads: data.leads,
        cpc,
        cpl,
        ctr,
        roas: data.roas,
      },
      create: {
        campaignId: data.campaignId,
        clientId: data.clientId,
        date: new Date(data.date),
        platform: data.platform,
        amount: data.amount,
        currency: data.currency,
        impressions: data.impressions,
        clicks: data.clicks,
        conversions: data.conversions,
        leads: data.leads,
        cpc,
        cpl,
        ctr,
        roas: data.roas,
      },
    })

    // Update campaign aggregated metrics
    const allSpend = await prisma.adSpend.aggregate({
      where: { campaignId: data.campaignId },
      _sum: { amount: true, impressions: true, clicks: true, conversions: true, leads: true },
    })

    const totalSpend = allSpend._sum.amount || 0
    const totalClicks = allSpend._sum.clicks || 0
    const totalImpressions = allSpend._sum.impressions || 0
    const totalConversions = allSpend._sum.conversions || 0
    const totalLeads = allSpend._sum.leads || 0

    await prisma.campaign.update({
      where: { id: data.campaignId },
      data: {
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        leads: totalLeads,
        cpc: totalClicks > 0 ? totalSpend / totalClicks : null,
        cpl: totalLeads > 0 ? totalSpend / totalLeads : null,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : null,
      },
    })

    return NextResponse.json({ spend: spendRecord }, { status: 201 })
  } catch (error) {
    console.error('Failed to record spend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

interface SpendRecord {
  date: Date
  amount: number
  impressions: number
  clicks: number
  conversions: number
  leads: number
}

function aggregateSpendData(records: SpendRecord[], aggregation: string) {
  const buckets: Record<string, { amount: number; impressions: number; clicks: number; conversions: number; leads: number; count: number }> = {}

  for (const record of records) {
    const date = new Date(record.date)
    let key: string

    if (aggregation === 'week') {
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      key = startOfWeek.toISOString().split('T')[0]
    } else if (aggregation === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    } else {
      // day
      key = date.toISOString().split('T')[0]
    }

    if (!buckets[key]) {
      buckets[key] = { amount: 0, impressions: 0, clicks: 0, conversions: 0, leads: 0, count: 0 }
    }

    buckets[key].amount += record.amount
    buckets[key].impressions += record.impressions
    buckets[key].clicks += record.clicks
    buckets[key].conversions += record.conversions
    buckets[key].leads += record.leads
    buckets[key].count += 1
  }

  return Object.entries(buckets).map(([period, data]) => ({
    period,
    ...data,
    cpc: data.clicks > 0 ? data.amount / data.clicks : null,
    cpl: data.leads > 0 ? data.amount / data.leads : null,
    ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : null,
  }))
}
