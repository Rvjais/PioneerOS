import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const markNotificationsSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAllRead: z.boolean().optional(),
}).refine(
  (data) => data.markAllRead || (data.notificationIds && data.notificationIds.length > 0),
  { message: 'Either markAllRead or notificationIds must be provided' }
)

// GET /api/client-portal/notifications - Get notifications for user
export const GET = withClientAuth(async (req, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const unreadOnly = searchParams.get('unread') === 'true'
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const [notifications, unreadCount, totalCount] = await Promise.all([
    prisma.portalNotification.findMany({
      where: {
        AND: [
          {
            OR: [
              { clientId: user.clientId, clientUserId: null },
              { clientUserId: user.id },
            ],
          },
          unreadOnly ? { isRead: false } : {},
          category ? { category } : {},
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.portalNotification.count({
      where: {
        AND: [
          {
            OR: [
              { clientId: user.clientId, clientUserId: null },
              { clientUserId: user.id },
            ],
          },
          { isRead: false },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        ],
      },
    }),
    prisma.portalNotification.count({
      where: {
        AND: [
          {
            OR: [
              { clientId: user.clientId, clientUserId: null },
              { clientUserId: user.id },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        ],
      },
    }),
  ])

  return NextResponse.json({
    notifications,
    unreadCount,
    totalCount,
    hasMore: offset + limit < totalCount,
  })
}, { rateLimit: 'READ' })

// PUT /api/client-portal/notifications - Mark notifications as read
export const PUT = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const parsed = markNotificationsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { notificationIds, markAllRead } = parsed.data

  if (markAllRead) {
    // Mark all as read
    await prisma.portalNotification.updateMany({
      where: {
        AND: [
          {
            OR: [
              { clientId: user.clientId, clientUserId: null },
              { clientUserId: user.id },
            ],
          },
          { isRead: false },
        ],
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
  }

  // Mark specific notifications as read
  await prisma.portalNotification.updateMany({
    where: {
      id: { in: notificationIds },
      AND: [
        {
          OR: [
            { clientId: user.clientId, clientUserId: null },
            { clientUserId: user.id },
          ],
        },
      ],
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return NextResponse.json({ success: true })
}, { rateLimit: 'WRITE' })

// DELETE /api/client-portal/notifications - Delete notifications
export const DELETE = withClientAuth(async (req, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const notificationId = searchParams.get('id')
  const deleteAllRead = searchParams.get('deleteAllRead') === 'true'

  if (deleteAllRead) {
    await prisma.portalNotification.deleteMany({
      where: {
        AND: [
          {
            OR: [
              { clientId: user.clientId, clientUserId: null },
              { clientUserId: user.id },
            ],
          },
          { isRead: true },
        ],
      },
    })

    return NextResponse.json({ success: true, message: 'All read notifications deleted' })
  }

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
  }

  const notification = await prisma.portalNotification.findFirst({
    where: {
      id: notificationId,
      AND: [
        {
          OR: [
            { clientId: user.clientId, clientUserId: null },
            { clientUserId: user.id },
          ],
        },
      ],
    },
  })

  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
  }

  await prisma.portalNotification.delete({
    where: { id: notificationId },
  })

  return NextResponse.json({ success: true })
}, { rateLimit: 'WRITE' })
