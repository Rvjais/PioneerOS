'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY, formatDateTimeIST } from '@/shared/utils/cn'
import { PRIORITY_STYLES, APPROVAL_TYPE_LABELS } from '@/shared/constants/portal'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface Approval {
  id: string
  title: string
  description: string | null
  type: string
  contentUrl: string | null
  previewUrl: string | null
  attachments: string[]
  priority: string
  status: string
  dueDate: string | null
  createdAt: string
  reviewedAt: string | null
  reviewNote: string | null
  revisionNotes: { note: string; timestamp: string; reviewer?: string }[]
}

interface Stats {
  pending: number
  approved: number
  rejected: number
  total: number
}

export default function PortalApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending')
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/client-portal/approvals')
      if (res.ok) {
        const data = await res.json()
        setApprovals(data.approvals)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDecision = async (decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED') => {
    if (!selectedApproval) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/client-portal/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApproval.id,
          decision,
          note: reviewNote,
        }),
      })

      if (res.ok) {
        setSelectedApproval(null)
        setReviewNote('')
        fetchApprovals()
      }
    } catch (error) {
      console.error('Failed to submit decision:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredApprovals = approvals.filter((approval) => {
    if (filter === 'pending') return approval.status === 'PENDING'
    if (filter === 'reviewed') return approval.status !== 'PENDING' && approval.status !== 'CANCELLED'
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">Pending</span>
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">Approved</span>
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">Rejected</span>
      case 'REVISION_REQUESTED':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">Revision Requested</span>
      case 'CANCELLED':
        return <span className="px-2 py-1 text-xs font-medium bg-slate-800/50 text-slate-200 rounded-full">Cancelled</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-slate-800/50 text-slate-200 rounded-full">{status}</span>
    }
  }

  if (loading) {
    return <PortalPageSkeleton titleWidth="w-36" statCards={3} listItems={4} />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageGuide
        pageKey="portal-approvals"
        title="Pending Approvals"
        description="Review and approve designs, content, and deliverables"
        steps={[
          { label: 'Review items', description: 'Click Review on any pending item to see its full details, attachments, and preview links' },
          { label: 'Provide feedback', description: 'Add a note with your comments before approving, requesting revisions, or rejecting' },
          { label: 'Approve or request changes', description: 'Use the Approve, Request Revision, or Reject buttons to submit your decision' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Approvals</h1>
          <p className="text-slate-300">Review and approve content from your marketing team</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            <div className="text-sm text-slate-400">Pending Review</div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-sm text-slate-400">Approved</div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-sm text-slate-400">Rejected</div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['pending', 'reviewed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {f === 'pending' ? 'Pending Review' : f === 'reviewed' ? 'Reviewed' : 'All'}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      {filteredApprovals.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">
            {filter === 'pending' ? 'No pending approvals' : 'No approvals found'}
          </h3>
          <p className="text-slate-400">
            {filter === 'pending' ? 'All caught up! Check back later for new items.' : 'Content requiring your approval will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="glass-card rounded-xl border border-white/10 p-6 hover:shadow-none transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{approval.title}</h3>
                    {getStatusBadge(approval.status)}
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${PRIORITY_STYLES[approval.priority]}`}>
                      {approval.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {APPROVAL_TYPE_LABELS[approval.type]}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDateDDMMYYYY(approval.createdAt)}
                    </span>
                    {approval.dueDate && (
                      <span className={`flex items-center gap-1 ${new Date(approval.dueDate) < new Date() ? 'text-red-500' : ''}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Due: {formatDateDDMMYYYY(approval.dueDate)}
                      </span>
                    )}
                  </div>
                  {approval.description && (
                    <p className="text-sm text-slate-300 line-clamp-2">{approval.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {approval.previewUrl && (
                    <a
                      href={approval.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-sm text-blue-400 border border-blue-200 rounded-lg hover:bg-blue-500/10 transition-colors"
                    >
                      Preview
                    </a>
                  )}
                  {approval.status === 'PENDING' && (
                    <button
                      onClick={() => setSelectedApproval(approval)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Review
                    </button>
                  )}
                  {approval.status !== 'PENDING' && (
                    <button
                      onClick={() => setSelectedApproval(approval)}
                      className="px-3 py-2 text-sm text-slate-300 border border-white/10 rounded-lg hover:bg-slate-900/40 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>

              {approval.attachments && approval.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-slate-400">{approval.attachments.length} attachment(s)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedApproval.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedApproval.status)}
                  <span className="text-sm text-slate-400">{APPROVAL_TYPE_LABELS[selectedApproval.type]}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedApproval(null)
                  setReviewNote('')
                }}
                aria-label="Close"
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedApproval.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-200 mb-1">Description</h3>
                <p className="text-sm text-slate-300">{selectedApproval.description}</p>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3 mb-4">
              {selectedApproval.contentUrl && (
                <a
                  href={selectedApproval.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Content
                </a>
              )}
              {selectedApproval.previewUrl && (
                <a
                  href={selectedApproval.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </a>
              )}
            </div>

            {/* Attachments */}
            {selectedApproval.attachments && selectedApproval.attachments.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-200 mb-2">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApproval.attachments.map((url, idx) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Attachment {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Revision Notes History */}
            {selectedApproval.revisionNotes && selectedApproval.revisionNotes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-200 mb-2">Revision History</h3>
                <div className="space-y-2">
                  {selectedApproval.revisionNotes.map((rev, idx) => (
                    <div key={`rev-${rev.timestamp}`} className="p-3 bg-slate-900/40 rounded-lg text-sm">
                      <p className="text-slate-300">{rev.note}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDateTimeIST(rev.timestamp)}
                        {rev.reviewer && ` by ${rev.reviewer}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Note (for completed reviews) */}
            {selectedApproval.reviewNote && selectedApproval.status !== 'PENDING' && (
              <div className="mb-4 p-3 bg-slate-900/40 rounded-lg">
                <h3 className="text-sm font-medium text-slate-200 mb-1">Your Review Note</h3>
                <p className="text-sm text-slate-300">{selectedApproval.reviewNote}</p>
                {selectedApproval.reviewedAt && (
                  <p className="text-xs text-slate-400 mt-1">
                    Reviewed on {formatDateTimeIST(selectedApproval.reviewedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Review Form (only for pending) */}
            {selectedApproval.status === 'PENDING' && (
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-medium text-slate-200 mb-2">Your Review <InfoTip text="Your feedback on this deliverable. Be specific about what to change or what looks good." type="action" /></h3>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add a note (optional for approval, required for rejection/revision)..."
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex gap-3 mt-4">
                  <InfoTip text="APPROVE = looks good, go live. REQUEST CHANGES = needs modifications before approval." />
                  <button
                    onClick={() => handleSubmitDecision('APPROVED')}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button
                    onClick={() => handleSubmitDecision('REVISION_REQUESTED')}
                    disabled={submitting || !reviewNote.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                    title={!reviewNote.trim() ? 'Please add a note' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleSubmitDecision('REJECTED')}
                    disabled={submitting || !reviewNote.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    title={!reviewNote.trim() ? 'Please add a note' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* Close button for reviewed items */}
            {selectedApproval.status !== 'PENDING' && (
              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={() => {
                    setSelectedApproval(null)
                    setReviewNote('')
                  }}
                  className="w-full px-4 py-2 border border-white/10 rounded-lg hover:bg-slate-900/40 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
