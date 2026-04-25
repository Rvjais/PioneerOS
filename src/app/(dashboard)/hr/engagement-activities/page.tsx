'use client'

import { useState, useEffect } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface User {
  id: string
  firstName: string
  lastName: string | null
}

interface Activity {
  id: string
  title: string
  description: string | null
  type: string
  scheduledDate: string
  endDate: string | null
  location: string | null
  estimatedBudget: number | null
  actualSpent: number | null
  budgetApproved: boolean
  status: string
  approvedBy: string | null
  approver: User | null
  approvedAt: string | null
  rejectionReason: string | null
  targetAudience: string | null
  department: string | null
  expectedCount: number | null
  actualCount: number | null
  organizedBy: string
  organizer: User
  photos: string | null
  feedback: string | null
  createdAt: string
}

const TYPE_OPTIONS = ['CELEBRATION', 'TEAM_OUTING', 'WORKSHOP', 'GAME', 'WELLNESS', 'FESTIVAL', 'BIRTHDAY', 'ANNIVERSARY']
const STATUS_COLORS: Record<string, string> = {
  'PROPOSED': 'bg-slate-800/50 text-slate-200',
  'PENDING_APPROVAL': 'bg-orange-500/20 text-orange-400',
  'APPROVED': 'bg-green-500/20 text-green-400',
  'REJECTED': 'bg-red-500/20 text-red-400',
  'COMPLETED': 'bg-blue-500/20 text-blue-400',
  'CANCELLED': 'bg-slate-800/50 text-slate-400',
}

const TYPE_ICONS: Record<string, string> = {
  'CELEBRATION': '🎉',
  'TEAM_OUTING': '🏞️',
  'WORKSHOP': '📚',
  'GAME': '🎮',
  'WELLNESS': '🧘',
  'FESTIVAL': '🪔',
  'BIRTHDAY': '🎂',
  'ANNIVERSARY': '🎊',
}

export default function EngagementActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [upcoming, setUpcoming] = useState<Activity[]>([])
  const [stats, setStats] = useState({
    total: 0,
    proposed: 0,
    pendingApproval: 0,
    approved: 0,
    completed: 0,
    totalBudget: 0,
    totalSpent: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hr/engagement-activities')
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities)
        setUpcoming(data.upcoming)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(a => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return new Date(a.scheduledDate) >= new Date() && a.status !== 'CANCELLED'
    if (filter === 'past') return new Date(a.scheduledDate) < new Date()
    return a.status === filter
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
            <h1 className="text-2xl font-bold text-white">Employee Engagement</h1>
            <InfoTooltip
              title="Planning Engagement Activities"
              steps={[
                'Propose new activities with estimated budget',
                'Activities with budget need founder approval',
                'Track attendance and feedback after events',
                'Review spending vs budget for planning'
              ]}
              tips={[
                'Plan activities at least 2 weeks in advance',
                'Get budget approved before booking venues',
                'Collect feedback to improve future events'
              ]}
            />
          </div>
          <p className="text-slate-400 text-sm mt-1">Plan and track team activities and celebrations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm"
        >
          Propose Activity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Activities</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Approved</p>
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Total Budget</p>
          <p className="text-2xl font-bold text-blue-400">₹{stats.totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Spent</p>
          <p className="text-2xl font-bold text-purple-400">₹{stats.totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {/* Upcoming Activities Banner */}
      {upcoming.length > 0 && (
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-4 text-white">
          <h3 className="font-semibold mb-3">Upcoming Activities ({upcoming.length})</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {upcoming.map(activity => (
              <div key={activity.id} className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 flex-shrink-0 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{TYPE_ICONS[activity.type] || '📅'}</span>
                  <span className="font-medium">{activity.title}</span>
                </div>
                <p className="text-sm text-white/80">
                  {new Date(activity.scheduledDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                  })}
                  {activity.location && ` • ${activity.location}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'upcoming', 'PROPOSED', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED', 'past'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 glass-card rounded-xl border border-white/10">
            No activities found
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} onUpdate={fetchActivities} />
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddActivityModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false)
            fetchActivities()
          }}
        />
      )}
    </div>
  )
}

// Activity Card Component
function ActivityCard({ activity, onUpdate }: { activity: Activity; onUpdate: () => void }) {
  const isPast = new Date(activity.scheduledDate) < new Date()

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/hr/engagement-activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  return (
    <div className={`glass-card rounded-xl border border-white/10 overflow-hidden ${isPast ? 'opacity-75' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{TYPE_ICONS[activity.type] || '📅'}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white">{activity.title}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[activity.status]}`}>
                  {activity.status.replace(/_/g, ' ')}
                </span>
              </div>
              {activity.description && (
                <p className="text-sm text-slate-300 mb-2">{activity.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(activity.scheduledDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                {activity.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {activity.location}
                  </span>
                )}
                <span>Target: {activity.targetAudience || 'ALL'}</span>
                {activity.expectedCount && <span>Expected: {activity.expectedCount} people</span>}
              </div>
            </div>
          </div>

          <div className="text-right">
            {activity.estimatedBudget && (
              <p className="text-sm font-semibold text-white">
                ₹{activity.estimatedBudget.toLocaleString()}
              </p>
            )}
            {activity.budgetApproved && (
              <span className="text-xs text-green-400">Budget Approved</span>
            )}
            {activity.actualSpent && (
              <p className="text-xs text-slate-400">
                Spent: ₹{activity.actualSpent.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <span className="text-xs text-slate-400">
            Organized by {activity.organizer.firstName}
          </span>
          <div className="flex gap-2">
            {activity.status === 'PROPOSED' && (
              <button
                onClick={() => handleStatusChange('PENDING_APPROVAL')}
                className="px-3 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-200"
              >
                Submit for Approval
              </button>
            )}
            {activity.status === 'APPROVED' && !isPast && (
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-200"
              >
                Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Activity Modal
function AddActivityModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'CELEBRATION',
    scheduledDate: '',
    endDate: '',
    location: '',
    estimatedBudget: '',
    targetAudience: 'ALL',
    expectedCount: ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title || !form.scheduledDate) return

    setSaving(true)
    try {
      const res = await fetch('/api/hr/engagement-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          estimatedBudget: form.estimatedBudget ? parseFloat(form.estimatedBudget) : null,
          expectedCount: form.expectedCount ? parseInt(form.expectedCount) : null
        })
      })

      if (res.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Failed to create activity:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Propose Activity</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="Activity name"
            />
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
                  <option key={t} value={t}>{TYPE_ICONS[t]} {t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Target Audience</label>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
              >
                <option value="ALL">Everyone</option>
                <option value="DEPARTMENT">Specific Department</option>
                <option value="TEAM">Specific Team</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="Details about the activity"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Date *</label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="Office, Park, Restaurant, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Estimated Budget (₹)</label>
              <input
                type="number"
                value={form.estimatedBudget}
                onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
                placeholder="0"
              />
              <p className="text-xs text-slate-400 mt-1">Activities with budget need founder approval</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Expected Attendees</label>
              <input
                type="number"
                value={form.expectedCount}
                onChange={(e) => setForm({ ...form, expectedCount: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.title || !form.scheduledDate}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Propose Activity'}
          </button>
        </div>
      </div>
    </div>
  )
}
