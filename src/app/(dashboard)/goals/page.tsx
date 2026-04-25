'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  GOAL_CATEGORIES,
  GOAL_STATUS,
  CLIENT_ROLE_CATEGORIES,
  ROLE_DEFAULT_GOALS,
  getLabelForValue,
  getColorForValue,
} from '@/shared/constants/formConstants'
import PageGuide from '@/client/components/ui/PageGuide'

interface Client {
  id: string
  name: string
  logoUrl: string | null
  role?: string
}

interface GoalData {
  id: string
  category: string | null
  title: string
  description: string | null
  quarter: number | null
  year: number | null
  clientId: string | null
  client: Client | null
  status: string
  progress: number
  targetValue: number | null
  currentValue: number
  unit: string | null
  achievementNotes: string | null
  selfRating: number | null
  owner: {
    id: string
    firstName: string
    lastName: string | null
    department: string | null
    role: string | null
  } | null
}

interface UserInfo {
  id: string
  firstName: string
  lastName: string | null
  role: string | null
  department: string | null
}

interface QuarterlyData {
  user: UserInfo
  quarter: number
  year: number
  isClientFacing: boolean
  assignedClients: Client[]
  goals: GoalData[]
  goalsByCategory: Record<string, GoalData[]>
  stats: {
    total: number
    completed: number
    avgProgress: number
    reviewed: number
  }
}

// Form for adding a single goal
interface GoalForm {
  category: string
  title: string
  description: string
  clientId: string
  targetValue: string
  unit: string
}

function getCurrentQuarter() {
  const now = new Date()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  return { quarter, year: now.getFullYear() }
}

function getQuarterLabel(q: number, y: number) {
  return `Q${q} ${y}`
}

function getQuarterRange(q: number, y: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const start = (q - 1) * 3
  return `${months[start]} - ${months[start + 2]} ${y}`
}

function isQuarterEnded(q: number, y: number) {
  const now = new Date()
  const endMonth = q * 3
  const endDate = new Date(y, endMonth, 0)
  return now > endDate
}

const CATEGORY_COLORS: Record<string, string> = {
  CLIENT: 'border-blue-500/30 bg-blue-500/5',
  LEARNING: 'border-purple-500/30 bg-purple-500/5',
  SKILL: 'border-emerald-500/30 bg-emerald-500/5',
  SALES: 'border-amber-500/30 bg-amber-500/5',
  CLIENT_SATISFACTION: 'border-cyan-500/30 bg-cyan-500/5',
  PROCESS: 'border-orange-500/30 bg-orange-500/5',
  RECRUITMENT: 'border-pink-500/30 bg-pink-500/5',
  COMPLIANCE: 'border-red-500/30 bg-red-500/5',
  REPORTING: 'border-indigo-500/30 bg-indigo-500/5',
  TEAM_BUILDING: 'border-teal-500/30 bg-teal-500/5',
}

const CATEGORY_ICON_COLORS: Record<string, string> = {
  CLIENT: 'text-blue-400',
  LEARNING: 'text-purple-400',
  SKILL: 'text-emerald-400',
  SALES: 'text-amber-400',
  CLIENT_SATISFACTION: 'text-cyan-400',
  PROCESS: 'text-orange-400',
  RECRUITMENT: 'text-pink-400',
  COMPLIANCE: 'text-red-400',
  REPORTING: 'text-indigo-400',
  TEAM_BUILDING: 'text-teal-400',
}

