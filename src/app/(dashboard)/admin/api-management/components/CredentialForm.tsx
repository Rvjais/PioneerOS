'use client'

import { useState, useEffect } from 'react'
import { ReAuthModal } from './ReAuthModal'

interface ProviderField {
  key: string
  label: string
  type: 'text' | 'password' | 'url'
  required: boolean
  placeholder?: string
  helpText?: string
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
  credentials: Record<string, string>
}

interface Props {
  provider: Provider
  credential: Credential | null
  onClose: () => void
  onSuccess: () => void
}

export function CredentialForm({ provider, credential, onClose, onSuccess }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [name, setName] = useState(credential?.name || provider.name)
  const [environment, setEnvironment] = useState<'PRODUCTION' | 'SANDBOX'>(
    (credential?.environment as 'PRODUCTION' | 'SANDBOX') || 'PRODUCTION'
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [loadingExisting, setLoadingExisting] = useState(false)

  // Re-auth state
  const [reAuthToken, setReAuthToken] = useState<string | null>(null)
  const [showReAuthModal, setShowReAuthModal] = useState(false)
  const [reAuthAction, setReAuthAction] = useState<'view' | 'delete'>('view')
  const [credentialsLoaded, setCredentialsLoaded] = useState(false)

  // When editing, show re-auth prompt instead of auto-loading
  useEffect(() => {
    if (credential && !credentialsLoaded) {
      // Show masked values initially
      setValues(credential.credentials)
    }
  }, [credential, credentialsLoaded])

  function handleUnlock() {
    setReAuthAction('view')
    setShowReAuthModal(true)
  }

  async function handleReAuthSuccess(token: string) {
    setReAuthToken(token)
    setShowReAuthModal(false)

    if (reAuthAction === 'view') {
      await loadExistingCredentials(token)
    } else if (reAuthAction === 'delete') {
      await performDelete(token)
    }
  }

  async function loadExistingCredentials(token: string) {
    if (!credential) return

    setLoadingExisting(true)
    try {
      const response = await fetch(`/api/admin/api-credentials/${credential.id}`, {
        headers: {
          'X-ReAuth-Token': token,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresReAuth) {
          setReAuthToken(null)
          setError('Re-authentication required')
          return
        }
        throw new Error(data.error || 'Failed to load credentials')
      }

      setValues(data.values || {})
      setCredentialsLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credentials')
    } finally {
      setLoadingExisting(false)
    }
  }

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function togglePassword(key: string) {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate required fields
    for (const field of provider.fields) {
      if (field.required && !values[field.key]) {
        setError(`${field.label} is required`)
        return
      }
    }

    setSaving(true)
    try {
      const url = credential
        ? `/api/admin/api-credentials/${credential.id}`
        : '/api/admin/api-credentials'

      const response = await fetch(url, {
        method: credential ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider.key,
          credentialType: provider.type,
          name,
          credentials: values,
          environment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save credentials')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save credentials')
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteClick() {
    if (!credential) return
    if (!confirm('Are you sure you want to delete these credentials? This requires password verification.')) return

    setReAuthAction('delete')
    setShowReAuthModal(true)
  }

  async function performDelete(token: string) {
    if (!credential) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/api-credentials/${credential.id}`, {
        method: 'DELETE',
        headers: {
          'X-ReAuth-Token': token,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresReAuth) {
          setReAuthToken(null)
          setError('Re-authentication required')
          return
        }
        throw new Error(data.error || 'Failed to delete credentials')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete credentials')
    } finally {
      setSaving(false)
    }
  }

  const isEditing = !!credential
  const showUnlockPrompt = isEditing && !credentialsLoaded

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {credential ? 'Edit' : 'Configure'} {provider.name}
                </h3>
                <p className="text-sm text-slate-400">{provider.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Environment */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Environment
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="environment"
                    value="PRODUCTION"
                    checked={environment === 'PRODUCTION'}
                    onChange={() => setEnvironment('PRODUCTION')}
                    className="text-blue-400"
                  />
                  <span className="text-sm">Production</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="environment"
                    value="SANDBOX"
                    checked={environment === 'SANDBOX'}
                    onChange={() => setEnvironment('SANDBOX')}
                    className="text-blue-400"
                  />
                  <span className="text-sm">Sandbox</span>
                </label>
              </div>
            </div>

            {/* Unlock prompt for existing credentials */}
            {showUnlockPrompt && (
              <div className="py-6 text-center bg-slate-900/40 rounded-lg border border-white/10">
                <div className="mb-3">
                  <div className="inline-block p-3 bg-amber-500/20 rounded-full">
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Credentials are encrypted. Verify your identity to view and edit.
                </p>
                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={loadingExisting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {loadingExisting ? 'Loading...' : 'Unlock Credentials'}
                </button>
              </div>
            )}

            {/* Credential Fields (only show if new or unlocked) */}
            {(!isEditing || credentialsLoaded) && (
              <>
                {provider.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                        value={values[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => togglePassword(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                          {showPasswords[field.key] ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    {field.helpText && (
                      <p className="mt-1 text-xs text-slate-400">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div>
                {credential && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (isEditing && !credentialsLoaded)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </div>
          </form>

          {/* Docs Link */}
          {provider.docsUrl && (
            <div className="px-6 pb-6">
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View documentation
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Re-auth Modal */}
      <ReAuthModal
        isOpen={showReAuthModal}
        onClose={() => setShowReAuthModal(false)}
        onSuccess={handleReAuthSuccess}
        scope={reAuthAction === 'delete' ? 'delete-credentials' : 'view-credentials'}
        title={reAuthAction === 'delete' ? 'Confirm Deletion' : 'Verify Your Identity'}
        description={
          reAuthAction === 'delete'
            ? 'Enter your password to confirm credential deletion.'
            : 'Enter your password to view encrypted credentials.'
        }
      />
    </>
  )
}
