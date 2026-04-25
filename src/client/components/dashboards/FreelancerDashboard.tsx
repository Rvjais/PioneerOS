'use client'

import Link from 'next/link'
import { format } from 'date-fns'

interface FreelancerDashboardProps {
  user: {
    firstName: string
    lastName: string
    department: string
  }
  stats: {
    activeAssignments: number
    completedThisMonth: number
    pendingPayment: number
    totalEarnings: number
    hoursLogged: number
    invoicesPending: number
  }
  assignments: Array<{
    id: string
    client: string
    project: string
    deadline: string
    status: string
    rate: number
  }>
  recentPayments: Array<{
    id: string
    amount: number
    date: string
    status: string
    project: string
  }>
  workReports: Array<{
    id: string
    date: string
    hours: number
    description: string
    status: string
  }>
}

export function FreelancerDashboard({
  user,
  stats,
  assignments,
  recentPayments,
  workReports,
}: FreelancerDashboardProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {user.firstName}!
            </h1>
            <p className="text-violet-100 mt-1">
              Freelancer &bull; {user.department}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">₹{stats.totalEarnings.toLocaleString()}</p>
            <p className="text-violet-100 text-sm">Total Earnings</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.activeAssignments}</p>
          <p className="text-sm text-slate-400">Active Assignments</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.completedThisMonth}</p>
          <p className="text-sm text-slate-400">Completed This Month</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{stats.hoursLogged}h</p>
          <p className="text-sm text-slate-400">Hours Logged</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-emerald-400">₹{stats.pendingPayment.toLocaleString()}</p>
          <p className="text-sm text-slate-400">Pending Payment</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-amber-400">{stats.invoicesPending}</p>
          <p className="text-sm text-slate-400">Invoices Pending</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{Math.round((stats.completedThisMonth / Math.max(stats.activeAssignments + stats.completedThisMonth, 1)) * 100)}%</p>
          <p className="text-sm text-slate-400">Completion Rate</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Assignments */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Assignments</h2>
            <Link href="/freelancer/assignments" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {assignments.length === 0 ? (
              <div className="p-5 text-center text-slate-400">No active assignments</div>
            ) : (
              assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="p-4 hover:bg-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{assignment.project}</p>
                      <p className="text-sm text-slate-400">{assignment.client}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                      assignment.status === 'PENDING_REVIEW' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-white/5 text-slate-300'
                    }`}>
                      {assignment.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Due: {format(new Date(assignment.deadline), 'MMM d')}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      ₹{assignment.rate}/unit
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Work Reports */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Work Reports</h2>
            <Link href="/freelancer/reports" className="text-sm text-blue-400 hover:text-blue-300">
              Submit Report
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {workReports.length === 0 ? (
              <div className="p-5 text-center text-slate-400">No work reports submitted</div>
            ) : (
              workReports.slice(0, 5).map((report) => (
                <div key={report.id} className="p-4 hover:bg-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white">{report.description}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(report.date), 'MMM d, yyyy')} &bull; {report.hours}h
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      report.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                      report.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Payment History</h2>
            <Link href="/freelancer/payments" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentPayments.length === 0 ? (
              <div className="p-5 text-center text-slate-400">No payment history</div>
            ) : (
              recentPayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                  <div>
                    <p className="font-medium text-white">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{payment.project}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      payment.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' :
                      payment.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {payment.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(payment.date), 'MMM d')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/freelancer/reports/new"
              className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl hover:border-violet-500/40 transition-colors text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Submit Report</p>
            </Link>
            <Link
              href="/freelancer/invoices/new"
              className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-colors text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Request Payment</p>
            </Link>
            <Link
              href="/tasks/daily"
              className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-colors text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Daily Tasks</p>
            </Link>
            <Link
              href="/profile"
              className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl hover:border-amber-500/40 transition-colors text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">My Profile</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Freelancer Guidelines</h3>
            <p className="text-sm text-slate-400 mt-1">
              Remember to submit your daily work reports before 7 PM. Payment requests are processed weekly on Fridays.
              Ensure all deliverables are reviewed before final submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
