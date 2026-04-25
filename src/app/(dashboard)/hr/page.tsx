import { prisma } from '@/server/db/prisma'
import { requirePageAuth, HR_ACCESS } from '@/server/auth/pageAuth'
import Link from 'next/link'
import { formatDateShort } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { HelpContent } from '@/shared/constants/helpContent'
import { DASHBOARD_ITEM_LIMIT } from '@/shared/constants/hr'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

// Ensure fresh data on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getHRData() {
  try {
    const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    employees,
    leaveRequests,
    attendance,
    candidates,
    escalations,
    appreciations,
    upcomingInterviews,
    pendingOffers,
    pendingVerifications
  ] = await Promise.all([
    prisma.user.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true, department: true, role: true, status: true, joiningDate: true, profile: { select: { profilePicture: true } } },
      orderBy: { firstName: 'asc' },
      take: 300,
    }),
    prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: { user: true }
    }),
    prisma.candidate.findMany({
      where: {
        status: {
          notIn: ['JOINED', 'REJECTED']
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.employeeEscalation.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: DASHBOARD_ITEM_LIMIT
    }),
    prisma.employeeAppreciation.findMany({
      where: {
        createdAt: { gte: startOfMonth }
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: DASHBOARD_ITEM_LIMIT
    }),
    prisma.interview.findMany({
      where: {
        scheduledAt: { gte: today },
        status: 'SCHEDULED'
      },
      include: {
        candidate: { select: { name: true, position: true } },
        interviewer: { select: { firstName: true } }
      },
      orderBy: { scheduledAt: 'asc' },
      take: DASHBOARD_ITEM_LIMIT
    }),
    prisma.offerLetter.findMany({
      where: {
        status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT'] }
      },
      include: {
        candidate: { select: { name: true, position: true } }
      }
    }),
    prisma.user.findMany({
      where: { profileCompletionStatus: 'PENDING_HR' },
      select: { id: true, firstName: true, lastName: true, empId: true, updatedAt: true }
    })
  ])

  // Calculate work anniversaries
  const thirtyDaysLater = new Date()
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

  const upcomingAnniversaries = employees.filter(emp => {
    if (!emp.joiningDate) return false
    const joining = new Date(emp.joiningDate)
    const thisYearAnniversary = new Date(today.getFullYear(), joining.getMonth(), joining.getDate())

    if (thisYearAnniversary < today) {
      thisYearAnniversary.setFullYear(today.getFullYear() + 1)
    }

    return thisYearAnniversary <= thirtyDaysLater
  }).map(emp => {
    const joining = new Date(emp.joiningDate!)
    const years = today.getFullYear() - joining.getFullYear()
    const thisYearAnniversary = new Date(today.getFullYear(), joining.getMonth(), joining.getDate())
    if (thisYearAnniversary < today) {
      thisYearAnniversary.setFullYear(today.getFullYear() + 1)
    }
    const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      ...emp,
      yearsCompleting: thisYearAnniversary.getFullYear() - joining.getFullYear(),
      daysUntil
    }
  }).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5)

  return {
    employees,
    leaveRequests,
    attendance,
    candidates,
    escalations,
    appreciations,
    upcomingInterviews,
    pendingOffers,
    upcomingAnniversaries,
    pendingVerifications
  }
  } catch (error) {
    console.error('Error fetching HR dashboard data:', error)
    return {
      employees: [],
      leaveRequests: [],
      attendance: [],
      candidates: [],
      escalations: [],
      appreciations: [],
      upcomingInterviews: [],
      pendingOffers: [],
      upcomingAnniversaries: [],
      pendingVerifications: [],
    }
  }
}

