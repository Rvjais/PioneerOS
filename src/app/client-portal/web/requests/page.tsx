'use client'

import React, { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ChangeRequest {
  id: string
  title: string
  description: string
  type: 'MINOR' | 'MAJOR' | 'FEATURE' | 'ENHANCEMENT'
  pageUrl: string | null
  screenshotUrl: string | null
  estimatedHours: number | null
  estimatedCost: number | null
  status: 'PENDING' | 'ESTIMATED' | 'CLIENT_APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  isBillable: boolean
  requiresApproval: boolean
  clientApprovedAt: string | null
  completedAt: string | null
  actualCost: number | null
  createdAt: string
  project: {
    name: string
  }
}

const typeDescriptions = {
  MINOR: 'Small text changes, color adjustments, minor tweaks',
  MAJOR: 'Layout changes, new sections, significant modifications',
  FEATURE: 'New functionality or feature addition',
  ENHANCEMENT: 'Improvements to existing features',
}

const typeCostHints = {
  MINOR: 'Usually quick and low cost',
  MAJOR: 'Typically requires several hours',
  FEATURE: 'May require significant development',
  ENHANCEMENT: 'Varies based on complexity',
}

export default function WebClientRequestsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all')

  // New request form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    type: 'MINOR' as 'MINOR' | 'MAJOR' | 'FEATURE' | 'ENHANCEMENT',
    pageUrl: '',
    screenshotUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/client-portal/web/requests')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/client-login')
          return
        }
        throw new Error('Failed to fetch requests')
      }
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRequest.title.trim() || !newRequest.description.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/client-portal/web/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      })

      if (!response.ok) throw new Error('Failed to submit request')

      await fetchRequests()
      setShowNewRequestForm(false)
      setNewRequest({
        title: '',
        description: '',
        type: 'MINOR',
        pageUrl: '',
        screenshotUrl: '',
      })
    } catch (error) {
      console.error('Error submitting request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveEstimate = async (requestId: string) => {
    try {
      const response = await fetch(`/api/client-portal/web/requests/${requestId}/approve`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to approve')
      await fetchRequests()
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error approving:', error)
    }
  }

  const handleRejectEstimate = async (requestId: string) => {
    try {
      const response = await fetch(`/api/client-portal/web/requests/${requestId}/reject`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to reject')
      await fetchRequests()
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error rejecting:', error)
    }
  }

  const filteredRequests = requests.filter((req) => {
    if (filter === 'pending') return ['PENDING', 'ESTIMATED'].includes(req.status)
    if (filter === 'approved') return ['CLIENT_APPROVED', 'IN_PROGRESS'].includes(req.status)
    if (filter === 'completed') return req.status === 'COMPLETED'
    return true
  })

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
    ESTIMATED: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    CLIENT_APPROVED: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    IN_PROGRESS: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400' },
    REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400' },
  }

  const typeColors: Record<string, { bg: string; text: string }> = {
    MINOR: { bg: 'bg-green-500/20', text: 'text-green-400' },
    MAJOR: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    FEATURE: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    ENHANCEMENT: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  }

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
              <h1 className="text-lg font-semibold text-white">Change Requests</h1>
            </div>
            <button
              onClick={() => setShowNewRequestForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + New Request
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'approved' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>

        {/* Info Banner for pending estimates */}
        {requests.some((r) => r.status === 'ESTIMATED') && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium">
                You have {requests.filter((r) => r.status === 'ESTIMATED').length} request(s) awaiting your approval
              </span>
            </div>
          </div>
        )}

        {/* Request List */}
        {filteredRequests.length === 0 ? (
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <p className="text-slate-400">
              {filter === 'all'
                ? "No change requests yet. Click 'New Request' to submit one."
                : `No ${filter} requests.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className={`bg-slate-800/50 border rounded-2xl p-4 cursor-pointer hover:border-indigo-500/50 ${
                  request.status === 'ESTIMATED' ? 'border-amber-500/50' : 'border-white/10'
                }`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{request.title}</h3>
                      {request.status === 'ESTIMATED' && (
                        <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full animate-pulse">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{request.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${statusColors[request.status]?.bg} ${statusColors[request.status]?.text}`}
                    >
                      {request.status === 'CLIENT_APPROVED'
                        ? 'Approved'
                        : request.status.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${typeColors[request.type]?.bg} ${typeColors[request.type]?.text}`}
                    >
                      {request.type}
                    </span>
                  </div>
                </div>

                {/* Estimate info if available */}
                {request.estimatedCost !== null && request.status !== 'PENDING' && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-slate-400">Estimated: </span>
                      <span className="text-white font-medium">
                        {request.estimatedHours}h • ₹{request.estimatedCost?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {request.isBillable && (
                      <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                        Billable
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 text-xs text-slate-500">
                  Submitted {formatDateDDMMYYYY(request.createdAt)}
                  {request.completedAt && ` • Completed ${formatDateDDMMYYYY(request.completedAt)}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Request Form Modal */}
      {showNewRequestForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Submit Change Request</h2>
                <button
                  onClick={() => setShowNewRequestForm(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Type of Change <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['MINOR', 'MAJOR', 'FEATURE', 'ENHANCEMENT'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewRequest({ ...newRequest, type })}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        newRequest.type === type
                          ? `${typeColors[type].bg} ${typeColors[type].text} border-current`
                          : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <p className="font-medium">{type}</p>
                      <p className="text-xs mt-1 opacity-75">{typeDescriptions[type]}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">{typeCostHints[newRequest.type]}</p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Request Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Brief description of what you need changed"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Detailed Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe exactly what changes you need. Be as specific as possible."
                  rows={5}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Page URL */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Page URL (optional)
                </label>
                <input
                  type="url"
                  value={newRequest.pageUrl}
                  onChange={(e) => setNewRequest({ ...newRequest, pageUrl: e.target.value })}
                  placeholder="https://yourwebsite.com/page"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Screenshot URL */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Reference Screenshot (optional)
                </label>
                <input
                  type="url"
                  value={newRequest.screenshotUrl}
                  onChange={(e) => setNewRequest({ ...newRequest, screenshotUrl: e.target.value })}
                  placeholder="Link to screenshot or mockup showing desired change"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Billing Notice */}
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-400">
                  <strong>Note:</strong> Some changes may be billable based on your maintenance
                  contract. We will provide an estimate before proceeding with any billable work.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewRequestForm(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newRequest.title.trim() || !newRequest.description.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${statusColors[selectedRequest.status]?.bg} ${statusColors[selectedRequest.status]?.text}`}
                  >
                    {selectedRequest.status === 'CLIENT_APPROVED'
                      ? 'Approved'
                      : selectedRequest.status.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${typeColors[selectedRequest.type]?.bg} ${typeColors[selectedRequest.type]?.text}`}
                  >
                    {selectedRequest.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white mt-4">{selectedRequest.title}</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                <p className="text-white whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>

              {/* Page URL */}
              {selectedRequest.pageUrl && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Page URL</h3>
                  <a
                    href={selectedRequest.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {selectedRequest.pageUrl}
                  </a>
                </div>
              )}

              {/* Estimate - if status is ESTIMATED and needs approval */}
              {selectedRequest.status === 'ESTIMATED' &&
                selectedRequest.estimatedCost !== null && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <h3 className="text-sm font-medium text-amber-400 mb-3">Estimate Ready for Approval</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated Hours:</span>
                        <span className="text-white font-medium">{selectedRequest.estimatedHours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated Cost:</span>
                        <span className="text-white font-medium">
                          ₹{selectedRequest.estimatedCost?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {selectedRequest.isBillable && (
                        <p className="text-xs text-amber-400 mt-2">
                          This change is billable and will be invoiced upon completion.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleApproveEstimate(selectedRequest.id)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve & Proceed
                      </button>
                      <button
                        onClick={() => handleRejectEstimate(selectedRequest.id)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

              {/* Cost summary for approved/completed */}
              {['CLIENT_APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(selectedRequest.status) &&
                selectedRequest.estimatedCost !== null && (
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Cost Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated:</span>
                        <span className="text-white">
                          ₹{selectedRequest.estimatedCost?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {selectedRequest.actualCost !== null && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Actual:</span>
                          <span className="text-white">
                            ₹{selectedRequest.actualCost?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Timeline */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-400">Submitted</span>
                    <span className="text-white">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedRequest.clientApprovedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-slate-400">Approved</span>
                      <span className="text-white">
                        {new Date(selectedRequest.clientApprovedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedRequest.completedAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-slate-400">Completed</span>
                      <span className="text-white">
                        {new Date(selectedRequest.completedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
