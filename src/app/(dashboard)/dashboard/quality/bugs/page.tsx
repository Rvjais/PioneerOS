'use client'

import { useState } from 'react'

interface Bug {
  id: string
  title: string
  project: string
  client: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'FIXING' | 'RESOLVED'
  reportedBy: string
  reportedDate: string
  assignedTo?: string
  description: string
}

const BUGS: Bug[] = [
  { id: '1', title: 'Footer overlaps content on mobile', project: 'MedPlus Landing Page', client: 'MedPlus Clinics', priority: 'HIGH', status: 'FIXING', reportedBy: 'QC Team', reportedDate: '2024-03-10', assignedTo: 'Aniket', description: 'On iPhone SE, the footer overlaps the contact section. Z-index issue suspected.' },
  { id: '2', title: 'Contact form not submitting', project: 'CareConnect Website', client: 'CareConnect', priority: 'CRITICAL', status: 'OPEN', reportedBy: 'Client', reportedDate: '2024-03-11', description: 'Contact form shows success but no email received. Backend API needs debugging.' },
  { id: '3', title: 'Images not loading on slow connection', project: 'Apollo Website Revamp', client: 'Apollo Hospitals', priority: 'MEDIUM', status: 'OPEN', reportedBy: 'QC Team', reportedDate: '2024-03-09', description: 'Large images fail to load on 3G. Need to implement progressive loading.' },
  { id: '4', title: 'Navigation dropdown closes too fast', project: 'Apollo Website Revamp', client: 'Apollo Hospitals', priority: 'LOW', status: 'RESOLVED', reportedBy: 'Client', reportedDate: '2024-03-05', assignedTo: 'Manish', description: 'Dropdown menu closes before user can click. Added hover delay.' },
  { id: '5', title: 'Page speed score below 60', project: 'HealthFirst Labs', client: 'HealthFirst Labs', priority: 'HIGH', status: 'FIXING', reportedBy: 'SEO Team', reportedDate: '2024-03-08', assignedTo: 'Shivam', description: 'PageSpeed Insights shows 58. Need to optimize JS bundles and images.' },
]

export default function WebBugFixPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredBugs = filter === 'all' ? BUGS : BUGS.filter(b => b.status === filter)

  const openCount = BUGS.filter(b => b.status === 'OPEN').length
  const fixingCount = BUGS.filter(b => b.status === 'FIXING').length
  const resolvedCount = BUGS.filter(b => b.status === 'RESOLVED').length
  const criticalCount = BUGS.filter(b => b.priority === 'CRITICAL' && b.status !== 'RESOLVED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500/20 text-red-400'
      case 'FIXING': return 'bg-amber-500/20 text-amber-400'
      case 'RESOLVED': return 'bg-green-500/20 text-green-400'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bug Fix Tracker</h1>
            <p className="text-red-100">Track and resolve bugs</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-red-100 text-sm">Open Bugs</p>
              <p className="text-3xl font-bold">{openCount}</p>
            </div>
            <div className="text-right">
              <p className="text-red-100 text-sm">Critical</p>
              <p className="text-3xl font-bold">{criticalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter(filter === 'OPEN' ? 'all' : 'OPEN')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'OPEN' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <p className="text-sm text-slate-400">Open</p>
          <p className="text-3xl font-bold text-red-400">{openCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'FIXING' ? 'all' : 'FIXING')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'FIXING' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">Fixing</p>
          <p className="text-3xl font-bold text-amber-400">{fixingCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'RESOLVED' ? 'all' : 'RESOLVED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'RESOLVED' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Resolved</p>
          <p className="text-3xl font-bold text-green-400">{resolvedCount}</p>
        </button>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Critical Bugs</p>
          <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
        </div>
      </div>

      {/* Bugs List */}
      <div className="space-y-4">
        {filteredBugs.map(bug => (
          <div key={bug.id} className={`glass-card rounded-xl border-2 p-4 ${
            bug.priority === 'CRITICAL' && bug.status !== 'RESOLVED' ? 'border-red-300' : 'border-white/10'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{bug.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(bug.priority)}`}>
                    {bug.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{bug.project} - {bug.client}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(bug.status)}`}>
                {bug.status}
              </span>
            </div>

            <p className="text-sm text-slate-300 mb-3 bg-slate-900/40 p-2 rounded">{bug.description}</p>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Reported by: {bug.reportedBy}</span>
              <span>Date: {new Date(bug.reportedDate).toLocaleDateString('en-IN')}</span>
              {bug.assignedTo && <span className="text-indigo-600">Assigned: {bug.assignedTo}</span>}
            </div>

            {bug.status === 'OPEN' && (
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20">
                  Assign to Me
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800/50">
                  View Details
                </button>
              </div>
            )}

            {bug.status === 'FIXING' && (
              <div className="mt-3">
                <button className="px-3 py-1.5 text-sm font-medium text-green-400 bg-green-500/10 rounded-lg hover:bg-green-500/20">
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report New Bug */}
      <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Report a Bug</h3>
            <p className="text-sm text-slate-400">Found an issue? Report it here</p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Report Bug
          </button>
        </div>
      </div>
    </div>
  )
}
