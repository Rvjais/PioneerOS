import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { InboxClient } from './InboxClient'

export const metadata = {
  title: 'Inbox | PioneerOS',
  description: 'Your unified inbox — notifications, tasks, and messages in one place.',
}

async function getInboxData(userId: string) {
  const [notifications, assignedTasks, supportTickets] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      take: 30,
      include: {
        client: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.supportTicket.findMany({
      where: { assignedToId: userId, status: { notIn: ['RESOLVED', 'CLOSED'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        client: { select: { id: true, name: true } },
      },
    }),
  ])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return { notifications, assignedTasks, supportTickets, unreadCount }
}

export default async function InboxPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { notifications, assignedTasks, supportTickets, unreadCount } =
    await getInboxData(session.user.id)

  return (
    <InboxClient
      notifications={notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        priority: n.priority,
        createdAt: n.createdAt.toISOString(),
      }))}
      tasks={assignedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? null,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        department: t.department,
        clientName: t.client?.name ?? null,
        clientId: t.client?.id ?? null,
        creatorName: t.creator
          ? `${t.creator.firstName} ${t.creator.lastName ?? ''}`.trim()
          : null,
      }))}
      tickets={supportTickets.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        priority: s.priority,
        clientName: s.client?.name ?? null,
        clientId: s.client?.id ?? null,
        createdAt: s.createdAt.toISOString(),
      }))}
      unreadCount={unreadCount}
      userName={session.user.firstName ?? 'there'}
    />
  )
}
