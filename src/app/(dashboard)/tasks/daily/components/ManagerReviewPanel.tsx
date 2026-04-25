'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Task {
  id: string
  description: string
  activityType: string
  status: string
  plannedHours: number
  actualHours: number | null
  proofUrl: string | null
  deliverable: string | null
  clientName: string | null
  completedAt: string | null
  managerReviewed: boolean
  managerRating: number | null
  managerFeedback: string | null
  user: {
    id: string
    firstName: string
    lastName: string | null
  }
}

interface ManagerReviewPanelProps {
  tasks: Task[]
  onReviewComplete: () => void
}

export function ManagerReviewPanel({ tasks, onReviewComplete }: ManagerReviewPanelProps) {
  const [reviewingTask, setReviewingTask] = useState<Task | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 0, feedback: '' })
  const [saving, setSaving] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const pendingReviews = tasks.filter(
    (t) => t.status === 'COMPLETED' && t.proofUrl && !t.managerReviewed
  )

  const completedReviews = tasks.filter(
    (t) => t.status === 'COMPLETED' && t.managerReviewed
  )

  const handleSubmitReview = async () => {
    if (!reviewingTask || reviewForm.rating === 0) return

    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/daily/${reviewingTask.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewForm.rating,
          feedback: reviewForm.feedback,
        }),
      })

      if (res.ok) {
        setReviewingTask(null)
        setReviewForm({ rating: 0, feedback: '' })
        onReviewComplete()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      toast.error('Failed to submit review')
    } finally {
      setSaving(false)
    }
  }

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Needs Improvement'
      case 2:
        return 'Below Expectations'
      case 3:
        return 'Meets Expectations'
      case 4:
        return 'Exceeds Expectations'
      case 5:
        return 'Outstanding'
      default:
        return 'Select Rating'
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1:
        return 'text-red-500'
      case 2:
        return 'text-orange-500'
      case 3:
        return 'text-yellow-500'
      case 4:
        return 'text-green-500'
      case 5:
        return 'text-emerald-500'
      default:
        return 'text-slate-400'
    }
  }

  if (pendingReviews.length === 0 && completedReviews.length === 0) {
    return null
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <h2 className="text-lg font-semibold">Team Task Reviews</h2>
        <p className="text-sm text-amber-100">
          {pendingReviews.length} pending review{pendingReviews.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="divide-y divide-white/10">
          {pendingReviews.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {task.user.firstName} {task.user.lastName || ''}
                    </span>
                    <span className="text-xs text-slate-400">
                      {task.completedAt &&
                        new Date(task.completedAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 mt-1">{task.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded">
                      {task.activityType}
                    </span>
                    {task.clientName && (
                      <span className="text-xs text-slate-400">Client: {task.clientName}</span>
                    )}
                    <span className="text-xs text-slate-400">{task.actualHours || task.plannedHours}h</span>
                  </div>
                  {task.deliverable && (
                    <p className="text-xs text-slate-400 mt-1">
                      Delivered: {task.deliverable}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {task.proofUrl && (
                    <a
                      href={task.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10 rounded-lg flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      View Proof
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setReviewingTask(task)
                      setReviewForm({ rating: 0, feedback: '' })
                    }}
                    className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Reviews Summary */}
      {completedReviews.length > 0 && (
        <div className="px-4 py-3 bg-slate-900/40 border-t border-white/10">
          <p className="text-sm text-slate-300">
            <span className="font-medium text-green-400">{completedReviews.length}</span> task
            {completedReviews.length !== 1 ? 's' : ''} reviewed today
          </p>
        </div>
      )}

      {/* Review Modal */}
      {reviewingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-white">
              <h3 className="text-lg font-semibold">Review Task</h3>
              <p className="text-sm text-amber-100">
                {reviewingTask.user.firstName} {reviewingTask.user.lastName || ''}
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Task Details */}
              <div className="bg-slate-900/40 rounded-lg p-4">
                <p className="text-sm font-medium text-white">{reviewingTask.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-white/10 text-slate-300 rounded">
                    {reviewingTask.activityType}
                  </span>
                  <span className="text-xs text-slate-400">
                    {reviewingTask.actualHours || reviewingTask.plannedHours}h
                  </span>
                </div>
                {reviewingTask.deliverable && (
                  <p className="text-xs text-slate-300 mt-2">
                    <span className="font-medium">Delivered:</span> {reviewingTask.deliverable}
                  </p>
                )}
                {reviewingTask.proofUrl && (
                  <a
                    href={reviewingTask.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    View Proof
                  </a>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || reviewForm.rating)
                            ? 'text-yellow-400'
                            : 'text-slate-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className={`text-sm mt-1 font-medium ${getRatingColor(hoveredRating || reviewForm.rating)}`}>
                  {getRatingLabel(hoveredRating || reviewForm.rating)}
                </p>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  placeholder="Add comments about the work quality, suggestions for improvement, or appreciation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-sm text-white glass-card placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-900/40 flex items-center justify-end gap-3">
              <button
                onClick={() => setReviewingTask(null)}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={saving || reviewForm.rating === 0}
                className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
