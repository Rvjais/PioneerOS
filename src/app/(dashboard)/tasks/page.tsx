import { prisma } from '@/server/db/prisma'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { TasksClient } from './TasksClient'
import { EndOfDayReport } from './EndOfDayReport'

async function getTasks(userId: string, isManager: boolean, department: string) {
  const whereClause: Prisma.TaskWhereInput = isManager
    ? {}
    : { assigneeId: userId }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          role: true,
          profile: { select: { profilePicture: true } }
        }
      },
      creator: { select: { firstName: true, lastName: true } },
      client: { select: { id: true, name: true } },
      _count: {
        select: {
          subtasks: true,
          comments: true,
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
  })
  return tasks
}

async function getStats(userId: string, isManager: boolean) {
  const whereBase: Prisma.TaskWhereInput = isManager ? {} : { assigneeId: userId }

  const [total, todo, inProgress, review, completed] = await Promise.all([
    prisma.task.count({ where: whereBase }),
    prisma.task.count({ where: { ...whereBase, status: 'TODO' } }),
    prisma.task.count({ where: { ...whereBase, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...whereBase, status: 'REVIEW' } }),
    prisma.task.count({ where: { ...whereBase, status: 'COMPLETED' } }),
  ])
  return { total, todo, inProgress, review, completed }
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

async function getAssignedClients(userId: string, isManager: boolean) {
  if (isManager) {
    return prisma.client.findMany({
      where: { NOT: { status: 'LEAD' }, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
  }
  // For employees, get only clients they are assigned to
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    include: { client: { select: { id: true, name: true } } },
  })
  return assignments.map(a => a.client)
}

async function getLeads() {
  return prisma.lead.findMany({
    where: { NOT: { stage: 'LOST' }, deletedAt: null },
    select: { id: true, companyName: true, contactName: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userDepartment = session.user.department || 'WEB'
  const userRole = session.user.role || 'EMPLOYEE'
  // OM (OPERATIONS_HEAD or OPERATIONS department) sees all tasks like managers
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(userRole) || userDepartment === 'OPERATIONS'

  const [tasks, stats, users, assignedClients, leads] = await Promise.all([
    getTasks(session.user.id, isManager, userDepartment),
    getStats(session.user.id, isManager),
    getUsers(),
    getAssignedClients(session.user.id, isManager),
    getLeads(),
  ])

  const serializedTasks = tasks.map(task => ({
    ...task,
    dueDate: task.dueDate?.toISOString() || null,
    startDate: task.startDate?.toISOString() || null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() || null,
    timerStartedAt: task.timerStartedAt?.toISOString() || null,
    department: task.department,
  }))

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isManager ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isManager ? 'Manage team tasks and assignments' : 'Track and complete your work'}
          </p>
        </div>
      </div>

      <EndOfDayReport userId={session.user.id} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Total Tasks</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-900/40 rounded-full" />
            <p className="text-3xl font-bold text-white">{stats.todo}</p>
          </div>
          <p className="text-sm text-slate-400">To Do</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
          </div>
          <p className="text-sm text-slate-400">In Progress</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <p className="text-3xl font-bold text-purple-400">{stats.review}</p>
          </div>
          <p className="text-sm text-slate-400">In Review</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
      </div>

      {/* Tasks */}
      <TasksClient
        tasks={serializedTasks}
        users={users}
        clients={assignedClients}
        leads={leads}
        currentUserId={session.user.id}
        isManager={isManager}
        userDepartment={userDepartment}
        userRole={userRole}
      />
    </div>
  )
}
