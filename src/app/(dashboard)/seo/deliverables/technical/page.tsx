'use client'

import { useState, useEffect } from 'react'

interface TechnicalDeliverable {
  id: string
  client: string
  issueType: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'IDENTIFIED' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED'
  assignedTo: string
  identifiedDate: string
  fixedDate?: string
}

export default function SeoTechnicalDeliverablesPage() {
  const [allItems, setAllItems] = useState<TechnicalDeliverable[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seo/tasks')
      .then(res => res.json())
      .then(data => {
        const tasks = (data.tasks || []).filter((t: any) => t.taskType === 'TECHNICAL')
        const mapped: TechnicalDeliverable[] = tasks.map((t: any) => ({
          id: t.id,
          client: t.client?.name || '-',
          issueType: t.category || 'Technical',
          description: t.description || '',
          priority: t.priority || 'MEDIUM',
          status: t.status === 'TODO' ? 'IDENTIFIED' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : t.status === 'REVIEW' ? 'FIXED' : t.status === 'DONE' ? 'VERIFIED' : 'IDENTIFIED',
          assignedTo: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : '-',
          identifiedDate: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '',
          fixedDate: t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : undefined,
        }))
        setAllItems(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const filteredItems = filter === 'all' ? allItems : allItems.filter(t => t.status === filter)

  const identifiedCount = allItems.filter(t => t.status === 'IDENTIFIED').length
  const inProgressCount = allItems.filter(t => t.status === 'IN_PROGRESS').length
  const fixedCount = allItems.filter(t => t.status === 'FIXED').length
  const verifiedCount = allItems.filter(t => t.status === 'VERIFIED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDENTIFIED': return 'bg-red-500/20 text-red-400'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'FIXED': return 'bg-amber-500/20 text-amber-400'
      case 'VERIFIED': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'Page Speed': return 'bg-red-500/20 text-red-400'
      case 'Schema Markup': return 'bg-purple-500/20 text-purple-400'
      case 'Broken Links': return 'bg-amber-500/20 text-amber-400'
      case 'Mobile Optimization': return 'bg-blue-500/20 text-blue-400'
      case 'Core Web Vitals': return 'bg-pink-500/20 text-pink-400'
      case 'Indexing Issues': return 'bg-indigo-500/20 text-indigo-400'
      case 'SSL/Security': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Technical SEO Deliverables</h1>
            <p className="text-teal-200">Track technical improvements and fixes</p>
          </div>
          <button disabled title="Coming soon" className="px-4 py-2 glass-card text-teal-600 rounded-lg font-medium opacity-50 cursor-not-allowed">
            + Add Issue
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter(filter === 'IDENTIFIED' ? 'all' : 'IDENTIFIED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'IDENTIFIED' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <p className="text-sm text-slate-400">Identified</p>
          <p className="text-3xl font-bold text-red-400">{identifiedCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 glass-card hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{inProgressCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'FIXED' ? 'all' : 'FIXED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'FIXED' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">Fixed</p>
          <p className="text-3xl font-bold text-amber-400">{fixedCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'VERIFIED' ? 'all' : 'VERIFIED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'VERIFIED' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Verified</p>
          <p className="text-3xl font-bold text-green-400">{verifiedCount}</p>
        </button>
      </div>

      {/* Technical Issues Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ISSUE TYPE</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">DESCRIPTION</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PRIORITY</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">ASSIGNED</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id} className={`border-b border-white/5 hover:bg-slate-900/40 ${
                item.priority === 'CRITICAL' ? 'bg-red-500/10' : ''
              }`}>
                <td className="py-3 px-4 text-sm font-medium text-white">{item.client}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getIssueTypeColor(item.issueType)}`}>
                    {item.issueType}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-300">{item.description}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-300">{item.assignedTo}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button disabled title="Coming soon" className="text-teal-600 text-sm font-medium opacity-50 cursor-not-allowed">
                    {item.status === 'IDENTIFIED' ? 'Start Fix' : item.status === 'FIXED' ? 'Verify' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
