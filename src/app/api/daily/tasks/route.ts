import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createDailyTaskSchema = z.object({
  userId: z.string().optional(),
  activityType: z.string().min(1, 'Activity type is required').max(50),
  description: z.string().min(1, 'Description is required').max(1000),
  plannedHours: z.number().min(0.1).max(24).optional(),
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const parsed = createDailyTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { userId, activityType, description, plannedHours } = parsed.data

    // Use session user if userId not provided
    const targetUserId = userId || user.id

    // Security check
    if (targetUserId !== user.id && !['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get or create daily plan
    let plan = await prisma.dailyTaskPlan.findUnique({
      where: {
        userId_date: {
          userId: targetUserId,
          date: today,
        },
      },
    })

    if (!plan) {
      plan = await prisma.dailyTaskPlan.create({
        data: {
          userId: targetUserId,
          date: today,
          status: 'DRAFT',
          totalPlannedHours: 0,
          totalActualHours: 0,
          submittedBeforeHuddle: false,
          hasUnder4Hours: false,
        },
      })
    }

    // Get current task count for sort order
    const taskCount = await prisma.dailyTask.count({
      where: { planId: plan.id },
    })

    // Create task
    const task = await prisma.dailyTask.create({
      data: {
        planId: plan.id,
        activityType,
        description,
        plannedHours: plannedHours || 1,
        status: 'PLANNED',
        priority: 'MEDIUM',
        sortOrder: taskCount,
        addedAt: new Date(),
      },
    })

    // Update plan total hours
    await prisma.dailyTaskPlan.update({
      where: { id: plan.id },
      data: {
        totalPlannedHours: {
          increment: plannedHours || 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      task: {
        ...task,
        plannedStartTime: task.plannedStartTime?.toISOString() || null,
        actualStartTime: task.actualStartTime?.toISOString() || null,
        actualEndTime: task.actualEndTime?.toISOString() || null,
        addedAt: task.addedAt.toISOString(),
        startedAt: task.startedAt?.toISOString() || null,
        completedAt: task.completedAt?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')

    const targetDate = date ? new Date(date) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    const plan = await prisma.dailyTaskPlan.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: targetDate,
        },
      },
      include: {
        tasks: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
})
