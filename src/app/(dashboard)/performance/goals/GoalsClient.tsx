'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Goal {
  id: string
  userId: string
  title: string
  description: string | null
  targetValue: number | null
  currentValue: number | null
  category: string
  priority: string
  status: string
  month: string
  achievedAt: string | null
  user?: {
    firstName: string
    lastName: string | null
    department: string
  }
}

interface User {
  id: string
  firstName: string
  lastName: string | null
  department: string
}

interface GoalsClientProps {
  myGoals: Goal[]
  allGoals: Goal[]
  users: User[]
  isManager: boolean
}

const CATEGORIES = ['GROWTH', 'QUALITY', 'EFFICIENCY', 'CLIENT_SATISFACTION', 'LEARNING']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']
const STATUSES = ['IN_PROGRESS', 'ACHIEVED', 'MISSED', 'CANCELLED']

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  ACHIEVED: 'bg-green-500/20 text-green-400',
  MISSED: 'bg-red-500/20 text-red-400',
  CANCELLED: 'bg-slate-800/50 text-slate-200',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-800/50 text-slate-300',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400',
  HIGH: 'bg-red-500/20 text-red-400',
}

export function GoalsClient({ myGoals, allGoals, isManager, users }: GoalsClientProps) {
  const router = useRouter()
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'mine' | 'all'>('mine')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const goals = selectedTab === 'mine' ? myGoals : allGoals

  const handleUpdateStatus = async (goalId: string, newStatus: string) => {
    setUpdatingId(goalId)
    try {
      const res = await fetch('/api/accountability/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const summary = {
    total: myGoals.length,
    achieved: myGoals.filter(g => g.status === 'ACHIEVED').length,
    inProgress: myGoals.filter(g => g.status === 'IN_PROGRESS').length,
    missed: myGoals.filter(g => g.status === 'MISSED').length,
  }

  const achievementRate = summary.total > 0 ? Math.round((summary.achieved / summary.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{summary.total}</p>
          <p className="text-sm text-slate-400">Total Goals</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">{summary.achieved}</p>
          <p className="text-sm text-slate-400">Achieved</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">{summary.inProgress}</p>
          <p className="text-sm text-slate-400">In Progress</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-indigo-600">{achievementRate}%</p>
          <p className="text-sm text-slate-400">Achievement Rate</p>
        </div>
      </div>

      {/* Tabs and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('mine')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'mine'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
            }`}
          >
            My Goals ({myGoals.length})
          </button>
          {isManager && (
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
              }`}
            >
              All Team Goals ({allGoals.length})
            </button>
          )}
        </div>
        {isManager && (
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Set New Goal
          </button>
        )}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="glass-card rounded-xl border border-white/10 p-4 hover:shadow-none transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white">{goal.title}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[goal.priority]}`}>
                    {goal.priority}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[goal.status]}`}>
                    {goal.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {goal.description && (
                  <p className="text-sm text-slate-400 mb-2">{goal.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="px-2 py-1 bg-slate-800/50 rounded">{goal.category}</span>
                  {goal.targetValue && (
                    <span>
                      Progress: {goal.currentValue || 0} / {goal.targetValue}
                    </span>
                  )}
                  {selectedTab === 'all' && goal.user && (
                    <span className="font-medium">
                      {goal.user.firstName} {goal.user.lastName || ''} • {goal.user.department}
                    </span>
                  )}
                </div>
              </div>
              {goal.status === 'IN_PROGRESS' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(goal.id, 'ACHIEVED')}
                    disabled={updatingId === goal.id}
                    className="px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-200 text-green-400 rounded-lg disabled:opacity-50"
                  >
                    Mark Achieved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(goal.id, 'MISSED')}
                    disabled={updatingId === goal.id}
                    className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-200 text-red-400 rounded-lg disabled:opacity-50"
                  >
                    Mark Missed
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400">No goals set for this month</p>
            {isManager && (
              <button
                onClick={() => setShowAddGoal(true)}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Set your first goal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <AddGoalModal
          users={users}
          onClose={() => setShowAddGoal(false)}
          onSuccess={() => {
            setShowAddGoal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function AddGoalModal({
  users,
  onClose,
  onSuccess,
}: {
  users: User[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    userId: '',
    title: '',
    description: '',
    targetValue: '',
    category: 'GROWTH',
    priority: 'MEDIUM',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/accountability/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          targetValue: form.targetValue ? parseFloat(form.targetValue) : null,
        }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create goal')
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
      toast.error('Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative glass-card rounded-2xl shadow-none w-full max-w-lg">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Set New Goal</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Employee</label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select employee...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName || ''} ({user.department})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Goal Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g., Increase client retention by 10%"
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Details about this goal..."
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Target Value</label>
              <input
                type="number"
                value={form.targetValue}
                onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
