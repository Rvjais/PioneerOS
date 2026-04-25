'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Goal {
  id: string
  title: string
  description: string
  type: 'collections' | 'invoices' | 'efficiency' | 'custom'
  target: number
  current: number
  unit: string
  dueDate: string
  status: 'on_track' | 'at_risk' | 'behind' | 'completed'
  createdAt: string
}

const typeColors = {
  collections: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  invoices: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  efficiency: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  custom: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
}

const statusColors = {
  on_track: 'text-emerald-400',
  at_risk: 'text-amber-400',
  behind: 'text-red-400',
  completed: 'text-blue-400'
}

export default function MyGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'collections' as Goal['type'],
    target: 0,
    unit: '',
    dueDate: ''
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/accounts/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target) return

    try {
      const res = await fetch('/api/accounts/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      })
      if (res.ok) {
        fetchGoals()
        setShowAddModal(false)
        setNewGoal({ title: '', description: '', type: 'collections', target: 0, unit: '', dueDate: '' })
      }
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const getProgress = (goal: Goal) => {
    return Math.round((goal.current / goal.target) * 100)
  }

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const activeGoals = goals.filter(g => g.status !== 'completed')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">My Goals</h1>
            <InfoTooltip
              title="Monthly Goals"
              steps={[
                'Set collection and invoice targets',
                'Track progress throughout the month',
                'Get alerts when at risk',
                'Celebrate when completed'
              ]}
              tips={[
                'Set realistic but challenging targets',
                'Review goals weekly'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Set and track your monthly collection targets</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Goal
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Active Goals</p>
          <p className="text-3xl font-bold text-white">{activeGoals.length}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Completed</p>
          <p className="text-3xl font-bold text-white">{completedGoals.length}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 text-sm">At Risk</p>
          <p className="text-3xl font-bold text-white">{goals.filter(g => g.status === 'at_risk').length}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-purple-400 text-sm">Avg Progress</p>
          <p className="text-3xl font-bold text-white">
            {activeGoals.length > 0
              ? Math.round(activeGoals.reduce((sum, g) => sum + getProgress(g), 0) / activeGoals.length)
              : 0}%
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Active Goals */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Active Goals</h2>

            {activeGoals.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
                <p className="text-slate-400">No active goals. Add a goal to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeGoals.map(goal => {
                  const progress = getProgress(goal)
                  const daysLeft = getDaysRemaining(goal.dueDate)

                  return (
                    <div
                      key={goal.id}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full border ${typeColors[goal.type]}`}>
                            {goal.type}
                          </span>
                          <div>
                            <h3 className="font-medium text-white">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-slate-400 mt-1">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${statusColors[goal.status]}`}>
                          {goal.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">
                            {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                          </span>
                          <span className="text-white font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progress >= 100 ? 'bg-emerald-500' :
                              progress >= 75 ? 'bg-blue-500' :
                              progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Due: {formatDateDDMMYYYY(goal.dueDate)}</span>
                          <span className={daysLeft < 7 ? 'text-red-400' : ''}>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Completed Goals</h2>
              <div className="grid gap-3">
                {completedGoals.map(goal => (
                  <div
                    key={goal.id}
                    className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-medium text-white">{goal.title}</p>
                        <p className="text-sm text-emerald-400">
                          Achieved: {goal.current.toLocaleString()} {goal.unit}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Templates */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Suggested Goals</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setNewGoal({
                    title: 'Monthly Collections Target',
                    description: 'Achieve collection target for the month',
                    type: 'collections',
                    target: 1000000,
                    unit: 'Rs.',
                    dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
                  })
                  setShowAddModal(true)
                }}
                className="p-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors"
              >
                <span className="text-2xl">💰</span>
                <p className="font-medium text-white mt-2">Collections Target</p>
                <p className="text-sm text-slate-400">Monthly collection goal</p>
              </button>

              <button
                onClick={() => {
                  setNewGoal({
                    title: 'Invoice Processing',
                    description: 'Process invoices efficiently',
                    type: 'invoices',
                    target: 50,
                    unit: 'invoices',
                    dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
                  })
                  setShowAddModal(true)
                }}
                className="p-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors"
              >
                <span className="text-2xl">📄</span>
                <p className="font-medium text-white mt-2">Invoice Processing</p>
                <p className="text-sm text-slate-400">Invoices to process</p>
              </button>

              <button
                onClick={() => {
                  setNewGoal({
                    title: 'Collection Rate',
                    description: 'Achieve high collection efficiency',
                    type: 'efficiency',
                    target: 95,
                    unit: '%',
                    dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
                  })
                  setShowAddModal(true)
                }}
                className="p-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors"
              >
                <span className="text-2xl">📈</span>
                <p className="font-medium text-white mt-2">Collection Rate</p>
                <p className="text-sm text-slate-400">Target efficiency rate</p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Add New Goal</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={e => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  placeholder="e.g., Monthly Collections Target"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={e => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none"
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Type</label>
                  <select
                    value={newGoal.type}
                    onChange={e => setNewGoal(prev => ({ ...prev, type: e.target.value as Goal['type'] }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="collections">Collections</option>
                    <option value="invoices">Invoices</option>
                    <option value="efficiency">Efficiency</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newGoal.dueDate}
                    onChange={e => setNewGoal(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Target</label>
                  <input
                    type="number"
                    value={newGoal.target || ''}
                    onChange={e => setNewGoal(prev => ({ ...prev, target: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                    placeholder="e.g., 1000000"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={e => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                    placeholder="e.g., Rs., invoices, %"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
