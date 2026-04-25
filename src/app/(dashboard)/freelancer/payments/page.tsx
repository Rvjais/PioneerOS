import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

async function getPayments(userId: string) {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId },
  })

  if (!profile) return { payments: [], profile: null }

  const payments = await prisma.freelancerPayment.findMany({
    where: { freelancerProfileId: profile.id },
    orderBy: { paymentDate: 'desc' },
  })

  return { payments, profile }
}

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (session.user.role !== 'FREELANCER' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  const { payments, profile } = await getPayments(session.user.id)

  const formatDate = (date: Date) =>
    formatDateDDMMYYYY(date)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
    FAILED: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-slate-400 mt-1">Track your payment history and earnings</p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{formatCurrency(profile?.totalEarned || 0)}</p>
          <p className="text-sm text-slate-400">Total Earned</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(profile?.pendingAmount || 0)}</p>
          <p className="text-sm text-slate-400">Pending Amount</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{payments.length}</p>
          <p className="text-sm text-slate-400">Total Payments</p>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No payments yet</p>
            <p className="text-sm text-slate-400 mt-1">Payments will appear here once processed</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Period</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Method</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-sm text-slate-300">{formatDate(payment.paymentDate)}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{payment.paymentMethod}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{payment.transactionRef || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[payment.status]}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
