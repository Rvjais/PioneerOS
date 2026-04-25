import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function WebInfrastructureSSLPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const domains = await prisma.domain.findMany({
    where: {
      expiryDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      client: { select: { name: true } },
    },
    orderBy: { expiryDate: 'asc' },
    take: 30,
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const daysUntil = (date: Date) => Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SSL Certificates</h1>
        <p className="text-slate-500 mt-1">SSL certificate expiry tracking</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {domains.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>No SSL certificates expiring soon</p>
            </div>
          ) : (
            domains.map(domain => {
              const days = daysUntil(domain.expiryDate)
              return (
                <div key={domain.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{domain.domainName}</h3>
                      <p className="text-sm text-slate-500">{domain.client?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-900 dark:text-white">{formatDate(domain.expiryDate)}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        days <= 7 ? 'bg-red-500/20 text-red-400' :
                        days <= 30 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {days} days
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
