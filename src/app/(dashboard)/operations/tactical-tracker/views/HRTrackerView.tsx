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
  createdBy: { id: string; firstName: string; lastName: string } | null
}

interface EmployeeSummary {
  id: string
  name: string
  total: number
  approved: number
  pending: number
  submitted: number
  revision: number
  approvalRate: number
}

interface HRTrackerViewProps {
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

export function HRTrackerView({ initialClients }: HRTrackerViewProps) {
  const [clients] = useState(initialClients)
  const [allDeliverables, setAllDeliverables] = useState<Deliverable[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth())
  const [loading, setLoading] = useState(false)

  const monthOptions = getMonthOptions()

  // Calculate employee summaries (without client info)
  const employeeSummaries = useMemo((): EmployeeSummary[] => {
    const summaryMap = new Map<string, EmployeeSummary>()

    for (const d of allDeliverables) {
      if (!d.createdBy) continue

      const key = d.createdBy.id
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          id: key,
          name: `${d.createdBy.firstName} ${d.createdBy.lastName}`,
          total: 0,
          approved: 0,
          pending: 0,
          submitted: 0,
          revision: 0,
          approvalRate: 0,
        })
      }

      const summary = summaryMap.get(key)!
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

    // Calculate approval rates
    const summaries = Array.from(summaryMap.values())
    for (const s of summaries) {
      const completed = s.approved + s.revision
      s.approvalRate = completed > 0 ? Math.round((s.approved / completed) * 100) : 0
    }

    return summaries.sort((a, b) => b.total - a.total)
  }, [allDeliverables])

  // Calculate team totals
  const teamTotals = useMemo(() => {
    return employeeSummaries.reduce(
      (acc, s) => ({
        total: acc.total + s.total,
        approved: acc.approved + s.approved,
        pending: acc.pending + s.pending,
        submitted: acc.submitted + s.submitted,
        revision: acc.revision + s.revision,
      }),
      { total: 0, approved: 0, pending: 0, submitted: 0, revision: 0 }
    )
  }, [employeeSummaries])

  const overallApprovalRate = useMemo(() => {
    const completed = teamTotals.approved + teamTotals.revision
    return completed > 0 ? Math.round((teamTotals.approved / completed) * 100) : 0
  }, [teamTotals])

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
    const headers = ['Employee', 'Total Logged', 'Approved', 'Submitted', 'Pending', 'Revision', 'Approval Rate']
    const rows = employeeSummaries.map(s => [
      s.name,
      s.total.toString(),
      s.approved.toString(),
      s.submitted.toString(),
      s.pending.toString(),
      s.revision.toString(),
      `${s.approvalRate}%`,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `employee-activity-${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    generateTablePDF(
      {
        columns: [
          { header: 'Employee', key: 'name', width: 45 },
          { header: 'Total', key: 'total', width: 20 },
          { header: 'Approved', key: 'approved', width: 20 },
          { header: 'Submitted', key: 'submitted', width: 20 },
          { header: 'Pending', key: 'pending', width: 20 },
          { header: 'Revision', key: 'revision', width: 20 },
          { header: 'Rate', key: 'rate', width: 20 },
        ],
        rows: employeeSummaries.map(s => ({
          name: s.name,
          total: s.total,
          approved: s.approved,
          submitted: s.submitted,
          pending: s.pending,
          revision: s.revision,
          rate: `${s.approvalRate}%`,
        })),
      },
      {
        title: 'Team Activity Report',
        subtitle: formatMonthDisplay(selectedMonth),
        filename: `employee-activity-${selectedMonth}`,
        orientation: 'portrait',
      },
      [
        { label: 'Team Members', value: employeeSummaries.length, color: 'blue' },
        { label: 'Total Logged', value: teamTotals.total, color: 'blue' },
        { label: 'Approved', value: teamTotals.approved, color: 'green' },
        { label: 'Approval Rate', value: `${overallApprovalRate}%`, color: overallApprovalRate >= 70 ? 'green' : 'amber' },
      ]
    )
  }

  const getApprovalRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400'
    if (rate >= 70) return 'text-amber-400'
    return 'text-red-400'
  }

  const getProgressBarColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500'
    if (rate >= 70) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Team Activity</h1>
            <p className="text-violet-200">Employee performance overview</p>
          </div>
          <ExportButtons
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            loading={employeeSummaries.length === 0}
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
            className="px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white glass-card"
          >
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Summary Stats */}
      {!loading && employeeSummaries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
            <p className="text-3xl font-bold text-white">{employeeSummaries.length}</p>
            <p className="text-sm text-slate-400">Active Team Members</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{teamTotals.total}</p>
            <p className="text-sm text-slate-400">Total Items Logged</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{teamTotals.approved}</p>
            <p className="text-sm text-slate-400">Items Approved</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
            <p className={`text-3xl font-bold ${getApprovalRateColor(overallApprovalRate)}`}>
              {overallApprovalRate}%
            </p>
            <p className="text-sm text-slate-400">Team Approval Rate</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      ) : employeeSummaries.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <p className="text-slate-300">No activity data for {formatMonthDisplay(selectedMonth)}.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-4">Employee Activity Summary</h3>
          <div className="space-y-4">
            {employeeSummaries.map(emp => (
              <div key={emp.id} className="bg-slate-900/40 rounded-xl p-4 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{emp.name}</p>
                    <p className="text-sm text-slate-400">
                      Logged: {emp.total} | Approved: {emp.approved} | Pending: {emp.pending + emp.submitted}
                    </p>
                  </div>
                  <span className={`text-lg font-bold ${getApprovalRateColor(emp.approvalRate)}`}>
                    {emp.approvalRate}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressBarColor(emp.approvalRate)}`}
                    style={{ width: `${emp.approvalRate}%` }}
                  ></div>
                </div>

                {/* Status breakdown */}
                <div className="flex gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Approved: {emp.approved}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Submitted: {emp.submitted}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                    Pending: {emp.pending}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Revision: {emp.revision}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note about privacy */}
      <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4 text-center">
        <p className="text-sm text-slate-400">
          This view shows employee activity metrics only. Client details are not displayed for privacy.
        </p>
      </div>
    </div>
  )
}
