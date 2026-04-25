'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface RecentTask {
  id: string
  description: string
  taskType: string
  status: string
  priority: string
  deadline: string | null
  client: { name: string }
  assignedTo: { firstName: string; lastName: string }
}

interface RankingEntry {
  keyword: string
  client: string
  currentRank: number
  previousRank: number
  change: number
}

interface DashboardData {
  keywords: { total: number; top3: number; top10: number }
  backlinks: { total: number; live: number; pending: number }
  content: { draft: number; inReview: number; published: number; dueThisWeek: number }
  tasks: {
    todo: number; inProgress: number; inReview: number; done: number
    recent: RecentTask[]
  }
  rankings: {
    movers: RankingEntry[]
    decliners: RankingEntry[]
  }
  gbpProfiles: number
}

function getStatusColor(status: string) {
  switch (status) {
    case 'TODO': return 'bg-slate-800/50 text-slate-200'
    case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
    case 'IN_REVIEW': return 'bg-amber-500/20 text-amber-400'
    case 'DONE': return 'bg-green-500/20 text-green-400'
    default: return 'bg-slate-800/50 text-slate-200'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'URGENT': return 'bg-red-500/20 text-red-400'
    case 'HIGH': return 'bg-orange-500/20 text-orange-400'
    case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400'
    case 'LOW': return 'bg-slate-700/50 text-slate-300'
    default: return 'bg-slate-700/50 text-slate-300'
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700/50 rounded ${className ?? ''}`} />
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-48 !bg-white/20" />
            <SkeletonBlock className="h-4 w-64 !bg-white/10" />
          </div>
          <div className="flex gap-6">
            <div className="space-y-2 text-right">
              <SkeletonBlock className="h-4 w-24 !bg-white/10 ml-auto" />
              <SkeletonBlock className="h-9 w-16 !bg-white/20 ml-auto" />
            </div>
            <div className="space-y-2 text-right">
              <SkeletonBlock className="h-4 w-24 !bg-white/10 ml-auto" />
              <SkeletonBlock className="h-9 w-16 !bg-white/20 ml-auto" />
            </div>
            <div className="space-y-2 text-right">
              <SkeletonBlock className="h-4 w-24 !bg-white/10 ml-auto" />
              <SkeletonBlock className="h-9 w-16 !bg-white/20 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`skeleton-stat-${i}`} className="glass-card rounded-xl border border-white/10 p-4 space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Tables skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={`skeleton-table-${i}`} className="glass-card rounded-xl border border-white/10 p-4 space-y-4">
            <SkeletonBlock className="h-6 w-40" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SeoDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/seo/dashboard')
        if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`)
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-300 text-lg">Failed to load dashboard</p>
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const { keywords, backlinks, content, tasks, rankings, gbpProfiles } = data
  const totalTasks = tasks.todo + tasks.inProgress + tasks.inReview + tasks.done

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SEO Command Center</h1>
            <p className="text-teal-200">Real-time overview of all SEO operations.</p>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-teal-200 text-sm">Keywords Tracked</p>
              <p className="text-3xl font-bold">{keywords.total}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">In Top 10</p>
              <p className="text-3xl font-bold">{keywords.top10}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">In Top 3</p>
              <p className="text-3xl font-bold">{keywords.top3}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Keywords */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Keywords</h3>
          <p className="text-2xl font-bold text-white mb-2">{keywords.total}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Top 3</span>
              <span className="font-semibold text-green-400">{keywords.top3}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Top 10</span>
              <span className="font-semibold text-teal-400">{keywords.top10}</span>
            </div>
          </div>
        </div>

        {/* Backlinks */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Backlinks</h3>
          <p className="text-2xl font-bold text-white mb-2">{backlinks.total}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Live</span>
              <span className="font-semibold text-green-400">{backlinks.live}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Pending</span>
              <span className="font-semibold text-amber-400">{backlinks.pending}</span>
            </div>
          </div>
        </div>

        {/* Content Pipeline */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Content Pipeline</h3>
          <p className="text-2xl font-bold text-white mb-2">{content.draft + content.inReview + content.published}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Draft</span>
              <span className="font-semibold text-slate-300">{content.draft}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">In Review</span>
              <span className="font-semibold text-amber-400">{content.inReview}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Published</span>
              <span className="font-semibold text-green-400">{content.published}</span>
            </div>
            {content.dueThisWeek > 0 && (
              <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                <span className="text-slate-400">Due This Week</span>
                <span className="font-semibold text-red-400">{content.dueThisWeek}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tasks</h3>
          <p className="text-2xl font-bold text-white mb-2">{totalTasks}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">To Do</span>
              <span className="font-semibold text-slate-300">{tasks.todo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">In Progress</span>
              <span className="font-semibold text-blue-400">{tasks.inProgress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">In Review</span>
              <span className="font-semibold text-amber-400">{tasks.inReview}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Done</span>
              <span className="font-semibold text-green-400">{tasks.done}</span>
            </div>
          </div>
        </div>
      </div>

      {/* GBP Profiles banner (if any) */}
      {gbpProfiles > 0 && (
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm text-emerald-300">
              <span className="font-semibold">{gbpProfiles}</span> Google Business Profile{gbpProfiles !== 1 ? 's' : ''} being managed
            </span>
          </div>
          <Link href="/seo/gbp" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View Profiles &rarr;
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Tasks</h2>
            <Link href="/seo/tasks" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
              View All &rarr;
            </Link>
          </div>
          {tasks.recent.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No recent tasks</div>
          ) : (
            <div className="divide-y divide-white/5">
              {tasks.recent.map(task => (
                <Link key={task.id} href={`/seo/tasks/${task.id}`} className="block p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-medium text-white truncate">{task.description}</p>
                      <p className="text-sm text-slate-400">{task.client.name}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded shrink-0 ${getStatusColor(task.status)}`}>
                      {formatStatus(task.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span className="px-2 py-0.5 bg-slate-800/50 rounded">{task.taskType.replace(/_/g, ' ')}</span>
                    <span className={`px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    {task.assignedTo.firstName && (
                      <span className="text-slate-400">
                        {task.assignedTo.firstName} {task.assignedTo.lastName}
                      </span>
                    )}
                    {task.deadline && (
                      <span className="ml-auto text-slate-400">Due: {formatDateDDMMYYYY(task.deadline)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Keyword Movers & Decliners */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
            <h2 className="font-semibold text-white">Keyword Rankings</h2>
            <Link href="/seo/performance/rankings" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
              View All &rarr;
            </Link>
          </div>

          {/* Movers */}
          {rankings.movers.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-green-500/5 border-b border-white/5">
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Movers</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-4 text-xs font-semibold text-slate-500">Keyword</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500">Rank</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.movers.map((kw, idx) => (
                    <tr key={`mover-${kw.keyword}`} className="border-b border-white/5">
                      <td className="py-2.5 px-4">
                        <p className="text-sm font-medium text-white">{kw.keyword}</p>
                        <p className="text-xs text-slate-500">{kw.client}</p>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`font-bold ${kw.currentRank <= 3 ? 'text-green-400' : kw.currentRank <= 10 ? 'text-teal-400' : 'text-slate-300'}`}>
                          #{kw.currentRank}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="text-green-400 font-medium inline-flex items-center gap-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {Math.abs(kw.change)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Decliners */}
          {rankings.decliners.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-red-500/5 border-b border-white/5">
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Decliners</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-4 text-xs font-semibold text-slate-500">Keyword</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500">Rank</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.decliners.map((kw, idx) => (
                    <tr key={`decliner-${kw.keyword}`} className="border-b border-white/5">
                      <td className="py-2.5 px-4">
                        <p className="text-sm font-medium text-white">{kw.keyword}</p>
                        <p className="text-xs text-slate-500">{kw.client}</p>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`font-bold ${kw.currentRank <= 3 ? 'text-green-400' : kw.currentRank <= 10 ? 'text-teal-400' : 'text-slate-300'}`}>
                          #{kw.currentRank}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="text-red-400 font-medium inline-flex items-center gap-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {Math.abs(kw.change)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rankings.movers.length === 0 && rankings.decliners.length === 0 && (
            <div className="p-8 text-center text-slate-500">No ranking changes recorded yet</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
        <h3 className="font-semibold text-teal-300 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <Link href="/seo/clients/keywords" className="glass-card rounded-lg p-3 text-center hover:bg-white/[0.04] transition-colors group">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-teal-500/10 group-hover:bg-teal-500/20 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-slate-300">Add Keyword</p>
          </Link>
          <Link href="/seo/deliverables/content" className="glass-card rounded-lg p-3 text-center hover:bg-white/[0.04] transition-colors group">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-sm text-slate-300">New Blog</p>
          </Link>
          <Link href="/seo/tasks" className="glass-card rounded-lg p-3 text-center hover:bg-white/[0.04] transition-colors group">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-slate-300">New Task</p>
          </Link>
          <Link href="/seo/deliverables/backlinks" className="glass-card rounded-lg p-3 text-center hover:bg-white/[0.04] transition-colors group">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-sm text-slate-300">Add Backlink</p>
          </Link>
          <Link href="/seo/performance/reports" className="glass-card rounded-lg p-3 text-center hover:bg-white/[0.04] transition-colors group">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-300">Create Report</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
