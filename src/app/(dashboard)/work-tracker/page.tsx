'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface WorkEntry {
  id: string
  clientId: string | null
  client: { id: string; name: string } | null
  date: string
  category: string
  deliverableType: string
  quantity: number
  metrics: string | null
  resultSummary: string | null
  hoursSpent: number | null
  description: string | null
  status: string
  files: Array<{
    id: string
    fileName: string
    webViewLink: string
    thumbnailUrl: string | null
  }>
}

interface Client {
  id: string
  name: string
}

// Category and type configuration
const CATEGORIES = {
  SEO: ['BLOG_POST', 'BACKLINK', 'ON_PAGE_FIX', 'TECHNICAL_AUDIT', 'KEYWORD_RESEARCH', 'GBP_POST'],
  SOCIAL: ['STANDARD_POST', 'CAROUSEL', 'REEL', 'STORY', 'VIDEO', 'SCHEDULING'],
  ADS: ['CAMPAIGN_SETUP', 'OPTIMIZATION', 'REPORTING', 'CREATIVE', 'LANDING_PAGE'],
  WEB: ['STANDARD_PAGE', 'LANDING_PAGE', 'BUG_FIX', 'UPDATE', 'MAINTENANCE'],
  DESIGN: ['CREATIVE', 'BANNER', 'LOGO', 'BROCHURE', 'VIDEO_EDIT'],
  OPERATIONS: ['CLIENT_CALL', 'REPORT', 'ONBOARDING', 'MEETING'],
  ACCOUNTS: ['INVOICE', 'PAYMENT_FOLLOWUP', 'RECONCILIATION'],
}

const TYPE_LABELS: Record<string, string> = {
  BLOG_POST: 'Blog Post',
  BACKLINK: 'Backlink',
  ON_PAGE_FIX: 'On-Page Fix',
  TECHNICAL_AUDIT: 'Technical Audit',
  KEYWORD_RESEARCH: 'Keyword Research',
  GBP_POST: 'GBP Post',
  STANDARD_POST: 'Standard Post',
  CAROUSEL: 'Carousel',
  REEL: 'Reel',
  STORY: 'Story',
  VIDEO: 'Video',
  SCHEDULING: 'Scheduling',
  CAMPAIGN_SETUP: 'Campaign Setup',
  OPTIMIZATION: 'Optimization',
  REPORTING: 'Reporting',
  CREATIVE: 'Creative',
  LANDING_PAGE: 'Landing Page',
  STANDARD_PAGE: 'Standard Page',
  BUG_FIX: 'Bug Fix',
  UPDATE: 'Update',
  MAINTENANCE: 'Maintenance',
  BANNER: 'Banner',
  LOGO: 'Logo',
  BROCHURE: 'Brochure',
  VIDEO_EDIT: 'Video Edit',
  CLIENT_CALL: 'Client Call',
  REPORT: 'Report',
  ONBOARDING: 'Onboarding',
  MEETING: 'Meeting',
  INVOICE: 'Invoice',
  PAYMENT_FOLLOWUP: 'Payment Follow-up',
  RECONCILIATION: 'Reconciliation',
}

