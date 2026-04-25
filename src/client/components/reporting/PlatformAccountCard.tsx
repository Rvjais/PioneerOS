'use client'

import { useState } from 'react'
import { Account } from './types'

interface Props {
  account: Account
  clientId: string
  onUpdate: (account: Account) => void
  onDelete: (accountId: string) => void
  onImport: () => void
}

export default function PlatformAccountCard({
  account,
  clientId,
  onUpdate,
  onDelete,
  onImport,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleActive = async () => {
    setIsToggling(true)
    try {
      const res = await fetch(
        `/api/clients/${clientId}/platform-accounts/${account.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !account.isActive }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        onUpdate(data.account)
      }
    } catch (error) {
      console.error('Failed to toggle account:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this account and all its data?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(
        `/api/clients/${clientId}/platform-accounts/${account.id}`,
        { method: 'DELETE' }
      )

      if (res.ok) {
        onDelete(account.id)
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`border rounded-lg p-3 transition-colors ${
        account.isActive
          ? 'border-slate-600 bg-slate-900/50'
          : 'border-slate-700/50 bg-slate-900/30 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-sm truncate">
              {account.accountName}
            </span>
            {account.syncError && (
              <span className="w-2 h-2 bg-red-500 rounded-full" title={account.syncError} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{account.accountId}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                account.accessType === 'OAUTH'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : account.accessType === 'MANUAL'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-purple-500/20 text-purple-400'
              }`}
            >
              {account.accessType}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onImport}
            className="p-1.5 text-slate-400 hover:text-emerald-400 rounded transition-colors"
            title="Import data"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Data Points</span>
              <p className="text-white font-medium">{account.metricsCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-400">Last Sync</span>
              <p className="text-white">{formatDate(account.lastSyncAt)}</p>
            </div>
          </div>

          {account.syncError && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs">
              {account.syncError}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                account.isActive
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              }`}
            >
              {isToggling ? '...' : account.isActive ? 'Disable' : 'Enable'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium transition-colors"
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
