'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface ProviderField {
  key: string
  label: string
  type: 'text' | 'password' | 'url'
  required: boolean
}

interface Provider {
  key: string
  name: string
  type: string
  category: string
  description: string
  docsUrl?: string
  fields: ProviderField[]
}

interface Credential {
  id: string
  provider: string
  credentialType: string
  name: string
  status: string
  environment: string
  lastVerifiedAt: string | null
  lastError: string | null
  usageCount: number
  lastUsedAt: string | null
  createdAt: string
  credentials: Record<string, string>
}

interface Props {
  provider: Provider
  credential?: Credential
  onAdd: () => void
  onEdit: () => void
  onRefresh: () => void
  color?: string
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  INVALID: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  EXPIRED: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  DISABLED: { bg: 'bg-slate-900/40', text: 'text-slate-200', dot: 'bg-slate-900/40' },
}

export function CredentialCard({
  provider,
  credential,
  onAdd,
  onEdit,
  onRefresh,
  color = 'blue',
}: Props) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleTest() {
    if (!credential) return

    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch(`/api/admin/api-credentials/${credential.id}/verify`, {
        method: 'POST',
      })
      const data = await response.json()
      setTestResult({ success: data.success, message: data.message })
      onRefresh()
    } catch {
      setTestResult({ success: false, message: 'Connection test failed' })
    } finally {
      setTesting(false)
    }
  }

  const status = credential?.status || 'NOT_CONFIGURED'
  const statusStyle = statusColors[status] || { bg: 'bg-slate-800/50', text: 'text-slate-300', dot: 'bg-slate-400' }

  return (
    <div className="glass-card rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
            <span className={`text-${color}-600 font-bold text-sm`}>
              {provider.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-white">{provider.name}</h4>
            <p className="text-xs text-slate-400">{provider.type}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
          {credential ? status : 'Not Configured'}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 mb-4">{provider.description}</p>

      {/* Credential Info */}
      {credential && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Environment</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              credential.environment === 'PRODUCTION'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {credential.environment}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Usage</span>
            <span className="text-slate-200">{credential.usageCount} calls</span>
          </div>
          {credential.lastVerifiedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Last Verified</span>
              <span className="text-slate-200">
                {formatDateDDMMYYYY(credential.lastVerifiedAt)}
              </span>
            </div>
          )}
          {credential.lastError && (
            <div className="mt-2 p-2 bg-red-500/10 rounded-lg">
              <p className="text-xs text-red-400">{credential.lastError}</p>
            </div>
          )}
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`mb-4 p-2 rounded-lg ${testResult.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <p className={`text-xs ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
            {testResult.message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {credential ? (
          <>
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20"
            >
              Edit
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex-1 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test'}
            </button>
          </>
        ) : (
          <button
            onClick={onAdd}
            className="w-full px-3 py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20"
          >
            Configure
          </button>
        )}
        {provider.docsUrl && (
          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-slate-400 hover:text-slate-300"
            title="Documentation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
