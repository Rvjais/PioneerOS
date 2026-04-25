'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ForecastMonth {
  month: string
  date: string
  expected: number
  projected: number
  optimistic: number
  conservative: number
  isCurrentMonth: boolean
}

interface HistoricalMonth {
  month: string
  date: string
  expected: number
  actual: number
  collectionRate: number
}

interface SegmentData {
  expected: number
  clientCount: number
  atRisk: number
}

interface Summary {
  monthlyExpected: number
  overallCollectionRate: number
  atRiskRevenue: number
  atRiskClients: number
  activeClients: number
  next30DaysExpected: number
  upcomingInvoiceCount: number
}

interface UpcomingInvoice {
  amount: number
  dueDate: string
  clientName: string
}

interface ForecastData {
  forecast: ForecastMonth[]
  historical: HistoricalMonth[]
  segmentBreakdown: Record<string, SegmentData>
  summary: Summary
  upcomingInvoices: UpcomingInvoice[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatINRCompact(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return formatINR(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Segment label / color map
// ---------------------------------------------------------------------------

const segmentMeta: Record<string, { label: string; color: string; bg: string }> = {
  MARKETING: { label: 'Marketing', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  DEVELOPMENT: { label: 'Development', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  DESIGN: { label: 'Design', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  CONSULTING: { label: 'Consulting', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  SEO: { label: 'SEO', color: 'text-green-400', bg: 'bg-green-500/20' },
  CONTENT: { label: 'Content', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  SOCIAL_MEDIA: { label: 'Social Media', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  BRANDING: { label: 'Branding', color: 'text-rose-400', bg: 'bg-rose-500/20' },
  OTHER: { label: 'Other', color: 'text-slate-400', bg: 'bg-slate-500/20' },
}

function getSegmentMeta(key: string) {
  return segmentMeta[key] ?? { label: key.replace(/_/g, ' '), color: 'text-slate-400', bg: 'bg-slate-500/20' }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RevenueForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await fetch('/api/accounts/revenue-forecast')
        if (!res.ok) throw new Error('Failed to load forecast data')
        const json: ForecastData = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message ?? 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchForecast()
  }, [])

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-slate-700/50 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-28 bg-slate-800/50 rounded-xl border border-slate-700 animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-slate-800/50 rounded-xl border border-slate-700 animate-pulse" />
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error || !data) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-medium mb-2">Failed to load forecast</p>
          <p className="text-slate-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { forecast, historical, segmentBreakdown, summary, upcomingInvoices } = data

  // --- Compute chart scale ---
  const allValues = [
    ...historical.map((h) => Math.max(h.expected, h.actual)),
    ...forecast.map((f) => Math.max(f.optimistic, f.projected, f.expected, f.conservative)),
  ]
  const chartMax = Math.max(...allValues, 1)

  const barHeight = (val: number) => Math.max((val / chartMax) * 100, 2)

  return (
    <div className="min-h-screen p-6">
      <PageGuide pageKey="revenue-forecast" title="Revenue Forecast" description="View projected revenue across clients and service tiers." />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-4">
          <Link
            href="/accounts"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Revenue Forecast</h1>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Summary Cards                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard label="Monthly Expected" value={formatINR(summary.monthlyExpected)} />
          <SummaryCard
            label="Collection Rate"
            value={`${summary.overallCollectionRate.toFixed(1)}%`}
            accent={summary.overallCollectionRate >= 90 ? 'text-emerald-400' : summary.overallCollectionRate >= 70 ? 'text-amber-400' : 'text-red-400'}
          />
          <SummaryCard label="At-Risk Revenue" value={formatINR(summary.atRiskRevenue)} accent="text-red-400" />
          <SummaryCard label="Next 30 Days" value={formatINR(summary.next30DaysExpected)} />
          <SummaryCard
            label="Active Clients"
            value={String(summary.activeClients)}
            sub={`${summary.atRiskClients} at risk`}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Combined Bar Chart                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Historical &amp; Forecast</h2>
          <p className="text-slate-400 text-sm mb-6">
            Revenue trend across past months and upcoming projections
          </p>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" /> Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-slate-500/60 border border-dashed border-slate-400" /> Expected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" /> Projected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-400/30" /> Optimistic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-amber-500/50" /> Conservative
            </span>
          </div>

          {/* Chart area */}
          <div className="relative">
            {/* Y-axis guides */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[100, 75, 50, 25, 0].map((pct) => (
                <div key={pct} className="flex items-center gap-2 w-full">
                  <span className="text-[10px] text-slate-500 w-12 text-right shrink-0">
                    {formatINRCompact(chartMax * (pct / 100))}
                  </span>
                  <div className="flex-1 border-t border-slate-700/50" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end gap-1 sm:gap-2 pl-14" style={{ height: 260 }}>
              {/* Historical months */}
              {historical.map((h) => (
                <div key={h.month} className="flex-1 flex flex-col items-center min-w-0 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
                    <p className="text-white font-medium mb-1">{h.month}</p>
                    <p className="text-slate-300">Expected: {formatINR(h.expected)}</p>
                    <p className="text-emerald-400">Actual: {formatINR(h.actual)}</p>
                    <p className="text-slate-400">Rate: {h.collectionRate.toFixed(1)}%</p>
                  </div>
                  {/* Bars */}
                  <div className="w-full flex items-end justify-center gap-px" style={{ height: '100%' }}>
                    {/* Expected (outline bar) */}
                    <div
                      className="w-[40%] border border-dashed border-slate-400 rounded-t-sm bg-slate-500/10 transition-all"
                      style={{ height: `${barHeight(h.expected)}%` }}
                    />
                    {/* Actual (solid bar) */}
                    <div
                      className="w-[40%] bg-emerald-500 rounded-t-sm transition-all"
                      style={{ height: `${barHeight(h.actual)}%` }}
                    />
                  </div>
                  {/* Label */}
                  <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                    {h.month}
                  </span>
                </div>
              ))}

              {/* Divider */}
              {historical.length > 0 && forecast.length > 0 && (
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="w-px bg-slate-600 h-full" />
                  <span className="text-[9px] text-slate-500 mt-2">Now</span>
                </div>
              )}

              {/* Forecast months */}
              {forecast.map((f) => (
                <div
                  key={f.month}
                  className={`flex-1 flex flex-col items-center min-w-0 h-full justify-end group relative ${
                    f.isCurrentMonth ? 'ring-1 ring-blue-500/30 rounded-t-lg' : ''
                  }`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
                    <p className="text-white font-medium mb-1">
                      {f.month} {f.isCurrentMonth && '(current)'}
                    </p>
                    <p className="text-slate-300">Expected: {formatINR(f.expected)}</p>
                    <p className="text-blue-400">Projected: {formatINR(f.projected)}</p>
                    <p className="text-blue-300">Optimistic: {formatINR(f.optimistic)}</p>
                    <p className="text-amber-400">Conservative: {formatINR(f.conservative)}</p>
                  </div>
                  {/* Layered bars */}
                  <div className="w-full flex items-end justify-center relative" style={{ height: '100%' }}>
                    {/* Optimistic (tallest, faint) */}
                    <div
                      className="absolute bottom-0 left-[15%] right-[15%] bg-blue-400/15 rounded-t-sm transition-all"
                      style={{ height: `${barHeight(f.optimistic)}%` }}
                    />
                    {/* Projected (mid) */}
                    <div
                      className="absolute bottom-0 left-[15%] right-[15%] bg-blue-500/70 rounded-t-sm transition-all"
                      style={{ height: `${barHeight(f.projected)}%` }}
                    />
                    {/* Conservative (shortest, distinct) */}
                    <div
                      className="absolute bottom-0 left-[15%] right-[15%] bg-amber-500/40 rounded-t-sm transition-all"
                      style={{ height: `${barHeight(f.conservative)}%` }}
                    />
                    {/* Expected line indicator */}
                    <div
                      className="absolute left-[10%] right-[10%] border-t-2 border-dashed border-slate-400 transition-all"
                      style={{ bottom: `${barHeight(f.expected)}%` }}
                    />
                  </div>
                  {/* Label */}
                  <span className={`text-[10px] mt-2 truncate w-full text-center ${f.isCurrentMonth ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}>
                    {f.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Segment Breakdown                                                */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Segment Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(segmentBreakdown).map(([key, seg]) => {
              const meta = getSegmentMeta(key)
              return (
                <div
                  key={key}
                  className="glass-card rounded-xl border border-white/10 p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                      {seg.clientCount} client{seg.clientCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatINR(seg.expected)}</p>
                  {seg.atRisk > 0 && (
                    <p className="text-xs text-red-400">
                      {seg.atRisk} at-risk client{seg.atRisk !== 1 ? 's' : ''}
                    </p>
                  )}
                  {seg.atRisk === 0 && (
                    <p className="text-xs text-slate-500">No at-risk clients</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Upcoming Invoices                                                */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Upcoming Invoices</h2>
              <p className="text-slate-400 text-sm">
                {summary.upcomingInvoiceCount} invoice{summary.upcomingInvoiceCount !== 1 ? 's' : ''} due in the next 30 days
              </p>
            </div>
          </div>

          {upcomingInvoices.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No upcoming invoices</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left py-3 px-2 font-medium">Client</th>
                    <th className="text-right py-3 px-2 font-medium">Amount</th>
                    <th className="text-right py-3 px-2 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingInvoices.map((inv, idx) => {
                    const due = new Date(inv.dueDate)
                    const now = new Date()
                    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    const isUrgent = daysUntil <= 7

                    return (
                      <tr
                        key={`${inv.clientName}-${inv.dueDate}`}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-2 text-white">{inv.clientName}</td>
                        <td className="py-3 px-2 text-right text-slate-300 font-medium">
                          {formatINR(inv.amount)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={isUrgent ? 'text-amber-400' : 'text-slate-300'}>
                            {formatDate(inv.dueDate)}
                          </span>
                          {isUrgent && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                              {daysUntil <= 0 ? 'Due' : `${daysUntil}d`}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary Card Sub-component
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string
  value: string
  accent?: string
  sub?: string
}) {
  return (
    <div className="glass-card rounded-xl border border-white/10 p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className={`text-xl font-bold ${accent ?? 'text-white'}`}>{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  )
}
