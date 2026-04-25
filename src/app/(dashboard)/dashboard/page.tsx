import { unstable_noStore as noStore } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db/prisma'
import { DashboardClient } from './DashboardClient'
import { cache, cacheKeys, cacheTTL } from '@/server/cache/redis'

async function getDashboardData(userId: string, department: string, isManager: boolean) {
  // Use cache for dashboard data (2 minute TTL for fresh data)
  const cacheKey = cacheKeys.dashboard(userId, 'main')

  return cache.getOrSet(cacheKey, async () => {
    return fetchDashboardData(userId, department, isManager)
  }, cacheTTL.SHORT * 2) // 2 minutes
}

async function fetchDashboardData(userId: string, department: string, isManager: boolean) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get user's tasks
  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: { not: 'COMPLETED' },
    },
    include: {
      client: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    take: 10,
  })

  // Get task counts
  const [assignedCount, inProgressCount, dueTodayCount] = await Promise.all([
    prisma.task.count({ where: { assigneeId: userId, status: { not: 'COMPLETED' } } }),
    prisma.task.count({ where: { assigneeId: userId, status: 'IN_PROGRESS' } }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: 'COMPLETED' },
        dueDate: { gte: todayStart, lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  // Get clients user is assigned to (as pseudo-projects)
  const clientAssignments = await prisma.clientTeamMember.findMany({
    where: {
      userId,
      client: { status: { not: 'CHURNED' } },
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          status: true,
          _count: { select: { tasks: true } }
        }
      },
    },
    take: 5,
  })

  // Get learning progress for this month
  const learningLogs = await prisma.learningLog.findMany({
    where: {
      userId,
      month: { gte: monthStart },
    },
  })
  const learningMinutes = learningLogs.reduce((sum, log) => sum + log.minutesWatched, 0)
  const learningHours = Math.round((learningMinutes / 60) * 10) / 10

  return {
    tasks: tasks.map(t => ({
      id: t.id,
      title: t.title,
      project: t.client?.name || 'Internal Task',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() || null,
    })),
    stats: {
      assigned: assignedCount,
      inProgress: inProgressCount,
      dueToday: dueTodayCount,
    },
    projects: clientAssignments.map(ca => ({
      id: ca.client.id,
      name: ca.client.name,
      client: ca.client.name,
      progress: 0,
      status: ca.client.status,
      taskCount: ca.client._count.tasks,
    })),
    learning: {
      hours: learningHours,
      target: 6,
      isCompliant: learningHours >= 6,
    },
  }
}

export default async function DashboardPage() {
  noStore()
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const department = session.user.department
  const role = session.user.role
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(role)
  const userName = session.user.firstName || 'User'

  const data = await getDashboardData(userId, department, isManager)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <DashboardClient
      data={data}
      userName={userName}
      department={department}
      today={today}
      isManager={isManager}
    />
  )
}
