'use client'

import { useState } from 'react'

interface DesignItem {
  id: string
  title: string
  description?: string | null
  phase: string
  status: string
  createdAt: string
  project: { id: string; name: string; client: { id: string; name: string } }
  assignedTo?: { id: string; firstName: string; lastName: string } | null
}

interface Project {
  id: string
  name: string
  client: { id: string; name: string }
}

interface Stats {
  pending: number
  inProgress: number
  total: number
}

export function WebDesignQueueClient({
  initialQueue,
  projects,
  stats,
  isManager,
}: {
  initialQueue: DesignItem[]
  projects: Project[]
  stats: Stats
  isManager: boolean
}) {
  const [queue] = useState<DesignItem[]>(initialQueue)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = queue.filter(item => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.project.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Design Queue</h1>
          <p className="text-slate-500 mt-1">Pending and in-progress design tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{stats.total}</p>
          <p className="text-sm text-slate-500">Total Items</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-slate-500">Pending</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          <p className="text-sm text-slate-500">In Progress</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>No design items found</p>
            </div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    item.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.status === 'PENDING' ? 'Pending' : 'In Progress'}
                  </span>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white">{item.title || 'Unnamed Design Item'}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {item.project.name} — {item.project.client.name}
                </p>
                {item.assignedTo && (
                  <p className="text-xs text-slate-400 mt-1">Assigned to: {item.assignedTo.firstName}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
