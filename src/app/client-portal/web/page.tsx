'use client'

import React, { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PhaseProgressTracker } from '@/client/components/web/PhaseApprovalGate'

interface WebProjectData {
  id: string
  name: string
  status: string
  currentPhase: string
  startDate: string | null
  targetEndDate: string | null
  stagingUrl: string | null
  productionUrl: string | null
  phases: {
    phase: string
    status: string
    startedAt: string | null
    completedAt: string | null
  }[]
  client: {
    id: string
    name: string
  }
}

interface DomainInfo {
  id: string
  domainName: string
  expiryDate: string
  sslStatus: string
  sslExpiryDate: string | null
}

interface AMCContract {
  id: string
  type: string
  startDate: string
  endDate: string
  allocatedHours: number | null
  usedHours: number
  status: string
}

interface PendingApproval {
  id: string
  title: string
  type: 'design' | 'phase'
  phase: string
  createdAt: string
}

interface BugReport {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
}

interface Activity {
  id: string
  type: string
  message: string
  createdAt: string
}

export default function WebClientPortalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<WebProjectData | null>(null)
  const [domains, setDomains] = useState<DomainInfo[]>([])
  const [amcContract, setAmcContract] = useState<AMCContract | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [bugReports, setBugReports] = useState<BugReport[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [clientUser, setClientUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/client-portal/web/dashboard')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/client-login')
          return
        }
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()
      setProject(data.project)
      setDomains(data.domains || [])
      setAmcContract(data.amcContract)
      setPendingApprovals(data.pendingApprovals || [])
      setBugReports(data.bugReports || [])
      setActivities(data.activities || [])
      setClientUser(data.clientUser)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    PIPELINE: 'bg-purple-500/20 text-purple-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    ON_HOLD: 'bg-amber-500/20 text-amber-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
    ACTIVE: 'bg-green-500/20 text-green-400',
  }

  const priorityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    MEDIUM: 'bg-amber-500/20 text-amber-400',
    LOW: 'bg-green-500/20 text-green-400',
  }

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Web Project Portal</h1>
                <p className="text-xs text-slate-400">{project?.client?.name || 'Client Portal'}</p>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              <Link
                href="/client-portal/web"
                className="px-3 py-2 text-sm text-white bg-indigo-500/20 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                href="/client-portal/web/approvals"
                className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                Approvals
                {pendingApprovals.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {pendingApprovals.length}
                  </span>
                )}
              </Link>
              <Link
                href="/client-portal/web/bugs"
                className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                Bug Reports
              </Link>
              <Link
                href="/client-portal/web/requests"
                className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                Change Requests
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Hello, {clientUser?.name || 'Client'}</span>
              <button
                onClick={() => router.push('/client-login')}
                className="px-3 py-2 text-sm text-slate-400 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Project Progress Card */}
          {project && (
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                  <p className="text-sm text-slate-400">
                    Started {project.startDate ? formatDateDDMMYYYY(project.startDate) : 'TBD'}
                    {project.targetEndDate && ` • Target: ${formatDateDDMMYYYY(project.targetEndDate)}`}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${statusColors[project.status] || statusColors.IN_PROGRESS}`}>
                  {project.status.replace(/_/g, ' ')}
                </span>
              </div>

              <PhaseProgressTracker
                currentPhase={project.currentPhase}
                phases={project.phases.map((p) => ({
                  phase: p.phase,
                  status: p.status as 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'COMPLETED',
                }))}
              />

              {/* URLs */}
              {(project.stagingUrl || project.productionUrl) && (
                <div className="mt-4 flex gap-4">
                  {project.stagingUrl && (
                    <a
                      href={project.stagingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview Site
                    </a>
                  )}
                  {project.productionUrl && (
                    <a
                      href={project.productionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Live Site
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Actions Card */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">Pending Actions</h3>
                {pendingApprovals.length > 0 && (
                  <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                    {pendingApprovals.length} pending
                  </span>
                )}
              </div>
              <div className="divide-y divide-white/5">
                {pendingApprovals.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No pending actions</div>
                ) : (
                  pendingApprovals.slice(0, 5).map((approval) => (
                    <Link
                      key={approval.id}
                      href={`/client-portal/web/approvals?id=${approval.id}`}
                      className="block p-4 hover:bg-slate-700/30"
                    >
                      <p className="font-medium text-white">{approval.title}</p>
                      <p className="text-sm text-slate-400">
                        {approval.type === 'design' ? 'Design Approval' : `${approval.phase} Phase`}
                      </p>
                    </Link>
                  ))
                )}
              </div>
              {pendingApprovals.length > 5 && (
                <div className="p-4 border-t border-white/10">
                  <Link href="/client-portal/web/approvals" className="text-sm text-indigo-400 hover:text-indigo-300">
                    View all approvals →
                  </Link>
                </div>
              )}
            </div>

            {/* Domain & Hosting Card */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Domain & Hosting</h3>
              </div>
              <div className="p-4 space-y-4">
                {domains.length === 0 ? (
                  <p className="text-slate-400">No domain information available</p>
                ) : (
                  domains.map((domain) => {
                    const daysUntilExpiry = Math.ceil(
                      (new Date(domain.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                    return (
                      <div key={domain.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">{domain.domainName}</p>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${daysUntilExpiry < 30 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
                          >
                            {daysUntilExpiry} days
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${domain.sslStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                          >
                            SSL: {domain.sslStatus}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* AMC Status Card */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Maintenance Contract</h3>
              </div>
              <div className="p-4">
                {!amcContract ? (
                  <div className="text-center py-4">
                    <p className="text-slate-400 mb-3">No active maintenance contract</p>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Enquire About AMC
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[amcContract.status] || statusColors.ACTIVE}`}>
                        {amcContract.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Valid Until</span>
                      <span className="text-white">{formatDateDDMMYYYY(amcContract.endDate)}</span>
                    </div>
                    {amcContract.allocatedHours && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-400">Hours Used</span>
                          <span className="text-white">
                            {amcContract.usedHours} / {amcContract.allocatedHours}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${amcContract.usedHours / amcContract.allocatedHours > 0.8 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{
                              width: `${Math.min((amcContract.usedHours / amcContract.allocatedHours) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <Link
                      href="/client-portal/web/requests"
                      className="block w-full py-2 text-center bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20"
                    >
                      Request Support
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bug Reports */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">My Bug Reports</h3>
                <Link
                  href="/client-portal/web/bugs/new"
                  className="px-3 py-1 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                >
                  + Report Bug
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {bugReports.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No bug reports submitted</div>
                ) : (
                  bugReports.slice(0, 5).map((bug) => (
                    <div key={bug.id} className="p-4 hover:bg-slate-700/30">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">{bug.title}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[bug.priority] || priorityColors.MEDIUM}`}>
                          {bug.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${bug.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}
                        >
                          {bug.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDateDDMMYYYY(bug.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No recent activity</div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'phase_complete'
                              ? 'bg-green-500/20'
                              : activity.type === 'approval_needed'
                                ? 'bg-amber-500/20'
                                : 'bg-blue-500/20'
                          }`}
                        >
                          {activity.type === 'phase_complete' ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : activity.type === 'approval_needed' ? (
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">{activity.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
