/**
 * API Route: Daily Task History
 * GET /api/tasks/daily/history
 *
 * Returns tasks grouped by month for easy navigation
 */

import { NextRequest, NextResponse } from 'next/server'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

interface MonthlyTaskGroup {
  month: string // YYYY-MM format
  monthLabel: string // "January 2025"
  totalTasks: number
  completedTasks: number
  totalPlannedHours: number
  totalActualHours: number
  avgManagerRating: number | null
  plans: {
    id: string
    date: string
    status: string
    tasks: {
      id: string
      description: string
      activityType: string
      status: string
      plannedHours: number
      actualHours: number | null
      proofUrl: string | null
      clientName: string | null
      managerReviewed: boolean
      managerRating: number | null
      managerFeedback: string | null
    }[]
  }[]
}

function serializeDate(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const months = parseInt(searchParams.get('months') || '6') // Default to 6 months
    const userId = searchParams.get('userId') || user.id

    // Only managers can view other users' history
    if (userId !== user.id) {
      const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
      if (!isManager) {
        return NextResponse.json({ error: 'Cannot view other users history' }, { status: 403 })
      }
    }

    // Calculate date range (from X months ago to now)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    startDate.setDate(1) // Start from first of the month
    startDate.setHours(0, 0, 0, 0)

    // Fetch all plans with tasks for the date range
    const plans = await prisma.dailyTaskPlan.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tasks: {
          include: {
            client: { select: { id: true, name: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    })

    // Group by month
    const monthlyGroups: Map<string, MonthlyTaskGroup> = new Map()

    for (const plan of plans) {
      const planDate = new Date(plan.date)
      const monthKey = `${planDate.getFullYear()}-${String(planDate.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = formatDateDDMMYYYY(planDate)

      if (!monthlyGroups.has(monthKey)) {
        monthlyGroups.set(monthKey, {
          month: monthKey,
          monthLabel,
          totalTasks: 0,
          completedTasks: 0,
          totalPlannedHours: 0,
          totalActualHours: 0,
          avgManagerRating: null,
          plans: [],
        })
      }

      const group = monthlyGroups.get(monthKey)!

      // Add plan to group
      group.plans.push({
        id: plan.id,
        date: serializeDate(plan.date)!,
        status: plan.status,
        tasks: plan.tasks.map((task) => ({
          id: task.id,
          description: task.description,
          activityType: task.activityType,
          status: task.status,
          plannedHours: task.plannedHours,
          actualHours: task.actualHours,
          proofUrl: task.proofUrl,
          clientName: task.client?.name || null,
          managerReviewed: task.managerReviewed,
          managerRating: task.managerRating,
          managerFeedback: task.managerFeedback,
        })),
      })

      // Update aggregates
      group.totalTasks += plan.tasks.length
      group.completedTasks += plan.tasks.filter((t) => t.status === 'COMPLETED').length
      group.totalPlannedHours += plan.tasks.reduce((sum, t) => sum + t.plannedHours, 0)
      group.totalActualHours += plan.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
    }

    // Calculate average manager rating per month
    for (const group of monthlyGroups.values()) {
      const ratings = group.plans
        .flatMap((p) => p.tasks)
        .filter((t) => t.managerRating !== null)
        .map((t) => t.managerRating!)

      if (ratings.length > 0) {
        group.avgManagerRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
      }
    }

    // Convert to array and sort by month (newest first)
    const history = Array.from(monthlyGroups.values()).sort((a, b) =>
      b.month.localeCompare(a.month)
    )

    return NextResponse.json({
      history,
      totalMonths: history.length,
    })
  } catch (error) {
    console.error('Failed to fetch task history:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch history' },
      { status: 500 }
    )
  }
})
