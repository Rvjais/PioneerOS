'use client'

import { useState } from 'react'

interface Goal {
  id: string
  title: string
  description: string
  category: 'RECRUITMENT' | 'ONBOARDING' | 'ENGAGEMENT' | 'COMPLIANCE' | 'DEVELOPMENT'
  target: number
  current: number
  unit: string
  deadline: string
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED'
}

const GOALS: Goal[] = [
  {
    id: '1',
    title: 'Complete 10 Hires This Quarter',
    description: 'Fill all open positions across departments',
    category: 'RECRUITMENT',
    target: 10,
    current: 7,
    unit: 'hires',
    deadline: '2024-03-31',
    status: 'ON_TRACK',
  },
  {
    id: '2',
    title: 'Reduce Time-to-Hire to 25 Days',
    description: 'Streamline recruitment process for faster hiring',
    category: 'RECRUITMENT',
    target: 25,
    current: 28,
    unit: 'days',
    deadline: '2024-03-31',
    status: 'AT_RISK',
  },
  {
    id: '3',
    title: 'Achieve 95% Onboarding Completion',
    description: 'Ensure all new hires complete onboarding checklist',
    category: 'ONBOARDING',
    target: 95,
    current: 88,
    unit: '%',
    deadline: '2024-03-31',
    status: 'AT_RISK',
  },
  {
    id: '4',
    title: 'Conduct 50 Employee Engagement Activities',
    description: 'Organize team activities, celebrations, and wellness programs',
    category: 'ENGAGEMENT',
    target: 50,
    current: 32,
    unit: 'activities',
    deadline: '2024-12-31',
    status: 'ON_TRACK',
  },
  {
    id: '5',
    title: '100% Compliance Training Completion',
    description: 'Ensure all employees complete mandatory compliance training',
    category: 'COMPLIANCE',
    target: 100,
    current: 100,
    unit: '%',
    deadline: '2024-02-28',
    status: 'COMPLETED',
  },
  {
    id: '6',
    title: 'Launch Leadership Development Program',
    description: 'Design and launch program for high-potential employees',
    category: 'DEVELOPMENT',
    target: 100,
    current: 45,
    unit: '%',
    deadline: '2024-06-30',
    status: 'ON_TRACK',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All Goals' },
  { id: 'RECRUITMENT', label: 'Recruitment' },
  { id: 'ONBOARDING', label: 'Onboarding' },
  { id: 'ENGAGEMENT', label: 'Engagement' },
  { id: 'COMPLIANCE', label: 'Compliance' },
  { id: 'DEVELOPMENT', label: 'Development' },
]

export default function HRGoalsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [goals, setGoals] = useState(GOALS)

  const filteredGoals = selectedCategory === 'all'
    ? goals
    : goals.filter(g => g.category === selectedCategory)

  const completedGoals = goals.filter(g => g.status === 'COMPLETED').length
  const onTrackGoals = goals.filter(g => g.status === 'ON_TRACK').length
  const atRiskGoals = goals.filter(g => g.status === 'AT_RISK' || g.status === 'BEHIND').length

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'RECRUITMENT': return 'bg-blue-500/20 text-blue-400'
      case 'ONBOARDING': return 'bg-green-500/20 text-green-400'
      case 'ENGAGEMENT': return 'bg-pink-500/20 text-pink-400'
      case 'COMPLIANCE': return 'bg-amber-500/20 text-amber-400'
      case 'DEVELOPMENT': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400'
      case 'ON_TRACK': return 'bg-blue-500/20 text-blue-400'
      case 'AT_RISK': return 'bg-amber-500/20 text-amber-400'
      case 'BEHIND': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">My Goals</h1>
          <p className="text-sm text-slate-400">Track your HR objectives and targets</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Goals</p>
          <p className="text-3xl font-bold text-white">{goals.length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Completed</p>
          <p className="text-3xl font-bold text-green-400">{completedGoals}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">On Track</p>
          <p className="text-3xl font-bold text-blue-400">{onTrackGoals}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">At Risk</p>
          <p className="text-3xl font-bold text-amber-400">{atRiskGoals}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-purple-500 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map(goal => {
          const progress = goal.unit === 'days'
            ? Math.max(0, 100 - ((goal.current - goal.target) / goal.target * 100))
            : (goal.current / goal.target) * 100

          return (
            <div key={goal.id} className="glass-card rounded-xl border border-white/10 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{goal.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(goal.status)}`}>
                      {goal.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{goal.description}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(goal.category)}`}>
                  {goal.category}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-medium text-white">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        goal.status === 'COMPLETED' ? 'bg-green-500' :
                        goal.status === 'ON_TRACK' ? 'bg-blue-500' :
                        goal.status === 'AT_RISK' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Deadline</p>
                  <p className="text-sm font-medium text-slate-200">
                    {new Date(goal.deadline).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {goal.status !== 'COMPLETED' && (
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white">
                    Update Progress
                  </button>
                  <button className="px-3 py-1.5 text-sm text-purple-400 hover:text-purple-800">
                    View Details
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-800 mb-3">Goal Setting Tips</h3>
        <ul className="space-y-2 text-sm text-purple-400">
          <li className="flex items-start gap-2">
            <span className="text-purple-500">1.</span>
            Set SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">2.</span>
            Break large goals into smaller milestones for better tracking
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">3.</span>
            Review and update progress weekly to stay on track
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">4.</span>
            Align individual goals with team and organizational objectives
          </li>
        </ul>
      </div>
    </div>
  )
}
