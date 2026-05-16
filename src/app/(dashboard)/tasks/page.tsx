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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isManager ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            {isManager ? 'Manage team tasks and assignments' : 'Track and complete your work'}
          </p>
        </div>
      </div>

      <EndOfDayReport userId={session.user.id} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-50', dot: 'bg-slate-300' },
          { label: 'To Do', value: stats.todo, color: 'text-slate-600', bg: 'bg-slate-50', dot: 'bg-slate-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
          { label: 'In Review', value: stats.review, color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${stat.dot} shadow-sm`} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className={`text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tasks Content Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
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
    </div>
  )
}
