import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getClients() {
  return prisma.client.findMany({
    where: {
      onboardingStatus: { in: ['AWAITING_SLA', 'AWAITING_PAYMENT', 'COMPLETED'] },
    },
    include: {
      contracts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export default async function ContractsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const clients = await getClients()

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contracts Management</h1>
          <p className="text-slate-400 mt-1">Manage SLA, SOW and client agreements</p>
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
          <p className="text-2xl font-bold text-white">{clients.length}</p>
          <p className="text-sm text-slate-400">Total Contracts</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-2xl font-bold text-amber-400">
            {clients.filter((c) => !c.slaSigned).length}
          </p>
          <p className="text-sm text-slate-400">Pending SLA</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-2xl font-bold text-purple-400">
            {clients.filter((c) => c.slaSigned && !c.initialPaymentConfirmed).length}
          </p>
          <p className="text-sm text-slate-400">Awaiting Payment</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-2xl font-bold text-green-400">
            {clients.filter((c) => c.slaSigned && c.initialPaymentConfirmed).length}
          </p>
          <p className="text-sm text-slate-400">Completed</p>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Fee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">SLA Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-white">No contracts yet</h3>
                      <p className="text-slate-400 mt-1">Clients will appear here when they reach the contract stage</p>
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
                    <td className="px-4 py-3 font-medium text-white">
                      ₹{client.monthlyFee ? (client.monthlyFee / 1000).toFixed(0) + 'K' : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {client.slaSigned ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Signed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {client.initialPaymentConfirmed ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Received
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/accounts/contracts/${client.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Manage
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