export default function GoalsPage() {
  const [data, setData] = useState<QuarterlyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewGoal, setReviewGoal] = useState<GoalData | null>(null)
  const [showDefaultsModal, setShowDefaultsModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'goals' | 'review'>('goals')
  const [selectedUser, setSelectedUser] = useState('')
  const [teamMembers, setTeamMembers] = useState<UserInfo[]>([])

  // Add goal form
  const [form, setForm] = useState<GoalForm>({
    category: '',
    title: '',
    description: '',
    clientId: '',
    targetValue: '',
    unit: '',
  })

  // Review form
  const [reviewForm, setReviewForm] = useState({
    achievementNotes: '',
    selfRating: 3,
    progress: 0,
    currentValue: '',
  })

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        quarter: selectedQuarter.quarter.toString(),
        year: selectedQuarter.year.toString(),
      })
      if (selectedUser) params.append('userId', selectedUser)

      const res = await fetch(`/api/quarterly-goals?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedQuarter, selectedUser])

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/users?status=ACTIVE')
      if (res.ok) {
        const json = await res.json()
        setTeamMembers(json.users || json)
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
    }
  }

  useEffect(() => {
    fetchGoals()
    fetchTeamMembers()
  }, [fetchGoals])

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/quarterly-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          title: form.title,
          description: form.description || undefined,
          quarter: selectedQuarter.quarter,
          year: selectedQuarter.year,
          clientId: form.clientId || undefined,
          ownerId: data?.user.id,
          targetValue: form.targetValue ? parseFloat(form.targetValue) : undefined,
          unit: form.unit || undefined,
        }),
      })

      if (res.ok) {
        toast.success('Goal added')
        setShowAddModal(false)
        resetForm()
        fetchGoals()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to add goal')
      }
    } catch {
      toast.error('Failed to add goal')
    } finally {
      setSaving(false)
    }
  }

  const handleApplyDefaults = async () => {
    if (!data) return
    const role = data.user.role || 'EMPLOYEE'
    const defaults = ROLE_DEFAULT_GOALS[role]
    if (!defaults || defaults.length === 0) {
      toast.error('No default goals configured for this role')
      return
    }

    setSaving(true)
    try {
      const goals = defaults.map(d => ({
        category: d.category,
        title: d.title,
        description: d.description,
        quarter: selectedQuarter.quarter,
        year: selectedQuarter.year,
        ownerId: data.user.id,
        targetValue: d.targetValue,
        unit: d.unit,
      }))

      const res = await fetch('/api/quarterly-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals }),
      })

      if (res.ok) {
        const result = await res.json()
        toast.success(`${result.count} default goals created`)
        setShowDefaultsModal(false)
        fetchGoals()
      } else {
        toast.error('Failed to create default goals')
      }
    } catch {
      toast.error('Failed to create default goals')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewGoal) return
    setSaving(true)
    try {
      const res = await fetch('/api/quarterly-goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: reviewGoal.id,
          achievementNotes: reviewForm.achievementNotes,
          selfRating: reviewForm.selfRating,
          progress: reviewForm.progress,
          currentValue: reviewForm.currentValue ? parseFloat(reviewForm.currentValue) : undefined,
        }),
      })

      if (res.ok) {
        toast.success('Review submitted')
        setShowReviewModal(false)
        setReviewGoal(null)
        fetchGoals()
      } else {
        toast.error('Failed to submit review')
      }
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSaving(false)
    }
  }

  const handleProgressUpdate = async (goal: GoalData, progress: number) => {
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress,
          status: progress >= 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        }),
      })
      if (res.ok) fetchGoals()
    } catch {
      toast.error('Failed to update progress')
    }
  }

  const resetForm = () => {
    setForm({ category: '', title: '', description: '', clientId: '', targetValue: '', unit: '' })
  }

  const openReview = (goal: GoalData) => {
    setReviewGoal(goal)
    setReviewForm({
      achievementNotes: goal.achievementNotes || '',
      selfRating: goal.selfRating || 3,
      progress: goal.progress,
      currentValue: goal.currentValue?.toString() || '',
    })
    setShowReviewModal(true)
  }

  // Quarter navigation
  const quarters: Array<{ quarter: number; year: number }> = []
  const current = getCurrentQuarter()
  for (let i = -2; i <= 2; i++) {
    let q = current.quarter + i
    let y = current.year
    while (q > 4) { q -= 4; y++ }
    while (q < 1) { q += 4; y-- }
    quarters.push({ quarter: q, year: y })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-amber-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getCategoryDef = (cat: string) => GOAL_CATEGORIES.find(c => c.value === cat)

  // Determine which categories to show based on role
  const getRelevantCategories = () => {
    if (!data) return GOAL_CATEGORIES
    if (data.isClientFacing) {
      return GOAL_CATEGORIES.filter(c => CLIENT_ROLE_CATEGORIES.includes(c.value as typeof CLIENT_ROLE_CATEGORIES[number]))
    }
    const role = data.user.role || 'EMPLOYEE'
    const roleDefaults = ROLE_DEFAULT_GOALS[role]
    if (roleDefaults) {
      const cats = [...new Set(roleDefaults.map(d => d.category))]
      return GOAL_CATEGORIES.filter(c => cats.includes(c.value))
    }
    return GOAL_CATEGORIES
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const quarterEnded = isQuarterEnded(selectedQuarter.quarter, selectedQuarter.year)
  const isCurrentQuarter = selectedQuarter.quarter === current.quarter && selectedQuarter.year === current.year

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="quarterly-goals"
        title="Quarterly Goals"
        description="Set and track your goals every quarter. Goals are tailored to your role and reviewed at quarter end."
        steps={[
          { label: 'Set quarterly goals', description: 'Define goals at the start of each quarter based on your role' },
          { label: 'Track progress', description: 'Update progress throughout the quarter' },
          { label: 'End-of-quarter review', description: 'Submit what you achieved and rate yourself' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quarterly Goals</h1>
          <p className="text-slate-300 mt-1">
            {data?.user.firstName}&apos;s goals for {getQuarterRange(selectedQuarter.quarter, selectedQuarter.year)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && data.goals.length === 0 && ROLE_DEFAULT_GOALS[data.user.role || ''] && (
            <button
              onClick={() => setShowDefaultsModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Apply Role Defaults
            </button>
          )}
          <button
            onClick={() => {
              resetForm()
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Goal
          </button>
        </div>
      </div>

      {/* Quarter Selector + User Selector (admin only) */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
          {quarters.map(q => (
            <button
              key={`${q.quarter}-${q.year}`}
              onClick={() => setSelectedQuarter(q)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedQuarter.quarter === q.quarter && selectedQuarter.year === q.year
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {getQuarterLabel(q.quarter, q.year)}
              {q.quarter === current.quarter && q.year === current.year && (
                <span className="ml-1 text-[10px] opacity-70">now</span>
              )}
            </button>
          ))}
        </div>

        {/* Admin user selector */}
        {teamMembers.length > 0 && (
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-white/20 rounded-lg text-white text-sm"
          >
            <option value="">My Goals</option>
            {teamMembers.map((u: UserInfo) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.role})
              </option>
            ))}
          </select>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 ml-auto">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'goals' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'review' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            End-of-Quarter Review
          </button>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-400">Total Goals</p>
            <p className="text-2xl font-bold text-white">{data.stats.total}</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-emerald-400">{data.stats.completed}</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-400">Avg Progress</p>
            <p className="text-2xl font-bold text-blue-400">{data.stats.avgProgress}%</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-400">Reviewed</p>
            <p className="text-2xl font-bold text-purple-400">{data.stats.reviewed}/{data.stats.total}</p>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && data && (
        <div className="space-y-6">
          {data.goals.length === 0 ? (
            <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
              <div className="text-4xl mb-3">
                <svg className="w-12 h-12 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">No goals set for {getQuarterLabel(selectedQuarter.quarter, selectedQuarter.year)}</h3>
              <p className="text-sm text-slate-400 mb-4">
                {data.user.role && ROLE_DEFAULT_GOALS[data.user.role]
                  ? 'Apply role-based defaults or add goals manually.'
                  : 'Start by adding your quarterly goals.'}
              </p>
            </div>
          ) : (
            // Group by category
            Object.entries(data.goalsByCategory).map(([category, goals]) => {
              const catDef = getCategoryDef(category)
              const colorClass = CATEGORY_COLORS[category] || 'border-white/10'
              const iconColor = CATEGORY_ICON_COLORS[category] || 'text-slate-400'

              return (
                <div key={category} className={`glass-card rounded-xl border ${colorClass} overflow-hidden`}>
                  <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${iconColor}`}>{catDef?.icon || '🎯'}</span>
                      <div>
                        <h3 className="font-semibold text-white">{catDef?.label || category}</h3>
                        <p className="text-xs text-slate-400">{catDef?.description}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400">{(goals as GoalData[]).length} goal{(goals as GoalData[]).length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {(goals as GoalData[]).map((goal: GoalData) => (
                      <div key={goal.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-white">{goal.title}</h4>
                              {goal.client && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                                  {goal.client.name}
                                </span>
                              )}
                              <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${getColorForValue(GOAL_STATUS, goal.status)}`}>
                                {getLabelForValue(GOAL_STATUS, goal.status)}
                              </span>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-slate-400 mt-1">{goal.description}</p>
                            )}
                            {goal.targetValue && (
                              <p className="text-xs text-slate-500 mt-1">
                                Target: {goal.currentValue}/{goal.targetValue} {goal.unit}
                              </p>
                            )}
                            {goal.achievementNotes && (
                              <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-white/5">
                                <p className="text-xs text-slate-400">
                                  <span className="font-medium text-slate-300">Review:</span> {goal.achievementNotes}
                                </p>
                                {goal.selfRating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                      <svg
                                        key={s}
                                        className={`w-3 h-3 ${s <= goal.selfRating! ? 'text-amber-400' : 'text-slate-600'}`}
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Progress */}
                            <div className="w-28">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-400">Progress</span>
                                <span className="font-medium text-white">{goal.progress}%</span>
                              </div>
                              <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${getProgressColor(goal.progress)}`}
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Quick progress buttons */}
                            <div className="flex gap-1">
                              {[0, 25, 50, 75, 100].map(p => (
                                <button
                                  key={p}
                                  onClick={() => handleProgressUpdate(goal, p)}
                                  className={`w-7 h-7 text-[10px] rounded-full border transition-colors ${
                                    goal.progress === p
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'border-white/20 text-slate-400 hover:bg-slate-800/50'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>

                            {/* Review button (for ended quarters) */}
                            {(quarterEnded || isCurrentQuarter) && (
                              <button
                                onClick={() => openReview(goal)}
                                className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                                  goal.achievementNotes
                                    ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                                    : 'border-white/20 text-slate-300 hover:bg-slate-800/50'
                                }`}
                              >
                                {goal.achievementNotes ? 'Edit Review' : 'Review'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* End-of-Quarter Review Tab */}
      {activeTab === 'review' && data && (
        <div className="space-y-4">
          {!quarterEnded && isCurrentQuarter && (
            <div className="glass-card rounded-xl border border-amber-500/20 p-4 bg-amber-500/5">
              <p className="text-sm text-amber-300">
                This quarter is still in progress. You can start reviewing goals early, but final reviews are typically done at quarter end.
              </p>
            </div>
          )}

          {data.goals.length === 0 ? (
            <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
              <p className="text-slate-400">No goals to review for this quarter.</p>
            </div>
          ) : (
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10">
                <h3 className="font-semibold text-white">Quarter Review Summary</h3>
                <p className="text-xs text-slate-400">Review each goal and document what was achieved</p>
              </div>
              <div className="divide-y divide-white/5">
                {data.goals.map(goal => {
                  const catDef = getCategoryDef(goal.category || '')
                  return (
                    <div key={goal.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{catDef?.icon || '🎯'}</span>
                          <span className="font-medium text-white text-sm">{goal.title}</span>
                          {goal.client && (
                            <span className="text-xs text-blue-300">({goal.client.name})</span>
                          )}
                        </div>
                        {goal.targetValue && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {goal.currentValue}/{goal.targetValue} {goal.unit}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-20">
                          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(goal.progress)}`}
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 text-center mt-0.5">{goal.progress}%</p>
                        </div>

                        {goal.selfRating ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <svg
                                key={s}
                                className={`w-3 h-3 ${s <= goal.selfRating! ? 'text-amber-400' : 'text-slate-600'}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Not reviewed</span>
                        )}

                        <button
                          onClick={() => openReview(goal)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            goal.achievementNotes
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {goal.achievementNotes ? 'Update' : 'Review'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl shadow-none w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Add Goal for {getQuarterLabel(selectedQuarter.quarter, selectedQuarter.year)}</h2>
            </div>
            <form onSubmit={handleAddGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Goal Category *</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value, clientId: '' }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select category...</option>
                  {getRelevantCategories().map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Client dropdown for CLIENT category */}
              {form.category === 'CLIENT' && data.assignedClients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Client *</label>
                  <select
                    required
                    value={form.clientId}
                    onChange={(e) => setForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select client...</option>
                    {data.assignedClients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.role ? `(${client.role.replace(/_/g, ' ')})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Showing your assigned active clients</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder={
                    form.category === 'CLIENT' ? 'e.g., Increase organic traffic by 30%' :
                    form.category === 'LEARNING' ? 'e.g., Complete Google Analytics 4 certification' :
                    form.category === 'SKILL' ? 'e.g., Learn and implement AI content generation tool' :
                    form.category === 'SALES' ? 'e.g., Present AI tools to 5 existing clients for upsell' :
                    form.category === 'CLIENT_SATISFACTION' ? 'e.g., Achieve NPS score of 8+ across all clients' :
                    'Describe your goal...'
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={2}
                  placeholder="Details about how you plan to achieve this goal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Target Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.targetValue}
                    onChange={(e) => setForm(prev => ({ ...prev, targetValue: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={
                      form.category === 'SALES' ? 'e.g., 5 clients' :
                      form.category === 'CLIENT_SATISFACTION' ? 'e.g., 8 NPS' :
                      'e.g., 100'
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={
                      form.category === 'CLIENT_SATISFACTION' ? 'NPS' :
                      form.category === 'SALES' ? 'clients' :
                      '%'
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm() }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 hover:bg-slate-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Defaults Confirmation Modal */}
      {showDefaultsModal && data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl shadow-none w-full max-w-md m-4 border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Apply Role Defaults</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300">
                This will create the following default goals for <span className="text-white font-medium">{data.user.role}</span> role:
              </p>
              <div className="space-y-2">
                {(ROLE_DEFAULT_GOALS[data.user.role || ''] || []).map((d, i) => {
                  const catDef = getCategoryDef(d.category)
                  return (
                    <div key={d.title} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                      <span className="text-sm">{catDef?.icon || '🎯'}</span>
                      <div>
                        <p className="text-sm text-white">{d.title}</p>
                        <p className="text-xs text-slate-400">{d.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowDefaultsModal(false)}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 hover:bg-slate-900/40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyDefaults}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Apply Defaults'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl shadow-none w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">End-of-Quarter Review</h2>
              <p className="text-sm text-slate-400 mt-1">{reviewGoal.title}</p>
              {reviewGoal.client && (
                <p className="text-sm text-blue-300 mt-0.5">Client: {reviewGoal.client.name}</p>
              )}
            </div>
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Final Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={reviewForm.progress}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all ${getProgressColor(reviewForm.progress)}`}
                    style={{ width: `${reviewForm.progress}%` }}
                  />
                </div>
              </div>

              {reviewGoal.targetValue && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Actual Value (Target: {reviewGoal.targetValue} {reviewGoal.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={reviewForm.currentValue}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, currentValue: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={`Achieved ${reviewGoal.unit || 'value'}`}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Self Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, selfRating: s }))}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${s <= reviewForm.selfRating ? 'text-amber-400' : 'text-slate-600'}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                  <span className="text-sm text-slate-400 ml-2">
                    {reviewForm.selfRating === 1 ? 'Not achieved' :
                     reviewForm.selfRating === 2 ? 'Partially achieved' :
                     reviewForm.selfRating === 3 ? 'Mostly achieved' :
                     reviewForm.selfRating === 4 ? 'Fully achieved' :
                     'Exceeded expectations'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">What was achieved / not achieved? *</label>
                <textarea
                  required
                  value={reviewForm.achievementNotes}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, achievementNotes: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Describe what you accomplished, challenges faced, and what was left incomplete..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { setShowReviewModal(false); setReviewGoal(null) }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 hover:bg-slate-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
