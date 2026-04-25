import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { validateBody, validationError, idSchema } from '@/shared/validation/validation'
import { withAuth } from '@/server/auth/withAuth'

// Schema for creating a deliverable
const createDeliverableSchema = z.object({
  clientId: idSchema,
  category: z.string().min(1, 'Category required'),
  workItem: z.string().min(1, 'Work item name required'),
  description: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  proofUrl: z.string().url().optional().or(z.literal('')),
  kpi: z.string().optional(),
})

// Schema for updating a deliverable
const updateDeliverableSchema = z.object({
  id: idSchema,
  proofUrl: z.string().url().optional().or(z.literal('')),
  kpi: z.string().optional(),
  status: z.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'REVISION_REQUIRED']).optional(),
  reviewNotes: z.string().optional(),
  clientVisible: z.boolean().optional(),
})

// GET /api/client-deliverables - Get deliverables for a client
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const month = searchParams.get('month')
    const status = searchParams.get('status') // Filter by status
    const createdBy = searchParams.get('createdBy') // Filter by creator
    const approvedOnly = searchParams.get('approvedOnly') // Only return approved items

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Check access to client
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    if (!isManager) {
      const assignment = await prisma.clientTeamMember.findFirst({
        where: { clientId, userId: user.id },
      })
      if (!assignment) {
        return NextResponse.json({ error: 'Not authorized for this client' }, { status: 403 })
      }
    }

    const where: Record<string, unknown> = { clientId }
    if (month) {
      where.month = month
    }
    if (status) {
      where.status = status
    }
    if (createdBy) {
      where.createdById = createdBy
    }
    if (approvedOnly === 'true') {
      where.status = 'APPROVED'
    }

    const deliverables = await prisma.clientDeliverable.findMany({
      where,
      include: {
        submittedBy: { select: { id: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ category: 'asc' }, { workItem: 'asc' }],
    })

    return NextResponse.json({
      deliverables: deliverables.map(d => ({
        ...d,
        submittedAt: d.submittedAt?.toISOString() || null,
        reviewedAt: d.reviewedAt?.toISOString() || null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch deliverables:', error)
    return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 })
  }
})

// POST /api/client-deliverables - Create a new deliverable
export const POST = withAuth(async (req, { user, params }) => {
  try {
const validation = await validateBody(req, createDeliverableSchema)
    if (!validation.success) {
      return validationError(validation.error)
    }

    const { clientId, category, workItem, description, month, proofUrl, kpi } = validation.data

    // Check access to client
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    if (!isManager) {
      const assignment = await prisma.clientTeamMember.findFirst({
        where: { clientId, userId: user.id },
      })
      if (!assignment) {
        return NextResponse.json({ error: 'Not authorized for this client' }, { status: 403 })
      }
    }

    const deliverable = await prisma.clientDeliverable.create({
      data: {
        clientId,
        category,
        workItem,
        description,
        month,
        proofUrl: proofUrl || null,
        kpi,
        createdById: user.id,
        status: proofUrl ? 'SUBMITTED' : 'PENDING',
        submittedAt: proofUrl ? new Date() : null,
        submittedById: proofUrl ? user.id : null,
      },
      include: {
        submittedBy: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({
      deliverable: {
        ...deliverable,
        submittedAt: deliverable.submittedAt?.toISOString() || null,
        reviewedAt: deliverable.reviewedAt?.toISOString() || null,
        createdAt: deliverable.createdAt.toISOString(),
        updatedAt: deliverable.updatedAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create deliverable:', error)
    return NextResponse.json({ error: 'Failed to create deliverable' }, { status: 500 })
  }
})

// PATCH /api/client-deliverables - Update a deliverable
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
const validation = await validateBody(req, updateDeliverableSchema)
    if (!validation.success) {
      return validationError(validation.error)
    }

    const { id, proofUrl, kpi, status, reviewNotes, clientVisible } = validation.data

    // Get existing deliverable
    const existing = await prisma.clientDeliverable.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
    }

    // Check access
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    if (!isManager) {
      const assignment = await prisma.clientTeamMember.findFirst({
        where: { clientId: existing.clientId, userId: user.id },
      })
      if (!assignment) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }

      // Non-managers can only update proof and KPI, not status
      if (status && status !== 'SUBMITTED') {
        return NextResponse.json({ error: 'Only managers can change status' }, { status: 403 })
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (proofUrl !== undefined) {
      updateData.proofUrl = proofUrl || null
      if (proofUrl && existing.status === 'PENDING') {
        updateData.status = 'SUBMITTED'
        updateData.submittedAt = new Date()
        updateData.submittedById = user.id
      }
    }

    if (kpi !== undefined) updateData.kpi = kpi
    if (clientVisible !== undefined) updateData.clientVisible = clientVisible

    // Manager-only updates
    if (isManager) {
      if (status) {
        updateData.status = status
        if (status === 'APPROVED' || status === 'REVISION_REQUIRED') {
          updateData.reviewedAt = new Date()
          updateData.reviewedById = user.id
        }
      }
      if (reviewNotes !== undefined) updateData.reviewNotes = reviewNotes
    }

    const deliverable = await prisma.clientDeliverable.update({
      where: { id },
      data: updateData,
      include: {
        submittedBy: { select: { id: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({
      deliverable: {
        ...deliverable,
        submittedAt: deliverable.submittedAt?.toISOString() || null,
        reviewedAt: deliverable.reviewedAt?.toISOString() || null,
        createdAt: deliverable.createdAt.toISOString(),
        updatedAt: deliverable.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to update deliverable:', error)
    return NextResponse.json({ error: 'Failed to update deliverable' }, { status: 500 })
  }
})

// DELETE /api/client-deliverables - Delete a deliverable
export const DELETE = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Deliverable ID required' }, { status: 400 })
    }

    // Only managers can delete
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    if (!isManager) {
      return NextResponse.json({ error: 'Only managers can delete deliverables' }, { status: 403 })
    }

    await prisma.clientDeliverable.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete deliverable:', error)
    return NextResponse.json({ error: 'Failed to delete deliverable' }, { status: 500 })
  }
})
