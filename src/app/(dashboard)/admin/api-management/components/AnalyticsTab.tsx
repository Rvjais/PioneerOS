'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface AnalyticsData {
  summary: {
    totalCredentials: number
    totalApiCalls: number
    activeCredentials: number
    inactiveCredentials: number
    verificationSuccessRate: number
  }
  usageByProvider: Array<{
    provider: string
    name: string
    totalCalls: number
    lastUsed: string | null
  }>
  topCredentials: Array<{
    id: string
    provider: string
    name: string
    usageCount: number
    lastUsedAt: string | null
    status: string
  }>
  dailyActivity: Array<{
    date: string
    views: number
    updates: number
    verifications: number
  }>
  topActiveProviders: Array<{
    provider: string
    name: string
    activityCount: number
  }>
}

export function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/api-credentials/analytics')
      if (!response.ok) throw new Error('Failed to load analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-400">Loading analytics...</p>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error || 'Failed to load analytics'}</div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const { summary, usageByProvider, topCredentials, dailyActivity, topActiveProviders } = analytics

  // Calculate max for chart scaling
  const maxDailyActivity = Math.max(
    ...dailyActivity.map((d) => d.views + d.updates + d.verifications),
    1
  )
  const maxUsage = Math.max(...usageByProvider.map((p) => p.totalCalls), 1)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Usage Analytics</h2>
          <p className="text-sm text-slate-400">
            Track credential usage and activity over time
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 text-sm text-slate-300 border border-white/20 rounded-lg hover:bg-slate-900/40"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-blue-100 text-sm">Total API Calls</div>
          <div className="text-3xl font-bold mt-1">
            {summary.totalApiCalls.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-green-100 text-sm">Active Credentials</div>
          <div className="text-3xl font-bold mt-1">
            {summary.activeCredentials}
            <span className="text-lg font-normal">/{summary.totalCredentials}</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-purple-100 text-sm">Inactive (7d)</div>
          <div className="text-3xl font-bold mt-1">{summary.inactiveCredentials}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div className="text-amber-100 text-sm">Verification Rate</div>
          <div className="text-3xl font-bold mt-1">{summary.verificationSuccessRate}%</div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Activity (Last 30 Days)
        </h3>
        <div className="flex items-end gap-1 h-32">
          {dailyActivity.map((day) => {
            const total = day.views + day.updates + day.verifications
            const height = (total / maxDailyActivity) * 100
            return (
              <div
                key={day.date}
                className="flex-1 group relative"
              >
                <div
                  className="bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    <div>{formatDateDDMMYYYY(day.date)}</div>
                    <div>Views: {day.views}</div>
                    <div>Updates: {day.updates}</div>
                    <div>Verifications: {day.verifications}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{formatDateDDMMYYYY(dailyActivity[0]?.date)}</span>
          <span>{formatDateDDMMYYYY(dailyActivity[dailyActivity.length - 1]?.date)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Provider */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            Usage by Provider
          </h3>
          <div className="space-y-3">
            {usageByProvider.slice(0, 8).map((provider) => (
              <div key={provider.provider}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-200">{provider.name}</span>
                  <span className="text-slate-400">
                    {provider.totalCalls.toLocaleString()} calls
                  </span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(provider.totalCalls / maxUsage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {usageByProvider.length === 0 && (
              <p className="text-slate-400 text-sm">No usage data yet</p>
            )}
          </div>
        </div>

        {/* Top Credentials */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            Most Active Credentials
          </h3>
          <div className="space-y-3">
            {topCredentials.slice(0, 8).map((cred, index) => (
              <div
                key={cred.id}
                className="flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-slate-800/50 text-slate-300 text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200 truncate">{cred.name}</div>
                  <div className="text-xs text-slate-400">
                    {cred.lastUsedAt
                      ? `Last used ${formatDateDDMMYYYY(cred.lastUsedAt)}`
                      : 'Never used'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {cred.usageCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">calls</div>
                </div>
              </div>
            ))}
            {topCredentials.length === 0 && (
              <p className="text-slate-400 text-sm">No credentials yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Most Active Providers (Admin Activity) */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Most Admin Activity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topActiveProviders.map((provider, index) => (
            <div
              key={provider.provider}
              className="text-center p-4 bg-slate-900/40 rounded-lg"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center mx-auto mb-2">
                {index + 1}
              </div>
              <div className="font-medium text-slate-200 truncate">{provider.name}</div>
              <div className="text-sm text-slate-400">{provider.activityCount} actions</div>
            </div>
          ))}
          {topActiveProviders.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-4">
              No admin activity yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
