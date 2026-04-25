'use client'

import { useState, useEffect } from 'react'

interface PlatformStatus {
  connected: boolean
  status: string
  lastSync?: string
  error?: string
  accounts: string[]
}

interface ConnectionsData {
  status: Record<string, PlatformStatus>
}

const PLATFORMS = [
  {
    id: 'GOOGLE',
    name: 'Google',
    description: 'Analytics, Search Console, Ads',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    color: 'blue',
  },
  {
    id: 'META',
    name: 'Meta',
    description: 'Facebook, Instagram, Ads',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: 'indigo',
  },
  {
    id: 'LINKEDIN',
    name: 'LinkedIn',
    description: 'Company Pages, Ads',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: 'sky',
  },
]

interface ConnectPlatformsProps {
  clientId: string
  onConnect?: (platform: string) => void
}

export function ConnectPlatforms({ clientId, onConnect }: ConnectPlatformsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [connections, setConnections] = useState<ConnectionsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [clientId])

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/integrations/status/${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setConnections(data)
      }
    } catch (err) {
      console.error('Failed to fetch integration status:', err)
    }
  }

  const handleConnect = async (platformId: string) => {
    setLoading(platformId)
    setError(null)

    try {
      const res = await fetch(`/api/integrations/${platformId.toLowerCase()}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          returnUrl: window.location.href,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start connection')
      }

      const { authUrl } = await res.json()

      // Open OAuth popup or redirect
      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setLoading(null)
    }
  }

  const handleDisconnect = async (platformId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformId}?`)) return

    setLoading(platformId)

    try {
      await fetch(`/api/integrations/${platformId.toLowerCase()}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })

      fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed')
    } finally {
      setLoading(null)
    }
  }

  const handleSync = async (platformId: string) => {
    setLoading(platformId)

    try {
      const res = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, daysBack: 30 }),
      })

      if (res.ok) {
        fetchStatus()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => {
          const status = connections?.status?.[platform.id]
          const isConnected = status?.connected
          const isLoading = loading === platform.id

          return (
            <div
              key={platform.id}
              className={`relative bg-slate-800/50 border rounded-2xl p-5 transition-all ${
                isConnected
                  ? 'border-emerald-500/50'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Status badge */}
              {isConnected && (
                <div className="absolute top-3 right-3">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">{platform.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">{platform.name}</h3>
                  <p className="text-sm text-slate-400">{platform.description}</p>
                </div>
              </div>

              {isConnected ? (
                <div className="space-y-3">
                  {/* Connected accounts */}
                  {status.accounts && status.accounts.length > 0 && (
                    <div className="text-sm">
                      <p className="text-slate-400 mb-1">Connected accounts:</p>
                      <div className="flex flex-wrap gap-1">
                        {status.accounts.slice(0, 3).map((acc, i) => (
                          <span
                            key={`acc-${acc}-${i}`}
                            className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300"
                          >
                            {acc}
                          </span>
                        ))}
                        {status.accounts.length > 3 && (
                          <span className="text-xs text-slate-400">
                            +{status.accounts.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last sync */}
                  {status.lastSync && (
                    <p className="text-xs text-slate-400">
                      Last sync: {new Date(status.lastSync).toLocaleString()}
                    </p>
                  )}

                  {/* Error */}
                  {status.error && (
                    <p className="text-xs text-red-400">{status.error}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(platform.id)}
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                    >
                      {isLoading ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isLoading}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform.id)}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-${platform.color}-600 hover:bg-${platform.color}-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Connect
                    </>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
        <p className="text-slate-400 text-sm">
          <strong className="text-slate-400">How it works:</strong> When you connect a platform, we securely store access
          and automatically sync data daily. Your reports will be populated with real metrics - no manual entry needed.
        </p>
      </div>
    </div>
  )
}
