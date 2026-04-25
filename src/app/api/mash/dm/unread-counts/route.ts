import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user }) => {
  try {
    const currentUserId = user.id

    // Get unread DM counts per sender
    const unreadCounts = await prisma.directMessage.groupBy({
      by: ['senderId'],
      where: {
        receiverId: currentUserId,
        isRead: false,
        isDeleted: false,
      },
      _count: {
        id: true,
      },
    })

    // Transform into a map: senderId -> unreadCount
    const unreadMap: Record<string, number> = {}
    unreadCounts.forEach(({ senderId, _count }) => {
      unreadMap[senderId] = _count.id
    })

    return NextResponse.json(unreadMap)
  } catch (error) {
    console.error('Failed to fetch unread DM counts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
