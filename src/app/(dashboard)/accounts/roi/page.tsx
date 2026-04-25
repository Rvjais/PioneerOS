'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface DepartmentExpense {
  id: string
  department: string
  month: string
  baseSalaryComponent: number
  rbcComponent: number
  totalSalaryComponent: number
  toolsExpense: number
  freelancerExpense: number
  miscExpense: number
  totalExpense: number
  attributedRevenue: number
  clientCount: number
  roi: number | null
  costPerClient: number | null
  revenuePerClient: number | null
  calculatedAt: string | null
}

interface Summary {
  totalRevenue: number
  totalExpense: number
  overallROI: number
  departmentSummary: Array<{
    department: string
    totalRevenue: number
    totalExpense: number
    avgROI: number
    dataPoints: number
  }>
}

const DEPARTMENTS = [
  { code: 'SEO', label: 'SEO', color: 'emerald' },
  { code: 'SOCIAL', label: 'Social Media', color: 'blue' },
  { code: 'ADS', label: 'Paid Ads', color: 'amber' },
  { code: 'WEB', label: 'Web Development', color: 'purple' },
  { code: 'AI_TOOLS', label: 'AI Tools', color: 'cyan' }
]

export default function ROIDashboardPage() {
  const [expenses, setExpenses] = useState<DepartmentExpense[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [computing, setComputing] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [departmentFilter, setDepartmentFilter] = useState('')

  useEffect(() => {
    fetchROIData()
  }, [selectedMonth, departmentFilter])

  const fetchROIData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedMonth) params.append('month', selectedMonth)
      if (departmentFilter) params.append('department', departmentFilter)

      const res = await fetch(`/api/accounts/roi/departments?${params}`)
      if (res.ok) {
        const data = await res.json()
        setExpenses(data.expenses || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Failed to fetch ROI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const computeROI = async () => {
    if (!selectedMonth) {
      toast.error('Please select a month')
      return
    }

    setComputing(true)
    try {
      const res = await fetch('/api/accounts/roi/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth })
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`ROI computed successfully for ${data.summary.departmentsComputed} departments`)
        fetchROIData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to compute ROI')
      }
    } catch (error) {
      console.error('Failed to compute ROI:', error)
      toast.error('Failed to compute ROI')
    } finally {
      setComputing(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount.toFixed(0)}`
  }

  const formatPercent = (value: number | null) => {
    if (value === null) return '-'
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getDeptColor = (dept: string) => {
    const found = DEPARTMENTS.find(d => d.code === dept)
    return found?.color || 'slate'
  }

  const getDeptLabel = (dept: string) => {
    const found = DEPARTMENTS.find(d => d.code === dept)
    return found?.label || dept
  }

  const getROIColor = (roi: number | null) => {
    if (roi === null) return 'text-slate-400'
    if (roi >= 50) return 'text-green-400'
    if (roi >= 20) return 'text-emerald-600'
    if (roi >= 0) return 'text-amber-400'
    return 'text-red-400'
  }

  const getROIBgColor = (roi: number | null) => {
    if (roi === null) return 'bg-slate-900/40 border-white/10'
    if (roi >= 50) return 'bg-green-500/10 border-green-200'
    if (roi >= 20) return 'bg-emerald-500/10 border-emerald-500/30'
    if (roi >= 0) return 'bg-amber-500/10 border-amber-200'
    return 'bg-red-500/10 border-red-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ROI Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Department-wise revenue vs expenses analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/accounts"
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Dashboard
          </Link>
          <button
            onClick={computeROI}
            disabled={computing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {computing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Computing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Compute ROI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d.code} value={d.code}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <p className="text-emerald-100 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-emerald-200 text-xs mt-2">Attributed to departments</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-purple-100 text-sm">Total Expenses</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(summary.totalExpense)}</p>
            <p className="text-purple-200 text-xs mt-2">Salaries + Tools + Freelancers</p>
          </div>
          <div className={`rounded-xl p-6 border ${getROIBgColor(summary.overallROI)}`}>
            <p className="text-slate-300 text-sm">Overall ROI</p>
            <p className={`text-3xl font-bold mt-1 ${getROIColor(summary.overallROI)}`}>
              {formatPercent(summary.overallROI)}
            </p>
            <p className="text-slate-400 text-xs mt-2">
              {summary.overallROI >= 0 ? 'Profitable' : 'Operating at loss'}
            </p>
          </div>
        </div>
      )}

      {/* Department Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.length === 0 ? (
          <div className="col-span-full glass-card rounded-xl border border-white/10 p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-slate-400">No ROI data for selected period</p>
            <p className="text-sm text-slate-400 mt-1">Click "Compute ROI" to calculate department metrics</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className={`glass-card rounded-xl border p-5 ${getROIBgColor(expense.roi)}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs font-bold rounded bg-${getDeptColor(expense.department)}-100 text-${getDeptColor(expense.department)}-700`}>
                  {getDeptLabel(expense.department)}
                </span>
                <span className={`text-lg font-bold ${getROIColor(expense.roi)}`}>
                  {formatPercent(expense.roi)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Revenue</span>
                  <span className="font-semibold text-green-400">{formatCurrency(expense.attributedRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Total Expense</span>
                  <span className="font-semibold text-red-400">{formatCurrency(expense.totalExpense)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Active Clients</span>
                  <span className="font-medium text-white">{expense.clientCount}</span>
                </div>

                {/* Progress bar showing revenue vs expense */}
                <div className="mt-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${expense.roi !== null && expense.roi >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{
                        width: `${Math.min(100, (expense.attributedRevenue / Math.max(expense.totalExpense, 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div className="pt-3 border-t border-white/10 mt-3">
                  <p className="text-xs text-slate-400 mb-2">Expense Breakdown</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Salaries</span>
                      <span className="text-slate-200">{formatCurrency(expense.totalSalaryComponent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tools</span>
                      <span className="text-slate-200">{formatCurrency(expense.toolsExpense)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Freelancers</span>
                      <span className="text-slate-200">{formatCurrency(expense.freelancerExpense)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Misc</span>
                      <span className="text-slate-200">{formatCurrency(expense.miscExpense)}</span>
                    </div>
                  </div>
                </div>

                {/* Unit Economics */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-400 mb-2">Unit Economics</p>
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-slate-400">Cost/Client</p>
                      <p className="font-medium text-slate-200">{formatCurrency(expense.costPerClient)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400">Revenue/Client</p>
                      <p className="font-medium text-slate-200">{formatCurrency(expense.revenuePerClient)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {expense.calculatedAt && (
                <p className="text-xs text-slate-400 mt-3">
                  Calculated: {new Date(expense.calculatedAt).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How ROI is Calculated</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-400">
          <div>
            <p className="font-medium mb-1">Revenue Attribution</p>
            <ul className="space-y-1 text-blue-400">
              <li>• Payments collected from clients using the department's services</li>
              <li>• Proportionally split if client has multiple services</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Expense Components</p>
            <ul className="space-y-1 text-blue-400">
              <li>• Salary allocation from HR (base + RBC)</li>
              <li>• Tool subscriptions, freelancer costs, miscellaneous</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-blue-400">
            <strong>ROI Formula:</strong> ((Revenue - Expense) / Expense) × 100
          </p>
        </div>
      </div>
    </div>
  )
}
