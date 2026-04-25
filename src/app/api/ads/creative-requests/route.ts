import { NextRequest, NextResponse } from 'next/server'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const createCreativeRequestSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  designType: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT', 'GIF', 'STATIC', 'ANIMATED', 'PRINT', 'BRANDING', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  dueDate: z.string().optional(),
  specifications: z.string().optional(),
  referenceUrls: z.array(z.string().url()).optional(),
})

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const clientId = searchParams.get('clientId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Tenant isolation for non-managers
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await prisma.clientTeamMember.findMany({
        where: { userId: user.id },
        select: { clientId: true },
      }).then(results => results.map(r => r.clientId))

      if (clientId) {
        if (!assignedClientIds.includes(clientId)) {
          return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
        }
        where.clientId = clientId
      } else if (assignedClientIds.length > 0) {
        where.clientId = { in: assignedClientIds }
      }
    } else if (clientId) {
      where.clientId = clientId
    }

    if (status) {
      if (status === 'REQUESTED') {
        where.status = 'PENDING'
      } else {
        where.status = status
      }
    }
    if (priority) where.priority = priority

    // Try to fetch content approvals with CREATIVE type, but fallback gracefully
    let requests: any[] = []
    let totalCount = 0

    try {
      const whereWithType = { ...where, type: 'CREATIVE' }
      const [rawRequests, count] = await Promise.all([
        prisma.contentApproval.findMany({
          where: whereWithType,
          include: {
            client: { select: { id: true, name: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true, name: true } },
            reviewedBy: { select: { id: true, firstName: true, lastName: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
        }),
        prisma.contentApproval.count({ where: whereWithType }),
      ])
      requests = rawRequests
      totalCount = count
    } catch (dbError) {
      // If contentApproval table doesn't exist or has issues, return empty array
      console.error('Database error fetching creative requests:', dbError)
      requests = []
      totalCount = 0
    }

    const mappedRequests = requests.map(r => ({
      id: r.id,
      client: r.client?.name || 'Unknown',
      clientId: r.client?.id || '',
      title: r.title,
      description: r.description,
      designType: r.specifications,
      status: r.status === 'PENDING' ? 'REQUESTED' : r.status === 'REVISION_REQUESTED' ? 'CHANGES_NEEDED' : r.status,
      priority: r.priority,
      dueDate: r.dueDate?.toISOString().split('T')[0],
      assignedDesigner: r.reviewedBy ? `${r.reviewedBy.firstName || r.reviewedBy.name || ''}` : 'Unassigned',
      requestDate: r.createdAt.toISOString().split('T')[0],
      createdBy: r.createdBy?.firstName || r.createdBy?.name || 'Unknown',
    }))

    return NextResponse.json({
      requests: mappedRequests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch creative requests:', error)
    return NextResponse.json({ requests: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
  }
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()
    const parsed = createCreativeRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
      select: { id: true, name: true },
    })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Verify user has access to this client
    if (!isManagerOrAbove(user)) {
      const isAssigned = await prisma.clientTeamMember.findFirst({
        where: { userId: user.id, clientId: data.clientId },
      })
      if (!isAssigned) {
        return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
      }
    }

    const creativeRequest = await prisma.contentApproval.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        type: 'CREATIVE',
        specifications: data.designType || data.specifications,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        attachments: data.referenceUrls ? JSON.stringify(data.referenceUrls) : undefined,
        createdById: user.id,
        status: 'PENDING',
      },
      include: {
        client: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, name: true } },
      },
    })

    return NextResponse.json({
      request: {
        id: creativeRequest.id,
        client: creativeRequest.client.name,
        clientId: creativeRequest.client.id,
        title: creativeRequest.title,
        description: creativeRequest.description,
        designType: creativeRequest.specifications,
        status: 'REQUESTED',
        priority: creativeRequest.priority,
        dueDate: creativeRequest.dueDate?.toISOString().split('T')[0],
        requestDate: creativeRequest.createdAt.toISOString().split('T')[0],
        createdBy: creativeRequest.createdBy.firstName || creativeRequest.createdBy.name,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create creative request:', error)
    return NextResponse.json({ error: 'Failed to create creative request. Please try again.' }, { status: 500 })
  }
})