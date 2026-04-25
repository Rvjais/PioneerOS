'use client'

import { useState, useEffect } from 'react'

interface HealthData {
  overview: {
    totalProviders: number
    configuredCount: number
    unconfiguredCount: number
    healthScore: number
  }
  status: {
    active: number
    invalid: number
    expired: number
    disabled: number
  }
  verification: {
    recentlyVerified: number
    staleCount: number
    staleCredentials: Array<{
      id: string
      provider: string
      name: string
      lastVerifiedAt: string | null
    }>
  }
  usage: {
    totalCalls: number
    activelyUsed: number
    topCredentials: Array<{
      id: string
      provider: string
      name: string
      usageCount: number
      lastUsedAt: string
    }>
  }
  alerts: {
    failing: Array<{
      id: string
      provider: string
      name: string
      status: string
      lastError: string | null
    }>
    unconfiguredCritical: string[]
  }
}

export function HealthOverview() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHealth()
  }, [])

  async function loadHealth() {
    try {
      const response = await fetch('/api/admin/api-credentials/health')
      if (!response.ok) throw new Error('Failed to load health data')
      const data = await response.json()
      setHealth(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={`skeleton-${i}`} className="glass-card rounded-xl border border-white/10 p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-20 mb-2"></div>
            <div className="h-8 bg-white/10 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !health) {
    return null
  }

  const { overview, status, verification, usage, alerts } = health

  // Health score color
  const scoreColor =
    overview.healthScore >= 80
      ? 'text-green-400 bg-green-500/10'
      : overview.healthScore >= 60
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-red-400 bg-red-500/10'

  const hasAlerts = alerts.failing.length > 0 || alerts.unconfiguredCritical.length > 0

  return (
    <div className="space-y-4 mb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400 mb-1">Health Score</div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${scoreColor.split(' ')[0]}`}>
              {overview.healthScore}
            </span>
            <span className="text-slate-400 mb-1">/100</span>
          </div>
          <div className="mt-2 h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overview.healthScore >= 80
                  ? 'bg-green-500'
                  : overview.healthScore >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${overview.healthScore}%` }}
            />
          </div>
        </div>

        {/* Configured */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400 mb-1">Configured</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">
              {overview.configuredCount}
            </span>
            <span className="text-slate-400 mb-1">/ {overview.totalProviders}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              {status.active} active
            </span>
            {status.invalid > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                {status.invalid} invalid
              </span>
            )}
          </div>
        </div>

        {/* Verification */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400 mb-1">Verification</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">
              {verification.recentlyVerified}
            </span>
            <span className="text-slate-400 mb-1">recent</span>
          </div>
          {verification.staleCount > 0 && (
            <div className="mt-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {verification.staleCount} need verification
              </span>
            </div>
          )}
        </div>

        {/* Usage */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400 mb-1">API Calls</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">
              {usage.totalCalls.toLocaleString()}
            </span>
          </div>
          <div className="mt-2">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              {usage.activelyUsed} used this week
            </span>
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {hasAlerts && (
        <div className="bg-red-500/10 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-800">Attention Required</h4>
              <div className="mt-2 space-y-2">
                {alerts.failing.map((cred) => (
                  <div key={cred.id} className="flex items-center justify-between text-sm">
                    <span className="text-red-400">
                      <strong>{cred.name}</strong> - {cred.status.toLowerCase()}
                    </span>
                    <span className="text-red-500 text-xs truncate max-w-[200px]">
                      {cred.lastError || 'Verification failed'}
                    </span>
                  </div>
                ))}
                {alerts.unconfiguredCritical.length > 0 && (
                  <div className="text-sm text-red-400">
                    <strong>Missing critical credentials:</strong>{' '}
                    {alerts.unconfiguredCritical.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {verification.staleCredentials.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-amber-800">Stale Credentials</h4>
                <p className="text-sm text-amber-400">
                  {verification.staleCredentials.length} credential(s) haven't been verified in 30+ days
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {verification.staleCredentials.slice(0, 3).map((cred) => (
                <span
                  key={cred.id}
                  className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full"
                >
                  {cred.name}
                </span>
              ))}
              {verification.staleCredentials.length > 3 && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  +{verification.staleCredentials.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
