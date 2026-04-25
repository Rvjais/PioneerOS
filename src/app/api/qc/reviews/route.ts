import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const qcReviewSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required').max(100),
  action: z.enum(['approve', 'reject']),
  feedback: z.string().max(5000).optional().nullable(),
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
// Fetch tasks that are in review or have QA status
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { status: 'REVIEW' },
          { qaStatus: { not: null } },
        ],
      },
      include: {
        assignee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const reviews = tasks.map(task => ({
      id: task.id,
      task: task.title,
      project: task.client?.name || 'Internal Task',
      developer: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName || ''}` : 'Unassigned',
      submittedDate: task.updatedAt.toISOString().split('T')[0],
      status: task.qaStatus === 'APPROVED' ? 'APPROVED' :
              task.qaStatus === 'REVISION_REQUIRED' ? 'RETURNED' : 'PENDING_REVIEW',
      reviewer: task.reviewer ? `${task.reviewer.firstName} ${task.reviewer.lastName || ''}` : undefined,
      feedback: task.qaComments || undefined,
    }))

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Failed to fetch QC reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
const data = await req.json()
    const parsed = qcReviewSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { taskId, action, feedback } = parsed.data

    const qaStatus = action === 'approve' ? 'APPROVED' : 'REVISION_REQUIRED'
    const taskStatus = action === 'approve' ? 'COMPLETED' : 'REVISION'

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        qaStatus,
        qaComments: feedback || null,
        qaReviewedAt: new Date(),
        reviewerId: user.id,
        status: taskStatus,
        completedAt: action === 'approve' ? new Date() : null,
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Failed to update QC review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
