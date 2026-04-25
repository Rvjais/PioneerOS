'use client'

import { useState } from 'react'

interface QCReview {
  id: string
  task: string
  taskType: string
  client: string
  submittedBy: string
  submittedDate: string
  reviewer: string
  status: 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'
  feedback?: string
}

const QC_REVIEWS: QCReview[] = [
  { id: '1', task: 'Blog: Best Cardiologist Delhi', taskType: 'Content', client: 'Apollo Hospitals', submittedBy: 'Neha', submittedDate: '2024-03-11', reviewer: 'Priya', status: 'PENDING_REVIEW' },
  { id: '2', task: 'Mobile usability fix', taskType: 'Technical', client: 'MedPlus Clinics', submittedBy: 'Rahul', submittedDate: '2024-03-10', reviewer: 'Priya', status: 'PENDING_REVIEW' },
  { id: '3', task: 'Meta optimization - Service pages', taskType: 'On Page', client: 'MaxCare Clinic', submittedBy: 'Rahul', submittedDate: '2024-03-09', reviewer: 'Priya', status: 'RETURNED', feedback: 'Meta descriptions too short. Need 150-160 characters. Also missing target keywords in 3 pages.' },
  { id: '4', task: 'Blog: Health Tips for Summer', taskType: 'Content', client: 'WellnessHub', submittedBy: 'Neha', submittedDate: '2024-03-06', reviewer: 'Priya', status: 'APPROVED', feedback: 'Well-written content. Good keyword placement. Approved for publishing.' },
  { id: '5', task: 'Backlink submission - Health directories', taskType: 'Off Page', client: 'HealthFirst Labs', submittedBy: 'Amit', submittedDate: '2024-03-08', reviewer: 'Rahul', status: 'APPROVED', feedback: 'Good DA sites selected. All anchor texts look natural.' },
  { id: '6', task: 'Schema markup implementation', taskType: 'Technical', client: 'Apollo Hospitals', submittedBy: 'Rahul', submittedDate: '2024-03-05', reviewer: 'Priya', status: 'RETURNED', feedback: 'FAQ schema has errors. Use structured data testing tool to validate.' },
]

export default function SeoQCReviewPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredReviews = filter === 'all' ? QC_REVIEWS : QC_REVIEWS.filter(r => r.status === filter)

  const pendingCount = QC_REVIEWS.filter(r => r.status === 'PENDING_REVIEW').length
  const approvedCount = QC_REVIEWS.filter(r => r.status === 'APPROVED').length
  const returnedCount = QC_REVIEWS.filter(r => r.status === 'RETURNED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      case 'RETURNED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Content': return 'bg-emerald-500/20 text-emerald-400'
      case 'On Page': return 'bg-blue-500/20 text-blue-400'
      case 'Off Page': return 'bg-purple-500/20 text-purple-400'
      case 'Technical': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">QC Review</h1>
            <p className="text-teal-200">Quality control for SEO deliverables</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-teal-200 text-sm">Pending Review</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">Returned</p>
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
            review.status === 'PENDING_REVIEW' ? 'border-amber-200' : 'border-white/10'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{review.task}</h3>
                <p className="text-sm text-slate-400">{review.client}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(review.status)}`}>
                {review.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(review.taskType)}`}>
                {review.taskType}
              </span>
              <span>Submitted by: {review.submittedBy}</span>
              <span>Date: {new Date(review.submittedDate).toLocaleDateString('en-IN')}</span>
              <span>Reviewer: {review.reviewer}</span>
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
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-green-400 bg-green-500/10 rounded-lg opacity-50 cursor-not-allowed">
                  Approve
                </button>
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg opacity-50 cursor-not-allowed">
                  Return for Fix
                </button>
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg opacity-50 cursor-not-allowed">
                  Preview
                </button>
              </div>
            )}

            {review.status === 'RETURNED' && (
              <div className="mt-3">
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-teal-400 bg-teal-500/10 rounded-lg opacity-50 cursor-not-allowed">
                  Fix & Resubmit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QC Guidelines */}
      <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
        <h3 className="font-semibold text-teal-800 mb-3">SEO QC Checklist</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-teal-700">
          <div>
            <p className="font-medium mb-1">Content</p>
            <ul className="space-y-1">
              <li>- Keyword density 1-2%</li>
              <li>- 1500+ words</li>
              <li>- Proper headings (H1-H6)</li>
              <li>- Internal links added</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">On Page</p>
            <ul className="space-y-1">
              <li>- Meta title 50-60 chars</li>
              <li>- Meta desc 150-160 chars</li>
              <li>- Target keyword included</li>
              <li>- Alt tags for images</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Off Page</p>
            <ul className="space-y-1">
              <li>- DA 30+ sites</li>
              <li>- Relevant niche</li>
              <li>- Natural anchor text</li>
              <li>- Dofollow links</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Technical</p>
            <ul className="space-y-1">
              <li>- No console errors</li>
              <li>- Mobile responsive</li>
              <li>- Schema validated</li>
              <li>- Core Web Vitals pass</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
