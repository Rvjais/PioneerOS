'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface OperationalMetrics {
  invoicesSent: number
  invoicesPending: number
  paymentsReceived: number
  paymentsAmount: number
  clientsOnboarding: number
  overdueFollowups: number
  discrepanciesOpen: number
  tasksCompleted: number
}

interface ActionItem {
  id: string
  task: string
  assignee: string
  dueDate: string
  status: 'pending' | 'completed'
}

export default function OperationalMeetingPage() {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week'>('week')
  const [newAction, setNewAction] = useState({ task: '', assignee: '', dueDate: '' })

  useEffect(() => {
    fetchMetrics()
  }, [selectedPeriod])

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`/api/accounts/meetings/operational?period=${selectedPeriod}`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data.metrics)
        setActionItems(data.actionItems || [])
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const addActionItem = async () => {
    if (!newAction.task || !newAction.assignee) return

    const item: ActionItem = {
      id: `action-${Date.now()}`,
      ...newAction,
      status: 'pending'
    }

    setActionItems(prev => [...prev, item])
    setNewAction({ task: '', assignee: '', dueDate: '' })
  }

  const toggleActionStatus = (id: string) => {
    setActionItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' }
        : item
    ))
  }

  const today = new Date()
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Operational Meeting</h1>
            <InfoTooltip
              title="Operational Meeting"
              steps={[
                'Daily or weekly operations review',
                'Track invoices sent and payments received',
                'Monitor pending onboardings',
                'Review and assign action items'
              ]}
              tips={[
                'Hold daily standup at 10 AM',
                'Focus on immediate blockers'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">{dayName}, {formatDateDDMMYYYY(today)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('day')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'day'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">Invoices Sent</p>
              <p className="text-3xl font-bold text-white">{metrics?.invoicesSent || 0}</p>
              {metrics?.invoicesPending ? (
                <p className="text-xs text-blue-400 mt-1">{metrics.invoicesPending} pending</p>
              ) : null}
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-emerald-400 text-sm">Payments Received</p>
              <p className="text-3xl font-bold text-white">{metrics?.paymentsReceived || 0}</p>
              {metrics?.paymentsAmount ? (
                <p className="text-xs text-emerald-400 mt-1">Rs. {metrics.paymentsAmount.toLocaleString()}</p>
              ) : null}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 text-sm">Pending Onboardings</p>
              <p className="text-3xl font-bold text-white">{metrics?.clientsOnboarding || 0}</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm">Overdue Follow-ups</p>
              <p className="text-3xl font-bold text-white">{metrics?.overdueFollowups || 0}</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Open Discrepancies</p>
                  <p className="text-2xl font-bold text-white">{metrics?.discrepanciesOpen || 0}</p>
                </div>
                {(metrics?.discrepanciesOpen || 0) > 0 && (
                  <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">Needs Attention</span>
                )}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Tasks Completed</p>
                  <p className="text-2xl font-bold text-white">{metrics?.tasksCompleted || 0}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">On Track</span>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-bold text-white">Action Items</h3>
            </div>

            <div className="divide-y divide-white/5">
              {actionItems.map(item => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <button
                    onClick={() => toggleActionStatus(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      item.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-500 hover:border-emerald-500'
                    }`}
                  >
                    {item.status === 'completed' && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1">
                    <p className={`font-medium ${item.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {item.task}
                    </p>
                    <p className="text-sm text-slate-400">
                      {item.assignee} {item.dueDate && `• Due: ${item.dueDate}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Action Item */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newAction.task}
                  onChange={e => setNewAction(prev => ({ ...prev, task: e.target.value }))}
                  placeholder="New action item..."
                  className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
                <input
                  type="text"
                  value={newAction.assignee}
                  onChange={e => setNewAction(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder="Assignee"
                  className="w-32 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
                <button
                  onClick={addActionItem}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Meeting Agenda Template */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Meeting Agenda</h3>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm">1</span>
                <span>Review yesterday's action items</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm">2</span>
                <span>Invoices sent vs pending</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm">3</span>
                <span>Payments received today</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm">4</span>
                <span>Overdue follow-ups priority</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm">5</span>
                <span>Client onboarding status</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm">6</span>
                <span>Blockers and support needed</span>
              </li>
            </ol>
          </div>
        </>
      )}
    </div>
  )
}
