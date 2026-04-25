import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function WebInfrastructureDNSPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const domains = await prisma.domain.findMany({
    include: {
      client: { select: { name: true } },
    },
    orderBy: { domainName: 'asc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">DNS Management</h1>
        <p className="text-slate-500 mt-1">Domain DNS configuration and records</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {domains.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>No domains found</p>
            </div>
          ) : (
            domains.map(domain => (
              <div key={domain.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{domain.domainName}</h3>
                    <p className="text-sm text-slate-500">{domain.client?.name}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-slate-500/20 text-slate-400">
                    DNS
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
