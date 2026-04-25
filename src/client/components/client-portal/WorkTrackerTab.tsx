'use client'

import React, { useState, useEffect } from 'react'
import TeamMemberProfileModal from './TeamMemberProfileModal'

interface WorkEntryFile {
  id: string
  fileName: string
  webViewLink: string | null
  thumbnailUrl: string | null
  fileCategory: string | null
}

interface Employee {
  id: string
  firstName: string | null
  lastName: string | null
  department: string | null
}

interface WorkTask {
  id: string
  category: string
  deliverableType: string
  description: string | null
  hoursSpent: number | null
  status: string
  qualityScore: number | null
  deliverableUrl: string | null
  files: WorkEntryFile[]
  employee: Employee
}

interface DayEntry {
  date: string
  tasks: WorkTask[]
}

interface TeamMember {
  userId: string
  firstName: string | null
  lastName: string | null
  department: string | null
  role: string
  isPrimary: boolean
  avatarUrl: string | null
  tasksThisPeriod: number
  hoursThisPeriod: number
  lastActiveDate: string | null
}

interface WorkTrackerData {
  summary: {
    totalHours: number
    totalTasks: number
    categoryCounts: Record<string, number>
    completionRate: number
    avgQualityScore: number | null
    approvedCount: number
    submittedCount: number
  }
  entries: DayEntry[]
  team: TeamMember[]
  filters: {
    view: string
    startDate: string
    endDate: string
    category: string | null
    employeeId: string | null
    availableCategories: string[]
  }
}

type ViewType = 'daily' | 'weekly' | 'monthly'

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  SEO: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  SOCIAL: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  ADS: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  WEB: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  DESIGN: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  VIDEO: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  ACCOUNTS: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  HR: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  SALES: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  OPERATIONS: { bg: 'bg-slate-900/20', text: 'text-slate-400', border: 'border-slate-500/30' },
}

const roleLabels: Record<string, string> = {
  ACCOUNT_MANAGER: 'Account Manager',
  SEO_SPECIALIST: 'SEO Specialist',
  ADS_SPECIALIST: 'Ads Specialist',
  SOCIAL_MANAGER: 'Social Manager',
  AUTOMATION_ENGINEER: 'Automation Engineer',
}

