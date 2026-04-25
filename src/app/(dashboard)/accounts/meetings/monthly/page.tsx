'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface MonthlyReview {
  id: string
  month: string
  totalExpectedRevenue: number
  totalCollected: number
  totalPending: number
  totalOverdue: number
  collectionRate: number
  activeClients: number
  newClients: number
  churnedClients: number
  departmentROISummary: Record<string, { revenue: number; expense: number; roi: number | null }> | null
  expenseByCategory: { salary: number; tools: number; freelancer: number; misc: number } | null
  status: string
  scheduledAt: string | null
  conductedAt: string | null
  notes: string | null
  actionItems: Array<{ task: string; owner: string; dueDate: string; status: string }> | null
  participants: string[] | null
}

export default function MonthlyReviewPage() {
  const [reviews, setReviews] = useState<MonthlyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<MonthlyReview | null>(null)
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString())

  const [createForm, setCreateForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    scheduledAt: '',
    participants: ''
  })

  useEffect(() => {
    fetchReviews()
  }, [yearFilter])

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams()
      if (yearFilter) params.append('year', yearFilter)

      const res = await fetch(`/api/accounts/meetings/monthly?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!createForm.month) {
      toast.error('Please select a month')
      return
    }

    try {
      const res = await fetch('/api/accounts/meetings/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: createForm.month,
          scheduledAt: createForm.scheduledAt || null,
          participants: createForm.participants
            ? createForm.participants.split(',').map(p => p.trim())
            : null
        })
      })

      if (res.ok) {
        setShowCreateModal(false)
        setCreateForm({
          month: new Date().toISOString().slice(0, 7),
          scheduledAt: '',
          participants: ''
        })
        fetchReviews()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create review')
      }
    } catch (error) {
      console.error('Failed to create review:', error)
      toast.error('Failed to create review')
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount.toFixed(0)}`
  }

  const formatMonth = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-blue-500/20 text-blue-800 border-blue-300',
      IN_PROGRESS: 'bg-amber-500/20 text-amber-800 border-amber-300',
      COMPLETED: 'bg-green-500/20 text-green-800 border-green-300',
      CANCELLED: 'bg-red-500/20 text-red-800 border-red-300'
    }
    return styles[status] || 'bg-slate-800/50 text-white'
  }

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400'
    if (rate >= 70) return 'text-emerald-600'
    if (rate >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monthly Reviews</h1>
          <p className="text-slate-400 text-sm mt-1">Track accounts performance with monthly review meetings</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/accounts"
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Dashboard
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Review
          </button>
        </div>
      </div>

      {/* Year Filter */}
      <div className="flex items-center gap-2">
        {[2024, 2025, 2026].map(year => (
          <button
            key={year}
            onClick={() => setYearFilter(year.toString())}
            className={`px-4 py-2 text-sm rounded-lg ${
              yearFilter === year.toString()
                ? 'bg-blue-600 text-white'
                : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.length === 0 ? (
          <div className="col-span-full glass-card rounded-xl border border-white/10 p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400">No monthly reviews found for {yearFilter}</p>
            <p className="text-sm text-slate-400 mt-1">Create a new review to track monthly performance</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              onClick={() => setSelectedReview(review)}
              className="glass-card rounded-xl border border-white/10 p-5 cursor-pointer hover:shadow-none transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{formatMonth(review.month)}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(review.status)}`}>
                  {review.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Expected</p>
                  <p className="font-semibold text-white">{formatCurrency(review.totalExpectedRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Collected</p>
                  <p className="font-semibold text-green-400">{formatCurrency(review.totalCollected)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Collection Rate</p>
                  <p className={`font-semibold ${getCollectionRateColor(review.collectionRate)}`}>
                    {review.collectionRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Active Clients</p>
                  <p className="font-semibold text-white">{review.activeClients}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  {review.newClients > 0 && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded">+{review.newClients} new</span>
                  )}
                  {review.churnedClients > 0 && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded">-{review.churnedClients} churned</span>
                  )}
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-3xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">{formatMonth(selectedReview.month)}</h2>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(selectedReview.status)}`}>
                  {selectedReview.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900/40 rounded-lg p-4">
                <p className="text-sm text-slate-400">Expected Revenue</p>
                <p className="text-xl font-bold text-white">{formatCurrency(selectedReview.totalExpectedRevenue)}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <p className="text-sm text-green-400">Collected</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(selectedReview.totalCollected)}</p>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-4">
                <p className="text-sm text-amber-400">Pending</p>
                <p className="text-xl font-bold text-amber-400">{formatCurrency(selectedReview.totalPending)}</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4">
                <p className="text-sm text-red-400">Overdue</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(selectedReview.totalOverdue)}</p>
              </div>
            </div>

            {/* Client Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-500/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{selectedReview.activeClients}</p>
                <p className="text-sm text-blue-400">Active Clients</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-400">+{selectedReview.newClients}</p>
                <p className="text-sm text-green-400">New Clients</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-400">-{selectedReview.churnedClients}</p>
                <p className="text-sm text-red-400">Churned</p>
              </div>
            </div>

            {/* Collection Rate */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Collection Rate</span>
                <span className={`font-bold ${getCollectionRateColor(selectedReview.collectionRate)}`}>
                  {selectedReview.collectionRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    selectedReview.collectionRate >= 90 ? 'bg-green-500' :
                    selectedReview.collectionRate >= 70 ? 'bg-emerald-500' :
                    selectedReview.collectionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, selectedReview.collectionRate)}%` }}
                />
              </div>
            </div>

            {/* Department ROI */}
            {selectedReview.departmentROISummary && Object.keys(selectedReview.departmentROISummary).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">Department ROI Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selectedReview.departmentROISummary).map(([dept, data]) => (
                    <div key={dept} className="bg-slate-900/40 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-400 mb-1">{dept}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-200">ROI:</span>
                        <span className={`font-semibold ${
                          data.roi === null ? 'text-slate-400' :
                          data.roi >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {data.roi !== null ? `${data.roi.toFixed(1)}%` : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expense by Category */}
            {selectedReview.expenseByCategory && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">Expense Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-purple-500/10 rounded-lg p-3">
                    <p className="text-xs text-purple-400">Salaries</p>
                    <p className="font-semibold text-purple-800">{formatCurrency(selectedReview.expenseByCategory.salary)}</p>
                  </div>
                  <div className="bg-cyan-50 rounded-lg p-3">
                    <p className="text-xs text-cyan-600">Tools</p>
                    <p className="font-semibold text-cyan-800">{formatCurrency(selectedReview.expenseByCategory.tools)}</p>
                  </div>
                  <div className="bg-orange-500/10 rounded-lg p-3">
                    <p className="text-xs text-orange-600">Freelancers</p>
                    <p className="font-semibold text-orange-800">{formatCurrency(selectedReview.expenseByCategory.freelancer)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-300">Misc</p>
                    <p className="font-semibold text-white">{formatCurrency(selectedReview.expenseByCategory.misc)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Items */}
            {selectedReview.actionItems && selectedReview.actionItems.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">Action Items</h4>
                <div className="space-y-2">
                  {selectedReview.actionItems.map((item, idx) => (
                    <div key={item.task} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg">
                      <input
                        type="checkbox"
                        checked={item.status === 'DONE'}
                        readOnly
                        className="w-4 h-4 rounded border-white/20"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-200">{item.task}</p>
                        <p className="text-xs text-slate-400">{item.owner} · Due: {item.dueDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants */}
            {selectedReview.participants && selectedReview.participants.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Participants</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReview.participants.map((p, idx) => (
                    <span key={`participant-${p}`} className="px-3 py-1 bg-slate-800/50 text-slate-200 text-sm rounded-full">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Info */}
            <div className="flex items-center gap-4 text-sm text-slate-400 border-t border-white/10 pt-4">
              {selectedReview.scheduledAt && (
                <span>Scheduled: {new Date(selectedReview.scheduledAt).toLocaleDateString('en-IN')}</span>
              )}
              {selectedReview.conductedAt && (
                <span>Conducted: {new Date(selectedReview.conductedAt).toLocaleDateString('en-IN')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Create Monthly Review</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Month *</label>
                <input
                  type="month"
                  value={createForm.month}
                  onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Schedule Meeting (optional)</label>
                <input
                  type="datetime-local"
                  value={createForm.scheduledAt}
                  onChange={(e) => setCreateForm({ ...createForm, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Participants (comma-separated)</label>
                <input
                  type="text"
                  value={createForm.participants}
                  onChange={(e) => setCreateForm({ ...createForm, participants: e.target.value })}
                  placeholder="e.g., Mahroof, Taps, Ahmed"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-400">
                Metrics will be automatically calculated from the selected month's data including payments, clients, and department expenses.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Create Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
