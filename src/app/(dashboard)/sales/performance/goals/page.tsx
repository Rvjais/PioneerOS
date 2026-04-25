'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Goal {
  id: string
  userId: string
  user: { id: string; firstName: string; lastName: string | null }
  month: string
  title: string
  description: string | null
  targetValue: number | null
  currentValue: number | null
  category: string
  priority: string
  status: string
  achievedAt: string | null
  setBy: string
  reviewNotes: string | null
  createdAt: string
}

const CATEGORIES = ['GROWTH', 'QUALITY', 'EFFICIENCY', 'CLIENT_SATISFACTION', 'LEARNING']
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW']
const STATUSES = ['IN_PROGRESS', 'ACHIEVED', 'MISSED', 'CANCELLED']

const categoryLabels: Record<string, string> = {
  GROWTH: 'Growth',
  QUALITY: 'Quality',
  EFFICIENCY: 'Efficiency',
  CLIENT_SATISFACTION: 'Client Satisfaction',
  LEARNING: 'Learning',
}

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  ACHIEVED: 'text-green-400 bg-green-500/10 border-green-500/20',
  MISSED: 'text-red-400 bg-red-500/10 border-red-500/20',
  CANCELLED: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

const priorityColors: Record<string, string> = {
  HIGH: 'text-red-400 bg-red-500/10',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10',
  LOW: 'text-slate-400 bg-slate-500/10',
}

export default function SalesGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [stats, setStats] = useState({ total: 0, achieved: 0, inProgress: 0, missed: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const [form, setForm] = useState({
    userId: '',
    title: '',
    description: '',
    targetValue: '',
    category: 'GROWTH',
    priority: 'MEDIUM',
  })

  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; firstName: string; lastName: string | null }>>([])

  useEffect(() => {
    fetchGoals()
  }, [selectedMonth, filterStatus])

  useEffect(() => {
    fetch('/api/admin/users?role=SALES&limit=100')
      .then(res => res.ok ? res.json() : { users: [] })
      .then(data => setTeamMembers(data.users || []))
      .catch(() => {})
  }, [])

  async function fetchGoals() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedMonth) params.set('month', `${selectedMonth}-01`)
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/sales/goals?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setGoals(data.goals || [])
      setStats(data.stats || { total: 0, achieved: 0, inProgress: 0, missed: 0 })
    } catch {
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.userId || !form.title || !form.category) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      const res = await fetch('/api/sales/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          month: `${selectedMonth}-01`,
          targetValue: form.targetValue || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      toast.success('Goal created')
      setShowCreateModal(false)
      setForm({ userId: '', title: '', description: '', targetValue: '', category: 'GROWTH', priority: 'MEDIUM' })
      fetchGoals()
    } catch {
      toast.error('Failed to create goal')
    }
  }

  async function handleUpdateStatus(goalId: string, status: string) {
    try {
      const res = await fetch('/api/sales/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`Goal marked as ${status.toLowerCase().replace('_', ' ')}`)
      fetchGoals()
    } catch {
      toast.error('Failed to update goal')
    }
  }

  async function handleUpdateProgress(goalId: string, currentValue: string) {
    try {
      const res = await fetch('/api/sales/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, currentValue }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success('Progress updated')
      fetchGoals()
    } catch {
      toast.error('Failed to update progress')
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/sales/performance" className="text-slate-400 hover:text-white text-sm">
              Performance
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-white text-sm">Goals</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Goals Management</h1>
          <p className="text-slate-400 mt-1">Set and track sales team targets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Set Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-white/10 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filterStatus ? 'bg-orange-500 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'}`}
          >
            All ({stats.total})
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterStatus === s ? 'bg-orange-500 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400">Total Goals</p>
        </div>
        <div className="glass-card rounded-xl border border-green-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.achieved}</p>
          <p className="text-xs text-slate-400">Achieved</p>
        </div>
        <div className="glass-card rounded-xl border border-blue-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-xs text-slate-400">In Progress</p>
        </div>
        <div className="glass-card rounded-xl border border-red-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.missed}</p>
          <p className="text-xs text-slate-400">Missed</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
            <p className="text-slate-400">No goals found for this month</p>
            <button onClick={() => setShowCreateModal(true)} className="mt-3 text-orange-400 hover:underline text-sm">
              Set the first goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.targetValue && goal.currentValue
              ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              : null
            return (
              <div key={goal.id} className={`glass-card rounded-xl border p-5 ${statusColors[goal.status]?.split(' ').pop() || 'border-white/10'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{goal.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[goal.priority] || ''}`}>
                        {goal.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[goal.status] || ''}`}>
                        {goal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {goal.user.firstName} {goal.user.lastName || ''} · {categoryLabels[goal.category] || goal.category}
                    </p>
                    {goal.description && <p className="text-sm text-slate-300 mt-1">{goal.description}</p>}
                  </div>
                  {goal.status === 'IN_PROGRESS' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'ACHIEVED')}
                        className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20"
                      >
                        Mark Achieved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'MISSED')}
                        className="px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
                      >
                        Mark Missed
                      </button>
                    </div>
                  )}
                </div>
                {goal.targetValue != null && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress: {goal.currentValue || 0} / {goal.targetValue}</span>
                      <div className="flex items-center gap-2">
                        {goal.status === 'IN_PROGRESS' && (
                          <input
                            type="number"
                            placeholder="Update"
                            className="w-20 px-2 py-1 text-xs border border-white/10 rounded text-white bg-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateProgress(goal.id, (e.target as HTMLInputElement).value)
                                ;(e.target as HTMLInputElement).value = ''
                              }
                            }}
                          />
                        )}
                        <span className="text-white font-medium">{progress ?? 0}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          goal.status === 'ACHIEVED' ? 'bg-green-500' :
                          goal.status === 'MISSED' ? 'bg-red-500' :
                          (progress || 0) >= 75 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}
                {goal.reviewNotes && (
                  <p className="text-xs text-slate-400 mt-2 italic">Review: {goal.reviewNotes}</p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Set New Goal</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Team Member *</label>
              <select
                value={form.userId}
                onChange={e => setForm({ ...form, userId: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select team member</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName || ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Goal Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Close 5 new deals"
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Target Value</label>
                <input
                  type="number"
                  value={form.targetValue}
                  onChange={e => setForm({ ...form, targetValue: e.target.value })}
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{categoryLabels[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-white/10 text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
