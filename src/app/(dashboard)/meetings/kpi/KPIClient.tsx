'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateTablePDF } from '@/client/utils/export/pdfExport'
import { ExportButtons } from '@/client/components/ExportButtons'

interface User {
  id: string
  name: string
  department: string
  tasksCompleted: number
  accountabilityScore: number
  managerRating: number | null
  managerNotes: string | null
  goalsAchieved: number
  totalGoals: number
  goalsScore: number
  monthlyAvg: number
}

interface Goal {
  id: string
  userId: string
  title: string
  description: string | null
  category: string
  priority: string
  status: string
  targetValue: number | null
  currentValue: number | null
}

interface KPIClientProps {
  scoreboard: User[]
  currentMonth: string
  isManager: boolean
  departments: string[]
  goals: Goal[]
}

const GOAL_CATEGORIES = [
  { value: 'GROWTH', label: 'Growth' },
  { value: 'QUALITY', label: 'Quality' },
  { value: 'EFFICIENCY', label: 'Efficiency' },
  { value: 'CLIENT_SATISFACTION', label: 'Client Satisfaction' },
  { value: 'LEARNING', label: 'Learning' },
]

const GOAL_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

function getMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = []
  const now = new Date()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    months.push({ value, label })
  }
  return months
}

export function KPIClient({ scoreboard: initialScoreboard, currentMonth, isManager, departments, goals: initialGoals }: KPIClientProps) {
  const router = useRouter()
  const [scoreboard, setScoreboard] = useState(initialScoreboard)
  const [goals, setGoals] = useState(initialGoals)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')
  const [editingRating, setEditingRating] = useState<string | null>(null)
  const [ratingForm, setRatingForm] = useState({ rating: '', notes: '' })
  const [savingRating, setSavingRating] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'GROWTH',
    priority: 'MEDIUM',
    targetValue: '',
  })
  const [savingGoal, setSavingGoal] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  const monthOptions = getMonthOptions()

  // Filter scoreboard by department
  const filteredScoreboard = selectedDepartment === 'ALL'
    ? scoreboard
    : scoreboard.filter(u => u.department === selectedDepartment)

  // Handle month change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    router.push(`/meetings/kpi?month=${month}`)
  }

  // Handle rating submission
  const handleSaveRating = async (userId: string) => {
    if (!ratingForm.rating) return
    setSavingRating(true)

    try {
      const res = await fetch('/api/accountability/rating', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          month: selectedMonth,
          managerRating: parseFloat(ratingForm.rating),
          managerNotes: ratingForm.notes || null,
        }),
      })

      if (res.ok) {
        // Update local state
        setScoreboard(prev => prev.map(u => {
          if (u.id === userId) {
            const newRating = parseFloat(ratingForm.rating)
            const ratingNorm = newRating * 10
            const newAvg = (u.accountabilityScore * 0.4) + (ratingNorm * 0.3) + (u.goalsScore * 0.3)
            return {
              ...u,
              managerRating: newRating,
              managerNotes: ratingForm.notes || null,
              monthlyAvg: Math.round(newAvg),
            }
          }
          return u
        }))
        setEditingRating(null)
        setRatingForm({ rating: '', notes: '' })
      }
    } catch (error) {
      console.error('Failed to save rating:', error)
    } finally {
      setSavingRating(false)
    }
  }

  // Handle goal creation
  const handleCreateGoal = async () => {
    if (!goalForm.title || !selectedUserId) return
    setSavingGoal(true)

    try {
      const res = await fetch('/api/accountability/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          title: goalForm.title,
          description: goalForm.description || null,
          category: goalForm.category,
          priority: goalForm.priority,
          targetValue: goalForm.targetValue ? parseFloat(goalForm.targetValue) : null,
          month: selectedMonth,
        }),
      })

      if (res.ok) {
        const newGoal = await res.json()
        setGoals(prev => [...prev, newGoal])
        // Update goal count in scoreboard
        setScoreboard(prev => prev.map(u => {
          if (u.id === selectedUserId) {
            return { ...u, totalGoals: u.totalGoals + 1 }
          }
          return u
        }))
        setShowGoalModal(false)
        setGoalForm({ title: '', description: '', category: 'GROWTH', priority: 'MEDIUM', targetValue: '' })
        setSelectedUserId(null)
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
    } finally {
      setSavingGoal(false)
    }
  }

  // Handle goal status update
  const handleUpdateGoalStatus = async (goalId: string, status: string) => {
    try {
      const res = await fetch('/api/accountability/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, status }),
      })

      if (res.ok) {
        const updatedGoal = await res.json()
        setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status } : g))

        // Update goals achieved count in scoreboard
        const goal = goals.find(g => g.id === goalId)
        if (goal) {
          setScoreboard(prev => prev.map(u => {
            if (u.id === goal.userId) {
              const wasAchieved = goal.status === 'ACHIEVED'
              const isAchieved = status === 'ACHIEVED'
              let newAchieved = u.goalsAchieved
              if (!wasAchieved && isAchieved) newAchieved++
              if (wasAchieved && !isAchieved) newAchieved--
              const newGoalsScore = u.totalGoals > 0 ? Math.round((newAchieved / u.totalGoals) * 100) : 0
              return { ...u, goalsAchieved: newAchieved, goalsScore: newGoalsScore }
            }
            return u
          }))
        }
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const openRatingEditor = (user: User) => {
    setEditingRating(user.id)
    setRatingForm({
      rating: user.managerRating?.toString() || '',
      notes: user.managerNotes || '',
    })
  }

  const openGoalModal = (userId: string) => {
    setSelectedUserId(userId)
    setShowGoalModal(true)
  }

  const getUserGoals = (userId: string) => goals.filter(g => g.userId === userId)

  const getAvgColor = (avg: number) => {
    if (avg >= 75) return 'text-emerald-400 bg-emerald-500/10'
    if (avg >= 50) return 'text-amber-400 bg-amber-500/10'
    return 'text-red-400 bg-red-500/10'
  }

  const handleExportCSV = () => {
    const headers = ['Rank', 'Name', 'Department', 'Tasks Done', 'Accountability', 'Manager Rating', 'Goals', 'Monthly Avg']
    const rows = filteredScoreboard.map((user, i) => [
      i + 1,
      user.name,
      user.department,
      user.tasksCompleted,
      `${user.accountabilityScore}%`,
      user.managerRating ? `${user.managerRating}/10` : 'Not Rated',
      `${user.goalsAchieved}/${user.totalGoals}`,
      `${user.monthlyAvg}%`,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kpi-scorecard-${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth

    generateTablePDF(
      {
        columns: [
          { header: '#', key: 'rank', width: 10 },
          { header: 'Employee', key: 'name', width: 40 },
          { header: 'Dept', key: 'department', width: 25 },
          { header: 'Tasks', key: 'tasks', width: 15 },
          { header: 'Accountability', key: 'accountability', width: 25 },
          { header: 'Manager Rating', key: 'rating', width: 25 },
          { header: 'Goals', key: 'goals', width: 20 },
          { header: 'Monthly Avg', key: 'avg', width: 25 },
        ],
        rows: filteredScoreboard.map((user, i) => ({
          rank: i + 1,
          name: user.name,
          department: user.department,
          tasks: user.tasksCompleted,
          accountability: `${user.accountabilityScore}%`,
          rating: user.managerRating ? `${user.managerRating}/10` : 'Not Rated',
          goals: `${user.goalsAchieved}/${user.totalGoals} (${user.goalsScore}%)`,
          avg: `${user.monthlyAvg}%`,
        })),
      },
      {
        title: 'Tactical KPI Scorecard',
        subtitle: monthLabel,
        filename: `kpi-scorecard-${selectedMonth}`,
        orientation: 'landscape',
      },
      [
        { label: 'Total Employees', value: filteredScoreboard.length, color: 'blue' },
        { label: 'Avg Score', value: `${Math.round(filteredScoreboard.reduce((sum, u) => sum + u.monthlyAvg, 0) / filteredScoreboard.length || 0)}%`, color: 'green' },
        { label: 'With Rating', value: filteredScoreboard.filter(u => u.managerRating).length, color: 'amber' },
      ]
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tactical KPI Scorecard</h1>
          <p className="text-slate-400 mt-1">Monthly performance tracking</p>
        </div>
        <ExportButtons onExportPDF={handleExportPDF} onExportCSV={handleExportCSV} />
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white glass-card"
            >
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white glass-card"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scorecard Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-8 text-center">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dept</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Tasks</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Accountability</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Manager Rating</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Goals</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Monthly Avg</th>
                {isManager && <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredScoreboard.map((user, i) => {
                const userGoals = getUserGoals(user.id)
                return (
                  <tr key={user.id} className="hover:bg-blue-500/10 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-400 text-center">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {user.name[0]}
                        </div>
                        <span className="text-sm font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-400 bg-slate-800/50 px-2 py-1 rounded uppercase">{user.department}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-slate-200">{user.tasksCompleted}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-white">{user.accountabilityScore}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingRating === user.id ? (
                        <div className="flex items-center gap-2 justify-center">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={ratingForm.rating}
                            onChange={(e) => setRatingForm(f => ({ ...f, rating: e.target.value }))}
                            className="w-16 px-2 py-1 border border-white/20 rounded text-sm text-center"
                            placeholder="1-10"
                          />
                          <button
                            onClick={() => handleSaveRating(user.id)}
                            disabled={savingRating}
                            className="p-1 text-green-400 hover:bg-green-500/10 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingRating(null)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          {user.managerRating ? (
                            <span className="text-sm font-bold text-blue-400">{user.managerRating}/10</span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not Rated</span>
                          )}
                          {isManager && (
                            <button
                              onClick={() => openRatingEditor(user)}
                              className="p-1 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                              title="Edit Rating"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-slate-200">{user.goalsAchieved}/{user.totalGoals}</span>
                      <span className="text-xs text-slate-400 ml-1">({user.goalsScore}%)</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${getAvgColor(user.monthlyAvg)}`}>
                        {user.monthlyAvg}%
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openGoalModal(user.id)}
                          className="px-2 py-1 text-xs text-indigo-600 bg-indigo-500/10 rounded hover:bg-indigo-500/20"
                        >
                          + Goal
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
              {filteredScoreboard.length === 0 && (
                <tr>
                  <td colSpan={isManager ? 9 : 8} className="px-4 py-12 text-center text-slate-400">
                    No performance data available for this month yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goals Section for Manager */}
      {isManager && goals.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">Active Goals This Month</h3>
          </div>
          <div className="divide-y divide-white/10">
            {goals.map(goal => {
              const user = scoreboard.find(u => u.id === goal.userId)
              return (
                <div key={goal.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-white">{goal.title}</p>
                      <p className="text-sm text-slate-400">
                        {user?.name} - <span className="capitalize">{goal.category.toLowerCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={goal.status}
                      onChange={(e) => handleUpdateGoalStatus(goal.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded border ${
                        goal.status === 'ACHIEVED' ? 'bg-green-500/10 border-green-200 text-green-400' :
                        goal.status === 'IN_PROGRESS' ? 'bg-blue-500/10 border-blue-200 text-blue-400' :
                        goal.status === 'MISSED' ? 'bg-red-500/10 border-red-200 text-red-400' :
                        'bg-slate-900/40 border-white/10 text-slate-200'
                      }`}
                    >
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ACHIEVED">Achieved</option>
                      <option value="MISSED">Missed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Scoring Formula</h3>
        <div className="text-xs text-slate-400 space-y-1">
          <p><strong>Monthly Avg</strong> = (Accountability x 40%) + (Manager Rating x 30%) + (Goals x 30%)</p>
          <p><strong>Accountability</strong> = (Delivered Units / Expected Units) x 100</p>
          <p><strong>Manager Rating</strong> = 1-10 subjective score, normalized to 0-100</p>
          <p><strong>Goals</strong> = (Achieved Goals / Total Goals) x 100</p>
        </div>
      </div>

      {/* Goal Creation Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4 shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create New Goal</h3>
              <button
                onClick={() => { setShowGoalModal(false); setSelectedUserId(null); }}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Goal Title *</label>
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm"
                  placeholder="e.g., Improve client response time"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm"
                  rows={2}
                  placeholder="Optional details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm"
                  >
                    {GOAL_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Priority</label>
                  <select
                    value={goalForm.priority}
                    onChange={(e) => setGoalForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm"
                  >
                    {GOAL_PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Target Value (optional)</label>
                <input
                  type="number"
                  value={goalForm.targetValue}
                  onChange={(e) => setGoalForm(f => ({ ...f, targetValue: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm"
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateGoal}
                disabled={savingGoal || !goalForm.title}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingGoal ? 'Creating...' : 'Create Goal'}
              </button>
              <button
                onClick={() => { setShowGoalModal(false); setSelectedUserId(null); }}
                className="px-4 py-2 border border-white/20 text-slate-200 rounded-lg font-medium hover:bg-slate-900/40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
