import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRoleLabel } from '@/shared/utils/utils'

interface SearchParams {
  q?: string
}

async function searchAll(query: string) {
  // Use contains without mode for basic substring matching
  // Note: This is case-sensitive. For case-insensitive search, use Prisma's native
  // case-insensitive collation or database-specific solutions
  const [clients, users, tasks, leads] = await Promise.all([
    // Search clients
    prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { contactName: { contains: query } },
          { contactEmail: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        contactEmail: true,
        status: true,
        tier: true,
      },
    }),

    // Search users/employees
    prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
          { empId: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        empId: true,
        department: true,
        role: true,
      },
    }),

    // Search tasks
    prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        department: true,
      },
    }),

    // Search leads
    prisma.lead.findMany({
      where: {
        OR: [
          { companyName: { contains: query } },
          { contactName: { contains: query } },
          { contactEmail: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        companyName: true,
        contactName: true,
        stage: true,
        value: true,
      },
    }),
  ])

  return { clients, users, tasks, leads }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const params = await searchParams
  const query = params.q || ''

  if (!query) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Search</h1>
          <p className="text-slate-400 mt-1">Enter a search term to find clients, employees, tasks, and more</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-300">Use the search bar above to search</p>
          <p className="text-sm text-slate-400 mt-1">Press <kbd className="px-2 py-0.5 bg-slate-800/50 rounded text-xs">Cmd</kbd> + <kbd className="px-2 py-0.5 bg-slate-800/50 rounded text-xs">K</kbd> to open search</p>
        </div>
      </div>
    )
  }

  const results = await searchAll(query)
  const totalResults = results.clients.length + results.users.length + results.tasks.length + results.leads.length

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    INACTIVE: 'bg-slate-800/50 text-slate-300',
    ONBOARDING: 'bg-blue-500/20 text-blue-400',
    TODO: 'bg-yellow-500/20 text-yellow-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    COMPLETED: 'bg-green-500/20 text-green-400',
    NEW: 'bg-purple-500/20 text-purple-400',
    WON: 'bg-green-500/20 text-green-400',
    LOST: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Search Results</h1>
        <p className="text-slate-400 mt-1">
          {totalResults} results for &quot;{query}&quot;
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-white">No results found</h3>
          <p className="text-slate-400 mt-1">Try searching with different keywords</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Clients */}
          {results.clients.length > 0 && (
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40">
                <h2 className="font-semibold text-white">Clients ({results.clients.length})</h2>
              </div>
              <div className="divide-y divide-white/10">
                {results.clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{client.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{client.name}</p>
                        <p className="text-sm text-slate-400">{client.contactEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[client.status] || 'bg-slate-800/50 text-slate-300'}`}>
                        {client.status}
                      </span>
                      <span className="text-xs px-2 py-1 bg-slate-800/50 rounded-full text-slate-300">{client.tier}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Employees */}
          {results.users.length > 0 && (
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40">
                <h2 className="font-semibold text-white">Team Members ({results.users.length})</h2>
              </div>
              <div className="divide-y divide-white/10">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/team/${user.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user.firstName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-slate-400">{user.empId} • {user.department}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-slate-800/50 rounded-full text-slate-300">{formatRoleLabel(user.role)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40">
                <h2 className="font-semibold text-white">Tasks ({results.tasks.length})</h2>
              </div>
              <div className="divide-y divide-white/10">
                {results.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="text-sm text-slate-400">{task.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status] || 'bg-slate-800/50 text-slate-300'}`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-800/50 text-slate-300'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {results.leads.length > 0 && (
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-slate-900/40">
                <h2 className="font-semibold text-white">Leads ({results.leads.length})</h2>
              </div>
              <div className="divide-y divide-white/10">
                {results.leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/crm/${lead.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{lead.companyName}</p>
                      <p className="text-sm text-slate-400">{lead.contactName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.stage] || 'bg-slate-800/50 text-slate-300'}`}>
                        {lead.stage?.replace(/_/g, ' ')}
                      </span>
                      {lead.value && (
                        <span className="text-sm font-medium text-slate-300">
                          ₹{(lead.value / 1000).toFixed(0)}K
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
