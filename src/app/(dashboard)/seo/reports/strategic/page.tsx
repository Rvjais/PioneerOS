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

export default function SeoStrategicInsightsPage() {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
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
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalContent = Object.values(contentByStatus).reduce((sum, v) => sum + (v as number), 0)
  const publishedContent = contentByStatus.PUBLISHED || 0

  const backlinkLiveRate = totalBacklinks > 0 ? Math.round((liveBacklinks / totalBacklinks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Strategic Insights</h1>
            <p className="text-teal-200">Leadership planning and strategy review</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-teal-200 text-sm">Task Completion</p>
              <p className="text-3xl font-bold">{completionRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">Keywords Tracked</p>
              <p className="text-3xl font-bold">{totalKeywords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Keywords Improved</p>
          <p className="text-3xl font-bold text-green-400">{keywordsImproved}</p>
          <p className="text-xs text-green-400 mt-1">out of {totalKeywords} tracked</p>
        </div>
        <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
          <p className="text-sm text-teal-600">Average Rank</p>
          <p className="text-3xl font-bold text-teal-700">{typeof avgRank === 'number' ? avgRank.toFixed(1) : avgRank}</p>
          <p className="text-xs text-teal-600 mt-1">across all keywords</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Live Backlinks</p>
          <p className="text-3xl font-bold text-blue-400">{liveBacklinks}</p>
          <p className="text-xs text-blue-400 mt-1">{backlinkLiveRate}% live rate</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Content Published</p>
          <p className="text-3xl font-bold text-purple-400">{publishedContent}</p>
          <p className="text-xs text-purple-400 mt-1">of {totalContent} total</p>
        </div>
      </div>

      {/* Task Completion Overview */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Task Completion Overview</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(tasksByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-3 bg-slate-900/40 rounded-lg">
                <p className="text-2xl font-bold text-teal-600">{count as number}</p>
                <p className="text-sm text-slate-300">{status.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Overall Completion</span>
              <span className="font-medium text-white">{completedTasks}/{totalTasks} ({completionRate}%)</span>
            </div>
            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Pipeline */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Content Pipeline</h2>
        </div>
        <div className="divide-y divide-white/10">
          {Object.entries(contentByStatus).map(([status, count]) => (
            <div key={status} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{status.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-slate-300">{count as number} items</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' :
                  status === 'DRAFT' ? 'bg-slate-800/50 text-slate-200' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {totalContent > 0 ? Math.round(((count as number) / totalContent) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backlink & Keyword Performance */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">SEO Performance Summary</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">METRIC</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">VALUE</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">DETAIL</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 font-medium text-white">Total Keywords</td>
              <td className="py-3 px-4 text-right text-slate-300">{totalKeywords}</td>
              <td className="py-3 px-4 text-right text-green-400">{keywordsImproved} improved</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 font-medium text-white">Average Rank</td>
              <td className="py-3 px-4 text-right text-slate-300">{typeof avgRank === 'number' ? avgRank.toFixed(1) : avgRank}</td>
              <td className="py-3 px-4 text-right text-slate-400">across all keywords</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 font-medium text-white">Total Backlinks</td>
              <td className="py-3 px-4 text-right text-slate-300">{totalBacklinks}</td>
              <td className="py-3 px-4 text-right text-green-400">{liveBacklinks} live ({backlinkLiveRate}%)</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 font-medium text-white">Tasks Completed</td>
              <td className="py-3 px-4 text-right text-slate-300">{completedTasks}</td>
              <td className="py-3 px-4 text-right text-slate-400">of {totalTasks} total</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
        <h3 className="font-semibold text-teal-800 mb-3">Strategic Recommendations</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-teal-700">
          <div>
            <p className="font-medium mb-1">Content Strategy</p>
            <ul className="space-y-1">
              <li>- Focus on video content for procedures</li>
              <li>- Create patient testimonial pages</li>
              <li>- Expand multilingual content (Hindi)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Technical Focus</p>
            <ul className="space-y-1">
              <li>- Achieve Core Web Vitals green for all</li>
              <li>- Implement AMP for blog posts</li>
              <li>- Complete schema markup rollout</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Growth Opportunities</p>
            <ul className="space-y-1">
              <li>- Target tier-2 city keywords</li>
              <li>- Build healthcare influencer network</li>
              <li>- Expand to YouTube SEO</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
