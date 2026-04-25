'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getDeliverableStatusColor } from '@/shared/constants/portal'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface Deliverable {
  id: string
  category: string
  item: string
  quantity: number
  delivered: number
  status: string
  month: string
}

interface Summary {
  totalItems: number
  deliveredItems: number
  onTrackCount: number
  overDeliveryCount: number
  underDeliveryCount: number
}

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<Record<string, Deliverable[]>>({})
  const [summary, setSummary] = useState<Summary | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDeliverables()
    }, 300)
    return () => clearTimeout(timeout)
  }, [selectedCategory, selectedMonth])

  const fetchDeliverables = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedMonth) params.append('month', selectedMonth)

      const res = await fetch(`/api/client-portal/deliverables?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDeliverables(data.deliverables || {})
        setSummary(data.summary || null)
        setCategories(data.categories || [])
      } else {
        setError('Failed to load deliverables. Please try again.')
      }
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
      setError('Unable to connect to server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr)
    return formatDateDDMMYYYY(date)
  }

  const getProgressPercentage = (delivered: number, quantity: number) => {
    if (quantity === 0) return 0
    return Math.min(100, Math.round((delivered / quantity) * 100))
  }

  return (
    <div className="space-y-6">
      <PageGuide
        title="Deliverables"
        description="Track the progress of all deliverables across your active services."
        pageKey="portal-deliverables"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Deliverables</h1>
        <p className="text-slate-300 mt-1">Track your monthly deliverables and progress</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Total Items</p>
            <p className="text-2xl font-bold text-white">{summary.totalItems}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Delivered</p>
            <p className="text-2xl font-bold text-green-400">{summary.deliveredItems}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">On Track</p>
            <p className="text-2xl font-bold text-blue-400">{summary.onTrackCount}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Needs Attention</p>
            <p className="text-2xl font-bold text-amber-400">{summary.underDeliveryCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 glass-card"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <InfoTip text="Filter deliverables by service category" type="info" />
        </div>
        <div className="flex items-center gap-1">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 glass-card"
          aria-label="Filter by month"
        />
        <InfoTip text="View deliverables for a specific month" type="info" />
        </div>
        {(selectedCategory || selectedMonth) && (
          <button
            onClick={() => {
              setSelectedCategory('')
              setSelectedMonth('')
            }}
            className="px-4 py-2 text-slate-300 hover:text-white"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Deliverables by Month */}
      {loading ? (
        <PortalPageSkeleton titleWidth="w-40" statCards={3} listItems={5} />
      ) : error ? (
        <div className="glass-card rounded-xl p-8 text-center border border-red-500/20">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-1">Failed to Load Deliverables</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchDeliverables}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : Object.keys(deliverables).length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border border-white/10">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-1">No Deliverables Found</h3>
          <p className="text-slate-400">Your deliverables will appear here once they're added.</p>
        </div>
      ) : (
        Object.entries(deliverables).map(([month, items]) => (
          <div key={month} className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900/40 border-b border-white/10">
              <h3 className="font-semibold text-white">{formatMonth(month)}</h3>
            </div>
            <div className="divide-y divide-white/10">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-800/50 text-slate-300 rounded">
                          {item.category}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getDeliverableStatusColor(item.status)}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="font-medium text-white">{item.item}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {item.delivered} / {item.quantity}
                      </p>
                      <p className="text-sm text-slate-400">delivered</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === 'OVER_DELIVERY' ? 'bg-blue-500' :
                          item.status === 'ON_TRACK' ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${getProgressPercentage(item.delivered, item.quantity)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
