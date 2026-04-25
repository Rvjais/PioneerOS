import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function WebDevReviewsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const pendingApprovals = await prisma.webDesignApproval.findMany({
    where: { status: { in: ['PENDING', 'CHANGES_REQUESTED'] } },
    include: {
      project: { select: { id: true, name: true, client: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Code Reviews</h1>
        <p className="text-slate-500 mt-1">Pending design approvals and code review requests</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-purple-600">{pendingApprovals.length}</p>
          <p className="text-sm text-slate-500">Pending Reviews</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No pending reviews</p>
            </div>
          ) : (
            pendingApprovals.map(approval => (
              <div key={approval.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{approval.title}</h3>
                    <p className="text-sm text-slate-500">
                      {approval.project.name} — {approval.project.client.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      approval.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {approval.status === 'PENDING' ? 'Pending' : 'Changes Requested'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                      v{approval.version}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
