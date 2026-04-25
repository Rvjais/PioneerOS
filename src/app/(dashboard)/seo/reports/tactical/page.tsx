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

export default function SeoTacticalReportPage() {
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
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
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
  const draftContent = contentByStatus.DRAFT || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tactical Report</h1>
            <p className="text-teal-200">Monthly Performance Review</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-teal-200 text-sm">Content Published</p>
              <p className="text-3xl font-bold">{publishedContent}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">Backlinks Created</p>
              <p className="text-3xl font-bold">{totalBacklinks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <p className="text-sm text-emerald-600">Content Published</p>
          <p className="text-2xl font-bold text-emerald-700">{publishedContent}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Total Backlinks</p>
          <p className="text-2xl font-bold text-purple-400">{totalBacklinks}</p>
        </div>
        <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
          <p className="text-sm text-teal-600">Keywords Improved</p>
          <p className="text-2xl font-bold text-teal-700">{keywordsImproved}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Tasks Completed</p>
          <p className="text-2xl font-bold text-amber-400">{completedTasks}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Avg Rank</p>
          <p className="text-2xl font-bold text-green-400">{typeof avgRank === 'number' ? avgRank.toFixed(1) : avgRank}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task Performance by Status */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Task Performance</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-400">STATUS</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">COUNT</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">% OF TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tasksByStatus).map(([status, count]) => (
                <tr key={status} className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">{status.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-center text-slate-300">{count as number}</td>
                  <td className="py-3 px-4 text-center text-teal-600 font-medium">
                    {totalTasks > 0 ? Math.round(((count as number) / totalTasks) * 100) : 0}%
                  </td>
                </tr>
              ))}
              <tr className="border-t border-white/10 bg-slate-900/20">
                <td className="py-3 px-4 font-semibold text-white">Total</td>
                <td className="py-3 px-4 text-center font-semibold text-white">{totalTasks}</td>
                <td className="py-3 px-4 text-center font-semibold text-green-400">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SEO Metrics */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">SEO Metrics</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-400">METRIC</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">VALUE</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">DETAIL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4">
                  <p className="font-medium text-white">Keywords</p>
                  <p className="text-xs text-slate-400">Tracked</p>
                </td>
                <td className="py-3 px-4 text-center text-slate-300">{totalKeywords}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-green-400 font-medium">{keywordsImproved} improved</span>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4">
                  <p className="font-medium text-white">Backlinks</p>
                  <p className="text-xs text-slate-400">Created</p>
                </td>
                <td className="py-3 px-4 text-center text-slate-300">{totalBacklinks}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-green-400 font-medium">{liveBacklinks} live</span>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4">
                  <p className="font-medium text-white">Avg Rank</p>
                  <p className="text-xs text-slate-400">All keywords</p>
                </td>
                <td className="py-3 px-4 text-center text-slate-300">{typeof avgRank === 'number' ? avgRank.toFixed(1) : avgRank}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-amber-500">position</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Breakdown */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-4">Content Breakdown</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(contentByStatus).map(([status, count]) => (
            <div key={status} className="text-center p-3 bg-slate-900/40 rounded-lg">
              <p className="text-2xl font-bold text-teal-600">{count as number}</p>
              <p className="text-sm text-slate-300">{status.replace(/_/g, ' ')}</p>
            </div>
          ))}
          {Object.keys(contentByStatus).length === 0 && (
            <div className="col-span-4 text-center p-3 bg-slate-900/40 rounded-lg">
              <p className="text-sm text-slate-400">No content data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
        <h3 className="font-semibold text-teal-800 mb-3">Monthly Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-teal-700">
          <div>
            <p className="font-medium mb-1">Achievements</p>
            <ul className="space-y-1">
              <li>- {publishedContent} content items published</li>
              <li>- {totalBacklinks} backlinks ({liveBacklinks} live)</li>
              <li>- {keywordsImproved} keywords improved</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Areas to Improve</p>
            <ul className="space-y-1">
              <li>- {draftContent} content drafts pending</li>
              <li>- {totalBacklinks - liveBacklinks} backlinks not yet live</li>
              <li>- Average rank at {typeof avgRank === 'number' ? avgRank.toFixed(1) : avgRank}</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Next Month Goals</p>
            <ul className="space-y-1">
              <li>- Increase content output</li>
              <li>- Improve backlink live rate</li>
              <li>- Boost keyword improvements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
