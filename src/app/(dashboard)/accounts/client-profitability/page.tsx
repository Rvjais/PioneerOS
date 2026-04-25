'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

interface ClientInfo {
  id: string
  name: string
  tier: string
  serviceSegment: string
  monthlyFee: number
}

interface ClientRevenue {
  gross: number
  net: number
  expected: number
  collectionRate: number
  paymentCount: number
}

interface ClientCosts {
  directExpense: number
  allocatedSalary: number
  totalCost: number
  teamMembers: number
}

interface ClientProfitability {
  profit: number
  margin: number
  revenuePerTeamMember: number
}

interface ClientEntry {
  client: ClientInfo
  revenue: ClientRevenue
  costs: ClientCosts
  profitability: ClientProfitability
}

interface Summary {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  avgMargin: number
  totalClients: number
  profitable: number
  unprofitable: number
}

interface PeriodInfo {
  months: number
  startDate: string
}

interface ProfitabilityData {
  clients: ClientEntry[]
  summary: Summary
  period: PeriodInfo
}

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const PERIOD_OPTIONS = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
]

const SEGMENTS = [
  { value: '', label: 'All Segments' },
  { value: 'SME', label: 'SME' },
  { value: 'Startup', label: 'Startup' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Agency', label: 'Agency' },
]

const TIER_COLORS: Record<string, string> = {
  Gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Silver: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
  Platinum: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Bronze: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export default function ClientProfitabilityPage() {
  const [data, setData] = useState<ProfitabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [months, setMonths] = useState(3)
  const [segment, setSegment] = useState('')

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ months: String(months), segment })
    fetch(`/api/accounts/client-profitability?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load profitability data')
        return res.json()
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [months, segment])

  const sortedClients = useMemo(() => {
    if (!data) return []
    return [...data.clients].sort(
      (a, b) => b.profitability.profit - a.profitability.profit
    )
  }, [data])

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="client-profitability"
        title="Client Profitability"
        description="Analyze per-client profitability by comparing revenue against allocated costs including salaries and direct expenses."
        steps={[
          { label: 'Filter', description: 'Choose a time period and segment to narrow the analysis.' },
          { label: 'Review', description: 'Examine each client card for revenue, costs, and margin breakdown.' },
          { label: 'Act', description: 'Identify unprofitable clients (red border) and explore optimization strategies.' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/accounts"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Client Profitability</h1>
            <p className="text-sm text-slate-400">Per-client revenue, costs & margin analysis</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg border border-slate-700 p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMonths(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                months === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
        >
          {SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card rounded-xl border border-red-500/30 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Revenue</p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatINR(data.summary.totalRevenue)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Cost</p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatINR(data.summary.totalCost)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Profit</p>
              <p
                className={`text-lg font-semibold mt-1 ${
                  data.summary.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formatINR(data.summary.totalProfit)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Avg Margin</p>
              <p
                className={`text-lg font-semibold mt-1 ${
                  data.summary.avgMargin >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {data.summary.avgMargin.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Profitable</p>
              <p className="text-lg font-semibold text-emerald-400 mt-1">
                {data.summary.profitable}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Unprofitable</p>
              <p className="text-lg font-semibold text-red-400 mt-1">
                {data.summary.unprofitable}
              </p>
            </div>
          </div>

          {/* Client Cards */}
          {sortedClients.length === 0 ? (
            <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
              <p className="text-slate-400">No clients found for the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedClients.map((entry) => {
                const isProfitable = entry.profitability.profit >= 0
                const maxRevenue = Math.max(entry.revenue.expected, entry.revenue.net, 1)
                const actualBarWidth = (entry.revenue.net / maxRevenue) * 100
                const expectedBarWidth = (entry.revenue.expected / maxRevenue) * 100
                const salaryPct =
                  entry.costs.totalCost > 0
                    ? (entry.costs.allocatedSalary / entry.costs.totalCost) * 100
                    : 0
                const directPct =
                  entry.costs.totalCost > 0
                    ? (entry.costs.directExpense / entry.costs.totalCost) * 100
                    : 0

                return (
                  <div
                    key={entry.client.id}
                    className={`glass-card rounded-xl border p-5 space-y-4 ${
                      isProfitable ? 'border-white/10' : 'border-red-500/40'
                    }`}
                  >
                    {/* Client Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{entry.client.name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            TIER_COLORS[entry.client.tier] ||
                            'bg-slate-600/20 text-slate-300 border-slate-500/30'
                          }`}
                        >
                          {entry.client.tier}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {entry.client.serviceSegment}
                      </span>
                    </div>

                    {/* Revenue Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Revenue</span>
                        <span className="text-slate-300">
                          {formatINR(entry.revenue.net)}{' '}
                          <span className="text-slate-500">
                            / {formatINR(entry.revenue.expected)} expected
                          </span>
                        </span>
                      </div>
                      <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        {/* Expected (background bar) */}
                        <div
                          className="absolute top-0 left-0 h-full bg-blue-500/20 rounded-full"
                          style={{ width: `${expectedBarWidth}%` }}
                        />
                        {/* Actual (foreground bar) */}
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full ${
                            entry.revenue.net >= entry.revenue.expected
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${actualBarWidth}%` }}
                        />
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Costs</span>
                        <span className="text-slate-300">{formatINR(entry.costs.totalCost)}</span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-slate-700/50">
                        <div
                          className="bg-purple-500 h-full"
                          style={{ width: `${salaryPct}%` }}
                          title={`Salary: ${formatINR(entry.costs.allocatedSalary)}`}
                        />
                        <div
                          className="bg-orange-500 h-full"
                          style={{ width: `${directPct}%` }}
                          title={`Direct: ${formatINR(entry.costs.directExpense)}`}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                          Salary {formatINR(entry.costs.allocatedSalary)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                          Direct {formatINR(entry.costs.directExpense)}
                        </span>
                      </div>
                    </div>

                    {/* Profit & Stats */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div>
                        <p className="text-xs text-slate-400">Profit</p>
                        <p
                          className={`text-lg font-bold ${
                            isProfitable ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {formatINR(entry.profitability.profit)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Margin</p>
                        <p
                          className={`text-lg font-bold ${
                            isProfitable ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {entry.profitability.margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {entry.costs.teamMembers} member{entry.costs.teamMembers !== 1 ? 's' : ''}
                        </span>
                        <span>
                          {formatINR(entry.profitability.revenuePerTeamMember)}/member
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {entry.revenue.collectionRate.toFixed(0)}% collected
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
