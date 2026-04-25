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

const createConversionSchema = z.object({
  campaignId: z.string().optional(),
  clientId: z.string().min(1),
  eventName: z.enum(['FORM_SUBMIT', 'PHONE_CALL', 'PURCHASE', 'SIGNUP', 'DOWNLOAD']),
  platform: z.enum(['GOOGLE', 'META', 'LINKEDIN', 'DIRECT', 'ORGANIC']),
  source: z.string().optional(),
  leadName: z.string().optional(),
  leadEmail: z.string().email().optional(),
  leadPhone: z.string().optional(),
  adSpend: z.number().min(0).optional(),
  revenue: z.number().min(0).optional(),
  occurredAt: z.string().datetime().optional(),
})

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const campaignId = searchParams.get('campaignId')
    const platform = searchParams.get('platform')
    const eventName = searchParams.get('eventName')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
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
    if (eventName) where.eventName = eventName

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
      where.occurredAt = dateFilter
    }

    const [conversions, totalCount] = await Promise.all([
      prisma.conversionEvent.findMany({
        where,
        include: {
          campaign: { select: { id: true, name: true, platform: true } },
        },
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.conversionEvent.count({ where }),
    ])

    // Summary stats
    const summary = await prisma.conversionEvent.aggregate({
      where,
      _count: true,
      _sum: { adSpend: true, revenue: true },
    })

    return NextResponse.json({
      conversions,
      summary: {
        totalConversions: summary._count,
        totalAdSpend: summary._sum.adSpend || 0,
        totalRevenue: summary._sum.revenue || 0,
        roas: (summary._sum.adSpend && summary._sum.adSpend > 0)
          ? (summary._sum.revenue || 0) / summary._sum.adSpend
          : null,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch conversions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = createConversionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (!assignedClientIds.includes(data.clientId)) {
        return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
      }
    }

    // Verify campaign exists if provided
    if (data.campaignId) {
      const campaign = await prisma.campaign.findUnique({ where: { id: data.campaignId }, select: { id: true } })
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
      }
    }

    const conversion = await prisma.conversionEvent.create({
      data: {
        campaignId: data.campaignId,
        clientId: data.clientId,
        eventName: data.eventName,
        platform: data.platform,
        source: data.source,
        leadName: data.leadName,
        leadEmail: data.leadEmail,
        leadPhone: data.leadPhone,
        adSpend: data.adSpend,
        revenue: data.revenue,
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
      },
      include: {
        campaign: { select: { id: true, name: true } },
      },
    })

    // Atomically increment campaign conversion count
    if (data.campaignId) {
      await prisma.campaign.update({
        where: { id: data.campaignId },
        data: { conversions: { increment: 1 } },
      })
    }

    return NextResponse.json({ conversion }, { status: 201 })
  } catch (error) {
    console.error('Failed to record conversion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
