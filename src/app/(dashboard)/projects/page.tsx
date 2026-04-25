import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

async function getProjectsData(userId: string, role: string) {
  const fullAccessRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
  const clientWhere = fullAccessRoles.includes(role)
    ? { status: 'ACTIVE' as const, deletedAt: null }
    : { status: 'ACTIVE' as const, deletedAt: null, teamMembers: { some: { userId } } }

  const [clients, tasks] = await Promise.all([
    prisma.client.findMany({
      where: clientWhere,
      include: {
        teamMembers: {
          include: { user: true }
        }
      }
    }),
    prisma.task.findMany({
      where: {
        clientId: { not: null }
      }
    })
  ])

  // Group tasks by client
  const projectsWithTasks = clients.map(client => {
    const clientTasks = tasks.filter(t => t.clientId === client.id)
    const completed = clientTasks.filter(t => t.status === 'COMPLETED').length
    const inProgress = clientTasks.filter(t => t.status === 'IN_PROGRESS').length
    const pending = clientTasks.filter(t => ['TODO', 'REVIEW'].includes(t.status)).length
    const progress = clientTasks.length ? Math.round((completed / clientTasks.length) * 100) : 0

    return {
      ...client,
      tasks: clientTasks,
      taskStats: { completed, inProgress, pending, total: clientTasks.length },
      progress
    }
  })

  return projectsWithTasks
}

const tierColors: Record<string, string> = {
  ENTERPRISE: 'bg-purple-500/20 text-purple-400 border-purple-200',
  GROWTH: 'bg-blue-500/20 text-blue-400 border-blue-200',
  STARTER: 'bg-slate-800/50 text-slate-200 border-white/10',
}

const healthColors: Record<string, string> = {
  HEALTHY: 'bg-green-500',
  WARNING: 'bg-yellow-500',
  AT_RISK: 'bg-red-500',
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const projects = await getProjectsData(
    (session.user as any).id,
    (session.user as any).role || 'EMPLOYEE'
  )

  const stats = {
    total: projects.length,
    totalTasks: projects.reduce((sum, p) => sum + p.taskStats.total, 0),
    completedTasks: projects.reduce((sum, p) => sum + p.taskStats.completed, 0),
    avgProgress: projects.length ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Client projects and progress overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Active Projects</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">{stats.totalTasks}</p>
          <p className="text-sm text-slate-400">Total Tasks</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">{stats.completedTasks}</p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-purple-400">{stats.avgProgress}%</p>
          <p className="text-sm text-slate-400">Avg Progress</p>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/10 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          <p className="text-slate-300 mt-4 font-medium">No active projects</p>
          <p className="text-slate-400 text-sm mt-1">Projects will appear when you have active clients with tasks</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/clients/${project.id}`}
              className="glass-card rounded-2xl border border-white/10 overflow-hidden hover:shadow-none transition-shadow group"
            >
              {/* Project Header */}
              <div className="p-5 border-b border-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${tierColors[project.tier]}`}>
                        {project.tier}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${healthColors[project.healthStatus || 'HEALTHY']}`} />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">Progress</span>
                  <span className="text-sm font-semibold text-white">{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Task Stats */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-slate-900/40 rounded-lg">
                    <p className="text-lg font-bold text-white">{project.taskStats.pending}</p>
                    <p className="text-xs text-slate-400">Pending</p>
                  </div>
                  <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                    <p className="text-lg font-bold text-blue-400">{project.taskStats.inProgress}</p>
                    <p className="text-xs text-slate-400">In Progress</p>
                  </div>
                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                    <p className="text-lg font-bold text-green-400">{project.taskStats.completed}</p>
                    <p className="text-xs text-slate-400">Done</p>
                  </div>
                </div>
              </div>

              {/* Team */}
              <div className="px-5 py-4 border-t border-white/5 bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 4).map((member) => (
                      <div key={member.id} className="ring-2 ring-white rounded-full">
                        <UserAvatar
                          user={{ id: member.user.id, firstName: member.user.firstName, lastName: member.user.lastName }}
                          size="sm"
                          showPreview={false}
                        />
                      </div>
                    ))}
                    {project.teamMembers.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-300">
                        +{project.teamMembers.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {project.taskStats.total} tasks
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-400">Filter by:</span>
        {['All', 'Enterprise', 'Growth', 'Starter', 'At Risk'].map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
              filter === 'All'
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
