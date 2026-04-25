'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  description: string
  activityType: string
  status: string
  plannedHours: number
  actualHours: number | null
  proofUrl: string | null
  clientName: string | null
  managerReviewed: boolean
  managerRating: number | null
  managerFeedback: string | null
}

interface Plan {
  id: string
  date: string
  status: string
  tasks: Task[]
}

interface MonthlyGroup {
  month: string
  monthLabel: string
  totalTasks: number
  completedTasks: number
  totalPlannedHours: number
  totalActualHours: number
  avgManagerRating: number | null
  plans: Plan[]
}

export default function TaskHistoryPage() {
  const [history, setHistory] = useState<MonthlyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/tasks/daily/history?months=12')
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history || [])
        // Auto-expand current month
        if (data.history.length > 0) {
          setExpandedMonths(new Set([data.history[0].month]))
        }
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(month)) {
        next.delete(month)
      } else {
        next.add(month)
      }
      return next
    })
  }

  const toggleDay = (planId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(planId)) {
        next.delete(planId)
      } else {
        next.add(planId)
      }
      return next
    })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400'
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-400'
      case 'BREAKDOWN':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-slate-800/50 text-slate-200'
    }
  }

  const renderRatingStars = (rating: number | null) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task History</h1>
            <p className="text-indigo-200">View your past tasks organized by month</p>
          </div>
          <Link
            href="/tasks/daily"
            className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Daily Tracker
          </Link>
        </div>
      </div>

      {/* Monthly Groups */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center text-slate-400">
            <p>No task history found</p>
            <Link href="/tasks/daily" className="text-indigo-600 hover:underline mt-2 inline-block">
              Start planning your tasks
            </Link>
          </div>
        ) : (
          history.map((group) => (
            <div key={group.month} className="glass-card rounded-xl border border-white/10 overflow-hidden">
              {/* Month Header (Collapsible) */}
              <button
                onClick={() => toggleMonth(group.month)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`transform transition-transform ${
                      expandedMonths.has(group.month) ? 'rotate-90' : ''
                    }`}
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white">{group.monthLabel}</h2>
                    <p className="text-sm text-slate-400">
                      {group.completedTasks}/{group.totalTasks} tasks completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Hours</p>
                    <p className="font-medium text-white">
                      {group.totalActualHours.toFixed(1)}h / {group.totalPlannedHours.toFixed(1)}h
                    </p>
                  </div>
                  {group.avgManagerRating && (
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Avg Rating</p>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-yellow-600">{group.avgManagerRating.toFixed(1)}</span>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div
                    className={`w-16 h-2 bg-white/10 rounded-full overflow-hidden ${
                      expandedMonths.has(group.month) ? '' : ''
                    }`}
                  >
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${group.totalTasks > 0 ? (group.completedTasks / group.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </button>

              {/* Month Content (Days) */}
              {expandedMonths.has(group.month) && (
                <div className="border-t border-white/10 divide-y divide-white/10">
                  {group.plans.map((plan) => (
                    <div key={plan.id} className="bg-slate-900/40">
                      {/* Day Header */}
                      <button
                        onClick={() => toggleDay(plan.id)}
                        className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`transform transition-transform ${
                              expandedDays.has(plan.id) ? 'rotate-90' : ''
                            }`}
                          >
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <span className="font-medium text-slate-200">{formatDate(plan.date)}</span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              plan.status === 'SUBMITTED'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-slate-800/50 text-slate-300'
                            }`}
                          >
                            {plan.status}
                          </span>
                        </div>
                        <span className="text-sm text-slate-400">{plan.tasks.length} tasks</span>
                      </button>

                      {/* Day Tasks */}
                      {expandedDays.has(plan.id) && (
                        <div className="px-5 pb-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-slate-400 text-xs uppercase">
                                <th className="text-left py-2 font-medium">Task</th>
                                <th className="text-left py-2 font-medium">Client</th>
                                <th className="text-center py-2 font-medium">Hours</th>
                                <th className="text-center py-2 font-medium">Status</th>
                                <th className="text-center py-2 font-medium">Proof</th>
                                <th className="text-center py-2 font-medium">Manager Review</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {plan.tasks.map((task) => (
                                <tr key={task.id} className="hover:glass-card">
                                  <td className="py-2 pr-3">
                                    <p className="text-white truncate max-w-xs" title={task.description}>
                                      {task.description}
                                    </p>
                                    <p className="text-xs text-slate-400">{task.activityType}</p>
                                  </td>
                                  <td className="py-2 text-slate-300">
                                    {task.clientName || <span className="text-slate-400 italic">Internal</span>}
                                  </td>
                                  <td className="py-2 text-center">
                                    <span className="text-white">{task.actualHours || task.plannedHours}h</span>
                                  </td>
                                  <td className="py-2 text-center">
                                    <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(task.status)}`}>
                                      {task.status}
                                    </span>
                                  </td>
                                  <td className="py-2 text-center">
                                    {task.proofUrl ? (
                                      <a
                                        href={task.proofUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-700"
                                        title={task.proofUrl}
                                      >
                                        <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                          />
                                        </svg>
                                      </a>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-center">
                                    {task.managerReviewed ? (
                                      <div className="flex flex-col items-center">
                                        {renderRatingStars(task.managerRating)}
                                        {task.managerFeedback && (
                                          <p
                                            className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]"
                                            title={task.managerFeedback}
                                          >
                                            "{task.managerFeedback}"
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400">Pending</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
