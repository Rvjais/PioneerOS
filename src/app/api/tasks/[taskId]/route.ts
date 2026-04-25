import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

type RouteParams = {
  params: Promise<{ taskId: string }>
}

// Roles that can view/edit all tasks
const MANAGER_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD']

// Check if user has access to a task
function canAccessTask(
  task: { assigneeId: string | null; creatorId: string; reviewerId: string | null; department: string },
  user: { id: string; role: string; department: string }
): boolean {
  // Managers can access all tasks
  if (MANAGER_ROLES.includes(user.role)) return true
  // Assignee, creator, or reviewer can access
  if (task.assigneeId === user.id) return true
  if (task.creatorId === user.id) return true
  if (task.reviewerId === user.id) return true
  // Freelancers and interns cannot see other department tasks
  if (['FREELANCER', 'INTERN'].includes(user.role)) return false
  // Same department can view
  if (task.department === user.department) return true
  return false
}

// Validation schema for task updates
const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  department: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'REVISION', 'COMPLETED', 'CANCELLED']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  reviewerId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  qaStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  qaComments: z.string().max(2000).optional().nullable(),
  estimatedHours: z.number().min(0).max(1000).optional().nullable(),
  actualHours: z.number().min(0).max(1000).optional().nullable(),
}).strict()

// GET - Get single task
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check authorization
    const authUser = user as { id: string; role: string; department: string }
    if (!canAccessTask(task, authUser)) {
      return NextResponse.json({ error: 'Access denied to this task' }, { status: 403 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update task
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    // Parse and validate body
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Validate with Zod
    const validation = updateTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const validatedData = validation.data

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check authorization
    const authUser = user as { id: string; role: string; department: string }
    if (!canAccessTask(existingTask, authUser)) {
      return NextResponse.json({ error: 'Access denied to this task' }, { status: 403 })
    }

    // Validate status transitions
    if (validatedData.status && validatedData.status !== existingTask.status) {
      const VALID_TRANSITIONS: Record<string, string[]> = {
        TODO: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['REVIEW', 'COMPLETED', 'CANCELLED'],
        REVIEW: ['REVISION', 'COMPLETED', 'CANCELLED'],
        REVISION: ['IN_PROGRESS', 'REVIEW'],
        COMPLETED: [],
        CANCELLED: [],
      }
      const allowed = VALID_TRANSITIONS[existingTask.status] || []
      if (!allowed.includes(validatedData.status)) {
        return NextResponse.json(
          { error: `Invalid status transition: ${existingTask.status} → ${validatedData.status}` },
          { status: 400 }
        )
      }
    }

    // Build update data from validated input
    const updateData: Record<string, unknown> = {}
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.department !== undefined) updateData.department = validatedData.department
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      // Mark completion time when task is marked as completed
      if (validatedData.status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null
    }
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null
    }
    if (validatedData.assigneeId !== undefined) updateData.assigneeId = validatedData.assigneeId
    if (validatedData.reviewerId !== undefined) updateData.reviewerId = validatedData.reviewerId
    if (validatedData.clientId !== undefined) updateData.clientId = validatedData.clientId
    if (validatedData.qaStatus !== undefined) {
      updateData.qaStatus = validatedData.qaStatus
      updateData.qaReviewedAt = new Date()
    }
    if (validatedData.qaComments !== undefined) updateData.qaComments = validatedData.qaComments
    if (validatedData.estimatedHours !== undefined) updateData.estimatedHours = validatedData.estimatedHours
    if (validatedData.actualHours !== undefined) updateData.actualHours = validatedData.actualHours

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Notify assignee if assignment changed
    if (validatedData.assigneeId && validatedData.assigneeId !== existingTask.assigneeId && validatedData.assigneeId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: validatedData.assigneeId,
          type: 'TASK',
          title: 'Task Assigned to You',
          message: `You have been assigned: ${task.title}`,
          link: `/tasks/${taskId}`,
          priority: task.priority === 'URGENT' ? 'URGENT' : 'NORMAL',
        },
      })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE - Delete task
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Only allow creator or admin to delete
    if (existingTask.creatorId !== user.id && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
