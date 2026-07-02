import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  designType: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  dueDate: z.string().optional(),
  clientId: z.string().optional(),
  assignedDesignerId: z.string().optional(), // internal User.id
  referenceUrls: z.array(z.string()).optional(),
})

const updateSchema = z.object({
  status: z.enum(['PENDING', 'IN_REVIEW', 'IN_DESIGN', 'DELIVERED', 'APPROVED', 'REVISION_REQUESTED']).optional(),
  assignedDesignerId: z.string().optional(),
  reviewNote: z.string().optional(),
  contentUrl: z.string().optional(),
})

/**
 * Parses the stored specifications JSON to extract assigned designer id.
 * Format: JSON string like { "designType": "...", "assignedDesignerId": "...", "referenceUrls": [...] }
 */
function parseSpecs(specs: string | null): Record<string, unknown> {
  if (!specs) return {}
  try { return JSON.parse(specs) } catch { return { designType: specs } }
}

/** GET /api/design/requests
 * - DESIGNER / DESIGN_LEAD: sees requests assigned to them + requests they created
 * - MANAGER / SUPER_ADMIN / OPERATIONS_HEAD: sees all
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // comma-separated
    const view = searchParams.get('view') // 'mine' | 'all'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const skip = (page - 1) * limit

    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)

    // Build status filter
    let statusFilter: Record<string, unknown> | undefined
    if (status) {
      const statuses = status.split(',').map((s) => s.trim())
      statusFilter = statuses.length === 1 ? { status: statuses[0] } : { status: { in: statuses } }
    }

    // All creative requests (type = CREATIVE)
    const baseWhere = {
      type: 'CREATIVE',
      ...statusFilter,
    }

    // For non-admin designers: show requests assigned to them OR created by them
    // We store assignedDesignerId inside specifications JSON
    // Since we can't query JSON in Prisma easily, fetch all and filter in-app for designers
    // For admins: return all
    let rawRequests
    let totalCount: number

    if (isAdmin || view === 'all') {
      ;[rawRequests, totalCount] = await Promise.all([
        prisma.contentApproval.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
          include: {
            client: { select: { id: true, name: true } },
          },
        }),
        prisma.contentApproval.count({ where: baseWhere }),
      ])
    } else {
      // Fetch all and filter by assignedDesignerId in specs or createdById
      const all = await prisma.contentApproval.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true } },
        },
      })
      rawRequests = all.filter((r) => {
        const specs = parseSpecs(r.specifications)
        return specs.assignedDesignerId === user.id || r.createdById === user.id
      })
      totalCount = rawRequests.length
      rawRequests = rawRequests.slice(skip, skip + limit)
    }

    // Fetch requester & designer details for all requests
    const allUserIds = new Set<string>()
    rawRequests.forEach((r) => {
      if (r.createdById) allUserIds.add(r.createdById)
      const specs = parseSpecs(r.specifications)
      if (specs.assignedDesignerId) allUserIds.add(specs.assignedDesignerId as string)
    })

    const usersMap: Record<string, { firstName: string; lastName: string | null; department: string }> = {}
    if (allUserIds.size > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: Array.from(allUserIds) } },
        select: { id: true, firstName: true, lastName: true, department: true },
      })
      users.forEach((u) => { usersMap[u.id] = u })
    }

    const mapped = rawRequests.map((r) => {
      const specs = parseSpecs(r.specifications)
      const requester = r.createdById ? usersMap[r.createdById] : null
      const designer = specs.assignedDesignerId ? usersMap[specs.assignedDesignerId as string] : null
      return {
        id: r.id,
        title: r.title,
        description: r.description ?? null,
        status: r.status,
        priority: r.priority,
        dueDate: r.dueDate?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        clientId: r.client?.id ?? null,
        clientName: r.client?.name ?? null,
        designType: (specs.designType as string) ?? null,
        referenceUrls: (specs.referenceUrls as string[]) ?? [],
        contentUrl: r.contentUrl ?? null,
        reviewNote: r.reviewNote ?? null,
        assignedDesignerId: (specs.assignedDesignerId as string) ?? null,
        assignedDesignerName: designer
          ? `${designer.firstName} ${designer.lastName ?? ''}`.trim()
          : null,
        requestedById: r.createdById,
        requestedByName: requester
          ? `${requester.firstName} ${requester.lastName ?? ''}`.trim()
          : 'Unknown',
      }
    })

    return NextResponse.json({
      requests: mapped,
      pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    console.error('GET /api/design/requests error:', error)
    return NextResponse.json({ requests: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } })
  }
})

/** POST /api/design/requests — any employee can create */
export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    // Need at least a dummy clientId — use first available or null trick
    // If no clientId provided, try to find a default or error
    if (!data.clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
    }

    const specs = JSON.stringify({
      designType: data.designType ?? null,
      assignedDesignerId: data.assignedDesignerId ?? null,
      referenceUrls: data.referenceUrls ?? [],
    })

    const created = await prisma.contentApproval.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        type: 'CREATIVE',
        specifications: specs,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        createdById: user.id,
        status: 'PENDING',
      },
      include: { client: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ request: { id: created.id, title: created.title, status: created.status } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/design/requests error:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
})
