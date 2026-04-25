import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { GoalsClient } from './GoalsClient'

async function getMyGoals(userId: string) {
  const currentMonth = new Date()
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

  return prisma.tacticalGoal.findMany({
    where: {
      userId,
      month: monthStart,
    },
    orderBy: [{ status: 'asc' }, { priority: 'desc' }],
  })
}

async function getAllGoals() {
  const currentMonth = new Date()
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

  return prisma.tacticalGoal.findMany({
    where: { month: monthStart },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { priority: 'desc' }],
  })
}

async function getUsers() {
  return prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
    },
    orderBy: { firstName: 'asc' },
  })
}

export default async function GoalsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role)
  const [myGoals, allGoals, users] = await Promise.all([
    getMyGoals(session.user.id),
    isManager ? getAllGoals() : Promise.resolve([]),
    isManager ? getUsers() : Promise.resolve([]),
  ])

  const serializedMyGoals = myGoals.map(g => ({
    ...g,
    month: g.month.toISOString(),
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    achievedAt: g.achievedAt?.toISOString() || null,
  }))

  const serializedAllGoals = allGoals.map(g => ({
    ...g,
    month: g.month.toISOString(),
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    achievedAt: g.achievedAt?.toISOString() || null,
  }))

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Goals</h1>
          <p className="text-slate-400 mt-1">Track your tactical and strategic goals</p>
        </div>
      </div>

      <GoalsClient
        myGoals={serializedMyGoals}
        allGoals={serializedAllGoals}
        users={users}
        isManager={isManager}
      />
    </div>
  )
}
