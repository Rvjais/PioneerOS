import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const upsellCreateSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  type: z.string().min(1, 'Type is required'),
  title: z.string().min(1, 'Title is required'),
  estimatedValue: z.number().optional(),
  description: z.string().optional(),
  probability: z.number().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/web/upsells
 * Get all upsell opportunities
 */
export const GET = withAuth(async (request) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const clientId = searchParams.get('clientId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (clientId) {
      where.clientId = clientId
    }

    const [opportunities, total] = await Promise.all([
      prisma.upsellOpportunity.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.upsellOpportunity.count({ where }),
    ])

    return NextResponse.json({ opportunities, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Error fetching upsell opportunities:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'SALES', 'OPERATIONS_HEAD', 'WEB_MANAGER'] })

/**
 * POST /api/web/upsells
 * Create a new upsell opportunity
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json()
    const result = upsellCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message },
        { status: 400 }
      )
    }
    const {
      clientId,
      type,
      title,
      description,
      estimatedValue,
      probability,
      followUpDate,
      notes,
    } = result.data

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const opportunity = await prisma.upsellOpportunity.create({
      data: {
        clientId,
        type,
        title,
        description: description || null,
        estimatedValue: estimatedValue ?? 0,
        probability: probability || 50,
        status: 'IDENTIFIED',
        assignedTo: user.id,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    console.error('Error creating upsell opportunity:', error)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'SALES', 'OPERATIONS_HEAD', 'WEB_MANAGER'] })
