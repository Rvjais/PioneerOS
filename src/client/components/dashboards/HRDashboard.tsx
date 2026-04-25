'use client'

import Link from 'next/link'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface HRDashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  stats: {
    pendingVerifications: number
    pendingLeaveRequests: number
    activeEmployees: number
    newJoinersThisMonth: number
    upcomingAppraisals: number
    openPositions: number
  }
  pendingVerifications: Array<{
    id: string
    firstName: string
    lastName: string
    department: string
    joiningDate: string
  }>
  leaveRequests: Array<{
    id: string
    userId: string
    user: { firstName: string; lastName: string }
    leaveType: string
    startDate: string
    endDate: string
    status: string
  }>
  upcomingBirthdays: Array<{
    id: string
    firstName: string
    lastName: string
    department: string
    dateOfBirth: string
  }>
  onboardingProgress: Array<{
    id: string
    userId: string
    user: { firstName: string; lastName: string; department: string }
    completedSteps: number
    totalSteps: number
  }>
  attendanceToday: {
    present: number
    absent: number
    wfh: number
    onLeave: number
  }
}

export function HRDashboard({
  user,
  stats,
  pendingVerifications,
  leaveRequests,
  upcomingBirthdays,
  onboardingProgress,
  attendanceToday,
}: HRDashboardProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user.firstName}!</h1>
          <p className="text-slate-400 mt-1">People operations at a glance</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/hr/candidates"
            className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
          >
            View Candidates
          </Link>
          <Link
            href="/hr/leave"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-none transition-all"
          >
            Manage Leave
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.pendingVerifications}</p>
          <p className="text-sm text-slate-400">Pending Verifications</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.pendingLeaveRequests}</p>
          <p className="text-sm text-slate-400">Leave Requests</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.activeEmployees}</p>
          <p className="text-sm text-slate-400">Active Employees</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.newJoinersThisMonth}</p>
          <p className="text-sm text-slate-400">New This Month</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.upcomingAppraisals}</p>
          <p className="text-sm text-slate-400">Due Appraisals</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.openPositions}</p>
          <p className="text-sm text-slate-400">Open Positions</p>
        </div>
      </div>

      {/* Attendance Today */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Today&apos;s Attendance</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-3xl font-bold text-emerald-600">{attendanceToday.present}</p>
            <p className="text-sm font-medium text-slate-600">Present</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-3xl font-bold text-red-600">{attendanceToday.absent}</p>
            <p className="text-sm font-medium text-slate-600">Absent</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-3xl font-bold text-blue-600">{attendanceToday.wfh}</p>
            <p className="text-sm font-medium text-slate-600">WFH</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-3xl font-bold text-amber-600">{attendanceToday.onLeave}</p>
            <p className="text-sm font-medium text-slate-600">On Leave</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Pending Verifications</h2>
            <Link href="/hr/verifications" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingVerifications.length === 0 ? (
              <div className="p-5 text-center text-slate-500">No pending verifications</div>
            ) : (
              pendingVerifications.slice(0, 5).map((user) => (
                <Link key={user.id} href={`/team/${user.id}`} className="p-4 flex items-center justify-between hover:bg-slate-50 block">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={{ id: user.id, firstName: user.firstName, lastName: user.lastName, department: user.department }} size="md" showPreview={false} />
                    <div>
                      <p className="font-semibold text-slate-900 hover:underline">{user.firstName} {user.lastName}</p>
                      <p className="text-sm font-medium text-slate-500">{user.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500">Joined</p>
                    <p className="text-sm font-medium text-slate-500">
                      {formatDistanceToNow(new Date(user.joiningDate), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Leave Requests</h2>
            <Link href="/hr/leave" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {leaveRequests.length === 0 ? (
              <div className="p-5 text-center text-slate-500">No pending leave requests</div>
            ) : (
              leaveRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <Link href={`/team/${request.userId}`} className="hover:underline">
                      <p className="font-semibold text-slate-900">
                        {request.user.firstName} {request.user.lastName}
                      </p>
                    </Link>
                    <p className="text-sm font-medium text-slate-500">
                      {request.leaveType} &bull; {formatDateDDMMYYYY(request.startDate)} - {formatDateDDMMYYYY(request.endDate)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    request.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {request.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Birthdays</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingBirthdays.length === 0 ? (
              <div className="p-5 text-center text-slate-500">No upcoming birthdays</div>
            ) : (
              upcomingBirthdays.slice(0, 5).map((person) => (
                <Link key={person.id} href={`/team/${person.id}`} className="p-4 flex items-center gap-3 hover:bg-slate-50 block">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xl shadow-sm">
                    🎂
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 hover:underline">{person.firstName} {person.lastName}</p>
                    <p className="text-sm font-medium text-slate-500">{person.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-pink-600">
                      {new Date(person.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Onboarding Progress */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Onboarding Progress</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {onboardingProgress.length === 0 ? (
              <div className="p-5 text-center text-slate-500">No active onboarding</div>
            ) : (
              onboardingProgress.slice(0, 5).map((item) => {
                const progress = (item.completedSteps / item.totalSteps) * 100
                return (
                  <Link key={item.id} href={`/team/${item.userId}`} className="p-4 hover:bg-slate-50 block">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900 hover:underline">
                        {item.user.firstName} {item.user.lastName}
                      </p>
                      <span className="text-sm font-medium text-slate-500">
                        {item.completedSteps}/{item.totalSteps} steps
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100 ? 'bg-emerald-500' :
                          progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/hr/candidates/new"
            className="p-4 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-blue-700">Add Candidate</p>
          </Link>
          <Link
            href="/hr/leave"
            className="p-4 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-purple-700">Manage Leave</p>
          </Link>
          <Link
            href="/hr/appraisals"
            className="p-4 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-emerald-700">Appraisals</p>
          </Link>
          <Link
            href="/admin/users"
            className="p-4 bg-white border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-amber-700">All Employees</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
