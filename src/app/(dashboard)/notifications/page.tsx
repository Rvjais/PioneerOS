import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { NotificationsClient } from './NotificationsClient'

async function getNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  })

  return { notifications, unreadCount }
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { notifications, unreadCount } = await getNotifications(session.user.id)

  return (
    <NotificationsClient
      initialNotifications={notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        priority: n.priority,
        createdAt: n.createdAt.toISOString(),
      }))}
      initialUnreadCount={unreadCount}
    />
  )
}