export default async function HRPage() {
  // Role-based access: Only SUPER_ADMIN, MANAGER, HR can access
  await requirePageAuth(HR_ACCESS)

  const {
    employees,
    leaveRequests,
    attendance,
    candidates,
    escalations,
    appreciations,
    upcomingInterviews,
    pendingOffers,
    upcomingAnniversaries,
    pendingVerifications
  } = await getHRData()

  const stats = {
    totalEmployees: employees.length,
    presentToday: attendance.filter(a => a.status === 'PRESENT').length,
    onLeave: attendance.filter(a => a.status === 'LEAVE').length,
    pendingLeaves: leaveRequests.length,
    activeCandidates: candidates.length,
    openEscalations: escalations.length,
    monthlyAppreciations: appreciations.length,
    pendingOffers: pendingOffers.length,
  }

  const departments = [...new Set(employees.map(e => e.department))] as string[]

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">HR Portal</h1>
            <InfoTooltip
              title={HelpContent.hr.dashboard.title}
              steps={HelpContent.hr.dashboard.steps}
              tips={HelpContent.hr.dashboard.tips}
            />
          </div>
          <p className="text-slate-400 mt-1">Manage employees, hiring, feedback & engagement</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/hiring"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-200 rounded-xl hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Hiring
          </Link>
          <Link
            href="/employee-onboarding"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Employee
          </Link>
        </div>
      </div>

      {/* Pending Verifications Alert */}
      {pendingVerifications.length > 0 && (
        <Link
          href="/hr/verifications"
          className="block bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 hover:bg-amber-500/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-300">
                  {pendingVerifications.length} Employee{pendingVerifications.length > 1 ? 's' : ''} Awaiting Verification
                </p>
                <p className="text-sm text-amber-400/80">
                  {pendingVerifications.slice(0, 3).map(u => u.firstName).join(', ')}
                  {pendingVerifications.length > 3 && ` and ${pendingVerifications.length - 3} more`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <span className="text-sm font-medium">Review Now</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      {/* Stats Row 1 - Core HR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{stats.totalEmployees}</p>
          <p className="text-sm text-slate-400">Total Employees</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">{stats.presentToday}</p>
          <p className="text-sm text-slate-400">Present Today</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-orange-600">{stats.onLeave}</p>
          <p className="text-sm text-slate-400">On Leave</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">{stats.pendingLeaves}</p>
          <p className="text-sm text-slate-400">Pending Requests</p>
        </div>
      </div>

      {/* Stats Row 2 - Hiring & Feedback */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-3xl font-bold text-purple-400">{stats.activeCandidates}</p>
          <p className="text-sm text-purple-400">Active Candidates</p>
        </div>
        <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-4">
          <p className="text-3xl font-bold text-cyan-700">{stats.pendingOffers}</p>
          <p className="text-sm text-cyan-600">Pending Offers</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-3xl font-bold text-red-400">{stats.openEscalations}</p>
          <p className="text-sm text-red-400">Open Escalations</p>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <p className="text-3xl font-bold text-emerald-700">{stats.monthlyAppreciations}</p>
          <p className="text-sm text-emerald-600">Appreciations (Month)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Overview */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Department Overview</h2>
            </div>
            <div className="p-5 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const deptEmployees = employees.filter(e => e.department === dept)
                return (
                  <div key={dept} className="p-4 bg-slate-900/40 rounded-xl">
                    <h3 className="font-semibold text-white">{dept}</h3>
                    <p className="text-2xl font-bold text-blue-400 mt-1">{deptEmployees.length}</p>
                    <p className="text-xs text-slate-400">employees</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Upcoming Interviews</h2>
              <Link href="/hr/interviews" className="text-sm text-blue-400 hover:text-blue-400">View All</Link>
            </div>
            <div className="divide-y divide-white/10">
              {upcomingInterviews.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No upcoming interviews</div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{interview.candidate.name}</p>
                      <p className="text-xs text-slate-400">{interview.candidate.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-200">
                        {formatDateShort(interview.scheduledAt)}
                      </p>
                      <p className="text-xs text-blue-400">{interview.stage.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Open Escalations */}
          {escalations.length > 0 && (
            <div className="glass-card rounded-2xl border border-red-200 overflow-hidden">
              <div className="p-5 border-b border-red-100 bg-red-500/10 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-red-800">Open Escalations</h2>
                <Link href="/hr/escalations" className="text-sm text-red-400 hover:text-red-400">View All</Link>
              </div>
              <div className="divide-y divide-white/10">
                {escalations.map((escalation) => (
                  <div key={escalation.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-white">{escalation.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        escalation.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        escalation.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {escalation.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      <Link href={`/team/${escalation.employee.id}`} className="hover:underline text-blue-400">{escalation.employee.firstName} {escalation.employee.lastName}</Link> - {escalation.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Leave Requests */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Leave Requests</h2>
              <Link href="/hr/leave" className="text-sm text-blue-400 hover:text-blue-400">View All</Link>
            </div>
            <div className="divide-y divide-white/10 max-h-64 overflow-y-auto">
              {leaveRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No pending requests</div>
              ) : (
                leaveRequests.slice(0, 5).map((request) => (
                  <Link key={request.id} href={`/team/${request.user.id}`} className="p-4 block hover:bg-slate-900/40">
                    <div className="flex items-center gap-3 mb-2">
                      <UserAvatar user={{ id: request.user.id, firstName: request.user.firstName }} size="sm" showPreview={false} />
                      <div>
                        <p className="font-medium text-white hover:underline">{request.user.firstName}</p>
                        <p className="text-xs text-slate-400">{request.type}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      {formatDateShort(request.startDate)} - {formatDateShort(request.endDate)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Work Anniversaries */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Work Anniversaries</h2>
              <Link href="/hr/work-anniversaries" className="text-sm text-blue-400 hover:text-blue-400">View All</Link>
            </div>
            <div className="divide-y divide-white/10 max-h-64 overflow-y-auto">
              {upcomingAnniversaries.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No upcoming anniversaries</div>
              ) : (
                upcomingAnniversaries.map((emp) => (
                  <Link key={emp.id} href={`/team/${emp.id}`} className="p-4 flex items-center justify-between hover:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={{ id: emp.id, firstName: emp.firstName, lastName: emp.lastName }} size="sm" showPreview={false} />
                      <div>
                        <p className="font-medium text-white hover:underline">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-slate-400">{emp.yearsCompleting} year{emp.yearsCompleting > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      emp.daysUntil === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      emp.daysUntil <= 7 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-800/50 text-slate-300'
                    }`}>
                      {emp.daysUntil === 0 ? 'Today!' : `${emp.daysUntil}d`}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Appreciations */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Appreciations</h2>
              <Link href="/hr/appreciations" className="text-sm text-blue-400 hover:text-blue-400">View All</Link>
            </div>
            <div className="divide-y divide-white/10 max-h-64 overflow-y-auto">
              {appreciations.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No recent appreciations</div>
              ) : (
                appreciations.map((app) => (
                  <Link key={app.id} href={`/team/${app.employee.id}`} className="p-4 block hover:bg-slate-900/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="font-medium text-white hover:underline">{app.employee.firstName} {app.employee.lastName}</p>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{app.title}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Link href="/directory" className="p-4 rounded-xl border bg-blue-500/10 border-blue-200 hover:shadow-none transition-all">
          <span className="text-blue-400 mb-2 block">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </span>
          <p className="font-medium text-white text-sm">Directory</p>
        </Link>
        <Link href="/hr/attendance" className="p-4 rounded-xl border bg-green-500/10 border-green-200 hover:shadow-none transition-all">
          <span className="text-green-400 mb-2 block">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          <p className="font-medium text-white text-sm">Attendance</p>
        </Link>
        <Link href="/hr/escalations" className="p-4 rounded-xl border bg-red-500/10 border-red-200 hover:shadow-none transition-all">
          <span className="text-red-400 mb-2 block">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </span>
          <p className="font-medium text-white text-sm">Escalations</p>
        </Link>
        <Link href="/hr/employer-branding" className="p-4 rounded-xl border bg-pink-50 border-pink-200 hover:shadow-none transition-all">
          <span className="text-pink-600 mb-2 block">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          </span>
          <p className="font-medium text-white text-sm">Branding</p>
        </Link>
        <Link href="/hr/engagement-activities" className="p-4 rounded-xl border bg-violet-50 border-violet-200 hover:shadow-none transition-all">
          <span className="text-violet-600 mb-2 block">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          <p className="font-medium text-white text-sm">Activities</p>
        </Link>
        <Link href="/hr/manager-reviews" className="p-4 rounded-xl border bg-amber-500/10 border-amber-200 hover:shadow-none transition-all">
          <span className="text-amber-400 mb-2 block">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </span>
          <p className="font-medium text-white text-sm">Reviews</p>
        </Link>
      </div>
    </div>
  )
}
