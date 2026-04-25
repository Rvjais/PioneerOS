import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getInvoices() {
  return prisma.invoice.findMany({
    include: {
      client: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const invoices = await getInvoices()

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-800/50 text-slate-200',
    SENT: 'bg-blue-500/20 text-blue-400',
    PAID: 'bg-green-500/20 text-green-400',
    OVERDUE: 'bg-red-500/20 text-red-400',
    CANCELLED: 'bg-slate-800/50 text-slate-400',
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    pending: invoices.filter(i => i.status === 'SENT').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0),
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Proforma Invoices (PI)</h1>
          <p className="text-slate-400 mt-1">Manage client proforma invoices and payments</p>
        </div>
        <Link
          href="/finance/invoices/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create PI
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total PIs</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Amount</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Paid</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(stats.paidAmount)}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Overdue</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.overdue}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">PI #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No proforma invoices yet. Create your first PI to get started.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200">{invoice.client.name}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/finance/invoices/${invoice.id}`}
                        className="text-blue-400 hover:text-blue-400 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
