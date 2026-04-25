import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import type { AccountabilityScore } from '@prisma/client'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const calculateSchema = z.object({
  month: z.string().optional(),
  userId: z.string().optional(),
})

// Department baselines (expected units per ₹30,000 salary)
const DEPARTMENT_BASELINES: Record<string, { unitType: string; baseUnits: number; baseSalary: number }> = {
  OPERATIONS: { unitType: 'CLIENTS', baseUnits: 10, baseSalary: 30000 },
  SEO: { unitType: 'CLIENTS', baseUnits: 8, baseSalary: 30000 },
  SOCIAL_MEDIA: { unitType: 'CLIENTS', baseUnits: 6, baseSalary: 30000 },
  SOCIAL: { unitType: 'CLIENTS', baseUnits: 6, baseSalary: 30000 }, // Alias for SOCIAL_MEDIA
  DESIGN: { unitType: 'CREATIVES', baseUnits: 100, baseSalary: 30000 },
  ADS: { unitType: 'CAMPAIGNS', baseUnits: 10, baseSalary: 30000 },
  DEVELOPMENT: { unitType: 'PAGES', baseUnits: 15, baseSalary: 30000 },
  WEB: { unitType: 'PAGES', baseUnits: 15, baseSalary: 30000 }, // Alias for DEVELOPMENT
  CONTENT: { unitType: 'POSTS', baseUnits: 50, baseSalary: 30000 },
  ACCOUNTS: { unitType: 'INVOICES', baseUnits: 30, baseSalary: 30000 },
  HR: { unitType: 'TASKS', baseUnits: 50, baseSalary: 30000 },
  SALES: { unitType: 'LEADS', baseUnits: 20, baseSalary: 30000 },
}

// Calculate expected units based on salary
function calculateExpectedUnits(department: string, monthlySalary: number): number {
  const baseline = DEPARTMENT_BASELINES[department]
  if (!baseline) return 0

  // Scale proportionally with salary
  const scaleFactor = monthlySalary / baseline.baseSalary
  return Math.round(baseline.baseUnits * scaleFactor)
}

// Calculate delivered units from work deliverables
async function calculateDeliveredUnits(userId: string, month: Date, department: string): Promise<number> {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  // Count based on department type
  const baseline = DEPARTMENT_BASELINES[department]
  if (!baseline) return 0

  if (baseline.unitType === 'CLIENTS') {
    // Count active clients assigned
    const clientCount = await prisma.clientTeamMember.count({
      where: {
        userId,
        client: {
          status: 'ACTIVE',
        },
      },
    })
    return clientCount
  } else if (baseline.unitType === 'CREATIVES') {
    // Count work deliverables for design
    const deliverables = await prisma.workDeliverable.aggregate({
      where: {
        userId,
        month: { gte: monthStart, lte: monthEnd },
        status: 'COMPLETED',
        category: { in: ['DESIGN', 'VIDEO'] },
      },
      _sum: { quantity: true },
    })
    return deliverables._sum.quantity || 0
  } else {
    // Generic task count
    const tasks = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: 'COMPLETED',
        completedAt: { gte: monthStart, lte: monthEnd },
      },
    })
    return tasks
  }
}

// Calculate goals progress
async function calculateGoalsProgress(userId: string, month: Date) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

  const goals = await prisma.tacticalGoal.findMany({
    where: {
      userId,
      month: monthStart,
    },
  })

  const totalGoals = goals.length
  const goalsAchieved = goals.filter((g) => g.status === 'ACHIEVED').length

  return { totalGoals, goalsAchieved }
}

// POST - Calculate and update accountability scores
export const POST = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = calculateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { month: monthParam, userId: targetUserId } = parsed.data

    const month = monthParam ? new Date(monthParam) : new Date()
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)

    // Get users to calculate for (specific user or all operations team)
    const userWhere: Record<string, unknown> = {
      status: 'ACTIVE',
      deletedAt: null,
      // Exclude MASH (assuming MASH means Management, Admin, Sales, HR)
      role: { notIn: ['SUPER_ADMIN'] },
    }

    if (targetUserId) {
      userWhere.id = targetUserId
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        department: true,
        role: true,
      },
    })

    const results: AccountabilityScore[] = []

    for (const user of users) {
      // Look up salary from the employee's onboarding proposal
      const proposal = await prisma.employeeProposal.findFirst({
        where: { userId: user.id },
        select: { offeredSalary: true },
        orderBy: { createdAt: 'desc' },
      })
      const estimatedSalary = proposal?.offeredSalary || (user.role === 'MANAGER' ? 50000 : 30000)

      const expectedUnits = calculateExpectedUnits(user.department, estimatedSalary)
      const deliveredUnits = await calculateDeliveredUnits(user.id, month, user.department)
      const { totalGoals, goalsAchieved } = await calculateGoalsProgress(user.id, month)

      // Calculate scores
      const unitScore = expectedUnits > 0 ? Math.min((deliveredUnits / expectedUnits) * 100, 150) : 0
      const growthScore = totalGoals > 0 ? (goalsAchieved / totalGoals) * 100 : 0

      // Final score: 70% unit score + 30% growth score
      const finalScore = unitScore * 0.7 + growthScore * 0.3

      // Upsert the score
      const score = await prisma.accountabilityScore.upsert({
        where: {
          userId_month: {
            userId: user.id,
            month: monthStart,
          },
        },
        update: {
          expectedUnits,
          deliveredUnits,
          unitScore,
          goalsAchieved,
          totalGoals,
          growthScore,
          finalScore,
          calculatedAt: new Date(),
        },
        create: {
          userId: user.id,
          month: monthStart,
          expectedUnits,
          deliveredUnits,
          unitScore,
          goalsAchieved,
          totalGoals,
          growthScore,
          finalScore,
        },
      })

      results.push(score)
    }

    // Update ranks
    const allScores = await prisma.accountabilityScore.findMany({
      where: { month: monthStart },
      orderBy: { finalScore: 'desc' },
    })

    for (let i = 0; i < allScores.length; i++) {
      await prisma.accountabilityScore.update({
        where: { id: allScores[i].id },
        data: { companyRank: i + 1 },
      })
    }

    return NextResponse.json({
      success: true,
      calculated: results.length,
      month: monthStart.toISOString(),
    })
  } catch (error) {
    console.error('Error calculating accountability scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
