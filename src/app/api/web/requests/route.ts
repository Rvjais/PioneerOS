/**
 * API Route: Web Change Requests
 * GET /api/web/requests - List change requests
 * POST /api/web/requests - Create a change request
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max,
  projectId: z.string().min(1, 'Project is required'),
  type: z.enum(['MINOR', 'MAJOR', 'FEATURE', 'ENHANCEMENT']).default('MINOR'),
  pageUrl: z.string().url().optional().or(z.literal('')),
  estimatedHours: z.number().positive().optional(),
  estimatedCost: z.number().positive().optional(),
  requiresApproval: z.boolean().default(false),
  isBillable: z.boolean().default(false),
  assignedToId: z.string().optional(),
})

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(user.role)

    const where: Record<string, unknown> = {}
    if (status && status !== 'ALL') where.status = status
    if (projectId) where.projectId = projectId
    if (type) where.type = type

    if (!isManager) {
      where.OR = [
        { assignedToId: user.id },
        { project: { client: { accountManagerId: user.id } } },
      ]
    }

    const [requests, total, pendingCount, approvedCount] = await Promise.all([
      prisma.webChangeRequest.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          completedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.webChangeRequest.count({ where }),
      prisma.webChangeRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.webChangeRequest.count({ where: { ...where, status: 'CLIENT_APPROVED' } }),
    ])

    return NextResponse.json({
      requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: { pending: pendingCount, approved: approvedCount, total },
    })
  } catch (error) {
    console.error('Failed to fetch change requests:', error)
    return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 })
  }
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()
    const parsed = createRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { title, description, projectId, type, pageUrl, estimatedHours, estimatedCost, requiresApproval, isBillable, assignedToId } = parsed.data

    const request = await prisma.webChangeRequest.create({
      data: {
        title,
        description,
        projectId,
        type,
        pageUrl: pageUrl || null,
        estimatedHours: estimatedHours || null,
        estimatedCost: estimatedCost || null,
        requiresApproval,
        isBillable,
        assignedToId: assignedToId || null,
        status: 'PENDING',
      },
      include: {
        project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    if (assignedToId && assignedToId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          type: 'GENERAL',
          title: 'New Change Request',
          message: `"${title}" has been assigned to you`,
          link: '/web/requests',
          priority: 'NORMAL',
        },
      })
    }

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error('Failed to create change request:', error)
    return NextResponse.json({ error: 'Failed to create change request' }, { status: 500 })
  }
})
