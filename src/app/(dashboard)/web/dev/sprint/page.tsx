import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function WebDevSprintPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const projects = await prisma.webProject.findMany({
    where: { status: 'IN_PROGRESS' },
    include: {
      client: { select: { name: true } },
      phases: {
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  const bugs = await prisma.webBugReport.findMany({
    where: { status: { in: ['OPEN', 'CONFIRMED', 'IN_PROGRESS'] } },
    include: { project: { select: { name: true } } },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    take: 10,
  })

  const priorityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    LOW: 'bg-green-500/20 text-green-400 border border-green-500/30',
  }

  const phaseColors: Record<string, string> = {
    CONTENT: 'bg-purple-500',
    DESIGN: 'bg-pink-500',
    MEDIA: 'bg-orange-500',
    DEVELOPMENT: 'bg-blue-500',
    TESTING: 'bg-amber-500',
    DEPLOYMENT: 'bg-green-500',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sprint Board</h1>
          <p className="text-slate-500 mt-1">Active projects and pending tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
          <p className="text-sm text-slate-500">Active Projects</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-amber-600">{projects.reduce((acc, p) => acc + p.phases.filter(ph => ph.status === 'PENDING').length, 0)}</p>
          <p className="text-sm text-slate-500">Pending Tasks</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-red-600">{bugs.length}</p>
          <p className="text-sm text-slate-500">Open Bugs</p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Active Projects</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No active projects</div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.client.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.phases.slice(0, 2).map(phase => (
                      <span
                        key={phase.id}
                        className={`px-2 py-1 text-xs text-white rounded-full ${phaseColors[phase.phase] || 'bg-slate-500'}`}
                      >
                        {phase.phase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Critical Bugs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Priority Bugs</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {bugs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No open bugs</div>
          ) : (
            bugs.map(bug => (
              <div key={bug.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{bug.title}</h3>
                    <p className="text-sm text-slate-500">{bug.project.name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[bug.priority] || priorityColors.MEDIUM}`}>
                    {bug.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
