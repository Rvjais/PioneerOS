'use client'

import { useState } from 'react'

interface Problem {
  id: string
  title: string
  description: string
  category: 'PROCESS' | 'PEOPLE' | 'TECHNOLOGY' | 'CLIENT' | 'EXTERNAL'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'IDENTIFIED' | 'ANALYZING' | 'SOLUTION_PROPOSED' | 'IMPLEMENTING' | 'RESOLVED'
  department: string
  reportedBy: string
  reportedDate: string
  owner: string
  rootCause?: string
  solution?: string
}

const PROBLEMS: Problem[] = [
  {
    id: '1',
    title: 'Web team capacity shortage',
    description: 'Designer on leave causing delays in 3 projects',
    category: 'PEOPLE',
    severity: 'HIGH',
    status: 'ANALYZING',
    department: 'Web',
    reportedBy: 'Vikram Singh',
    reportedDate: '2024-03-08',
    owner: 'Himanshu',
    rootCause: 'Single point of failure - only one designer',
    solution: 'Urgent hiring + temporary freelancer'
  },
  {
    id: '2',
    title: 'Payment collection delays',
    description: 'Multiple clients with overdue payments, impacting cash flow',
    category: 'PROCESS',
    severity: 'CRITICAL',
    status: 'SOLUTION_PROPOSED',
    department: 'Accounts',
    reportedBy: 'Vikram',
    reportedDate: '2024-03-05',
    owner: 'Himanshu',
    rootCause: 'No automated follow-up system',
    solution: 'Implement automated reminders + escalation matrix'
  },
  {
    id: '3',
    title: 'Lead response time exceeds SLA',
    description: 'Some leads not contacted within 24 hours',
    category: 'PROCESS',
    severity: 'HIGH',
    status: 'IMPLEMENTING',
    department: 'Sales',
    reportedBy: 'Abhishek',
    reportedDate: '2024-03-10',
    owner: 'Abhishek',
    rootCause: 'Manual lead assignment process',
    solution: 'Auto-assign leads + WhatsApp notification'
  },
  {
    id: '4',
    title: 'Client deliverable quality issues',
    description: 'QC rejecting 15% of social media posts',
    category: 'PROCESS',
    severity: 'MEDIUM',
    status: 'ANALYZING',
    department: 'Social',
    reportedBy: 'Anita Desai',
    reportedDate: '2024-03-09',
    owner: 'Anita Desai'
  },
  {
    id: '5',
    title: 'Tool subscription expiring',
    description: 'SEMrush license expiring in 2 weeks, renewal pending approval',
    category: 'TECHNOLOGY',
    severity: 'MEDIUM',
    status: 'IDENTIFIED',
    department: 'SEO',
    reportedBy: 'Priya Sharma',
    reportedDate: '2024-03-11',
    owner: 'Himanshu'
  },
]

export default function ManagerProblemTrackerPage() {
  const [filter, setFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredProblems = PROBLEMS.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
    return true
  })

  const criticalCount = PROBLEMS.filter(p => p.severity === 'CRITICAL').length
  const openCount = PROBLEMS.filter(p => p.status !== 'RESOLVED').length
  const resolvedCount = PROBLEMS.filter(p => p.status === 'RESOLVED').length

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDENTIFIED': return 'bg-red-500/20 text-red-400'
      case 'ANALYZING': return 'bg-amber-500/20 text-amber-400'
      case 'SOLUTION_PROPOSED': return 'bg-blue-500/20 text-blue-400'
      case 'IMPLEMENTING': return 'bg-purple-500/20 text-purple-400'
      case 'RESOLVED': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PROCESS': return 'bg-blue-500/20 text-blue-400'
      case 'PEOPLE': return 'bg-pink-500/20 text-pink-400'
      case 'TECHNOLOGY': return 'bg-purple-500/20 text-purple-400'
      case 'CLIENT': return 'bg-amber-500/20 text-amber-400'
      case 'EXTERNAL': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Problem Tracker</h1>
            <p className="text-purple-200">Track and resolve operational issues</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-purple-200 text-sm">Open Problems</p>
              <p className="text-3xl font-bold">{openCount}</p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-300">{criticalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Critical</p>
          <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
        </div>
        <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
          <p className="text-sm text-orange-600">High</p>
          <p className="text-3xl font-bold text-orange-700">{PROBLEMS.filter(p => p.severity === 'HIGH').length}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Medium</p>
          <p className="text-3xl font-bold text-amber-400">{PROBLEMS.filter(p => p.severity === 'MEDIUM').length}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">In Progress</p>
          <p className="text-3xl font-bold text-purple-400">{PROBLEMS.filter(p => p.status === 'IMPLEMENTING').length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Resolved</p>
          <p className="text-3xl font-bold text-green-400">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {['all', 'IDENTIFIED', 'ANALYZING', 'SOLUTION_PROPOSED', 'IMPLEMENTING'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === s
                  ? 'bg-purple-500 text-white'
                  : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
              }`}
            >
              {s === 'all' ? 'All Status' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Categories</option>
          <option value="PROCESS">Process</option>
          <option value="PEOPLE">People</option>
          <option value="TECHNOLOGY">Technology</option>
          <option value="CLIENT">Client</option>
          <option value="EXTERNAL">External</option>
        </select>
      </div>

      {/* Problems List */}
      <div className="space-y-4">
        {filteredProblems.map(problem => (
          <div key={problem.id} className={`glass-card rounded-xl border-2 p-4 ${
            problem.severity === 'CRITICAL' ? 'border-red-300' : 'border-white/10'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{problem.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getSeverityColor(problem.severity)}`}>
                    {problem.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{problem.description}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(problem.status)}`}>
                {problem.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3 text-sm">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(problem.category)}`}>
                {problem.category}
              </span>
              <span className="text-slate-400">{problem.department}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">Owner: {problem.owner}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">Reported: {new Date(problem.reportedDate).toLocaleDateString('en-IN')}</span>
            </div>

            {(problem.rootCause || problem.solution) && (
              <div className="grid md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5">
                {problem.rootCause && (
                  <div className="bg-red-500/10 rounded-lg p-3">
                    <p className="text-xs text-red-400 font-medium mb-1">Root Cause</p>
                    <p className="text-sm text-red-400">{problem.rootCause}</p>
                  </div>
                )}
                {problem.solution && (
                  <div className="bg-green-500/10 rounded-lg p-3">
                    <p className="text-xs text-green-400 font-medium mb-1">Proposed Solution</p>
                    <p className="text-sm text-green-400">{problem.solution}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Add */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-purple-800">Report a Problem</h3>
            <p className="text-sm text-purple-400">Log new operational issues for tracking</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Report Problem
          </button>
        </div>
      </div>
    </div>
  )
}
