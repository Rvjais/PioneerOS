import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const completeTaskSchema = z.object({
  actualHours: z.number().min(0).optional(),
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    // Get optional actual hours from body
    let actualHours: number | undefined
    try {
      const body = await req.json()
      const parsed = completeTaskSchema.safeParse(body)
      if (parsed.success) {
        actualHours = parsed.data.actualHours
      }
    } catch {
      // No body provided, use calculated hours
    }

    // Get the task and verify ownership
    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: {
        plan: {
          select: { userId: true, id: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Security check - only owner or managers can complete
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (task.plan.userId !== user.id && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify task is in progress before completing
    if (task.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: `Task must be IN_PROGRESS to complete, current status: ${task.status}` },
        { status: 400 }
      )
    }

    const now = new Date()

    // Calculate actual hours if not provided
    let calculatedHours = actualHours
    if (!calculatedHours && task.startedAt) {
      const durationMs = now.getTime() - task.startedAt.getTime()
      calculatedHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10 // Round to 1 decimal
      calculatedHours = Math.max(0.1, calculatedHours) // Minimum 0.1 hours
    }
    calculatedHours = calculatedHours || task.plannedHours || 1

    // Update task to completed
    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: now,
        actualEndTime: now,
        actualHours: calculatedHours,
      },
    })

    // Update plan total actual hours
    await prisma.dailyTaskPlan.update({
      where: { id: task.plan.id },
      data: {
        totalActualHours: {
          increment: calculatedHours,
        },
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
    console.error('Failed to complete task:', error)
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    )
  }
})
