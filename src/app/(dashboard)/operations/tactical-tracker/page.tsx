import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { EmployeeTrackerView } from './views/EmployeeTrackerView'
import { ManagerTrackerView } from './views/ManagerTrackerView'
import { SalesTrackerView } from './views/SalesTrackerView'
import { AccountsTrackerView } from './views/AccountsTrackerView'
import { HRTrackerView } from './views/HRTrackerView'

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
      // Handle services that might be stored as JSON string or array
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

  // Regular employees only see clients they're assigned to
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    include: {
      client: {
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
        }
      }
    }
  })

  return assignments
    .filter(a => a.client.status === 'ACTIVE')
    .map(a => {
      // Handle services that might be stored as JSON string or array
      let services: string[] = []
      if (a.client.services) {
        if (typeof a.client.services === 'string') {
          try {
            services = JSON.parse(a.client.services)
          } catch {
            services = []
          }
        } else if (Array.isArray(a.client.services)) {
          services = a.client.services as string[]
        }
      }
      return {
        id: a.client.id,
        client: a.client.name,
        scope: services,
        status: a.client.status as 'ACTIVE' | 'ON_HOLD' | 'CHURNED',
        accountManager: a.client.teamMembers[0]?.user?.firstName || 'Unassigned',
        monthlyRetainer: a.client.monthlyFee || 0
      }
    })
}

export default async function TacticalTrackerPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const role = session.user.role

  const clients = await getClients(userId, role)

  // If no clients assigned, show empty state
  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Client Tactical Tracker</h1>
          <p className="text-indigo-200">Monthly work items, proof links & KPIs</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No Clients Assigned</h3>
          <p className="text-slate-400">You don&apos;t have any clients assigned yet. Contact your manager to get assigned to clients.</p>
        </div>
      </div>
    )
  }

  // Route to role-specific view
  // Manager roles: SUPER_ADMIN, MANAGER, OPERATIONS_HEAD
  // Employee roles: EMPLOYEE, FREELANCER, INTERN
  // Sales role: SALES
  // Accounts role: ACCOUNTS
  // HR role: HR

  if (role === 'SALES') {
    return <SalesTrackerView initialClients={clients} />
  }

  if (role === 'ACCOUNTS') {
    return <AccountsTrackerView initialClients={clients} />
  }

  if (role === 'HR') {
    return <HRTrackerView initialClients={clients} />
  }

  if (['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(role)) {
    return (
      <ManagerTrackerView
        initialClients={clients}
        userRole={role}
        userDepartment={session.user.department}
      />
    )
  }

  // Default: Employee view for EMPLOYEE, FREELANCER, INTERN, and others
  return (
    <EmployeeTrackerView
      initialClients={clients}
      userRole={role}
      userDepartment={session.user.department}
      userId={userId}
    />
  )
}
