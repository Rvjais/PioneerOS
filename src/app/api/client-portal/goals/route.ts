import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/goals - Get goals for client
export const GET = withClientAuth(async (req, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const periodType = searchParams.get('period')

  const where: Record<string, unknown> = {
    clientId: user.clientId,
    isVisible: true,
  }

  if (category) where.category = category
  if (status) where.status = status
  if (periodType) where.periodType = periodType

  const goals = await prisma.clientGoal.findMany({
    where,
    orderBy: [
      { displayOrder: 'asc' },
      { endDate: 'asc' },
    ],
  })

  // Calculate stats
  const stats = {
    total: goals.length,
    completed: goals.filter((g) => g.status === 'COMPLETED').length,
    inProgress: goals.filter((g) => g.status === 'IN_PROGRESS').length,
    missed: goals.filter((g) => g.status === 'MISSED').length,
    averageProgress: goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) / goals.length)
      : 0,
  }

  // Get categories for filtering
  const categories = await prisma.clientGoal.groupBy({
    by: ['category'],
    where: { clientId: user.clientId, isVisible: true },
    _count: { category: true },
  })

  return NextResponse.json({
    goals: goals.map((g) => ({
      ...g,
      progress: Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)),
      daysRemaining: Math.max(0, Math.ceil((new Date(g.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    })),
    stats,
    categories: categories.map((c) => ({ category: c.category, count: c._count.category })),
  })
}, { rateLimit: 'READ' })
