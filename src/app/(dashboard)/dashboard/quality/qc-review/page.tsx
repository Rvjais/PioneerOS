'use client'

import { useState, useEffect } from 'react'

interface QCReview {
  id: string
  task: string
  project: string
  developer: string
  submittedDate: string
  status: 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'
  reviewer?: string
  feedback?: string
}

export default function WebQCReviewPage() {
  const [reviews, setReviews] = useState<QCReview[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/qc/reviews')
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
        }
      } catch (error) {
        console.error('Failed to fetch QC reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const handleReview = async (taskId: string, action: 'approve' | 'return', feedback?: string) => {
    try {
      const res = await fetch('/api/qc/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action, feedback }),
      })

      if (res.ok) {
        setReviews(reviews.map(r =>
          r.id === taskId
            ? { ...r, status: action === 'approve' ? 'APPROVED' as const : 'RETURNED' as const, feedback }
            : r
        ))
      }
    } catch (error) {
      console.error('Failed to update review:', error)
    }
  }

  const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.status === filter)

  const pendingCount = reviews.filter(r => r.status === 'PENDING_REVIEW').length
  const approvedCount = reviews.filter(r => r.status === 'APPROVED').length
  const returnedCount = reviews.filter(r => r.status === 'RETURNED').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      case 'RETURNED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">QC Review</h1>
            <p className="text-indigo-200">Quality control review queue</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Pending Review</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Returned</p>
              <p className="text-3xl font-bold text-red-300">{returnedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter(filter === 'PENDING_REVIEW' ? 'all' : 'PENDING_REVIEW')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'PENDING_REVIEW' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">Pending Review</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'APPROVED' ? 'all' : 'APPROVED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'APPROVED' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Approved</p>
          <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'RETURNED' ? 'all' : 'RETURNED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'RETURNED' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <p className="text-sm text-slate-400">Returned for Fix</p>
          <p className="text-3xl font-bold text-red-400">{returnedCount}</p>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <div key={review.id} className={`glass-card rounded-xl border-2 p-4 ${
            review.status === 'RETURNED' ? 'border-red-200' :
            review.status === 'PENDING_REVIEW' ? 'border-amber-200' :
            'border-white/10'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{review.task}</h3>
                <p className="text-sm text-slate-400">{review.project}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(review.status)}`}>
                {review.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
              <span>Developer: {review.developer}</span>
              <span>Submitted: {new Date(review.submittedDate).toLocaleDateString('en-IN')}</span>
              {review.reviewer && <span>Reviewer: {review.reviewer}</span>}
            </div>

            {review.feedback && (
              <div className={`p-3 rounded-lg ${
                review.status === 'APPROVED' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <p className="text-sm font-medium text-slate-200 mb-1">Feedback:</p>
                <p className={`text-sm ${review.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>
                  {review.feedback}
                </p>
              </div>
            )}

            {review.status === 'PENDING_REVIEW' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleReview(review.id, 'approve', 'Approved - meets quality standards.')}
                  className="px-3 py-1.5 text-sm font-medium text-green-400 bg-green-500/10 rounded-lg hover:bg-green-500/20"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    const feedback = prompt('Enter feedback for revision:')
                    if (feedback) handleReview(review.id, 'return', feedback)
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                >
                  Return for Fix
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800/50">
                  Preview
                </button>
              </div>
            )}

            {review.status === 'RETURNED' && (
              <div className="mt-3">
                <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20">
                  Fix & Resubmit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QC Guidelines */}
      <div className="bg-indigo-500/10 rounded-xl border border-indigo-200 p-4">
        <h3 className="font-semibold text-indigo-800 mb-3">QC Checklist</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-indigo-700">
          <div>
            <p className="font-medium mb-1">Functionality</p>
            <ul className="space-y-1">
              <li>- All features working</li>
              <li>- Form validations</li>
              <li>- Links functional</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Design</p>
            <ul className="space-y-1">
              <li>- Matches mockup</li>
              <li>- Responsive on all devices</li>
              <li>- Cross-browser tested</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Performance</p>
            <ul className="space-y-1">
              <li>- Page speed optimized</li>
              <li>- Images compressed</li>
              <li>- No console errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
