'use client'

import { useState, useEffect } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface PerformanceMetrics {
  collectionsHandled: number
  collectionsTarget: number
  invoicesProcessed: number
  invoicesTarget: number
  avgCollectionTime: number
  collectionRate: number
  discrepanciesResolved: number
  clientsSatisfied: number
}

interface PerformanceHistory {
  month: string
  collections: number
  invoices: number
  collectionRate: number
}

export default function AccountsPerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [history, setHistory] = useState<PerformanceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchPerformance()
  }, [selectedPeriod])

  const fetchPerformance = async () => {
    try {
      const res = await fetch(`/api/accounts/performance?period=${selectedPeriod}`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data.metrics)
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Error fetching performance:', error)
    } finally {
      setLoading(false)
    }
  }

  const collectionsProgress = metrics && metrics.collectionsTarget > 0
    ? Math.round((metrics.collectionsHandled / metrics.collectionsTarget) * 100)
    : 0

  const invoicesProgress = metrics && metrics.invoicesTarget > 0
    ? Math.round((metrics.invoicesProcessed / metrics.invoicesTarget) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">My Performance</h1>
            <InfoTooltip
              title="Accounts Performance"
              steps={[
                'Track your collections and invoices processed',
                'Monitor collection efficiency',
                'Review performance history',
                'Compare against targets'
              ]}
              tips={[
                'Focus on high-value collections',
                'Reduce average collection time'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Track your accounts performance metrics</p>
        </div>

        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Main Progress Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Collections Progress */}
            <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-emerald-400">Collections Handled</p>
                  <p className="text-4xl font-bold text-white">
                    Rs. {((metrics?.collectionsHandled || 0) / 100000).toFixed(1)}L
                  </p>
                  <p className="text-sm text-emerald-400 mt-1">
                    Target: Rs. {((metrics?.collectionsTarget || 0) / 100000).toFixed(1)}L
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white">{collectionsProgress}%</p>
                  <p className="text-emerald-400">of target</p>
                </div>
              </div>
              <div className="h-3 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    collectionsProgress >= 100 ? 'bg-emerald-500' :
                    collectionsProgress >= 75 ? 'bg-teal-500' :
                    collectionsProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(collectionsProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Invoices Progress */}
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-400">Invoices Processed</p>
                  <p className="text-4xl font-bold text-white">{metrics?.invoicesProcessed || 0}</p>
                  <p className="text-sm text-blue-400 mt-1">
                    Target: {metrics?.invoicesTarget || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white">{invoicesProgress}%</p>
                  <p className="text-blue-400">of target</p>
                </div>
              </div>
              <div className="h-3 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    invoicesProgress >= 100 ? 'bg-blue-500' :
                    invoicesProgress >= 75 ? 'bg-indigo-500' :
                    invoicesProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(invoicesProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-400 text-sm">Avg Collection Time</p>
              <p className="text-3xl font-bold text-white">{metrics?.avgCollectionTime || 0}</p>
              <p className="text-xs text-purple-400 mt-1">days</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 text-sm">Collection Rate</p>
              <p className="text-3xl font-bold text-white">{metrics?.collectionRate || 0}%</p>
              <p className="text-xs text-amber-400 mt-1">success rate</p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <p className="text-cyan-400 text-sm">Discrepancies Resolved</p>
              <p className="text-3xl font-bold text-white">{metrics?.discrepanciesResolved || 0}</p>
              <p className="text-xs text-cyan-400 mt-1">this {selectedPeriod}</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-emerald-400 text-sm">Clients Satisfied</p>
              <p className="text-3xl font-bold text-white">{metrics?.clientsSatisfied || 0}%</p>
              <p className="text-xs text-emerald-400 mt-1">satisfaction rate</p>
            </div>
          </div>

          {/* Performance History */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Performance History</h3>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={item.month} className="flex items-center gap-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                    <div className="w-24 text-slate-400 text-sm">{item.month}</div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Collections</span>
                          <span className="text-emerald-400">Rs. {(item.collections / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="h-1.5 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min((item.collections / (metrics?.collectionsTarget || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Invoices</span>
                          <span className="text-blue-400">{item.invoices}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((item.invoices / (metrics?.invoicesTarget || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        item.collectionRate >= 90 ? 'text-emerald-400' :
                        item.collectionRate >= 75 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {item.collectionRate}%
                      </span>
                      <p className="text-xs text-slate-400">rate</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">No history data available</p>
            )}
          </div>

          {/* Performance Tips */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Performance Tips</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-white">Follow up within 24 hours</p>
                  <p className="text-sm text-slate-400">Quick follow-ups improve collection rates by 40%</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-white">Verify invoice accuracy</p>
                  <p className="text-sm text-slate-400">Accurate invoices reduce payment delays</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-white">Use templates effectively</p>
                  <p className="text-sm text-slate-400">Professional templates save time and ensure consistency</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-white">Track aging closely</p>
                  <p className="text-sm text-slate-400">Address overdue payments before they become bad debt</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
