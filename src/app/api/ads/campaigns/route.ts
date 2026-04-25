import { NextRequest, NextResponse } from 'next/server'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Helper: get client IDs the user is assigned to via ClientTeamMember
async function getAssignedClientIds(userId: string): Promise<string[]> {
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true },
  })
  return assignments.map((a) => a.clientId)
}

const createCampaignSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1).max(255),
  platform: z.enum(['GOOGLE', 'META', 'LINKEDIN', 'YOUTUBE']),
  campaignType: z.string().optional(),
  objective: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
  externalId: z.string().optional(),
  dailyBudget: z.number().positive().optional(),
  monthlyBudget: z.number().positive().optional(),
  totalBudget: z.number().positive().optional(),
  currency: z.string().default('INR'),
  targetAudience: z.string().optional(),
  keywords: z.string().optional(),
  placements: z.string().optional(),
  startDate: z.string().optional().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val) || !isNaN(Date.parse(val)),
    { message: 'Invalid start date format' }
  ),
  endDate: z.string().optional().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val) || !isNaN(Date.parse(val)),
    { message: 'Invalid end date format' }
  ),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true
  return new Date(data.endDate) > new Date(data.startDate)
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const assignedToId = searchParams.get('assignedToId')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Tenant isolation: non-admin users can only see campaigns for their assigned clients
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

    if (platform) where.platform = platform
    if (status && status.length > 0) where.status = status
    else where.status = { not: 'ARCHIVED' } // Exclude archived by default
    if (assignedToId) where.assignedToId = assignedToId

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const [campaigns, totalCount] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, logoUrl: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { adCreatives: true, adSpendRecords: true, abTests: true, conversionEvents: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = createCampaignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Tenant isolation: non-admin users must be assigned to the client
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (!assignedClientIds.includes(data.clientId)) {
        return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        clientId: data.clientId,
        name: data.name,
        platform: data.platform,
        campaignType: data.campaignType,
        objective: data.objective,
        status: data.status || 'DRAFT',
        externalId: data.externalId,
        dailyBudget: data.dailyBudget,
        monthlyBudget: data.monthlyBudget,
        totalBudget: data.totalBudget,
        currency: data.currency,
        targetAudience: data.targetAudience,
        keywords: data.keywords,
        placements: data.placements,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        assignedToId: data.assignedToId,
        createdById: user.id,
      },
      include: {
        client: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
