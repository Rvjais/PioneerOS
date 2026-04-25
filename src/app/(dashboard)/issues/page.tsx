'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Issue = {
  id: string
  ticketNumber: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  type: 'REQUEST' | 'ISSUE' | 'FEEDBACK'
  clientName: string
  clientId: string
  assignedTo: string | null
  assignedToName: string | null
  createdAt: string
  updatedAt: string
}

interface RawIssue {
  id: string
  ticketNumber: string
  title: string
  description?: string
  status: string
  priority: string
  type: string
  clientId: string
  client?: { name: string }
  assignedTo?: { id: string; firstName: string; lastName?: string }
  createdAt: string
  updatedAt: string
}

const statusColors = {
  OPEN: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-400',
  RESOLVED: 'bg-green-500/20 text-green-400',
  CLOSED: 'bg-slate-800/50 text-slate-200',
}

const priorityColors = {
  LOW: 'bg-slate-800/50 text-slate-300',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  URGENT: 'bg-red-500/20 text-red-400',
}

export default function IssuesPage() {
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('all')
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues')
      if (res.ok) {
        const data = await res.json()
        const issuesList = Array.isArray(data) ? data : (data.issues || [])
        setIssues(issuesList.map((issue: RawIssue) => ({
          id: issue.id,
          ticketNumber: issue.ticketNumber,
          title: issue.title,
          description: issue.description || '',
          status: issue.status,
          priority: issue.priority,
          type: issue.type,
          clientName: issue.client?.name || 'Unknown Client',
          clientId: issue.clientId,
          assignedTo: issue.assignedTo?.id || null,
          assignedToName: issue.assignedTo ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName || ''}`.trim() : null,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues = issues.filter((issue) => {
    if (filter !== 'all' && issue.status !== filter) return false
    if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false
    return true
  })

  const stats = {
    open: issues.filter((i) => i.status === 'OPEN').length,
    inProgress: issues.filter((i) => i.status === 'IN_PROGRESS').length,
    resolved: issues.filter((i) => i.status === 'RESOLVED').length,
    urgent: issues.filter((i) => i.priority === 'URGENT' && i.status !== 'CLOSED').length,
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Issues & Escalations</h1>
          <p className="text-slate-400 mt-1">Manage client issues and support requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-400">{loading ? '...' : stats.open}</p>
              <p className="text-sm text-slate-400">Open</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-400">{loading ? '...' : stats.inProgress}</p>
              <p className="text-sm text-slate-400">In Progress</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-400">{loading ? '...' : stats.resolved}</p>
              <p className="text-sm text-slate-400">Resolved</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-400">{loading ? '...' : stats.urgent}</p>
              <p className="text-sm text-slate-400">Urgent</p>
            </div>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ colorScheme: 'dark' }}
            >
              <option value="all" className="bg-slate-800 text-white">All Status</option>
              <option value="OPEN" className="bg-slate-800 text-white">Open</option>
              <option value="IN_PROGRESS" className="bg-slate-800 text-white">In Progress</option>
              <option value="RESOLVED" className="bg-slate-800 text-white">Resolved</option>
              <option value="CLOSED" className="bg-slate-800 text-white">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ colorScheme: 'dark' }}
            >
              <option value="all" className="bg-slate-800 text-white">All Priority</option>
              <option value="URGENT" className="bg-slate-800 text-white">Urgent</option>
              <option value="HIGH" className="bg-slate-800 text-white">High</option>
              <option value="MEDIUM" className="bg-slate-800 text-white">Medium</option>
              <option value="LOW" className="bg-slate-800 text-white">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">Loading issues...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No issues found matching your filters</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="block p-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono text-slate-400">{issue.ticketNumber}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[issue.priority]}`}>
                        {issue.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[issue.status]}`}>
                        {issue.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="font-medium text-white mt-1 truncate">{issue.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{issue.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Client: {issue.clientName}</span>
                      {issue.assignedToName && <span>Assigned: {issue.assignedToName}</span>}
                      <span>Created: {formatDate(issue.createdAt)}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
