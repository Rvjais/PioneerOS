'use client'

import React, { useState, useEffect } from 'react'

interface Credential {
  id: string
  type: string
  label: string
  category: string
  url: string | null
  username: string | null
  email: string | null
  hasPassword: boolean
  notes: string | null
  password?: string
}

interface CredentialModalProps {
  isOpen: boolean
  onClose: () => void
  credential?: Credential | null // If provided, edit mode; otherwise, add mode
  onSave: () => void
}

const platformOptions = [
  { value: 'Google Analytics', category: 'ANALYTICS' },
  { value: 'Google Search Console', category: 'ANALYTICS' },
  { value: 'Google Ads', category: 'ADS' },
  { value: 'Meta Ads Manager', category: 'ADS' },
  { value: 'LinkedIn Ads', category: 'ADS' },
  { value: 'Facebook', category: 'SOCIAL' },
  { value: 'Instagram', category: 'SOCIAL' },
  { value: 'LinkedIn', category: 'SOCIAL' },
  { value: 'Twitter/X', category: 'SOCIAL' },
  { value: 'YouTube', category: 'SOCIAL' },
  { value: 'TikTok', category: 'SOCIAL' },
  { value: 'WordPress Admin', category: 'PLATFORM' },
  { value: 'Shopify Admin', category: 'PLATFORM' },
  { value: 'Web Hosting', category: 'HOSTING' },
  { value: 'Domain Registrar', category: 'HOSTING' },
  { value: 'Email Marketing', category: 'PLATFORM' },
  { value: 'CRM', category: 'PLATFORM' },
  { value: 'Google Business Profile', category: 'PLATFORM' },
  { value: 'SEMrush', category: 'ANALYTICS' },
  { value: 'Ahrefs', category: 'ANALYTICS' },
  { value: 'Other', category: 'OTHER' },
]

const categoryOptions = [
  { value: 'PLATFORM', label: 'Platform' },
  { value: 'SOCIAL', label: 'Social Media' },
  { value: 'HOSTING', label: 'Hosting' },
  { value: 'ANALYTICS', label: 'Analytics' },
  { value: 'ADS', label: 'Advertising' },
  { value: 'OTHER', label: 'Other' },
]

export default function CredentialModal({ isOpen, onClose, credential, onSave }: CredentialModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [form, setForm] = useState({
    platform: '',
    category: 'PLATFORM',
    username: '',
    email: '',
    password: '',
    url: '',
    notes: '',
  })

  const isEditMode = !!credential

  useEffect(() => {
    if (isOpen) {
      if (credential) {
        // Edit mode - populate form
        setForm({
          platform: credential.label || '',
          category: credential.category || 'PLATFORM',
          username: credential.username || '',
          email: credential.email || '',
          password: '', // Password not loaded initially
          url: credential.url || '',
          notes: credential.notes || '',
        })
        setShowPassword(false)
      } else {
        // Add mode - reset form
        setForm({
          platform: '',
          category: 'PLATFORM',
          username: '',
          email: '',
          password: '',
          url: '',
          notes: '',
        })
      }
      setError('')
    }
  }, [isOpen, credential])

  const handleLoadPassword = async () => {
    if (!credential) return
    setLoadingPassword(true)
    try {
      const res = await fetch('/api/client-portal/credentials?reveal=true', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const found = data.credentials.find((c: Credential) => c.id === credential.id)
        if (found?.password) {
          setForm(prev => ({ ...prev, password: found.password }))
        }
      }
    } catch (err) {
      console.error('Failed to load password:', err)
    } finally {
      setLoadingPassword(false)
    }
  }

  const handlePlatformChange = (platform: string) => {
    const option = platformOptions.find(p => p.value === platform)
    setForm(prev => ({
      ...prev,
      platform,
      category: option?.category || prev.category,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = '/api/client-portal/credentials'
      const method = isEditMode ? 'PUT' : 'POST'
      const body = isEditMode
        ? {
            id: credential?.id,
            platform: form.platform,
            category: form.category,
            username: form.username || null,
            email: form.email || null,
            password: form.password || null,
            url: form.url || null,
            notes: form.notes || null,
          }
        : {
            platform: form.platform,
            category: form.category,
            username: form.username || null,
            email: form.email || null,
            password: form.password || null,
            url: form.url || null,
            notes: form.notes || null,
          }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        onSave()
        onClose()
      } else {
        setError(data.error || 'Failed to save credential')
      }
    } catch (err) {
      console.error('Failed to save credential:', err)
      setError('Failed to save credential')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isEditMode ? 'Edit Credential' : 'Add Credential'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Platform */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Platform *</label>
              <select
                value={form.platform}
                onChange={(e) => handlePlatformChange(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select platform...</option>
                {platformOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.value}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Login URL</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com/login"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Username or login ID"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="account@example.com"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={isEditMode && credential?.hasPassword ? '(unchanged)' : 'Enter password'}
                  className="w-full px-4 py-2.5 pr-20 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {isEditMode && credential?.hasPassword && !form.password && (
                    <button
                      type="button"
                      onClick={handleLoadPassword}
                      disabled={loadingPassword}
                      className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-900/40 text-slate-300 rounded transition-colors"
                    >
                      {loadingPassword ? '...' : 'Load'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isEditMode ? 'Leave empty to keep current password' : 'Optional - stored encrypted'}
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes or instructions"
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.platform}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditMode ? 'Update' : 'Add Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
