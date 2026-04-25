'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import IssueTimeline from '@/client/components/issues/IssueTimeline'

type Issue = {
  id: string
  ticketNumber: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  type: 'REQUEST' | 'ISSUE' | 'FEEDBACK'
  client: { id: string; name: string } | null
  assignedTo: { id: string; firstName: string; lastName: string } | null
  activities: Array<{
    id: string
    type: string
    description: string
    createdAt: string
    metadata: string | null
    user: { id: string; firstName: string; lastName: string } | null
  }>
  createdAt: string
  updatedAt: string
}

type TeamMember = {
  id: string
  firstName: string
  lastName: string
  department: string
  role: string
}

type Activity = {
  id: string
  type: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'COMMENT' | 'CREATED'
  description: string
  user: string
  createdAt: string
  metadata?: {
    oldStatus?: string
    newStatus?: string
    comment?: string
  }
}

const statusColors = {
  OPEN: 'bg-blue-500/20 text-blue-400 border-blue-200',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-200',
  RESOLVED: 'bg-green-500/20 text-green-400 border-green-200',
  CLOSED: 'bg-slate-800/50 text-slate-200 border-white/10',
}

const priorityColors = {
  LOW: 'bg-slate-800/50 text-slate-300',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  URGENT: 'bg-red-500/20 text-red-400',
}

export default function IssueDetail({ issueId }: { issueId: string }) {
  const [issue, setIssue] = useState<Issue | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchIssue = useCallback(async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}`)
      if (!res.ok) throw new Error('Failed to fetch issue')
      const data = await res.json()
      setIssue(data.issue)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issue')
    }
  }, [issueId])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchIssue(),
        fetch('/api/users')
          .then(res => res.json())
          .then(data => setTeamMembers(Array.isArray(data) ? data : []))
          .catch(() => setTeamMembers([]))
      ])
      setLoading(false)
    }
    loadData()
  }, [fetchIssue])

  const handleStatusChange = async (newStatus: Issue['status']) => {
    if (!issue) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      await fetchIssue()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
    setIsUpdating(false)
  }

  const handleAssign = async (userId: string) => {
    if (!issue) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: userId }),
      })
      if (!res.ok) throw new Error('Failed to assign')
      await fetchIssue()
    } catch (err) {
      console.error('Failed to assign:', err)
    }
    setIsUpdating(false)
  }

  const handleAddComment = async () => {
    if (!comment.trim() || !issue) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/issues/${issueId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add comment')
      setComment('')
      await fetchIssue()
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
    setIsUpdating(false)
  }

  // Transform activities for timeline
  const activities: Activity[] = issue?.activities?.map(a => ({
    id: a.id,
    type: a.type as Activity['type'],
    description: a.description,
    user: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System',
    createdAt: a.createdAt,
    metadata: a.metadata ? JSON.parse(a.metadata) : undefined,
  })) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error || 'Issue not found'}</p>
        <Link href="/issues" className="text-blue-400 hover:underline mt-4 inline-block">
          Back to Issues
        </Link>
      </div>
    )
  }

  const assignedToName = issue.assignedTo
    ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
    : null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/issues" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
          &larr; Back to Issues
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-400">{issue.ticketNumber}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[issue.priority] || 'bg-slate-800/50 text-slate-300'}`}>
                {issue.priority}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">{issue.title}</h1>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColors[issue.status] || 'bg-slate-800/50 text-slate-200 border-white/10'}`}>
            {issue.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-3">Description</h2>
            <p className="text-slate-300 whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Timeline */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-4">Activity Timeline</h2>
            <IssueTimeline activities={activities} />
          </div>

          {/* Add Comment */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-3">Add Comment</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your comment..."
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleAddComment}
                disabled={!comment.trim() || isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Client</label>
                {issue.client ? (
                  <Link href={`/clients/${issue.client.id}`} className="text-blue-400 hover:underline">
                    {issue.client.name}
                  </Link>
                ) : (
                  <span className="text-slate-400">No client</span>
                )}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <p className="text-white">{issue.type}</p>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Created</label>
                <p className="text-white">{formatDate(issue.createdAt)}</p>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Last Updated</label>
                <p className="text-white">{formatDate(issue.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-4">Update Status</h2>
            <div className="grid grid-cols-2 gap-2">
              {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating || issue.status === status}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                    issue.status === status
                      ? statusColors[status]
                      : 'border-white/10 hover:bg-slate-900/40'
                  }`}
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Assignment */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-4">Assignment</h2>
            {assignedToName ? (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {assignedToName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-white">{assignedToName}</p>
                  <p className="text-xs text-slate-400">Currently assigned</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm mb-4">No one assigned yet</p>
            )}
            <div>
              <label className="block text-xs text-slate-400 mb-2">Reassign to</label>
              <select
                onChange={(e) => e.target.value && handleAssign(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Select team member</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} ({member.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-sm text-left text-slate-300 hover:bg-slate-900/40 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Client
              </button>
              <button className="w-full px-4 py-2 text-sm text-left text-slate-300 hover:bg-slate-900/40 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Call
              </button>
              <button className="w-full px-4 py-2 text-sm text-left text-slate-300 hover:bg-slate-900/40 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Escalate to Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
