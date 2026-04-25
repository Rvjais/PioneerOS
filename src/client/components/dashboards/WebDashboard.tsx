'use client'

import Link from 'next/link'
import { format } from 'date-fns'

interface WebDashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  stats: {
    activeProjects: number
    completedProjects: number
    tasksToday: number
    completedToday: number
    avgLighthouseScore: number
    deploymentsThisMonth: number
  }
  projects: Array<{
    id: string
    name: string
    client: string
    status: string
    progress: number
    dueDate: string
    technology: string
  }>
  todaysTasks: Array<{
    id: string
    title: string
    project: string
    priority: string
    status: string
  }>
  recentDeployments: Array<{
    id: string
    project: string
    environment: string
    deployedAt: string
    status: string
  }>
}

export function WebDashboard({
  user,
  stats,
  projects,
  todaysTasks,
  recentDeployments,
}: WebDashboardProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Web Development Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user.firstName}! Your development overview.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/tasks/daily"
            className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Daily Planner
          </Link>
          <Link
            href="/web/projects"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-none transition-all"
          >
            My Projects
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
          <p className="text-sm text-slate-400">Active Projects</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.completedProjects}</p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.tasksToday}</p>
          <p className="text-sm text-slate-400">Tasks Today</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.completedToday}</p>
          <p className="text-sm text-slate-400">Completed Today</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.avgLighthouseScore}</p>
          <p className="text-sm text-slate-400">Avg Lighthouse</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.deploymentsThisMonth}</p>
          <p className="text-sm text-slate-400">Deployments</p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Projects</h2>
          <Link href="/web/projects" className="text-sm text-blue-400 hover:text-blue-300">
            View all
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {projects.length === 0 ? (
            <div className="p-5 text-center text-slate-400">No active projects</div>
          ) : (
            projects.slice(0, 5).map((project) => (
              <div key={project.id} className="p-4 hover:bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-white">{project.name}</p>
                    <p className="text-sm text-slate-400">{project.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs">
                      {project.technology}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      project.status === 'IN_DEVELOPMENT' ? 'bg-blue-500/20 text-blue-300' :
                      project.status === 'IN_REVIEW' ? 'bg-amber-500/20 text-amber-300' :
                      project.status === 'DEPLOYED' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-white/5 text-slate-300'
                    }`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-400">{project.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          project.progress >= 80 ? 'bg-emerald-500' :
                          project.progress >= 50 ? 'bg-blue-500/100' : 'bg-amber-500/100'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Due: {format(new Date(project.dueDate), 'MMM d')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Today&apos;s Tasks</h2>
            <Link href="/tasks/daily" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {todaysTasks.length === 0 ? (
              <div className="p-5 text-center text-slate-400">No tasks for today</div>
            ) : (
              todaysTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                  <div>
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="text-sm text-slate-400">{task.project}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      task.priority === 'HIGH' ? 'bg-red-500/20 text-red-300' :
                      task.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-white/5 text-slate-300'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-white/5 text-slate-300'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Deployments */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Recent Deployments</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentDeployments.length === 0 ? (
              <div className="p-5 text-center text-slate-400">No recent deployments</div>
            ) : (
              recentDeployments.slice(0, 5).map((deployment) => (
                <div key={deployment.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      deployment.status === 'SUCCESS' ? 'bg-emerald-500' :
                      deployment.status === 'PENDING' ? 'bg-amber-500/100' : 'bg-red-500/100'
                    }`} />
                    <div>
                      <p className="font-medium text-white">{deployment.project}</p>
                      <p className="text-xs text-slate-400">{deployment.environment}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      deployment.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' :
                      deployment.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {deployment.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(deployment.deployedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Start Coding</p>
            <p className="text-xs text-slate-400 mt-1">Open VS Code</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Deploy</p>
            <p className="text-xs text-slate-400 mt-1">Push to production</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Lighthouse</p>
            <p className="text-xs text-slate-400 mt-1">Run audit</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl hover:border-amber-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Settings</p>
            <p className="text-xs text-slate-400 mt-1">Project config</p>
          </button>
        </div>
      </div>

      {/* Tech Stack Reference */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Our Tech Stack</h2>
        <div className="flex flex-wrap gap-3">
          {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'Vercel', 'Node.js'].map((tech) => (
            <span key={tech} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-slate-300">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
