'use client'

import { useState, useEffect } from 'react'

interface DashboardData {
  tasksByStatus: Record<string, number>
  contentByStatus: Record<string, number>
  totalKeywords: number
  keywordsImproved: number
  avgRank: number
  totalBacklinks: number
  liveBacklinks: number
  [key: string]: unknown
}

export default function SeoTrafficGrowthPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seo/dashboard')
      .then(res => res.json())
      .then(data => {
        setDashboard(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const tasksByStatus = dashboard?.tasksByStatus || {}
  const contentByStatus = dashboard?.contentByStatus || {}
  const totalKeywords = dashboard?.totalKeywords || 0
  const keywordsImproved = dashboard?.keywordsImproved || 0
  const avgRank = dashboard?.avgRank || 0
  const totalBacklinks = dashboard?.totalBacklinks || 0
  const liveBacklinks = dashboard?.liveBacklinks || 0

  const totalTasks = Object.values(tasksByStatus).reduce((sum, v) => sum + (v as number), 0)
  const completedTasks = (tasksByStatus.DONE || 0) + (tasksByStatus.COMPLETED || 0)
  const totalContent = Object.values(contentByStatus).reduce((sum, v) => sum + (v as number), 0)
  const publishedContent = contentByStatus.PUBLISHED || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Traffic Growth</h1>
            <p className="text-teal-200">Organic traffic performance from Google Search</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-teal-200 text-sm">Total Keywords</p>
              <p className="text-3xl font-bold">{totalKeywords}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">Avg Rank</p>
              <p className="text-3xl font-bold">{typeof avgRank === 'number' ? avgRank.toFixed(1) : avgRank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
          <p className="text-sm text-teal-600">Total Keywords Tracked</p>
          <p className="text-3xl font-bold text-teal-700">{totalKeywords}</p>
          <p className="text-xs text-teal-600 mt-1">Across all clients</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Keywords Improved</p>
          <p className="text-3xl font-bold text-green-400">{keywordsImproved}</p>
          <p className="text-xs text-green-400 mt-1">Rank improved</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Total Backlinks</p>
          <p className="text-3xl font-bold text-blue-400">{totalBacklinks}</p>
          <p className="text-xs text-blue-400 mt-1">{liveBacklinks} live</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Average Rank</p>
          <p className="text-3xl font-bold text-purple-400">{typeof avgRank === 'number' ? avgRank.toFixed(1) : avgRank}</p>
          <p className="text-xs text-purple-400 mt-1">Across keywords</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks Overview */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Tasks Overview</h2>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(tasksByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{status.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-white">{count as number}</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: totalTasks > 0 ? `${((count as number) / totalTasks) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
              <span className="text-slate-400">Total Tasks</span>
              <span className="font-semibold text-white">{totalTasks}</span>
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Content Overview</h2>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(contentByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{status.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-white">{count as number}</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: totalContent > 0 ? `${((count as number) / totalContent) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
              <span className="text-slate-400">Total Content</span>
              <span className="font-semibold text-white">{totalContent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-slate-200 mb-2">Data Sources</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Google Search Console</p>
              <p className="text-xs text-slate-400">Organic search data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.84 8.35l-4.14-4.14a.5.5 0 00-.7 0L1.16 21.05a.5.5 0 000 .7l2.09 2.09a.5.5 0 00.7 0L22.84 9.05a.5.5 0 000-.7z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Google Analytics</p>
              <p className="text-xs text-slate-400">User behavior & conversions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
