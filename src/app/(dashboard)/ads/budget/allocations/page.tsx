'use client'

import { useState, useEffect } from 'react'

interface BudgetAllocation {
  id: string
  client: string | { name: string }
  totalBudget: number
  metaBudget: number
  googleBudget: number
  metaSpent: number
  googleSpent: number
  remainingBudget: number
  utilizationRate: number
  billingCycle: string
  nextRenewal: string
  allocatedAmount?: number
  spentAmount?: number
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl border border-white/10 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div>
          <div className="bg-slate-700/50 rounded h-6 w-40 mb-2" />
          <div className="bg-slate-700/50 rounded h-4 w-32" />
        </div>
        <div className="bg-slate-700/50 rounded h-9 w-20" />
      </div>
      <div className="bg-slate-700/50 rounded-full h-3 w-full mb-4" />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded h-20" />
        <div className="bg-slate-700/50 rounded h-20" />
      </div>
    </div>
  )
}

export default function BudgetAllocationsPage() {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    async function fetchBudgets() {
      try {
        setLoading(true)
        const res = await fetch(`/api/ads/budget?month=${selectedMonth}`)
        if (!res.ok) throw new Error('Failed to fetch budgets')
        const data = await res.json()
        const items = Array.isArray(data) ? data : data.allocations || data.budgets || []
        // Calculate utilization from real data if not provided
        const processed = items.map((item: BudgetAllocation) => {
          const totalBudget = item.totalBudget || item.allocatedAmount || 0
          const metaSpent = item.metaSpent || 0
          const googleSpent = item.googleSpent || 0
          const totalSpent = item.spentAmount || (metaSpent + googleSpent)
          const remaining = item.remainingBudget ?? (totalBudget - totalSpent)
          const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
          return {
            ...item,
            remainingBudget: remaining,
            utilizationRate: item.utilizationRate ?? utilization,
          }
        })
        setAllocations(processed)
      } catch (err) {
        setError('Failed to load budget data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [selectedMonth])

  const getClientName = (client: string | { name: string } | undefined) => {
    if (!client) return 'Unknown'
    if (typeof client === 'string') return client
    return client.name
  }

  const totalBudget = allocations.reduce((sum, a) => sum + (a.totalBudget || 0), 0)
  const totalSpent = allocations.reduce((sum, a) => sum + (a.metaSpent || 0) + (a.googleSpent || 0), 0)
  const totalRemaining = allocations.reduce((sum, a) => sum + (a.remainingBudget || 0), 0)
  const avgUtilization = allocations.length > 0 ? Math.round(allocations.reduce((sum, a) => sum + (a.utilizationRate || 0), 0) / allocations.length) : 0

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-400'
    if (rate >= 70) return 'text-green-400'
    if (rate >= 50) return 'text-blue-400'
    return 'text-amber-400'
  }

  const getUtilizationBg = (rate: number) => {
    if (rate >= 90) return 'bg-red-500'
    if (rate >= 70) return 'bg-green-500'
    if (rate >= 50) return 'bg-blue-500'
    return 'bg-amber-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Budget Allocations</h1>
            <p className="text-red-200">Manage ad budgets across clients and platforms</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              style={{ colorScheme: 'dark' }}
            />
            <button disabled title="Coming soon" className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium opacity-50 cursor-not-allowed">
              + Add Budget
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Budget ({selectedMonth})</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-20" /> : (
            <p className="text-3xl font-bold text-slate-200">₹{(totalBudget / 100000).toFixed(1)}L</p>
          )}
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-red-400">Total Spent</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-20" /> : (
            <p className="text-3xl font-bold text-red-400">₹{(totalSpent / 100000).toFixed(1)}L</p>
          )}
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-green-400">Remaining Budget</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-20" /> : (
            <p className="text-3xl font-bold text-green-400">₹{(totalRemaining / 100000).toFixed(1)}L</p>
          )}
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
          <p className="text-sm text-blue-400">Avg Utilization</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-blue-400">{avgUtilization}%</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Budget Cards */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
        ) : allocations.length === 0 ? (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center text-slate-400">
            No budget allocations found for {selectedMonth}
          </div>
        ) : (
          allocations.map(allocation => (
            <div key={allocation.id} className="glass-card rounded-xl border border-white/10 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">{getClientName(allocation.client)}</h3>
                  <p className="text-sm text-slate-400">
                    {allocation.billingCycle || 'MONTHLY'} billing
                    {allocation.nextRenewal && ` • Renews ${new Date(allocation.nextRenewal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">₹{((allocation.totalBudget || 0) / 100000).toFixed(1)}L</p>
                  <p className={`text-sm font-medium ${getUtilizationColor(allocation.utilizationRate)}`}>
                    {allocation.utilizationRate}% utilized
                  </p>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="mb-4">
                <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getUtilizationBg(allocation.utilizationRate)} rounded-full`}
                    style={{ width: `${Math.min(100, allocation.utilizationRate)}%` }}
                  />
                </div>
              </div>

              {/* Platform Split */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-400">Meta (FB + IG)</span>
                    <span className="text-xs text-blue-400">₹{((allocation.metaBudget || 0) / 1000).toFixed(0)}K budget</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-400">₹{((allocation.metaSpent || 0) / 1000).toFixed(0)}K</span>
                    <span className="text-sm text-blue-400">
                      {(allocation.metaBudget || 0) > 0 ? Math.round((allocation.metaSpent || 0) / allocation.metaBudget * 100) : 0}% spent
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-blue-500/20 rounded-full">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(100, (allocation.metaBudget || 0) > 0 ? (allocation.metaSpent || 0) / allocation.metaBudget * 100 : 0)}%` }}
                    />
                  </div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-400">Google Ads</span>
                    <span className="text-xs text-red-400">₹{((allocation.googleBudget || 0) / 1000).toFixed(0)}K budget</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-400">₹{((allocation.googleSpent || 0) / 1000).toFixed(0)}K</span>
                    <span className="text-sm text-red-400">
                      {(allocation.googleBudget || 0) > 0 ? Math.round((allocation.googleSpent || 0) / allocation.googleBudget * 100) : 0}% spent
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-red-500/20 rounded-full">
                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{ width: `${Math.min(100, (allocation.googleBudget || 0) > 0 ? (allocation.googleSpent || 0) / allocation.googleBudget * 100 : 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg opacity-50 cursor-not-allowed">
                  Adjust Budget
                </button>
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg opacity-50 cursor-not-allowed">
                  View Campaigns
                </button>
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg opacity-50 cursor-not-allowed">
                  Download Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
