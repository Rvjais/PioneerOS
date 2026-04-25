import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

async function getAdminStats() {
  const [
    totalUsers,
    activeUsers,
    usersByRole,
    usersByDepartment,
    recentLogins,
    activeSessionsCount,
    suspiciousLogins,
    totalClients,
    activeClients,
    pendingLeads,
    totalIssues,
    openIssues,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    prisma.user.groupBy({
      by: ['department'],
      _count: true,
    }),
    prisma.loginSession.findMany({
      take: 10,
      orderBy: { loginAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, empId: true },
        },
      },
    }),
    prisma.loginSession.count({ where: { isActive: true } }),
    prisma.loginSession.count({ where: { isSuspicious: true } }),
    prisma.client.count(),
    prisma.client.count({ where: { status: 'ACTIVE' } }),
    prisma.lead.count({ where: { stage: { notIn: ['WON', 'LOST'] } } }),
    prisma.issue.count(),
    prisma.issue.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
  ])

  return {
    totalUsers,
    activeUsers,
    usersByRole: usersByRole.map(r => ({ role: r.role, count: r._count })),
    usersByDepartment: usersByDepartment.map(d => ({ department: d.department, count: d._count })),
    recentLogins: recentLogins.map(l => ({
      id: l.id,
      userName: `${l.user.firstName} ${l.user.lastName || ''}`.trim(),
      empId: l.user.empId,
      loginAt: l.loginAt.toISOString(),
      ipAddress: l.ipAddress,
      city: l.city,
      country: l.country,
      browser: l.browser,
      device: l.deviceType,
      isActive: l.isActive,
      isSuspicious: l.isSuspicious,
    })),
    activeSessionsCount,
    suspiciousLogins,
    totalClients,
    activeClients,
    pendingLeads,
    totalIssues,
    openIssues,
  }
}

async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      department: true,
      employeeType: true,
      status: true,
      joiningDate: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return users.map(u => ({
    ...u,
    joiningDate: u.joiningDate.toISOString(),
    createdAt: u.createdAt.toISOString(),
  }))
}

async function getSystemSettings() {
  const entities = await prisma.companyEntity.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      tradeName: true,
      isPrimary: true,
    },
  })

  return { entities }
}

async function getClientsWithPortalUsers() {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      contactEmail: true,
      status: true,
      lifecycleStage: true,
      clientUsers: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
        },
        orderBy: { role: 'asc' },
      },
      teamMembers: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          role: true,
        },
        where: { role: 'ACCOUNT_MANAGER' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  })

  return clients.map(c => ({
    id: c.id,
    name: c.name,
    email: c.contactEmail,
    status: c.status,
    lifecycleStage: c.lifecycleStage,
    clientUsers: c.clientUsers.map(cu => ({
      ...cu,
      lastLoginAt: cu.lastLoginAt?.toISOString() || null,
    })),
    accountManager: c.teamMembers[0]?.user
      ? `${c.teamMembers[0].user.firstName} ${c.teamMembers[0].user.lastName || ''}`.trim()
      : null,
  }))
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Check if user is impersonating - if so, check original admin role
  const isImpersonating = session.user.isImpersonating
  const roleToCheck = isImpersonating
    ? session.user.originalRole
    : session.user.role

  // Also verify from database as fallback
  const userIdToCheck = isImpersonating ? session.user.originalAdminId : session.user.id
  const user = userIdToCheck ? await prisma.user.findUnique({
    where: { id: userIdToCheck },
    select: { role: true },
  }) : null

  // Allow access if session role or database role is SUPER_ADMIN
  const isSuperAdmin = roleToCheck === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN'

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-slate-300">Admin dashboard is only accessible to Super Admin users.</p>
        </div>
      </div>
    )
  }

  const [stats, users, settings, clients] = await Promise.all([
    getAdminStats(),
    getAllUsers(),
    getSystemSettings(),
    getClientsWithPortalUsers(),
  ])

  return <AdminDashboard stats={stats} users={users} settings={settings} clients={clients} />
}
