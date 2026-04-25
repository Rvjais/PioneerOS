'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

interface AgingSummaryBucket {
  count: number
  outstanding: number
}

interface AgingSummary {
  current: AgingSummaryBucket
  days0to30: AgingSummaryBucket
  days31to60: AgingSummaryBucket
  days61to90: AgingSummaryBucket
  days90plus: AgingSummaryBucket
  totalOutstanding: number
  totalInvoices: number
}

interface ClientBreakdownItem {
  client: {
    id: string
    name: string
    tier: string
    monthlyFee: number
    serviceSegment: string
  }
  current: number
  days0to30: number
  days31to60: number
  days61to90: number
  days90plus: number
  total: number
  invoiceCount: number
}

interface AgingReportData {
  summary: AgingSummary
  clientBreakdown: ClientBreakdownItem[]
}

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const ENTITY_TYPES = [
  { value: '', label: 'All Entity Types' },
  { value: 'client', label: 'Clients' },
  { value: 'vendor', label: 'Vendors' },
]

const SEGMENTS = [
  { value: '', label: 'All Segments' },
  { value: 'SME', label: 'SME' },
  { value: 'Startup', label: 'Startup' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Agency', label: 'Agency' },
]

const BUCKET_CONFIG = [
  { key: 'current' as const, label: 'Current (Not Due)', color: 'emerald', bgClass: 'bg-emerald-500', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/30' },
  { key: 'days0to30' as const, label: '0-30 Days', color: 'amber', bgClass: 'bg-amber-500', textClass: 'text-amber-400', borderClass: 'border-amber-500/30' },
  { key: 'days31to60' as const, label: '31-60 Days', color: 'orange', bgClass: 'bg-orange-500', textClass: 'text-orange-400', borderClass: 'border-orange-500/30' },
  { key: 'days61to90' as const, label: '61-90 Days', color: 'red', bgClass: 'bg-red-500', textClass: 'text-red-400', borderClass: 'border-red-500/30' },
  { key: 'days90plus' as const, label: '90+ Days', color: 'darkred', bgClass: 'bg-red-700', textClass: 'text-red-300', borderClass: 'border-red-700/30' },
]

export default function AgingReportPage() {
  const [data, setData] = useState<AgingReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entityType, setEntityType] = useState('')
  const [segment, setSegment] = useState('')

  useEffect(() => {
    fetchData()
  }, [entityType, segment])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (entityType) params.set('entityType', entityType)
      if (segment) params.set('segment', segment)
      const query = params.toString()
      const res = await fetch(`/api/accounts/aging-report${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch aging report')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch aging report:', err)
      setError('Failed to load aging report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sortedBreakdown = useMemo(() => {
    if (!data) return []
    return [...data.clientBreakdown].sort((a, b) => b.total - a.total)
  }, [data])

  const barSegments = useMemo(() => {
    if (!data || data.summary.totalOutstanding === 0) return []
    const total = data.summary.totalOutstanding
    return BUCKET_CONFIG.map((bucket) => {
      const value = data.summary[bucket.key].outstanding
      const pct = (value / total) * 100
      return { ...bucket, value, pct }
    }).filter((s) => s.pct > 0)
  }, [data])

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="aging-report"
        title="Aging Report"
        description="Track outstanding receivables by age. Identify overdue invoices and prioritize collections by viewing how long payments have been pending across all clients."
        steps={[
          { label: 'Summary Cards', description: 'Quick overview of outstanding amounts grouped by aging buckets.' },
          { label: 'Distribution Bar', description: 'Visual breakdown of how receivables are distributed across age buckets.' },
          { label: 'Client Breakdown', description: 'Detailed per-client table sorted by total outstanding, with color-coded overdue amounts.' },
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
          <div>
            <h1 className="text-2xl font-bold text-white">AR Aging Report</h1>
            <p className="text-slate-400 text-sm mt-1">
              Accounts receivable aging analysis
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50"
        >
          {ENTITY_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50"
        >
          {SEGMENTS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="glass-card rounded-xl border border-red-500/30 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {BUCKET_CONFIG.map((bucket) => {
              const bucketData = data.summary[bucket.key]
              return (
                <div
                  key={bucket.key}
                  className={`bg-slate-800/50 rounded-xl border border-slate-700 p-4 relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 ${bucket.bgClass}`} />
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                    {bucket.label}
                  </p>
                  <p className={`text-xl font-bold mt-2 ${bucket.textClass}`}>
                    {formatINR(bucketData.outstanding)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {bucketData.count} invoice{bucketData.count !== 1 ? 's' : ''}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Total Outstanding */}
          <div className="glass-card rounded-xl border border-white/10 p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Outstanding</p>
              <p className="text-2xl font-bold text-white">
                {formatINR(data.summary.totalOutstanding)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold text-white">
                {data.summary.totalInvoices}
              </p>
            </div>
          </div>

          {/* Aging Distribution Bar */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="text-white font-semibold mb-4">Aging Distribution</h2>
            {data.summary.totalOutstanding > 0 ? (
              <>
                <div className="flex rounded-lg overflow-hidden h-10">
                  {barSegments.map((seg) => (
                    <div
                      key={seg.key}
                      className={`${seg.bgClass} relative group transition-all`}
                      style={{ width: `${seg.pct}%`, minWidth: seg.pct > 0 ? '2px' : '0' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {seg.pct >= 8 && (
                          <span className="text-white text-xs font-bold drop-shadow">
                            {seg.pct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                          <p className="text-white font-medium">{seg.label}</p>
                          <p className="text-slate-400">{formatINR(seg.value)} ({seg.pct.toFixed(1)}%)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {barSegments.map((seg) => (
                    <div key={seg.key} className="flex items-center gap-2 text-xs">
                      <div className={`w-3 h-3 rounded-sm ${seg.bgClass}`} />
                      <span className="text-slate-400">
                        {seg.label}: {seg.pct.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-center py-4">No outstanding amounts</p>
            )}
          </div>

          {/* Client Breakdown Table */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Client Breakdown</h2>
              <p className="text-slate-400 text-xs mt-1">
                {sortedBreakdown.length} client{sortedBreakdown.length !== 1 ? 's' : ''} with outstanding invoices
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left text-slate-400 font-medium px-4 py-3">Client</th>
                    <th className="text-left text-slate-400 font-medium px-3 py-3">Tier</th>
                    <th className="text-right text-emerald-400/70 font-medium px-3 py-3">Current</th>
                    <th className="text-right text-amber-400/70 font-medium px-3 py-3">0-30</th>
                    <th className="text-right text-orange-400/70 font-medium px-3 py-3">31-60</th>
                    <th className="text-right text-red-400/70 font-medium px-3 py-3">61-90</th>
                    <th className="text-right text-red-300/70 font-medium px-3 py-3">90+</th>
                    <th className="text-right text-white font-medium px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-slate-500 py-8">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    sortedBreakdown.map((row) => (
                      <tr
                        key={row.client.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/accounts/clients/${row.client.id}`}
                            className="text-white hover:text-orange-400 transition-colors font-medium"
                          >
                            {row.client.name}
                          </Link>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {row.client.serviceSegment} &middot; {row.invoiceCount} invoice{row.invoiceCount !== 1 ? 's' : ''}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-slate-300 text-xs px-2 py-0.5 rounded-full bg-slate-700/50 border border-slate-600/50">
                            {row.client.tier}
                          </span>
                        </td>
                        <td className="text-right px-3 py-3 text-slate-300 tabular-nums">
                          {row.current > 0 ? formatINR(row.current) : <span className="text-slate-600">-</span>}
                        </td>
                        <td className={`text-right px-3 py-3 tabular-nums ${row.days0to30 > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                          {row.days0to30 > 0 ? formatINR(row.days0to30) : '-'}
                        </td>
                        <td className={`text-right px-3 py-3 tabular-nums ${row.days31to60 > 0 ? 'text-orange-400' : 'text-slate-600'}`}>
                          {row.days31to60 > 0 ? formatINR(row.days31to60) : '-'}
                        </td>
                        <td className={`text-right px-3 py-3 tabular-nums ${row.days61to90 > 0 ? 'text-red-400 font-medium' : 'text-slate-600'}`}>
                          {row.days61to90 > 0 ? formatINR(row.days61to90) : '-'}
                        </td>
                        <td className={`text-right px-3 py-3 tabular-nums ${row.days90plus > 0 ? 'text-red-300 font-bold' : 'text-slate-600'}`}>
                          {row.days90plus > 0 ? formatINR(row.days90plus) : '-'}
                        </td>
                        <td className="text-right px-4 py-3 text-white font-semibold tabular-nums">
                          {formatINR(row.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {sortedBreakdown.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-700 bg-slate-800/30">
                      <td className="px-4 py-3 text-white font-semibold" colSpan={2}>
                        Total
                      </td>
                      <td className="text-right px-3 py-3 text-emerald-400 font-semibold tabular-nums">
                        {formatINR(data.summary.current.outstanding)}
                      </td>
                      <td className="text-right px-3 py-3 text-amber-400 font-semibold tabular-nums">
                        {formatINR(data.summary.days0to30.outstanding)}
                      </td>
                      <td className="text-right px-3 py-3 text-orange-400 font-semibold tabular-nums">
                        {formatINR(data.summary.days31to60.outstanding)}
                      </td>
                      <td className="text-right px-3 py-3 text-red-400 font-semibold tabular-nums">
                        {formatINR(data.summary.days61to90.outstanding)}
                      </td>
                      <td className="text-right px-3 py-3 text-red-300 font-semibold tabular-nums">
                        {formatINR(data.summary.days90plus.outstanding)}
                      </td>
                      <td className="text-right px-4 py-3 text-white font-bold tabular-nums">
                        {formatINR(data.summary.totalOutstanding)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
