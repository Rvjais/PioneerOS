'use client'

import { useState, useRef, useEffect } from 'react'

interface Client {
  id: string
  name: string
}

interface WorkReport {
  id: string
  periodStart: Date | string
  periodEnd: Date | string
  projectName: string
  clientId: string | null
  description: string
  hoursWorked: number
  billableAmount: number
  status: string
  deliverables: string | null
}

interface FreelancerExcelTrackerProps {
  reports: WorkReport[]
  clients: Client[]
  hourlyRate: number
  onAddReport: (data: {
    periodStart: string
    periodEnd: string
    projectName: string
    clientId: string | null
    description: string
    hoursWorked: number
    billableAmount: number
    deliverables: string[]
  }) => Promise<void>
  onUpdateReport?: (reportId: string, updates: Partial<WorkReport>) => Promise<void>
}

const PROJECT_OPTIONS = [
  'Website Development',
  'SEO Optimization',
  'Content Writing',
  'Landing Page',
  'API Integration',
  'Bug Fixes',
  'Mobile Responsive',
  'Dashboard Development',
  'E-commerce Module',
  'Other',
]

const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16]

export function FreelancerExcelTracker({
  reports,
  clients,
  hourlyRate,
  onAddReport,
}: FreelancerExcelTrackerProps) {
  const today = new Date().toISOString().split('T')[0]
  const [newRow, setNewRow] = useState({
    date: today,
    projectName: '',
    clientId: '',
    description: '',
    hoursWorked: 4,
  })
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50'
      case 'APPROVED': return 'bg-green-500/10'
      case 'REVIEWED': return 'bg-blue-500/10'
      case 'REJECTED': return 'bg-red-500/10'
      default: return 'glass-card'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-100 text-emerald-700'
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      case 'REVIEWED': return 'bg-blue-500/20 text-blue-400'
      case 'REJECTED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-yellow-500/20 text-yellow-400'
    }
  }

  const handleAddRow = async () => {
    if (!newRow.projectName || !newRow.description) return

    setSaving(true)
    try {
      const billableAmount = newRow.hoursWorked * hourlyRate
      await onAddReport({
        periodStart: newRow.date,
        periodEnd: newRow.date,
        projectName: newRow.projectName,
        clientId: newRow.clientId || null,
        description: newRow.description,
        hoursWorked: newRow.hoursWorked,
        billableAmount,
        deliverables: [newRow.description],
      })
      setNewRow({
        date: today,
        projectName: '',
        clientId: '',
        description: '',
        hoursWorked: 4,
      })
    } finally {
      setSaving(false)
    }
  }

  // Group reports by date for better visualization
  const sortedReports = [...reports].sort((a, b) =>
    new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()
  )

  // Calculate totals
  const totalHours = reports.reduce((sum, r) => sum + r.hoursWorked, 0)
  const totalAmount = reports.reduce((sum, r) => sum + r.billableAmount, 0)
  const paidAmount = reports.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.billableAmount, 0)
  const pendingAmount = reports.filter(r => r.status !== 'PAID' && r.status !== 'REJECTED').reduce((sum, r) => sum + r.billableAmount, 0)

  return (
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Daily Work Tracker</h2>
          <p className="text-xs text-purple-200">Log your daily work entries</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-300 rounded"></span>
            <span>Submitted</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-300 rounded"></span>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-emerald-400 rounded"></span>
            <span>Paid</span>
          </div>
        </div>
      </div>

      {/* Excel-like Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b-2 border-white/20">
              <th className="px-2 py-2 text-left font-semibold text-slate-200 border-r border-white/10 w-8">#</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-200 border-r border-white/10 min-w-[100px]">Date</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-200 border-r border-white/10 min-w-[140px]">Project</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-200 border-r border-white/10 min-w-[120px]">Client</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-200 border-r border-white/10 min-w-[200px]">Description</th>
              <th className="px-2 py-2 text-center font-semibold text-slate-200 border-r border-white/10 w-20">Hours</th>
              <th className="px-2 py-2 text-right font-semibold text-slate-200 border-r border-white/10 w-28">Amount</th>
              <th className="px-2 py-2 text-center font-semibold text-slate-200 w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* New Row - Add Entry */}
            <tr className="bg-purple-500/10 border-b-2 border-purple-200">
              <td className="px-2 py-2 text-purple-400 border-r border-white/10 text-center">
                <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </td>
              <td className="px-1 py-1 border-r border-white/10">
                <input
                  type="date"
                  value={newRow.date}
                  onChange={(e) => setNewRow({ ...newRow, date: e.target.value })}
                  className="w-full px-1 py-1.5 border border-white/20 rounded text-sm glass-card text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </td>
              <td className="px-1 py-1 border-r border-white/10">
                <select
                  value={newRow.projectName}
                  onChange={(e) => setNewRow({ ...newRow, projectName: e.target.value })}
                  className="w-full px-1 py-1.5 border border-white/20 rounded text-sm glass-card text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Select project...</option>
                  {PROJECT_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </td>
              <td className="px-1 py-1 border-r border-white/10">
                <select
                  value={newRow.clientId}
                  onChange={(e) => setNewRow({ ...newRow, clientId: e.target.value })}
                  className="w-full px-1 py-1.5 border border-white/20 rounded text-sm glass-card text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">No Client (Internal)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </td>
              <td className="px-1 py-1 border-r border-white/10">
                <input
                  ref={inputRef}
                  type="text"
                  value={newRow.description}
                  onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                  placeholder="What did you work on?"
                  className="w-full px-1 py-1.5 border border-white/20 rounded text-sm glass-card text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newRow.projectName && newRow.description) {
                      handleAddRow()
                    }
                  }}
                />
              </td>
              <td className="px-1 py-1 border-r border-white/10">
                <select
                  value={newRow.hoursWorked}
                  onChange={(e) => setNewRow({ ...newRow, hoursWorked: parseInt(e.target.value) })}
                  className="w-full px-1 py-1.5 border border-white/20 rounded text-sm glass-card text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {HOUR_OPTIONS.map(h => (
                    <option key={h} value={h}>{h}h</option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-1 border-r border-white/10 text-right text-slate-400">
                {formatCurrency(newRow.hoursWorked * hourlyRate)}
              </td>
              <td className="px-2 py-1 text-center">
                <button
                  onClick={handleAddRow}
                  disabled={!newRow.projectName || !newRow.description || saving}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? 'Adding...' : '+ Add'}
                </button>
              </td>
            </tr>

            {/* Existing Reports */}
            {sortedReports.map((report, index) => (
              <tr key={report.id} className={`border-b border-white/10 ${getStatusBg(report.status)} hover:bg-slate-900/40 transition-colors`}>
                <td className="px-2 py-2 text-slate-400 border-r border-white/10 text-center font-mono text-xs">
                  {index + 1}
                </td>
                <td className="px-2 py-2 border-r border-white/10">
                  <span className="font-medium text-slate-200">{formatDate(report.periodStart)}</span>
                </td>
                <td className="px-2 py-2 border-r border-white/10 text-slate-200">
                  {report.projectName}
                </td>
                <td className="px-2 py-2 border-r border-white/10 text-slate-300">
                  {clients.find(c => c.id === report.clientId)?.name || <span className="italic text-slate-400">Internal</span>}
                </td>
                <td className="px-2 py-2 border-r border-white/10 text-slate-200 truncate max-w-[200px]" title={report.description}>
                  {report.description}
                </td>
                <td className="px-2 py-2 border-r border-white/10 text-center font-medium text-slate-200">
                  {report.hoursWorked}h
                </td>
                <td className="px-2 py-2 border-r border-white/10 text-right font-medium text-white">
                  {formatCurrency(report.billableAmount)}
                </td>
                <td className="px-2 py-2 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(report.status)}`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-4 py-3 bg-slate-900/40 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-slate-300">
              Total Entries: <span className="font-semibold text-white">{reports.length}</span>
            </span>
            <span className="text-slate-300">
              Total Hours: <span className="font-semibold text-white">{totalHours}h</span>
            </span>
            <span className="text-slate-300">
              Rate: <span className="font-semibold text-white">{formatCurrency(hourlyRate)}/hr</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-slate-300">
              Total: <span className="font-semibold text-white">{formatCurrency(totalAmount)}</span>
            </span>
            <span className="text-emerald-600">
              Paid: <span className="font-semibold">{formatCurrency(paidAmount)}</span>
            </span>
            <span className="text-yellow-600">
              Pending: <span className="font-semibold">{formatCurrency(pendingAmount)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard Hint */}
      <div className="px-4 py-2 bg-slate-800/50 border-t border-white/10 flex items-center justify-center text-xs text-slate-400">
        Press <kbd className="mx-1 px-1.5 py-0.5 glass-card border border-white/20 rounded">Enter</kbd> to add entry
      </div>
    </div>
  )
}
