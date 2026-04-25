'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { toast } from 'sonner'

interface Campaign {
  id: string
  name: string
  description: string | null
  templateId: string
  targetType: string
  recipientCount: number
  status: string
  scheduledAt: string | null
  startedAt: string | null
  completedAt: string | null
  sentCount: number
  deliveredCount: number
  failedCount: number
  createdAt: string
}

interface Template {
  id: string
  name: string
  category: string
  content: string
  variables: string[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-slate-800/50', text: 'text-slate-200' },
  SCHEDULED: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  RUNNING: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400' },
  PAUSED: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [campaignsRes, templatesRes] = await Promise.all([
        fetch('/api/whatsapp/campaigns'),
        fetch('/api/whatsapp/templates?active=true'),
      ])

      const campaignsData = await campaignsRes.json()
      const templatesData = await templatesRes.json()

      setCampaigns(campaignsData.campaigns || [])
      setTemplates(templatesData.templates || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  // Stats
  const stats = {
    total: campaigns.length,
    running: campaigns.filter((c) => c.status === 'RUNNING').length,
    completed: campaigns.filter((c) => c.status === 'COMPLETED').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="mt-4 text-slate-400">Loading campaigns...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">WhatsApp Campaigns</h1>
          <p className="text-sm text-slate-400 mt-1">
            Send bulk messages to clients, leads, and employees
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400">Total Campaigns</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400">Running</div>
          <div className="text-2xl font-bold text-amber-400">{stats.running}</div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400">Completed</div>
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400">Messages Sent</div>
          <div className="text-2xl font-bold text-blue-400">{stats.totalSent}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="RUNNING">Running</option>
          <option value="COMPLETED">Completed</option>
          <option value="PAUSED">Paused</option>
        </select>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No campaigns found</h3>
          <p className="text-slate-400 mb-4">Create your first bulk messaging campaign</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Campaign
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Recipients
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCampaigns.map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  onRefresh={fetchData}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showForm && (
        <CreateCampaignModal
          templates={templates}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

function CampaignRow({
  campaign,
  onRefresh,
}: {
  campaign: Campaign
  onRefresh: () => void
}) {
  const [starting, setStarting] = useState(false)

  async function handleStart() {
    if (!confirm(`Start sending ${campaign.recipientCount} messages? This cannot be undone.`)) {
      return
    }

    setStarting(true)
    try {
      const response = await fetch(`/api/whatsapp/campaigns/${campaign.id}/start`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to start campaign')
      } else {
        toast.success(`Campaign completed! Sent: ${data.sentCount}, Failed: ${data.failedCount}`)
        onRefresh()
      }
    } catch {
      toast.error('Failed to start campaign')
    } finally {
      setStarting(false)
    }
  }

  const statusStyle = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT
  const progress = campaign.recipientCount > 0
    ? Math.round(((campaign.sentCount + campaign.failedCount) / campaign.recipientCount) * 100)
    : 0

  return (
    <tr className="hover:bg-slate-900/40">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-white">{campaign.name}</div>
          {campaign.description && (
            <div className="text-sm text-slate-400 truncate max-w-xs">
              {campaign.description}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          {campaign.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-300">
        {campaign.recipientCount}
      </td>
      <td className="px-4 py-3">
        {campaign.status === 'COMPLETED' || campaign.status === 'RUNNING' ? (
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">{campaign.sentCount} sent</span>
              {campaign.failedCount > 0 && (
                <span className="text-red-400">{campaign.failedCount} failed</span>
              )}
            </div>
            <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-400">
        {formatDateDDMMYYYY(campaign.createdAt)}
      </td>
      <td className="px-4 py-3 text-right">
        {campaign.status === 'DRAFT' && (
          <button
            onClick={handleStart}
            disabled={starting || campaign.recipientCount === 0}
            className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {starting ? 'Sending...' : 'Start'}
          </button>
        )}
        {campaign.status === 'SCHEDULED' && (
          <button
            onClick={handleStart}
            disabled={starting}
            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {starting ? 'Sending...' : 'Send Now'}
          </button>
        )}
      </td>
    </tr>
  )
}

function CreateCampaignModal({
  templates,
  onClose,
  onSuccess,
}: {
  templates: Template[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    recipientInput: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse recipients from textarea
  const recipients = formData.recipientInput
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.split(',').map((p) => p.trim())
      return { phone: parts[0], name: parts[1] || undefined }
    })
    .filter((r) => r.phone)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (recipients.length === 0) {
      setError('Please add at least one recipient')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/whatsapp/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          templateId: formData.templateId,
          recipients,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setSaving(false)
    }
  }

  const selectedTemplate = templates.find((t) => t.id === formData.templateId)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Create Campaign</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., March Payment Reminders"
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the campaign"
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Message Template
            </label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select a template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <div className="mt-2 p-3 bg-slate-900/40 rounded-lg text-sm text-slate-300">
                <p className="whitespace-pre-wrap">{selectedTemplate.content}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Recipients
            </label>
            <textarea
              value={formData.recipientInput}
              onChange={(e) => setFormData({ ...formData, recipientInput: e.target.value })}
              rows={6}
              placeholder="Enter one recipient per line:&#10;919876543210, John Doe&#10;919876543211, Jane Smith&#10;919876543212"
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              Format: phone number, name (optional). One per line.
            </p>
            {recipients.length > 0 && (
              <p className="mt-1 text-sm text-green-400">
                {recipients.length} recipient(s) ready
              </p>
            )}
          </div>

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
              {saving ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
