import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getPendingPayments() {
  // First get all active clients
  const clients = await prisma.client.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      monthlyFee: true,
      pendingAmount: true,
      advanceAmount: true,
      paymentDueDay: true,
      paymentStatus: true,
      tier: true,
      status: true,
    },
    orderBy: { name: 'asc' },
  })

  // Get unpaid invoices per client to calculate actual pending
  const unpaidInvoices = await prisma.invoice.groupBy({
    by: ['clientId'],
    where: {
      status: { in: ['SENT', 'OVERDUE'] },
    },
    _sum: {
      total: true,
    },
  })

  const invoicePendingMap = new Map(
    unpaidInvoices.map(inv => [inv.clientId, inv._sum.total || 0])
  )

  // Calculate pending amount from invoices if pendingAmount is null/0
  const enrichedClients = clients.map(client => {
    const invoicePending = invoicePendingMap.get(client.id) || 0
    // Use pendingAmount if set, otherwise use monthlyFee for active clients with unpaid status
    const calculatedPending = client.pendingAmount || invoicePending ||
      (client.paymentStatus !== 'PAID' && client.monthlyFee ? client.monthlyFee : 0)

    return {
      ...client,
      pendingAmount: calculatedPending,
    }
  })

  // Filter to only show clients with actual pending amounts
  return enrichedClients
    .filter(c => c.pendingAmount > 0 || c.paymentStatus !== 'PAID')
    .sort((a, b) => (b.pendingAmount || 0) - (a.pendingAmount || 0))
}

export default async function PendingPaymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const clients = await getPendingPayments()

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const today = new Date()
  const todayDate = today.getDate()

  const formatDate = (day: number | null) => {
    if (!day) return '-'
    const dueDate = new Date(today.getFullYear(), today.getMonth(), day)
    // If day has passed this month, show next month
    if (dueDate < today) {
      dueDate.setMonth(dueDate.getMonth() + 1)
    }
    return dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const totalPending = clients.reduce((sum, c) => sum + (c.pendingAmount || 0), 0)
  const overdueClients = clients.filter((c) => {
    if (!c.paymentDueDay || !c.pendingAmount || c.pendingAmount <= 0) return false
    return todayDate > c.paymentDueDay
  })

  const statusColors: Record<string, string> = {
    PAID: 'bg-green-500/20 text-green-400',
    PENDING: 'bg-amber-500/20 text-amber-400',
    OVERDUE: 'bg-red-500/20 text-red-400',
    PARTIAL: 'bg-blue-500/20 text-blue-400',
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending Payments</h1>
          <p className="text-slate-400 mt-1">Track and manage outstanding client payments</p>
        </div>
        <Link
          href="/accounts"
          className="px-4 py-2 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Clients with Pending</p>
          <p className="text-2xl font-bold text-white mt-1">{clients.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Overdue Payments</p>
          <p className={`text-2xl font-bold mt-1 ${overdueClients.length > 0 ? 'text-red-400' : 'text-white'}`}>
            {overdueClients.length}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Overdue Amount</p>
          <p className={`text-2xl font-bold mt-1 ${overdueClients.reduce((sum, c) => sum + (c.pendingAmount || 0), 0) > 0
              ? 'text-red-400'
              : 'text-white'
            }`}>
            {formatCurrency(overdueClients.reduce((sum, c) => sum + (c.pendingAmount || 0), 0))}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Tier</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Fee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-white">All caught up!</h3>
                      <p className="text-slate-400 mt-1">No pending payments at the moment.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const isOverdue = client.paymentDueDay && client.pendingAmount && client.pendingAmount > 0 && new Date().getDate() > client.paymentDueDay
                  return (
                    <tr key={client.id} className={`hover:bg-slate-700/50 ${isOverdue ? 'bg-red-500/10' : ''}`}>
                      <td className="px-4 py-3">
                        <Link href={`/clients/${client.id}`} className="font-medium text-white hover:text-blue-400">
                          {client.name}
                        </Link>
                        <p className="text-sm text-slate-400">{client.contactEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${client.tier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
                          client.tier === 'PREMIUM' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-600 text-slate-300'
                          }`}>
                          {client.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatCurrency(client.monthlyFee)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${(client.pendingAmount || 0) > 0 ? 'text-amber-400' : 'text-slate-300'
                          }`}>
                          {formatCurrency(client.pendingAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={isOverdue ? 'text-red-400 font-medium' : 'text-slate-300'}>
                          {formatDate(client.paymentDueDay)}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[isOverdue ? 'OVERDUE' : client.paymentStatus] || statusColors.PENDING
                          }`}>
                          {isOverdue ? 'OVERDUE' : client.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/accounts/ledger?clientId=${client.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          Record Payment
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
