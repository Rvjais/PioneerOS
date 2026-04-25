'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Analytics {
  summary: {
    totalLeads: number; activeLeads: number; wonCount: number; lostCount: number
    overallConversionRate: number; avgCycleDays: number
    totalPipelineValue: number; weightedPipelineValue: number; totalRevenue: number
  }
  stageDistribution: Array<{ stage: string; count: number; value: number }>
  conversionBySource: Array<{ source: string; total: number; won: number; rate: number; value: number }>
  monthlyTrend: Array<{ label: string; won: number; lost: number; revenue: number; leads: number }>
  topLossReasons: Array<{ reason: string; count: number }>
  repPerformance: Array<{ id: string; name: string; won: number; lost: number; revenue: number; activities: number; leads: number; winRate: number }>
  priorityBreakdown: Array<{ priority: string; count: number; value: number }>
}

const stageLabels: Record<string, string> = {
  LEAD_RECEIVED: 'Lead Received',
  RFP_SENT: 'RFP Sent',
  RFP_COMPLETED: 'RFP Completed',
  PROPOSAL_SHARED: 'Proposal Shared',
  FOLLOW_UP_ONGOING: 'Follow-up',
  MEETING_SCHEDULED: 'Meeting Scheduled',
  PROPOSAL_DISCUSSION: 'Discussion',
  WON: 'Won',
  LOST: 'Lost',
}

const stageColors: Record<string, string> = {
  LEAD_RECEIVED: 'bg-blue-500',
  RFP_SENT: 'bg-cyan-500',
  RFP_COMPLETED: 'bg-teal-500',
  PROPOSAL_SHARED: 'bg-purple-500',
  FOLLOW_UP_ONGOING: 'bg-yellow-500',
  MEETING_SCHEDULED: 'bg-indigo-500',
  PROPOSAL_DISCUSSION: 'bg-orange-500',
  WON: 'bg-green-500',
  LOST: 'bg-red-500',
}

const priorityColors: Record<string, string> = {
  HOT: 'bg-red-500/20 text-red-400 border-red-500/20',
  WARM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  COLD: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
}

function formatCurrency(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
}

export default function SalesAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sales/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-400">Failed to load analytics</div>
  }

  const { summary, stageDistribution, conversionBySource, monthlyTrend, topLossReasons, repPerformance, priorityBreakdown } = data
  const maxStageCount = Math.max(...stageDistribution.map(s => s.count), 1)
  const maxMonthlyRevenue = Math.max(...monthlyTrend.map(m => m.revenue), 1)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline Analytics</h1>
          <p className="text-slate-400 mt-1">Conversion rates, pipeline velocity & forecasting</p>
        </div>
        <Link href="/sales/pipeline" className="px-4 py-2 border border-white/20 text-slate-200 rounded-xl hover:bg-slate-900/40 transition-colors">
          View Pipeline
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">Conversion Rate</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{summary.overallConversionRate}%</p>
          <p className="text-xs text-slate-500">{summary.wonCount} won / {summary.totalLeads} total</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">Avg Sales Cycle</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{summary.avgCycleDays}</p>
          <p className="text-xs text-slate-500">days to close</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">Pipeline Value</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{formatCurrency(summary.totalPipelineValue)}</p>
          <p className="text-xs text-slate-500">{summary.activeLeads} active leads</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">Weighted Forecast</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">{formatCurrency(summary.weightedPipelineValue)}</p>
          <p className="text-xs text-slate-500">probability-adjusted</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-xs text-slate-500">all time won deals</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Pipeline Funnel</h2>
          </div>
          <div className="p-4 space-y-3">
            {stageDistribution.filter(s => s.count > 0).map(stage => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-300">{stageLabels[stage.stage] || stage.stage}</span>
                  <span className="text-slate-400">{stage.count} · {formatCurrency(stage.value)}</span>
                </div>
                <div className="w-full h-6 bg-slate-800/50 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg ${stageColors[stage.stage] || 'bg-slate-600'} flex items-center px-2`}
                    style={{ width: `${Math.max(8, (stage.count / maxStageCount) * 100)}%` }}
                  >
                    <span className="text-xs text-white font-medium">{stage.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Monthly Trend (3 months)</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {monthlyTrend.map(month => (
                <div key={month.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{month.label}</span>
                    <span className="text-sm text-green-400 font-semibold">{formatCurrency(month.revenue)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                      <p className="text-lg font-bold text-blue-400">{month.leads}</p>
                      <p className="text-xs text-slate-400">New Leads</p>
                    </div>
                    <div className="text-center p-2 bg-green-500/10 rounded-lg">
                      <p className="text-lg font-bold text-green-400">{month.won}</p>
                      <p className="text-xs text-slate-400">Won</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded-lg">
                      <p className="text-lg font-bold text-red-400">{month.lost}</p>
                      <p className="text-xs text-slate-400">Lost</p>
                    </div>
                  </div>
                  {/* Revenue bar */}
                  <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${(month.revenue / maxMonthlyRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversion by Source */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Conversion by Source</h2>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {conversionBySource.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">No data</div>
            ) : (
              conversionBySource.map(source => (
                <div key={source.source} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{source.source.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-400">{source.total} leads · {source.won} won</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${source.rate >= 30 ? 'text-green-400' : source.rate >= 15 ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {source.rate}%
                    </p>
                    <p className="text-xs text-slate-500">{formatCurrency(source.value)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Loss Reasons */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Top Loss Reasons</h2>
          </div>
          <div className="p-4 space-y-3">
            {topLossReasons.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">No lost deals recorded</p>
            ) : (
              topLossReasons.map((item, i) => {
                const maxCount = topLossReasons[0]?.count || 1
                return (
                  <div key={item.reason}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 truncate">{item.reason}</span>
                      <span className="text-red-400 ml-2 flex-shrink-0">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Active Lead Priority</h2>
          </div>
          <div className="p-4 space-y-3">
            {priorityBreakdown.map(p => (
              <div key={p.priority} className={`p-4 rounded-xl border ${priorityColors[p.priority] || ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{p.count}</p>
                    <p className="text-xs opacity-80">{p.priority} leads</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(p.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rep Performance Table */}
      {repPerformance.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Rep Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-xs text-slate-400 font-medium">Rep</th>
                  <th className="text-center p-3 text-xs text-slate-400 font-medium">Leads</th>
                  <th className="text-center p-3 text-xs text-slate-400 font-medium">Won</th>
                  <th className="text-center p-3 text-xs text-slate-400 font-medium">Lost</th>
                  <th className="text-center p-3 text-xs text-slate-400 font-medium">Win Rate</th>
                  <th className="text-center p-3 text-xs text-slate-400 font-medium">Activities</th>
                  <th className="text-right p-3 text-xs text-slate-400 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {repPerformance.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-sm text-white font-medium">{rep.name}</td>
                    <td className="p-3 text-sm text-center text-slate-300">{rep.leads}</td>
                    <td className="p-3 text-sm text-center text-green-400">{rep.won}</td>
                    <td className="p-3 text-sm text-center text-red-400">{rep.lost}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        rep.winRate >= 40 ? 'bg-green-500/10 text-green-400' :
                        rep.winRate >= 20 ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {rep.winRate}%
                      </span>
                    </td>
                    <td className="p-3 text-sm text-center text-slate-300">{rep.activities}</td>
                    <td className="p-3 text-sm text-right text-green-400 font-medium">{formatCurrency(rep.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
