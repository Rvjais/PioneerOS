import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/client-access-requests/[id]
 * Get a single client access request
 */
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const userRole = user.role as string
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

    const request = await prisma.clientAccessRequest.findUnique({
      where: { id },
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
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Non-admins can only view their own requests
    if (!isAdmin && request.requestedById !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(request)
  } catch (error) {
    console.error('Error fetching client access request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client access request' },
      { status: 500 }
    )
  }
})

/**
 * PATCH /api/client-access-requests/[id]
 * Approve or reject a client access request (admin only)
 */
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const userRole = user.role as string
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can approve/reject requests' },
        { status: 403 }
      )
    }

    const { id } = await routeParams!
    const body = await req.json()
    const schema = z.object({
      action: z.enum(['APPROVE', 'REJECT']),
      rejectionReason: z.string().max(1000).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { action, rejectionReason } = result.data

    // Get the request
    const request = await prisma.clientAccessRequest.findUnique({
      where: { id },
      include: {
        client: { select: { name: true } },
        requestedBy: { select: { firstName: true, lastName: true } },
      },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      )
    }

    if (action === 'APPROVE') {
      // Use transaction to update request and create team member
      const result = await prisma.$transaction(async (tx) => {
        // Update the request
        const updatedRequest = await tx.clientAccessRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedById: user.id,
            approvedAt: new Date(),
          },
        })

        // Create ClientTeamMember entry
        await tx.clientTeamMember.create({
          data: {
            clientId: request.clientId,
            userId: request.requestedById,
            role: request.requestedRole,
            isPrimary: false,
          },
        })

        return updatedRequest
      })

      // Send notification to requester
      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          type: 'CLIENT_ACCESS_APPROVED',
          title: 'Access Request Approved',
          message: `Your request to access ${request.client.name} has been approved`,
          link: `/clients/${request.clientId}`,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Request approved successfully',
        request: result,
      })
    } else {
      // Reject
      const updatedRequest = await prisma.clientAccessRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          approvedById: user.id,
          approvedAt: new Date(),
          rejectionReason: rejectionReason || null,
        },
      })

      // Send notification to requester
      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          type: 'CLIENT_ACCESS_REJECTED',
          title: 'Access Request Rejected',
          message: `Your request to access ${request.client.name} has been rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
          link: '/client-access',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Request rejected',
        request: updatedRequest,
      })
    }
  } catch (error) {
    console.error('Error processing client access request:', error)
    return NextResponse.json(
      { error: 'Failed to process client access request' },
      { status: 500 }
    )
  }
})
