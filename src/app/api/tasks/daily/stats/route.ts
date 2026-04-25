import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { ADMIN_ROLES } from '@/shared/constants/roles'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'daily' // daily, weekly, monthly
    const userId = searchParams.get('userId') || user.id

    // Authorization check: only allow viewing other users' stats for admins/managers
    if (userId !== user.id && !ADMIN_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'weekly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'monthly':
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'daily':
      default:
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    // Get task counts
    // Note: Use completedAt for breakthrough/breakdown stats since these are determined at completion time
    const [totalTasks, breakthroughTasks, breakdownTasks, completedTasks] = await Promise.all([
      prisma.dailyTask.count({
        where: {
          plan: { userId },
          createdAt: { gte: startDate },
        },
      }),
      prisma.dailyTask.count({
        where: {
          plan: { userId },
          isBreakthrough: true,
          completedAt: { gte: startDate },
        },
      }),
      prisma.dailyTask.count({
        where: {
          plan: { userId },
          isBreakdown: true,
          completedAt: { gte: startDate },
        },
      }),
      prisma.dailyTask.count({
        where: {
          plan: { userId },
          status: { in: ['COMPLETED', 'BREAKDOWN'] },
          completedAt: { gte: startDate },
        },
      }),
    ])

    // Calculate rates
    const breakthroughRate = completedTasks > 0
      ? Math.round((breakthroughTasks / completedTasks) * 100)
      : 0
    const breakdownRate = completedTasks > 0
      ? Math.round((breakdownTasks / completedTasks) * 100)
      : 0

    // Get recent trends (last 7 days)
    const trends: Array<{ date: string; breakthroughs: number; breakdowns: number }> = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(now.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const [dayBreakthroughs, dayBreakdowns] = await Promise.all([
        prisma.dailyTask.count({
          where: {
            plan: { userId },
            isBreakthrough: true,
            completedAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.dailyTask.count({
          where: {
            plan: { userId },
            isBreakdown: true,
            completedAt: { gte: dayStart, lte: dayEnd },
          },
        }),
      ])

      trends.push({
        date: dayStart.toISOString().split('T')[0],
        breakthroughs: dayBreakthroughs,
        breakdowns: dayBreakdowns,
      })
    }

    return NextResponse.json({
      period,
      stats: {
        total: totalTasks,
        completed: completedTasks,
        breakthroughs: breakthroughTasks,
        breakdowns: breakdownTasks,
        breakthroughRate,
        breakdownRate,
      },
      trends,
    })
  } catch (error) {
    console.error('Failed to fetch breakthrough stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
