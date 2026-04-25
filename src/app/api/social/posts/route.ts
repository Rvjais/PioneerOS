import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/social/posts — List posts with filters
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const platform = searchParams.get('platform')
    const contentType = searchParams.get('contentType')
    const month = searchParams.get('month') // ISO date string
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    // Build filter
    const where: Record<string, any> = {}

    // Scope to user's assigned clients unless admin/manager
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
    if (!isSuperAdmin) {
      const assignedClientIds = (
        await prisma.clientTeamMember.findMany({
          where: { userId: user.id },
          select: { clientId: true },
        })
      ).map((c) => c.clientId)
      where.clientId = { in: assignedClientIds }
    }

    if (clientId) where.clientId = clientId
    if (platform) where.platform = platform
    if (contentType) where.contentType = contentType
    if (month) {
      const monthDate = new Date(month)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
      where.month = { gte: monthStart, lt: monthEnd }
    }

    const [posts, total] = await Promise.all([
      prisma.socialMediaPost.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, logoUrl: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { postedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.socialMediaPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Social Posts GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN'] })

// POST /api/social/posts — Create a new published post record
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()

    const {
      clientId,
      month,
      postUrl,
      platform,
      contentType,
      caption,
      postedAt,
      likes,
      comments,
      shares,
      saves,
      reach,
      impressions,
      views,
      watchTime,
      engagementRate,
      isTopPerformer,
      performanceNotes,
    } = body

    // Validate required fields
    if (!clientId || !postUrl || !platform || !contentType || !postedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, postUrl, platform, contentType, postedAt' },
        { status: 400 }
      )
    }

    // Verify user has access to this client (unless admin)
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
    if (!isSuperAdmin) {
      const assignment = await prisma.clientTeamMember.findUnique({
        where: { clientId_userId: { clientId, userId: user.id } },
      })
      if (!assignment) {
        return NextResponse.json(
          { error: 'You are not assigned to this client' },
          { status: 403 }
        )
      }
    }

    const post = await prisma.socialMediaPost.create({
      data: {
        userId: user.id,
        clientId,
        month: month ? new Date(month) : new Date(new Date(postedAt).getFullYear(), new Date(postedAt).getMonth(), 1),
        postUrl,
        platform,
        contentType,
        caption: caption || null,
        postedAt: new Date(postedAt),
        likes: likes || 0,
        comments: comments || 0,
        shares: shares || 0,
        saves: saves || 0,
        reach: reach || 0,
        impressions: impressions || 0,
        views: views ?? null,
        watchTime: watchTime ?? null,
        engagementRate: engagementRate || 0,
        isTopPerformer: isTopPerformer || false,
        performanceNotes: performanceNotes || null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('[Social Posts POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN'] })
