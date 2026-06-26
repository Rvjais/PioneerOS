import { prisma } from '@/server/db/prisma'
import { requirePageAuth, HR_ACCESS } from '@/server/auth/pageAuth'
import Link from 'next/link'
import { formatDateShort, cn } from '@/shared/utils/cn'
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">HR Portal</h1>
            <InfoTooltip
              title={HelpContent.hr.dashboard.title}
              steps={HelpContent.hr.dashboard.steps}
              tips={HelpContent.hr.dashboard.tips}
            />
          </div>
          <p className="text-slate-500 mt-1 font-medium">Manage employees, hiring, feedback & engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hiring"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Hiring
          </Link>

        </div>
      </div>

      {/* Pending Verifications Alert */}
      {pendingVerifications.length > 0 && (
        <Link
          href="/hr/verifications"
          className="block bg-orange-50 border border-orange-100 rounded-2xl p-5 hover:bg-orange-100/50 transition-all group shadow-sm shadow-orange-500/5"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-[#c96442]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-slate-900">
                  {pendingVerifications.length} Employee{pendingVerifications.length > 1 ? 's' : ''} Awaiting Verification
                </p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {pendingVerifications.slice(0, 3).map(u => u.firstName).join(', ')}
                  {pendingVerifications.length > 3 && ` and ${pendingVerifications.length - 3} more`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#c96442] font-black text-[10px] uppercase tracking-widest bg-white px-4 py-2 rounded-lg shadow-sm border border-orange-100">
              Review Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Employees', value: stats.totalEmployees, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Present Today', value: stats.presentToday, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'On Leave', value: stats.onLeave, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pending Requests', value: stats.pendingLeaves, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color.replace('text', 'bg')} opacity-40`} style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Department Overview */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Department Overview</h2>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const deptEmployees = employees.filter(e => e.department === dept)
                return (
                  <div key={dept} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl group hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#c96442]">{dept}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold text-slate-900">{deptEmployees.length}</p>
                      <span className="text-[11px] font-bold text-slate-400 mb-1">employees</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upcoming Interviews</h2>
              <Link href="/hr/interviews" className="text-[10px] font-black text-[#c96442] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingInterviews.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400 font-medium">No upcoming interviews scheduled.</p>
                </div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="px-8 py-5 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {interview.candidate.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{interview.candidate.name}</p>
                        <p className="text-[11px] font-medium text-slate-400">{interview.candidate.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatDateShort(interview.scheduledAt)}
                      </p>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{interview.stage.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Open Escalations */}
          {escalations.length > 0 && (
            <div className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-red-50 bg-red-50/30 flex items-center justify-between">
                <h2 className="text-xl font-bold text-red-900 tracking-tight">Open Escalations</h2>
                <Link href="/hr/escalations" className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">View All</Link>
              </div>
              <div className="divide-y divide-slate-50">
                {escalations.map((escalation) => (
                  <div key={escalation.id} className="px-8 py-5 hover:bg-red-50/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-slate-900">{escalation.title}</p>
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest",
                        escalation.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                        escalation.severity === 'HIGH' ? 'bg-red-100 text-red-600' :
                        'bg-orange-100 text-orange-600'
                      )}>
                        {escalation.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium">
                      <Link href={`/team/${escalation.employee.id}`} className="text-[#c96442] hover:underline font-bold">
                        {escalation.employee.firstName} {escalation.employee.lastName}
                      </Link>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 uppercase tracking-wider">{escalation.type.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Leave Requests */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Leave Requests</h2>
              <Link href="/hr/leave" className="text-[10px] font-black text-[#c96442] uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {leaveRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">No pending requests</div>
              ) : (
                leaveRequests.slice(0, 5).map((request) => (
                  <Link key={request.id} href={`/team/${request.user.id}`} className="p-5 block hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <UserAvatar user={{ id: request.user.id, firstName: request.user.firstName }} size="sm" showPreview={false} className="ring-2 ring-white shadow-sm" />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{request.user.firstName}</p>
                        <p className="text-[11px] font-medium text-[#c96442]">{request.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDateShort(request.startDate)} - {formatDateShort(request.endDate)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Work Anniversaries */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Anniversaries</h2>
              <Link href="/hr/work-anniversaries" className="text-[10px] font-black text-[#c96442] uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingAnniversaries.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">No upcoming anniversaries</div>
              ) : (
                upcomingAnniversaries.map((emp) => (
                  <Link key={emp.id} href={`/team/${emp.id}`} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={{ id: emp.id, firstName: emp.firstName, lastName: emp.lastName }} size="sm" showPreview={false} className="ring-2 ring-white shadow-sm" />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[11px] font-medium text-[#c96442]">{emp.yearsCompleting} Year{emp.yearsCompleting > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest",
                      emp.daysUntil === 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' :
                      emp.daysUntil <= 7 ? 'bg-orange-100 text-[#c96442]' :
                      'bg-slate-100 text-slate-500'
                    )}>
                      {emp.daysUntil === 0 ? 'Today!' : `${emp.daysUntil}d`}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Appreciations */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Appreciations</h2>
              <Link href="/hr/appreciations" className="text-[10px] font-black text-[#c96442] uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {appreciations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">No recent appreciations</div>
              ) : (
                appreciations.map((app) => (
                  <Link key={app.id} href={`/team/${app.employee.id}`} className="p-5 block hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="font-bold text-slate-900 leading-tight">{app.employee.firstName} {app.employee.lastName}</p>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed italic">"{app.title}"</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Quick Management</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Directory', href: '/directory', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', bg: 'bg-white hover:border-blue-200 text-blue-600' },
            { label: 'Attendance', href: '/hr/attendance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-white hover:border-emerald-200 text-emerald-600' },
            { label: 'Escalations', href: '/hr/escalations', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', bg: 'bg-white hover:border-red-200 text-red-600' },
            { label: 'Branding', href: '/hr/employer-branding', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', bg: 'bg-white hover:border-pink-200 text-pink-600' },
            { label: 'Activities', href: '/hr/engagement-activities', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-white hover:border-violet-200 text-violet-600' },
            { label: 'Reviews', href: '/hr/manager-reviews', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', bg: 'bg-white hover:border-amber-200 text-amber-600' },
          ].map((link, i) => (
            <Link key={i} href={link.href} className={cn(
              "flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 shadow-sm transition-all group",
              link.bg
            )}>
              <svg className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
