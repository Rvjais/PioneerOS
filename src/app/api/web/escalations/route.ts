/**
 * API Route: Web Client Escalations
 * GET /api/web/escalations - List escalations
 * POST /api/web/escalations - Create an escalation
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createEscalationSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max,
  type: z.enum(['CLIENT_COMPLAINT', 'DELIVERY_ISSUE', 'QUALITY', 'OTHER']).default('CLIENT_COMPLAINT'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('HIGH'),
  assignedToId: z.string().optional(),
})

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')
    const clientId = searchParams.get('clientId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(user.role)

    const where: Record<string, unknown> = {
      type: { in: ['CLIENT_COMPLAINT', 'DELIVERY_ISSUE', 'QUALITY', 'OTHER'] },
    }

    if (status && status !== 'ALL') where.status = status
    if (severity) where.severity = severity
    if (type) where.type = type
    if (clientId) where.clientId = clientId

    // Only managers can see all escalations
    if (!isManager) {
      where.OR = [
        { employeeId: user.id },
        { reportedBy: user.id },
      ]
    }

    const [escalations, total, openCount, criticalCount] = await Promise.all([
      prisma.employeeEscalation.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          employee: { select: { id: true, firstName: true, lastName: true } },
          reporter: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [
          { severity: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employeeEscalation.count({ where }),
      prisma.employeeEscalation.count({ where: { ...where, status: 'OPEN' } }),
      prisma.employeeEscalation.count({ where: { ...where, severity: 'CRITICAL', status: 'OPEN' } }),
    ])

    return NextResponse.json({
      escalations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        open: openCount,
        critical: criticalCount,
        total,
      },
    })
  } catch (error) {
    console.error('Failed to fetch escalations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch escalations' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()
    const parsed = createEscalationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { clientId, projectId, title, description, type, severity, assignedToId } = parsed.data

    // Find a web team member to assign the escalation to
    let employeeId = assignedToId
    if (!employeeId) {
      const webManager = await prisma.user.findFirst({
        where: {
          role: { in: ['WEB_MANAGER', 'MANAGER', 'SUPER_ADMIN'] },
          department: 'WEB',
          status: 'ACTIVE',
        },
        select: { id: true },
      })
      employeeId = webManager?.id || user.id
    }

    const escalation = await prisma.employeeEscalation.create({
      data: {
        clientId,
        title,
        description,
        type,
        severity,
        status: 'OPEN',
        employeeId,
        reportedBy: user.id,
        managerNotified: true,
        notifiedAt: new Date(),
      },
      include: {
        client: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        reporter: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    // Notify assigned employee
    if (employeeId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: employeeId,
          type: 'ESCALATION',
          title: 'New Client Escalation',
          message: `Critical: "${title}" - requires immediate attention`,
          link: '/web/escalations',
          priority: severity === 'CRITICAL' ? 'HIGH' : 'NORMAL',
        },
      })
    }

    return NextResponse.json(escalation, { status: 201 })
  } catch (error) {
    console.error('Failed to create escalation:', error)
    return NextResponse.json(
      { error: 'Failed to create escalation' },
      { status: 500 }
    )
  }
})
