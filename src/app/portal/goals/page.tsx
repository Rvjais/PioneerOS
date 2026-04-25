'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import PageGuide from '@/client/components/ui/PageGuide'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface Goal {
  id: string
  name: string
  description: string | null
  category: string
  metricType: string
  targetValue: number
  currentValue: number
  unit: string | null
  progress: number
  status: string
  periodType: string
  startDate: string
  endDate: string
  color: string | null
  displayOrder: number
}

interface GoalStats {
  total: number
  completed: number
  inProgress: number
  overdue: number
  averageProgress: number
}

export default function PortalGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [stats, setStats] = useState<GoalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/client-portal/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data.goals)
        setStats(data.stats)
      } else {
        setError('Failed to load goals')
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
      setError('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'completed') return goal.status === 'COMPLETED'
    if (filter === 'active') return goal.status !== 'COMPLETED'
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">Completed</span>
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">In Progress</span>
      case 'AT_RISK':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">At Risk</span>
      case 'OVERDUE':
        return <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">Overdue</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-slate-800/50 text-slate-200 rounded-full">{status}</span>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MARKETING':
        return 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
      case 'LEADS':
        return 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      case 'REVENUE':
        return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      case 'TRAFFIC':
        return 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      case 'ENGAGEMENT':
        return 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      default:
        return 'M13 10V3L4 14h7v7l9-11h-7z'
    }
  }

  if (loading) {
    return <PortalPageSkeleton titleWidth="w-32" statCards={3} listItems={4} />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => { setError(null); fetchGoals() }} className="px-4 py-2 bg-orange-500 text-white rounded-lg">Try Again</button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageGuide
        pageKey="portal-goals"
        title="Your Goals"
        description="Track goals and targets set for your account"
        steps={[
          { label: 'View active goals', description: 'See all current goals set by your account team' },
          { label: 'Check progress', description: 'Monitor progress bars and completion percentages for each goal' },
          { label: 'Understand metrics', description: 'Review target values, current values, and time periods for each goal' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals & Targets</h1>
          <p className="text-slate-300">Track your marketing goals and performance targets</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Goals</div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-sm text-slate-400">Completed</div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
            <div className="text-sm text-slate-400">In Progress</div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
            <div className="text-sm text-slate-400">Overdue</div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-purple-400">{Math.round(stats.averageProgress)}%</div>
            <div className="text-sm text-slate-400">Avg Progress</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No goals found</h3>
          <p className="text-slate-400">Goals will appear here once they are set by your account team.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="glass-card rounded-xl border border-white/10 p-6 hover:shadow-none transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: goal.color ? `${goal.color}20` : '#EFF6FF' }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: goal.color || '#3B82F6' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getCategoryIcon(goal.category)} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{goal.name}</h3>
                    <p className="text-sm text-slate-400">{goal.category}</p>
                  </div>
                </div>
                {getStatusBadge(goal.status)}
              </div>

              {goal.description && (
                <p className="text-sm text-slate-300 mb-4">{goal.description}</p>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">
                    {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                  </span>
                  <span className="text-sm font-medium text-white">{Math.round(goal.progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(goal.progress, 100)}%`,
                      backgroundColor: goal.status === 'COMPLETED' ? '#10B981' : goal.color || '#3B82F6',
                    }}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {formatDateDDMMYYYY(goal.startDate)} - {formatDateDDMMYYYY(goal.endDate)}
                </span>
                <span className="text-slate-300">|</span>
                <span className="capitalize">{goal.periodType.toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
