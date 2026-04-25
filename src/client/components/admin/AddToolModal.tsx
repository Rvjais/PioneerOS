'use client'

import { useState, useEffect } from 'react'

interface Tool {
  id?: string
  name: string
  category: string
  description?: string | null
  url: string
  loginType: string
  email?: string | null
  password?: string | null
  notes?: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editTool?: Tool | null
  categories: string[]
}

const LOGIN_TYPES = [
  { value: 'team', label: 'Team Use', description: 'Shared account for the whole team' },
  { value: 'subaccount', label: 'Sub Account', description: 'Create sub-accounts for clients' },
  { value: 'whitelabel', label: 'Whitelabel', description: 'Can be branded for clients' },
  { value: 'free', label: 'Free', description: 'Free tool, no credentials needed' },
]

export function AddToolModal({
  isOpen,
  onClose,
  onSuccess,
  editTool,
  categories,
}: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Tool>({
    name: '',
    category: '',
    description: '',
    url: '',
    loginType: 'team',
    email: '',
    password: '',
    notes: '',
  })

  useEffect(() => {
    if (editTool) {
      setFormData({
        ...editTool,
        description: editTool.description || '',
        email: editTool.email || '',
        password: editTool.password || '',
        notes: editTool.notes || '',
      })
    } else {
      setFormData({
        name: '',
        category: categories[0] || '',
        description: '',
        url: '',
        loginType: 'team',
        email: '',
        password: '',
        notes: '',
      })
    }
  }, [editTool, categories])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.url || !formData.category) {
      setError('Name, URL, and Category are required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const method = editTool?.id ? 'PATCH' : 'POST'
      const url = editTool?.id
        ? `/api/saas-tools/${editTool.id}`
        : '/api/saas-tools'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save tool')
        return
      }

      onSuccess()
      onClose()
    } catch {
      setError('Failed to save tool')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {editTool?.id ? 'Edit Tool' : 'Add New Tool'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Tool Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Canva"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__NEW__">+ Add New Category</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the tool"
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Login Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LOGIN_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.loginType === type.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-white/10 hover:bg-slate-900/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="loginType"
                      value={type.value}
                      checked={formData.loginType === type.value}
                      onChange={(e) =>
                        setFormData({ ...formData, loginType: e.target.value })
                      }
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="ml-2">
                      <p className="text-sm font-medium text-white">{type.label}</p>
                      <p className="text-xs text-slate-400">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="login@example.com"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or instructions..."
                rows={2}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : editTool?.id ? 'Update Tool' : 'Add Tool'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
