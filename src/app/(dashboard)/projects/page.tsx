import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'
import { cn } from '@/shared/utils/cn'

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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1 font-medium">Client projects and progress overview</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Active Projects', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Total Tasks', value: stats.totalTasks, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completedTasks, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: 'text-[#c96442]', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className={`text-2xl sm:text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-900">No active projects</p>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">Projects will appear here once you have active clients with tasks assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/clients/${project.id}`}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden"
            >
              {/* Project Header */}
              <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#c96442] to-[#b5563a] rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 group-hover:text-[#c96442] transition-colors truncate text-lg tracking-tight">
                        {project.name}
                      </h3>
                      <span className={cn(
                        "inline-flex px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg mt-1 border",
                        project.tier === 'ENTERPRISE' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        project.tier === 'GROWTH' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      )}>
                        {project.tier}
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    "w-3 h-3 rounded-full shadow-sm ring-4 ring-white",
                    project.healthStatus === 'HEALTHY' ? 'bg-emerald-500' :
                    project.healthStatus === 'WARNING' ? 'bg-amber-500' :
                    'bg-red-500'
                  )} />
                </div>
              </div>

              {/* Progress Section */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Progress</span>
                  <span className="text-sm font-black text-slate-900">{project.progress}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#c96442] to-[#b5563a] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-xl font-black text-slate-900">{project.taskStats.pending}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50/50 border border-orange-100 rounded-2xl">
                    <p className="text-xl font-black text-[#c96442]">{project.taskStats.inProgress}</p>
                    <p className="text-[9px] font-bold text-[#c96442] uppercase tracking-widest mt-0.5">Active</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <p className="text-xl font-black text-emerald-600">{project.taskStats.completed}</p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Done</p>
                  </div>
                </div>
              </div>

              {/* Team Footer */}
              <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {project.teamMembers.slice(0, 4).map((member) => (
                    <div key={member.id} className="ring-4 ring-white rounded-full shadow-sm hover:z-10 transition-all">
                      <UserAvatar
                        user={{ id: member.user.id, firstName: member.user.firstName, lastName: member.user.lastName }}
                        size="sm"
                        showPreview={false}
                      />
                    </div>
                  ))}
                  {project.teamMembers.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                      +{project.teamMembers.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {project.taskStats.total} tasks
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer Filters */}
      <div className="flex items-center gap-3 flex-wrap pt-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Filters:</span>
        {['All', 'Enterprise', 'Growth', 'Starter', 'At Risk'].map((filter) => (
          <button
            key={filter}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border",
              filter === 'All'
                ? 'bg-[#c96442] text-white border-[#c96442] shadow-lg shadow-orange-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#c96442] hover:text-[#c96442]'
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
