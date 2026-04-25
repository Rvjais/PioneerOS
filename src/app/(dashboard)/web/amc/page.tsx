import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AMCTracker } from '@/client/components/web/AMCTracker'

async function getAMCContracts() {
  // Auto-expire contracts whose endDate has passed
  await prisma.maintenanceContract.updateMany({
    where: { status: 'ACTIVE', endDate: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  })

  const contracts = await prisma.maintenanceContract.findMany({
    where: {
      type: { in: ['MONTHLY_MAINTENANCE', 'AMC', 'ANNUAL_HOSTING'] },
    },
    include: {
      client: { select: { id: true, name: true } },
      maintenanceLogs: {
        orderBy: { date: 'desc' },
        take: 5,
      },
    },
    orderBy: { endDate: 'asc' },
  })

  return contracts
}

export default async function AMCPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER'].includes(
    session.user.role
  )
  if (!isManager) {
    redirect('/web')
  }

  const contracts = await getAMCContracts()

  // Calculate stats
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE')
  const expiringIn30Days = contracts.filter(
    (c) => c.status === 'ACTIVE' && new Date(c.endDate) >= now && new Date(c.endDate) <= thirtyDaysFromNow
  )
  const expiringIn60Days = contracts.filter(
    (c) =>
      c.status === 'ACTIVE' &&
      new Date(c.endDate) > thirtyDaysFromNow &&
      new Date(c.endDate) <= sixtyDaysFromNow
  )
  const expiringIn90Days = contracts.filter(
    (c) =>
      c.status === 'ACTIVE' &&
      new Date(c.endDate) > sixtyDaysFromNow &&
      new Date(c.endDate) <= ninetyDaysFromNow
  )
  const expiredContracts = contracts.filter(
    (c) => c.status === 'EXPIRED'
  )

  const totalRevenue = activeContracts.reduce((sum, c) => sum + c.amount, 0)

  // Hours tracking
  const contractsWithHours = contracts.filter((c) => c.allocatedHours)
  const totalAllocatedHours = contractsWithHours.reduce((sum, c) => sum + (c.allocatedHours || 0), 0)
  const totalUsedHours = contractsWithHours.reduce((sum, c) => sum + c.usedHours, 0)
  const utilizationRate = totalAllocatedHours > 0 ? (totalUsedHours / totalAllocatedHours) * 100 : 0

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AMC Management</h1>
          <p className="text-slate-400 mt-1">Annual Maintenance Contracts & Hour Tracking</p>
        </div>
        {/* TODO: Implement create contract modal or page at /web/amc/new */}
        {/* <Link
          href="/web/amc/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + New Contract
        </Link> */}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{activeContracts.length}</p>
          <p className="text-sm text-slate-400">Active Contracts</p>
        </div>
        <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-400">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">Annual Revenue</p>
        </div>
        <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-red-400">{expiringIn30Days.length}</p>
          <p className="text-sm text-slate-400">Expiring in 30d</p>
        </div>
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-400">{expiringIn60Days.length}</p>
          <p className="text-sm text-slate-400">Expiring in 60d</p>
        </div>
        <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-400">{utilizationRate.toFixed(0)}%</p>
          <p className="text-sm text-slate-400">Hour Utilization</p>
        </div>
      </div>

      {/* Renewal Pipeline */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Renewal Pipeline</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* 30 Days */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-medium text-red-400">Next 30 Days</span>
            </div>
            <div className="space-y-2">
              {expiringIn30Days.length === 0 ? (
                <p className="text-sm text-slate-400">No renewals</p>
              ) : (
                expiringIn30Days.slice(0, 3).map((contract) => (
                  <Link
                    key={contract.id}
                    href={`/web/amc/${contract.id}`}
                    className="block p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50"
                  >
                    <p className="text-sm font-medium text-white">{contract.client.name}</p>
                    <p className="text-xs text-slate-400">
                      Expires {formatDateDDMMYYYY(contract.endDate)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* 60 Days */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="font-medium text-amber-400">30-60 Days</span>
            </div>
            <div className="space-y-2">
              {expiringIn60Days.length === 0 ? (
                <p className="text-sm text-slate-400">No renewals</p>
              ) : (
                expiringIn60Days.slice(0, 3).map((contract) => (
                  <Link
                    key={contract.id}
                    href={`/web/amc/${contract.id}`}
                    className="block p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50"
                  >
                    <p className="text-sm font-medium text-white">{contract.client.name}</p>
                    <p className="text-xs text-slate-400">
                      Expires {formatDateDDMMYYYY(contract.endDate)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* 90 Days */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="font-medium text-blue-400">60-90 Days</span>
            </div>
            <div className="space-y-2">
              {expiringIn90Days.length === 0 ? (
                <p className="text-sm text-slate-400">No renewals</p>
              ) : (
                expiringIn90Days.slice(0, 3).map((contract) => (
                  <Link
                    key={contract.id}
                    href={`/web/amc/${contract.id}`}
                    className="block p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50"
                  >
                    <p className="text-sm font-medium text-white">{contract.client.name}</p>
                    <p className="text-xs text-slate-400">
                      Expires {formatDateDDMMYYYY(contract.endDate)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Contracts with Hour Tracking */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Active Contracts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeContracts.map((contract) => (
            <AMCTracker key={contract.id} contract={contract} />
          ))}
        </div>
      </div>

      {/* Expired Contracts */}
      {expiredContracts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-red-400 mb-4">
            Expired Contracts ({expiredContracts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiredContracts.map((contract) => (
              <AMCTracker key={contract.id} contract={contract} variant="expired" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {contracts.length === 0 && (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-400">No AMC contracts yet. Create your first contract to get started.</p>
        </div>
      )}
    </div>
  )
}
