'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Escalation {
  id: string
  client: string
  issueType: 'DELAY' | 'QUALITY' | 'COMMUNICATION' | 'BILLING'
  description: string
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  assignedTo: string
  createdAt: string
  resolvedAt: string | null
  department: string
}

const ESCALATIONS: Escalation[] = [
  { id: '1', client: 'Apollo Hospitals', issueType: 'DELAY', description: 'Social media posts delayed by 5 days', status: 'OPEN', priority: 'HIGH', assignedTo: 'Priya Sharma', createdAt: '2024-03-10', resolvedAt: null, department: 'Social Media' },
  { id: '2', client: 'MedPlus Clinics', issueType: 'QUALITY', description: 'Website design not meeting expectations', status: 'UNDER_INVESTIGATION', priority: 'HIGH', assignedTo: 'Rahul Verma', createdAt: '2024-03-09', resolvedAt: null, department: 'Web Development' },
  { id: '3', client: 'HealthFirst Labs', issueType: 'COMMUNICATION', description: 'Account manager not responding timely', status: 'OPEN', priority: 'MEDIUM', assignedTo: 'Anita Desai', createdAt: '2024-03-08', resolvedAt: null, department: 'Accounts' },
  { id: '4', client: 'CareConnect', issueType: 'BILLING', description: 'Invoice discrepancy reported', status: 'RESOLVED', priority: 'LOW', assignedTo: 'Vikram Singh', createdAt: '2024-03-05', resolvedAt: '2024-03-07', department: 'Accounts' },
  { id: '5', client: 'WellnessHub', issueType: 'DELAY', description: 'SEO report not delivered on time', status: 'RESOLVED', priority: 'MEDIUM', assignedTo: 'Neha Gupta', createdAt: '2024-03-04', resolvedAt: '2024-03-06', department: 'SEO' },
]

export default function ClientEscalationsPage() {
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED'>('all')
  const [issueFilter, setIssueFilter] = useState<string>('all')

  const filteredEscalations = ESCALATIONS.filter(esc => {
    if (filter !== 'all' && esc.status !== filter) return false
    if (issueFilter !== 'all' && esc.issueType !== issueFilter) return false
    return true
  })

  const openCount = ESCALATIONS.filter(e => e.status === 'OPEN').length
  const investigatingCount = ESCALATIONS.filter(e => e.status === 'UNDER_INVESTIGATION').length
  const resolvedCount = ESCALATIONS.filter(e => e.status === 'RESOLVED').length

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'DELAY': return 'bg-amber-500/20 text-amber-400'
      case 'QUALITY': return 'bg-red-500/20 text-red-400'
      case 'COMMUNICATION': return 'bg-blue-500/20 text-blue-400'
      case 'BILLING': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Client Escalations</h1>
          <p className="text-sm text-slate-400">Track and resolve client issues</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Log Escalation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Open</p>
          <p className="text-3xl font-bold text-red-400">{openCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Under Investigation</p>
          <p className="text-3xl font-bold text-amber-400">{investigatingCount}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Resolved</p>
          <p className="text-3xl font-bold text-green-400">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {(['all', 'OPEN', 'UNDER_INVESTIGATION', 'RESOLVED'] as const).map(f => (
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
          value={issueFilter}
          onChange={(e) => setIssueFilter(e.target.value)}
          className="px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Issue Types</option>
          <option value="DELAY">Delay</option>
          <option value="QUALITY">Quality Issue</option>
          <option value="COMMUNICATION">Communication</option>
          <option value="BILLING">Billing</option>
        </select>
      </div>

      {/* Escalations List */}
      <div className="space-y-4">
        {filteredEscalations.map(escalation => (
          <div key={escalation.id} className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white">{escalation.client}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getIssueColor(escalation.issueType)}`}>
                    {escalation.issueType}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    escalation.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                    escalation.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-800/50 text-slate-200'
                  }`}>
                    {escalation.priority}
                  </span>
                </div>
                <p className="text-slate-300 mb-2">{escalation.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Department: {escalation.department}</span>
                  <span>Assigned: {escalation.assignedTo}</span>
                  <span>Created: {new Date(escalation.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded ${
                  escalation.status === 'OPEN' ? 'bg-red-500/20 text-red-400' :
                  escalation.status === 'UNDER_INVESTIGATION' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {escalation.status.replace(/_/g, ' ')}
                </span>
                {escalation.status !== 'RESOLVED' && (
                  <button className="text-sm text-purple-400 hover:underline">
                    Update Status
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Tips */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-800 mb-2">Escalation Resolution Guidelines</h3>
        <ul className="text-sm text-purple-400 space-y-1">
          <li>- HIGH priority: Resolve within 24 hours</li>
          <li>- MEDIUM priority: Resolve within 48 hours</li>
          <li>- LOW priority: Resolve within 72 hours</li>
          <li>- Always communicate updates to the client</li>
        </ul>
      </div>
    </div>
  )
}
