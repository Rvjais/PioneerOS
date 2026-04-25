import prisma from '@/server/db/prisma'
import { requirePageAuth, ACCOUNTS_ACCESS } from '@/server/auth/pageAuth'
import Link from 'next/link'
import { formatDateShort } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { HelpContent } from '@/shared/constants/helpContent'
import { ordinal } from '@/shared/utils/utils'

async function getAccountsData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const thisWeekEnd = new Date(today)
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7)

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  const [
    pendingOnboardings,
    awaitingSLA,
    awaitingPayment,
    activeClientsData,
    recentPayments,
    todayFollowUps,
    overdueClients,
    dueThisWeek,
    recentInvoices
  ] = await Promise.all([
    // Pending onboardings
    prisma.client.findMany({
      where: { onboardingStatus: { in: ['PENDING', 'IN_PROGRESS'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // Awaiting SLA
    prisma.client.findMany({
      where: { onboardingStatus: 'AWAITING_SLA' },
      orderBy: { updatedAt: 'desc' },
    }),
    // Awaiting Payment
    prisma.client.findMany({
      where: { onboardingStatus: 'AWAITING_PAYMENT' },
      orderBy: { updatedAt: 'desc' },
    }),
    // Active clients with payment info
    prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        pendingAmount: true,
        currentPaymentStatus: true,
        paymentDueDay: true,
        haltReminders: true
      }
    }),
    // Recent payments this month
    prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: thisMonthStart, lt: nextMonthStart },
        status: 'CONFIRMED'
      },
      include: {
        client: { select: { id: true, name: true } }
      },
      orderBy: { collectedAt: 'desc' },
      take: 10
    }),
    // Today's follow-ups
    prisma.paymentFollowUp.findMany({
      where: {
        date: { gte: today, lt: tomorrow }
      },
      include: {
        client: { select: { id: true, name: true, pendingAmount: true, whatsapp: true } }
      }
    }),
    // Overdue clients
    prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        currentPaymentStatus: 'OVERDUE'
      },
      select: {
        id: true,
        name: true,
        pendingAmount: true,
        paymentDueDay: true
      },
      orderBy: { pendingAmount: 'desc' }
    }),
    // Due this week (clients with due day within next 7 days)
    prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { currentPaymentStatus: 'PENDING' },
          { currentPaymentStatus: null }
        ],
        paymentDueDay: {
          gte: today.getDate(),
          lte: today.getDate() + 7 > 28 ? 28 : today.getDate() + 7
        }
      },
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        paymentDueDay: true
      }
    }),
    // Recent invoices
    prisma.invoice.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  // Calculate metrics
  const activeClients = activeClientsData.length
  const totalExpected = activeClientsData.reduce((sum, c) => sum + (c.monthlyFee || 0), 0)
  const totalCollected = recentPayments.reduce((sum, p) => sum + p.grossAmount, 0)
  const totalPending = activeClientsData.reduce((sum, c) => sum + (c.pendingAmount || 0), 0)
  const totalOverdue = overdueClients.reduce((sum, c) => sum + (c.pendingAmount || 0), 0)
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0

  // Today's focus
  const dueTodayClients = activeClientsData.filter(c => c.paymentDueDay === today.getDate())

  return {
    pendingOnboardings,
    awaitingSLA,
    awaitingPayment,
    activeClients,
    totalExpected,
    totalCollected,
    totalPending,
    totalOverdue,
    collectionRate,
    recentPayments,
    todayFollowUps,
    overdueClients,
    dueThisWeek,
    dueTodayClients,
    recentInvoices,
  }
}

