import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { userId } = await routeParams!
    const currentUserId = user.id

    // Get messages between current user and target user
    const messages = await prisma.directMessage.findMany({
      where: {
        isDeleted: false,
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    // Mark unread messages as read
    await prisma.directMessage.updateMany({
      where: {
        senderId: userId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    // Transform to include sender info in expected format
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: { select: { profilePicture: true } },
      },
    })

    const currentUserInfo = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: { select: { profilePicture: true } },
      },
    })

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      type: msg.type,
      priority: null,
      isPinned: false,
      createdAt: msg.createdAt.toISOString(),
      sender: msg.senderId === currentUserId ? currentUserInfo : targetUser,
      reactions: null,
      parentId: null,
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Failed to fetch DMs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { userId } = await routeParams!
    const { content, type } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create DM
    const dm = await prisma.directMessage.create({
      data: {
        senderId: user.id,
        receiverId: userId,
        content: content.trim(),
        type: type || 'TEXT',
      },
    })

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: { select: { profilePicture: true } },
      },
    })

    return NextResponse.json({
      id: dm.id,
      content: dm.content,
      type: dm.type,
      priority: null,
      isPinned: false,
      createdAt: dm.createdAt.toISOString(),
      sender,
      reactions: null,
      parentId: null,
    })
  } catch (error) {
    console.error('Failed to send DM:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
