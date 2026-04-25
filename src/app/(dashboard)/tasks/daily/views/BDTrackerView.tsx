'use client'

import { useState } from 'react'

interface Lead {
  id: string
  companyName: string
  contactName: string
  stage: string
  value: number | null
  nextFollowUp: string | null
  lastContactedAt: string | null
}

interface Task {
  id: string
  clientId: string | null
  client: { id: string; name: string } | null
  activityType: string
  description: string
  plannedHours: number
  actualHours: number | null
  status: string
  priority: string
  leadId?: string
  lead?: Lead
}

interface Props {
  tasks: Task[]
  leads: Lead[]
  onTaskClick?: (task: Task) => void
}

const STAGE_COLORS: Record<string, string> = {
  LEAD: 'bg-slate-800/50 text-slate-200',
  DISCOVERY_CALL: 'bg-blue-500/20 text-blue-400',
  PROPOSAL_SENT: 'bg-purple-500/20 text-purple-400',
  NEGOTIATION: 'bg-amber-500/20 text-amber-400',
  WON: 'bg-green-500/20 text-green-400',
  LOST: 'bg-red-500/20 text-red-400',
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-slate-800/50 text-slate-200',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
  BREAKDOWN: 'bg-red-500/20 text-red-400',
}

export function BDTrackerView({ tasks, leads, onTaskClick }: Props) {
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue'>('all')
  const [stageFilter, setStageFilter] = useState<string>('all')

  // Combine tasks with lead data
  const trackerData = tasks.map(task => {
    const lead = leads.find(l =>
      task.client?.name.toLowerCase().includes(l.companyName.toLowerCase()) ||
      l.companyName.toLowerCase().includes(task.client?.name.toLowerCase() || '')
    )
    return { ...task, lead }
  })

  const filteredData = trackerData.filter(item => {
    if (stageFilter !== 'all' && item.lead?.stage !== stageFilter) return false
    if (filter === 'overdue' && item.lead?.nextFollowUp) {
      return new Date(item.lead.nextFollowUp) < new Date()
    }
    return true
  })

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }

  const isOverdue = (dateStr: string | null | undefined) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  // Stats
  const totalValue = trackerData.reduce((sum, t) => sum + (t.lead?.value || 0), 0)
  const completedTasks = trackerData.filter(t => t.status === 'COMPLETED').length
  const overdueTasks = trackerData.filter(t => isOverdue(t.lead?.nextFollowUp)).length

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-purple-100 text-sm">Pipeline Value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-sm">Active Leads</p>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-green-100 text-sm">Completed Today</p>
          <p className="text-2xl font-bold">{completedTasks}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <p className="text-red-100 text-sm">Overdue Follow-ups</p>
          <p className="text-2xl font-bold">{overdueTasks}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 glass-card rounded-lg p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">Show:</span>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            className="px-3 py-1.5 border border-white/20 rounded-lg text-sm text-slate-200"
          >
            <option value="all">All Activities</option>
            <option value="today">Today Only</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">Stage:</span>
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-3 py-1.5 border border-white/20 rounded-lg text-sm text-slate-200"
          >
            <option value="all">All Stages</option>
            <option value="LEAD">Lead</option>
            <option value="DISCOVERY_CALL">Discovery Call</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* CRM Table */}
      <div className="glass-card rounded-xl shadow-none overflow-hidden border border-white/10">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
          <h2 className="font-semibold text-white">BD Activity Tracker</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Lead/Client</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Stage</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Activity</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Follow-up</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Deal Value</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No activities found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => onTaskClick?.(item)}
                    className={`border-b border-white/5 hover:bg-slate-900/40 cursor-pointer transition-colors ${
                      isOverdue(item.lead?.nextFollowUp) ? 'bg-red-500/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">
                          {item.lead?.companyName || item.client?.name || 'Internal'}
                        </p>
                        {item.lead?.contactName && (
                          <p className="text-xs text-slate-400">{item.lead.contactName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.lead?.stage ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${STAGE_COLORS[item.lead.stage] || 'bg-slate-800/50'}`}>
                          {item.lead.stage.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200">{item.description}</p>
                      <p className="text-xs text-slate-400">{item.activityType.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${isOverdue(item.lead?.nextFollowUp) ? 'text-red-400 font-medium' : 'text-slate-300'}`}>
                        {formatDate(item.lead?.nextFollowUp)}
                      </span>
                      {isOverdue(item.lead?.nextFollowUp) && (
                        <p className="text-xs text-red-500">Overdue</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">
                        {formatCurrency(item.lead?.value)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[item.status] || 'bg-slate-800/50'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
