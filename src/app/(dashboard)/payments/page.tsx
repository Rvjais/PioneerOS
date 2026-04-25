import { unstable_noStore as noStore } from 'next/cache'
import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { ExportReportButton, ClientPaymentTableClient } from './PaymentsClient'
import PageGuide from '@/client/components/ui/PageGuide'

async function getPaymentData(userId: string, role: string) {
  const fullAccessRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
  const isFullAccess = fullAccessRoles.includes(role)
  const clientFilter = isFullAccess ? {} : { teamMembers: { some: { userId } } }

  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      where: isFullAccess ? {} : { client: { teamMembers: { some: { userId } } } },
      include: { client: true },
      orderBy: { dueDate: 'asc' }
    }),
    prisma.client.findMany({
      where: clientFilter,
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        paymentStatus: true,
        paymentDueDay: true,
        pendingAmount: true
      }
    })
  ])
  return { invoices, clients }
}

const statusColors: Record<string, string> = {
  PAID: 'bg-green-500/20 text-green-400',
  SENT: 'bg-blue-500/20 text-blue-400',
  OVERDUE: 'bg-red-500/20 text-red-400',
  DRAFT: 'bg-slate-800/50 text-slate-300',
  CANCELLED: 'bg-white/10 text-slate-300',
}

export default async function PaymentsPage() {
  noStore()
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { invoices, clients } = await getPaymentData(
    (session.user as any).id,
    (session.user as any).role || 'EMPLOYEE'
  )

  const stats = {
    totalReceivable: invoices.filter(i => ['SENT', 'OVERDUE'].includes(i.status)).reduce((sum, i) => sum + i.total, 0),
    collected: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.total, 0),
    thisMonth: invoices.filter(i => {
      const now = new Date()
      const due = new Date(i.dueDate)
      return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()
    }).reduce((sum, i) => sum + i.total, 0)
  }

  const upcomingPayments = invoices
    .filter(i => ['SENT', 'OVERDUE'].includes(i.status))
    .slice(0, 10)

  const recentPayments = invoices
    .filter(i => i.status === 'PAID')
    .slice(0, 10)

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="payments"
        title="Payment Tracker"
        description="Track client payment status, monthly fees, and pending collections."
        steps={[
          { label: 'Monitor receivables', description: 'View total outstanding and overdue amounts' },
          { label: 'Track by client', description: 'See per-client payment status and history' },
          { label: 'Export reports', description: 'Download payment data for accounting' },
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Tracker</h1>
          <p className="text-slate-400 mt-1">Monitor receivables and payment status</p>
        </div>
        <ExportReportButton
          invoices={JSON.parse(JSON.stringify(invoices))}
          clients={JSON.parse(JSON.stringify(clients))}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">₹{(stats.totalReceivable / 100000).toFixed(1)}L</p>
          <p className="text-sm text-slate-400">Total Receivable</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">₹{(stats.collected / 100000).toFixed(1)}L</p>
          <p className="text-sm text-slate-400">Collected (YTD)</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-red-400">₹{(stats.overdue / 100000).toFixed(1)}L</p>
          <p className="text-sm text-slate-400">Overdue</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">₹{(stats.thisMonth / 100000).toFixed(1)}L</p>
          <p className="text-sm text-slate-400">Due This Month</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Upcoming Payments</h2>
            <span className="text-sm text-slate-400">{upcomingPayments.length} pending</span>
          </div>
          <div className="divide-y divide-white/10">
            {upcomingPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No pending payments
              </div>
            ) : (
              upcomingPayments.map((invoice) => {
                const dueDate = new Date(invoice.dueDate)
                const isOverdue = dueDate < new Date() && invoice.status !== 'PAID'
                return (
                  <div key={invoice.id} className="p-4 hover:bg-slate-900/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOverdue ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                          <span className={`text-lg ${isOverdue ? 'text-red-400' : 'text-blue-400'}`}>₹</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{invoice.client.name}</p>
                          <p className="text-xs text-slate-400">{invoice.invoiceNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">₹{invoice.total.toLocaleString('en-IN')}</p>
                        <p className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                          {isOverdue ? 'Overdue' : `Due ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Payments Received */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Payments</h2>
            <span className="text-sm text-green-400 flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Received</span>
          </div>
          <div className="divide-y divide-white/10">
            {recentPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No payments received yet
              </div>
            ) : (
              recentPayments.map((invoice) => (
                <div key={invoice.id} className="p-4 hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-white">{invoice.client.name}</p>
                        <p className="text-xs text-slate-400">{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-400">₹{invoice.total.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-400">
                        {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Paid'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Client Payment Status */}
      <ClientPaymentTableClient clients={JSON.parse(JSON.stringify(clients))} />
    </div>
  )
}
