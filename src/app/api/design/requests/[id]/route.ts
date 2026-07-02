import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['PENDING', 'IN_REVIEW', 'IN_DESIGN', 'DELIVERED', 'APPROVED', 'REVISION_REQUESTED']).optional(),
  assignedDesignerId: z.string().nullable().optional(),
  reviewNote: z.string().optional(),
  contentUrl: z.string().optional(),
})

function parseSpecs(specs: string | null): Record<string, unknown> {
  if (!specs) return {}
  try { return JSON.parse(specs) } catch { return { designType: specs } }
}

export const PATCH = withAuth(async (req: NextRequest, { user, params }) => {
  try {
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    const existing = await prisma.contentApproval.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    const specs = parseSpecs(existing.specifications)
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    const isAssigned = specs.assignedDesignerId === user.id
    const isCreator = existing.createdById === user.id
    const isDesigner = ['DESIGNER', 'DESIGN_LEAD'].includes(user.role)

    if (!isAdmin && !isAssigned && !isCreator && !isDesigner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update assignedDesignerId inside specs JSON if provided
    let updatedSpecs = existing.specifications
    if (data.assignedDesignerId !== undefined) {
      const current = parseSpecs(existing.specifications)
      current.assignedDesignerId = data.assignedDesignerId
      updatedSpecs = JSON.stringify(current)
    }

    const updated = await prisma.contentApproval.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.reviewNote !== undefined && { reviewNote: data.reviewNote }),
        ...(data.contentUrl !== undefined && { contentUrl: data.contentUrl }),
        ...(updatedSpecs !== existing.specifications && { specifications: updatedSpecs }),
        ...(data.status === 'APPROVED' && { reviewedAt: new Date() }),
      },
    })

    return NextResponse.json({ success: true, id: updated.id, status: updated.status })
  } catch (error) {
    console.error('PATCH /api/design/requests/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
})

export const GET = withAuth(async (req: NextRequest, { user, params }) => {
  try {
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const existing = await prisma.contentApproval.findUnique({
      where: { id },
      include: { client: { select: { id: true, name: true } } },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const specs = parseSpecs(existing.specifications)
    const allUserIds = [existing.createdById, specs.assignedDesignerId as string].filter(Boolean)
    const users = await prisma.user.findMany({
      where: { id: { in: allUserIds } },
      select: { id: true, firstName: true, lastName: true },
    })
    const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))
    const requester = usersMap[existing.createdById]
    const designer = specs.assignedDesignerId ? usersMap[specs.assignedDesignerId as string] : null

    return NextResponse.json({
      request: {
        id: existing.id,
        title: existing.title,
        description: existing.description,
        status: existing.status,
        priority: existing.priority,
        dueDate: existing.dueDate?.toISOString() ?? null,
        createdAt: existing.createdAt.toISOString(),
        clientId: existing.client?.id ?? null,
        clientName: existing.client?.name ?? null,
        designType: specs.designType ?? null,
        referenceUrls: specs.referenceUrls ?? [],
        contentUrl: existing.contentUrl ?? null,
        reviewNote: existing.reviewNote ?? null,
        assignedDesignerId: specs.assignedDesignerId ?? null,
        assignedDesignerName: designer ? `${designer.firstName} ${designer.lastName ?? ''}`.trim() : null,
        requestedById: existing.createdById,
        requestedByName: requester ? `${requester.firstName} ${requester.lastName ?? ''}`.trim() : 'Unknown',
      },
    })
  } catch (error) {
    console.error('GET /api/design/requests/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 })
  }
})
