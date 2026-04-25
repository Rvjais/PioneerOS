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

export default function SeoOperationsReportPage() {
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

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-slate-800/50 text-slate-200'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'REVIEW': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const tasksByStatus = dashboard?.tasksByStatus || {}
  const contentByStatus = dashboard?.contentByStatus || {}
  const totalTasks = Object.values(tasksByStatus).reduce((sum, v) => sum + (v as number), 0)
  const completedTasks = (tasksByStatus.DONE || 0) + (tasksByStatus.COMPLETED || 0)
  const inProgressTasks = tasksByStatus.IN_PROGRESS || 0
  const todoTasks = tasksByStatus.TODO || 0
  const reviewTasks = tasksByStatus.REVIEW || tasksByStatus.IN_REVIEW || 0

  const publishedContent = contentByStatus.PUBLISHED || 0
  const draftContent = contentByStatus.DRAFT || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daily Operations Report</h1>
            <p className="text-teal-200">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-teal-200 text-sm">Team Standup</p>
            <p className="text-xl font-bold">9:00 AM</p>
          </div>
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Tasks Completed</p>
          <p className="text-3xl font-bold text-green-400">{completedTasks}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{inProgressTasks}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Pending Review</p>
          <p className="text-3xl font-bold text-amber-400">{reviewTasks}</p>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <p className="text-sm text-emerald-600">Content Published</p>
          <p className="text-3xl font-bold text-emerald-700">{publishedContent}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Total Backlinks</p>
          <p className="text-3xl font-bold text-purple-400">{dashboard?.totalBacklinks || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Tasks by Status</h2>
          </div>
          <div className="divide-y divide-white/10">
            {Object.entries(tasksByStatus).map(([status, count]) => (
              <div key={status} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-white">{status.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-sm text-slate-400">{count as number} tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: totalTasks > 0 ? `${((count as number) / totalTasks) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm text-slate-400">{totalTasks > 0 ? Math.round(((count as number) / totalTasks) * 100) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content by Status */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Content by Status</h2>
          </div>
          <div className="divide-y divide-white/10">
            {Object.entries(contentByStatus).map(([status, count]) => (
              <div key={status} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white">{status.replace(/_/g, ' ')}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(status)}`}>
                    {count as number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyword & Backlink Summary */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-4">SEO Metrics Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-900/40 rounded-lg">
            <p className="text-2xl font-bold text-teal-600">{dashboard?.totalKeywords || 0}</p>
            <p className="text-sm text-slate-300">Total Keywords</p>
          </div>
          <div className="text-center p-3 bg-slate-900/40 rounded-lg">
            <p className="text-2xl font-bold text-green-400">{dashboard?.keywordsImproved || 0}</p>
            <p className="text-sm text-slate-300">Keywords Improved</p>
          </div>
          <div className="text-center p-3 bg-slate-900/40 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">{typeof (dashboard?.avgRank) === 'number' ? dashboard.avgRank.toFixed(1) : dashboard?.avgRank || 0}</p>
            <p className="text-sm text-slate-300">Avg Rank</p>
          </div>
          <div className="text-center p-3 bg-slate-900/40 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">{dashboard?.liveBacklinks || 0}</p>
            <p className="text-sm text-slate-300">Live Backlinks</p>
          </div>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
        <h3 className="font-semibold text-teal-800 mb-3">Today&apos;s Focus</h3>
        <ul className="space-y-2 text-sm text-teal-700">
          <li className="flex items-start gap-2">
            <span className="text-teal-500">1.</span>
            {todoTasks} tasks in TODO - prioritize and assign
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500">2.</span>
            {reviewTasks} tasks pending review - clear the QC queue
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500">3.</span>
            {draftContent} content drafts to finalize
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500">4.</span>
            {dashboard?.liveBacklinks || 0} live backlinks out of {dashboard?.totalBacklinks || 0} total - follow up on pending
          </li>
        </ul>
      </div>
    </div>
  )
}
