import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updatePipelineTaskSchema = z.object({
  taskType: z.string().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  duration: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.string().optional(),
  dependencies: z.array(z.string()).nullable().optional(),
})

// GET /api/hr/pipeline-tasks/[taskId] - Get a specific HR pipeline task
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    const task = await prisma.hRPipelineTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const serializedTask = {
      ...task,
      startDate: task.startDate.toISOString(),
      endDate: task.endDate?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }

    return NextResponse.json({ task: serializedTask })
  } catch (error) {
    console.error('Failed to fetch HR pipeline task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
})

// PATCH /api/hr/pipeline-tasks/[taskId] - Update an HR pipeline task
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!
    const raw = await req.json()
    const parsed = updatePipelineTaskSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    const existingTask = await prisma.hRPipelineTask.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Only HR or managers or task owner can update
    const isAuthorized =
      user.department === 'HR' ||
      ['SUPER_ADMIN', 'MANAGER'].includes(user.role) ||
      existingTask.userId === user.id

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const {
      taskType,
      title,
      description,
      startDate,
      endDate,
      duration,
      progress,
      status,
      dependencies,
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (taskType !== undefined) updateData.taskType = taskType
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (duration !== undefined) updateData.duration = duration
    if (progress !== undefined) {
      updateData.progress = progress
      // Auto-update status based on progress
      if (progress >= 100) {
        updateData.status = 'COMPLETED'
      } else if (progress > 0 && existingTask.status === 'PLANNED') {
        updateData.status = 'IN_PROGRESS'
      }
    }
    if (status !== undefined) updateData.status = status
    if (dependencies !== undefined) {
      updateData.dependencies = dependencies ? JSON.stringify(dependencies) : null
    }

    const task = await prisma.hRPipelineTask.update({
      where: { id: taskId },
      data: updateData,
    })

    const serializedTask = {
      ...task,
      startDate: task.startDate.toISOString(),
      endDate: task.endDate?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }

    return NextResponse.json({ task: serializedTask })
  } catch (error) {
    console.error('Failed to update HR pipeline task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
})

// DELETE /api/hr/pipeline-tasks/[taskId] - Delete an HR pipeline task
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    const existingTask = await prisma.hRPipelineTask.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Only HR or managers or task owner can delete
    const isAuthorized =
      user.department === 'HR' ||
      ['SUPER_ADMIN', 'MANAGER'].includes(user.role) ||
      existingTask.userId === user.id

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.hRPipelineTask.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete HR pipeline task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
})
