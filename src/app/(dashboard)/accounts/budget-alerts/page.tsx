'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import {
  DEPARTMENTS,
  BUDGET_PERIODS,
  BUDGET_SCOPES,
  getLabelForValue,
} from '@/shared/constants/formConstants'

interface BudgetAlert {
  id: string
  scope: string
  clientId: string | null
  client: {
    id: string
    name: string
  } | null
  department: string | null
  budgetAmount: number
  currency: string
  period: string
  periodStart: string
  periodEnd: string | null
  warningThreshold: number
  criticalThreshold: number
  spentAmount: number
  spentPercentage: number
  alertLevel: string
  isPaused: boolean
  pausedAt: string | null
  pauseOnCritical: boolean
  alertsEnabled: boolean
  creator: {
    id: string
    firstName: string
    lastName: string | null
  }
}

interface Summary {
  total: number
  normal: number
  warning: number
  critical: number
  exceeded: number
  paused: number
}

interface Client {
  id: string
  name: string
}

export default function BudgetAlertsPage() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState({ scope: '', alertLevel: '' })
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    scope: 'CLIENT',
    clientId: '',
    department: '',
    budgetAmount: '',
    currency: 'INR',
    period: 'MONTHLY',
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: '',
    warningThreshold: 80,
    criticalThreshold: 100,
    pauseOnCritical: false,
    notifyOnWarning: true,
    notifyOnCritical: true,
  })

  useEffect(() => {
    fetchAlerts()
    fetchClients()
  }, [filter])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.scope) params.append('scope', filter.scope)
      if (filter.alertLevel) params.append('alertLevel', filter.alertLevel)

      const res = await fetch(`/api/budget-alerts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/budget-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budgetAmount: parseFloat(form.budgetAmount),
          periodEnd: form.periodEnd || null,
          clientId: form.scope === 'CLIENT' ? form.clientId : null,
          department: form.scope === 'DEPARTMENT' ? form.department : null,
        }),
      })

      if (res.ok) {
        setShowAddModal(false)
        resetForm()
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to create alert:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePauseToggle = async (alert: BudgetAlert) => {
    try {
      const res = await fetch(`/api/budget-alerts/${alert.id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: alert.isPaused ? 'resume' : 'pause' }),
      })

      if (res.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to toggle pause:', error)
    }
  }

  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this budget alert?')) return

    try {
      const res = await fetch(`/api/budget-alerts/${alertId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  const resetForm = () => {
    setForm({
      scope: 'CLIENT',
      clientId: '',
      department: '',
      budgetAmount: '',
      currency: 'INR',
      period: 'MONTHLY',
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: '',
      warningThreshold: 80,
      criticalThreshold: 100,
      pauseOnCritical: false,
      notifyOnWarning: true,
      notifyOnCritical: true,
    })
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const getAlertLevelBadge = (level: string, isPaused: boolean) => {
    if (isPaused) {
      return 'bg-slate-800/50 text-white border-white/20'
    }
    switch (level) {
      case 'NORMAL':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-300'
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-800 border-amber-300'
      case 'CRITICAL':
        return 'bg-orange-500/20 text-orange-400 border-orange-300'
      case 'EXCEEDED':
        return 'bg-red-500/20 text-red-800 border-red-300'
      default:
        return 'bg-slate-800/50 text-slate-300 border-white/20'
    }
  }

  const getProgressBarColor = (percentage: number, warningThreshold: number, criticalThreshold: number) => {
    if (percentage >= criticalThreshold) return 'bg-red-500'
    if (percentage >= warningThreshold) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  if (loading && !alerts.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget Alerts</h1>
          <p className="text-slate-300 mt-1">Monitor spending with 80%/100% threshold alerts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Alert
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Total</p>
            <p className="text-2xl font-bold text-white">{summary.total}</p>
          </div>
          <div className="glass-card rounded-xl border border-emerald-200 p-4">
            <p className="text-sm text-emerald-600">Normal</p>
            <p className="text-2xl font-bold text-emerald-600">{summary.normal}</p>
          </div>
          <div className="glass-card rounded-xl border border-amber-200 p-4">
            <p className="text-sm text-amber-400">Warning (80%+)</p>
            <p className="text-2xl font-bold text-amber-400">{summary.warning}</p>
          </div>
          <div className="glass-card rounded-xl border border-orange-200 p-4">
            <p className="text-sm text-orange-600">Critical (100%)</p>
            <p className="text-2xl font-bold text-orange-600">{summary.critical}</p>
          </div>
          <div className="glass-card rounded-xl border border-red-200 p-4">
            <p className="text-sm text-red-400">Exceeded</p>
            <p className="text-2xl font-bold text-red-400">{summary.exceeded}</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Paused</p>
            <p className="text-2xl font-bold text-slate-300">{summary.paused}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter.scope}
          onChange={(e) => setFilter(prev => ({ ...prev, scope: e.target.value }))}
          className="px-3 py-2 border border-white/20 rounded-lg text-white"
        >
          <option value="">All Scopes</option>
          {BUDGET_SCOPES.map(scope => (
            <option key={scope.value} value={scope.value}>{scope.label}</option>
          ))}
        </select>
        <select
          value={filter.alertLevel}
          onChange={(e) => setFilter(prev => ({ ...prev, alertLevel: e.target.value }))}
          className="px-3 py-2 border border-white/20 rounded-lg text-white"
        >
          <option value="">All Levels</option>
          <option value="NORMAL">Normal</option>
          <option value="WARNING">Warning</option>
          <option value="CRITICAL">Critical</option>
          <option value="EXCEEDED">Exceeded</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`glass-card rounded-xl border ${alert.isPaused ? 'border-white/20 opacity-75' : 'border-white/10'} p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-white">
                    {alert.scope === 'CLIENT' && alert.client
                      ? alert.client.name
                      : alert.scope === 'DEPARTMENT'
                        ? getLabelForValue(DEPARTMENTS, alert.department || '')
                        : alert.scope === 'COMPANY'
                          ? 'Company-wide'
                          : 'Project Budget'
                    }
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full border ${getAlertLevelBadge(alert.alertLevel, alert.isPaused)}`}>
                    {alert.isPaused ? 'Paused' : alert.alertLevel}
                  </span>
                  <span className="text-xs text-slate-400">
                    {getLabelForValue(BUDGET_SCOPES, alert.scope)}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">
                  {getLabelForValue(BUDGET_PERIODS, alert.period)} budget starting{' '}
                  {formatDateDDMMYYYY(alert.periodStart)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePauseToggle(alert)}
                  className={`px-3 py-1 text-sm rounded-lg border ${
                    alert.isPaused
                      ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-500/10'
                      : 'border-amber-300 text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  {alert.isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="px-3 py-1 text-sm rounded-lg border border-red-300 text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">
                  Spent: {formatCurrency(alert.spentAmount, alert.currency)} of {formatCurrency(alert.budgetAmount, alert.currency)}
                </span>
                <span className="font-medium text-white">
                  {alert.spentPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden">
                {/* Warning threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                  style={{ left: `${alert.warningThreshold}%` }}
                />
                {/* Critical threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                  style={{ left: `${Math.min(alert.criticalThreshold, 100)}%` }}
                />
                {/* Progress bar */}
                <div
                  className={`h-full transition-all ${getProgressBarColor(alert.spentPercentage, alert.warningThreshold, alert.criticalThreshold)}`}
                  style={{ width: `${Math.min(alert.spentPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>0%</span>
                <span className="text-amber-400">{alert.warningThreshold}% Warning</span>
                <span className="text-red-400">{alert.criticalThreshold}% Critical</span>
                <span>100%+</span>
              </div>
            </div>

            {/* Settings summary */}
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              {alert.pauseOnCritical && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Auto-pause at critical
                </span>
              )}
              {alert.alertsEnabled && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications on
                </span>
              )}
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
            <p className="text-slate-400">No budget alerts configured. Create one to start monitoring spending.</p>
          </div>
        )}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-none w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Create Budget Alert</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Scope *</label>
                <select
                  required
                  value={form.scope}
                  onChange={(e) => setForm(prev => ({ ...prev, scope: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                >
                  {BUDGET_SCOPES.map(scope => (
                    <option key={scope.value} value={scope.value}>{scope.label}</option>
                  ))}
                </select>
              </div>

              {form.scope === 'CLIENT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Client *</label>
                  <select
                    required
                    value={form.clientId}
                    onChange={(e) => setForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">Select client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.scope === 'DEPARTMENT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Department *</label>
                  <select
                    required
                    value={form.department}
                    onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Budget Amount *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.budgetAmount}
                    onChange={(e) => setForm(prev => ({ ...prev, budgetAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Period *</label>
                <select
                  required
                  value={form.period}
                  onChange={(e) => setForm(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                >
                  {BUDGET_PERIODS.map(period => (
                    <option key={period.value} value={period.value}>{period.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.periodStart}
                    onChange={(e) => setForm(prev => ({ ...prev, periodStart: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.periodEnd}
                    onChange={(e) => setForm(prev => ({ ...prev, periodEnd: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Warning Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.warningThreshold}
                    onChange={(e) => setForm(prev => ({ ...prev, warningThreshold: parseInt(e.target.value) || 80 }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Critical Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={form.criticalThreshold}
                    onChange={(e) => setForm(prev => ({ ...prev, criticalThreshold: parseInt(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.pauseOnCritical}
                    onChange={(e) => setForm(prev => ({ ...prev, pauseOnCritical: e.target.checked }))}
                    className="w-4 h-4 text-blue-400 border-white/20 rounded"
                  />
                  <span className="text-sm text-slate-200">Auto-pause spending at critical threshold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.notifyOnWarning}
                    onChange={(e) => setForm(prev => ({ ...prev, notifyOnWarning: e.target.checked }))}
                    className="w-4 h-4 text-blue-400 border-white/20 rounded"
                  />
                  <span className="text-sm text-slate-200">Notify on warning threshold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.notifyOnCritical}
                    onChange={(e) => setForm(prev => ({ ...prev, notifyOnCritical: e.target.checked }))}
                    className="w-4 h-4 text-blue-400 border-white/20 rounded"
                  />
                  <span className="text-sm text-slate-200">Notify on critical threshold</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 hover:bg-slate-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
