'use client'

import { useState, useEffect, useMemo } from 'react'
import { generateTablePDF } from '@/client/utils/export/pdfExport'
import { ExportButtons } from '@/client/components/ExportButtons'

interface ClientScope {
  id: string
  client: string
  scope: string[]
  status: 'ACTIVE' | 'ON_HOLD' | 'CHURNED'
  accountManager: string
  monthlyRetainer: number
}

interface Deliverable {
  id: string
  clientId: string
  category: string
  workItem: string
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUIRED'
}

interface ClientSummary {
  clientId: string
  clientName: string
  total: number
  approved: number
  pending: number
  submitted: number
  revision: number
}

interface AccountsTrackerViewProps {
  initialClients: ClientScope[]
}

function getMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = []
  const now = new Date()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    months.push({ value, label })
  }
  return months
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthDisplay(month: string): string {
  const [year, m] = month.split('-')
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${monthNames[parseInt(m) - 1]} ${year}`
}

export function AccountsTrackerView({ initialClients }: AccountsTrackerViewProps) {
  const [clients] = useState(initialClients)
  const [allDeliverables, setAllDeliverables] = useState<Deliverable[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth())
  const [loading, setLoading] = useState(false)

  const monthOptions = getMonthOptions()

  // Calculate summaries per client
  const clientSummaries = useMemo((): ClientSummary[] => {
    const summaryMap = new Map<string, ClientSummary>()

    // Initialize all clients
    for (const client of clients) {
      summaryMap.set(client.id, {
        clientId: client.id,
        clientName: client.client,
        total: 0,
        approved: 0,
        pending: 0,
        submitted: 0,
        revision: 0,
      })
    }

    // Count deliverables
    for (const d of allDeliverables) {
      const summary = summaryMap.get(d.clientId)
      if (summary) {
        summary.total++
        switch (d.status) {
          case 'APPROVED':
            summary.approved++
            break
          case 'PENDING':
            summary.pending++
            break
          case 'SUBMITTED':
            summary.submitted++
            break
          case 'REVISION_REQUIRED':
            summary.revision++
            break
        }
      }
    }

    // Convert to array and sort by client name
    return Array.from(summaryMap.values())
      .filter(s => s.total > 0)
      .sort((a, b) => a.clientName.localeCompare(b.clientName))
  }, [clients, allDeliverables])

  // Calculate totals
  const totals = useMemo(() => {
    return clientSummaries.reduce(
      (acc, s) => ({
        total: acc.total + s.total,
        approved: acc.approved + s.approved,
        pending: acc.pending + s.pending,
        submitted: acc.submitted + s.submitted,
        revision: acc.revision + s.revision,
      }),
      { total: 0, approved: 0, pending: 0, submitted: 0, revision: 0 }
    )
  }, [clientSummaries])

  useEffect(() => {
    fetchAllDeliverables()
  }, [selectedMonth])

  const fetchAllDeliverables = async () => {
    setLoading(true)
    try {
      const allItems: Deliverable[] = []
      for (const client of clients) {
        const res = await fetch(`/api/client-deliverables?clientId=${client.id}&month=${selectedMonth}`)
        if (res.ok) {
          const data = await res.json()
          allItems.push(...(data.deliverables || []))
        }
      }
      setAllDeliverables(allItems)
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Client', 'Total Items', 'Approved', 'Submitted', 'Pending', 'Revision Required']
    const rows = clientSummaries.map(s => [
      s.clientName,
      s.total.toString(),
      s.approved.toString(),
      s.submitted.toString(),
      s.pending.toString(),
      s.revision.toString(),
    ])

    // Add totals row
    rows.push([
      'TOTAL',
      totals.total.toString(),
      totals.approved.toString(),
      totals.submitted.toString(),
      totals.pending.toString(),
      totals.revision.toString(),
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deliverables-summary-${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    generateTablePDF(
      {
        columns: [
          { header: 'Client', key: 'client', width: 50 },
          { header: 'Total', key: 'total', width: 20 },
          { header: 'Approved', key: 'approved', width: 20 },
          { header: 'Submitted', key: 'submitted', width: 20 },
          { header: 'Pending', key: 'pending', width: 20 },
          { header: 'Revision', key: 'revision', width: 20 },
        ],
        rows: clientSummaries.map(s => ({
          client: s.clientName,
          total: s.total,
          approved: s.approved,
          submitted: s.submitted,
          pending: s.pending,
          revision: s.revision,
        })),
      },
      {
        title: 'Monthly Deliverables Summary',
        subtitle: formatMonthDisplay(selectedMonth),
        filename: `deliverables-summary-${selectedMonth}`,
        orientation: 'portrait',
      },
      [
        { label: 'Total Items', value: totals.total, color: 'blue' },
        { label: 'Approved', value: totals.approved, color: 'green' },
        { label: 'Pending', value: totals.pending + totals.submitted, color: 'amber' },
        { label: 'Approval Rate', value: `${totals.total > 0 ? Math.round((totals.approved / totals.total) * 100) : 0}%`, color: 'green' },
      ]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Monthly Deliverables Summary</h1>
            <p className="text-amber-100">Billing overview for invoicing</p>
          </div>
          <ExportButtons
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            loading={clientSummaries.length === 0}
          />
        </div>
      </div>

      {/* Month Filter */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-200">Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white glass-card"
          >
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      ) : clientSummaries.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <p className="text-slate-300">No deliverables found for {formatMonthDisplay(selectedMonth)}.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Client</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">Approved</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">Pending</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">Revision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clientSummaries.map(summary => (
                  <tr key={summary.clientId} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 text-sm font-medium text-white">{summary.clientName}</td>
                    <td className="px-4 py-3 text-center text-sm text-white">{summary.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-800">
                        {summary.approved}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-800">
                        {summary.submitted}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-slate-800/50 text-white">
                        {summary.pending}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-500/20 text-red-800">
                        {summary.revision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800/50 font-semibold">
                <tr>
                  <td className="px-4 py-3 text-sm text-white">TOTAL</td>
                  <td className="px-4 py-3 text-center text-sm text-white">{totals.total}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-200 text-green-900">
                      {totals.approved}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-200 text-blue-900">
                      {totals.submitted}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-white/10 text-white">
                      {totals.pending}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-red-200 text-red-900">
                      {totals.revision}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {clientSummaries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
            <p className="text-3xl font-bold text-white">{totals.total}</p>
            <p className="text-sm text-slate-400">Total Items</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{totals.approved}</p>
            <p className="text-sm text-slate-400">Approved</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">
              {totals.total > 0 ? Math.round((totals.approved / totals.total) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-400">Approval Rate</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
            <p className="text-3xl font-bold text-slate-300">{clients.length}</p>
            <p className="text-sm text-slate-400">Active Clients</p>
          </div>
        </div>
      )}
    </div>
  )
}
