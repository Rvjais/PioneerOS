import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ReimbursementForm } from '@/client/components/web/ReimbursementForm'

async function getReimbursements(userId: string, isManager: boolean) {
  const where = isManager ? {} : { paidById: userId }

  const rawReimbursements = await prisma.webReimbursement.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Resolve paidBy users (paidById is a plain string, not a Prisma relation)
  const paidByIds = [...new Set(rawReimbursements.map((r) => r.paidById))]
  const paidByUsers = paidByIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: paidByIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : []
  const paidByMap = new Map(paidByUsers.map((u) => [u.id, u]))

  return rawReimbursements.map((r) => ({
    ...r,
    paidBy: paidByMap.get(r.paidById) || null,
  }))
}

async function getClients() {
  return prisma.client.findMany({
    where: { isWebTeamClient: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export default async function ReimbursementsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'ACCOUNTS'].includes(
    session.user.role
  )

  const reimbursements = await getReimbursements(session.user.id, isManager)
  const clients = await getClients()

  // Stats
  const pendingReimbursements = reimbursements.filter((r) => r.status === 'PENDING')
  const approvedReimbursements = reimbursements.filter((r) => r.status === 'APPROVED')
  const totalPending = pendingReimbursements.reduce((sum, r) => sum + r.amount, 0)
  const totalApproved = approvedReimbursements.reduce((sum, r) => sum + r.amount, 0)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    APPROVED: 'bg-blue-500/20 text-blue-400',
    REJECTED: 'bg-red-500/20 text-red-400',
    BILLED: 'bg-purple-500/20 text-purple-400',
    REIMBURSED: 'bg-green-500/20 text-green-400',
  }

  const typeIcons: Record<string, string> = {
    DOMAIN: 'globe',
    HOSTING: 'server',
    SSL: 'shield',
    PLUGIN: 'puzzle',
    THEME: 'palette',
    SUBSCRIPTION: 'repeat',
    OTHER: 'file',
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reimbursements</h1>
          <p className="text-slate-400 mt-1">
            {isManager ? 'Manage and approve expense reimbursements' : 'Submit and track your reimbursements'}
          </p>
        </div>
        <ReimbursementForm clients={clients} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{reimbursements.length}</p>
          <p className="text-sm text-slate-400">Total Submissions</p>
        </div>
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-400">{pendingReimbursements.length}</p>
          <p className="text-sm text-slate-400">Pending Approval</p>
        </div>
        <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-400">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">Pending Amount</p>
        </div>
        <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">
            ₹{totalApproved.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">Approved (Unpaid)</p>
        </div>
      </div>

      {/* Manager Approval Queue */}
      {isManager && pendingReimbursements.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">
            Pending Approvals ({pendingReimbursements.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingReimbursements.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 text-white">{r.paidBy?.firstName} {r.paidBy?.lastName}</td>
                    <td className="py-3 text-slate-400">{r.client.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 text-white font-medium">
                      ₹{r.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-slate-400">
                      {formatDateDDMMYYYY(r.paidDate)}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <form action={async () => {
                          'use server'
                          await prisma.webReimbursement.update({
                            where: { id: r.id },
                            data: { status: 'APPROVED', approvedAt: new Date() },
                          })
                          const { revalidatePath } = await import('next/cache')
                          revalidatePath('/web/billing/reimbursements')
                        }}>
                          <button type="submit" className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                            Approve
                          </button>
                        </form>
                        <form action={async () => {
                          'use server'
                          await prisma.webReimbursement.update({
                            where: { id: r.id },
                            data: { status: 'REJECTED' },
                          })
                          const { revalidatePath } = await import('next/cache')
                          revalidatePath('/web/billing/reimbursements')
                        }}>
                          <button type="submit" className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                            Reject
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Reimbursements */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {isManager ? 'All Reimbursements' : 'My Reimbursements'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr className="text-left text-xs text-slate-400 uppercase">
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reimbursements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No reimbursements submitted yet
                  </td>
                </tr>
              ) : (
                reimbursements.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{r.description}</p>
                      {r.vendor && <p className="text-xs text-slate-400">{r.vendor}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{r.client.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      ₹{r.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDateDDMMYYYY(r.paidDate)}
                    </td>
                    <td className="px-4 py-3">
                      {r.receiptUrl ? (
                        <a
                          href={r.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
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
