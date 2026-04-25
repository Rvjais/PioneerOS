'use client'

import { useState, useEffect } from 'react'

interface Approval {
  id: string
  project: string
  client: string
  deliverable: string
  submittedDate: string
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'
  reviewer: string
  feedback?: string
}

export default function WebClientApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await fetch('/api/deliverables/approvals')
        if (res.ok) {
          const data = await res.json()
          setApprovals(data.approvals || [])
        }
      } catch (error) {
        console.error('Failed to fetch approvals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchApprovals()
  }, [])

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length
  const approvedCount = approvals.filter(a => a.status === 'APPROVED').length
  const changesCount = approvals.filter(a => a.status === 'CHANGES_REQUESTED').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400'
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      case 'CHANGES_REQUESTED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Approvals</h1>
            <p className="text-indigo-200">Track approval status from clients</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Pending</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Changes Requested</p>
              <p className="text-3xl font-bold text-red-300">{changesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Awaiting Approval</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Approved</p>
          <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Changes Requested</p>
          <p className="text-3xl font-bold text-red-400">{changesCount}</p>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.map(approval => (
          <div key={approval.id} className={`glass-card rounded-xl border-2 p-4 ${
            approval.status === 'CHANGES_REQUESTED' ? 'border-red-200' :
            approval.status === 'PENDING' ? 'border-amber-200' :
            'border-white/10'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{approval.deliverable}</h3>
                <p className="text-sm text-slate-400">{approval.project} - {approval.client}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(approval.status)}`}>
                {approval.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
              <span>Submitted: {new Date(approval.submittedDate).toLocaleDateString('en-IN')}</span>
              <span>Reviewer: {approval.reviewer}</span>
            </div>

            {approval.feedback && (
              <div className={`p-3 rounded-lg ${
                approval.status === 'APPROVED' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <p className="text-sm font-medium text-slate-200 mb-1">Feedback:</p>
                <p className={`text-sm ${approval.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>
                  {approval.feedback}
                </p>
              </div>
            )}

            {approval.status === 'CHANGES_REQUESTED' && (
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20">
                  Start Fixing
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800/50">
                  View Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Required */}
      {changesCount > 0 && (
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <h3 className="font-semibold text-red-800 mb-2">Action Required</h3>
          <p className="text-sm text-red-400">
            {changesCount} deliverable(s) have changes requested by clients. Please review feedback and make necessary updates.
          </p>
        </div>
      )}
    </div>
  )
}
