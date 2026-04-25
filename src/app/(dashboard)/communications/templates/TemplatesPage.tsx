'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  category: string
  department: string | null
  content: string
  variables: string[]
  language: string
  hasMedia: boolean
  mediaType: string | null
  mediaUrl: string | null
  usageCount: number
  lastUsedAt: string | null
  isActive: boolean
  isApproved: boolean
  createdAt: string
}

const CATEGORIES = [
  { value: 'ONBOARDING', label: 'Onboarding', color: 'blue' },
  { value: 'PAYMENT', label: 'Payment', color: 'green' },
  { value: 'REMINDER', label: 'Reminder', color: 'amber' },
  { value: 'MARKETING', label: 'Marketing', color: 'purple' },
  { value: 'SUPPORT', label: 'Support', color: 'pink' },
  { value: 'NOTIFICATION', label: 'Notification', color: 'cyan' },
  { value: 'CUSTOM', label: 'Custom', color: 'slate' },
]

const DEPARTMENTS = [
  { value: 'ALL', label: 'All Departments' },
  { value: 'SALES', label: 'Sales' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'HR', label: 'HR' },
  { value: 'ACCOUNTS', label: 'Accounts' },
]

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showPreview, setShowPreview] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      setLoading(true)
      const response = await fetch('/api/whatsapp/templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleAdd() {
    setEditingTemplate(null)
    setShowForm(true)
  }

  function handleEdit(template: Template) {
    setEditingTemplate(template)
    setShowForm(true)
  }

  function handleFormSuccess() {
    setShowForm(false)
    setEditingTemplate(null)
    fetchTemplates()
  }

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!t.name.toLowerCase().includes(query) && !t.content.toLowerCase().includes(query)) {
        return false
      }
    }
    if (categoryFilter !== 'all' && t.category !== categoryFilter) {
      return false
    }
    return true
  })

  // Group by category
  const groupedTemplates = filteredTemplates.reduce(
    (acc, template) => {
      const category = template.category
      if (!acc[category]) acc[category] = []
      acc[category].push(template)
      return acc
    },
    {} as Record<string, Template[]>
  )

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-400">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">WhatsApp Templates</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage message templates for consistent communication
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400">Total Templates</div>
          <div className="text-2xl font-bold text-white">{templates.length}</div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400">Active</div>
          <div className="text-2xl font-bold text-green-400">
            {templates.filter((t) => t.isActive).length}
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400">Total Usage</div>
          <div className="text-2xl font-bold text-blue-400">
            {templates.reduce((sum, t) => sum + t.usageCount, 0)}
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400">Categories</div>
          <div className="text-2xl font-bold text-white">
            {new Set(templates.map((t) => t.category)).size}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
          <p className="text-slate-400 mb-4">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first WhatsApp template to get started'}
          </p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
            const categoryInfo = CATEGORIES.find((c) => c.value === category)
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full bg-${categoryInfo?.color || 'slate'}-500`}
                  ></span>
                  {categoryInfo?.label || category}
                  <span className="text-slate-400 font-normal">({categoryTemplates.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleEdit(template)}
                      onPreview={() => setShowPreview(template)}
                      onRefresh={fetchTemplates}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <TemplateForm
          template={editingTemplate}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <TemplatePreview
          template={showPreview}
          onClose={() => setShowPreview(null)}
        />
      )}
    </div>
  )
}

// Template Card Component
function TemplateCard({
  template,
  onEdit,
  onPreview,
  onRefresh,
}: {
  template: Template
  onEdit: () => void
  onPreview: () => void
  onRefresh: () => void
}) {
  const [toggling, setToggling] = useState(false)

  async function toggleActive() {
    setToggling(true)
    try {
      await fetch(`/api/whatsapp/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !template.isActive }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to toggle template:', error)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-white">{template.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                template.isActive
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-slate-800/50 text-slate-300'
              }`}
            >
              {template.isActive ? 'Active' : 'Inactive'}
            </span>
            {template.hasMedia && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                {template.mediaType}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={toggleActive}
          disabled={toggling}
          className={`p-1 rounded-lg transition-colors ${
            template.isActive
              ? 'text-green-400 hover:bg-green-500/10'
              : 'text-slate-400 hover:bg-slate-800/50'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <p className="text-sm text-slate-300 line-clamp-3 mb-3">{template.content}</p>

      {template.variables.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.variables.slice(0, 3).map((v) => (
            <span key={v} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
              {`{{${v}}}`}
            </span>
          ))}
          {template.variables.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded text-xs">
              +{template.variables.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span>{template.usageCount} uses</span>
        {template.lastUsedAt && (
          <span>Last: {formatDateDDMMYYYY(template.lastUsedAt)}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 px-3 py-1.5 text-sm text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10"
        >
          Preview
        </button>
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-1.5 text-sm text-green-400 bg-green-500/10 rounded-lg hover:bg-green-500/20"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

// Template Form Component
function TemplateForm({
  template,
  onClose,
  onSuccess,
}: {
  template: Template | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    category: template?.category || 'CUSTOM',
    department: template?.department || 'ALL',
    content: template?.content || '',
    language: template?.language || 'en',
    hasMedia: template?.hasMedia || false,
    mediaType: template?.mediaType || 'IMAGE',
    mediaUrl: template?.mediaUrl || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract variables from content
  const extractedVariables = formData.content.match(/\{\{(\w+)\}\}/g)?.map((m) =>
    m.replace(/\{\{|\}\}/g, '')
  ) || []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = template
        ? `/api/whatsapp/templates/${template.id}`
        : '/api/whatsapp/templates'

      const response = await fetch(url, {
        method: template ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save template')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {template ? 'Edit Template' : 'New Template'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Message Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              placeholder="Hi {{clientName}}, your payment of {{amount}} is due on {{dueDate}}."
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              Use {"{{variableName}}"} for dynamic content
            </p>
          </div>

          {extractedVariables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Detected Variables
              </label>
              <div className="flex flex-wrap gap-2">
                {extractedVariables.map((v) => (
                  <span key={v} className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasMedia"
              checked={formData.hasMedia}
              onChange={(e) => setFormData({ ...formData, hasMedia: e.target.checked })}
              className="rounded border-white/20"
            />
            <label htmlFor="hasMedia" className="text-sm text-slate-200">
              Include media attachment
            </label>
          </div>

          {formData.hasMedia && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/40 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Media Type</label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg"
                >
                  <option value="IMAGE">Image</option>
                  <option value="FILE">File</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Media URL</label>
                <input
                  type="url"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-white/20 rounded-lg"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Template Preview Component
function TemplatePreview({
  template,
  onClose,
}: {
  template: Template
  onClose: () => void
}) {
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Initialize variables with sample values
  useEffect(() => {
    const initial: Record<string, string> = {}
    template.variables.forEach((v) => {
      initial[v] = `[${v}]`
    })
    setVariables(initial)
  }, [template])

  // Generate preview content
  let previewContent = template.content
  for (const [key, value] of Object.entries(variables)) {
    previewContent = previewContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  async function handleSend() {
    if (!phone) {
      toast.error('Please enter a phone number')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch(`/api/whatsapp/templates/${template.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: phone,
          variables,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({ success: false, message: data.error })
      } else {
        setResult({ success: true, message: 'Message sent successfully!' })
        setPhone('')
      }
    } catch {
      setResult({ success: false, message: 'Failed to send message' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Preview & Send</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Variables */}
          {template.variables.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">Variables</label>
              {template.variables.map((v) => (
                <div key={v}>
                  <label className="block text-xs text-slate-400 mb-1">{v}</label>
                  <input
                    type="text"
                    value={variables[v] || ''}
                    onChange={(e) => setVariables({ ...variables, [v]: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Message Preview</label>
            <div className="bg-green-500/10 rounded-lg p-4">
              <div className="glass-card rounded-lg p-3 shadow-none">
                <p className="text-sm whitespace-pre-wrap">{previewContent}</p>
                {template.hasMedia && template.mediaUrl && (
                  <div className="mt-2 p-2 bg-slate-800/50 rounded flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-xs text-slate-300">{template.mediaType} attached</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Send Test */}
          <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-medium text-slate-200 mb-2">Send Test Message</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (e.g., 919876543210)"
                className="flex-1 px-3 py-2 border border-white/20 rounded-lg text-sm"
              />
              <button
                onClick={handleSend}
                disabled={sending || !phone}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg ${
                result.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}
            >
              <p className="text-sm">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
