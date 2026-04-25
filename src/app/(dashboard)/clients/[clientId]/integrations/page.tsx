import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { notFound } from 'next/navigation'
import { ConnectPlatforms } from '@/client/components/integrations/ConnectPlatforms'
import Link from 'next/link'

interface Props {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ connected?: string }>
}

export default async function ClientIntegrationsPage({ params, searchParams }: Props) {
  const { clientId } = await params
  const { connected } = await searchParams

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      oauthConnections: {
        include: {
          accounts: {
            where: { isActive: true },
          },
        },
      },
    },
  })

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Link href="/clients" className="hover:text-white">Clients</Link>
            <span>/</span>
            <Link href={`/clients/${clientId}`} className="hover:text-white">{client.name}</Link>
            <span>/</span>
            <span className="text-white">Integrations</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Platform Integrations</h1>
          <p className="text-slate-400 mt-1">
            Connect analytics and social media accounts for automated reporting
          </p>
        </div>
      </div>

      {/* Success message */}
      {connected && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-emerald-400">
              {connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!
            </p>
            <p className="text-emerald-400/80 text-sm">
              We&apos;re now syncing your accounts and data.
            </p>
          </div>
        </div>
      )}

      {/* Connect Platforms */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Connect Platforms</h2>
        <ConnectPlatforms clientId={clientId} />
      </div>

      {/* Connected Accounts Detail */}
      {client.oauthConnections.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Connected Accounts</h2>

          <div className="space-y-4">
            {client.oauthConnections.map((conn) => (
              <div key={conn.id} className="border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      conn.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : conn.status === 'EXPIRED'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {conn.status}
                    </span>
                    <span className="font-medium text-white">{conn.platform}</span>
                    {conn.platformEmail && (
                      <span className="text-slate-400 text-sm">({conn.platformEmail})</span>
                    )}
                  </div>
                  <span className="text-slate-400 text-sm">
                    Connected {formatDateDDMMYYYY(conn.connectedAt)}
                  </span>
                </div>

                {conn.accounts.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {conn.accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="bg-slate-900/50 rounded-lg p-3 text-sm"
                      >
                        <p className="font-medium text-white truncate">{acc.accountName}</p>
                        <p className="text-slate-400 text-xs">{acc.platform.replace(/_/g, ' ')}</p>
                        {acc.lastSyncAt && (
                          <p className="text-slate-300 text-xs mt-1">
                            Synced: {formatDateDDMMYYYY(acc.lastSyncAt)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {conn.lastError && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                    {conn.lastError}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">How Automated Reporting Works</h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-white">Connect Accounts</p>
              <p className="text-slate-400 text-sm">
                Click connect and authorize access to analytics, search console, and social platforms.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-white">Auto-Sync Daily</p>
              <p className="text-slate-400 text-sm">
                We automatically pull metrics every day - traffic, rankings, engagement, ad performance.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-white">Reports Populate</p>
              <p className="text-slate-400 text-sm">
                Monthly reports auto-fill with real data - no manual entry, always accurate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
