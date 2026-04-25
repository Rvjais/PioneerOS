import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const adminDeviceActionSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required').max(100),
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().max(2000).optional().nullable(),
})

// GET /api/hr/devices/admin - List all device requests (admin only)
export const GET = withAuth(async (req, { user, params }) => {
  try {
// Only HR or admins can view all requests
    const isAuthorized =
      user.department === 'HR' ||
      ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const deviceType = searchParams.get('deviceType')

    // Build filter
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (deviceType) where.deviceType = deviceType

    // Fetch all device requests with user info
    const requests = await prisma.deviceRequest.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // PENDING first
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Get user info for each request
    const userIds = [...new Set(requests.map(r => r.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, deletedAt: null },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        department: true,
      },
    })

    const userMap = new Map(users.map(u => [u.id, u]))

    // Get available assets for allocation
    const availableAssets = await prisma.asset.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        id: true,
        assetTag: true,
        name: true,
        type: true,
        brand: true,
        model: true,
        condition: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      requests: requests.map(r => ({
        ...r,
        user: userMap.get(r.userId) || null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      availableAssets,
      stats: {
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        fulfilled: requests.filter(r => r.status === 'FULFILLED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
      },
    })
  } catch (error) {
    console.error('Failed to fetch device requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
})

// POST /api/hr/devices/admin - Approve or reject a device request
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Only HR or admins can approve/reject
    const isAuthorized =
      user.department === 'HR' ||
      ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = adminDeviceActionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { requestId, action, notes } = parsed.data

    // Find the request
    const request = await prisma.deviceRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      )
    }

    // Update the request
    const updatedRequest = await prisma.deviceRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        approvedBy: user.id,
        notes: notes || request.notes,
      },
    })

    return NextResponse.json({
      request: {
        ...updatedRequest,
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to process device request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
})
