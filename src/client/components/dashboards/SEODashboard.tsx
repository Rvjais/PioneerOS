'use client'

import Link from 'next/link'

interface SEODashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  stats: {
    clientsManaged: number
    keywordsTracked: number
    avgRanking: number
    gbpListings: number
    tasksToday: number
    completedToday: number
  }
  clients: Array<{
    id: string
    name: string
    healthScore: number
    keywordsRanked: number
    lastAudit: string
    services: string[]
  }>
  todaysTasks: Array<{
    id: string
    title: string
    client: string
    priority: string
    status: string
  }>
  keywordAlerts: Array<{
    keyword: string
    client: string
    change: number
    currentPosition: number
  }>
}

export function SEODashboard({
  user,
  stats,
  clients,
  todaysTasks,
  keywordAlerts,
}: SEODashboardProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user.firstName}! Here&apos;s your SEO overview.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/seo/daily-planner"
            className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Daily Planner
          </Link>
          <Link
            href="/seo/clients/accounts"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-none transition-all"
          >
            My Clients
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.clientsManaged}</p>
          <p className="text-sm text-slate-400">Clients</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.keywordsTracked}</p>
          <p className="text-sm text-slate-400">Keywords Tracked</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">
            {stats.keywordsTracked > 0 ? `#${stats.avgRanking}` : '-'}
          </p>
          <p className="text-sm text-slate-400">Avg Position</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.gbpListings}</p>
          <p className="text-sm text-slate-400">GBP Listings</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.tasksToday}</p>
          <p className="text-sm text-slate-400">Tasks Today</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.completedToday}</p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
      </div>

      {/* Keyword Alerts */}
      {keywordAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-white">Keyword Alerts</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {keywordAlerts.slice(0, 4).map((alert, index) => (
              <div key={`${alert.keyword}-${alert.client}`} className="bg-white/5 backdrop-blur-sm rounded-xl p-3">
                <p className="text-sm font-medium text-white truncate">{alert.keyword}</p>
                <p className="text-xs text-slate-400">{alert.client}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-slate-400">Position #{alert.currentPosition}</span>
                  <span className={`text-sm font-medium ${alert.change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {alert.change > 0 ? '+' : ''}{alert.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                    <p className="text-sm text-slate-400">{task.client}</p>
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

        {/* My Clients */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">My Clients</h2>
            <Link href="/clients" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {clients.length === 0 ? (
              <div className="p-5 text-center text-slate-400">No clients assigned</div>
            ) : (
              clients.slice(0, 5).map((client) => (
                <Link key={client.id} href={`/clients/${client.id}`} className="p-4 flex items-center justify-between hover:bg-white/5 block">
                  <div>
                    <p className="font-medium text-white">{client.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {client.services.slice(0, 3).map((service, i) => (
                        <span key={`service-${service}`} className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm text-xs text-slate-400">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`w-3 h-3 rounded-full inline-block ${
                      client.healthScore >= 80 ? 'bg-emerald-500' :
                      client.healthScore >= 60 ? 'bg-amber-500/100' : 'bg-red-500/100'
                    }`} />
                    <p className="text-xs text-slate-400 mt-1">{client.keywordsRanked} keywords</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">SEO Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Run SEO Audit</p>
            <p className="text-xs text-slate-400 mt-1">Analyze site health</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Keyword Research</p>
            <p className="text-xs text-slate-400 mt-1">Find opportunities</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Update GBP</p>
            <p className="text-xs text-slate-400 mt-1">Google Business</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl hover:border-amber-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Write Blog</p>
            <p className="text-xs text-slate-400 mt-1">Create content</p>
          </button>
        </div>
      </div>
    </div>
  )
}
