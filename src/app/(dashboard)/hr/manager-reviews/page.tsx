'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface Manager {
  id: string
  firstName: string
  lastName: string
  department: string
}

interface Reviewer {
  id: string
  firstName: string
  lastName: string
}

interface Review {
  id: string
  managerId: string
  reviewerId: string
  quarter: number
  year: number
  status: string
  personalityRating: number | null
  commitmentRating: number | null
  behaviorRating: number | null
  leadershipRating: number | null
  communicationRating: number | null
  teamBuildingRating: number | null
  strengths: string | null
  areasForImprovement: string | null
  comments: string | null
  createdAt: string
  manager: Manager
  reviewer: Reviewer
}

interface ManagerAverage {
  count: number
  totalRating: number
}

const RATING_LABELS = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent']

export default function ManagerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [managerAverages, setManagerAverages] = useState<Record<string, ManagerAverage>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedManager, setSelectedManager] = useState<string>('')
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3))
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const [formData, setFormData] = useState({
    managerId: '',
    quarter: selectedQuarter,
    year: selectedYear,
    personalityRating: 4,
    commitmentRating: 4,
    behaviorRating: 4,
    leadershipRating: 4,
    communicationRating: 4,
    teamBuildingRating: 4,
    strengths: '',
    areasForImprovement: '',
    comments: '',
  })

  useEffect(() => {
    fetchReviews()
  }, [selectedManager, selectedQuarter, selectedYear])

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedManager) params.set('managerId', selectedManager)

      const res = await fetch(`/api/hr/manager-reviews?${params}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setManagers(data.managers || [])
      setManagerAverages(data.managerAverages || {})
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/hr/manager-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Review submitted successfully')
        setShowForm(false)
        setFormData({
          ...formData,
          managerId: '',
          strengths: '',
          areasForImprovement: '',
          comments: '',
        })
        fetchReviews()
      } else {
        toast.error('Failed to submit review')
      }
    } catch (error) {
      console.error('Error creating review:', error)
      toast.error('Failed to submit review')
    }
  }

  const getAverageRating = (review: Review) => {
    const ratings = [
      review.personalityRating,
      review.commitmentRating,
      review.behaviorRating,
      review.leadershipRating,
      review.communicationRating,
      review.teamBuildingRating,
    ].filter(r => r !== null) as number[]

    if (ratings.length === 0) return 0
    return ratings.reduce((a, b) => a + b, 0) / ratings.length
  }

  const RatingStars = ({ rating }: { rating: number | null }) => {
    if (rating === null) return <span className="text-slate-400">-</span>
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs text-slate-400 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manager Reviews</h1>
          <p className="text-slate-300">Quarterly behavior and leadership assessments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Review
        </button>
      </div>

      {/* Manager Overview Cards */}
      {managers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {managers.map(manager => {
            const avg = managerAverages[manager.id]
            const avgRating = avg ? avg.totalRating / avg.count : 0
            return (
              <div
                key={manager.id}
                onClick={() => setSelectedManager(manager.id === selectedManager ? '' : manager.id)}
                className={`glass-card rounded-xl border p-4 cursor-pointer transition-all hover:shadow-none ${
                  selectedManager === manager.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={{ id: manager.id, firstName: manager.firstName, lastName: manager.lastName }} size="lg" showPreview={false} />
                  <div>
                    <p className="font-semibold text-white">
                      {manager.firstName} {manager.lastName}
                    </p>
                    <p className="text-sm text-slate-400">{manager.department}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Avg Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-white">
                        {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                      </span>
                      <span className="text-slate-400">/5</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {avg?.count || 0} reviews
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reviews List */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Review History</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl">📋</span>
            <p className="mt-2 text-slate-300">No reviews found</p>
            <p className="text-sm text-slate-400">Create a new manager review to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {reviews.map(review => (
              <div key={review.id} className="p-4 hover:bg-slate-900/40">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {review.manager.firstName} {review.manager.lastName}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded text-xs">
                        Q{review.quarter} {review.year}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        review.status === 'COMPLETED'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Reviewed by {review.reviewer.firstName} {review.reviewer.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-white">
                        {getAverageRating(review).toFixed(1)}
                      </span>
                      <span className="text-slate-400">/5</span>
                    </div>
                    <p className="text-xs text-slate-400">Overall</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Personality</p>
                    <RatingStars rating={review.personalityRating} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Commitment</p>
                    <RatingStars rating={review.commitmentRating} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Behavior</p>
                    <RatingStars rating={review.behaviorRating} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Leadership</p>
                    <RatingStars rating={review.leadershipRating} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Communication</p>
                    <RatingStars rating={review.communicationRating} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Team Building</p>
                    <RatingStars rating={review.teamBuildingRating} />
                  </div>
                </div>

                {(review.strengths || review.areasForImprovement) && (
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    {review.strengths && (
                      <div className="bg-green-500/10 rounded-lg p-3 border border-green-100">
                        <p className="text-xs text-green-400 font-medium mb-1">Strengths</p>
                        <p className="text-sm text-slate-200">{review.strengths}</p>
                      </div>
                    )}
                    {review.areasForImprovement && (
                      <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-100">
                        <p className="text-xs text-amber-400 font-medium mb-1">Areas for Improvement</p>
                        <p className="text-sm text-slate-200">{review.areasForImprovement}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Review Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card rounded-xl w-full max-w-2xl my-8">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">New Manager Review</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-300" title="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Manager</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                    required
                  >
                    <option value="">Select manager...</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Quarter</label>
                  <select
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                  >
                    {[1, 2, 3, 4].map(q => (
                      <option key={q} value={q}>Q{q}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                  >
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-200">Ratings (1-5)</h3>
                {[
                  { key: 'personalityRating', label: 'Personality' },
                  { key: 'commitmentRating', label: 'Commitment' },
                  { key: 'behaviorRating', label: 'Behavior' },
                  { key: 'leadershipRating', label: 'Leadership' },
                  { key: 'communicationRating', label: 'Communication' },
                  { key: 'teamBuildingRating', label: 'Team Building' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{label}</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData({ ...formData, [key]: rating })}
                          className={`w-8 h-8 rounded-full border ${
                            (formData as Record<string, number | string>)[key] as number === rating
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-white/20 text-slate-300 hover:border-blue-400'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                      <span className="text-xs text-slate-400 ml-2 w-20">
                        {RATING_LABELS[(formData as Record<string, number | string>)[key] as number - 1]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Strengths</label>
                  <textarea
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg resize-none"
                    rows={3}
                    placeholder="Key strengths observed..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Areas for Improvement</label>
                  <textarea
                    value={formData.areasForImprovement}
                    onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg resize-none"
                    rows={3}
                    placeholder="Areas that need work..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Additional Comments</label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg resize-none"
                  rows={2}
                  placeholder="Any other observations..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
