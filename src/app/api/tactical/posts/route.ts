import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const schema = z.object({
      clientId: z.string().min(1),
      postUrl: z.string().min(1).max(1000),
      platform: z.string().min(1).max(50),
      contentType: z.string().max(100).optional(),
      likes: z.number().int().min(0).optional().default(0),
      comments: z.number().int().min(0).optional().default(0),
      shares: z.number().int().min(0).optional().default(0),
      saves: z.number().int().min(0).optional().default(0),
      reach: z.number().int().min(0).optional().default(0),
      impressions: z.number().int().min(0).optional().default(0),
      views: z.number().int().min(0).optional().default(0),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const {
      clientId,
      postUrl,
      platform,
      contentType,
      likes,
      comments,
      shares,
      saves,
      reach,
      impressions,
      views,
    } = result.data

    // Calculate engagement rate
    const totalEngagement = likes + comments + shares + saves
    const engagementRate = reach > 0 ? (totalEngagement / reach) * 100 : 0

    // Determine if this is a top performer (ER > 5% or high reach)
    const isTopPerformer = engagementRate >= 5 || reach >= 10000

    // Get current month start
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const post = await prisma.socialMediaPost.create({
      data: {
        userId: user.id,
        clientId,
        month: monthStart,
        postUrl,
        platform: platform.toLowerCase(),
        contentType: contentType ?? '',
        postedAt: new Date(),
        likes,
        comments,
        shares,
        saves,
        reach,
        impressions,
        views: views || null,
        engagementRate,
        isTopPerformer,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Failed to create social media post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const month = searchParams.get('month')

    const whereClause: Record<string, unknown> = {
      userId: user.id,
    }

    if (clientId) {
      whereClause.clientId = clientId
    }

    if (month) {
      const monthDate = new Date(month)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)
      whereClause.month = { gte: monthStart, lte: monthEnd }
    }

    const posts = await prisma.socialMediaPost.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, name: true, brandName: true },
        },
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch social media posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
})
