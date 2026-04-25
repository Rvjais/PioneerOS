'use client'

import { useState } from 'react'

interface Request {
  id: string
  title: string
  description: string
  type: string
  status: string
  pageUrl?: string | null
  estimatedHours?: number | null
  estimatedCost?: number | null
  actualHours?: number | null
  isBillable: boolean
  createdAt: string
  project: {
    id: string
    name: string
    client: { id: string; name: string }
  }
  assignedTo?: { id: string; firstName: string; lastName: string } | null
  completedBy?: { id: string; firstName: string; lastName: string } | null
  completedAt?: string | null
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
  pending: number
  approved: number
  total: number
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  ESTIMATED: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  CLIENT_APPROVED: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  IN_PROGRESS: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
}

const typeColors: Record<string, string> = {
  MINOR: 'bg-slate-500/20 text-slate-400',
  MAJOR: 'bg-purple-500/20 text-purple-400',
  FEATURE: 'bg-pink-500/20 text-pink-400',
  ENHANCEMENT: 'bg-cyan-500/20 text-cyan-400',
}

const typePriority = ['FEATURE', 'MAJOR', 'ENHANCEMENT', 'MINOR']

export function WebRequestsClient({
  initialRequests,
  projects,
  teamMembers,
  stats,
  isManager,
  currentUserId,
}: {
  initialRequests: Request[]
  projects: Project[]
  teamMembers: TeamMember[]
  stats: Stats
  isManager: boolean
  currentUserId: string
}) {
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    projectId: '',
    type: 'MINOR',
    pageUrl: '',
    estimatedHours: '',
    estimatedCost: '',
    requiresApproval: false,
    isBillable: false,
    assignedToId: '',
  })

  const filteredRequests = requests
    .filter(req => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
      const matchesType = typeFilter === 'ALL' || req.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      const aIdx = typePriority.indexOf(a.type)
      const bIdx = typePriority.indexOf(b.type)
      return aIdx - bIdx
    })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  const handleCreateRequest = async () => {
    if (!newRequest.title.trim() || !newRequest.projectId) {
      setError('Title and project are required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/web/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newRequest.title.trim(),
          description: newRequest.description.trim(),
          projectId: newRequest.projectId,
          type: newRequest.type,
          pageUrl: newRequest.pageUrl || undefined,
          estimatedHours: newRequest.estimatedHours ? parseFloat(newRequest.estimatedHours) : undefined,
          estimatedCost: newRequest.estimatedCost ? parseFloat(newRequest.estimatedCost) : undefined,
          requiresApproval: newRequest.requiresApproval,
          isBillable: newRequest.isBillable,
          assignedToId: newRequest.assignedToId || undefined,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setRequests(prev => [created, ...prev])
        setShowAddModal(false)
        setNewRequest({
          title: '', description: '', projectId: '', type: 'MINOR', pageUrl: '',
          estimatedHours: '', estimatedCost: '', requiresApproval: false, isBillable: false, assignedToId: '',
        })
      } else {
        const err = await res.json()
        setError(err.error || 'Failed to create change request')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`/api/web/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        const updated = await res.json()
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updated } : r))
        if (selectedRequest?.id === requestId) setSelectedRequest({ ...selectedRequest, ...updated })
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Change Requests</h1>
          <p className="text-slate-500 mt-1">Track client change requests and feature requests</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-slate-500">Pending</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
          <p className="text-sm text-slate-500">Client Approved</p>
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
            placeholder="Search requests..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ESTIMATED">Estimated</option>
          <option value="CLIENT_APPROVED">Client Approved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="ALL">All Types</option>
          <option value="FEATURE">Feature</option>
          <option value="MAJOR">Major</option>
          <option value="ENHANCEMENT">Enhancement</option>
          <option value="MINOR">Minor</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No change requests found</p>
            </div>
          ) : (
            filteredRequests.map(req => {
              const colors = statusColors[req.status] || statusColors.PENDING
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColors[req.type] || typeColors.MINOR}`}>
                          {req.type}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                        {req.isBillable && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
                            Billable
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">{req.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {req.project.name} — {req.project.client.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{formatDate(req.createdAt)}</p>
                      {req.estimatedCost && (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                          {formatCurrency(req.estimatedCost)}
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

      {/* Request Detail Slide-over */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedRequest(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 shadow-xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
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
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColors[selectedRequest.type]}`}>
                    {selectedRequest.type}
                  </span>
                  {isManager && (
                    <select
                      value={selectedRequest.status}
                      onChange={e => handleUpdateStatus(selectedRequest.id, e.target.value)}
                      className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ESTIMATED">Estimated</option>
                      <option value="CLIENT_APPROVED">Client Approved</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedRequest.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Project</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedRequest.project.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Client</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedRequest.project.client.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Assigned To</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedRequest.assignedTo ? `${selectedRequest.assignedTo.firstName} ${selectedRequest.assignedTo.lastName || ''}` : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Created</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedRequest.createdAt)}</p>
                </div>
              </div>

              {(selectedRequest.estimatedHours || selectedRequest.estimatedCost) && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedRequest.estimatedHours && (
                    <div>
                      <p className="text-slate-500">Estimated Hours</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedRequest.estimatedHours}h</p>
                    </div>
                  )}
                  {selectedRequest.estimatedCost && (
                    <div>
                      <p className="text-slate-500">Estimated Cost</p>
                      <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(selectedRequest.estimatedCost)}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedRequest.pageUrl && (
                <div>
                  <p className="text-sm text-slate-500">Page URL</p>
                  <a href={selectedRequest.pageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {selectedRequest.pageUrl}
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-slate-700 dark:text-slate-300">{selectedRequest.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New Change Request</h2>
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
                  value={newRequest.title}
                  onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="What needs to be changed?"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project *</label>
                <select
                  value={newRequest.projectId}
                  onChange={e => setNewRequest({ ...newRequest, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.client.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={newRequest.type}
                    onChange={e => setNewRequest({ ...newRequest, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="MINOR">Minor</option>
                    <option value="ENHANCEMENT">Enhancement</option>
                    <option value="MAJOR">Major</option>
                    <option value="FEATURE">Feature</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
                  <select
                    value={newRequest.assignedToId}
                    onChange={e => setNewRequest({ ...newRequest, assignedToId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={newRequest.estimatedHours}
                    onChange={e => setNewRequest({ ...newRequest, estimatedHours: e.target.value })}
                    placeholder="Hours"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Est. Cost (₹)</label>
                  <input
                    type="number"
                    value={newRequest.estimatedCost}
                    onChange={e => setNewRequest({ ...newRequest, estimatedCost: e.target.value })}
                    placeholder="₹"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequest.requiresApproval}
                    onChange={e => setNewRequest({ ...newRequest, requiresApproval: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Requires client approval</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequest.isBillable}
                    onChange={e => setNewRequest({ ...newRequest, isBillable: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Billable</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea
                  value={newRequest.description}
                  onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe the change request in detail..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
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
                onClick={handleCreateRequest}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
