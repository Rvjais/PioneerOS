'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface ApprovalGateProps {
  projectId: string
  phase: string
  status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'COMPLETED'
  requiresApproval: boolean
  approvalNotes?: string
  approvedAt?: string
  approvedBy?: { name: string; type: 'client' | 'team' }
  revisionCount: number
  checklistComplete: boolean
  deliverables?: { name: string; url: string; type: string }[]
  onRequestApproval?: () => void
  onApprove?: (notes: string) => void
  onRequestChanges?: (feedback: string) => void
  isClientView?: boolean
  canApprove?: boolean
}

const phaseDescriptions: Record<string, string> = {
  CONTENT: 'Review and approve the content structure, sitemap, and brand guidelines.',
  DESIGN: 'Review design mockups and provide feedback on the visual direction.',
  MEDIA: 'Verify all media assets, images, and graphics are ready.',
  DEVELOPMENT: 'Technical review of the developed features and functionality.',
  TESTING: 'User acceptance testing and final quality verification.',
  DEPLOYMENT: 'Final approval before going live.',
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Not Started' },
  IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Progress' },
  IN_REVIEW: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Awaiting Approval' },
  APPROVED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approved' },
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completed' },
}

export function PhaseApprovalGate({
  projectId,
  phase,
  status,
  requiresApproval,
  approvalNotes,
  approvedAt,
  approvedBy,
  revisionCount,
  checklistComplete,
  deliverables = [],
  onRequestApproval,
  onApprove,
  onRequestChanges,
  isClientView = false,
  canApprove = false,
}: ApprovalGateProps) {
  const [feedback, setFeedback] = useState('')
  const [approvalComment, setApprovalComment] = useState('')
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const statusStyle = statusColors[status] || statusColors.PENDING
  const canRequestApproval = status === 'IN_PROGRESS' && checklistComplete && requiresApproval

  const handleRequestApproval = async () => {
    setLoading(true)
    try {
      await fetch(`/api/web/projects/${projectId}/phases/${phase}/request-approval`, {
        method: 'POST',
      })
      onRequestApproval?.()
    } catch (error) {
      console.error('Failed to request approval:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approvalComment.trim()) return
    setLoading(true)
    try {
      await fetch(`/api/web/projects/${projectId}/phases/${phase}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: approvalComment }),
      })
      onApprove?.(approvalComment)
      setShowApprovalForm(false)
      setApprovalComment('')
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!feedback.trim()) return
    setLoading(true)
    try {
      await fetch(`/api/web/projects/${projectId}/phases/${phase}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      onRequestChanges?.(feedback)
      setShowFeedbackForm(false)
      setFeedback('')
    } catch (error) {
      console.error('Failed to request changes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{phase} Phase Approval</h3>
            <p className="text-sm text-slate-400">{phaseDescriptions[phase]}</p>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Status Content */}
      <div className="p-4 space-y-4">
        {/* Checklist Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              checklistComplete ? 'bg-green-500/20' : 'bg-slate-500/20'
            }`}
          >
            {checklistComplete ? (
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-medium ${checklistComplete ? 'text-green-400' : 'text-white'}`}>
              Checklist {checklistComplete ? 'Complete' : 'In Progress'}
            </p>
            <p className="text-sm text-slate-400">
              {checklistComplete
                ? 'All required items have been completed'
                : 'Complete all required checklist items to proceed'}
            </p>
          </div>
        </div>

        {/* Deliverables */}
        {deliverables.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">Deliverables</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {deliverables.map((deliverable, index) => (
                <a
                  key={deliverable.url || `deliverable-${index}`}
                  href={deliverable.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    {deliverable.type === 'figma' ? (
                      <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zM12 2h3.5a3.5 3.5 0 110 7H12V2zm0 7v7h3.5a3.5 3.5 0 110-7H12zm-7 0A3.5 3.5 0 008.5 12.5 3.5 3.5 0 015 16v-7zm0 7a3.5 3.5 0 107 0 3.5 3.5 0 00-7 0z" />
                      </svg>
                    ) : deliverable.type === 'url' ? (
                      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{deliverable.name}</p>
                    <p className="text-xs text-slate-400">{deliverable.type}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Revision Count */}
        {revisionCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>
              {revisionCount} revision{revisionCount > 1 ? 's' : ''} made
            </span>
          </div>
        )}

        {/* Approval Info */}
        {(status === 'APPROVED' || status === 'COMPLETED') && approvedAt && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <div>
                <p className="font-medium text-green-400">Approved</p>
                <p className="text-sm text-slate-400">
                  By {approvedBy?.name || 'Unknown'} on {formatDateDDMMYYYY(approvedAt)}
                </p>
              </div>
            </div>
            {approvalNotes && <p className="mt-2 text-sm text-slate-300">&quot;{approvalNotes}&quot;</p>}
          </div>
        )}

        {/* Approval Request Form (for team) */}
        {!isClientView && canRequestApproval && (
          <button
            onClick={handleRequestApproval}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Requesting...' : 'Request Client Approval'}
          </button>
        )}

        {/* Client Approval Actions */}
        {isClientView && status === 'IN_REVIEW' && canApprove && (
          <div className="space-y-3">
            {!showApprovalForm && !showFeedbackForm && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalForm(true)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="flex-1 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Request Changes
                </button>
              </div>
            )}

            {/* Approval Comment Form */}
            {showApprovalForm && (
              <div className="space-y-3">
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Add any comments with your approval..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={loading || !approvalComment.trim()}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Approving...' : 'Confirm Approval'}
                  </button>
                  <button
                    onClick={() => {
                      setShowApprovalForm(false)
                      setApprovalComment('')
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Feedback Form */}
            {showFeedbackForm && (
              <div className="space-y-3">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe the changes you'd like to see..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleRequestChanges}
                    disabled={loading || !feedback.trim()}
                    className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                  <button
                    onClick={() => {
                      setShowFeedbackForm(false)
                      setFeedback('')
                    }}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Waiting for approval (client view when not in review) */}
        {isClientView && status !== 'IN_REVIEW' && status !== 'APPROVED' && status !== 'COMPLETED' && (
          <div className="p-3 bg-slate-700/30 rounded-lg">
            <p className="text-sm text-slate-400">
              {status === 'PENDING'
                ? 'This phase has not started yet.'
                : 'The team is working on this phase. You will be notified when approval is needed.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Phase progress tracker component
interface PhaseProgressTrackerProps {
  currentPhase: string
  phases: {
    phase: string
    status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'COMPLETED'
  }[]
}

const PHASE_ORDER = ['CONTENT', 'DESIGN', 'MEDIA', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT']

export function PhaseProgressTracker({ currentPhase, phases }: PhaseProgressTrackerProps) {
  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Project Progress</h3>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-slate-700 rounded-full" />

        {/* Phases */}
        <div className="relative flex justify-between">
          {PHASE_ORDER.map((phaseName, index) => {
            const phaseData = phases.find((p) => p.phase === phaseName)
            const status = phaseData?.status || 'PENDING'
            const isCurrent = phaseName === currentPhase
            const isCompleted = status === 'APPROVED' || status === 'COMPLETED'
            const isInProgress = status === 'IN_PROGRESS' || status === 'IN_REVIEW'

            return (
              <div key={phaseName} className="flex flex-col items-center relative z-10">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : isCurrent || isInProgress
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'bg-slate-800 border-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span
                      className={`text-xs font-bold ${isCurrent || isInProgress ? 'text-white' : 'text-slate-400'}`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Label */}
                <p
                  className={`mt-2 text-xs font-medium ${
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent || isInProgress
                        ? 'text-indigo-400'
                        : 'text-slate-500'
                  }`}
                >
                  {phaseName}
                </p>

                {/* Status */}
                {isCurrent && status === 'IN_REVIEW' && (
                  <span className="absolute -top-2 px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded">
                    Review
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
