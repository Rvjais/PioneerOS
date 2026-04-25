import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import MyDayClient from './MyDayClient'

export default async function MyDayPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const userRole = session.user.role as string

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
      role: true,
      joiningDate: true,
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get today's plan
  const todayPlan = await prisma.dailyTaskPlan.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    include: {
      tasks: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  // Get recent learning entries
  const recentLearning = await prisma.learningLog.findMany({
    where: {
      userId,
      month: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Get weekly stats
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const weeklyTasks = await prisma.dailyTask.findMany({
    where: {
      plan: {
        userId,
        date: { gte: weekStart },
      },
    },
    select: { status: true, actualHours: true, plannedHours: true },
  })

  const completedTasks = weeklyTasks.filter(t => t.status === 'COMPLETED').length
  const totalTasks = weeklyTasks.length
  const totalHours = weeklyTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)

  // Get assigned tasks (for interns who might have mentor-assigned tasks)
  const assignedTasks = await prisma.task?.findMany?.({
    where: {
      assigneeId: userId,
      status: { not: 'COMPLETED' },
    },
    take: 5,
    orderBy: { dueDate: 'asc' },
  }) || []

  // For freelancers, get their active client assignments via ClientTeamMember
  const freelancerProjects = userRole === 'FREELANCER' ? await prisma.clientTeamMember.findMany({
    where: {
      userId,
      client: { status: 'ACTIVE' },
    },
    include: {
      client: { select: { id: true, name: true, brandName: true, status: true } },
    },
  }) : []

  return (
    <MyDayClient
      userId={userId}
      userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
      userRole={userRole}
      department={user?.department || ''}
      joiningDate={user?.joiningDate?.toISOString() || null}
      todayPlan={todayPlan ? {
        ...todayPlan,
        date: todayPlan.date.toISOString(),
        submittedAt: todayPlan.submittedAt?.toISOString() || null,
        tasks: todayPlan.tasks.map(t => ({
          ...t,
          plannedStartTime: t.plannedStartTime?.toISOString() || null,
          actualStartTime: t.actualStartTime?.toISOString() || null,
          actualEndTime: t.actualEndTime?.toISOString() || null,
          addedAt: t.addedAt.toISOString(),
          startedAt: t.startedAt?.toISOString() || null,
          completedAt: t.completedAt?.toISOString() || null,
        })),
      } : null}
      recentLearning={recentLearning.map(l => ({
        id: l.id,
        resourceTitle: l.resourceTitle,
        topic: l.topic,
        minutesWatched: l.minutesWatched,
        month: l.month.toISOString(),
        resourceUrl: l.resourceUrl,
      }))}
      weeklyStats={{
        completedTasks,
        totalTasks,
        totalHours,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      }}
      assignedTasks={assignedTasks.map((t: { id: string; title: string; status: string; dueDate: Date | null; priority: string }) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        dueDate: t.dueDate?.toISOString() || null,
        priority: t.priority,
      }))}
      freelancerProjects={freelancerProjects.map((p: { id: string; role: string; client: { id: string; name: string; brandName: string | null; status: string } }) => ({
        id: p.client.id,
        title: p.client.brandName || p.client.name,
        status: p.client.status,
        clientName: p.client.brandName || p.client.name,
      }))}
    />
  )
}
