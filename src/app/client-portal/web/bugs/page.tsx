'use client'

import React, { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BugReport {
  id: string
  title: string
  description: string
  pageUrl: string | null
  screenshotUrl: string | null
  browserInfo: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'CONFIRMED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'WONT_FIX'
  resolution: string | null
  createdAt: string
  resolvedAt: string | null
  project: {
    name: string
  }
}

export default function WebClientBugsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [showNewBugForm, setShowNewBugForm] = useState(false)
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')

  // New bug form state
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    pageUrl: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    screenshotUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [browserInfo, setBrowserInfo] = useState('')

  useEffect(() => {
    fetchBugs()
    // Auto-detect browser info
    if (typeof window !== 'undefined') {
      setBrowserInfo(`${navigator.userAgent}`)
    }
  }, [])

  const fetchBugs = async () => {
    try {
      const response = await fetch('/api/client-portal/web/bugs')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/client-login')
          return
        }
        throw new Error('Failed to fetch bugs')
      }
      const data = await response.json()
      setBugs(data.bugs || [])
    } catch (error) {
      console.error('Error fetching bugs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitBug = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBug.title.trim() || !newBug.description.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/client-portal/web/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBug,
          browserInfo,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit bug')

      await fetchBugs()
      setShowNewBugForm(false)
      setNewBug({
        title: '',
        description: '',
        pageUrl: '',
        priority: 'MEDIUM',
        screenshotUrl: '',
      })
    } catch (error) {
      console.error('Error submitting bug:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredBugs = bugs.filter((bug) => {
    if (filter === 'open') return !['RESOLVED', 'CLOSED', 'WONT_FIX'].includes(bug.status)
    if (filter === 'resolved') return ['RESOLVED', 'CLOSED'].includes(bug.status)
    return true
  })

  const statusColors: Record<string, { bg: string; text: string }> = {
    OPEN: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    CONFIRMED: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    IN_PROGRESS: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    RESOLVED: { bg: 'bg-green-500/20', text: 'text-green-400' },
    CLOSED: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
    WONT_FIX: { bg: 'bg-red-500/20', text: 'text-red-400' },
  }

  const priorityColors: Record<string, { bg: string; text: string }> = {
    CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400' },
    HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    MEDIUM: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    LOW: { bg: 'bg-green-500/20', text: 'text-green-400' },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/client-portal/web" className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-semibold text-white">Bug Reports</h1>
            </div>
            <button
              onClick={() => setShowNewBugForm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              + Report Bug
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'open', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'open' ? 'Open' : 'Resolved'}
              {f === 'open' && (
                <span className="ml-2">
                  ({bugs.filter((b) => !['RESOLVED', 'CLOSED', 'WONT_FIX'].includes(b.status)).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bug List */}
        {filteredBugs.length === 0 ? (
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center">
            <svg
              className="w-12 h-12 text-slate-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-slate-400">
              {filter === 'all'
                ? "No bug reports yet. Click 'Report Bug' to submit one."
                : filter === 'open'
                  ? 'No open bugs!'
                  : 'No resolved bugs yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBugs.map((bug) => (
              <div
                key={bug.id}
                className="bg-slate-800/50 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-indigo-500/50"
                onClick={() => setSelectedBug(bug)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{bug.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{bug.description}</p>
                    {bug.pageUrl && (
                      <p className="text-xs text-slate-500 mt-2">Page: {bug.pageUrl}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${statusColors[bug.status]?.bg} ${statusColors[bug.status]?.text}`}
                    >
                      {bug.status.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${priorityColors[bug.priority]?.bg} ${priorityColors[bug.priority]?.text}`}
                    >
                      {bug.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                  <span>Reported {formatDateDDMMYYYY(bug.createdAt)}</span>
                  {bug.resolvedAt && (
                    <span>Resolved {formatDateDDMMYYYY(bug.resolvedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Bug Form Modal */}
      {showNewBugForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Report a Bug</h2>
                <button
                  onClick={() => setShowNewBugForm(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitBug} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Bug Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  placeholder="Describe the issue in detail. Include steps to reproduce if possible."
                  rows={5}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Page URL */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Page URL (where the bug occurs)
                </label>
                <input
                  type="url"
                  value={newBug.pageUrl}
                  onChange={(e) => setNewBug({ ...newBug, pageUrl: e.target.value })}
                  placeholder="https://yourwebsite.com/page"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Screenshot URL */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Screenshot URL (optional)
                </label>
                <input
                  type="url"
                  value={newBug.screenshotUrl}
                  onChange={(e) => setNewBug({ ...newBug, screenshotUrl: e.target.value })}
                  placeholder="Link to screenshot (use Dropbox, Google Drive, etc.)"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tip: Take a screenshot and upload to a cloud service, then paste the link here.
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewBug({ ...newBug, priority: p })}
                      className={`py-2 text-sm rounded-lg border transition-colors ${
                        newBug.priority === p
                          ? `${priorityColors[p].bg} ${priorityColors[p].text} border-current`
                          : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  <p>
                    <strong>Low:</strong> Minor visual issues, typos
                  </p>
                  <p>
                    <strong>Medium:</strong> Feature not working as expected
                  </p>
                  <p>
                    <strong>High:</strong> Major functionality broken
                  </p>
                  <p>
                    <strong>Critical:</strong> Site down or security issue
                  </p>
                </div>
              </div>

              {/* Browser Info */}
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400">Browser information (auto-detected):</p>
                <p className="text-xs text-slate-500 mt-1 truncate">{browserInfo}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewBugForm(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newBug.title.trim() || !newBug.description.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Bug Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bug Detail Modal */}
      {selectedBug && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${statusColors[selectedBug.status]?.bg} ${statusColors[selectedBug.status]?.text}`}
                  >
                    {selectedBug.status.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${priorityColors[selectedBug.priority]?.bg} ${priorityColors[selectedBug.priority]?.text}`}
                  >
                    {selectedBug.priority}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBug(null)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white mt-4">{selectedBug.title}</h2>
              <p className="text-sm text-slate-400">{selectedBug.project.name}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                <p className="text-white whitespace-pre-wrap">{selectedBug.description}</p>
              </div>

              {/* Page URL */}
              {selectedBug.pageUrl && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Page URL</h3>
                  <a
                    href={selectedBug.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {selectedBug.pageUrl}
                  </a>
                </div>
              )}

              {/* Screenshot */}
              {selectedBug.screenshotUrl && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Screenshot</h3>
                  <a
                    href={selectedBug.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    View Screenshot
                  </a>
                </div>
              )}

              {/* Resolution */}
              {selectedBug.resolution && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h3 className="text-sm font-medium text-green-400 mb-2">Resolution</h3>
                  <p className="text-white">{selectedBug.resolution}</p>
                </div>
              )}

              {/* Browser Info */}
              {selectedBug.browserInfo && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Browser Info</h3>
                  <p className="text-xs text-slate-500">{selectedBug.browserInfo}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-400">Reported</span>
                    <span className="text-white">{new Date(selectedBug.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedBug.resolvedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-slate-400">Resolved</span>
                      <span className="text-white">{new Date(selectedBug.resolvedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
