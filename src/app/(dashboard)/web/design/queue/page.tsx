import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { WebDesignQueueClient } from './WebDesignQueueClient'

async function getDesignQueue(userId: string, userRole: string) {
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(userRole)

  const [queue, projects] = await Promise.all([
    prisma.webProjectPhaseItem.findMany({
      where: {
        phase: 'DESIGN',
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        ...(isManager ? {} : { assignedToId: userId }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: { select: { id: true, name: true } },
          },
        },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    }),
    prisma.webProject.findMany({
      where: { status: { in: ['IN_PROGRESS', 'PIPELINE'] } },
      select: { id: true, name: true, client: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
  ])

  const stats = {
    pending: queue.filter(i => i.status === 'PENDING').length,
    inProgress: queue.filter(i => i.status === 'IN_PROGRESS').length,
    total: queue.length,
  }

  return { queue, projects, stats, isManager }
}

export default async function WebDesignQueuePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { queue, projects, stats, isManager } = await getDesignQueue(
    session.user.id,
    session.user.role
  )

  return (
    <WebDesignQueueClient
      initialQueue={queue}
      projects={projects}
      stats={stats}
      isManager={isManager}
    />
  )
}
