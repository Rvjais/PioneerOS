import { NextRequest, NextResponse } from 'next/server'
import { validateClientPortalSession } from '@/server/auth/clientPortalAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/web-portal/sitemap/[pageId] - Get page details with feedback
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth
  const { pageId } = await params

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  try {
    const page = await prisma.websiteSitemap.findFirst({
      where: {
        id: pageId,
        clientId: user.clientId,
      },
      include: {
        feedback: {
          where: { parentId: null }, // Only top-level feedback
          include: {
            clientUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            replies: {
              include: {
                clientUser: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Transform feedback to include author info
    const feedbackWithAuthors = page.feedback.map(f => ({
      id: f.id,
      feedbackType: f.feedbackType,
      message: f.message,
      screenshotUrl: f.screenshotUrl,
      status: f.status,
      createdAt: f.createdAt,
      resolvedAt: f.resolvedAt,
      author: f.clientUser
        ? { type: 'client', id: f.clientUser.id, name: f.clientUser.name }
        : f.user
        ? { type: 'team', id: f.user.id, name: `${f.user.firstName} ${f.user.lastName || ''}`.trim() }
        : null,
      replies: f.replies.map(r => ({
        id: r.id,
        feedbackType: r.feedbackType,
        message: r.message,
        screenshotUrl: r.screenshotUrl,
        status: r.status,
        createdAt: r.createdAt,
        author: r.clientUser
          ? { type: 'client', id: r.clientUser.id, name: r.clientUser.name }
          : r.user
          ? { type: 'team', id: r.user.id, name: `${r.user.firstName} ${r.user.lastName || ''}`.trim() }
          : null,
      })),
    }))

    return NextResponse.json({
      page: {
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
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
      feedback: feedbackWithAuthors,
      feedbackCount: page.feedback.length,
    })
  } catch (error) {
    console.error('Failed to fetch page details:', error)
    return NextResponse.json({ error: 'Failed to fetch page details' }, { status: 500 })
  }
}
