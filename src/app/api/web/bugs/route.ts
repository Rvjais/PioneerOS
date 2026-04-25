/**
 * API Route: Web Bug Reports
 * GET /api/web/bugs - List bug reports
 * POST /api/web/bugs - Create a bug report
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createBugSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  projectId: z.string().min(1, 'Project is required'),
  pageUrl: z.string().url().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assignedToId: z.string().optional(),
})

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const priority = searchParams.get('priority')
    const assignedToId = searchParams.get('assignedToId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(user.role)

    const where: Record<string, unknown> = {}

    if (status && status !== 'ALL') where.status = status
    if (projectId) where.projectId = projectId
    if (priority) where.priority = priority
    if (assignedToId) where.assignedToId = assignedToId

    if (!isManager) {
      where.OR = [
        { assignedToId: user.id },
        { project: { client: { accountManagerId: user.id } } },
      ]
    }

    const [bugs, total, openCount, criticalCount] = await Promise.all([
      prisma.webBugReport.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              client: { select: { id: true, name: true } },
            },
          },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          resolvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.webBugReport.count({ where }),
      prisma.webBugReport.count({ where: { ...where, status: 'OPEN' } }),
      prisma.webBugReport.count({ where: { ...where, priority: 'CRITICAL', status: { in: ['OPEN', 'CONFIRMED', 'IN_PROGRESS'] } } }),
    ])

    return NextResponse.json({
      bugs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: { open: openCount, critical: criticalCount, total },
    })
  } catch (error) {
    console.error('Failed to fetch bug reports:', error)
    return NextResponse.json({ error: 'Failed to fetch bug reports' }, { status: 500 })
  }
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()
    const parsed = createBugSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { title, description, projectId, pageUrl, priority, assignedToId } = parsed.data

    const bug = await prisma.webBugReport.create({
      data: {
        title,
        description,
        projectId,
        pageUrl: pageUrl || null,
        priority,
        assignedToId: assignedToId || null,
        status: 'OPEN',
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
          type: 'BUG_REPORT',
          title: 'New Bug Assigned',
          message: `"${title}" has been assigned to you`,
          link: '/web/bugs',
          priority: priority === 'CRITICAL' ? 'HIGH' : 'NORMAL',
        },
      })
    }

    return NextResponse.json(bug, { status: 201 })
  } catch (error) {
    console.error('Failed to create bug report:', error)
    return NextResponse.json({ error: 'Failed to create bug report' }, { status: 500 })
  }
})
