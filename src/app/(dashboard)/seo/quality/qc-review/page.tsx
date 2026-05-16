'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { toast } from 'sonner'

interface QCReview {
  id: string
  task: string
  taskType: string
  client: string
  clientId?: string
  submittedBy: string
  submittedById?: string
  submittedDate: string
  reviewer: string
  reviewerId?: string
  status: 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED'
  feedback?: string
  priority?: string
  deadline?: string | null
}

interface Client {
  id: string
  name: string
}

export default function SeoQCReviewPage() {
  const [reviews, setReviews] = useState<QCReview[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<QCReview | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    taskTitle: '',
    taskType: 'Content',
    priority: 'MEDIUM',
    deadline: ''
  })

  useEffect(() => {
    fetchReviews()
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE&limit=100')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch {
      // silently fail
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/seo/qc-reviews')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (err) {
      console.error('Failed to fetch QC reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/qc-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create review')
      toast.success('QC Review added successfully')
      setShowAddModal(false)
      setFormData({ clientId: '', taskTitle: '', taskType: 'Content', priority: 'MEDIUM', deadline: '' })
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message || 'Error adding review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: string) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/qc-reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED', feedback: 'Approved during review.' })
      })
      if (!res.ok) throw new Error('Failed to approve')
      toast.success('Review approved successfully')
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message || 'Error approving review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async (id: string) => {
    const feedback = prompt('Enter rejection reason:')
    if (!feedback) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/qc-reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'RETURNED', feedback })
      })
      if (!res.ok) throw new Error('Failed to return')
      toast.success('Review returned for fixes')
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message || 'Error returning review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFixAndResubmit = async (id: string) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/qc-reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'PENDING_REVIEW', feedback: null })
      })
      if (!res.ok) throw new Error('Failed to resubmit')
      toast.success('Review resubmitted for QC')
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message || 'Error resubmitting review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (review: QCReview) => {
    setSelectedReview(review)
    setShowDetailsModal(true)
  }

  const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.status === filter)

  const pendingCount = reviews.filter(r => r.status === 'PENDING_REVIEW').length
  const approvedCount = reviews.filter(r => r.status === 'APPROVED').length
  const returnedCount = reviews.filter(r => r.status === 'RETURNED').length

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
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
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
          >
            + Add Review
          </button>
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
                <button
                  onClick={() => handleApprove(review.id)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm font-medium text-green-400 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReturn(review.id)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  Return for Fix
                </button>
                <button
                  onClick={() => handleViewDetails(review)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  View Details
                </button>
              </div>
            )}

            {review.status === 'RETURNED' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleFixAndResubmit(review.id)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm font-medium text-teal-400 bg-teal-500/10 rounded-lg hover:bg-teal-500/20 transition-colors disabled:opacity-50"
                >
                  Fix & Resubmit
                </button>
                <button
                  onClick={() => handleViewDetails(review)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        ))}
        {filteredReviews.length === 0 && (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
            <p className="text-slate-400">No QC reviews found</p>
          </div>
        )}
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

      {/* Add Review Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add QC Review" size="md">
        <form onSubmit={handleAddReview}>
          <ModalBody>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Client *</label>
              <select
                required
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
              >
                <option value="">Select a client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Task Title *</label>
              <input
                required
                type="text"
                value={formData.taskTitle}
                onChange={e => setFormData({...formData, taskTitle: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                placeholder="e.g. Blog: Best Cardiologist Delhi"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Task Type</label>
                <select
                  value={formData.taskType}
                  onChange={e => setFormData({...formData, taskType: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                >
                  <option value="Content">Content</option>
                  <option value="On Page">On Page</option>
                  <option value="Off Page">Off Page</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Deadline (optional)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 text-sm text-white bg-teal-600 rounded-lg disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Review'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="QC Review Details" size="md">
        <ModalBody>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Task</p>
                  <p className="font-medium text-white">{selectedReview.task}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="font-medium text-white">{selectedReview.client}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Task Type</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeColor(selectedReview.taskType)}`}>
                    {selectedReview.taskType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedReview.status)}`}>
                    {selectedReview.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Submitted By</p>
                  <p className="font-medium text-white">{selectedReview.submittedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Reviewer</p>
                  <p className="font-medium text-white">{selectedReview.reviewer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Submitted Date</p>
                  <p className="font-medium text-white">{new Date(selectedReview.submittedDate).toLocaleDateString('en-IN')}</p>
                </div>
                {selectedReview.deadline && (
                  <div>
                    <p className="text-sm text-slate-400">Deadline</p>
                    <p className="font-medium text-white">{new Date(selectedReview.deadline).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
              </div>
              {selectedReview.feedback && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  <p className="text-sm text-slate-400 mb-1">Feedback</p>
                  <p className="text-white">{selectedReview.feedback}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {selectedReview?.status === 'PENDING_REVIEW' && (
            <div className="flex gap-2 mr-auto">
              <button
                onClick={() => { handleApprove(selectedReview.id); setShowDetailsModal(false) }}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => { handleReturn(selectedReview.id); setShowDetailsModal(false) }}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Return for Fix
              </button>
            </div>
          )}
          <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Close</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}