import { prisma } from '@/server/db/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReportsOverview from '@/client/components/reporting/ReportsOverview'

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function ClientReportsPage({ params }: Props) {
  const { clientId } = await params

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      platformAccounts: {
        where: { isActive: true },
        include: {
          _count: {
            select: { metrics: true },
          },
        },
      },
    },
  })

  if (!client) {
    notFound()
  }

  // Check which platforms have data
  const platformsWithData = client.platformAccounts
    .filter((acc) => acc._count.metrics > 0)
    .map((acc) => acc.platform)

  const uniquePlatforms = [...new Set(platformsWithData)]

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
            <span className="text-white">Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Reports Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Analytics and performance metrics across all platforms
          </p>
        </div>
        <Link
          href={`/clients/${clientId}/platforms`}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Manage Accounts
        </Link>
      </div>

      {/* No Data State */}
      {uniquePlatforms.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Reporting Data Yet</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Add platform accounts and import data to see your reporting dashboards.
            You can import data via CSV, Excel, or manual entry.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/clients/${clientId}/platforms`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Platform Account
            </Link>
            <Link
              href={`/clients/${clientId}/integrations`}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Connect via OAuth
            </Link>
          </div>
        </div>
      ) : (
        <ReportsOverview
          clientId={clientId}
          clientName={client.name}
          platformsWithData={uniquePlatforms}
        />
      )}
    </div>
  )
}
