import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateDailyTaskSchema = z.object({
  description: z.string().optional(),
  category: z.string().optional(),
  clientId: z.string().optional(),
  priority: z.string().optional(),
  plannedHours: z.number().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  order: z.number().optional(),
}).passthrough()

// Delete a task
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

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

    // Security check - only owner or managers can delete
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (task.plan.userId !== user.id && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the task
    await prisma.dailyTask.delete({
      where: { id: taskId },
    })

    // Update plan total hours (subtract planned hours)
    await prisma.dailyTaskPlan.update({
      where: { id: task.plan.id },
      data: {
        totalPlannedHours: {
          decrement: task.plannedHours,
        },
        totalActualHours: {
          decrement: task.actualHours || 0,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
})

// Update a task
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!
    const raw = await req.json()
    const parsed = updateDailyTaskSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

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

    // Security check
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (task.plan.userId !== user.id && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Calculate hours difference if plannedHours changed
    const hoursDiff = body.plannedHours
      ? body.plannedHours - task.plannedHours
      : 0

    // Update the task
    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        description: body.description,
        activityType: body.activityType as string | undefined,
        plannedHours: body.plannedHours,
        priority: body.priority,
        notes: body.notes,
      },
    })

    // Update plan total hours if changed
    if (hoursDiff !== 0) {
      await prisma.dailyTaskPlan.update({
        where: { id: task.plan.id },
        data: {
          totalPlannedHours: {
            increment: hoursDiff,
          },
        },
      })
    }

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
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
})
