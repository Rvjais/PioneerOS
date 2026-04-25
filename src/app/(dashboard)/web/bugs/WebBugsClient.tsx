'use client'

import { useState } from 'react'

interface Bug {
  id: string
  title: string
  description: string
  status: string
  priority: string
  pageUrl?: string | null
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
    client: { id: string; name: string }
  }
  assignedTo?: { id: string; firstName: string; lastName: string } | null
  resolvedBy?: { id: string; firstName: string; lastName: string } | null
  resolvedAt?: string | null
  resolution?: string | null
}

interface Project {
  id: string
  name: string
  client: { id: string; name: string }
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  role: string
}

interface Stats {
  open: number
  critical: number
  total: number
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  OPEN: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  CONFIRMED: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  RESOLVED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  CLOSED: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
  WONT_FIX: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-500/20 text-green-400',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  CRITICAL: 'bg-red-500/20 text-red-400',
}

const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export function WebBugsClient({
  initialBugs,
  projects,
  teamMembers,
  stats,
  isManager,
  currentUserId,
}: {
  initialBugs: Bug[]
  projects: Project[]
  teamMembers: TeamMember[]
  stats: Stats
  isManager: boolean
  currentUserId: string
}) {
  const [bugs, setBugs] = useState<Bug[]>(initialBugs)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add form state
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    projectId: '',
    pageUrl: '',
    priority: 'MEDIUM',
    assignedToId: '',
  })

  const filteredBugs = bugs
    .filter(bug => {
      const matchesSearch =
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || bug.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || bug.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a.priority)
      const bIdx = priorityOrder.indexOf(b.priority)
      return aIdx - bIdx
    })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleCreateBug = async () => {
    if (!newBug.title.trim() || !newBug.projectId) {
      setError('Title and project are required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/web/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBug.title.trim(),
          description: newBug.description.trim(),
          projectId: newBug.projectId,
          pageUrl: newBug.pageUrl || undefined,
          priority: newBug.priority,
          assignedToId: newBug.assignedToId || undefined,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setBugs(prev => [created, ...prev])
        setShowAddModal(false)
        setNewBug({ title: '', description: '', projectId: '', pageUrl: '', priority: 'MEDIUM', assignedToId: '' })
      } else {
        const err = await res.json()
        setError(err.error || 'Failed to create bug report')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (bugId: string, status: string) => {
    try {
      const res = await fetch(`/api/web/bugs/${bugId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        const updated = await res.json()
        setBugs(prev => prev.map(b => b.id === bugId ? { ...b, ...updated } : b))
        if (selectedBug?.id === bugId) setSelectedBug({ ...selectedBug, ...updated })
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bug Tracker</h1>
          <p className="text-slate-500 mt-1">Track and manage website bugs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Report Bug
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.open}</p>
          <p className="text-sm text-slate-500">Open Bugs</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
          <p className="text-sm text-slate-500">Critical</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{stats.total}</p>
          <p className="text-sm text-slate-500">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="WONT_FIX">Won't Fix</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="ALL">All Priority</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Bugs List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredBugs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No bugs found</p>
            </div>
          ) : (
            filteredBugs.map(bug => {
              const colors = statusColors[bug.status] || statusColors.OPEN
              return (
                <div
                  key={bug.id}
                  onClick={() => setSelectedBug(bug)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[bug.priority] || priorityColors.MEDIUM}`}>
                          {bug.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {bug.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">{bug.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {bug.project.name} — {bug.project.client.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{formatDate(bug.createdAt)}</p>
                      {bug.assignedTo && (
                        <p className="text-xs text-slate-500 mt-1">
                          {bug.assignedTo.firstName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Bug Detail Slide-over */}
      {selectedBug && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedBug(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 shadow-xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Bug Details</h2>
              <button
                onClick={() => setSelectedBug(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[selectedBug.priority]}`}>
                    {selectedBug.priority}
                  </span>
                  <select
                    value={selectedBug.status}
                    onChange={e => handleUpdateStatus(selectedBug.id, e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="OPEN">Open</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="WONT_FIX">Won't Fix</option>
                  </select>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedBug.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Project</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedBug.project.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Client</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedBug.project.client.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Assigned To</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedBug.assignedTo ? `${selectedBug.assignedTo.firstName} ${selectedBug.assignedTo.lastName || ''}` : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Created</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedBug.createdAt)}</p>
                </div>
              </div>

              {selectedBug.pageUrl && (
                <div>
                  <p className="text-sm text-slate-500">Page URL</p>
                  <a
                    href={selectedBug.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {selectedBug.pageUrl}
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-slate-700 dark:text-slate-300">{selectedBug.description}</p>
              </div>

              {selectedBug.resolution && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Resolution</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedBug.resolution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Bug Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Report New Bug</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newBug.title}
                  onChange={e => setNewBug({ ...newBug, title: e.target.value })}
                  placeholder="Brief description of the bug"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project *</label>
                <select
                  value={newBug.projectId}
                  onChange={e => setNewBug({ ...newBug, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.client.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={newBug.priority}
                    onChange={e => setNewBug({ ...newBug, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
                  <select
                    value={newBug.assignedToId}
                    onChange={e => setNewBug({ ...newBug, assignedToId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Page URL</label>
                <input
                  type="text"
                  value={newBug.pageUrl}
                  onChange={e => setNewBug({ ...newBug, pageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea
                  value={newBug.description}
                  onChange={e => setNewBug({ ...newBug, description: e.target.value })}
                  placeholder="Steps to reproduce, expected behavior, actual behavior..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBug}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Bug Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
