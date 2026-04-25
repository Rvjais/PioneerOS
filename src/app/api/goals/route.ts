import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createGoalSchema = z.object({
  level: z.string().min(1),
  parentId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  department: z.string().optional(),
  ownerId: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
  weight: z.number().optional(),
})

// Get all goals (with optional filtering)
export const GET = withAuth(async (req, { user, params }) => {
  try {
// SECURITY FIX: Filter goals based on user role
    // Only admins/managers can see MISSION and STRATEGIC level goals
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')

    const { searchParams } = new URL(req.url)
    const level = searchParams.get('level')
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const ownerId = searchParams.get('ownerId')
    const parentId = searchParams.get('parentId')

    // Build filter
    const where: Record<string, unknown> = {}
    if (level) where.level = level
    if (department) where.department = department
    if (status) where.status = status
    if (ownerId) where.ownerId = ownerId
    if (parentId) where.parentId = parentId
    if (parentId === 'null') where.parentId = null // Get root goals

    // Non-admins cannot see MISSION level goals directly
    if (!isAdmin && !level) {
      where.level = { notIn: ['MISSION'] }
    }

    const goals = await prisma.goal.findMany({
      where,
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
          select: { id: true, title: true, level: true, status: true, progress: true },
        },
        taskLinks: {
          include: {
            dailyTask: {
              select: { id: true, description: true, status: true },
            },
            workEntry: {
              select: { id: true, description: true, status: true },
            },
          },
        },
      },
      orderBy: [
        { level: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 200,
    })

    // Build hierarchy summary
    const hierarchy = {
      mission: goals.filter(g => g.level === 'MISSION').length,
      strategic: goals.filter(g => g.level === 'STRATEGIC').length,
      departmental: goals.filter(g => g.level === 'DEPARTMENTAL').length,
      team: goals.filter(g => g.level === 'TEAM').length,
      individual: goals.filter(g => g.level === 'INDIVIDUAL').length,
      task: goals.filter(g => g.level === 'TASK').length,
    }

    return NextResponse.json({
      goals: goals.map(g => ({
        ...g,
        startDate: g.startDate?.toISOString() || null,
        targetDate: g.targetDate?.toISOString() || null,
        completedDate: g.completedDate?.toISOString() || null,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      })),
      hierarchy,
    })
  } catch (error) {
    console.error('Failed to fetch goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
})

// Create a new goal
export const POST = withAuth(async (req, { user, params }) => {
  try {
const raw = await req.json()
    const parsed = createGoalSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      level,
      parentId,
      title,
      description,
      department,
      ownerId,
      startDate,
      targetDate,
      targetValue,
      unit,
      weight = 1,
    } = parsed.data

    // Validate level hierarchy
    if (parentId) {
      const parentGoal = await prisma.goal.findUnique({
        where: { id: parentId },
        select: { level: true },
      })

      if (!parentGoal) {
        return NextResponse.json({ error: 'Parent goal not found' }, { status: 400 })
      }

      // Ensure proper hierarchy
      const levelOrder = ['MISSION', 'STRATEGIC', 'DEPARTMENTAL', 'TEAM', 'INDIVIDUAL', 'TASK']
      const parentIndex = levelOrder.indexOf(parentGoal.level)
      const childIndex = levelOrder.indexOf(level)

      if (childIndex <= parentIndex) {
        return NextResponse.json(
          { error: 'Child goal level must be lower than parent goal level' },
          { status: 400 }
        )
      }
    }

    // Only SUPER_ADMIN can create MISSION level goals
    if (level === 'MISSION' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admin can create mission-level goals' },
        { status: 403 }
      )
    }

    // Only SUPER_ADMIN/MANAGER can create STRATEGIC level goals
    if (level === 'STRATEGIC' && !['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only managers can create strategic-level goals' },
        { status: 403 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        level,
        parentId,
        title,
        description,
        department,
        ownerId,
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        targetValue,
        unit,
        weight,
        status: 'NOT_STARTED',
        progress: 0,
        createdBy: user.id,
      },
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
      },
    })

    return NextResponse.json({
      success: true,
      goal: {
        ...goal,
        startDate: goal.startDate?.toISOString() || null,
        targetDate: goal.targetDate?.toISOString() || null,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to create goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
})
