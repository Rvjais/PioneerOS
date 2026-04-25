import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/social/clients — Get clients assigned to the current user with social data
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit
    const search = searchParams.get('search')

    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'

    // Get assigned client IDs for non-admins
    let assignedClientIds: string[] | undefined
    if (!isSuperAdmin) {
      assignedClientIds = (
        await prisma.clientTeamMember.findMany({
          where: { userId: user.id },
          select: { clientId: true },
        })
      ).map((c) => c.clientId)
    }

    const where: Record<string, any> = {
      status: 'ACTIVE',
      deletedAt: null,
    }

    if (assignedClientIds) {
      where.id = { in: assignedClientIds }
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        select: {
          id: true,
          name: true,
          logoUrl: true,
          industry: true,
          status: true,
          tier: true,
          healthScore: true,
          healthStatus: true,
          facebookUrl: true,
          instagramUrl: true,
          linkedinUrl: true,
          twitterUrl: true,
          youtubeUrl: true,
          teamMembers: {
            select: {
              id: true,
              role: true,
              isPrimary: true,
              user: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ])

    // Fetch the latest page metrics for each client to get follower counts
    const clientIds = clients.map((c) => c.id)
    const latestMetrics = clientIds.length > 0
      ? await prisma.socialMediaPageMetrics.findMany({
          where: {
            clientId: { in: clientIds },
          },
          orderBy: { month: 'desc' },
          distinct: ['clientId', 'platform'],
          select: {
            clientId: true,
            platform: true,
            followers: true,
            followerGrowth: true,
            engagementRate: true,
            month: true,
          },
        })
      : []

    // Group metrics by clientId
    const metricsByClient: Record<string, typeof latestMetrics> = {}
    for (const metric of latestMetrics) {
      if (!metricsByClient[metric.clientId]) {
        metricsByClient[metric.clientId] = []
      }
      metricsByClient[metric.clientId].push(metric)
    }

    // Combine clients with their metrics
    const clientsWithMetrics = clients.map((client) => ({
      ...client,
      platformMetrics: metricsByClient[client.id] || [],
      socialPlatforms: [
        client.instagramUrl && 'INSTAGRAM',
        client.facebookUrl && 'FACEBOOK',
        client.linkedinUrl && 'LINKEDIN',
        client.twitterUrl && 'TWITTER',
        client.youtubeUrl && 'YOUTUBE',
      ].filter(Boolean),
    }))

    return NextResponse.json({
      clients: clientsWithMetrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Social Clients GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN'] })
