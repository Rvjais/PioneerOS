import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getPendingOnboardings() {
  const clients = await prisma.client.findMany({
    where: {
      onboardingStatus: { in: ['PENDING', 'IN_PROGRESS', 'AWAITING_SLA', 'AWAITING_PAYMENT'] },
    },
    orderBy: { createdAt: 'desc' },
  })

  return clients
}

export default async function PendingOnboardingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const clients = await getPendingOnboardings()

  const statusColors: Record<string, string> = {
    PENDING: 'bg-slate-600 text-slate-300',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    AWAITING_SLA: 'bg-amber-500/20 text-amber-400',
    AWAITING_PAYMENT: 'bg-purple-500/20 text-purple-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const stats = {
    total: clients.length,
    pending: clients.filter((c) => c.onboardingStatus === 'PENDING').length,
    inProgress: clients.filter((c) => c.onboardingStatus === 'IN_PROGRESS').length,
    awaitingSLA: clients.filter((c) => c.onboardingStatus === 'AWAITING_SLA').length,
    awaitingPayment: clients.filter((c) => c.onboardingStatus === 'AWAITING_PAYMENT').length,
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending Onboardings</h1>
          <p className="text-slate-400 mt-1">Track clients in the onboarding pipeline</p>
        </div>
        <Link
          href="/accounts"
          className="px-4 py-2 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Total Pending</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-2xl font-bold text-slate-300">{stats.pending}</p>
          <p className="text-sm text-slate-400">Not Started</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-sm text-slate-400">In Progress</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.awaitingSLA}</p>
          <p className="text-sm text-slate-400">Awaiting SLA</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-2xl font-bold text-purple-400">{stats.awaitingPayment}</p>
          <p className="text-sm text-slate-400">Awaiting Payment</p>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Tier</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">SLA</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Payment</th>
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
                      <p className="text-slate-400 mt-1">No pending client onboardings.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{client.name}</p>
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
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[client.onboardingStatus] || 'bg-slate-600 text-slate-300'}`}>
                        {client.onboardingStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {client.slaSigned ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {client.initialPaymentConfirmed ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/accounts/client-onboarding?client=${client.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View Checklist
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
