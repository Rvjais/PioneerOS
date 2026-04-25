'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  projectStatus: string | null
  progress: number | null
}

interface ClientProjectsProps {
  clients: Client[]
}

// Simple, clear status labels
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PLANNING: { label: 'Not Started', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  IN_PROGRESS: { label: 'Working On It', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  COMPLETED: { label: 'Done', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  ON_HOLD: { label: 'Paused', color: 'text-slate-300', bgColor: 'bg-slate-800/50' },
}

export function ClientProjects({ clients }: ClientProjectsProps) {
  const [filter, setFilter] = useState('ALL')

  const filteredClients = clients.filter((client) => {
    if (filter === 'ALL') return true
    return client.projectStatus === filter
  })

  // Count by status
  const counts = {
    total: clients.length,
    inProgress: clients.filter(c => c.projectStatus === 'IN_PROGRESS').length,
    completed: clients.filter(c => c.projectStatus === 'COMPLETED').length,
  }

  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Projects</h2>
          <p className="text-sm text-slate-400">Client website progress</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-blue-400 font-medium">{counts.inProgress} active</span>
          <span className="text-emerald-600 font-medium">{counts.completed} done</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex flex-wrap gap-2">
        {[
          { value: 'ALL', label: 'All' },
          { value: 'IN_PROGRESS', label: 'Working On It' },
          { value: 'PLANNING', label: 'Not Started' },
          { value: 'COMPLETED', label: 'Done' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === option.value
                ? 'bg-blue-600/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/50'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Project List */}
      <div className="divide-y divide-white/5">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400">No projects found</p>
          </div>
        ) : (
          filteredClients.slice(0, 6).map((client) => {
            const status = STATUS_CONFIG[client.projectStatus || 'IN_PROGRESS']
            const progress = client.progress || 0

            return (
              <Link
                key={client.id}
                href={`/web/clients/${client.id}`}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
              >
                {/* Client Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{client.name}</p>
                  <p className={`text-sm ${status.color}`}>{status.label}</p>
                </div>

                {/* Progress Bar */}
                <div className="w-32 hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-300 w-8">{progress}%</span>
                  </div>
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })
        )}
      </div>

      {/* View All Link */}
      {filteredClients.length > 6 && (
        <div className="p-4 border-t border-white/5 text-center">
          <Link href="/web/clients" className="text-sm text-blue-400 font-medium hover:underline">
            View all {filteredClients.length} projects
          </Link>
        </div>
      )}
    </div>
  )
}
