'use client'

import { useState } from 'react'
import { Account } from './types'

const PLATFORMS = [
  { key: 'GOOGLE_ANALYTICS', name: 'Google Analytics' },
  { key: 'GOOGLE_SEARCH_CONSOLE', name: 'Google Search Console' },
  { key: 'GOOGLE_ADS', name: 'Google Ads' },
  { key: 'META_ADS', name: 'Meta Ads' },
  { key: 'META_SOCIAL', name: 'Meta Social' },
  { key: 'LINKEDIN', name: 'LinkedIn' },
  { key: 'YOUTUBE', name: 'YouTube' },
] as const

const ACCESS_TYPES = [
  { key: 'MANUAL', name: 'Manual Entry', description: 'Data will be imported manually' },
  { key: 'DELEGATED', name: 'Delegated Access', description: 'Client granted read access' },
] as const

interface Props {
  clientId: string
  clientName: string
  defaultPlatform: string | null
  onClose: () => void
  onAccountAdded: (account: Account) => void
}

export default function AddAccountModal({
  clientId,
  clientName,
  defaultPlatform,
  onClose,
  onAccountAdded,
}: Props) {
  const [platform, setPlatform] = useState(defaultPlatform || PLATFORMS[0].key)
  const [accountId, setAccountId] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accessType, setAccessType] = useState<'MANUAL' | 'DELEGATED'>('MANUAL')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/clients/${clientId}/platform-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          accountId,
          accountName,
          accessType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add account')
      }

      onAccountAdded(data.account)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Add Platform Account</h2>
            <p className="text-slate-400 text-sm">{clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'dark' }}
            >
              {PLATFORMS.map((p) => (
                <option key={p.key} value={p.key} className="bg-slate-800 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Account ID / Property ID
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g., UA-123456789 or 123456789"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-slate-400 text-xs mt-1">
              The unique identifier for this account on the platform
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g., Main Website Analytics"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Access Type
            </label>
            <div className="space-y-2">
              {ACCESS_TYPES.map((type) => (
                <label
                  key={type.key}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    accessType === type.key
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="accessType"
                    value={type.key}
                    checked={accessType === type.key}
                    onChange={(e) => setAccessType(e.target.value as 'MANUAL' | 'DELEGATED')}
                    className="mt-0.5 mr-3"
                  />
                  <div>
                    <p className="font-medium text-white">{type.name}</p>
                    <p className="text-slate-400 text-sm">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !accountId || !accountName}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