export default async function AccountsDashboardPage() {
  // Role-based access control: Only SUPER_ADMIN, MANAGER, ACCOUNTS can access
  await requirePageAuth(ACCOUNTS_ACCESS)

  const data = await getAccountsData()
  const today = new Date()
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-6 pb-8">
      {/* Command Center Header */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{greeting}!</h1>
              <InfoTooltip
                title={HelpContent.accounts.dashboard.title}
                steps={HelpContent.accounts.dashboard.steps}
                tips={HelpContent.accounts.dashboard.tips}
              />
            </div>
            <p className="text-slate-400 mt-1">
              {formatDateShort(today)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data.overdueClients.length > 0 && (
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                </span>
                {data.overdueClients.length} Overdue
              </div>
            )}
            {data.awaitingSLA.length > 0 && (
              <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                {data.awaitingSLA.length} SLA Pending
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Today's Focus
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Due Today</p>
            <p className="text-2xl font-bold text-white">{data.dueTodayClients.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              ₹{(data.dueTodayClients.reduce((s, c) => s + (c.monthlyFee || 0), 0) / 1000).toFixed(0)}K expected
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Follow-ups Logged</p>
            <p className="text-2xl font-bold text-white">{data.todayFollowUps.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              {data.todayFollowUps.filter(f => f.status === 'DONE').length} completed
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Overdue Actions</p>
            <p className="text-2xl font-bold text-red-400">{data.overdueClients.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              ₹{(data.totalOverdue / 100000).toFixed(2)}L total
            </p>
          </div>
        </div>
      </div>

      {/* Collection Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-slate-400">This Month</span>
          </div>
          <p className="text-2xl font-bold text-white">₹{(data.totalExpected / 100000).toFixed(2)}L</p>
          <p className="text-sm text-slate-400">Expected Revenue</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${data.collectionRate >= 80 ? 'bg-green-500/20 text-green-400' : data.collectionRate >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
              {data.collectionRate.toFixed(0)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-green-400">₹{(data.totalCollected / 100000).toFixed(2)}L</p>
          <p className="text-sm text-slate-400">Collected</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-slate-400">{data.dueThisWeek.length} due soon</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">₹{(data.totalPending / 100000).toFixed(2)}L</p>
          <p className="text-sm text-slate-400">Pending</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-xs text-red-400">{data.overdueClients.length} clients</span>
          </div>
          <p className="text-2xl font-bold text-red-400">₹{(data.totalOverdue / 100000).toFixed(2)}L</p>
          <p className="text-sm text-slate-400">Overdue</p>
        </div>
      </div>

      {/* Quick Entry Banner */}
      <Link href="/accounts/quick-entry" className="block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl p-5 transition-all shadow-none hover:shadow-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quick Entry</h3>
              <p className="text-emerald-100 text-sm">Fast payment, expense & invoice entry</p>
            </div>
          </div>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Link href="/finance/invoices/new" className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 text-white transition-colors flex flex-col items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium">Generate PI</span>
        </Link>
        <Link href="/accounts/payment-tracker" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl p-4 text-white transition-colors flex flex-col items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-medium">Record Payment</span>
        </Link>
        <Link href="/accounts/bank-statements" className="bg-purple-600 hover:bg-purple-700 rounded-xl p-4 text-white transition-colors flex flex-col items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium">Upload Statement</span>
        </Link>
        <Link href="/accounts/roi" className="bg-orange-600 hover:bg-orange-700 rounded-xl p-4 text-white transition-colors flex flex-col items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-medium">View ROI</span>
        </Link>
        <Link href="/accounts/auto-invoice" className="bg-cyan-600 hover:bg-cyan-700 rounded-xl p-4 text-white transition-colors flex flex-col items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium">Auto-Invoice</span>
        </Link>
        <Link href="/accounts/meetings/monthly" className="bg-slate-600 hover:bg-slate-700 rounded-xl p-4 text-white transition-colors flex flex-col items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Monthly Review</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="space-y-4">
          {/* Awaiting SLA */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Awaiting SLA ({data.awaitingSLA.length})
              </h2>
              <Link href="/accounts/contracts" className="text-sm text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-700 max-h-48 overflow-y-auto">
              {data.awaitingSLA.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No clients awaiting SLA</div>
              ) : (
                data.awaitingSLA.slice(0, 4).map((client) => (
                  <Link key={client.id} href={`/accounts/contracts/${client.id}`} className="flex items-center justify-between p-3 hover:bg-slate-700/50 transition-colors">
                    <div>
                      <p className="font-medium text-white text-sm">{client.name}</p>
                      <p className="text-xs text-slate-400">{client.contactName}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded">Prepare SLA</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Awaiting Payment */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Awaiting Payment ({data.awaitingPayment.length})
              </h2>
              <Link href="/accounts/onboardings" className="text-sm text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-700 max-h-48 overflow-y-auto">
              {data.awaitingPayment.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No clients awaiting payment</div>
              ) : (
                data.awaitingPayment.slice(0, 4).map((client) => (
                  <Link key={client.id} href={`/accounts/contracts/${client.id}`} className="flex items-center justify-between p-3 hover:bg-slate-700/50 transition-colors">
                    <div>
                      <p className="font-medium text-white text-sm">{client.name}</p>
                      <p className="text-xs text-slate-400">₹{client.monthlyFee ? (client.monthlyFee / 1000).toFixed(0) + 'K/mo' : '-'}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">Confirm</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Due This Week */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Due This Week ({data.dueThisWeek.length})
              </h2>
              <Link href="/accounts/payment-tracker" className="text-sm text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-700 max-h-48 overflow-y-auto">
              {data.dueThisWeek.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No payments due this week</div>
              ) : (
                data.dueThisWeek.slice(0, 4).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium text-white text-sm">{client.name}</p>
                      <p className="text-xs text-slate-400">Due: {ordinal(client.paymentDueDay || 0)}</p>
                    </div>
                    <p className="text-sm font-medium text-white">₹{((client.monthlyFee || 0) / 1000).toFixed(0)}K</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          {/* Recent Payments */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Recent Payments
              </h2>
              <Link href="/accounts/analytics" className="text-sm text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
              {data.recentPayments.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No payments this month</div>
              ) : (
                data.recentPayments.slice(0, 6).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium text-white text-sm">{payment.client.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatDateShort(payment.collectedAt)}
                        {' · '}{payment.paymentMethod}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-green-400">+₹{(payment.grossAmount / 1000).toFixed(0)}K</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Recent Invoices
              </h2>
              <Link href="/finance/invoices" className="text-sm text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
              {data.recentInvoices.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No recent invoices</div>
              ) : (
                data.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium text-white text-sm">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-slate-400">{invoice.client.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">₹{(invoice.total / 1000).toFixed(0)}K</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        invoice.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                        invoice.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                        invoice.status === 'SENT' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-600 text-slate-300'
                      }`}>{invoice.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Clients Alert */}
      {data.overdueClients.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-red-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Overdue Payments Requiring Attention
            </h3>
            <Link href="/accounts/manage?status=OVERDUE" className="text-sm text-red-400 hover:underline">View All</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.overdueClients.slice(0, 6).map((client) => (
              <div key={client.id} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{client.name}</p>
                  <p className="text-xs text-slate-400">Due: {ordinal(client.paymentDueDay || 0)}</p>
                </div>
                <p className="text-sm font-bold text-red-400">₹{((client.pendingAmount || 0) / 1000).toFixed(0)}K</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Analytics */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Advanced Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/accounts/aging-report" className="glass-card rounded-xl border border-white/10 p-4 hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white group-hover:text-red-300">AR Aging Report</p>
            <p className="text-xs text-slate-400 mt-0.5">Receivables by aging bucket</p>
          </Link>
          <Link href="/accounts/client-profitability" className="glass-card rounded-xl border border-white/10 p-4 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white group-hover:text-emerald-300">Client Profitability</p>
            <p className="text-xs text-slate-400 mt-0.5">Per-client P&L analysis</p>
          </Link>
          <Link href="/accounts/revenue-forecast" className="glass-card rounded-xl border border-white/10 p-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white group-hover:text-blue-300">Revenue Forecast</p>
            <p className="text-xs text-slate-400 mt-0.5">Cash flow projections</p>
          </Link>
          <Link href="/accounts/tax-compliance" className="glass-card rounded-xl border border-white/10 p-4 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white group-hover:text-purple-300">Tax Compliance</p>
            <p className="text-xs text-slate-400 mt-0.5">GST & TDS reports</p>
          </Link>
          <Link href="/accounts/reconciliation-summary" className="glass-card rounded-xl border border-white/10 p-4 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white group-hover:text-cyan-300">Reconciliation</p>
            <p className="text-xs text-slate-400 mt-0.5">Bank statement matching</p>
          </Link>
          <Link href="/accounts/onboarding-analytics" className="glass-card rounded-xl border border-white/10 p-4 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white group-hover:text-amber-300">Onboarding Pipeline</p>
            <p className="text-xs text-slate-400 mt-0.5">Conversion funnel & SLA</p>
          </Link>
          <Link href="/accounts/discrepancies" className="glass-card rounded-xl border border-white/10 p-4 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group">
            <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white group-hover:text-rose-300">Discrepancies</p>
            <p className="text-xs text-slate-400 mt-0.5">Financial issue detection</p>
          </Link>
          <Link href="/accounts/pending-payments" className="glass-card rounded-xl border border-white/10 p-4 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white group-hover:text-orange-300">Pending Payments</p>
            <p className="text-xs text-slate-400 mt-0.5">Outstanding collections</p>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-wrap gap-3">
        <Link href="/accounts/manage" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Manage Clients
        </Link>
        <Link href="/accounts/analytics" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Revenue Analytics
        </Link>
        <Link href="/accounts/ledger" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Ledger
        </Link>
        <Link href="/accounts/contracts" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Contracts
        </Link>
        <Link href="/accounts/onboardings" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Onboardings
        </Link>
      </div>
    </div>
  )
}
