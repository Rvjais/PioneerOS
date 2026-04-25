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

const createABTestSchema = z.object({
  campaignId: z.string().min(1),
  clientId: z.string().min(1),
  name: z.string().min(1).max(255),
  hypothesis: z.string().optional(),
  testType: z.enum(['CREATIVE', 'AUDIENCE', 'BIDDING', 'LANDING_PAGE', 'COPY']),
  variantA: z.string().min(1), // JSON string
  variantB: z.string().min(1), // JSON string
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

const updateABTestSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['RUNNING', 'COMPLETED', 'CANCELLED']).optional(),
  winner: z.enum(['A', 'B', 'INCONCLUSIVE']).optional(),
  confidenceLevel: z.number().min(0).max(100).optional(),
  conclusion: z.string().optional(),
  endDate: z.string().datetime().optional(),
  variantA: z.string().optional(),
  variantB: z.string().optional(),
})

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const campaignId = searchParams.get('campaignId')
    const status = searchParams.get('status')
    const testType = searchParams.get('testType')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
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
    if (status) where.status = status
    if (testType) where.testType = testType

    const [tests, totalCount] = await Promise.all([
      prisma.aBTest.findMany({
        where,
        include: {
          campaign: { select: { id: true, name: true, platform: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.aBTest.count({ where }),
    ])

    return NextResponse.json({
      tests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch A/B tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = createABTestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Validate JSON strings
    try {
      JSON.parse(data.variantA)
      JSON.parse(data.variantB)
    } catch {
      return NextResponse.json({ error: 'variantA and variantB must be valid JSON strings' }, { status: 400 })
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({ where: { id: data.campaignId }, select: { id: true } })
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

    const test = await prisma.aBTest.create({
      data: {
        campaignId: data.campaignId,
        clientId: data.clientId,
        name: data.name,
        hypothesis: data.hypothesis,
        testType: data.testType,
        variantA: data.variantA,
        variantB: data.variantB,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        createdById: user.id,
      },
      include: {
        campaign: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ test }, { status: 201 })
  } catch (error) {
    console.error('Failed to create A/B test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = updateABTestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    const existing = await prisma.aBTest.findUnique({ where: { id: data.id }, select: { id: true, status: true, clientId: true } })
    if (!existing) {
      return NextResponse.json({ error: 'A/B test not found' }, { status: 404 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (!assignedClientIds.includes(existing.clientId)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        DRAFT: ['RUNNING', 'CANCELLED'],
        RUNNING: ['COMPLETED', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: [],
      }
      const allowed = validTransitions[existing.status] || []
      if (!allowed.includes(data.status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${existing.status} to ${data.status}` },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (data.status !== undefined) updateData.status = data.status
    if (data.winner !== undefined) updateData.winner = data.winner
    if (data.confidenceLevel !== undefined) updateData.confidenceLevel = data.confidenceLevel
    if (data.conclusion !== undefined) updateData.conclusion = data.conclusion
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.variantA !== undefined) {
      try { JSON.parse(data.variantA) } catch { return NextResponse.json({ error: 'variantA must be valid JSON' }, { status: 400 }) }
      updateData.variantA = data.variantA
    }
    if (data.variantB !== undefined) {
      try { JSON.parse(data.variantB) } catch { return NextResponse.json({ error: 'variantB must be valid JSON' }, { status: 400 }) }
      updateData.variantB = data.variantB
    }

    // Auto-set endDate when completing
    if (data.status === 'COMPLETED' && !data.endDate) {
      updateData.endDate = new Date()
    }

    const test = await prisma.aBTest.update({
      where: { id: data.id },
      data: updateData,
      include: {
        campaign: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Failed to update A/B test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
