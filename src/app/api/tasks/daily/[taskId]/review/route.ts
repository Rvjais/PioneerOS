/**
 * API Route: Manager Review for Daily Tasks
 * POST /api/tasks/daily/[taskId]/review
 *
 * Allows managers to review tasks with rating and feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Only managers can review tasks
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    if (!isManager) {
      return NextResponse.json({ error: 'Only managers can review tasks' }, { status: 403 })
    }

    const { taskId } = await routeParams!
    const body = await req.json()
    const { rating, feedback } = body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Get the task with plan and user info
    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      include: {
        plan: {
          include: {
            user: { select: { id: true, department: true } },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify task is completed
    if (task.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Can only review completed tasks' }, { status: 400 })
    }

    // Verify manager has authority over this user (same department or admin)
    const isAdmin = user.role === 'SUPER_ADMIN'
    const isSameDepartment = user.department === task.plan.user.department
    if (!isAdmin && !isSameDepartment) {
      return NextResponse.json({ error: 'Cannot review tasks from other departments' }, { status: 403 })
    }

    // Update the task with review
    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        managerReviewed: true,
        managerReviewedAt: new Date(),
        managerReviewedById: user.id,
        managerRating: rating,
        managerFeedback: feedback || null,
      },
    })

    return NextResponse.json({
      success: true,
      task: updatedTask,
    })
  } catch (error) {
    console.error('Failed to review task:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to review task' },
      { status: 500 }
    )
  }
})

// GET - Get review status for a task
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { taskId } = await routeParams!

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        managerReviewed: true,
        managerReviewedAt: true,
        managerRating: true,
        managerFeedback: true,
        managerReviewedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ review: task })
  } catch (error) {
    console.error('Failed to get task review:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get review' },
      { status: 500 }
    )
  }
})
