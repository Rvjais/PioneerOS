'use client'

import { useState } from 'react'

interface Deliverable {
  id: string
  name: string
  client: string
  project: string
  type: 'WEBSITE_LAUNCH' | 'LANDING_PAGE' | 'FEATURE' | 'HOTFIX'
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED'
  dueDate: string
  submittedDate?: string
  owner: string
}

const DELIVERABLES: Deliverable[] = [
  { id: '1', name: 'MedPlus Landing Page - Full Website', client: 'MedPlus Clinics', project: 'MedPlus Landing Page', type: 'LANDING_PAGE', status: 'SUBMITTED', dueDate: '2024-03-15', submittedDate: '2024-03-10', owner: 'Manish' },
  { id: '2', name: 'Apollo Homepage Redesign', client: 'Apollo Hospitals', project: 'Apollo Website Revamp', type: 'FEATURE', status: 'PENDING', dueDate: '2024-03-20', owner: 'Shivam' },
  { id: '3', name: 'CareConnect Contact Form', client: 'CareConnect', project: 'CareConnect Website', type: 'FEATURE', status: 'PENDING', dueDate: '2024-03-18', owner: 'Chitransh' },
  { id: '4', name: 'HealthFirst Performance Update', client: 'HealthFirst Labs', project: 'HealthFirst Labs', type: 'HOTFIX', status: 'PENDING', dueDate: '2024-03-16', owner: 'Shivam' },
  { id: '5', name: 'Apollo Full Website Launch', client: 'Apollo Hospitals', project: 'Apollo Website Revamp', type: 'WEBSITE_LAUNCH', status: 'PENDING', dueDate: '2024-03-25', owner: 'Manish' },
  { id: '6', name: 'WellnessHub Website - Phase 1', client: 'WellnessHub', project: 'WellnessHub New Website', type: 'WEBSITE_LAUNCH', status: 'PENDING', dueDate: '2024-04-15', owner: 'Manish' },
]

export default function WebDeliverablesPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredDeliverables = filter === 'all' ? DELIVERABLES : DELIVERABLES.filter(d => d.status === filter)

  const pendingCount = DELIVERABLES.filter(d => d.status === 'PENDING').length
  const submittedCount = DELIVERABLES.filter(d => d.status === 'SUBMITTED').length
  const approvedCount = DELIVERABLES.filter(d => d.status === 'APPROVED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400'
      case 'SUBMITTED': return 'bg-blue-500/20 text-blue-400'
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WEBSITE_LAUNCH': return 'bg-purple-500/20 text-purple-400'
      case 'LANDING_PAGE': return 'bg-indigo-500/20 text-indigo-400'
      case 'FEATURE': return 'bg-blue-500/20 text-blue-400'
      case 'HOTFIX': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Website Deliverables</h1>
            <p className="text-indigo-200">Track client deliverables</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Pending</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Submitted</p>
              <p className="text-3xl font-bold">{submittedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter(filter === 'PENDING' ? 'all' : 'PENDING')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'PENDING' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'SUBMITTED' ? 'all' : 'SUBMITTED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'SUBMITTED' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 glass-card hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-slate-400">Submitted</p>
          <p className="text-3xl font-bold text-blue-400">{submittedCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'APPROVED' ? 'all' : 'APPROVED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'APPROVED' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Approved</p>
          <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
        </button>
      </div>

      {/* Deliverables List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">All Deliverables</h2>
        </div>
        <div className="divide-y divide-white/10">
          {filteredDeliverables.map(deliverable => (
            <div key={deliverable.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{deliverable.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(deliverable.type)}`}>
                      {deliverable.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{deliverable.client} - {deliverable.project}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(deliverable.status)}`}>
                  {deliverable.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Owner: {deliverable.owner}</span>
                <span>Due: {new Date(deliverable.dueDate).toLocaleDateString('en-IN')}</span>
                {deliverable.submittedDate && (
                  <span className="text-green-400">Submitted: {new Date(deliverable.submittedDate).toLocaleDateString('en-IN')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Launches */}
      <div className="bg-indigo-500/10 rounded-xl border border-indigo-200 p-4">
        <h3 className="font-semibold text-indigo-800 mb-3">Upcoming Launches</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {DELIVERABLES.filter(d => d.type === 'WEBSITE_LAUNCH').map(d => (
            <div key={d.id} className="glass-card rounded-lg p-3 border border-indigo-100">
              <p className="font-medium text-white">{d.name}</p>
              <p className="text-sm text-slate-400">{d.client}</p>
              <p className="text-sm text-indigo-600 mt-1">
                Launch: {new Date(d.dueDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
