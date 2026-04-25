import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function WebDevDeploymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const projects = await prisma.webProject.findMany({
    where: {
      status: { in: ['IN_PROGRESS', 'COMPLETED'] },
      OR: [
        { stagingUrl: { not: null } },
        { productionUrl: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      status: true,
      stagingUrl: true,
      productionUrl: true,
      client: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Deployments</h1>
        <p className="text-slate-500 mt-1">Project staging and production deployments</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.productionUrl).length}</p>
          <p className="text-sm text-slate-500">Live Sites</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-2xl font-bold text-blue-600">{projects.filter(p => p.stagingUrl && !p.productionUrl).length}</p>
          <p className="text-sm text-slate-500">In Staging</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p>No deployments found</p>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.client.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.stagingUrl && (
                      <a
                        href={project.stagingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 hover:underline"
                      >
                        Staging
                      </a>
                    )}
                    {project.productionUrl && (
                      <a
                        href={project.productionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-400 hover:underline"
                      >
                        Live
                      </a>
                    )}
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
