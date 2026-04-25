import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/social/dashboard — Aggregate stats for the social media dashboard
export const GET = withAuth(async (req, { user }) => {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)

    // Get clients assigned to this user
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
    const assignedClientIds = isSuperAdmin
      ? undefined
      : (
          await prisma.clientTeamMember.findMany({
            where: { userId: user.id },
            select: { clientId: true },
          })
        ).map((c) => c.clientId)

    const clientFilter = assignedClientIds
      ? { clientId: { in: assignedClientIds } }
      : {}

    const postFilter = assignedClientIds ? { clientId: { in: assignedClientIds } } : {}

    // Run all queries in parallel
    const [
      pendingApprovals,
      clientApprovalPending,
      scheduledToday,
      publishedThisWeek,
      topPerformingPost,
      postsDueToday,
      recentPosts,
      engagementData,
    ] = await Promise.all([
      // Design approval pending (internal)
      prisma.contentApproval.count({
        where: {
          ...clientFilter,
          status: 'PENDING',
          approvalType: 'INTERNAL',
        },
      }),

      // Client approval pending
      prisma.contentApproval.count({
        where: {
          ...clientFilter,
          status: 'PENDING',
          approvalType: 'CLIENT',
        },
      }),

      // Posts posted today (used as "scheduled today" proxy)
      prisma.socialMediaPost.count({
        where: {
          ...postFilter,
          postedAt: { gte: todayStart, lt: todayEnd },
        },
      }),

      // Posts published this week
      prisma.socialMediaPost.count({
        where: {
          ...postFilter,
          postedAt: { gte: weekStart, lt: todayEnd },
        },
      }),

      // Top performing post
      prisma.socialMediaPost.findFirst({
        where: {
          ...postFilter,
          isTopPerformer: true,
        },
        orderBy: { postedAt: 'desc' },
        include: {
          client: { select: { id: true, name: true } },
        },
      }),

      // Posts due today
      prisma.socialMediaPost.count({
        where: {
          ...postFilter,
          postedAt: { gte: todayStart, lt: todayEnd },
        },
      }),

      // Recent posts for the table
      prisma.socialMediaPost.findMany({
        where: postFilter,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          client: { select: { id: true, name: true } },
        },
      }),

      // Engagement this week (sum of likes + comments + shares from posts)
      prisma.socialMediaPost.aggregate({
        where: {
          ...postFilter,
          postedAt: { gte: weekStart, lt: todayEnd },
        },
        _sum: {
          likes: true,
          comments: true,
          shares: true,
        },
      }),
    ])

    const engagementThisWeek =
      (engagementData._sum?.likes || 0) +
      (engagementData._sum?.comments || 0) +
      (engagementData._sum?.shares || 0)

    return NextResponse.json({
      myWork: {
        postsDueToday,
        designsPending: pendingApprovals,
        postsScheduled: scheduledToday,
      },
      approvals: {
        designsPendingApproval: pendingApprovals,
        clientApprovalPending,
      },
      publishing: {
        scheduledToday,
        publishedThisWeek,
      },
      performance: {
        engagementThisWeek,
        topPost: topPerformingPost
          ? {
              client: topPerformingPost.client?.name || '-',
              platform: topPerformingPost.platform || '-',
              engagement: topPerformingPost.likes || 0,
              type: topPerformingPost.contentType || '-',
            }
          : { client: '-', platform: '-', engagement: 0, type: '-' },
      },
      recentPosts: recentPosts.map((p) => ({
        client: p.client?.name || '-',
        platform: p.platform || '-',
        type: p.contentType || '-',
        status: 'PUBLISHED',
        engagement: p.likes || 0,
      })),
    })
  } catch (error) {
    console.error('[Social Dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERN'] })
