'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DiscrepancyIssue {
  type: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  amount?: number
  clientName?: string
  clientId?: string
  invoiceNumber?: string
  date?: string
}

interface DiscrepancySummary {
  total: number
  high: number
  medium: number
  low: number
  byType: {
    duplicateInvoices: number
    paymentMismatches: number
    feeDiscrepancies: number
    unlinkedPayments: number
    staleOverdue: number
  }
  totalAmountAtRisk: number
}

interface DiscrepancyData {
  issues: DiscrepancyIssue[]
  summary: DiscrepancySummary
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const SEVERITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

const SEVERITY_STYLES: Record<string, string> = {
  HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  LOW: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const TYPE_KEY_MAP: Record<string, string> = {
  'Duplicate Invoice': 'duplicateInvoices',
  'Payment Mismatch': 'paymentMismatches',
  'Fee Discrepancy': 'feeDiscrepancies',
  'Unlinked Payment': 'unlinkedPayments',
  'Stale Overdue': 'staleOverdue',
}

const TYPE_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  duplicateInvoices: {
    label: 'Duplicate Invoices',
    color: 'text-blue-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    ),
  },
  paymentMismatches: {
    label: 'Payment Mismatches',
    color: 'text-amber-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  feeDiscrepancies: {
    label: 'Fee Discrepancies',
    color: 'text-orange-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  unlinkedPayments: {
    label: 'Unlinked Payments',
    color: 'text-purple-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  staleOverdue: {
    label: 'Stale Overdue',
    color: 'text-red-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

const PERIOD_OPTIONS = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months' },
]

const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'Duplicate Invoice', label: 'Duplicate Invoice' },
  { value: 'Payment Mismatch', label: 'Payment Mismatch' },
  { value: 'Fee Discrepancy', label: 'Fee Discrepancy' },
  { value: 'Unlinked Payment', label: 'Unlinked Payment' },
  { value: 'Stale Overdue', label: 'Stale Overdue' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiscrepanciesPage() {
  const [data, setData] = useState<DiscrepancyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [months, setMonths] = useState(3)
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/accounts/discrepancies?months=${months}`)
        if (!res.ok) throw new Error('Failed to fetch discrepancies')
        const json = await res.json()
        setData(json)
      } catch (err: unknown) {
        console.error('Error fetching discrepancies:', err)
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [months])

  // Sorted + filtered issues
  const filteredIssues = useMemo(() => {
    if (!data) return []
    return data.issues
      .filter((i) => typeFilter === 'all' || i.type === typeFilter)
      .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3))
  }, [data, typeFilter])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <PageGuide pageKey="discrepancies" title="Discrepancies" description="Review and resolve billing and payment discrepancies across clients." />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/accounts"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">Financial Discrepancies</h1>
          </div>
          <p className="text-slate-400 mt-1 ml-11">
            Identify and resolve financial inconsistencies across invoices, payments, and fees
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          {PERIOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          {TYPE_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass-card rounded-xl border border-red-500/30 p-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Data loaded */}
      {data && !loading && (
        <>
          {/* Summary Banner */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Issues</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-white">{data.summary.total}</span>
                  <div className="flex gap-2">
                    {data.summary.high > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        {data.summary.high} High
                      </span>
                    )}
                    {data.summary.medium > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {data.summary.medium} Medium
                      </span>
                    )}
                    {data.summary.low > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {data.summary.low} Low
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Total Amount at Risk</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatINR(data.summary.totalAmountAtRisk)}
                </p>
              </div>
            </div>
          </div>

          {/* Issue Type Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(data.summary.byType).map(([key, count]) => {
              const meta = TYPE_META[key]
              if (!meta) return null
              return (
                <div
                  key={key}
                  className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex flex-col gap-2"
                >
                  <div className={`flex items-center gap-2 ${meta.color}`}>
                    {meta.icon}
                    <span className="text-sm font-medium">{meta.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{count}</span>
                </div>
              )
            })}
          </div>

          {/* Issue List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">
              Issues ({filteredIssues.length})
            </h2>

            {filteredIssues.length === 0 ? (
              <div className="glass-card rounded-xl border border-white/10 p-8 text-center text-slate-400">
                No issues match the current filters.
              </div>
            ) : (
              filteredIssues.map((issue, idx) => {
                const typeKey = TYPE_KEY_MAP[issue.type] ?? ''
                const meta = TYPE_META[typeKey]

                return (
                  <div
                    key={`${issue.invoiceNumber ?? ''}-${issue.clientId ?? ''}-${idx}`}
                    className="glass-card rounded-xl border border-white/10 p-5 hover:border-white/20 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.LOW}`}
                          >
                            {issue.severity}
                          </span>
                          {meta && (
                            <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-slate-700/50 border border-slate-600 ${meta.color}`}>
                              {meta.icon}
                              {issue.type}
                            </span>
                          )}
                          {!meta && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700/50 border border-slate-600 text-slate-300">
                              {issue.type}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="text-white font-semibold">{issue.title}</p>

                        {/* Description */}
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {issue.description}
                        </p>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {issue.clientName && issue.clientId && (
                            <Link
                              href={`/clients/${issue.clientId}`}
                              className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                            >
                              {issue.clientName}
                            </Link>
                          )}
                          {issue.clientName && !issue.clientId && (
                            <span className="text-slate-300">{issue.clientName}</span>
                          )}
                          {issue.invoiceNumber && (
                            <span className="text-slate-500">
                              Invoice: <span className="text-slate-300">{issue.invoiceNumber}</span>
                            </span>
                          )}
                          {issue.date && (
                            <span className="text-slate-500">
                              {new Date(issue.date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right - Amount */}
                      {issue.amount != null && (
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-500 mb-0.5">Amount</p>
                          <p className="text-lg font-bold text-amber-400">
                            {formatINR(issue.amount)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
