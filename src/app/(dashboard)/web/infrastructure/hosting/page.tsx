import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { HostingCard } from '@/client/components/web/HostingCard'
import { AddHostingModal } from '@/client/components/web/AddHostingModal'

async function getHostingAccounts() {
  const accounts = await prisma.hostingAccount.findMany({
    include: {
      client: { select: { id: true, name: true } },
    },
    orderBy: { renewalDate: 'asc' },
  })

  return accounts
}

export default async function HostingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Check for manager access
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER'].includes(
    session.user.role
  )
  if (!isManager) {
    redirect('/web')
  }

  const accounts = await getHostingAccounts()

  // Calculate stats
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const totalMonthlyCost = accounts.reduce((sum, a) => sum + a.monthlyCost, 0)
  const renewingIn30Days = accounts.filter((a) => new Date(a.renewalDate) <= thirtyDaysFromNow)
  const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE')
  const suspendedAccounts = accounts.filter((a) => a.status === 'SUSPENDED')

  // Group by status
  const criticalAccounts = accounts.filter(
    (a) => new Date(a.renewalDate) >= now && new Date(a.renewalDate) <= thirtyDaysFromNow
  )
  const healthyAccounts = accounts.filter((a) => new Date(a.renewalDate) > thirtyDaysFromNow)

  // Group by provider for analytics
  const providerStats = accounts.reduce(
    (acc, account) => {
      if (!acc[account.provider]) {
        acc[account.provider] = { count: 0, cost: 0 }
      }
      acc[account.provider].count++
      acc[account.provider].cost += account.monthlyCost
      return acc
    },
    {} as Record<string, { count: number; cost: number }>
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hosting Management</h1>
          <p className="text-slate-400 mt-1">Monitor and manage all client hosting accounts</p>
        </div>
        <AddHostingModal />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{accounts.length}</p>
          <p className="text-sm text-slate-400">Total Accounts</p>
        </div>
        <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">
            ₹{totalMonthlyCost.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">Monthly Cost</p>
        </div>
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-400">{renewingIn30Days.length}</p>
          <p className="text-sm text-slate-400">Renewing in 30 days</p>
        </div>
        <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-red-400">{suspendedAccounts.length}</p>
          <p className="text-sm text-slate-400">Suspended</p>
        </div>
      </div>

      {/* Provider Distribution */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Provider Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(providerStats).map(([provider, stats]) => (
            <div key={provider} className="bg-slate-700/30 rounded-xl p-4">
              <p className="font-medium text-white">{provider}</p>
              <p className="text-2xl font-bold text-indigo-400">{stats.count}</p>
              <p className="text-sm text-slate-400">
                ₹{stats.cost.toLocaleString('en-IN')}/mo
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Critical - Renewing Soon */}
      {criticalAccounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-400 mb-4">
            Renewing Within 30 Days ({criticalAccounts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalAccounts.map((account) => (
              <HostingCard key={account.id} account={account} variant="warning" />
            ))}
          </div>
        </div>
      )}

      {/* Healthy Accounts */}
      {healthyAccounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-green-400 mb-4">
            Healthy Accounts ({healthyAccounts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthyAccounts.map((account) => (
              <HostingCard key={account.id} account={account} variant="healthy" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {accounts.length === 0 && (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center">
          <svg
            className="w-12 h-12 text-slate-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
          <p className="text-slate-400">No hosting accounts registered yet. Add your first hosting account to get started.</p>
        </div>
      )}
    </div>
  )
}
