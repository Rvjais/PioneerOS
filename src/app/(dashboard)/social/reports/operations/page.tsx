'use client'

import { useState, useEffect } from 'react'

interface DashboardData {
  myWork: { postsDueToday: number; designsPending: number; postsScheduled: number }
  approvals: { designsPendingApproval: number; clientApprovalPending: number }
  publishing: { scheduledToday: number; publishedThisWeek: number }
  performance: { engagementThisWeek: number; topPost: { client: string; platform: string; engagement: number; type: string } }
}

export default function SocialOperationsReportPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [clientCount, setClientCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, clientRes] = await Promise.all([
          fetch('/api/social/dashboard'),
          fetch('/api/social/clients?limit=1'),
        ])
        if (dashRes.ok) {
          setDashboard(await dashRes.json())
        }
        if (clientRes.ok) {
          const cData = await clientRes.json()
          setClientCount(cData.pagination?.total || 0)
        }
      } catch (err) {
        console.error('Failed to load operations data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const dailyMetrics = {
    postsScheduled: dashboard?.myWork.postsScheduled ?? 0,
    postsPendingApproval: (dashboard?.approvals.designsPendingApproval ?? 0) + (dashboard?.approvals.clientApprovalPending ?? 0),
    tasksDelayed: dashboard?.myWork.designsPending ?? 0,
    creativesDelivered: dashboard?.publishing.publishedThisWeek ?? 0,
    designsRequested: dashboard?.myWork.designsPending ?? 0,
  }

  const teamWorkload = [
    { name: 'Team Overview', role: `${clientCount} Active Clients`, tasksToday: dashboard?.myWork.postsDueToday ?? 0, completed: dashboard?.publishing.scheduledToday ?? 0, inProgress: dashboard?.myWork.designsPending ?? 0 },
  ]

  const taskUpdates = [
    { task: `${dashboard?.myWork.postsDueToday ?? 0} posts due today`, client: 'All Clients', status: (dashboard?.myWork.postsDueToday ?? 0) > 0 ? 'IN_PROGRESS' : 'TODO', progress: `${dashboard?.publishing.scheduledToday ?? 0} scheduled`, assignee: 'Team' },
    { task: `${dashboard?.approvals.designsPendingApproval ?? 0} designs pending approval`, client: 'All Clients', status: 'REVIEW', progress: 'Awaiting review', assignee: 'Team' },
    { task: `${dashboard?.approvals.clientApprovalPending ?? 0} client approvals pending`, client: 'All Clients', status: 'REVIEW', progress: 'Awaiting client', assignee: 'Team' },
  ]

  const blockers = dashboard && (dashboard.approvals.clientApprovalPending > 0 || dashboard.myWork.designsPending > 0)
    ? [
        ...(dashboard.approvals.clientApprovalPending > 0
          ? [{ issue: `${dashboard.approvals.clientApprovalPending} client approvals still pending`, severity: 'MEDIUM' as const, assignee: 'Team' }]
          : []),
        ...(dashboard.myWork.designsPending > 0
          ? [{ issue: `${dashboard.myWork.designsPending} designs pending completion`, severity: 'HIGH' as const, assignee: 'Design Team' }]
          : []),
      ]
    : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-slate-800/50 text-slate-200'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'REVIEW': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 h-28 animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 p-4 h-24 animate-pulse bg-slate-800/30" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 h-64 animate-pulse bg-slate-800/30" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daily Operations Report</h1>
            <p className="text-pink-200">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-pink-200 text-sm">Team Standup</p>
            <p className="text-xl font-bold">9:00 AM</p>
          </div>
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Posts Scheduled</p>
          <p className="text-3xl font-bold text-blue-400">{dailyMetrics.postsScheduled}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Pending Approval</p>
          <p className="text-3xl font-bold text-amber-400">{dailyMetrics.postsPendingApproval}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Tasks Delayed</p>
          <p className="text-3xl font-bold text-red-400">{dailyMetrics.tasksDelayed}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Published This Week</p>
          <p className="text-3xl font-bold text-green-400">{dailyMetrics.creativesDelivered}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Design Requests</p>
          <p className="text-3xl font-bold text-purple-400">{dailyMetrics.designsRequested}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Workload */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Team Workload Today</h2>
          </div>
          <div className="divide-y divide-white/10">
            {teamWorkload.map(member => (
              <div key={member.name} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.role}</p>
                  </div>
                  <span className="text-sm text-slate-400">{member.tasksToday} tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${member.tasksToday > 0 ? (member.completed / member.tasksToday) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400">{member.completed}/{member.tasksToday}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Updates */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Task Updates</h2>
          </div>
          <div className="divide-y divide-white/10">
            {taskUpdates.map((task, idx) => (
              <div key={`${task.task}-${task.client}`} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white">{task.task}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                    {task.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{task.client}</span>
                  <span>Assignee: {task.assignee}</span>
                  <span>Progress: {task.progress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <h3 className="font-semibold text-red-800 mb-3">Blockers & Issues</h3>
          <ul className="space-y-2">
            {blockers.map((blocker, idx) => (
              <li key={`blocker-${blocker.issue}-${idx}`} className="flex items-center gap-2 text-sm text-red-400">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  blocker.severity === 'HIGH' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {blocker.severity}
                </span>
                {blocker.issue}
                <span className="text-red-500">({blocker.assignee})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Today's Focus */}
      <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
        <h3 className="font-semibold text-pink-800 mb-3">Today&apos;s Focus</h3>
        <ul className="space-y-2 text-sm text-pink-700">
          <li className="flex items-start gap-2">
            <span className="text-pink-500">1.</span>
            {dashboard?.myWork.postsDueToday ?? 0} posts due today — ensure all are scheduled
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">2.</span>
            Clear {(dashboard?.approvals.designsPendingApproval ?? 0) + (dashboard?.approvals.clientApprovalPending ?? 0)} pending approvals
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">3.</span>
            {dashboard?.publishing.publishedThisWeek ?? 0} posts published this week — keep momentum
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">4.</span>
            {dashboard?.performance.engagementThisWeek ?? 0} engagement this week — review top content
          </li>
        </ul>
      </div>
    </div>
  )
}
