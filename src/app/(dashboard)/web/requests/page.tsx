import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { WebRequestsClient } from './WebRequestsClient'

async function getRequests(userId: string, userRole: string) {
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(userRole)

  const where: Record<string, unknown> = {}
  if (!isManager) {
    where.OR = [
      { assignedToId: userId },
      { project: { client: { accountManagerId: userId } } },
    ]
  }

  const [requests, projects, teamMembers] = await Promise.all([
    prisma.webChangeRequest.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: { select: { id: true, name: true } },
          },
        },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        completedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [
        { type: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    }),
    prisma.webProject.findMany({
      where: { status: { in: ['IN_PROGRESS', 'PIPELINE', 'ON_HOLD'] } },
      select: { id: true, name: true, client: { select: { id: true, name: true } } },
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
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'CLIENT_APPROVED').length,
    total: requests.length,
  }

  return { requests, projects, teamMembers, stats, isManager }
}

export default async function WebRequestsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { requests, projects, teamMembers, stats, isManager } = await getRequests(
    session.user.id,
    session.user.role
  )

  return (
    <WebRequestsClient
      initialRequests={requests}
      projects={projects}
      teamMembers={teamMembers}
      stats={stats}
      isManager={isManager}
      currentUserId={session.user.id}
    />
  )
}
