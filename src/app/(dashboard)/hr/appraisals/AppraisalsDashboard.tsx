'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AppraisalUser {
  id: string
  empId: string
  firstName: string
  lastName: string
  department: string
  joiningDate: string
}

interface Appraisal {
  id: string
  userId: string
  cycleYear: number
  cyclePeriod: string
  status: string
  triggeredAt: string
  submittedAt: string | null
  completedAt: string | null
  overallRating: number | null
  managerRating: number | null
  finalRating: number | null
  learningHoursThisYear: number
  learningHoursRequired: number
  user: AppraisalUser | null
}

interface UpcomingUser {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  department: string
  joiningDate: string
  appraisalDate: string | null
}

interface Props {
  appraisals: Appraisal[]
  stats: {
    pending: number
    inProgress: number
    submitted: number
    managerReview: number
    completed: number
    total: number
  }
  upcomingUsers: UpcomingUser[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  IN_PROGRESS: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  SUBMITTED: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  MANAGER_REVIEW: { bg: 'bg-indigo-500/20', text: 'text-indigo-700' },
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400' },
  SKIPPED: { bg: 'bg-slate-800/50', text: 'text-slate-200' },
}

export function AppraisalsDashboard({ appraisals, stats, upcomingUsers }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [triggering, setTriggering] = useState(false)

  const filteredAppraisals = appraisals.filter(a => {
    const matchesFilter = filter === 'ALL' || a.status === filter
    const matchesSearch = search === '' ||
      a.user?.firstName.toLowerCase().includes(search.toLowerCase()) ||
      a.user?.lastName.toLowerCase().includes(search.toLowerCase()) ||
      a.user?.empId.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleTriggerAppraisals = async () => {
    if (!confirm('This will trigger appraisals for all eligible users. Continue?')) return

    setTriggering(true)
    try {
      const res = await fetch('/api/hr/appraisals/trigger', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        toast.success(`Triggered ${data.triggered} appraisals, postponed ${data.postponed}`)
        router.refresh()
      } else {
        toast.error('Failed to trigger appraisals: ' + data.error)
      }
    } catch (error) {
      toast.error('Error triggering appraisals')
    } finally {
      setTriggering(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const daysUntil = (dateStr: string) => {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card border border-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-300">Total</p>
        </div>
        <div className="glass-card border border-amber-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          <p className="text-sm text-slate-300">Pending</p>
        </div>
        <div className="glass-card border border-blue-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-sm text-slate-300">In Progress</p>
        </div>
        <div className="glass-card border border-purple-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-400">{stats.submitted}</p>
          <p className="text-sm text-slate-300">Submitted</p>
        </div>
        <div className="glass-card border border-indigo-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-indigo-600">{stats.managerReview}</p>
          <p className="text-sm text-slate-300">Manager Review</p>
        </div>
        <div className="glass-card border border-green-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          <p className="text-sm text-slate-300">Completed</p>
        </div>
      </div>

      {/* Upcoming Appraisals Alert */}
      {upcomingUsers.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-blue-800">Upcoming Appraisals ({upcomingUsers.length})</h3>
            </div>
            <button
              onClick={handleTriggerAppraisals}
              disabled={triggering}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {triggering ? 'Triggering...' : 'Trigger Eligible'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingUsers.slice(0, 6).map(user => (
              <div key={user.id} className="glass-card rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {user.firstName} {user.lastName || ''}
                    </p>
                    <p className="text-xs text-slate-400">{user.empId} - {user.department}</p>
                  </div>
                  {user.appraisalDate && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-400">
                        {daysUntil(user.appraisalDate)} days
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(user.appraisalDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card border border-white/10 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'IN_PROGRESS', 'SUBMITTED', 'MANAGER_REVIEW', 'COMPLETED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appraisals Table */}
      <div className="glass-card border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40 border-b border-white/10">
                <th className="text-left px-4 py-3 font-medium text-slate-300">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Department</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Triggered</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Learning Hours</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Self Rating</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Status</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredAppraisals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No appraisals found
                  </td>
                </tr>
              ) : (
                filteredAppraisals.map(appraisal => (
                  <tr key={appraisal.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">
                          {appraisal.user?.firstName} {appraisal.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{appraisal.user?.empId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {appraisal.user?.department}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatDate(appraisal.triggeredAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              appraisal.learningHoursThisYear >= appraisal.learningHoursRequired
                                ? 'bg-green-500'
                                : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (appraisal.learningHoursThisYear / appraisal.learningHoursRequired) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">
                          {appraisal.learningHoursThisYear.toFixed(0)}h/{appraisal.learningHoursRequired}h
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {appraisal.overallRating ? (
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= appraisal.overallRating!
                                  ? 'text-amber-400'
                                  : 'text-slate-200'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          STATUS_COLORS[appraisal.status]?.bg || 'bg-slate-800/50'
                        } ${STATUS_COLORS[appraisal.status]?.text || 'text-slate-200'}`}
                      >
                        {appraisal.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={`/hr/appraisals/${appraisal.id}`}
                        className="text-blue-400 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </a>
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
