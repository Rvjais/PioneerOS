import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

async function getOperationsData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  // Fetch all data in parallel
  const [
    interviewsToday,
    candidatesScreened,
    onboardingsToday,
    leaveRequestsProcessed,
    documentsVerified,
    hrTeam,
    interviewsThisWeek,
    onboardingsThisWeek,
    leaveRequestsThisWeek,
    exitProcessesThisWeek,
    pendingVerifications,
  ] = await Promise.all([
    // Interviews scheduled for today
    prisma.interview.count({
      where: {
        scheduledAt: { gte: today, lt: tomorrow },
      },
    }),

    // Candidates screened (moved past APPLICATION status today)
    prisma.candidate.count({
      where: {
        status: { not: 'APPLICATION' },
        updatedAt: { gte: today, lt: tomorrow },
      },
    }),

    // Employees who joined today (onboardings)
    prisma.user.count({
      where: {
        joiningDate: { gte: today, lt: tomorrow },
      },
    }),

    // Leave requests processed today
    prisma.leaveRequest.count({
      where: {
        status: { in: ['APPROVED', 'REJECTED'] },
        approvedAt: { gte: today, lt: tomorrow },
      },
    }),

    // Documents verified today (verified profiles)
    prisma.user.count({
      where: {
        profileCompletionStatus: 'VERIFIED',
        hrVerifiedAt: { gte: today, lt: tomorrow },
      },
    }),

    // HR team members with task counts
    prisma.user.findMany({
      where: {
        department: 'HR',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        assignedTasks: {
          where: {
            OR: [
              { status: 'COMPLETED', completedAt: { gte: today, lt: tomorrow } },
              { status: { not: 'COMPLETED' } },
            ],
          },
          select: { status: true },
        },
      },
    }),

    // Interviews this week
    prisma.interview.count({
      where: {
        scheduledAt: { gte: weekStart, lt: weekEnd },
      },
    }),

    // Onboardings this week
    prisma.user.count({
      where: {
        joiningDate: { gte: weekStart, lt: weekEnd },
      },
    }),

    // Leave requests this week
    prisma.leaveRequest.count({
      where: {
        createdAt: { gte: weekStart, lt: weekEnd },
      },
    }),

    // Exit processes this week
    prisma.exitProcess.count({
      where: {
        createdAt: { gte: weekStart, lt: weekEnd },
      },
    }),

    // Pending background verifications
    prisma.user.count({
      where: {
        profileCompletionStatus: 'PENDING_HR',
      },
    }),
  ])

  return {
    dailyMetrics: [
      { label: 'Interviews Scheduled', value: interviewsToday, target: 6 },
      { label: 'Candidates Screened', value: candidatesScreened, target: 10 },
      { label: 'Onboardings Today', value: onboardingsToday, target: 2 },
      { label: 'Leave Requests Processed', value: leaveRequestsProcessed, target: 10 },
      { label: 'Documents Verified', value: documentsVerified, target: 12 },
      { label: 'Employee Queries Resolved', value: 0, target: 25 }, // No dedicated model for this
    ],
    teamMembers: hrTeam.map(member => {
      const completed = member.assignedTasks.filter(t => t.status === 'COMPLETED').length
      const pending = member.assignedTasks.filter(t => t.status !== 'COMPLETED').length
      const status = pending > completed ? 'BEHIND' : pending === 0 ? 'AHEAD' : 'ON_TRACK'
      return {
        id: member.id,
        name: `${member.firstName} ${member.lastName || ''}`.trim(),
        role: member.role === 'MANAGER' ? 'HR Manager' : member.role === 'EMPLOYEE' ? 'HR Executive' : member.role,
        tasksCompleted: completed,
        tasksPending: pending,
        status,
      }
    }),
    weeklyMetrics: {
      interviews: interviewsThisWeek,
      onboardings: onboardingsThisWeek,
      leaveRequests: leaveRequestsThisWeek,
      exitProcesses: exitProcessesThisWeek,
    },
    blockers: pendingVerifications > 0
      ? [`${pendingVerifications} pending background verification${pendingVerifications > 1 ? 's' : ''} awaiting HR review`]
      : [],
  }
}

