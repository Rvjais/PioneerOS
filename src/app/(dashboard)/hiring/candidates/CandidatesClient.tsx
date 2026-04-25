'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string | null
  position: string
  department: string
  status: string
  currentStage: string
  source: string | null
  experience: number | null
  expectedSalary: number | null
  noticePeriod: number | null
  resumeUrl: string | null
  portfolioUrl: string | null
  linkedInUrl: string | null
  assignedManager: { id: string; name: string } | null
  lastInterview: { scheduledAt: string | null; status: string } | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  'APPLICATION': 'bg-blue-500/20 text-blue-400',
  'SCREENING': 'bg-cyan-100 text-cyan-700',
  'PHONE_SCREEN': 'bg-cyan-100 text-cyan-700',
  'MANAGER_INTERVIEW': 'bg-purple-500/20 text-purple-400',
  'TEST_TASK': 'bg-amber-500/20 text-amber-400',
  'FOUNDER_INTERVIEW': 'bg-indigo-500/20 text-indigo-400',
  'OFFER': 'bg-emerald-500/20 text-emerald-400',
  'JOINED': 'bg-green-500/20 text-green-400',
  'REJECTED': 'bg-red-500/20 text-red-400',
  'ON_HOLD': 'bg-slate-800/50 text-slate-200',
}

const statusFilters = [
  'All',
  'APPLICATION',
  'SCREENING',
  'PHONE_SCREEN',
  'MANAGER_INTERVIEW',
  'TEST_TASK',
  'FOUNDER_INTERVIEW',
  'OFFER',
  'JOINED',
  'REJECTED',
]

export function CandidatesClient({ candidates }: { candidates: Candidate[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')

  const departments = ['All', ...new Set(candidates.map(c => c.department))]

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    const matchesDepartment = departmentFilter === 'All' || c.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
            ))}
          </select>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {statusFilters.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
              }`}
            >
              {status === 'All' ? 'All' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Experience</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Manager</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Applied</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{candidate.name}</p>
                      <p className="text-sm text-slate-400">{candidate.email}</p>
                      {candidate.phone && (
                        <p className="text-xs text-slate-400">{candidate.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{candidate.position}</p>
                    <p className="text-xs text-slate-400">{candidate.department}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[candidate.status] || 'bg-slate-800/50 text-slate-200'}`}>
                      {candidate.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {candidate.experience !== null ? `${candidate.experience} yrs` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {candidate.source || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {candidate.assignedManager?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {formatDate(candidate.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {candidate.resumeUrl && (
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                          title="View Resume"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </a>
                      )}
                      {candidate.linkedInUrl && (
                        <a
                          href={candidate.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                          title="LinkedIn Profile"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                      <Link
                        href={`/hiring?candidate=${candidate.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No candidates found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
