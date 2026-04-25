import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { getPaginationParams, paginatedResponse } from '@/shared/utils/pagination'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/client-access-requests
 * List client access requests - employees see their own, admins see all
 */
export const GET = withAuth(async (req, { user, params }) => {
  try {
const userRole = user.role as string
    const userId = user.id
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const { skip, take, page, limit } = getPaginationParams(req)

    // Build filter
    const filter: Record<string, unknown> = {}

    // Non-admins only see their own requests
    if (!isAdmin) {
      filter.requestedById = userId
    }

    if (status) {
      filter.status = status
    }

    const [requests, total] = await Promise.all([
      prisma.clientAccessRequest.findMany({
        where: filter,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              brandName: true,
              tier: true,
              status: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              empId: true,
              department: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.clientAccessRequest.count({ where: filter }),
    ])

    return NextResponse.json(paginatedResponse(requests, total, page, limit))
  } catch (error) {
    console.error('Error fetching client access requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client access requests' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/client-access-requests
 * Create a new client access request
 */
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const schema = z.object({
      clientId: z.string().min(1),
      requestedRole: z.string().min(1).max(100),
      purpose: z.string().max(1000).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { clientId, requestedRole, purpose } = result.data

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if user already has access to this client
    const existingAccess = await prisma.clientTeamMember.findFirst({
      where: {
        clientId,
        userId: user.id,
      },
    })

    if (existingAccess) {
      return NextResponse.json(
        { error: 'You already have access to this client' },
        { status: 400 }
      )
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.clientAccessRequest.findFirst({
      where: {
        clientId,
        requestedById: user.id,
        status: 'PENDING',
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this client' },
        { status: 400 }
      )
    }

    // Create the access request
    const request = await prisma.clientAccessRequest.create({
      data: {
        clientId,
        requestedById: user.id,
        requestedRole,
        purpose: purpose || null,
        status: 'PENDING',
      },
      include: {
        client: {
          select: { name: true },
        },
        requestedBy: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    // Create notification for admins/managers
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'MANAGER'] },
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'CLIENT_ACCESS_REQUEST',
          title: 'New Client Access Request',
          message: `${request.requestedBy.firstName} ${request.requestedBy.lastName || ''} requested access to ${request.client.name}`,
          link: '/admin/client-access-requests',
        })),
      })
    }

    return NextResponse.json({ success: true, request })
  } catch (error) {
    console.error('Error creating client access request:', error)
    return NextResponse.json(
      { error: 'Failed to create client access request' },
      { status: 500 }
    )
  }
})
