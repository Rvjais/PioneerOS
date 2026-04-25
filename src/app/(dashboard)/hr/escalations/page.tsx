'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface User {
  id: string
  firstName: string
  lastName: string | null
  department: string
}

interface Client {
  id: string
  name: string
}

interface Escalation {
  id: string
  employeeId: string
  employee: User
  type: string
  severity: string
  title: string
  description: string
  clientId: string | null
  client: Client | null
  reportedBy: string
  reporter: User
  status: string
  resolution: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  impactOnAppraisal: boolean
  actionTaken: string | null
  createdAt: string
}

const SEVERITY_COLORS: Record<string, string> = {
  'LOW': 'bg-slate-800/50 text-slate-200 border-white/20',
  'MEDIUM': 'bg-yellow-500/20 text-yellow-400 border-yellow-300',
  'HIGH': 'bg-orange-500/20 text-orange-400 border-orange-300',
  'CRITICAL': 'bg-red-500/20 text-red-800 border-red-300',
}

const STATUS_COLORS: Record<string, string> = {
  'OPEN': 'bg-red-500/20 text-red-400',
  'IN_PROGRESS': 'bg-yellow-500/20 text-yellow-400',
  'RESOLVED': 'bg-green-500/20 text-green-400',
  'CLOSED': 'bg-slate-800/50 text-slate-200',
}

const TYPE_OPTIONS = [
  'CLIENT_COMPLAINT',
  'DELIVERY_ISSUE',
  'BEHAVIOR',
  'ATTENDANCE',
  'QUALITY',
  'OTHER'
]

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null)

  useEffect(() => {
    fetchEscalations()
  }, [])

  const fetchEscalations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hr/escalations')
      if (res.ok) {
        const data = await res.json()
        setEscalations(data.escalations)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch escalations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEscalations = escalations.filter(e => {
    if (filter === 'all') return true
    if (filter === 'open') return e.status === 'OPEN'
    if (filter === 'in_progress') return e.status === 'IN_PROGRESS'
    if (filter === 'resolved') return e.status === 'RESOLVED' || e.status === 'CLOSED'
    if (filter === 'critical') return e.severity === 'CRITICAL'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Employee Escalations</h1>
            <InfoTooltip
              title="Managing Escalations"
              steps={[
                'Report escalations when client complaints or issues arise',
                'Set severity level - CRITICAL gets auto-notified',
                'Track resolution and action taken',
                'Mark impact on appraisal if needed'
              ]}
              tips={[
                'Address CRITICAL escalations immediately',
                'Document everything for appraisal reviews',
                'Follow up with the employee after resolution'
              ]}
            />
          </div>
          <p className="text-slate-400 text-sm mt-1">Track and resolve employee-related issues</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm"
          >
            <option value="all">All Escalations</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="critical">Critical</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Report Escalation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Open</p>
          <p className="text-2xl font-bold text-red-400">{stats.open}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-sm text-yellow-600">In Progress</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Resolved</p>
          <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
        </div>
        <div className="bg-red-500/20 rounded-xl border border-red-300 p-4">
          <p className="text-sm text-red-400">Critical Active</p>
          <p className="text-2xl font-bold text-red-800">{stats.critical}</p>
        </div>
      </div>

      {/* Critical Alert */}
      {stats.critical > 0 && (
        <div className="bg-red-600 text-white rounded-xl p-4 flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">{stats.critical} Critical Escalation{stats.critical > 1 ? 's' : ''} Require Immediate Attention</p>
            <p className="text-sm text-red-100">Please address these issues as soon as possible</p>
          </div>
        </div>
      )}

      {/* Escalation List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/10">
          {filteredEscalations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No escalations found
            </div>
          ) : (
            filteredEscalations.map((escalation) => (
              <div
                key={escalation.id}
                className="p-4 hover:bg-slate-900/40 cursor-pointer"
                onClick={() => setSelectedEscalation(escalation)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[escalation.severity]}`}>
                        {escalation.severity}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[escalation.status]}`}>
                        {escalation.status.replace(/_/g, ' ')}
                      </span>
                      {escalation.impactOnAppraisal && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                          Affects Appraisal
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white">{escalation.title}</h3>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-2">{escalation.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Employee: <strong>{escalation.employee.firstName} {escalation.employee.lastName}</strong></span>
                      {escalation.client && <span>Client: <strong>{escalation.client.name}</strong></span>}
                      <span>Type: {escalation.type.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>{new Date(escalation.createdAt).toLocaleDateString('en-IN')}</p>
                    <p>by {escalation.reporter.firstName}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddEscalationModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false)
            fetchEscalations()
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedEscalation && (
        <EscalationDetailModal
          escalation={selectedEscalation}
          onClose={() => setSelectedEscalation(null)}
          onSave={() => {
            setSelectedEscalation(null)
            fetchEscalations()
          }}
        />
      )}
    </div>
  )
}

// Add Escalation Modal
function AddEscalationModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [employees, setEmployees] = useState<User[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    type: 'CLIENT_COMPLAINT',
    severity: 'MEDIUM',
    title: '',
    description: '',
    clientId: '',
    impactOnAppraisal: false
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Fetch employees and clients
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/clients').then(r => r.json())
    ]).then(([usersData, clientsData]) => {
      setEmployees(usersData.users || [])
      setClients(clientsData.clients || [])
    })
  }, [])

  const handleSubmit = async () => {
    if (!form.employeeId || !form.title || !form.description) return

    setSaving(true)
    try {
      const res = await fetch('/api/hr/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Failed to create escalation:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Report Escalation</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Employee *</label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
            >
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.department}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Related Client</label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
            >
              <option value="">None</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="Detailed description of the escalation..."
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.impactOnAppraisal}
              onChange={(e) => setForm({ ...form, impactOnAppraisal: e.target.checked })}
              className="w-4 h-4 rounded border-white/20"
            />
            <span className="text-sm text-slate-200">Impact on Appraisal</span>
          </label>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.employeeId || !form.title || !form.description}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Report Escalation'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Escalation Detail Modal
function EscalationDetailModal({
  escalation,
  onClose,
  onSave
}: {
  escalation: Escalation
  onClose: () => void
  onSave: () => void
}) {
  const [status, setStatus] = useState(escalation.status)
  const [resolution, setResolution] = useState(escalation.resolution || '')
  const [actionTaken, setActionTaken] = useState(escalation.actionTaken || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/hr/escalations/${escalation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution, actionTaken })
      })

      if (res.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Failed to update escalation:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[escalation.severity]}`}>
              {escalation.severity}
            </span>
            <span className="text-xs text-slate-400">{escalation.type.replace(/_/g, ' ')}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{escalation.title}</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Employee</label>
            <p className="text-white">{escalation.employee.firstName} {escalation.employee.lastName}</p>
          </div>

          {escalation.client && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Client</label>
              <p className="text-white">{escalation.client.name}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
            <p className="text-slate-300">{escalation.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Action Taken</label>
            <textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="What action was taken..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Resolution</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="How was this resolved..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}
