import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getFinanceData() {
  const [invoices, expenses, clients] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.expense.findMany({
      orderBy: { date: 'desc' },
      take: 100,
    }),
    prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, monthlyFee: true },
    }),
  ])

  return { invoices, expenses, clients }
}

export default async function FinanceReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { invoices, expenses, clients } = await getFinanceData()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate metrics
  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0)
  const totalExpenses = expenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'

  const pendingInvoices = invoices.filter(i => i.status === 'SENT')
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE')
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.total, 0)
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.total, 0)

  // MRR from active clients
  const mrr = clients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

  // Group expenses by category
  const expensesByCategory: Record<string, number> = expenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Reports</h1>
          <p className="text-slate-400 mt-1">Comprehensive financial overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-white/20 text-slate-200 rounded-xl hover:bg-slate-900/40 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Revenue</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Expenses</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg ${netProfit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">Net Profit</p>
              <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-400'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">Profit Margin</p>
              <p className="text-xl font-bold text-white">{profitMargin}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* MRR and Receivables */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Recurring Revenue</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{formatCurrency(mrr)}</p>
              <p className="text-sm text-slate-400 mt-1">from {clients.length} active clients</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Projected ARR</p>
              <p className="text-xl font-semibold text-white">{formatCurrency(mrr * 12)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Accounts Receivable</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Pending PIs</span>
              <span className="font-semibold text-amber-400">{formatCurrency(pendingAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Overdue PIs</span>
              <span className="font-semibold text-red-400">{formatCurrency(overdueAmount)}</span>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="font-medium text-white">Total Outstanding</span>
              <span className="font-bold text-white">{formatCurrency(pendingAmount + overdueAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Expense Breakdown</h2>
        <div className="space-y-4">
          {Object.entries(expensesByCategory)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([category, amount]) => {
              const percentage = totalExpenses > 0 ? ((amount as number) / totalExpenses) * 100 : 0
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-200">{category}</span>
                    <span className="font-medium text-white">{formatCurrency(amount as number)}</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/finance/invoices"
          className="glass-card rounded-xl border border-white/10 p-6 hover:border-blue-300 transition-colors"
        >
          <h3 className="font-semibold text-white">Proforma Invoices</h3>
          <p className="text-sm text-slate-400 mt-1">View and manage all proforma invoices</p>
        </Link>
        <Link
          href="/finance/expenses"
          className="glass-card rounded-xl border border-white/10 p-6 hover:border-blue-300 transition-colors"
        >
          <h3 className="font-semibold text-white">Expenses</h3>
          <p className="text-sm text-slate-400 mt-1">Track company expenses</p>
        </Link>
        <Link
          href="/accounts/ledger"
          className="glass-card rounded-xl border border-white/10 p-6 hover:border-blue-300 transition-colors"
        >
          <h3 className="font-semibold text-white">Client Ledger</h3>
          <p className="text-sm text-slate-400 mt-1">View client payment history</p>
        </Link>
      </div>
    </div>
  )
}
