import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    // Get the task and verify ownership
    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: {
        plan: { select: { userId: true } },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (task.status !== 'PLANNED') {
      return NextResponse.json({ error: 'Task cannot be started' }, { status: 400 })
    }

    // Start the task
    const now = new Date()
    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: now,
        actualStartTime: now,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Failed to start task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
