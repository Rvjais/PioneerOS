import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createQuarterlyGoalSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  quarter: z.number().min(1).max(4),
  year: z.number().min(2024),
  clientId: z.string().optional(),
  ownerId: z.string().min(1),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
})

const bulkCreateSchema = z.object({
  goals: z.array(createQuarterlyGoalSchema),
})

const reviewSchema = z.object({
  goalId: z.string().min(1),
  achievementNotes: z.string().min(1),
  selfRating: z.number().min(1).max(5),
  currentValue: z.number().optional(),
  progress: z.number().min(0).max(100),
})

function getQuarterDates(quarter: number, year: number) {
  const startMonth = (quarter - 1) * 3
  const startDate = new Date(year, startMonth, 1)
  const targetDate = new Date(year, startMonth + 3, 0) // Last day of quarter
  return { startDate, targetDate }
}

function getCurrentQuarter(): { quarter: number; year: number } {
  const now = new Date()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  return { quarter, year: now.getFullYear() }
}

// GET - Fetch quarterly goals for a user/quarter
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const quarter = parseInt(searchParams.get('quarter') || '') || getCurrentQuarter().quarter
    const year = parseInt(searchParams.get('year') || '') || getCurrentQuarter().year
    const userId = searchParams.get('userId') || user.id
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')

    // Non-admins can only see their own goals
    const targetUserId = isAdmin ? userId : user.id

    // Fetch the user's info and role
    const dbUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, firstName: true, lastName: true, role: true, department: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch quarterly goals
    const goals = await prisma.goal.findMany({
      where: {
        ownerId: targetUserId,
        quarter,
        year,
        category: { not: null },
        status: { not: 'CANCELLED' },
      },
      include: {
        client: {
          select: { id: true, name: true, status: true, logoUrl: true },
        },
        owner: {
          select: { id: true, firstName: true, lastName: true, department: true, role: true },
        },
      },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    })

    // Fetch clients assigned to this user (for client goal dropdown)
    const clientAssignments = await prisma.clientTeamMember.findMany({
      where: { userId: targetUserId },
      include: {
        client: {
          select: { id: true, name: true, status: true, logoUrl: true },
        },
      },
    })

    const assignedClients = clientAssignments
      .filter(a => a.client.status === 'ACTIVE')
      .map(a => ({
        id: a.client.id,
        name: a.client.name,
        logoUrl: a.client.logoUrl,
        role: a.role,
      }))

    // Determine if this is a client-facing role
    const nonClientRoles = ['HR', 'ACCOUNTS', 'MANAGER', 'SALES', 'SUPER_ADMIN']
    const isClientFacing = !nonClientRoles.includes(dbUser.role || '') || assignedClients.length > 0

    // Group goals by category
    const goalsByCategory: Record<string, typeof goals> = {}
    for (const goal of goals) {
      const cat = goal.category || 'OTHER'
      if (!goalsByCategory[cat]) goalsByCategory[cat] = []
      goalsByCategory[cat].push(goal)
    }

    // Calculate overall stats
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length
    const avgProgress = totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0
    const reviewedGoals = goals.filter(g => g.achievementNotes).length

    return NextResponse.json({
      user: dbUser,
      quarter,
      year,
      isClientFacing,
      assignedClients,
      goals: goals.map(g => ({
        ...g,
        startDate: g.startDate?.toISOString() || null,
        targetDate: g.targetDate?.toISOString() || null,
        completedDate: g.completedDate?.toISOString() || null,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      })),
      goalsByCategory,
      stats: {
        total: totalGoals,
        completed: completedGoals,
        avgProgress,
        reviewed: reviewedGoals,
      },
    })
  } catch (error) {
    console.error('Failed to fetch quarterly goals:', error)
    return NextResponse.json({ error: 'Failed to fetch quarterly goals' }, { status: 500 })
  }
})

// POST - Create quarterly goals (single or bulk)
export const POST = withAuth(async (req, { user, params }) => {
  try {
const raw = await req.json()

    // Check if bulk or single
    if (raw.goals) {
      const parsed = bulkCreateSchema.safeParse(raw)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
      }

      const createdGoals: Awaited<ReturnType<typeof prisma.goal.create>>[] = []
      for (const goalData of parsed.data.goals) {
        const { startDate, targetDate } = getQuarterDates(goalData.quarter, goalData.year)
        const goal = await prisma.goal.create({
          data: {
            level: 'INDIVIDUAL',
            category: goalData.category,
            quarter: goalData.quarter,
            year: goalData.year,
            title: goalData.title,
            description: goalData.description,
            clientId: goalData.clientId || null,
            ownerId: goalData.ownerId,
            targetValue: goalData.targetValue || null,
            unit: goalData.unit || null,
            startDate,
            targetDate,
            status: 'NOT_STARTED',
            progress: 0,
            createdBy: user.id,
          },
        })
        createdGoals.push(goal)
      }

      return NextResponse.json({ success: true, goals: createdGoals, count: createdGoals.length })
    }

    // Single goal creation
    const parsed = createQuarterlyGoalSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const { startDate, targetDate } = getQuarterDates(parsed.data.quarter, parsed.data.year)

    const goal = await prisma.goal.create({
      data: {
        level: 'INDIVIDUAL',
        category: parsed.data.category,
        quarter: parsed.data.quarter,
        year: parsed.data.year,
        title: parsed.data.title,
        description: parsed.data.description,
        clientId: parsed.data.clientId || null,
        ownerId: parsed.data.ownerId,
        targetValue: parsed.data.targetValue || null,
        unit: parsed.data.unit || null,
        startDate,
        targetDate,
        status: 'NOT_STARTED',
        progress: 0,
        createdBy: user.id,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json({ success: true, goal })
  } catch (error) {
    console.error('Failed to create quarterly goals:', error)
    return NextResponse.json({ error: 'Failed to create quarterly goals' }, { status: 500 })
  }
})

// PATCH - Submit end-of-quarter review for a goal
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
const raw = await req.json()
    const parsed = reviewSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const goal = await prisma.goal.findUnique({
      where: { id: parsed.data.goalId },
      select: { ownerId: true, createdBy: true },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Only owner or admin can submit review
    const isOwner = goal.ownerId === user.id
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.goal.update({
      where: { id: parsed.data.goalId },
      data: {
        achievementNotes: parsed.data.achievementNotes,
        selfRating: parsed.data.selfRating,
        progress: parsed.data.progress,
        currentValue: parsed.data.currentValue,
        status: parsed.data.progress >= 100 ? 'COMPLETED' : parsed.data.progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        completedDate: parsed.data.progress >= 100 ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, goal: updated })
  } catch (error) {
    console.error('Failed to submit review:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
})
