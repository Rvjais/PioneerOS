/**
 * API Route: Web Bug Report Detail
 * GET /api/web/bugs/[id]
 * PATCH /api/web/bugs/[id] - Update bug status, assignment, etc.
 * DELETE /api/web/bugs/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const updateBugSchema = z.object({
  status: z.enum(['OPEN', 'CONFIRMED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'WONT_FIX']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedToId: z.string().nullable().optional(),
  resolution: z.string().optional(),
  fixedInVersion: z.string().max(50).optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
})

export const GET = withAuth(async (req: NextRequest, { params }) => {
  try {
    const { id } = await params

    const bug = await prisma.webBugReport.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, role: true } },
        resolvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    if (!bug) return NextResponse.json({ error: 'Bug report not found' }, { status: 404 })
    return NextResponse.json(bug)
  } catch (error) {
    console.error('Failed to fetch bug report:', error)
    return NextResponse.json({ error: 'Failed to fetch bug report' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req: NextRequest, { user, params }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateBugSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const data = parsed.data

    const existingBug = await prisma.webBugReport.findUnique({ where: { id } })
    if (!existingBug) return NextResponse.json({ error: 'Bug report not found' }, { status: 404 })

    const updateData: Record<string, unknown> = { ...data }

    if (data.status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
      updateData.resolvedById = user.id
    }

    if (data.assignedToId && data.assignedToId !== existingBug.assignedToId && data.assignedToId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: data.assignedToId,
          type: 'BUG_REPORT',
          title: 'Bug Assigned to You',
          message: `"${existingBug.title}" has been assigned to you`,
          link: '/web/bugs',
          priority: existingBug.priority === 'CRITICAL' ? 'HIGH' : 'NORMAL',
        },
      })
    }

    const bug = await prisma.webBugReport.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        resolvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(bug)
  } catch (error) {
    console.error('Failed to update bug report:', error)
    return NextResponse.json({ error: 'Failed to update bug report' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, { user, params }) => {
  try {
    const { id } = await params
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(user.role)

    if (!isManager) return NextResponse.json({ error: 'Only managers can delete bug reports' }, { status: 403 })

    await prisma.webBugReport.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete bug report:', error)
    return NextResponse.json({ error: 'Failed to delete bug report' }, { status: 500 })
  }
})
