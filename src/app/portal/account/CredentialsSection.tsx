'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter, ConfirmModal } from '@/client/components/ui/Modal'
import { Credential, copyToClipboard } from './types'

const CATEGORIES = [
  { value: 'PLATFORM', label: 'Platform' },
  { value: 'SOCIAL', label: 'Social Media' },
  { value: 'HOSTING', label: 'Hosting' },
  { value: 'ANALYTICS', label: 'Analytics' },
  { value: 'ADS', label: 'Advertising' },
  { value: 'OTHER', label: 'Other' },
]

const PLATFORM_SUGGESTIONS = [
  'Google Analytics',
  'Google Search Console',
  'Google Ads',
  'Google Business Profile',
  'Meta Business Suite',
  'Facebook Ads',
  'Instagram',
  'LinkedIn',
  'Twitter/X',
  'YouTube',
  'WordPress',
  'Shopify',
  'Web Hosting',
  'Mailchimp',
  'HubSpot',
]

interface CredentialsSectionProps {
  isPrimaryUser: boolean
  userRole: string | undefined
}

export default function CredentialsSection({ isPrimaryUser, userRole }: CredentialsSectionProps) {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [credentialsLoading, setCredentialsLoading] = useState(true)
  const [showCredentialModal, setShowCredentialModal] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
  const [credentialForm, setCredentialForm] = useState({
    platform: '',
    category: 'PLATFORM',
    username: '',
    email: '',
    password: '',
    url: '',
    notes: '',
  })
  const [savingCredential, setSavingCredential] = useState(false)
  const [credentialError, setCredentialError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deletingCredential, setDeletingCredential] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (userRole) {
      fetchCredentials()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole])

  const fetchCredentials = async () => {
    setCredentialsLoading(true)
    try {
      const reveal = userRole === 'PRIMARY'
      const res = await fetch(`/api/client-portal/credentials${reveal ? '?reveal=true' : ''}`)
      if (res.ok) {
        const data = await res.json()
        setCredentials(data.credentials || [])
      }
    } catch (error) {
      console.error('Failed to fetch credentials:', error)
    } finally {
      setCredentialsLoading(false)
    }
  }

  const openCredentialForm = (credential?: Credential) => {
    if (credential) {
      setEditingCredential(credential)
      setCredentialForm({
        platform: credential.label || '',
        category: credential.category || 'PLATFORM',
        username: credential.username || '',
        email: credential.email || '',
        password: credential.password || '',
        url: credential.url || '',
        notes: credential.notes || '',
      })
    } else {
      setEditingCredential(null)
      setCredentialForm({
        platform: '',
        category: 'PLATFORM',
        username: '',
        email: '',
        password: '',
        url: '',
        notes: '',
      })
    }
    setShowPassword(false)
    setCredentialError(null)
    setShowCredentialModal(true)
  }

  const handleSaveCredential = async () => {
    if (!credentialForm.platform.trim()) {
      setCredentialError('Platform name is required')
      return
    }

    setSavingCredential(true)
    setCredentialError(null)

    try {
      const method = editingCredential ? 'PUT' : 'POST'
      const body = editingCredential
        ? { id: editingCredential.id, ...credentialForm }
        : credentialForm

      const res = await fetch('/api/client-portal/credentials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save credential')
      }

      setShowCredentialModal(false)
      setEditingCredential(null)
      fetchCredentials()
    } catch (err) {
      setCredentialError(err instanceof Error ? err.message : 'Failed to save credential')
    } finally {
      setSavingCredential(false)
    }
  }

  const handleDeleteCredential = async (id: string) => {
    setDeletingCredential(true)
    try {
      const res = await fetch(`/api/client-portal/credentials?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setShowDeleteConfirm(null)
        fetchCredentials()
      }
    } catch (err) {
      console.error('Failed to delete credential:', err)
    } finally {
      setDeletingCredential(false)
    }
  }

  const toggleRevealPassword = (credentialId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }))
  }

  return (
    <>
      <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Stored Credentials</h3>
              <p className="text-sm text-slate-400 mt-1">Access credentials shared with our team</p>
            </div>
            <div className="flex items-center gap-3">
              {isPrimaryUser && (
                <button
                  onClick={() => openCredentialForm()}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Credential
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Securely stored
              </div>
            </div>
          </div>
        </div>

        {credentialsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : credentials.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <p className="text-slate-400">No credentials have been stored yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {credentials.map((cred) => (
              <div key={cred.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{cred.label}</p>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800/50 text-slate-300">{cred.category}</span>
                      </div>
                      {cred.url && (
                        <a
                          href={cred.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline"
                        >
                          {cred.url}
                        </a>
                      )}

                      {/* Credential details */}
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {cred.username && (
                          <div>
                            <p className="text-xs text-slate-400 uppercase">Username</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{cred.username}</span>
                              <button
                                onClick={() => copyToClipboard(cred.username!)}
                                className="p-1 hover:bg-slate-800/50 rounded"
                                title="Copy"
                              >
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {cred.email && (
                          <div>
                            <p className="text-xs text-slate-400 uppercase">Email</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{cred.email}</span>
                              <button
                                onClick={() => copyToClipboard(cred.email!)}
                                className="p-1 hover:bg-slate-800/50 rounded"
                                title="Copy"
                              >
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {cred.hasPassword && (
                          <div>
                            <p className="text-xs text-slate-400 uppercase">Password</p>
                            <div className="flex items-center gap-2">
                              {isPrimaryUser && cred.password ? (
                                <>
                                  <span className="text-sm font-medium text-white font-mono">
                                    {revealedPasswords[cred.id] ? cred.password : '********'}
                                  </span>
                                  <button
                                    onClick={() => toggleRevealPassword(cred.id)}
                                    className="p-1 hover:bg-slate-800/50 rounded"
                                    title={revealedPasswords[cred.id] ? 'Hide' : 'Reveal'}
                                  >
                                    {revealedPasswords[cred.id] ? (
                                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    )}
                                  </button>
                                  {revealedPasswords[cred.id] && (
                                    <button
                                      onClick={() => copyToClipboard(cred.password!)}
                                      className="p-1 hover:bg-slate-800/50 rounded"
                                      title="Copy"
                                    >
                                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm font-medium text-slate-400">********</span>
                              )}
                            </div>
                          </div>
                        )}
                        {cred.notes && (
                          <div className="col-span-2 md:col-span-3">
                            <p className="text-xs text-slate-400 uppercase">Notes</p>
                            <p className="text-sm text-slate-300">{cred.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit/Delete buttons for PRIMARY users */}
                  {isPrimaryUser && (
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => openCredentialForm(cred)}
                        className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(cred.id)}
                        className="p-2 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credential Form Modal */}
      <Modal
        isOpen={showCredentialModal}
        onClose={() => { setShowCredentialModal(false); setEditingCredential(null) }}
        title={editingCredential ? 'Edit Credential' : 'Add Credential'}
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            {credentialError && (
              <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg">
                <p className="text-sm text-red-400">{credentialError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Platform *</label>
                <input
                  type="text"
                  list="platform-suggestions"
                  value={credentialForm.platform}
                  onChange={(e) => setCredentialForm({ ...credentialForm, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Google Analytics"
                />
                <datalist id="platform-suggestions">
                  {PLATFORM_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
                <select
                  value={credentialForm.category}
                  onChange={(e) => setCredentialForm({ ...credentialForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ colorScheme: 'dark' }}
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-slate-800 text-white">{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Login URL</label>
              <input
                type="url"
                value={credentialForm.url}
                onChange={(e) => setCredentialForm({ ...credentialForm, url: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/login"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Username</label>
                <input
                  type="text"
                  value={credentialForm.username}
                  onChange={(e) => setCredentialForm({ ...credentialForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
                <input
                  type="email"
                  value={credentialForm.email}
                  onChange={(e) => setCredentialForm({ ...credentialForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentialForm.password}
                  onChange={(e) => setCredentialForm({ ...credentialForm, password: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
              <textarea
                value={credentialForm.notes}
                onChange={(e) => setCredentialForm({ ...credentialForm, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => { setShowCredentialModal(false); setEditingCredential(null) }}
            disabled={savingCredential}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCredential}
            disabled={savingCredential}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingCredential && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {editingCredential ? 'Save Changes' : 'Add Credential'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDeleteCredential(showDeleteConfirm)}
        title="Delete Credential"
        message="Are you sure you want to delete this credential? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deletingCredential}
      />
    </>
  )
}
