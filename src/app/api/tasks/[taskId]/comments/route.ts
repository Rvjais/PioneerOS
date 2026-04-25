import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const TaskCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be 5000 characters or less'),
  type: z.enum(['COMMENT', 'STATUS_CHANGE', 'ASSIGNMENT', 'SYSTEM']).optional().default('COMMENT'),
})

// GET - List comments for a task
export const GET = withAuth(async (req, { user, params: routeParams }) => {

  const { taskId } = await routeParams!

  try {
    // SECURITY FIX: Verify user has access to this task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, assigneeId: true, creatorId: true, department: true }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user can access this task (assignee, creator, same department, or admin)
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')
    const isAssignee = task.assigneeId === user.id
    const isCreator = task.creatorId === user.id
    const sameDepartment = task.department === user.department

    if (!isAdmin && !isAssignee && !isCreator && !sameDepartment) {
      return NextResponse.json({ error: 'Access denied to this task' }, { status: 403 })
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100, // Limit to latest 100 comments
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
})

// POST - Add a comment
export const POST = withAuth(async (req, { user, params: routeParams }) => {

  const { taskId } = await routeParams!

  try {
    // SECURITY FIX: Verify user has access to this task before adding comment
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, assigneeId: true, creatorId: true, department: true }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user can access this task
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')
    const isAssignee = task.assigneeId === user.id
    const isCreator = task.creatorId === user.id
    const sameDepartment = task.department === user.department

    if (!isAdmin && !isAssignee && !isCreator && !sameDepartment) {
      return NextResponse.json({ error: 'Access denied to this task' }, { status: 403 })
    }

    const body = await req.json()
    const parseResult = TaskCommentSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { content, type } = parseResult.data

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: user.id,
        content,
        type,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
})
