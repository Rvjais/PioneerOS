'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface DesignApproval {
  id: string
  title: string
  description: string | null
  designUrl: string
  thumbnailUrl: string | null
  phase: string
  version: number
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'
  createdAt: string
  project: {
    name: string
  }
}

interface PhaseApproval {
  id: string
  phase: string
  status: string
  projectId: string
  deliverables: { name: string; url: string; type: string }[]
  project: {
    name: string
  }
}

export default function WebClientApprovalsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WebClientApprovalsContent />
    </Suspense>
  )
}

function WebClientApprovalsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [designApprovals, setDesignApprovals] = useState<DesignApproval[]>([])
  const [phaseApprovals, setPhaseApprovals] = useState<PhaseApproval[]>([])
  const [selectedDesign, setSelectedDesign] = useState<DesignApproval | null>(null)
  const [feedback, setFeedback] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)

  useEffect(() => {
    fetchApprovals()
  }, [])

  useEffect(() => {
    if (selectedId && designApprovals.length > 0) {
      const design = designApprovals.find((d) => d.id === selectedId)
      if (design) setSelectedDesign(design)
    }
  }, [selectedId, designApprovals])

  const fetchApprovals = async () => {
    try {
      const response = await fetch('/api/client-portal/web/approvals')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/client-login')
          return
        }
        throw new Error('Failed to fetch approvals')
      }
      const data = await response.json()
      setDesignApprovals(data.designApprovals || [])
      setPhaseApprovals(data.phaseApprovals || [])
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedDesign) return
    setSubmitting(true)
    try {
      const response = await fetch(`/api/client-portal/web/approvals/${selectedDesign.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: approvalNotes }),
      })
      if (!response.ok) throw new Error('Failed to approve')
      await fetchApprovals()
      setSelectedDesign(null)
      setShowApprovalModal(false)
      setApprovalNotes('')
    } catch (error) {
      console.error('Error approving:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!selectedDesign || !feedback.trim()) return
    setSubmitting(true)
    try {
      const response = await fetch(`/api/client-portal/web/approvals/${selectedDesign.id}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      if (!response.ok) throw new Error('Failed to submit feedback')
      await fetchApprovals()
      setSelectedDesign(null)
      setShowFeedbackModal(false)
      setFeedback('')
    } catch (error) {
      console.error('Error requesting changes:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const pendingDesigns = designApprovals.filter((d) => d.status === 'PENDING')
  const reviewedDesigns = designApprovals.filter((d) => d.status !== 'PENDING')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/client-portal/web" className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-semibold text-white">Design Approvals</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Approvals */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Pending Approvals ({pendingDesigns.length})
          </h2>

          {pendingDesigns.length === 0 ? (
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center">
              <svg
                className="w-12 h-12 text-slate-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-slate-400">No pending approvals. You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingDesigns.map((design) => (
                <div
                  key={design.id}
                  className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-colors"
                  onClick={() => setSelectedDesign(design)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-700/50 relative">
                    {design.thumbnailUrl ? (
                      <img
                        src={design.thumbnailUrl}
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs bg-amber-500/80 text-white rounded-full">
                      Needs Review
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{design.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{design.project.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">
                        {design.phase}
                      </span>
                      <span className="px-2 py-1 text-xs bg-slate-500/20 text-slate-400 rounded-full">
                        v{design.version}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviewed Designs */}
        {reviewedDesigns.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Previously Reviewed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviewedDesigns.map((design) => (
                <div
                  key={design.id}
                  className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden opacity-75"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-700/50 relative">
                    {design.thumbnailUrl ? (
                      <img
                        src={design.thumbnailUrl}
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${
                        design.status === 'APPROVED'
                          ? 'bg-green-500/80 text-white'
                          : 'bg-amber-500/80 text-white'
                      }`}
                    >
                      {design.status === 'APPROVED' ? 'Approved' : 'Changes Requested'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{design.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{design.project.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Design Preview Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedDesign.title}</h2>
                <p className="text-sm text-slate-400">
                  {selectedDesign.project.name} • {selectedDesign.phase} Phase • Version {selectedDesign.version}
                </p>
              </div>
              <button onClick={() => setSelectedDesign(null)} className="p-2 text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Design Preview */}
            <div className="p-4 max-h-[60vh] overflow-auto">
              <div className="bg-slate-800 rounded-lg p-2">
                {/* If it's a Figma URL, embed it */}
                {selectedDesign.designUrl.includes('figma.com') ? (
                  <iframe
                    src={selectedDesign.designUrl.replace('figma.com/file', 'figma.com/embed')}
                    className="w-full h-96"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={selectedDesign.designUrl}
                    alt={selectedDesign.title}
                    className="w-full rounded"
                  />
                )}
              </div>

              {selectedDesign.description && (
                <p className="mt-4 text-slate-300">{selectedDesign.description}</p>
              )}

              {/* External Link */}
              <a
                href={selectedDesign.designUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Open Full Design
              </a>
            </div>

            {/* Action Buttons */}
            {selectedDesign.status === 'PENDING' && (
              <div className="p-4 border-t border-white/10 flex justify-end gap-4">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Design
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Approve Design</h3>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes with your approval (optional)..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => {
                  setShowApprovalModal(false)
                  setApprovalNotes('')
                }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Request Changes</h3>
            <p className="text-sm text-slate-400 mb-4">
              Describe the changes you&apos;d like to see in the design. Be as specific as possible.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="E.g., Please make the header text larger, change the button color to blue..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => {
                  setShowFeedbackModal(false)
                  setFeedback('')
                }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={submitting || !feedback.trim()}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
