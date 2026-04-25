'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

interface TdsClient {
  id: string
  name: string
  panNumber: string
}

interface TdsBreakdown {
  client: TdsClient
  totalGross: number
  totalTds: number
  tdsPercentage: number
  payments: number
  form16AReceived: boolean
}

interface EntityBreakdown {
  entity: string
  grossRevenue: number
  gstCollected: number
  tdsDeducted: number
  netReceived: number
  invoiceCount: number
  paymentCount: number
}

interface TaxComplianceData {
  month: string
  gst: {
    collected: number
    onInvoices: number
    quarterTotal: number
    quarterGross: number
  }
  tds: {
    totalDeducted: number
    clientCount: number
    quarterTotal: number
    breakdown: TdsBreakdown[]
  }
  entityBreakdown: EntityBreakdown[]
  totals: {
    grossRevenue: number
    gstCollected: number
    tdsDeducted: number
    netReceived: number
    invoiceCount: number
    paymentCount: number
  }
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function entityLabel(entity: string): string {
  const labels: Record<string, string> = {
    BRANDING_PIONEERS: 'Branding Pioneers',
    ATZ_MEDAPPZ: 'ATZ Medappz',
  }
  return labels[entity] || entity
}

export default function TaxCompliancePage() {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [data, setData] = useState<TaxComplianceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/accounts/tax-compliance?month=${month}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [month])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageGuide
        pageKey="tax-compliance"
        title="Tax Compliance Report"
        description="View monthly GST collected, TDS deducted by clients, and entity-wise revenue breakdown for filing and reconciliation."
        steps={[
          { label: 'Select month', description: 'Pick the month to view tax data for' },
          { label: 'Review GST', description: 'Compare GST on invoices vs GST received' },
          { label: 'Check TDS', description: 'Verify TDS deducted per client and Form 16A status' },
          { label: 'Entity breakdown', description: 'See revenue split across entities' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/accounts"
            className="text-slate-400 hover:text-white transition text-sm"
          >
            &larr; Back to Accounts
          </Link>
          <h1 className="text-2xl font-bold text-white">Tax Compliance Report</h1>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-slate-400">No data available for this month.</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Gross Revenue', value: data.totals.grossRevenue, color: 'text-white' },
              { label: 'GST Collected', value: data.totals.gstCollected, color: 'text-emerald-400' },
              { label: 'TDS Deducted', value: data.totals.tdsDeducted, color: 'text-amber-400' },
              { label: 'Net Received', value: data.totals.netReceived, color: 'text-blue-400' },
            ].map((card) => (
              <div
                key={card.label}
                className="glass-card rounded-xl border border-white/10 p-5"
              >
                <p className="text-slate-400 text-sm mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{formatINR(card.value)}</p>
              </div>
            ))}
          </div>

          {/* GST Section */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">GST Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Monthly GST Collected</p>
                <p className="text-white text-lg font-semibold">{formatINR(data.gst.collected)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">GST on Invoices</p>
                <p className="text-white text-lg font-semibold">{formatINR(data.gst.onInvoices)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Quarter-to-Date GST</p>
                <p className="text-white text-lg font-semibold">{formatINR(data.gst.quarterTotal)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Quarter Gross Revenue</p>
                <p className="text-white text-lg font-semibold">{formatINR(data.gst.quarterGross)}</p>
              </div>
            </div>

            {/* GST Comparison */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h3 className="text-sm font-medium text-slate-300 mb-3">GST Invoiced vs Received</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Invoiced</span>
                    <span className="text-white">{formatINR(data.gst.onInvoices)}</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Received</span>
                    <span className="text-white">{formatINR(data.gst.collected)}</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: data.gst.onInvoices > 0
                          ? `${Math.min((data.gst.collected / data.gst.onInvoices) * 100, 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
              {data.gst.onInvoices > 0 && data.gst.collected !== data.gst.onInvoices && (
                <p className="text-xs text-amber-400 mt-2">
                  Difference: {formatINR(Math.abs(data.gst.onInvoices - data.gst.collected))}
                  {data.gst.collected < data.gst.onInvoices ? ' (under-collected)' : ' (over-collected)'}
                </p>
              )}
            </div>
          </div>

          {/* TDS Section */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">TDS Deductions</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">
                  Total: <span className="text-amber-400 font-medium">{formatINR(data.tds.totalDeducted)}</span>
                </span>
                <span className="text-slate-400">
                  Clients: <span className="text-white font-medium">{data.tds.clientCount}</span>
                </span>
                <span className="text-slate-400">
                  Quarter: <span className="text-white font-medium">{formatINR(data.tds.quarterTotal)}</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Client</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">PAN</th>
                    <th className="text-right py-3 px-3 text-slate-400 font-medium">Gross</th>
                    <th className="text-right py-3 px-3 text-slate-400 font-medium">TDS %</th>
                    <th className="text-right py-3 px-3 text-slate-400 font-medium">TDS Amount</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Payments</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Form 16A</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tds.breakdown.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No TDS deductions this month
                      </td>
                    </tr>
                  ) : (
                    data.tds.breakdown.map((row) => (
                      <tr
                        key={row.client.id}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
                      >
                        <td className="py-3 px-3 text-white font-medium">{row.client.name}</td>
                        <td className="py-3 px-3 text-slate-300 font-mono text-xs">{row.client.panNumber}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{formatINR(row.totalGross)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.tdsPercentage}%</td>
                        <td className="py-3 px-3 text-right text-amber-400 font-medium">
                          {formatINR(row.totalTds)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-300">{row.payments}</td>
                        <td className="py-3 px-3 text-center">
                          {row.form16AReceived ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Received
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Entity-wise Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Entity-wise Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.entityBreakdown.map((entity) => (
                <div
                  key={entity.entity}
                  className="glass-card rounded-xl border border-white/10 p-5 space-y-4"
                >
                  <h3 className="text-white font-semibold">{entityLabel(entity.entity)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-400 text-xs">Gross Revenue</p>
                      <p className="text-white font-semibold">{formatINR(entity.grossRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">GST Collected</p>
                      <p className="text-emerald-400 font-semibold">{formatINR(entity.gstCollected)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">TDS Deducted</p>
                      <p className="text-amber-400 font-semibold">{formatINR(entity.tdsDeducted)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Net Received</p>
                      <p className="text-blue-400 font-semibold">{formatINR(entity.netReceived)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-slate-400">
                    <span>{entity.invoiceCount} invoice{entity.invoiceCount !== 1 ? 's' : ''}</span>
                    <span>{entity.paymentCount} payment{entity.paymentCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
