import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { WebEscalationsClient } from './WebEscalationsClient'

async function getEscalations(userId: string, userRole: string) {
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(userRole)

  const where: Record<string, unknown> = {
    type: { in: ['CLIENT_COMPLAINT', 'DELIVERY_ISSUE', 'QUALITY', 'OTHER'] },
  }

  if (!isManager) {
    where.OR = [
      { employeeId: userId },
      { reportedBy: userId },
    ]
  }

  const [escalations, clients, teamMembers] = await Promise.all([
    prisma.employeeEscalation.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        reporter: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [
        { severity: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    }),
    prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: {
        department: 'WEB',
        status: { in: ['ACTIVE', 'PROBATION'] },
      },
      select: { id: true, firstName: true, lastName: true, role: true },
      orderBy: { firstName: 'asc' },
    }),
  ])

  const stats = {
    open: escalations.filter(e => e.status === 'OPEN').length,
    critical: escalations.filter(e => e.severity === 'CRITICAL' && e.status === 'OPEN').length,
    total: escalations.length,
  }

  return { escalations, clients, teamMembers, stats, isManager }
}

export default async function WebEscalationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { escalations, clients, teamMembers, stats, isManager } = await getEscalations(
    session.user.id,
    session.user.role
  )

  return (
    <WebEscalationsClient
      initialEscalations={escalations}
      clients={clients}
      teamMembers={teamMembers}
      stats={stats}
      isManager={isManager}
      currentUserId={session.user.id}
    />
  )
}
