import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET /api/seo/dashboard - Aggregated SEO metrics
export const GET = withAuth(async () => {
  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [
    totalKeywords,
    keywordsInTop10,
    keywordsInTop3,
    totalBacklinks,
    liveBacklinks,
    pendingBacklinks,
    contentDraft,
    contentInReview,
    contentPublished,
    blogsDueThisWeek,
    tasksTodo,
    tasksInProgress,
    tasksInReview,
    tasksDone,
    recentTasks,
    topMovers,
    gbpProfileCount,
  ] = await Promise.all([
    prisma.seoKeyword.count({ where: { isActive: true } }),
    prisma.seoKeyword.count({ where: { isActive: true, currentRank: { lte: 10, gt: 0 } } }),
    prisma.seoKeyword.count({ where: { isActive: true, currentRank: { lte: 3, gt: 0 } } }),
    prisma.seoBacklink.count(),
    prisma.seoBacklink.count({ where: { status: 'LIVE' } }),
    prisma.seoBacklink.count({ where: { status: 'SUBMITTED' } }),
    prisma.seoContent.count({ where: { status: 'DRAFT' } }),
    prisma.seoContent.count({ where: { status: 'IN_REVIEW' } }),
    prisma.seoContent.count({ where: { status: 'PUBLISHED' } }),
    prisma.seoContent.count({
      where: {
        status: { in: ['DRAFT', 'IN_REVIEW'] },
        deadline: { lte: weekFromNow, gte: now },
      },
    }),
    prisma.seoTask.count({ where: { status: 'TODO' } }),
    prisma.seoTask.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.seoTask.count({ where: { status: 'REVIEW' } }),
    prisma.seoTask.count({ where: { status: 'DONE' } }),
    prisma.seoTask.findMany({
      where: { status: { not: 'DONE' } },
      include: {
        client: { select: { name: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
      take: 8,
    }),
    // Top movers: keywords where currentRank < previousRank (improved)
    prisma.seoKeyword.findMany({
      where: {
        isActive: true,
        currentRank: { not: null },
        previousRank: { not: null },
      },
      include: { client: { select: { name: true } } },
      orderBy: { currentRank: 'asc' },
      take: 50,
    }),
    prisma.gbpProfile.count(),
  ])

  // Calculate movers and decliners
  const keywordsWithChange = topMovers
    .filter((k) => k.currentRank && k.previousRank)
    .map((k) => ({
      keyword: k.keyword,
      client: k.client.name,
      currentRank: k.currentRank!,
      previousRank: k.previousRank!,
      change: k.previousRank! - k.currentRank!,
    }))

  const movers = keywordsWithChange
    .filter((k) => k.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 5)

  const decliners = keywordsWithChange
    .filter((k) => k.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 5)

  return NextResponse.json({
    keywords: {
      total: totalKeywords,
      top3: keywordsInTop3,
      top10: keywordsInTop10,
    },
    backlinks: {
      total: totalBacklinks,
      live: liveBacklinks,
      pending: pendingBacklinks,
    },
    content: {
      draft: contentDraft,
      inReview: contentInReview,
      published: contentPublished,
      dueThisWeek: blogsDueThisWeek,
    },
    tasks: {
      todo: tasksTodo,
      inProgress: tasksInProgress,
      inReview: tasksInReview,
      done: tasksDone,
      recent: recentTasks,
    },
    rankings: {
      movers,
      decliners,
    },
    gbpProfiles: gbpProfileCount,
  })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })
