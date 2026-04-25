'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
  contactName: string | null
  contactEmail: string | null
}

interface PlatformAccount {
  id: string
  platform: string
  accountName: string
  isActive: boolean
}

interface OAuthConnection {
  id: string
  clientId: string
  client: Client
  platform: string
  status: string
  lastError: string | null
  lastSyncAt: string | null
  lastSyncStatus: string | null
  connectedAt: string
  platformEmail: string | null
  agencyAccessGranted: boolean
  agencyAccessVerifiedAt: string | null
  delegatedToEmail: string | null
  accounts: PlatformAccount[]
}

const platformColors: Record<string, { bg: string; text: string }> = {
  GOOGLE: { bg: 'bg-red-500/20', text: 'text-red-400' },
  META: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  LINKEDIN: { bg: 'bg-sky-100', text: 'text-sky-700' },
  TWITTER: { bg: 'bg-slate-800/50', text: 'text-slate-200' },
}

const statusColors: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-green-500/20', text: 'text-green-400' },
  EXPIRED: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  REVOKED: { bg: 'bg-red-500/20', text: 'text-red-400' },
  ERROR: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

export function OAuthConnectionsTab() {
  const [connections, setConnections] = useState<OAuthConnection[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchConnections()
  }, [filterPlatform, filterStatus])

  async function fetchConnections() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterPlatform) params.set('platform', filterPlatform)
      if (filterStatus) params.set('status', filterStatus)

      const response = await fetch(`/api/admin/oauth-connections?${params}`)
      if (!response.ok) throw new Error('Failed to fetch connections')
      const data = await response.json()
      setConnections(data.connections)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections')
    } finally {
      setLoading(false)
    }
  }

  async function handleRefreshToken(id: string) {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/oauth-connections/${id}/refresh`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Token refreshed successfully')
        fetchConnections()
      } else {
        toast.error(`Failed: ${data.message}`)
      }
    } catch {
      toast.error('Failed to refresh token')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Are you sure you want to revoke this connection? The client will need to reconnect.')) {
      return
    }

    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/oauth-connections/${id}/revoke`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchConnections()
      } else {
        toast.error(`Failed: ${data.message || data.error}`)
      }
    } catch {
      toast.error('Failed to revoke connection')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleVerifyAccess(id: string, granted: boolean) {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/oauth-connections/${id}/verify-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: granted }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchConnections()
      } else {
        toast.error(`Failed: ${data.message || data.error}`)
      }
    } catch {
      toast.error('Failed to verify access')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-400">Loading OAuth connections...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchConnections}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header & Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">OAuth Connections</h2>
          <p className="text-sm text-slate-400">All client platform connections</p>
        </div>
        <div className="flex gap-4">
          {Object.entries(stats).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-slate-400">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="px-3 py-2 border border-white/20 rounded-lg text-sm"
        >
          <option value="">All Platforms</option>
          <option value="GOOGLE">Google</option>
          <option value="META">Meta</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="TWITTER">Twitter</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-white/20 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="REVOKED">Revoked</option>
          <option value="ERROR">Error</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Client</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Platform</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Connected</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Agency Access</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Last Sync</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {connections.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No OAuth connections found
                </td>
              </tr>
            ) : (
              connections.map((connection) => (
                <tr key={connection.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-white">{connection.client.name}</p>
                      {connection.platformEmail && (
                        <p className="text-xs text-slate-400">{connection.platformEmail}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[connection.platform]?.bg || 'bg-slate-800/50'} ${platformColors[connection.platform]?.text || 'text-slate-200'}`}>
                      {connection.platform}
                    </span>
                    {connection.accounts.length > 0 && (
                      <span className="ml-2 text-xs text-slate-400">
                        ({connection.accounts.length} accounts)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[connection.status]?.bg || 'bg-slate-800/50'} ${statusColors[connection.status]?.text || 'text-slate-200'}`}>
                      {connection.status}
                    </span>
                    {connection.lastError && (
                      <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={connection.lastError}>
                        {connection.lastError}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-200">
                    {formatDateDDMMYYYY(connection.connectedAt)}
                  </td>
                  <td className="py-3 px-4">
                    {connection.agencyAccessGranted ? (
                      <div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Granted
                        </span>
                        {connection.delegatedToEmail && (
                          <p className="text-xs text-slate-400 mt-1">{connection.delegatedToEmail}</p>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-800/50 text-slate-300">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-200">
                    {connection.lastSyncAt ? (
                      <div>
                        <p>{formatDateDDMMYYYY(connection.lastSyncAt)}</p>
                        <p className={`text-xs ${connection.lastSyncStatus === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
                          {connection.lastSyncStatus}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400">Never</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRefreshToken(connection.id)}
                        disabled={actionLoading === connection.id}
                        className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded disabled:opacity-50"
                        title="Refresh Token"
                      >
                        {actionLoading === connection.id ? '...' : 'Refresh'}
                      </button>
                      {!connection.agencyAccessGranted && (
                        <button
                          onClick={() => handleVerifyAccess(connection.id, true)}
                          disabled={actionLoading === connection.id}
                          className="px-2 py-1 text-xs text-green-400 hover:bg-green-500/10 rounded disabled:opacity-50"
                          title="Verify Agency Access"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleRevoke(connection.id)}
                        disabled={actionLoading === connection.id || connection.status === 'REVOKED'}
                        className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded disabled:opacity-50"
                        title="Revoke Connection"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
