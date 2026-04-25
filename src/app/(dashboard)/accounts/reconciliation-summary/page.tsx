'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

interface StatementSummary {
  id: string
  bankName: string
  accountNumber: string | null
  statementMonth: string
  status: string
  openingBalance: number | null
  closingBalance: number | null
  totalCredits: number
  totalDebits: number
  transactionCount: number
  creditCount: number
  debitCount: number
  matchedCount: number
  unmatchedCount: number
  ignoredCount: number
  reviewedCount: number
  matchRate: number
  reviewRate: number
  unmatchedCredits: number
  unmatchedDebits: number
}

interface OverallSummary {
  totalStatements: number
  processedStatements: number
  totalTransactions: number
  totalMatched: number
  totalUnmatched: number
  overallMatchRate: number
  unlinkedPaymentCount: number
  unlinkedPaymentAmount: number
  invoicesWithoutPayments: number
}

interface UnlinkedPayment {
  id: string
  amount: number
  reference: string
  date: string
}

interface InvoiceDiscrepancy {
  invoiceNumber: string
  amount: number
  clientName: string
}

interface ReconciliationData {
  statements: StatementSummary[]
  summary: OverallSummary
  unlinkedPayments: UnlinkedPayment[]
  invoiceDiscrepancies: InvoiceDiscrepancy[]
}

interface Entity {
  id: string
  code: string
  name: string
}

