'use client'

import { useState, useEffect } from 'react'

interface MASHTask {
  id: string
  title: string
  description: string
  type: string
  severity: string
  status: string
  clientId: string | null
  clientName: string | null
  assigneeId: string | null
  assigneeName: string | null
  createdAt: string
}

export default function MASHTasksPage() {
  const [tasks, setTasks] = useState<MASHTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/issues')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.issues || [])
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false
    if (typeFilter !== 'all' && task.type !== typeFilter) return false
    return true
  })

  const openCount = tasks.filter(t => t.status === 'OPEN').length
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const resolvedCount = tasks.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CLIENT_COMPLAINT': return 'bg-red-500/20 text-red-400'
      case 'CAMPAIGN_FAILURE': return 'bg-orange-500/20 text-orange-400'
      case 'NEGATIVE_REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'MISSED_DEADLINE': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-red-500/20 text-red-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MASH Operations Tasks</h1>
            <p className="text-purple-200">Manager + Accounts + Sales + HR Control Center</p>
          </div>
          <button
            onClick={() => window.location.href = '/issues/new'}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Issues</p>
          <p className="text-3xl font-bold text-slate-200">{tasks.length}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Open</p>
          <p className="text-3xl font-bold text-red-400">{openCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">In Progress</p>
          <p className="text-3xl font-bold text-amber-400">{inProgressCount}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Resolved</p>
          <p className="text-3xl font-bold text-green-400">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {(['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
              }`}
            >
              {f === 'all' ? 'All Status' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Types</option>
          <option value="CLIENT_COMPLAINT">Client Complaint</option>
          <option value="CAMPAIGN_FAILURE">Campaign Failure</option>
          <option value="NEGATIVE_REVIEW">Negative Review</option>
          <option value="MISSED_DEADLINE">Missed Deadline</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
            <p className="text-slate-400">No tasks found matching your filters</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="glass-card rounded-xl border border-white/10 p-4 hover:shadow-none transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{task.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getSeverityColor(task.severity)}`}>
                      {task.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{task.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(task.type)}`}>
                      {task.type.replace(/_/g, ' ')}
                    </span>
                    {task.clientName && (
                      <span className="text-xs text-slate-400">
                        Client: <span className="font-medium text-slate-200">{task.clientName}</span>
                      </span>
                    )}
                    {task.assigneeName && (
                      <span className="text-xs text-slate-400">
                        Assigned: <span className="font-medium text-slate-200">{task.assigneeName}</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Created: {new Date(task.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded ${
                    task.status === 'OPEN' ? 'bg-red-500/20 text-red-400' :
                    task.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {task.status.replace(/_/g, ' ')}
                  </span>
                  {task.status !== 'RESOLVED' && task.status !== 'CLOSED' && (
                    <button className="text-sm text-purple-400 hover:underline">
                      Update
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MASH Guidelines */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-800 mb-3">MASH Task Guidelines</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-400">
          <div>
            <p className="font-medium mb-1">Issue Types</p>
            <ul className="space-y-1">
              <li>- Client Complaint: Direct client issues</li>
              <li>- Campaign Failure: Performance problems</li>
              <li>- Negative Review: Reputation issues</li>
              <li>- Missed Deadline: Delivery delays</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Severity Guidelines</p>
            <ul className="space-y-1">
              <li>- CRITICAL: Resolve immediately</li>
              <li>- HIGH: Resolve within 24 hours</li>
              <li>- MEDIUM: Resolve within 3 days</li>
              <li>- LOW: Resolve within 1 week</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
