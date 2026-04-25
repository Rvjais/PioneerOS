import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { TacticalTrackerClient } from '../TacticalTrackerClient'
import Link from 'next/link'

interface ClientScope {
  id: string
  client: string
  scope: string[]
  status: 'ACTIVE' | 'ON_HOLD' | 'CHURNED'
  accountManager: string
  monthlyRetainer: number
}

async function getClients(userId: string, role: string): Promise<ClientScope[]> {
  // Managers, admins, and operations heads can see all clients
  if (['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(role)) {
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        status: true,
        monthlyFee: true,
        services: true,
        teamMembers: {
          where: { role: 'ACCOUNT_MANAGER' },
          include: {
            user: { select: { firstName: true, lastName: true } }
          },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    })

    return clients.map(c => {
      let services: string[] = []
      if (c.services) {
        if (typeof c.services === 'string') {
          try {
            services = JSON.parse(c.services)
          } catch {
            services = []
          }
        } else if (Array.isArray(c.services)) {
          services = c.services as string[]
        }
      }
      return {
        id: c.id,
        client: c.name,
        scope: services,
        status: c.status as 'ACTIVE' | 'ON_HOLD' | 'CHURNED',
        accountManager: c.teamMembers[0]?.user?.firstName || 'Unassigned',
        monthlyRetainer: c.monthlyFee || 0
      }
    })
  }

  // Non-managers are redirected to main tracker
  return []
}

export default async function FullTrackerPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const role = session.user.role

  // Only managers can access the full tracker
  if (!['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(role)) {
    redirect('/operations/tactical-tracker')
  }

  const clients = await getClients(userId, role)

  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Full Tactical Tracker</h1>
          <p className="text-indigo-200">Complete view with all editing capabilities</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <h3 className="text-lg font-medium text-white mb-2">No Clients Found</h3>
          <p className="text-slate-400">No active clients available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href="/operations/tactical-tracker"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <TacticalTrackerClient
        initialClients={clients}
        userRole={role}
        userDepartment={session.user.department}
      />
    </div>
  )
}
