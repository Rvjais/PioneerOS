'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface ClientApproval {
  id: string
  postTopic: string
  client: string
  platform: string
  postType: string
  sentBy: string
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'
  sentDate: string
  clientFeedback?: string
}

export default function ClientApprovalsPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [allApprovals, setAllApprovals] = useState<ClientApproval[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const approvals = filter === 'ALL' ? allApprovals : allApprovals.filter(a => a.status === filter)

  const fetchApprovals = useCallback(() => {
    setLoading(true)
    fetch('/api/social/approvals?type=CLIENT&limit=100')
      .then(res => res.json())
      .then(result => {
        const items = result.approvals || result.data || []
        const mapped: ClientApproval[] = items.map((item: any) => ({
          id: item.id,
          postTopic: item.title || item.postTopic || item.topic || '',
          client: item.client?.name || '',
          platform: item.platform || '',
          postType: item.contentType || item.postType || '',
          sentBy: item.reviewedBy?.name || '',
          status: item.status || 'PENDING',
          sentDate: item.createdAt || '',
          clientFeedback: item.reviewNote || undefined,
        }))
        setAllApprovals(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  const handleAction = async (id: string, action: 'APPROVED' | 'CHANGES_REQUESTED') => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/social/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      if (res.ok) {
        fetchApprovals()
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const filteredApprovals = approvals

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400'
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      case 'CHANGES_REQUESTED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'text-pink-600'
      case 'Facebook': return 'text-blue-400'
      case 'LinkedIn': return 'text-sky-700'
      default: return 'text-slate-300'
    }
  }

  const statusCounts = {
    pending: allApprovals.filter(a => a.status === 'PENDING').length,
    approved: allApprovals.filter(a => a.status === 'APPROVED').length,
    changesRequested: allApprovals.filter(a => a.status === 'CHANGES_REQUESTED').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Approvals</h1>
            <p className="text-pink-200">Content sent for client review</p>
          </div>
          <div className="text-right">
            <p className="text-pink-200 text-sm">Awaiting Response</p>
            <p className="text-3xl font-bold">{statusCounts.pending}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('PENDING')}
          className={`p-4 rounded-xl border transition-all ${filter === 'PENDING' ? 'bg-amber-500/20 border-amber-400' : 'bg-amber-500/10 border-amber-200 hover:border-amber-300'}`}
        >
          <p className="text-sm text-amber-400">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{statusCounts.pending}</p>
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`p-4 rounded-xl border transition-all ${filter === 'APPROVED' ? 'bg-green-500/20 border-green-400' : 'bg-green-500/10 border-green-200 hover:border-green-300'}`}
        >
          <p className="text-sm text-green-400">Approved</p>
          <p className="text-3xl font-bold text-green-400">{statusCounts.approved}</p>
        </button>
        <button
          onClick={() => setFilter('CHANGES_REQUESTED')}
          className={`p-4 rounded-xl border transition-all ${filter === 'CHANGES_REQUESTED' ? 'bg-red-500/20 border-red-400' : 'bg-red-500/10 border-red-200 hover:border-red-300'}`}
        >
          <p className="text-sm text-red-400">Changes Requested</p>
          <p className="text-3xl font-bold text-red-400">{statusCounts.changesRequested}</p>
        </button>
      </div>

      {/* Filter Reset */}
      {filter !== 'ALL' && (
        <button
          onClick={() => setFilter('ALL')}
          className="text-sm text-pink-600 hover:text-pink-800"
        >
          ← Show all approvals
        </button>
      )}

      {/* Approvals List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Client Approval Queue</h2>
        </div>
        <div className="divide-y divide-white/10">
          {filteredApprovals.map(approval => (
            <div key={approval.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{approval.postTopic}</h3>
                  <p className="text-sm text-slate-400">
                    {approval.client} • <span className={getPlatformColor(approval.platform)}>{approval.platform}</span> • {approval.postType}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(approval.status)}`}>
                  {approval.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                <span>Sent by: <span className="text-slate-200 font-medium">{approval.sentBy}</span></span>
                <span>Date: {new Date(approval.sentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
              {approval.clientFeedback && (
                <div className="p-2 bg-red-500/10 rounded-lg mt-2">
                  <p className="text-sm text-red-400">
                    <span className="font-medium">Client Feedback:</span> {approval.clientFeedback}
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {canEdit && approval.status === 'PENDING' && (
                  <button
                    disabled={actionLoading === approval.id}
                    className="px-3 py-1.5 text-sm font-medium text-pink-400 bg-pink-500/10 rounded-lg hover:bg-pink-500/20 disabled:opacity-50"
                  >
                    Send Reminder
                  </button>
                )}
                {canEdit && approval.status === 'CHANGES_REQUESTED' && (
                  <button
                    disabled={actionLoading === approval.id}
                    onClick={() => handleAction(approval.id, 'APPROVED')}
                    className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 disabled:opacity-50"
                  >
                    {actionLoading === approval.id ? 'Processing...' : 'Resubmit'}
                  </button>
                )}
                <button className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800/50">
                  View Content
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Notes */}
      <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
        <h3 className="font-semibold text-pink-800 mb-3">Client Approval Guidelines</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-pink-700">
          <div>
            <p className="font-medium mb-1">Response Time</p>
            <ul className="space-y-1">
              <li>• Send reminder after 24 hours</li>
              <li>• Follow up via WhatsApp</li>
              <li>• Escalate after 48 hours</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Client Preferences</p>
            <ul className="space-y-1">
              <li>• Apollo - Email approval OK</li>
              <li>• HealthFirst - WhatsApp only</li>
              <li>• Dr Sharma - Call preferred</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Change Handling</p>
            <ul className="space-y-1">
              <li>• Document all feedback</li>
              <li>• Update design/copy</li>
              <li>• Resubmit within 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
