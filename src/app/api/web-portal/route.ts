import { NextResponse } from 'next/server'
import { validateClientPortalSession } from '@/server/auth/clientPortalAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/web-portal - Get web portal dashboard data
export async function GET() {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  // Check if user has website access
  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  try {
    // Fetch client with web project data
    const client = await prisma.client.findUnique({
      where: { id: user.clientId },
      select: {
        id: true,
        name: true,
        websiteUrl: true,
        webProjectStatus: true,
        webProjectStartDate: true,
        webProjectEndDate: true,
        websiteType: true,
        webProjectPhases: {
          select: {
            id: true,
            phase: true,
            status: true,
            order: true,
            startedAt: true,
            completedAt: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Fetch sitemap pages with feedback counts
    const sitemapPages = await prisma.websiteSitemap.findMany({
      where: { clientId: user.clientId },
      select: {
        id: true,
        pageName: true,
        pageSlug: true,
        status: true,
        order: true,
        _count: {
          select: {
            feedback: {
              where: { status: 'PENDING' },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    // Fetch maintenance contracts with expiry info
    const contracts = await prisma.maintenanceContract.findMany({
      where: {
        clientId: user.clientId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        type: true,
        domainName: true,
        domainExpiryDate: true,
        serverProvider: true,
        serverExpiryDate: true,
        endDate: true,
        status: true,
      },
      orderBy: { endDate: 'asc' },
    })

    // Fetch recent feedback
    const recentFeedback = await prisma.pageFeedback.findMany({
      where: {
        sitemap: { clientId: user.clientId },
      },
      select: {
        id: true,
        feedbackType: true,
        message: true,
        status: true,
        createdAt: true,
        sitemap: {
          select: {
            pageName: true,
            pageSlug: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Calculate phase progress
    const totalPhases = client.webProjectPhases.length
    const completedPhases = client.webProjectPhases.filter(p => p.status === 'COMPLETED').length
    const currentPhase = client.webProjectPhases.find(p => p.status === 'IN_PROGRESS')

    // Calculate expiry alerts
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const expiryAlerts = contracts.filter(c => {
      const domainExpiry = c.domainExpiryDate ? new Date(c.domainExpiryDate) : null
      const serverExpiry = c.serverExpiryDate ? new Date(c.serverExpiryDate) : null
      const contractEnd = new Date(c.endDate)

      return (
        (domainExpiry && domainExpiry <= thirtyDaysFromNow) ||
        (serverExpiry && serverExpiry <= thirtyDaysFromNow) ||
        contractEnd <= thirtyDaysFromNow
      )
    }).map(c => ({
      id: c.id,
      type: c.type,
      domainName: c.domainName,
      domainExpiryDate: c.domainExpiryDate,
      serverProvider: c.serverProvider,
      serverExpiryDate: c.serverExpiryDate,
      contractEndDate: c.endDate,
    }))

    // Page stats
    const pagesByStatus = {
      planned: sitemapPages.filter(p => p.status === 'PLANNED').length,
      inProgress: sitemapPages.filter(p => ['IN_DESIGN', 'IN_DEVELOPMENT', 'REVIEW'].includes(p.status)).length,
      live: sitemapPages.filter(p => p.status === 'LIVE').length,
      total: sitemapPages.length,
    }

    // Pending feedback count
    const pendingFeedbackCount = sitemapPages.reduce((sum, p) => sum + p._count.feedback, 0)

    return NextResponse.json({
      project: {
        status: client.webProjectStatus,
        startDate: client.webProjectStartDate,
        endDate: client.webProjectEndDate,
        websiteType: client.websiteType,
        websiteUrl: client.websiteUrl,
      },
      phases: {
        total: totalPhases,
        completed: completedPhases,
        current: currentPhase ? {
          phase: currentPhase.phase,
          startedAt: currentPhase.startedAt,
        } : null,
        all: client.webProjectPhases,
      },
      pages: {
        ...pagesByStatus,
        pendingFeedback: pendingFeedbackCount,
      },
      expiryAlerts,
      recentFeedback: recentFeedback.map(f => ({
        id: f.id,
        type: f.feedbackType,
        message: f.message.substring(0, 100) + (f.message.length > 100 ? '...' : ''),
        status: f.status,
        createdAt: f.createdAt,
        pageName: f.sitemap.pageName,
        pageSlug: f.sitemap.pageSlug,
        authorName: f.user ? `${f.user.firstName} ${f.user.lastName || ''}`.trim() : 'Team',
      })),
    })
  } catch (error) {
    console.error('Failed to fetch web portal dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
