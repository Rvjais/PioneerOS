import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { requireAuth, isAuthError, type UserRole } from '@/server/auth/rbac'

const SALES_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'SALES']

// GET /api/sales/goals - List goals for current user or all (managers)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth({ roles: SALES_ROLES })
    if (isAuthError(auth)) return auth.error

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(auth.user.role)

    const where: Record<string, unknown> = {}

    // Non-managers can only see their own goals
    if (!isManager) {
      where.userId = auth.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (status) where.status = status
    if (month) {
      const date = new Date(month)
      const start = new Date(date.getFullYear(), date.getMonth(), 1)
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      where.month = { gte: start, lt: end }
    }

    const goals = await prisma.tacticalGoal.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })

    // Compute summary stats
    const total = goals.length
    const achieved = goals.filter(g => g.status === 'ACHIEVED').length
    const inProgress = goals.filter(g => g.status === 'IN_PROGRESS').length
    const missed = goals.filter(g => g.status === 'MISSED').length

    return NextResponse.json({ goals, stats: { total, achieved, inProgress, missed } })
  } catch (error) {
    console.error('Failed to fetch goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sales/goals - Create a new goal (managers only)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN', 'MANAGER'] })
    if (isAuthError(auth)) return auth.error

    const body = await req.json()
    const { userId, month, title, description, targetValue, category, priority } = body

    if (!userId || !month || !title || !category) {
      return NextResponse.json({ error: 'Missing required fields: userId, month, title, category' }, { status: 400 })
    }

    const goal = await prisma.tacticalGoal.create({
      data: {
        userId,
        month: new Date(month),
        title,
        description: description || null,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        currentValue: 0,
        category,
        priority: priority || 'MEDIUM',
        status: 'IN_PROGRESS',
        setBy: auth.user.id,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error('Failed to create goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/sales/goals - Update a goal
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth({ roles: SALES_ROLES })
    if (isAuthError(auth)) return auth.error

    const body = await req.json()
    const { id, currentValue, status, reviewNotes } = body

    if (!id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 })
    }

    const existing = await prisma.tacticalGoal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(auth.user.role)
    if (!isManager && existing.userId !== auth.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const data: Record<string, unknown> = {}
    if (currentValue !== undefined) data.currentValue = parseFloat(currentValue)
    if (status) {
      data.status = status
      if (status === 'ACHIEVED') data.achievedAt = new Date()
    }
    if (reviewNotes !== undefined) data.reviewNotes = reviewNotes

    const goal = await prisma.tacticalGoal.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Failed to update goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
