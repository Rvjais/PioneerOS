import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { channelId } = await routeParams!

    // SECURITY FIX: Verify channel exists and check access
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      include: {
        members: { where: { userId: user.id }, take: 1 }
      }
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check if user is a member or if channel is public
    const isMember = channel.members.length > 0
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')
    const isPublicChannel = channel.type === 'PUBLIC' || channel.type === 'ANNOUNCEMENT'

    if (!isMember && !isAdmin && !isPublicChannel) {
      return NextResponse.json({ error: 'Access denied to this channel' }, { status: 403 })
    }

    // Get messages with sender info
    const messages = await prisma.chatMessage.findMany({
      where: {
        channelId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: { profilePicture: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100, // Limit to last 100 messages
    })

    // Only update last read for existing members (don't auto-join)
    if (isMember) {
      await prisma.chatChannelMember.update({
        where: {
          channelId_userId: {
            channelId,
            userId: user.id,
          },
        },
        data: { lastReadAt: new Date() },
      })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { channelId } = await routeParams!
    const { content, type, priority, parentId } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Check if channel exists and user has permission
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
    })

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Check if channel is read-only and user is not admin
    if (channel.isReadOnly) {
      const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
      if (!isAdmin) {
        return NextResponse.json({ error: 'Only admins can post in this channel' }, { status: 403 })
      }
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        channelId,
        senderId: user.id,
        content: content.trim(),
        type: type || 'TEXT',
        priority: priority || null,
        parentId: parentId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: { profilePicture: true },
            },
          },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
