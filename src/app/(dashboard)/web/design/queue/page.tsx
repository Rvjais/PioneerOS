import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { WebDesignQueueClient } from './WebDesignQueueClient'

async function getDesignQueue(userId: string, userRole: string) {
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'OPERATIONS_HEAD'].includes(userRole)

  const [queueItems, projects] = await Promise.all([
    (prisma.webProjectPhaseItem as any).findMany({
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

  const queue: any[] = queueItems

  const stats = {
    pending: queue.filter((i: any) => i.status === 'PENDING').length,
    inProgress: queue.filter((i: any) => i.status === 'IN_PROGRESS').length,
    total: queue.length,
  }

  const mappedQueue = queue.map((item: any) => ({
    ...item,
    title: `${item.project.name} - ${item.phase.replace(/_/g, ' ')}`,
    description: item.notes,
    createdAt: item.createdAt.toISOString(),
    assignedTo: item.assignedTo ? {
      id: item.assignedTo.id,
      firstName: item.assignedTo.firstName,
      lastName: item.assignedTo.lastName || ''
    } : null
  }))

  return { queue: mappedQueue, projects, stats, isManager }
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
