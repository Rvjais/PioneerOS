/**
 * API Route: Web Change Request Detail
 * GET /api/web/requests/[id]
 * PATCH /api/web/requests/[id] - Update status, estimate, approval, etc.
 * DELETE /api/web/requests/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const updateRequestSchema = z.object({
  status: z.enum(['PENDING', 'ESTIMATED', 'CLIENT_APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']).optional(),
  type: z.enum(['MINOR', 'MAJOR', 'FEATURE', 'ENHANCEMENT']).optional(),
  assignedToId: z.string().nullable().optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  estimatedCost: z.number().positive().nullable().optional(),
  rejectionReason: z.string().max(500).optional(),
  completedById: z.string().optional(),
  actualHours: z.number().positive().nullable().optional(),
  actualCost: z.number().positive().nullable().optional(),
})

export const GET = withAuth(async (req: NextRequest, { params }) => {
  try {
    const { id } = await params

    const request = await prisma.webChangeRequest.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, role: true } },
        completedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    if (!request) return NextResponse.json({ error: 'Change request not found' }, { status: 404 })
    return NextResponse.json(request)
  } catch (error) {
    console.error('Failed to fetch change request:', error)
    return NextResponse.json({ error: 'Failed to fetch change request' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req: NextRequest, { user, params }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const data = parsed.data

    const existingRequest = await prisma.webChangeRequest.findUnique({ where: { id } })
    if (!existingRequest) return NextResponse.json({ error: 'Change request not found' }, { status: 404 })

    const updateData: Record<string, unknown> = { ...data }

    if (data.status === 'COMPLETED') {
      updateData.completedAt = new Date()
      updateData.completedById = data.completedById || user.id
    }

    if (data.status === 'CLIENT_APPROVED' && !existingRequest.clientApprovedAt) {
      updateData.clientApprovedAt = new Date()
    }

    if (data.assignedToId && data.assignedToId !== existingRequest.assignedToId && data.assignedToId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: data.assignedToId,
          type: 'GENERAL',
          title: 'Change Request Assigned',
          message: `"${existingRequest.title}" has been assigned to you`,
          link: '/web/requests',
          priority: 'NORMAL',
        },
      })
    }

    const request = await prisma.webChangeRequest.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        completedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error('Failed to update change request:', error)
    return NextResponse.json({ error: 'Failed to update change request' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, { user, params }) => {
  try {
    const { id } = await params
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(user.role)

    if (!isManager) return NextResponse.json({ error: 'Only managers can delete change requests' }, { status: 403 })

    await prisma.webChangeRequest.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete change request:', error)
    return NextResponse.json({ error: 'Failed to delete change request' }, { status: 500 })
  }
})
