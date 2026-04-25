import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'

async function getFreelancerData(userId: string) {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId },
    include: {
      workReports: {
        orderBy: { submittedAt: 'desc' },
        take: 5,
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        take: 5,
      },
    },
  })

  if (!profile) {
    // Create profile if doesn't exist
    await prisma.freelancerProfile.create({
      data: { userId },
    })
    return {
      profile: null,
      stats: { totalEarned: 0, pendingAmount: 0, pendingReports: 0, totalReports: 0 },
      recentReports: [],
      recentPayments: [],
    }
  }

  const pendingReports = await prisma.freelancerWorkReport.count({
    where: {
      freelancerProfileId: profile.id,
      status: { in: ['SUBMITTED', 'REVIEWED'] },
    },
  })

  const totalReports = await prisma.freelancerWorkReport.count({
    where: { freelancerProfileId: profile.id },
  })

  return {
    profile,
    stats: {
      totalEarned: profile.totalEarned,
      pendingAmount: profile.pendingAmount,
      pendingReports,
      totalReports,
    },
    recentReports: profile.workReports,
    recentPayments: profile.payments,
  }
}

export default async function FreelancerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (session.user.role !== 'FREELANCER' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  const { stats, recentReports, recentPayments } = await getFreelancerData(session.user.id)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  const formatDate = (date: Date) =>
    formatDateDDMMYYYY(date)

  const statusColors: Record<string, string> = {
    SUBMITTED: 'bg-yellow-500/20 text-yellow-400',
    REVIEWED: 'bg-blue-500/20 text-blue-400',
    APPROVED: 'bg-green-500/20 text-green-400',
    REJECTED: 'bg-red-500/20 text-red-400',
    PAID: 'bg-emerald-500/20 text-emerald-400',
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
    FAILED: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="freelancer"
        title="Freelancer Dashboard"
        description="Manage work reports, track payments, and view assignments."
        steps={[
          { label: 'View assigned tasks', description: 'Check tasks and projects assigned to you' },
          { label: 'Submit work reports', description: 'Log completed work with billable amounts' },
          { label: 'Track payments', description: 'Monitor payment status and total earnings' },
          { label: 'Check daily plan', description: 'Review your daily task plan and deliverables' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Freelancer Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your work reports and track payments</p>
        </div>
        <Link
          href="/freelancer/work-reports/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Work Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalEarned)}</p>
          <p className="text-sm text-slate-400">Total Earned</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
          <p className="text-sm text-slate-400">Pending Amount</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.pendingReports}</p>
          <p className="text-sm text-slate-400">Pending Reports</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{stats.totalReports}</p>
          <p className="text-sm text-slate-400">Total Reports</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Work Reports */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Work Reports</h2>
            <Link href="/freelancer/work-reports" className="text-sm text-blue-400 hover:text-blue-400">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No work reports yet</p>
            ) : (
              recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium text-white">{report.projectName}</p>
                    <p className="text-sm text-slate-400">{formatDate(report.submittedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(report.billableAmount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[report.status]}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Payments</h2>
            <Link href="/freelancer/payments" className="text-sm text-blue-400 hover:text-blue-400">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No payments yet</p>
            ) : (
              recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium text-white">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-slate-400">{formatDate(payment.paymentDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{payment.paymentMethod}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[payment.status]}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/freelancer/work-reports" className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Work Reports</p>
              <p className="text-sm text-slate-400">View all submissions</p>
            </div>
          </div>
        </Link>
        <Link href="/freelancer/payments" className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Payments</p>
              <p className="text-sm text-slate-400">Track your earnings</p>
            </div>
          </div>
        </Link>
        <Link href="/freelancer" className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-white">Profile</p>
              <p className="text-sm text-slate-400">Update payment details</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
