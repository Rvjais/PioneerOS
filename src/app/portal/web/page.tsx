'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

interface ProjectPhase {
  id: string
  phase: string
  status: string
  order: number
  startedAt: string | null
  completedAt: string | null
}

interface ExpiryAlert {
  id: string
  type: string
  domainName: string | null
  domainExpiryDate: string | null
  serverProvider: string | null
  serverExpiryDate: string | null
  contractEndDate: string
}

interface RecentFeedback {
  id: string
  type: string
  message: string
  status: string
  createdAt: string
  pageName: string
  pageSlug: string
  authorName: string
}

interface DashboardData {
  project: {
    status: string | null
    startDate: string | null
    endDate: string | null
    websiteType: string | null
    websiteUrl: string | null
  }
  phases: {
    total: number
    completed: number
    current: { phase: string; startedAt: string } | null
    all: ProjectPhase[]
  }
  pages: {
    planned: number
    inProgress: number
    live: number
    total: number
    pendingFeedback: number
  }
  expiryAlerts: ExpiryAlert[]
  recentFeedback: RecentFeedback[]
}

const phaseLabels: Record<string, string> = {
  CONTENT: 'Content',
  DESIGN: 'Design',
  MEDIA: 'Media',
  DEVELOPMENT: 'Development',
  TESTING: 'Testing',
  DEPLOYMENT: 'Deployment',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-slate-800/50 text-slate-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
  SKIPPED: 'bg-slate-800/50 text-slate-400',
}

export default function WebPortalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/web-portal')
      if (!res.ok) throw new Error('Failed to fetch dashboard')
      const data = await res.json()
      setData(data)
    } catch (err) {
      setError('Failed to load dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-400">{error || 'Failed to load dashboard'}</p>
        <button onClick={fetchDashboard} className="mt-4 text-red-400 underline">
          Try again
        </button>
      </div>
    )
  }

  const progressPercentage = data.phases.total > 0
    ? Math.round((data.phases.completed / data.phases.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="portal-web"
        title="Web Projects"
        description="Track your website project progress and milestones"
        steps={[
          { label: 'View project phases', description: 'See the timeline of phases from content to deployment and their current status' },
          { label: 'Check timelines', description: 'Monitor start dates, completion dates, and upcoming renewal alerts' },
          { label: 'Submit feedback', description: 'Use the sitemap pages to review designs and leave feedback for the team' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Dashboard</h1>
          <p className="text-slate-400 mt-1">Track your website project progress</p>
        </div>
        {data.project.websiteUrl && (
          <a
            href={data.project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit Website
          </a>
        )}
      </div>

      {/* Expiry Alerts */}
      {data.expiryAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Upcoming Renewals</h3>
              <ul className="mt-2 space-y-1">
                {data.expiryAlerts.map(alert => (
                  <li key={alert.id} className="text-sm text-amber-400">
                    {alert.domainName && alert.domainExpiryDate && (
                      <span>Domain <strong>{alert.domainName}</strong> expires {formatDateDDMMYYYY(alert.domainExpiryDate)}</span>
                    )}
                    {alert.serverProvider && alert.serverExpiryDate && (
                      <span>Hosting on <strong>{alert.serverProvider}</strong> expires {formatDateDDMMYYYY(alert.serverExpiryDate)}</span>
                    )}
                  </li>
                ))}
              </ul>
              <Link href="/portal/web/contracts" className="text-sm text-amber-400 underline mt-2 inline-block">
                View all contracts
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Progress */}
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Project Progress</span>
            <span className="text-2xl font-bold text-teal-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {data.phases.completed} of {data.phases.total} phases complete
          </p>
        </div>

        {/* Pages Status */}
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-400">Website Pages</span>
            <span className="text-2xl font-bold text-white">{data.pages.total}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center">
              <span className="text-lg font-semibold text-slate-300">{data.pages.planned}</span>
              <p className="text-xs text-slate-400">Planned</p>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-blue-400">{data.pages.inProgress}</span>
              <p className="text-xs text-slate-400">In Progress</p>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-green-400">{data.pages.live}</span>
              <p className="text-xs text-slate-400">Live</p>
            </div>
          </div>
        </div>

        {/* Pending Feedback */}
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-400">Pending Feedback</span>
            <span className={`text-2xl font-bold ${data.pages.pendingFeedback > 0 ? 'text-amber-400' : 'text-green-400'}`}>
              {data.pages.pendingFeedback}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            {data.pages.pendingFeedback > 0
              ? 'Team responses awaiting your review'
              : 'All feedback addressed'}
          </p>
          <Link href="/portal/web/sitemap" className="text-sm text-teal-600 hover:underline mt-2 inline-block">
            View all pages
          </Link>
        </div>

        {/* Current Phase */}
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <span className="text-sm font-medium text-slate-400">Current Phase</span>
          {data.phases.current ? (
            <div className="mt-2">
              <span className="text-xl font-bold text-white">
                {phaseLabels[data.phases.current.phase] || data.phases.current.phase}
              </span>
              <p className="text-sm text-slate-400 mt-1">
                Started {formatDateDDMMYYYY(data.phases.current.startedAt)}
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <span className="text-xl font-bold text-green-400">Completed</span>
              <p className="text-sm text-slate-400 mt-1">All phases finished</p>
            </div>
          )}
        </div>
      </div>

      {/* Phase Progress & Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Timeline */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Project Phases</h2>
          <div className="space-y-3">
            {data.phases.all.map((phase, index) => (
              <div key={phase.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  phase.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                  phase.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-800/50 text-slate-400'
                }`}>
                  {phase.status === 'COMPLETED' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <span className={`font-medium ${phase.status === 'COMPLETED' ? 'text-green-400' : phase.status === 'IN_PROGRESS' ? 'text-blue-400' : 'text-slate-400'}`}>
                    {phaseLabels[phase.phase] || phase.phase}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[phase.status]}`}>
                  {phase.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link href="/portal/web/sitemap" className="text-sm text-teal-600 hover:underline">
              View all
            </Link>
          </div>
          {data.recentFeedback.length > 0 ? (
            <div className="space-y-4">
              {data.recentFeedback.map(feedback => (
                <div key={feedback.id} className="flex gap-3 p-3 bg-slate-900/40 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    feedback.status === 'PENDING' ? 'bg-amber-400' :
                    feedback.status === 'ACKNOWLEDGED' ? 'bg-blue-400' :
                    'bg-green-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{feedback.authorName}</span>
                      <span className="text-xs text-slate-400">on {feedback.pageName}</span>
                    </div>
                    <p className="text-sm text-slate-300 truncate">{feedback.message}</p>
                    <span className="text-xs text-slate-400">
                      {formatDateDDMMYYYY(feedback.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/portal/web/sitemap"
            className="flex flex-col items-center gap-2 p-4 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium text-slate-200">View Pages</span>
          </Link>
          <Link
            href="/portal/web/contracts"
            className="flex flex-col items-center gap-2 p-4 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-slate-200">Contracts</span>
          </Link>
          <Link
            href="/portal/web/credentials"
            className="flex flex-col items-center gap-2 p-4 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="text-sm font-medium text-slate-200">Credentials</span>
          </Link>
          <Link
            href="/portal/web/maintenance"
            className="flex flex-col items-center gap-2 p-4 bg-slate-900/40 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-200">Maintenance</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
