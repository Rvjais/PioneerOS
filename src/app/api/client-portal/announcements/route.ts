import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/announcements - Get announcements for client
export const GET = withClientAuth(async (req: NextRequest, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Fetch client tier for announcement targeting
  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    select: { tier: true },
  })

  const clientTier = client?.tier || ''
  const now = new Date()

  const announcements = await prisma.clientAnnouncement.findMany({
    where: {
      isActive: true,
      publishAt: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
      AND: [
        {
          OR: [
            { targetAll: true },
            { clientId: user.clientId },
            { targetTiers: { contains: clientTier } },
          ],
        },
      ],
    },
    orderBy: [
      { isPinned: 'desc' },
      { priority: 'asc' },
      { publishAt: 'desc' },
    ],
    take: limit,
    skip: offset,
  })

  const totalCount = await prisma.clientAnnouncement.count({
    where: {
      isActive: true,
      publishAt: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
      AND: [
        {
          OR: [
            { targetAll: true },
            { clientId: user.clientId },
            { targetTiers: { contains: clientTier } },
          ],
        },
      ],
    },
  })

  return NextResponse.json({
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      type: a.type,
      priority: a.priority,
      isPinned: a.isPinned,
      imageUrl: a.imageUrl,
      actionUrl: a.actionUrl,
      actionLabel: a.actionLabel,
      publishAt: a.publishAt,
    })),
    totalCount,
    hasMore: offset + limit < totalCount,
  })
}, { rateLimit: 'READ' })
