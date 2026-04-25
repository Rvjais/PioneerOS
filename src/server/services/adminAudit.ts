import { prisma } from '@/server/db/prisma'

/**
 * Log an admin action as a notification for audit trail purposes.
 * These entries appear in the admin audit log automatically.
 */
export async function logAdminAction(params: {
  userId: string
  action: string
  title: string
  message: string
  link?: string
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.action,
        title: params.title,
        message: params.message,
        link: params.link || null,
        priority: 'HIGH',
        isRead: false,
      },
    })
  } catch (error) {
    // Don't let audit logging failures break the main operation
    console.error('Failed to log admin action:', error)
  }
}
