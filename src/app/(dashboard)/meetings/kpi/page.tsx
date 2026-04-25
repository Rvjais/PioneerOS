import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { KPIClient } from './KPIClient'

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function TacticalKPIPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const params = await searchParams
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(session.user.role)

  // Get month from query params or default to current
  const now = new Date()
  let monthStart: Date

  if (params.month) {
    const [year, month] = params.month.split('-').map(Number)
    monthStart = new Date(year, month - 1, 1)
  } else {
    monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const currentMonth = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`

  // Get all active users with their scores
  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
      accountabilityScores: {
        where: { month: monthStart },
        take: 1,
      },
      tacticalGoals: {
        where: { month: monthStart },
      },
      assignedTasks: {
        where: {
          createdAt: { gte: monthStart },
          status: 'COMPLETED',
        },
      },
    },
    orderBy: { firstName: 'asc' },
  })

  // Get all goals for the month
  const allGoals = await prisma.tacticalGoal.findMany({
    where: { month: monthStart },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  // Get unique departments
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))] as string[]

  const scoreboard = users.map(u => {
    const accScore = u.accountabilityScores[0]
    const totalGoals = u.tacticalGoals.length
    const achievedGoals = u.tacticalGoals.filter(g => g.status === 'ACHIEVED').length
    const goalsScore = totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0
    const managerRating = accScore?.managerRating || null
    const accountabilityScore = accScore?.finalScore || 0

    // Weighted average: Accountability 40%, Manager Rating 30%, Goals 30%
    const managerRatingNorm = managerRating ? managerRating * 10 : 0
    const monthlyAvg = managerRating
      ? (accountabilityScore * 0.4) + (managerRatingNorm * 0.3) + (goalsScore * 0.3)
      : (accountabilityScore * 0.5) + (goalsScore * 0.5)

    return {
      id: u.id,
      name: `${u.firstName} ${u.lastName || ''}`.trim(),
      department: u.department || 'GENERAL',
      tasksCompleted: u.assignedTasks.length,
      accountabilityScore: Math.round(accountabilityScore),
      managerRating,
      managerNotes: accScore?.managerNotes || null,
      goalsAchieved: achievedGoals,
      totalGoals,
      goalsScore: Math.round(goalsScore),
      monthlyAvg: Math.round(monthlyAvg),
    }
  }).sort((a, b) => b.monthlyAvg - a.monthlyAvg)

  const goals = allGoals.map(g => ({
    id: g.id,
    userId: g.userId,
    title: g.title,
    description: g.description,
    category: g.category,
    priority: g.priority,
    status: g.status,
    targetValue: g.targetValue,
    currentValue: g.currentValue,
  }))

  return (
    <KPIClient
      scoreboard={scoreboard}
      currentMonth={currentMonth}
      isManager={isManager}
      departments={departments}
      goals={goals}
    />
  )
}
