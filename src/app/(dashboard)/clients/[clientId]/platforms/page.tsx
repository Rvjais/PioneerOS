import { prisma } from '@/server/db/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PlatformsClient from '@/client/components/reporting/PlatformsClient'

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function ClientPlatformsPage({ params }: Props) {
  const { clientId } = await params

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      platformAccounts: {
        include: {
          _count: {
            select: { metrics: true },
          },
        },
        orderBy: [{ platform: 'asc' }, { accountName: 'asc' }],
      },
      importBatches: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!client) {
    notFound()
  }

  // Transform data for client component
  const accounts = client.platformAccounts.map((acc) => ({
    id: acc.id,
    platform: acc.platform,
    accountId: acc.accountId,
    accountName: acc.accountName,
    accessType: acc.accessType,
    isActive: acc.isActive,
    lastSyncAt: acc.lastSyncAt?.toISOString() || null,
    lastSyncStatus: acc.lastSyncStatus,
    syncError: acc.syncError,
    createdAt: acc.createdAt.toISOString(),
    metadata: acc.metadata ? JSON.parse(acc.metadata) : null,
    metricsCount: acc._count.metrics,
  }))

  const importBatches = client.importBatches.map((batch) => ({
    id: batch.id,
    platform: batch.platform,
    importType: batch.importType,
    status: batch.status,
    totalRows: batch.totalRows,
    successRows: batch.successRows,
    failedRows: batch.failedRows,
    createdAt: batch.createdAt.toISOString(),
    errorLog: batch.errorLog ? JSON.parse(batch.errorLog) : null,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Link href="/clients" className="hover:text-white">
              Clients
            </Link>
            <span>/</span>
            <Link href={`/clients/${clientId}`} className="hover:text-white">
              {client.name}
            </Link>
            <span>/</span>
            <span className="text-white">Platform Accounts</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Platform Accounts</h1>
          <p className="text-slate-400 mt-1">
            Manage platform accounts and import reporting data
          </p>
        </div>
        <Link
          href={`/clients/${clientId}/reports`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          View Reports
        </Link>
      </div>

      {/* Client Component */}
      <PlatformsClient
        clientId={clientId}
        clientName={client.name}
        initialAccounts={accounts}
        initialImportBatches={importBatches}
      />
    </div>
  )
}
