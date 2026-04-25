'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

interface Summary {
  totalProposals: number
  activeInPipeline: number
  activated: number
  stuck: number
  pipelineValue: number
  activatedValue: number
  conversionRate: number
}

interface StageTime {
  stage: string
  avgDays: number
  minDays: number
  maxDays: number
  count: number
}

interface StuckProposal {
  id: string
  prospectName: string
  prospectCompany: string
  status: string
  currentStep: number
  stepName: string
  totalPrice: number
  daysSinceCreated: number
  createdAt: string
}

interface FunnelStep {
  status: string
  count: number
  dropoff: number
}

interface MonthlyTrend {
  month: string
  created: number
  activated: number
  value: number
}

interface AnalyticsData {
  summary: Summary
  avgStageTime: StageTime[]
  stuckProposals: StuckProposal[]
  funnel: FunnelStep[]
  monthlyTrend: MonthlyTrend[]
}

function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function OnboardingAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/accounts/onboarding-analytics')
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch onboarding analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700/50 rounded w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-28 bg-slate-700/50 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-700/50 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || 'No data available'}</p>
          <button onClick={fetchAnalytics} className="mt-3 text-sm text-orange-400 hover:text-orange-300">
            Try again
          </button>
        </div>
      </div>
    )
  }

  const { summary, avgStageTime, stuckProposals, funnel, monthlyTrend } = data
  const maxFunnelCount = funnel.length > 0 ? Math.max(...funnel.map(f => f.count)) : 1
  const maxStageDays = avgStageTime.length > 0 ? Math.max(...avgStageTime.map(s => s.maxDays)) : 1
  const maxMonthlyValue = monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map(m => Math.max(m.created, m.activated))) : 1
  const sortedStuck = [...stuckProposals].sort((a, b) => b.daysSinceCreated - a.daysSinceCreated)

  return (
    <div className="p-6 space-y-6">
      <PageGuide
        pageKey="onboarding-analytics"
        title="Onboarding Analytics"
        description="Track your onboarding pipeline performance, conversion rates, stage timing, and identify stuck proposals that need attention."
        steps={[
          { label: 'Summary Cards', description: 'Overview of pipeline health and conversion metrics' },
          { label: 'Conversion Funnel', description: 'Visual breakdown of proposals at each stage with drop-off rates' },
          { label: 'Stage Timing', description: 'Average time spent in each pipeline stage' },
          { label: 'Stuck Proposals', description: 'Proposals that haven\'t progressed and may need intervention' },
          { label: 'Monthly Trends', description: 'Created vs activated proposals over time' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/accounts"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white">Onboarding Analytics</h1>
        </div>
        <Link
          href="/accounts/onboarding"
          className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          View Pipeline &rarr;
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Total Proposals</p>
          <p className="text-2xl font-bold text-white mt-1">{summary.totalProposals}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">In Pipeline</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{summary.activeInPipeline}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Activated</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{summary.activated}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{summary.conversionRate}%</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Pipeline Value</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatINR(summary.pipelineValue)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{formatINRFull(summary.pipelineValue)}</p>
        </div>
        <div className={`glass-card rounded-xl border ${summary.stuck > 0 ? 'border-red-500/40 bg-red-500/5' : 'border-white/10'} p-4`}>
          <p className="text-xs text-slate-400 uppercase tracking-wide">Stuck</p>
          <p className={`text-2xl font-bold mt-1 ${summary.stuck > 0 ? 'text-red-400' : 'text-slate-300'}`}>
            {summary.stuck}
          </p>
          {summary.stuck > 0 && (
            <p className="text-[10px] text-red-400/70 mt-0.5">Needs attention</p>
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h2>
        <div className="space-y-3">
          {funnel.map((step, idx) => {
            const widthPct = maxFunnelCount > 0 ? (step.count / maxFunnelCount) * 100 : 0
            const colors = [
              'bg-blue-500/80',
              'bg-indigo-500/80',
              'bg-purple-500/80',
              'bg-violet-500/80',
              'bg-fuchsia-500/80',
              'bg-emerald-500/80',
            ]
            const color = colors[idx % colors.length]

            return (
              <div key={step.status} className="flex items-center gap-4">
                <div className="w-36 text-right">
                  <span className="text-sm text-slate-300 truncate block">{step.status}</span>
                </div>
                <div className="flex-1 relative">
                  <div
                    className={`${color} h-10 rounded-lg flex items-center transition-all duration-500`}
                    style={{
                      width: `${Math.max(widthPct, 4)}%`,
                      clipPath: idx < funnel.length - 1
                        ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
                        : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                    }}
                  >
                    <span className="text-white text-sm font-semibold ml-3 whitespace-nowrap">
                      {step.count}
                    </span>
                  </div>
                </div>
                <div className="w-20 text-right">
                  {step.dropoff > 0 ? (
                    <span className="text-xs text-red-400">-{step.dropoff}% drop</span>
                  ) : idx === 0 ? (
                    <span className="text-xs text-slate-500">--</span>
                  ) : (
                    <span className="text-xs text-emerald-400">0% drop</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Avg Time Per Stage */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Average Time Per Stage</h2>
        {avgStageTime.length === 0 ? (
          <p className="text-slate-500 text-sm">No stage timing data available yet.</p>
        ) : (
          <div className="space-y-4">
            {avgStageTime.map((stage) => {
              const avgPct = maxStageDays > 0 ? (stage.avgDays / maxStageDays) * 100 : 0
              const minPct = maxStageDays > 0 ? (stage.minDays / maxStageDays) * 100 : 0
              const maxPct = maxStageDays > 0 ? (stage.maxDays / maxStageDays) * 100 : 0

              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{stage.stage}</span>
                    <span className="text-xs text-slate-500">{stage.count} proposals</span>
                  </div>
                  <div className="relative h-8 bg-slate-700/30 rounded-lg overflow-hidden">
                    {/* Min-Max range bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2 bg-slate-600/60 rounded-full"
                      style={{
                        left: `${minPct}%`,
                        width: `${Math.max(maxPct - minPct, 1)}%`,
                      }}
                    />
                    {/* Average bar */}
                    <div
                      className="absolute top-0 left-0 h-full bg-orange-500/70 rounded-lg flex items-center transition-all duration-500"
                      style={{ width: `${Math.max(avgPct, 3)}%` }}
                    >
                      <span className="text-white text-xs font-semibold ml-2 whitespace-nowrap">
                        {stage.avgDays.toFixed(1)}d
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] text-slate-500">Min: {stage.minDays}d</span>
                    <span className="text-[10px] text-slate-500">Max: {stage.maxDays}d</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stuck Proposals Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Stuck Proposals</h2>
          {sortedStuck.length > 0 && (
            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
              {sortedStuck.length} stuck
            </span>
          )}
        </div>
        {sortedStuck.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No stuck proposals. Pipeline is healthy.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-700">
                  <th className="pb-3 text-slate-400 font-medium">Prospect</th>
                  <th className="pb-3 text-slate-400 font-medium">Company</th>
                  <th className="pb-3 text-slate-400 font-medium">Stage</th>
                  <th className="pb-3 text-slate-400 font-medium text-right">Days Stuck</th>
                  <th className="pb-3 text-slate-400 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sortedStuck.map((p) => {
                  const isRed = p.daysSinceCreated > 14
                  return (
                    <tr
                      key={p.id}
                      className={`${isRed ? 'bg-red-500/5' : ''} hover:bg-white/5 transition-colors`}
                    >
                      <td className="py-3">
                        <Link
                          href={`/accounts/onboarding/${p.id}`}
                          className="text-white hover:text-orange-400 transition-colors"
                        >
                          {p.prospectName}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-300">{p.prospectCompany || '-'}</td>
                      <td className="py-3">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          {p.stepName || `Step ${p.currentStep}`}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-mono font-semibold ${isRed ? 'text-red-400' : 'text-amber-400'}`}>
                        {p.daysSinceCreated}d
                      </td>
                      <td className="py-3 text-right text-slate-300">
                        {formatINRFull(p.totalPrice)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Monthly Trend</h2>
        {monthlyTrend.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No trend data available yet.</p>
        ) : (
          <>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-xs text-slate-400">Created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-xs text-slate-400">Activated</span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-48">
              {monthlyTrend.map((m) => {
                const createdH = maxMonthlyValue > 0 ? (m.created / maxMonthlyValue) * 100 : 0
                const activatedH = maxMonthlyValue > 0 ? (m.activated / maxMonthlyValue) * 100 : 0

                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 w-full h-40">
                      {/* Created bar */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-[10px] text-blue-400 mb-1">{m.created}</span>
                        <div
                          className="w-full bg-blue-500/70 rounded-t-md transition-all duration-500"
                          style={{ height: `${Math.max(createdH, 2)}%` }}
                        />
                      </div>
                      {/* Activated bar */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-[10px] text-emerald-400 mb-1">{m.activated}</span>
                        <div
                          className="w-full bg-emerald-500/70 rounded-t-md transition-all duration-500"
                          style={{ height: `${Math.max(activatedH, 2)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 truncate w-full text-center">
                      {m.month}
                    </span>
                    <span className="text-[9px] text-slate-600">{formatINR(m.value)}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
