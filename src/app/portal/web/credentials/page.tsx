'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Credential {
  id: string
  platform: string
  category: string
  username: string | null
  url: string | null
  notes: string | null
  hasPassword: boolean
  createdAt: string
  updatedAt: string
}

interface CredentialsData {
  credentials: Credential[]
  grouped: Record<string, Credential[]>
  total: number
}

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  DOMAIN: {
    label: 'Domain Registrar',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
    color: 'text-blue-400 bg-blue-500/20',
  },
  HOSTING: {
    label: 'Hosting / Server',
    icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
    color: 'text-green-400 bg-green-500/20',
  },
  CMS: {
    label: 'CMS / Admin Panel',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    color: 'text-purple-400 bg-purple-500/20',
  },
  OTHER: {
    label: 'Other',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: 'text-slate-300 bg-slate-800/50',
  },
}

const defaultFormData = {
  platform: '',
  category: 'OTHER',
  username: '',
  password: '',
  url: '',
  notes: '',
}

export default function CredentialsPage() {
  const [data, setData] = useState<CredentialsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/web-portal/credentials')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch credentials:', error)
      setError('Failed to load credentials')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setEditingId(null)
    setShowForm(false)
    setFormError(null)
    setShowPassword(false)
  }

  const startEdit = (cred: Credential) => {
    setEditingId(cred.id)
    setFormData({
      platform: cred.platform,
      category: cred.category,
      username: cred.username || '',
      password: '',
      url: cred.url || '',
      notes: cred.notes || '',
    })
    setShowForm(true)
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.platform.trim()) return

    setSubmitting(true)
    setFormError(null)
    try {
      const payload = {
        platform: formData.platform.trim(),
        category: formData.category,
        username: formData.username.trim() || null,
        password: formData.password || null,
        url: formData.url.trim() || null,
        notes: formData.notes.trim() || null,
      }

      const res = await fetch('/api/web-portal/credentials', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      })

      if (res.ok) {
        resetForm()
        fetchCredentials()
      } else {
        const data = await res.json()
        setFormError(data.error || 'Failed to save credential')
      }
    } catch (error) {
      console.error('Failed to save credential:', error)
      setFormError('Failed to save credential. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this credential? This cannot be undone.')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/web-portal/credentials?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCredentials()
      }
    } catch (error) {
      console.error('Failed to delete credential:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800/50 rounded-lg animate-pulse" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="glass-card rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="h-5 w-32 bg-slate-800/50 rounded animate-pulse" />
            </div>
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="p-4 border-b border-white/10 last:border-0">
                <div className="h-4 w-36 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-3 w-48 bg-slate-800/50 rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchCredentials(); }} className="mt-4 text-red-400 underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/portal/web" className="text-slate-400 hover:text-teal-600">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-white font-medium">Credentials</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Credentials</h1>
          <p className="text-slate-400 mt-1">Securely share access credentials with our team</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Credential
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-500/10 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900">Encrypted Storage</h3>
            <p className="text-sm text-blue-400 mt-1">
              All passwords are encrypted at rest using AES-256 encryption and only accessible to authorized team members.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      {data && data.total > 0 && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credentials by platform, username, or URL..."
            className="w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-lg bg-slate-900/40 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Credential' : 'Add New Credential'}
          </h2>
          {formError && (
            <div className="bg-red-500/10 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-400">{formError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Platform / Service *
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="e.g., GoDaddy, cPanel, WordPress"
                  className="w-full px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Username / Email
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username or email"
                  className="w-full px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Password {editingId && <span className="text-slate-500">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingId ? 'Enter new password to update' : 'Password'}
                    className="w-full px-4 py-2 pr-10 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Login URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information..."
                rows={3}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.platform.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Credential' : 'Save Credential'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials by Category */}
      {data && Object.entries(categoryConfig).map(([category, config]) => {
        const credentials = (data.grouped[category] || []).filter(cred =>
          searchQuery === '' ||
          cred.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (cred.username?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          (cred.url?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
        )
        if (credentials.length === 0) return null

        return (
          <div key={category} className="glass-card rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                </svg>
              </div>
              <h2 className="font-semibold text-white">{config.label}</h2>
              <span className="text-sm text-slate-400">({credentials.length})</span>
            </div>
            <div className="divide-y divide-white/10">
              {credentials.map((cred) => (
                <div key={cred.id} className="p-4 hover:bg-slate-900/40">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">{cred.platform}</h3>
                      {cred.username && (
                        <p className="text-sm text-slate-400 mt-1">
                          <span className="text-slate-400">Username:</span> {cred.username}
                        </p>
                      )}
                      {cred.url && (
                        <a
                          href={cred.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 hover:underline mt-1 inline-block"
                        >
                          {cred.url}
                        </a>
                      )}
                      {cred.notes && (
                        <p className="text-sm text-slate-400 mt-2">{cred.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {cred.hasPassword && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Password saved
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(cred)}
                        className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800/50 rounded transition-colors"
                        title="Edit credential"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cred.id)}
                        disabled={deletingId === cred.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                        title="Delete credential"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Empty State */}
      {data?.total === 0 && !showForm && (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-teal-500/10 rounded-full flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No credentials added yet</h3>
          <p className="text-slate-400 mb-2 max-w-md mx-auto">
            Securely share your domain registrar, hosting, and CMS login details so our team can manage your website.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            All credentials are encrypted and only accessible to authorized team members.
          </p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Credential
          </button>
        </div>
      )}
    </div>
  )
}