export default function WorkTrackerPage() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [driveConnected, setDriveConnected] = useState(false)
  const [view, setView] = useState<'daily' | 'monthly'>('daily')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    category: '',
    deliverableType: '',
    quantity: 1,
    hoursSpent: '',
    description: '',
    resultSummary: '',
  })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [uploading, setUploading] = useState(false)

  // Fetch data
  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (view === 'daily') {
        params.set('date', selectedDate)
      } else {
        const date = new Date(selectedDate)
        params.set('year', date.getFullYear().toString())
        params.set('month', (date.getMonth() + 1).toString())
        params.set('view', 'list')
      }

      const res = await fetch(`/api/work-entries?${params}`)
      const data = await res.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    }
  }, [selectedDate, view])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE&limit=100')
      const data = await res.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const checkDriveStatus = async () => {
    try {
      const res = await fetch('/api/google-drive/status')
      const data = await res.json()
      setDriveConnected(data.connected || false)
    } catch (error) {
      console.error('Failed to check Drive status:', error)
    }
  }

  useEffect(() => {
    Promise.all([fetchEntries(), fetchClients(), checkDriveStatus()])
      .finally(() => setLoading(false))
  }, [fetchEntries])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/work-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clientId: formData.clientId || null,
          hoursSpent: formData.hoursSpent ? parseFloat(formData.hoursSpent) : null,
          date: selectedDate,
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          clientId: '',
          category: '',
          deliverableType: '',
          quantity: 1,
          hoursSpent: '',
          description: '',
          resultSummary: '',
        })
        fetchEntries()
      }
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  // State for file URL input
  const [showFileUrlInput, setShowFileUrlInput] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState('')

  // Handle file URL submission
  const handleFileUrlSubmit = async (entryId: string) => {
    if (!fileUrl.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    setUploading(true)
    try {
      const res = await fetch(`/api/work-entries/${entryId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: fileUrl.trim(),
          category: 'PROOF',
          fileName: fileUrl.split('/').pop() || 'proof-file'
        }),
      })

      if (res.ok) {
        fetchEntries()
        setShowFileUrlInput(null)
        setFileUrl('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add file')
      }
    } catch (error) {
      console.error('Failed to add file:', error)
    } finally {
      setUploading(false)
    }
  }

  // Submit entry for approval
  const handleSubmitForApproval = async (entryId: string) => {
    try {
      await fetch(`/api/work-entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' }),
      })
      fetchEntries()
    } catch (error) {
      console.error('Failed to submit:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SEO: 'bg-blue-500/20 text-blue-400',
      SOCIAL: 'bg-pink-500/20 text-pink-400',
      ADS: 'bg-orange-500/20 text-orange-400',
      WEB: 'bg-purple-500/20 text-purple-400',
      DESIGN: 'bg-green-500/20 text-green-400',
      OPERATIONS: 'bg-slate-800/50 text-slate-200',
      ACCOUNTS: 'bg-emerald-500/20 text-emerald-400',
    }
    return colors[category] || 'bg-slate-800/50 text-slate-200'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-800/50 text-slate-300',
      SUBMITTED: 'bg-amber-500/20 text-amber-400',
      APPROVED: 'bg-green-500/20 text-green-400',
      REJECTED: 'bg-red-500/20 text-red-400',
    }
    return colors[status] || 'bg-slate-800/50 text-slate-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Work Tracker</h1>
            <p className="text-blue-200">Log your daily work - auto-syncs to meetings</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Google Drive Status */}
            <div className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
              driveConnected ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
            }`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              {driveConnected ? 'Drive Connected' : (
                <a href="/api/google-drive/connect" className="underline">Connect Drive</a>
              )}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 glass-card text-blue-400 rounded-lg font-medium hover:bg-blue-500/10"
            >
              + Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setView('daily')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'daily' ? 'glass-card shadow text-white' : 'text-slate-300'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'monthly' ? 'glass-card shadow text-white' : 'text-slate-300'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm text-white glass-card"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg">
            {entries.filter(e => e.status === 'APPROVED').length} Approved
          </div>
          <div className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
            {entries.filter(e => e.status === 'SUBMITTED').length} Pending
          </div>
          <div className="px-3 py-1.5 bg-slate-900/40 text-slate-200 rounded-lg">
            {entries.filter(e => e.status === 'DRAFT').length} Draft
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">
            {view === 'daily' ? 'Today\'s Work' : 'This Month\'s Work'}
          </h2>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p>No work entries yet. Click &quot;+ Add Entry&quot; to log your work.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                      <span className="text-sm text-slate-300">
                        {TYPE_LABELS[entry.deliverableType] || entry.deliverableType}
                      </span>
                      <span className="text-sm font-medium text-white">
                        × {entry.quantity}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>

                    {entry.client && (
                      <p className="text-sm text-slate-300 mb-1">
                        Client: <span className="font-medium">{entry.client.name}</span>
                      </p>
                    )}

                    {entry.description && (
                      <p className="text-sm text-slate-400">{entry.description}</p>
                    )}

                    {entry.resultSummary && (
                      <p className="text-sm text-green-400 mt-1">Result: {entry.resultSummary}</p>
                    )}

                    {/* Files */}
                    {entry.files.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {entry.files.map((file) => (
                          <a
                            key={file.id}
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-300 hover:bg-white/10"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {file.fileName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {entry.hoursSpent && (
                      <span className="text-sm text-slate-400">{entry.hoursSpent}h</span>
                    )}

                    {entry.status === 'DRAFT' && (
                      <>
                        {showFileUrlInput === entry.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="url"
                              value={fileUrl}
                              onChange={(e) => setFileUrl(e.target.value)}
                              placeholder="Paste file URL..."
                              className="px-2 py-1 text-xs border border-white/10 rounded w-40"
                            />
                            <button
                              onClick={() => handleFileUrlSubmit(entry.id)}
                              disabled={uploading}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {uploading ? '...' : 'Add'}
                            </button>
                            <button
                              onClick={() => { setShowFileUrlInput(null); setFileUrl(''); }}
                              className="px-2 py-1 text-xs bg-white/10 text-slate-300 rounded hover:bg-white/20"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowFileUrlInput(entry.id)}
                            className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"
                          >
                            + File URL
                          </button>
                        )}
                        <button
                          onClick={() => handleSubmitForApproval(entry.id)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Submit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">Add Work Entry</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Client</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white glass-card"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-slate-800 text-white">Internal / No Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="bg-slate-800 text-white">{client.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, deliverableType: '' })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white glass-card"
                  required
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-slate-800 text-white">Select Category</option>
                  {Object.keys(CATEGORIES).map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Deliverable Type */}
              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Type *</label>
                  <select
                    value={formData.deliverableType}
                    onChange={(e) => setFormData({ ...formData, deliverableType: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-white glass-card"
                    required
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-slate-800 text-white">Select Type</option>
                    {CATEGORIES[formData.category as keyof typeof CATEGORIES]?.map((type) => (
                      <option key={type} value={type} className="bg-slate-800 text-white">{TYPE_LABELS[type] || type}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity & Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-white glass-card"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.hoursSpent}
                    onChange={(e) => setFormData({ ...formData, hoursSpent: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-white glass-card"
                    placeholder="e.g., 2.5"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white glass-card"
                  rows={2}
                  placeholder="What did you work on?"
                />
              </div>

              {/* Result Summary */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Results (Optional)</label>
                <textarea
                  value={formData.resultSummary}
                  onChange={(e) => setFormData({ ...formData, resultSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white glass-card"
                  rows={2}
                  placeholder="Any measurable results? e.g., 500 new followers, 10 leads generated"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
