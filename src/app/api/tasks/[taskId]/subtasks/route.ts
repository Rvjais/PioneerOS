import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createSubtaskSchema = z.object({
  title: z.string().min(1),
})

// Roles that can access all tasks
const MANAGER_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD']

// Check if user has access to a task
async function canAccessTask(taskId: string, userId: string, userRole: string, userDepartment: string): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { assigneeId: true, creatorId: true, reviewerId: true, department: true }
  })
  if (!task) return false
  if (MANAGER_ROLES.includes(userRole)) return true
  if (task.assigneeId === userId) return true
  if (task.creatorId === userId) return true
  if (task.reviewerId === userId) return true
  if (task.department === userDepartment) return true
  return false
}

// GET - List subtasks for a task
export const GET = withAuth(async (req, { user, params: routeParams }) => {

  const { taskId } = await routeParams!

  // SECURITY FIX: Verify user has access to the parent task
  const hasAccess = await canAccessTask(taskId, user.id, user.role || '', user.department || '')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this task' }, { status: 403 })
  }

  try {
    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(subtasks)
  } catch (error) {
    console.error('Failed to fetch subtasks:', error)
    return NextResponse.json({ error: 'Failed to fetch subtasks' }, { status: 500 })
  }
})

// POST - Add a subtask
export const POST = withAuth(async (req, { user, params: routeParams }) => {

  const { taskId } = await routeParams!

  // SECURITY FIX: Verify user has access to the parent task
  const hasAccess = await canAccessTask(taskId, user.id, user.role || '', user.department || '')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this task' }, { status: 403 })
  }

  try {
    const raw = await req.json()
    const parsed = createSubtaskSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { title } = parsed.data

    // Get max order
    const maxOrder = await prisma.subtask.aggregate({
      where: { taskId },
      _max: { order: true },
    })

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
        order: (maxOrder._max.order || 0) + 1,
      },
    })

    return NextResponse.json(subtask)
  } catch (error) {
    console.error('Failed to create subtask:', error)
    return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 })
  }
})

// PATCH - Update subtask (toggle completion)
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {

  const { taskId } = await routeParams!

  // SECURITY FIX: Verify user has access to the parent task
  const hasAccess = await canAccessTask(taskId, user.id, user.role || '', user.department || '')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this task' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { subtaskId, isCompleted, title } = body

    if (!subtaskId) {
      return NextResponse.json({ error: 'Subtask ID is required' }, { status: 400 })
    }

    // Verify subtask belongs to this task
    const subtaskCheck = await prisma.subtask.findFirst({
      where: { id: subtaskId, taskId }
    })
    if (!subtaskCheck) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (typeof isCompleted === 'boolean') {
      updateData.isCompleted = isCompleted
      updateData.completedAt = isCompleted ? new Date() : null
      updateData.completedBy = isCompleted ? user.id : null
    }
    if (title) {
      updateData.title = title
    }

    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: updateData,
    })

    return NextResponse.json(subtask)
  } catch (error) {
    console.error('Failed to update subtask:', error)
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 })
  }
})

// DELETE - Delete a subtask
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {

  const { taskId } = await routeParams!

  // SECURITY FIX: Verify user has access to the parent task
  const hasAccess = await canAccessTask(taskId, user.id, user.role || '', user.department || '')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this task' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const subtaskId = searchParams.get('subtaskId')

  if (!subtaskId) {
    return NextResponse.json({ error: 'Subtask ID is required' }, { status: 400 })
  }

  try {
    // Verify subtask belongs to this task
    const subtaskCheck = await prisma.subtask.findFirst({
      where: { id: subtaskId, taskId }
    })
    if (!subtaskCheck) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }

    await prisma.subtask.delete({
      where: { id: subtaskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete subtask:', error)
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 })
  }
})
