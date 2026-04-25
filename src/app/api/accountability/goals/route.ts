import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// GET - Get tactical goals
export const GET = withAuth(async (req, { user, params }) => {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const monthParam = searchParams.get('month')
    const status = searchParams.get('status')

    const month = monthParam ? new Date(monthParam) : new Date()
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

    const whereClause: Record<string, unknown> = {
      month: monthStart,
    }

    if (userId) {
      whereClause.userId = userId
    } else {
      // Default to current user's goals
      whereClause.userId = user.id
    }

    if (status) {
      whereClause.status = status
    }

    const goals = await prisma.tacticalGoal.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })

    // Calculate progress summary
    const summary = {
      total: goals.length,
      achieved: goals.filter((g) => g.status === 'ACHIEVED').length,
      inProgress: goals.filter((g) => g.status === 'IN_PROGRESS').length,
      missed: goals.filter((g) => g.status === 'MISSED').length,
    }

    return NextResponse.json({ goals, summary })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Create new goal (managers only)
export const POST = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Only managers can set goals' }, { status: 401 })
    }

    const body = await req.json()
    const postSchema = z.object({
      userId: z.string().min(1),
      title: z.string().min(1).max(500),
      description: z.string().max(2000).optional(),
      targetValue: z.number().optional(),
      category: z.string().min(1).max(100),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
      month: z.string().optional(),
    })
    const postResult = postSchema.safeParse(body)
    if (!postResult.success) return NextResponse.json({ error: postResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      userId,
      title,
      description,
      targetValue,
      category,
      priority,
      month: monthParam,
    } = postResult.data

    const month = monthParam ? new Date(monthParam) : new Date()
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

    const goal = await prisma.tacticalGoal.create({
      data: {
        userId,
        title,
        description,
        targetValue,
        category,
        priority: priority || 'MEDIUM',
        month: monthStart,
        setBy: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId,
        type: 'GENERAL',
        title: 'New Goal Assigned',
        message: `You have a new goal: ${title}`,
        link: '/performance/goals',
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update goal (progress or status)
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
    const body = await req.json()
    const patchSchema = z.object({
      id: z.string().min(1),
      currentValue: z.number().optional(),
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'MISSED']).optional(),
      reviewNotes: z.string().max(2000).optional(),
    })
    const patchResult = patchSchema.safeParse(body)
    if (!patchResult.success) return NextResponse.json({ error: patchResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { id, currentValue, status, reviewNotes } = patchResult.data

    // Check if user owns this goal or is a manager
    const existingGoal = await prisma.tacticalGoal.findUnique({
      where: { id },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const canUpdate =
      existingGoal.userId === user.id ||
      ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    if (!canUpdate) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updateData: Record<string, unknown> = {}

    if (currentValue !== undefined) {
      updateData.currentValue = currentValue
    }

    if (status) {
      updateData.status = status
      if (status === 'ACHIEVED') {
        updateData.achievedAt = new Date()
      }
    }

    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes
    }

    const goal = await prisma.tacticalGoal.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
