import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/social/metrics — List page metrics with filters
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const platform = searchParams.get('platform')
    const month = searchParams.get('month') // ISO date string
    const groupBy = searchParams.get('groupBy') // 'platform' for platform-level aggregation
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

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
    if (month) {
      const monthDate = new Date(month)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
      where.month = { gte: monthStart, lt: monthEnd }
    }

    // Platform-level aggregation
    if (groupBy === 'platform') {
      const allMetrics = await prisma.socialMediaPageMetrics.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      const platformMap: Record<string, {
        platform: string
        clients: Set<string>
        totalFollowers: number
        totalFollowerGrowth: number
        totalEngagement: number
        totalEngagementRate: number
        totalPostsPublished: number
        count: number
      }> = {}

      for (const m of allMetrics) {
        if (!platformMap[m.platform]) {
          platformMap[m.platform] = {
            platform: m.platform,
            clients: new Set(),
            totalFollowers: 0,
            totalFollowerGrowth: 0,
            totalEngagement: 0,
            totalEngagementRate: 0,
            totalPostsPublished: 0,
            count: 0,
          }
        }
        const entry = platformMap[m.platform]
        entry.clients.add(m.client.name)
        entry.totalFollowers += m.followers
        entry.totalFollowerGrowth += m.followerGrowth
        entry.totalEngagement += m.totalEngagement
        entry.totalEngagementRate += m.engagementRate
        entry.totalPostsPublished += m.postsPublished + m.reelsPublished + m.storiesPublished
        entry.count += 1
      }

      const platformData = Object.values(platformMap).map(p => ({
        id: p.platform,
        platform: p.platform,
        clientCount: p.clients.size,
        followers: p.totalFollowers,
        followersGrowth: p.count > 0 ? parseFloat((p.totalFollowerGrowth / p.count).toFixed(1)) : 0,
        postsPerMonth: p.count > 0 ? Math.round(p.totalPostsPublished / p.count) : 0,
        avgEngagement: p.count > 0 ? parseFloat((p.totalEngagementRate / p.count).toFixed(1)) : 0,
        totalEngagement: p.totalEngagement,
        status: 'ACTIVE' as const,
      }))

      return NextResponse.json(platformData)
    }

    const [metrics, total] = await Promise.all([
      prisma.socialMediaPageMetrics.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, logoUrl: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [{ month: 'desc' }, { platform: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.socialMediaPageMetrics.count({ where }),
    ])

    return NextResponse.json({
      metrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Social Metrics GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN'] })

// POST /api/social/metrics — Submit monthly page metrics
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()

    const {
      clientId,
      month,
      platform,
      followers,
      prevFollowers,
      followerGrowth,
      totalReach,
      prevTotalReach,
      reachGrowth,
      totalEngagement,
      engagementRate,
      prevEngagementRate,
      postsPublished,
      reelsPublished,
      storiesPublished,
      leadsGenerated,
      linkClicks,
      profileVisits,
      connections,
      subscribers,
      videoViews,
    } = body

    if (!clientId || !month || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, month, platform' },
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

    const monthDate = new Date(month)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)

    // Upsert: update if exists for same client/month/platform, else create
    const metrics = await prisma.socialMediaPageMetrics.upsert({
      where: {
        clientId_month_platform: {
          clientId,
          month: monthStart,
          platform,
        },
      },
      update: {
        userId: user.id,
        followers: followers || 0,
        prevFollowers: prevFollowers || 0,
        followerGrowth: followerGrowth || 0,
        totalReach: totalReach || 0,
        prevTotalReach: prevTotalReach || 0,
        reachGrowth: reachGrowth || 0,
        totalEngagement: totalEngagement || 0,
        engagementRate: engagementRate || 0,
        prevEngagementRate: prevEngagementRate || 0,
        postsPublished: postsPublished || 0,
        reelsPublished: reelsPublished || 0,
        storiesPublished: storiesPublished || 0,
        leadsGenerated: leadsGenerated || 0,
        linkClicks: linkClicks || 0,
        profileVisits: profileVisits || 0,
        connections: connections ?? null,
        subscribers: subscribers ?? null,
        videoViews: videoViews ?? null,
      },
      create: {
        userId: user.id,
        clientId,
        month: monthStart,
        platform,
        followers: followers || 0,
        prevFollowers: prevFollowers || 0,
        followerGrowth: followerGrowth || 0,
        totalReach: totalReach || 0,
        prevTotalReach: prevTotalReach || 0,
        reachGrowth: reachGrowth || 0,
        totalEngagement: totalEngagement || 0,
        engagementRate: engagementRate || 0,
        prevEngagementRate: prevEngagementRate || 0,
        postsPublished: postsPublished || 0,
        reelsPublished: reelsPublished || 0,
        storiesPublished: storiesPublished || 0,
        leadsGenerated: leadsGenerated || 0,
        linkClicks: linkClicks || 0,
        profileVisits: profileVisits || 0,
        connections: connections ?? null,
        subscribers: subscribers ?? null,
        videoViews: videoViews ?? null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(metrics, { status: 201 })
  } catch (error) {
    console.error('[Social Metrics POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit metrics' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN'] })
