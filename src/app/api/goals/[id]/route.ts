import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateGoalSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  currentValue: z.number().optional(),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  ownerId: z.string().optional(),
  department: z.string().optional(),
  weight: z.number().optional(),
}).passthrough()

// Get a single goal with full details
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, department: true },
        },
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
        parent: {
          select: { id: true, title: true, level: true },
        },
        children: {
          include: {
            owner: {
              select: { id: true, firstName: true, lastName: true },
            },
            children: {
              select: { id: true, title: true, level: true, status: true, progress: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        taskLinks: {
          include: {
            dailyTask: {
              select: {
                id: true,
                description: true,
                status: true,
                plannedHours: true,
                actualHours: true,
              },
            },
            workEntry: {
              select: {
                id: true,
                description: true,
                status: true,
                category: true,
              },
            },
          },
        },
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Calculate aggregate progress from children
    const childProgress = goal.children.length > 0
      ? goal.children.reduce((sum, child) => sum + child.progress, 0) / goal.children.length
      : null

    return NextResponse.json({
      ...goal,
      childProgress,
      startDate: goal.startDate?.toISOString() || null,
      targetDate: goal.targetDate?.toISOString() || null,
      completedDate: goal.completedDate?.toISOString() || null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
      children: goal.children.map(c => ({
        ...c,
        startDate: c.startDate?.toISOString() || null,
        targetDate: c.targetDate?.toISOString() || null,
        completedDate: c.completedDate?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    )
  }
})

// Update a goal
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = updateGoalSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    const goal = await prisma.goal.findUnique({
      where: { id },
      select: {
        level: true,
        createdBy: true,
        ownerId: true,
        parentId: true,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check permissions
    const isOwner = goal.ownerId === user.id
    const isCreator = goal.createdBy === user.id
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    if (!isOwner && !isCreator && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If status is being changed to COMPLETED
    const isCompleting = body.status === 'COMPLETED' && !body.completedDate

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        progress: body.progress,
        currentValue: body.currentValue,
        targetValue: body.targetValue,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
        completedDate: isCompleting ? new Date() : body.completedDate ? new Date(body.completedDate as string) : undefined,
        score: body.score as number | undefined,
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        parent: {
          select: { id: true, title: true, level: true },
        },
      },
    })

    // If parent exists and this goal was completed, update parent progress
    if (goal.parentId && body.status) {
      await updateParentProgress(goal.parentId)
    }

    return NextResponse.json({
      success: true,
      goal: {
        ...updatedGoal,
        startDate: updatedGoal.startDate?.toISOString() || null,
        targetDate: updatedGoal.targetDate?.toISOString() || null,
        completedDate: updatedGoal.completedDate?.toISOString() || null,
        createdAt: updatedGoal.createdAt.toISOString(),
        updatedAt: updatedGoal.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to update goal:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    )
  }
})

// Delete a goal
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const goal = await prisma.goal.findUnique({
      where: { id },
      select: {
        level: true,
        createdBy: true,
        ownerId: true,
        children: { select: { id: true } },
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Only creator or managers can delete
    const isCreator = goal.createdBy === user.id
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    if (!isCreator && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Cannot delete goals with children
    if (goal.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete goal with child goals. Delete children first.' },
        { status: 400 }
      )
    }

    // Soft delete - change status to CANCELLED
    await prisma.goal.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
})

// Helper to update parent goal progress based on children
async function updateParentProgress(parentId: string) {
  const children = await prisma.goal.findMany({
    where: { parentId },
    select: { progress: true, weight: true, status: true },
  })

  if (children.length === 0) return

  // Calculate weighted average progress
  const totalWeight = children.reduce((sum, c) => sum + c.weight, 0)
  const weightedProgress = children.reduce((sum, c) => sum + (c.progress * c.weight), 0)
  const newProgress = Math.round(weightedProgress / totalWeight)

  // Determine status based on children
  const allCompleted = children.every(c => c.status === 'COMPLETED')
  const anyInProgress = children.some(c => c.status === 'IN_PROGRESS')
  const anyAtRisk = children.some(c => c.status === 'AT_RISK')

  let newStatus: string | undefined
  if (allCompleted) {
    newStatus = 'COMPLETED'
  } else if (anyAtRisk) {
    newStatus = 'AT_RISK'
  } else if (anyInProgress) {
    newStatus = 'IN_PROGRESS'
  }

  await prisma.goal.update({
    where: { id: parentId },
    data: {
      progress: newProgress,
      ...(newStatus && { status: newStatus }),
      ...(allCompleted && { completedDate: new Date() }),
    },
  })

  // Recursively update grandparent
  const parent = await prisma.goal.findUnique({
    where: { id: parentId },
    select: { parentId: true },
  })

  if (parent?.parentId) {
    await updateParentProgress(parent.parentId)
  }
}