export default function WorkTrackerTab() {
  const [data, setData] = useState<WorkTrackerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewType>('weekly')
  const [category, setCategory] = useState<string>('')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [profileMember, setProfileMember] = useState<string | null>(null)
  const [clientWhatsApp, setClientWhatsApp] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ view })
      if (category) params.set('category', category)
      if (selectedEmployee) params.set('employeeId', selectedEmployee)

      const res = await fetch(`/api/client-portal/work-tracker?${params}`, { credentials: 'include' })
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch work tracker data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchClientInfo()
  }, [view, category, selectedEmployee])

  const fetchClientInfo = async () => {
    try {
      const res = await fetch('/api/client-portal/profile', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setClientWhatsApp(data.client?.whatsapp || null)
      }
    } catch (error) {
      console.error('Failed to fetch client info:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const toggleFilesExpanded = (taskId: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const getCategoryStyle = (cat: string) => categoryColors[cat] || categoryColors.OPERATIONS

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
        <p className="text-slate-400">Unable to load work tracker data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Work Tracker</h2>
          <p className="text-slate-400 text-sm mt-1">See what your team is working on</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* View Toggle */}
          <div className="inline-flex bg-slate-800 rounded-lg border border-slate-700 p-1">
            {(['daily', 'weekly', 'monthly'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === v
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {data.filters.availableCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-white">{data.summary.totalHours}</p>
          <p className="text-xs text-slate-400">This {view === 'daily' ? 'day' : view === 'weekly' ? 'week' : 'month'}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Tasks Completed</p>
          <p className="text-2xl font-bold text-green-400">{data.summary.approvedCount}</p>
          <p className="text-xs text-slate-400">{data.summary.submittedCount} in review</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-blue-400">{data.summary.completionRate}%</p>
          <p className="text-xs text-slate-400">Approved / Total</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Avg Quality</p>
          <p className="text-2xl font-bold text-purple-400">
            {data.summary.avgQualityScore ? `${data.summary.avgQualityScore}/10` : '-'}
          </p>
          <p className="text-xs text-slate-400">Quality score</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Work Entries - 3 columns */}
        <div className="lg:col-span-3 space-y-4">
          {data.entries.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-400">No work entries found for this period</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting the filters or date range</p>
            </div>
          ) : (
            data.entries.map((day) => (
              <div key={day.date} className="space-y-3">
                <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" />
                  {formatDate(day.date)}
                  <span className="text-slate-400">({day.tasks.length} tasks)</span>
                </h3>
                <div className="space-y-2">
                  {day.tasks.map((task) => {
                    const catStyle = getCategoryStyle(task.category)
                    const filesExpanded = expandedFiles.has(task.id)

                    return (
                      <div
                        key={task.id}
                        className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                                {task.category}
                              </span>
                              <span className="font-medium text-white">
                                {task.deliverableType.replace(/_/g, ' ')}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                task.status === 'APPROVED'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {task.status === 'APPROVED' ? 'Approved' : 'In Review'}
                              </span>
                              {task.qualityScore && (
                                <span className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${
                                  task.qualityScore >= 8
                                    ? 'bg-green-500/20 text-green-400'
                                    : task.qualityScore >= 6
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-red-500/20 text-red-400'
                                }`}>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {task.qualityScore}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-slate-400 mt-2">{task.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              {task.employee.firstName && (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {task.employee.firstName} {task.employee.lastName || ''}
                                  {task.employee.department && (
                                    <span className="text-slate-400">({task.employee.department})</span>
                                  )}
                                </span>
                              )}
                              {task.hoursSpent && task.hoursSpent > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {task.hoursSpent}h
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Proof links */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {task.deliverableUrl && (
                              <a
                                href={task.deliverableUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View
                              </a>
                            )}
                            {task.files.length > 0 && (
                              <button
                                onClick={() => toggleFilesExpanded(task.id)}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                {task.files.length} files
                                <svg className={`w-3 h-3 transition-transform ${filesExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded files */}
                        {filesExpanded && task.files.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <p className="text-xs text-slate-400 mb-2">Attached Files</p>
                            <div className="flex flex-wrap gap-2">
                              {task.files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.webViewLink || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group"
                                >
                                  {file.thumbnailUrl ? (
                                    <img
                                      src={file.thumbnailUrl}
                                      alt={file.fileName}
                                      className="w-8 h-8 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center">
                                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                  <span className="text-xs text-slate-300 group-hover:text-white max-w-[150px] truncate">
                                    {file.fileName}
                                  </span>
                                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Team Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sticky top-24">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Your Team
            </h3>

            {data.team.length === 0 ? (
              <p className="text-sm text-slate-400">No team members assigned</p>
            ) : (
              <div className="space-y-3">
                {data.team.map((member) => (
                  <div
                    key={member.userId}
                    className={`p-3 rounded-lg transition-colors ${
                      selectedEmployee === member.userId
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setProfileMember(member.userId)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                        title="View Profile"
                      >
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={`${member.firstName} ${member.lastName || ''}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {member.firstName?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white text-sm truncate">
                              {member.firstName} {member.lastName || ''}
                            </p>
                            {member.isPrimary && (
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-medium rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {roleLabels[member.role] || member.role}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedEmployee(selectedEmployee === member.userId ? '' : member.userId)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedEmployee === member.userId
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        }`}
                        title={selectedEmployee === member.userId ? 'Clear filter' : 'Filter by this member'}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs pl-[52px]">
                      <span className="text-slate-400">
                        <span className="text-blue-400 font-medium">{member.tasksThisPeriod}</span> tasks
                      </span>
                      <span className="text-slate-400">
                        <span className="text-purple-400 font-medium">{member.hoursThisPeriod}</span>h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedEmployee && (
              <button
                onClick={() => setSelectedEmployee('')}
                className="w-full mt-3 px-3 py-2 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Team Member Profile Modal */}
      {profileMember && (
        <TeamMemberProfileModal
          userId={profileMember}
          onClose={() => setProfileMember(null)}
          clientWhatsApp={clientWhatsApp}
        />
      )}
    </div>
  )
}