export default function ReconciliationSummaryPage() {
  const [data, setData] = useState<ReconciliationData | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)

  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [entityFilter, setEntityFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [monthFilter, entityFilter])

  useEffect(() => {
    fetchEntities()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (monthFilter) params.append('month', monthFilter)
      if (entityFilter) params.append('entityId', entityFilter)

      const res = await fetch(`/api/accounts/reconciliation-summary?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        toast.error('Failed to load reconciliation summary')
      }
    } catch (error) {
      console.error('Failed to fetch reconciliation summary:', error)
      toast.error('Failed to load reconciliation summary')
    } finally {
      setLoading(false)
    }
  }

  const fetchEntities = async () => {
    try {
      const res = await fetch('/api/admin/entities')
      if (res.ok) {
        const json = await res.json()
        setEntities(json.entities || [])
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error)
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyCompact = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-'
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)}Cr`
    if (amount >= 100000) return `${(amount / 100000).toFixed(2)}L`
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }

  const getMatchRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400'
    if (rate >= 70) return 'text-amber-400'
    return 'text-red-400'
  }

  const getMatchRateBg = (rate: number) => {
    if (rate >= 90) return 'bg-green-500'
    if (rate >= 70) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getMatchRateBorder = (rate: number) => {
    if (rate >= 90) return 'border-green-500/30'
    if (rate >= 70) return 'border-amber-500/30'
    return 'border-red-500/30'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const summary = data?.summary
  const statements = data?.statements || []
  const unlinkedPayments = data?.unlinkedPayments || []
  const invoiceDiscrepancies = data?.invoiceDiscrepancies || []

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        title="Reconciliation Summary"
        description="Overview of bank statement reconciliation status, match rates, unlinked payments, and invoice discrepancies."
        pageKey="reconciliation-summary"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reconciliation Summary</h1>
          <p className="text-slate-400 text-sm mt-1">
            Bank statement matching overview for {monthFilter ? formatMonth(monthFilter) : 'all months'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/accounts"
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Back to Accounts
          </Link>
          <Link
            href="/accounts/bank-statements"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Bank Statements
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Month</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-800/50 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Entity</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-800/50 text-white"
            >
              <option value="">All Entities</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>{e.code} - {e.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-slate-400 text-sm">Total Statements</p>
            <p className="text-2xl font-bold text-white mt-1">{summary.totalStatements}</p>
            <p className="text-xs text-slate-500 mt-1">
              {summary.processedStatements} processed
            </p>
          </div>

          <div className={`glass-card rounded-xl border ${getMatchRateBorder(summary.overallMatchRate)} p-4`}>
            <p className="text-slate-400 text-sm">Overall Match Rate</p>
            <p className={`text-2xl font-bold mt-1 ${getMatchRateColor(summary.overallMatchRate)}`}>
              {summary.overallMatchRate.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {summary.totalMatched}/{summary.totalTransactions} transactions
            </p>
          </div>

          <div className="glass-card rounded-xl border border-amber-500/30 p-4">
            <p className="text-slate-400 text-sm">Unlinked Payments</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{summary.unlinkedPaymentCount}</p>
            <p className="text-xs text-amber-400/70 mt-1">
              {formatCurrency(summary.unlinkedPaymentAmount)}
            </p>
          </div>

          <div className="glass-card rounded-xl border border-red-500/30 p-4">
            <p className="text-slate-400 text-sm">Invoice Discrepancies</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{summary.invoicesWithoutPayments}</p>
            <p className="text-xs text-red-400/70 mt-1">
              Invoices without matching payments
            </p>
          </div>
        </div>
      )}

      {/* Per-Statement Cards */}
      {statements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Statement Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {statements.map((stmt) => (
              <div
                key={stmt.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-5"
              >
                {/* Bank & Account Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{stmt.bankName}</h3>
                    <p className="text-sm text-slate-400">
                      {stmt.accountNumber ? `A/C ...${stmt.accountNumber}` : 'No account number'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                    {formatMonth(stmt.statementMonth)}
                  </span>
                </div>

                {/* Match Rate Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">Match Rate</span>
                    <span className={`text-sm font-semibold ${getMatchRateColor(stmt.matchRate)}`}>
                      {stmt.matchRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getMatchRateBg(stmt.matchRate)}`}
                      style={{ width: `${Math.min(100, stmt.matchRate)}%` }}
                    />
                  </div>
                </div>

                {/* Transaction Counts */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-green-500/10 rounded-lg py-2">
                    <p className="text-lg font-bold text-green-400">{stmt.matchedCount}</p>
                    <p className="text-xs text-slate-400">Matched</p>
                  </div>
                  <div className="text-center bg-red-500/10 rounded-lg py-2">
                    <p className="text-lg font-bold text-red-400">{stmt.unmatchedCount}</p>
                    <p className="text-xs text-slate-400">Unmatched</p>
                  </div>
                  <div className="text-center bg-slate-700/50 rounded-lg py-2">
                    <p className="text-lg font-bold text-slate-300">{stmt.ignoredCount}</p>
                    <p className="text-xs text-slate-400">Ignored</p>
                  </div>
                </div>

                {/* Credits & Debits */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500">Credits ({stmt.creditCount})</p>
                    <p className="text-sm font-medium text-green-400">
                      {formatCurrencyCompact(stmt.totalCredits)}
                    </p>
                    {stmt.unmatchedCredits > 0 && (
                      <p className="text-xs text-red-400/70 mt-0.5">
                        {formatCurrencyCompact(stmt.unmatchedCredits)} unmatched
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Debits ({stmt.debitCount})</p>
                    <p className="text-sm font-medium text-red-400">
                      {formatCurrencyCompact(stmt.totalDebits)}
                    </p>
                    {stmt.unmatchedDebits > 0 && (
                      <p className="text-xs text-red-400/70 mt-0.5">
                        {formatCurrencyCompact(stmt.unmatchedDebits)} unmatched
                      </p>
                    )}
                  </div>
                </div>

                {/* Balances */}
                {(stmt.openingBalance !== null || stmt.closingBalance !== null) && (
                  <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-700">
                    <div>
                      <p className="text-xs text-slate-500">Opening Balance</p>
                      <p className="text-sm text-slate-300">{formatCurrency(stmt.openingBalance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Closing Balance</p>
                      <p className="text-sm text-slate-300">{formatCurrency(stmt.closingBalance)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {statements.length === 0 && !loading && (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400">No reconciliation data found for the selected period</p>
          <p className="text-sm text-slate-500 mt-1">Try changing the month or entity filter</p>
        </div>
      )}

      {/* Unlinked Payments Table */}
      {unlinkedPayments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Unlinked Payments
            <span className="text-sm font-normal text-slate-400 ml-2">
              ({unlinkedPayments.length} payments not matched to any invoice)
            </span>
          </h2>
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/40 border-b border-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Reference</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {unlinkedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{formatDate(payment.date)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">{payment.reference || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-green-400">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900/40 border-t border-white/10">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm font-medium text-slate-300">
                      Total Unlinked
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-amber-400">
                      {formatCurrency(unlinkedPayments.reduce((sum, p) => sum + p.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Discrepancies Table */}
      {invoiceDiscrepancies.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Invoice Discrepancies
            <span className="text-sm font-normal text-slate-400 ml-2">
              ({invoiceDiscrepancies.length} invoices without matching payments)
            </span>
          </h2>
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/40 border-b border-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Invoice Number</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {invoiceDiscrepancies.map((disc, idx) => (
                    <tr key={`${disc.invoiceNumber}-${idx}`} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-white">{disc.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">{disc.clientName}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-red-400">
                          {formatCurrency(disc.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900/40 border-t border-white/10">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm font-medium text-slate-300">
                      Total Outstanding
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-400">
                      {formatCurrency(invoiceDiscrepancies.reduce((sum, d) => sum + d.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
