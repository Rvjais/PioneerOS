/**
 * API Route: Pending Manager Reviews
 * GET /api/tasks/daily/pending-reviews
 *
 * Returns tasks awaiting manager review for the current user's department
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

function serializeDate(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

export const GET = withAuth(async (req, { user, params }) => {
  try {
// Only managers can view pending reviews
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    if (!isManager) {
      return NextResponse.json({ error: 'Only managers can view pending reviews' }, { status: 403 })
    }

    const tasks = await prisma.dailyTask.findMany({
      where: {
        status: 'COMPLETED',
        proofUrl: { not: null },
        managerReviewed: false,
        plan: {
          userId: { not: user.id },
          user: { department: user.department },
        },
      },
      include: {
        plan: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        client: { select: { id: true, name: true } },
      },
      orderBy: { completedAt: 'desc' },
    })

    const serializedTasks = tasks.map(task => ({
      id: task.id,
      description: task.description,
      activityType: task.activityType,
      status: task.status,
      plannedHours: task.plannedHours,
      actualHours: task.actualHours,
      proofUrl: task.proofUrl,
      deliverable: task.deliverable,
      clientName: task.client?.name || null,
      completedAt: serializeDate(task.completedAt),
      managerReviewed: task.managerReviewed,
      managerRating: task.managerRating,
      managerFeedback: task.managerFeedback,
      user: {
        id: task.plan.user.id,
        firstName: task.plan.user.firstName,
        lastName: task.plan.user.lastName,
      },
    }))

    return NextResponse.json({ tasks: serializedTasks })
  } catch (error) {
    console.error('Failed to fetch pending reviews:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pending reviews' },
      { status: 500 }
    )
  }
})
