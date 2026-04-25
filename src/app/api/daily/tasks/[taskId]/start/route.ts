import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    // Get the task and verify ownership
    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: {
        plan: {
          select: { userId: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Security check - only owner or managers can start
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (task.plan.userId !== user.id && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify task is in a startable state
    if (!['PLANNED', 'PENDING'].includes(task.status)) {
      return NextResponse.json(
        { error: `Task cannot be started from status: ${task.status}` },
        { status: 400 }
      )
    }

    // Update task to in progress
    const now = new Date()
    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: now,
        actualStartTime: now,
      },
    })

    return NextResponse.json({
      success: true,
      task: {
        ...updatedTask,
        plannedStartTime: updatedTask.plannedStartTime?.toISOString() || null,
        actualStartTime: updatedTask.actualStartTime?.toISOString() || null,
        actualEndTime: updatedTask.actualEndTime?.toISOString() || null,
        addedAt: updatedTask.addedAt.toISOString(),
        startedAt: updatedTask.startedAt?.toISOString() || null,
        completedAt: updatedTask.completedAt?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Failed to start task:', error)
    return NextResponse.json(
      { error: 'Failed to start task' },
      { status: 500 }
    )
  }
})
