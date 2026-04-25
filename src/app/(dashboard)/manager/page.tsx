'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardData {
  clientHealth: {
    active: number
    atRisk: number
    escalated: number
    appreciations: number
  }
  workDelivery: {
    pendingQC: number
    delayed: number
    escalated: number
  }
  finance: {
    pendingInvoices: number
    overduePayments: number
    collectionsThisMonth: number
  }
  sales: {
    newLeads: number
    dealsWon: number
    pipelineValue: number
  }
  hiring: {
    openPositions: number
    interviewing: number
    filled: number
  }
  riskClients: Array<{
    id: string
    name: string
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
    reason: string
    daysAtRisk: number
  }>
  recentEscalations: Array<{
    id: string
    client: string
    issue: string
    status: string
    createdAt: string
  }>
  departmentHealth: Array<{
    name: string
    tasksCompleted: number
    tasksPending: number
    escalations: number
    health: 'GOOD' | 'MODERATE' | 'POOR'
  }>
}

// Default empty state
const EMPTY_DATA: DashboardData = {
  clientHealth: { active: 0, atRisk: 0, escalated: 0, appreciations: 0 },
  workDelivery: { pendingQC: 0, delayed: 0, escalated: 0 },
  finance: { pendingInvoices: 0, overduePayments: 0, collectionsThisMonth: 0 },
  sales: { newLeads: 0, dealsWon: 0, pipelineValue: 0 },
  hiring: { openPositions: 0, interviewing: 0, filled: 0 },
  riskClients: [],
  recentEscalations: [],
  departmentHealth: [],
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/manager/dashboard')
      if (res.ok) {
        const dashboardData = await res.json()
        setData(dashboardData)
      } else {
        // Use empty state if API fails
        setData(EMPTY_DATA)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data')
      setData(EMPTY_DATA)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`
    }
    return `${(amount / 1000).toFixed(0)}K`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Operations Control Center</h1>
            <p className="text-purple-200">MASH Dashboard - Manager + Accounts + Sales + HR</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-purple-200 text-sm">Last Updated</p>
              <p className="font-bold">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <button
              onClick={() => fetchDashboardData()}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          {error} - Showing empty state. Data will populate once clients and tasks are added.
        </div>
      )}

      {/* Main Metrics Grid */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Client Health */}
        <Link href="/clients" className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Client Health</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Active</span>
              <span className="font-bold text-green-400">{data.clientHealth.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">At Risk</span>
              <span className="font-bold text-amber-400">{data.clientHealth.atRisk}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Escalated</span>
              <span className="font-bold text-red-400">{data.clientHealth.escalated}</span>
            </div>
          </div>
        </Link>

        {/* Work Delivery */}
        <Link href="/tasks" className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Work Delivery</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Pending QC</span>
              <span className="font-bold text-purple-400">{data.workDelivery.pendingQC}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Delayed</span>
              <span className="font-bold text-amber-400">{data.workDelivery.delayed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Escalated</span>
              <span className="font-bold text-red-400">{data.workDelivery.escalated}</span>
            </div>
          </div>
        </Link>

        {/* Finance */}
        <Link href="/accounts/invoices" className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Finance</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Pending</span>
              <span className="font-bold text-slate-300">{data.finance.pendingInvoices}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Overdue</span>
              <span className="font-bold text-red-400">{data.finance.overduePayments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Collected</span>
              <span className="font-bold text-emerald-400">{formatCurrency(data.finance.collectionsThisMonth)}</span>
            </div>
          </div>
        </Link>

        {/* Sales */}
        <Link href="/crm" className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Sales</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">New Leads</span>
              <span className="font-bold text-slate-300">{data.sales.newLeads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Won</span>
              <span className="font-bold text-green-400">{data.sales.dealsWon}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Pipeline</span>
              <span className="font-bold text-orange-400">{formatCurrency(data.sales.pipelineValue)}</span>
            </div>
          </div>
        </Link>

        {/* Hiring */}
        <Link href="/hiring" className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Hiring</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Open</span>
              <span className="font-bold text-slate-300">{data.hiring.openPositions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Interviewing</span>
              <span className="font-bold text-blue-400">{data.hiring.interviewing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Filled</span>
              <span className="font-bold text-green-400">{data.hiring.filled}</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Risk Engine */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-red-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="font-semibold text-red-300">Client Risk Engine</h2>
            </div>
            <Link href="/clients/lifecycle" className="text-sm text-red-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {data.riskClients.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No at-risk clients. Keep up the good work!
              </div>
            ) : (
              data.riskClients.map(client => (
                <div key={client.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      client.riskLevel === 'HIGH' ? 'bg-red-500' :
                      client.riskLevel === 'MEDIUM' ? 'bg-amber-500' :
                      'bg-yellow-400'
                    }`} />
                    <div>
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-sm text-slate-400">{client.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      client.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-300' :
                      client.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {client.riskLevel} RISK
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{client.daysAtRisk} days</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Escalations */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Escalations</h2>
            <Link href="/issues" className="text-sm text-purple-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {data.recentEscalations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No active escalations
              </div>
            ) : (
              data.recentEscalations.map(escalation => (
                <div key={escalation.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-white">{escalation.client}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      escalation.status === 'OPEN' ? 'bg-red-500/20 text-red-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {escalation.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{escalation.issue}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(escalation.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Department Health */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <h2 className="font-semibold text-white">Department Health</h2>
        </div>
        <div className="p-4">
          {data.departmentHealth.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Department metrics will appear here once tasks are assigned
            </div>
          ) : (
            <div className="grid md:grid-cols-5 gap-4">
              {data.departmentHealth.map(dept => (
                <div
                  key={dept.name}
                  className="p-4 border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{dept.name}</h3>
                    <span className={`w-3 h-3 rounded-full ${
                      dept.health === 'GOOD' ? 'bg-green-500' :
                      dept.health === 'MODERATE' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completed</span>
                      <span className="font-medium text-green-400">{dept.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pending</span>
                      <span className="font-medium text-amber-400">{dept.tasksPending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Escalations</span>
                      <span className="font-medium text-red-400">{dept.escalations}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Link
          href="/issues"
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 hover:bg-red-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-red-300">Handle Escalations</p>
              <p className="text-sm text-red-400">{data.clientHealth.escalated} open</p>
            </div>
          </div>
        </Link>

        <Link
          href="/accounts/invoices"
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 hover:bg-amber-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-amber-300">Payment Delays</p>
              <p className="text-sm text-amber-400">{data.finance.overduePayments} overdue</p>
            </div>
          </div>
        </Link>

        <Link
          href="/hiring"
          className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 hover:bg-purple-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-purple-300">Fill Positions</p>
              <p className="text-sm text-purple-400">{data.hiring.openPositions} open</p>
            </div>
          </div>
        </Link>

        <Link
          href="/reports"
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 hover:bg-blue-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-blue-300">Ops Meeting</p>
              <p className="text-sm text-blue-400">View Report</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
