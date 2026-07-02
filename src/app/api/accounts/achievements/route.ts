import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

export const GET = withAuth(async (req, { user }) => {
  const achievements = await prisma.achievement.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const mapped = achievements.map(a => ({
    id: a.id,
    title: a.title,
    description: a.description || '',
    icon: a.icon || 'star',
    category: a.category as 'milestone' | 'collections' | 'efficiency' | 'special',
    earnedAt: a.earnedAt?.toISOString() || null,
    progress: a.progress,
    target: a.target,
    rarity: a.rarity as 'common' | 'rare' | 'epic' | 'legendary',
  }))

  return NextResponse.json({ achievements: mapped })
})