export default async function HROperationsReportPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const data = await getOperationsData()

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Generate dynamic highlights based on data
  const todayHighlights: { type: string; text: string }[] = []
  if (data.dailyMetrics[2].value > 0) {
    todayHighlights.push({ type: 'success', text: `${data.dailyMetrics[2].value} new hire${data.dailyMetrics[2].value > 1 ? 's' : ''} completed onboarding` })
  }
  if (data.dailyMetrics[0].value > 0) {
    todayHighlights.push({ type: 'info', text: `${data.dailyMetrics[0].value} interview${data.dailyMetrics[0].value > 1 ? 's' : ''} scheduled for today` })
  }
  if (data.blockers.length > 0) {
    todayHighlights.push({ type: 'warning', text: data.blockers[0] })
  }
  if (data.dailyMetrics[1].value > 0) {
    todayHighlights.push({ type: 'info', text: `${data.dailyMetrics[1].value} candidate${data.dailyMetrics[1].value > 1 ? 's' : ''} screened today` })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daily Operations Meeting</h1>
            <p className="text-purple-100">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Meeting Time</p>
            <p className="text-xl font-bold">9:30 AM</p>
          </div>
        </div>
      </div>

      {/* Daily Metrics */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Today&apos;s Metrics</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 p-4">
          {data.dailyMetrics.map((metric, idx) => {
            const percentage = metric.target > 0 ? (metric.value / metric.target) * 100 : 0
            const isOnTrack = percentage >= 80
            return (
              <div key={metric.label} className="p-4 border border-white/5 rounded-lg">
                <p className="text-sm text-slate-400">{metric.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                  <span className="text-sm text-slate-400">/ {metric.target} target</span>
                </div>
                <div className="mt-2 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOnTrack ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Team Status */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Team Status</h2>
        </div>
        {data.teamMembers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No HR team members found
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {data.teamMembers.map(member => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Tasks</p>
                    <p className="font-medium">
                      <span className="text-green-400">{member.tasksCompleted}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="text-amber-400">{member.tasksPending} pending</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    member.status === 'AHEAD' ? 'bg-green-500/20 text-green-400' :
                    member.status === 'ON_TRACK' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {member.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Highlights */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Today&apos;s Highlights</h2>
          </div>
          <div className="p-4 space-y-3">
            {todayHighlights.length === 0 ? (
              <p className="text-sm text-slate-400">No significant activity yet today</p>
            ) : (
              todayHighlights.map((item, idx) => (
                <div key={`highlight-${item.text}-${idx}`} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    item.type === 'success' ? 'bg-green-500' :
                    item.type === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`} />
                  <p className="text-sm text-slate-300">{item.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Blockers */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-red-500/10">
            <h2 className="font-semibold text-red-800">Blockers & Escalations</h2>
          </div>
          <div className="p-4 space-y-3">
            {data.blockers.length === 0 ? (
              <p className="text-sm text-slate-400">No blockers today</p>
            ) : (
              data.blockers.map((blocker, idx) => (
                <div key={`blocker-${blocker}-${idx}`} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-slate-300">{blocker}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upcoming This Week */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-800 mb-3">Upcoming This Week</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="glass-card rounded-lg p-3">
            <p className="text-2xl font-bold text-purple-400">{data.weeklyMetrics.interviews}</p>
            <p className="text-sm text-slate-300">Interviews</p>
          </div>
          <div className="glass-card rounded-lg p-3">
            <p className="text-2xl font-bold text-green-400">{data.weeklyMetrics.onboardings}</p>
            <p className="text-sm text-slate-300">Onboardings</p>
          </div>
          <div className="glass-card rounded-lg p-3">
            <p className="text-2xl font-bold text-amber-400">{data.weeklyMetrics.leaveRequests}</p>
            <p className="text-sm text-slate-300">Leave Requests</p>
          </div>
          <div className="glass-card rounded-lg p-3">
            <p className="text-2xl font-bold text-pink-600">{data.weeklyMetrics.exitProcesses}</p>
            <p className="text-sm text-slate-300">Exit Process</p>
          </div>
        </div>
      </div>
    </div>
  )
}
