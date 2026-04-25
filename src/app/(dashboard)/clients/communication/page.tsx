import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { CommunicationCharterClient } from './CommunicationCharterClient'

async function getAssignedClientIds(userId: string, isManager: boolean) {
  if (isManager) {
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    })
    return clients.map(c => c.id)
  }

  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true },
  })
  return assignments.map(a => a.clientId)
}

async function getSchedules(clientIds: string[]) {
  const schedules = await prisma.communicationSchedule.findMany({
    where: {
      status: 'ACTIVE',
      clientId: { in: clientIds },
    },
    include: {
      client: { select: { id: true, name: true, tier: true, contactName: true, contactPhone: true } },
      template: { select: { id: true, name: true, subject: true, content: true } },
      _count: { select: { logs: true } },
    },
    orderBy: [{ nextDueAt: 'asc' }, { name: 'asc' }],
  })
  return schedules
}

async function getClients(clientIds: string[]) {
  return prisma.client.findMany({
    where: {
      status: 'ACTIVE',
      id: { in: clientIds },
    },
    select: { id: true, name: true, tier: true },
    orderBy: { name: 'asc' },
  })
}

async function getTemplates() {
  return prisma.communicationTemplate.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
}

async function getRecentLogs(clientIds: string[]) {
  return prisma.communicationLog.findMany({
    where: {
      clientId: { in: clientIds },
    },
    include: {
      client: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
      schedule: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

async function getStats(clientIds: string[]) {
  const now = new Date()
  const [total, active, overdue, completedToday] = await Promise.all([
    prisma.communicationSchedule.count({ where: { clientId: { in: clientIds } } }),
    prisma.communicationSchedule.count({ where: { status: 'ACTIVE', clientId: { in: clientIds } } }),
    prisma.communicationSchedule.count({
      where: { status: 'ACTIVE', nextDueAt: { lt: now }, clientId: { in: clientIds } },
    }),
    prisma.communicationLog.count({
      where: {
        clientId: { in: clientIds },
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    }),
  ])
  return { total, active, overdue, completedToday }
}

export default async function CommunicationCharterPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const userRole = session.user.role as string
  const userDept = session.user.department as string

  // HR shouldn't access client communication data
  if (userDept === 'HR' && !['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
    redirect('/hr')
  }

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)
  const clientIds = await getAssignedClientIds(userId, isManager)

  if (clientIds.length === 0) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Communication Charter</h1>
            <p className="text-slate-400 mt-1">Track and manage all scheduled client communications</p>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center text-slate-400">
          No clients assigned to you yet.
        </div>
      </div>
    )
  }

  const [schedules, clients, templates, recentLogs, stats] = await Promise.all([
    getSchedules(clientIds),
    getClients(clientIds),
    getTemplates(),
    getRecentLogs(clientIds),
    getStats(clientIds),
  ])

  const serializedSchedules = schedules.map((s) => ({
    ...s,
    lastSentAt: s.lastSentAt?.toISOString() || null,
    nextDueAt: s.nextDueAt?.toISOString() || null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }))

  const serializedLogs = recentLogs.map((l) => ({
    ...l,
    user: { ...l.user, lastName: l.user.lastName || '' },
    createdAt: l.createdAt.toISOString(),
  }))

  const serializedTemplates = templates.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Communication Charter</h1>
          <p className="text-slate-400 mt-1">
            {isManager ? 'All client communications' : 'Communications for your assigned clients'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Total Schedules</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <p className="text-3xl font-bold text-blue-400">{stats.active}</p>
          </div>
          <p className="text-sm text-slate-400">Active</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <p className="text-3xl font-bold text-red-400">{stats.overdue}</p>
          </div>
          <p className="text-sm text-slate-400">Overdue</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <p className="text-3xl font-bold text-green-400">{stats.completedToday}</p>
          </div>
          <p className="text-sm text-slate-400">Completed Today</p>
        </div>
      </div>

      <CommunicationCharterClient
        schedules={serializedSchedules}
        clients={clients}
        templates={serializedTemplates}
        recentLogs={serializedLogs}
        currentUserId={session.user.id}
      />
    </div>
  )
}
