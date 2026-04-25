'use client'

import { useState } from 'react'

interface Escalation {
  id: string
  title: string
  description: string
  type: string
  severity: string
  status: string
  resolution?: string | null
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string } | null
  employee?: { id: string; firstName: string; lastName: string } | null
  reporter?: { id: string; firstName: string; lastName: string } | null
}

interface Client {
  id: string
  name: string
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
  IN_PROGRESS: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  RESOLVED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  CLOSED: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
}

const severityColors: Record<string, string> = {
  LOW: 'bg-blue-500/20 text-blue-400',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  CRITICAL: 'bg-red-500/20 text-red-400',
}

const typeLabels: Record<string, string> = {
  CLIENT_COMPLAINT: 'Client Complaint',
  DELIVERY_ISSUE: 'Delivery Issue',
  QUALITY: 'Quality',
  OTHER: 'Other',
}

const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export function WebEscalationsClient({
  initialEscalations,
  clients,
  teamMembers,
  stats,
  isManager,
  currentUserId,
}: {
  initialEscalations: Escalation[]
  clients: Client[]
  teamMembers: TeamMember[]
  stats: Stats
  isManager: boolean
  currentUserId: string
}) {
  const [escalations, setEscalations] = useState<Escalation[]>(initialEscalations)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newEscalation, setNewEscalation] = useState({
    clientId: '',
    title: '',
    description: '',
    type: 'CLIENT_COMPLAINT',
    severity: 'HIGH',
    assignedToId: '',
  })

  const filteredEscalations = escalations
    .filter(e => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter
      const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter
      return matchesSearch && matchesStatus && matchesSeverity
    })
    .sort((a, b) => {
      const aIdx = severityOrder.indexOf(a.severity)
      const bIdx = severityOrder.indexOf(b.severity)
      return aIdx - bIdx
    })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleCreateEscalation = async () => {
    if (!newEscalation.title.trim() || !newEscalation.clientId) {
      setError('Title and client are required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/web/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEscalation.title.trim(),
          description: newEscalation.description.trim(),
          clientId: newEscalation.clientId,
          type: newEscalation.type,
          severity: newEscalation.severity,
          assignedToId: newEscalation.assignedToId || undefined,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setEscalations(prev => [created, ...prev])
        setShowAddModal(false)
        setNewEscalation({ clientId: '', title: '', description: '', type: 'CLIENT_COMPLAINT', severity: 'HIGH', assignedToId: '' })
      } else {
        const err = await res.json()
        setError(err.error || 'Failed to create escalation')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Client Escalations</h1>
          <p className="text-slate-500 mt-1">Track and manage client escalations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Report Escalation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-red-600">{stats.open}</p>
          <p className="text-sm text-slate-500">Open</p>
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
            placeholder="Search escalations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Escalations List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredEscalations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No escalations found</p>
            </div>
          ) : (
            filteredEscalations.map(escalation => {
              const statusStyle = statusColors[escalation.status] || statusColors.OPEN
              return (
                <div
                  key={escalation.id}
                  onClick={() => setSelectedEscalation(escalation)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${severityColors[escalation.severity] || severityColors.MEDIUM}`}>
                          {escalation.severity}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeLabels[escalation.type] ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {typeLabels[escalation.type] || escalation.type}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {escalation.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">{escalation.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {escalation.client?.name || 'Unknown Client'} — Reported by {escalation.reporter?.firstName || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{formatDate(escalation.createdAt)}</p>
                      {escalation.employee && (
                        <p className="text-xs text-slate-500 mt-1">
                          Assigned: {escalation.employee.firstName}
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

      {/* Escalation Detail Slide-over */}
      {selectedEscalation && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedEscalation(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 shadow-xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Escalation Details</h2>
              <button
                onClick={() => setSelectedEscalation(null)}
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
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${severityColors[selectedEscalation.severity]}`}>
                    {selectedEscalation.severity}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeLabels[selectedEscalation.type] ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {typeLabels[selectedEscalation.type] || selectedEscalation.type}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedEscalation.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Client</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedEscalation.client?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Reported By</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedEscalation.reporter?.firstName} {selectedEscalation.reporter?.lastName || ''}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Assigned To</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedEscalation.employee?.firstName || 'Unassigned'} {selectedEscalation.employee?.lastName || ''}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Created</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedEscalation.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-slate-700 dark:text-slate-300">{selectedEscalation.description}</p>
              </div>

              {selectedEscalation.resolution && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Resolution</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedEscalation.resolution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Escalation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Report Client Escalation</h2>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client *</label>
                <select
                  value={newEscalation.clientId}
                  onChange={e => setNewEscalation({ ...newEscalation, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newEscalation.title}
                  onChange={e => setNewEscalation({ ...newEscalation, title: e.target.value })}
                  placeholder="Brief description of the escalation"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={newEscalation.type}
                    onChange={e => setNewEscalation({ ...newEscalation, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="CLIENT_COMPLAINT">Client Complaint</option>
                    <option value="DELIVERY_ISSUE">Delivery Issue</option>
                    <option value="QUALITY">Quality</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Severity</label>
                  <select
                    value={newEscalation.severity}
                    onChange={e => setNewEscalation({ ...newEscalation, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
                <select
                  value={newEscalation.assignedToId}
                  onChange={e => setNewEscalation({ ...newEscalation, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Auto-assign to Web Manager</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <textarea
                  value={newEscalation.description}
                  onChange={e => setNewEscalation({ ...newEscalation, description: e.target.value })}
                  placeholder="Describe the escalation in detail..."
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
                onClick={handleCreateEscalation}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Escalation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
