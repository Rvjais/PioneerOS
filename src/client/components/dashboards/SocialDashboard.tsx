'use client'

import Link from 'next/link'
import { format } from 'date-fns'

interface SocialDashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  stats: {
    clientsManaged: number
    postsScheduled: number
    postsPublished: number
    videosEdited: number
    engagementRate: number
    tasksToday: number
  }
  contentCalendar: Array<{
    id: string
    client: string
    platform: string
    type: string
    scheduledFor: string
    status: string
  }>
  clients: Array<{
    id: string
    name: string
    platforms: string[]
    nextPost: string
    pendingApprovals: number
  }>
  todaysTasks: Array<{
    id: string
    title: string
    client: string
    type: string
    status: string
  }>
}

const platformColors: Record<string, string> = {
  Instagram: 'from-pink-500 to-purple-500',
  Facebook: 'from-blue-500 to-blue-600',
  YouTube: 'from-red-500 to-red-600',
  LinkedIn: 'from-blue-600 to-blue-700',
  Twitter: 'from-sky-400 to-sky-500',
}

const platformIcons: Record<string, string> = {
  Instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z',
  Facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  YouTube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  LinkedIn: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
}

export function SocialDashboard({
  user,
  stats,
  contentCalendar,
  clients,
  todaysTasks,
}: SocialDashboardProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Media Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user.firstName}! Manage your social content.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/tasks/daily"
            className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Daily Planner
          </Link>
          <Link
            href="/social/calendar"
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-none transition-all"
          >
            Content Calendar
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.clientsManaged}</p>
          <p className="text-sm text-slate-400">Clients</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.postsScheduled}</p>
          <p className="text-sm text-slate-400">Scheduled</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.postsPublished}</p>
          <p className="text-sm text-slate-400">Published</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.videosEdited}</p>
          <p className="text-sm text-slate-400">Videos Edited</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">
            {stats.postsPublished > 0 ? `${stats.engagementRate}%` : '-'}
          </p>
          <p className="text-sm text-slate-400">Avg Engagement</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.tasksToday}</p>
          <p className="text-sm text-slate-400">Tasks Today</p>
        </div>
      </div>

      {/* Content Calendar Preview */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Upcoming Content</h2>
          <Link href="/social/calendar" className="text-sm text-blue-400 hover:text-blue-300">
            View calendar
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 backdrop-blur-sm">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Platform</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Scheduled</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contentCalendar.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">No content scheduled</td>
                </tr>
              ) : (
                contentCalendar.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="px-5 py-4 text-sm text-white">{item.client}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${platformColors[item.platform] || 'from-slate-500 to-slate-600'} text-white`}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{item.type}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {format(new Date(item.scheduledFor), 'MMM d, h:mm a')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                        item.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' :
                        item.status === 'DRAFT' ? 'bg-white/5 text-slate-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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
                    <div className="flex items-center gap-1 mt-1">
                      {client.platforms.map((platform, i) => (
                        <span key={platform} className={`w-6 h-6 rounded flex items-center justify-center bg-gradient-to-r ${platformColors[platform] || 'from-slate-500 to-slate-600'}`}>
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d={platformIcons[platform] || ''} />
                          </svg>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    {client.pendingApprovals > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300">
                        {client.pendingApprovals} pending
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Next: {client.nextPost ? format(new Date(client.nextPost), 'MMM d') : 'Not scheduled'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

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
                    <p className="text-sm text-slate-400">{task.client} &bull; {task.type}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-white/5 text-slate-300'
                  }`}>
                    {task.status}
                  </span>
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
          <button className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl hover:border-pink-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Create Post</p>
            <p className="text-xs text-slate-400 mt-1">Schedule content</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-xl hover:border-red-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Upload Video</p>
            <p className="text-xs text-slate-400 mt-1">YouTube/Reels</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Design Graphics</p>
            <p className="text-xs text-slate-400 mt-1">Create visuals</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-colors text-left">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white">Analytics</p>
            <p className="text-xs text-slate-400 mt-1">View insights</p>
          </button>
        </div>
      </div>
    </div>
  )
}
