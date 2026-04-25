'use client'

import { useState, useEffect } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface TacticalMetrics {
  monthlyRevenue: number
  monthlyTarget: number
  collectionRate: number
  outstandingPayments: number
  clientsOnboarded: number
  paymentDelays: number
  avgDaysToCollect: number
  invoiceAccuracy: number
}

interface Issue {
  id: string
  title: string
  client?: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'resolved'
  assignee?: string
}

export default function TacticalMeetingPage() {
  const [metrics, setMetrics] = useState<TacticalMetrics | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  useEffect(() => {
    fetchMetrics()
  }, [selectedMonth])

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`/api/accounts/meetings/tactical?month=${selectedMonth}`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data.metrics)
        setIssues(data.issues || [])
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const progressToTarget = metrics && metrics.monthlyTarget > 0
    ? Math.round((metrics.monthlyRevenue / metrics.monthlyTarget) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Tactical Meeting</h1>
            <InfoTooltip
              title="Tactical Meeting"
              steps={[
                'Monthly management review',
                'Track revenue vs target',
                'Monitor collection efficiency',
                'Review process issues'
              ]}
              tips={[
                'Hold weekly or bi-weekly',
                'Focus on trends and patterns'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Monthly management review</p>
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Revenue Progress */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-emerald-400">Monthly Revenue</p>
                <p className="text-4xl font-bold text-white">
                  Rs. {(metrics?.monthlyRevenue || 0).toLocaleString()}
                </p>
                <p className="text-sm text-emerald-400 mt-1">
                  Target: Rs. {(metrics?.monthlyTarget || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white">{progressToTarget}%</p>
                <p className="text-emerald-400">of target</p>
              </div>
            </div>
            <div className="h-3 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progressToTarget >= 100 ? 'bg-emerald-500' :
                  progressToTarget >= 75 ? 'bg-teal-500' :
                  progressToTarget >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(progressToTarget, 100)}%` }}
              />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">Collection Rate</p>
              <p className="text-3xl font-bold text-white">{metrics?.collectionRate || 0}%</p>
              <p className="text-xs text-blue-400 mt-1">
                {(metrics?.collectionRate || 0) >= 90 ? 'Excellent' :
                 (metrics?.collectionRate || 0) >= 75 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 text-sm">Outstanding</p>
              <p className="text-2xl font-bold text-white">
                Rs. {((metrics?.outstandingPayments || 0) / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-amber-400 mt-1">Pending collection</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-400 text-sm">Avg Days to Collect</p>
              <p className="text-3xl font-bold text-white">{metrics?.avgDaysToCollect || 0}</p>
              <p className="text-xs text-purple-400 mt-1">From invoice date</p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <p className="text-cyan-400 text-sm">Clients Onboarded</p>
              <p className="text-3xl font-bold text-white">{metrics?.clientsOnboarded || 0}</p>
              <p className="text-xs text-cyan-400 mt-1">This month</p>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Collection Efficiency</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">On-time Payments</span>
                    <span className="text-emerald-400">{100 - (metrics?.paymentDelays || 0)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${100 - (metrics?.paymentDelays || 0)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Invoice Accuracy</span>
                    <span className="text-blue-400">{metrics?.invoiceAccuracy || 0}%</span>
                  </div>
                  <div className="h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${metrics?.invoiceAccuracy || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Payment Delays</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    <circle
                      cx="64" cy="64" r="56" fill="none"
                      stroke={
                        (metrics?.paymentDelays || 0) <= 10 ? 'rgb(16, 185, 129)' :
                        (metrics?.paymentDelays || 0) <= 25 ? 'rgb(245, 158, 11)' : 'rgb(239, 68, 68)'
                      }
                      strokeWidth="12"
                      strokeDasharray={`${(metrics?.paymentDelays || 0) * 3.51} 351`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{metrics?.paymentDelays || 0}%</span>
                    <span className="text-xs text-slate-400">Delayed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Open Issues */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-bold text-white">Issues to Discuss</h3>
            </div>

            {issues.length > 0 ? (
              <div className="divide-y divide-white/5">
                {issues.map(issue => (
                  <div key={issue.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        issue.priority === 'high' ? 'bg-red-500' :
                        issue.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div>
                        <p className="font-medium text-white">{issue.title}</p>
                        {issue.client && (
                          <p className="text-sm text-slate-400">{issue.client}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      issue.status === 'open' ? 'bg-red-500/20 text-red-400' :
                      issue.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {issue.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                No open issues
              </div>
            )}
          </div>

          {/* Meeting Agenda */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Tactical Meeting Agenda</h3>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm">1</span>
                <span>Month-to-date revenue vs target</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm">2</span>
                <span>Collection rate trend analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm">3</span>
                <span>Outstanding payments breakdown</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm">4</span>
                <span>Client onboarding efficiency</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm">5</span>
                <span>Process improvements needed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm">6</span>
                <span>Next month projections</span>
              </li>
            </ol>
          </div>
        </>
      )}
    </div>
  )
}
