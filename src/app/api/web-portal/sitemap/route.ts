import { NextResponse } from 'next/server'
import { validateClientPortalSession } from '@/server/auth/clientPortalAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/web-portal/sitemap - Get all sitemap pages with feedback counts
export async function GET() {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  try {
    const pages = await prisma.websiteSitemap.findMany({
      where: { clientId: user.clientId },
      take: 200,
      select: {
        id: true,
        pageName: true,
        pageSlug: true,
        pageUrl: true,
        pageType: true,
        description: true,
        status: true,
        order: true,
        wireframeUrl: true,
        designUrl: true,
        previewUrl: true,
        _count: {
          select: {
            feedback: true,
          },
        },
        feedback: {
          where: { status: 'PENDING' },
          select: { id: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    // Transform pages to include feedback stats
    const pagesWithStats = pages.map(page => ({
      id: page.id,
      pageName: page.pageName,
      pageSlug: page.pageSlug,
      pageUrl: page.pageUrl,
      pageType: page.pageType,
      description: page.description,
      status: page.status,
      order: page.order,
      wireframeUrl: page.wireframeUrl,
      designUrl: page.designUrl,
      previewUrl: page.previewUrl,
      feedbackCount: page._count.feedback,
      pendingFeedbackCount: page.feedback.length,
    }))

    // Get status summary
    const statusSummary = {
      PLANNED: pages.filter(p => p.status === 'PLANNED').length,
      IN_DESIGN: pages.filter(p => p.status === 'IN_DESIGN').length,
      IN_DEVELOPMENT: pages.filter(p => p.status === 'IN_DEVELOPMENT').length,
      REVIEW: pages.filter(p => p.status === 'REVIEW').length,
      APPROVED: pages.filter(p => p.status === 'APPROVED').length,
      LIVE: pages.filter(p => p.status === 'LIVE').length,
    }

    return NextResponse.json({
      pages: pagesWithStats,
      summary: statusSummary,
      total: pages.length,
    })
  } catch (error) {
    console.error('Failed to fetch sitemap:', error)
    return NextResponse.json({ error: 'Failed to fetch sitemap' }, { status: 500 })
  }
}
