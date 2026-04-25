'use client'

import { useState, useEffect } from 'react'

interface Stats {
  total: number
  completed: number
  breakthroughs: number
  breakdowns: number
  breakthroughRate: number
  breakdownRate: number
}

interface BreakthroughStatsProps {
  userId?: string
  period?: 'daily' | 'weekly' | 'monthly'
  compact?: boolean
}

export function BreakthroughStats({ userId, period = 'daily', compact = false }: BreakthroughStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams({ period })
        if (userId) params.set('userId', userId)

        const res = await fetch(`/api/tasks/daily/stats?${params}`)
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch breakthrough stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [userId, period])

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-800/50 rounded-lg h-20"></div>
    )
  }

  if (!stats) return null

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-green-400 font-medium">{stats.breakthroughRate}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-red-400 font-medium">{stats.breakdownRate}%</span>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Breakthrough Stats</h3>
        <span className="text-xs text-slate-400 capitalize">{period}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Breakthrough Rate */}
        <div className="bg-green-500/10 rounded-lg p-3 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-green-400 font-medium">Breakthroughs</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-green-400">{stats.breakthroughRate}%</span>
            <span className="text-xs text-green-400">({stats.breakthroughs}/{stats.completed})</span>
          </div>
        </div>

        {/* Breakdown Rate */}
        <div className="bg-red-500/10 rounded-lg p-3 border border-red-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs text-red-400 font-medium">Breakdowns</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-red-400">{stats.breakdownRate}%</span>
            <span className="text-xs text-red-400">({stats.breakdowns}/{stats.completed})</span>
          </div>
        </div>
      </div>

      {/* Total completed */}
      <div className="mt-3 pt-3 border-t border-white/5 text-center">
        <span className="text-xs text-slate-400">
          {stats.completed} of {stats.total} tasks completed
        </span>
      </div>
    </div>
  )
}
