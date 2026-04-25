import { NextRequest, NextResponse } from 'next/server'
import { validateClientPortalSession } from '@/server/auth/clientPortalAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const feedbackSchema = z.object({
  feedbackType: z.enum(['COMMENT', 'CHANGE_REQUEST', 'APPROVAL', 'QUESTION']).default('COMMENT'),
  message: z.string().min(1).max(5000),
  screenshotUrl: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(), // For replies
})

// GET /api/web-portal/sitemap/[pageId]/feedback - Get feedback for a page
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
    // Verify page belongs to client
    const page = await prisma.websiteSitemap.findFirst({
      where: {
        id: pageId,
        clientId: user.clientId,
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const feedback = await prisma.pageFeedback.findMany({
      where: {
        sitemapId: pageId,
        parentId: null, // Only top-level
      },
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
    })

    const feedbackWithAuthors = feedback.map(f => ({
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

    return NextResponse.json({ feedback: feedbackWithAuthors })
  } catch (error) {
    console.error('Failed to fetch feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

// POST /api/web-portal/sitemap/[pageId]/feedback - Submit feedback
export async function POST(
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
    const body = await req.json()
    const validation = feedbackSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const data = validation.data

    // Verify page belongs to client
    const page = await prisma.websiteSitemap.findFirst({
      where: {
        id: pageId,
        clientId: user.clientId,
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // If this is a reply, verify parent exists and belongs to this page
    if (data.parentId) {
      const parent = await prisma.pageFeedback.findFirst({
        where: {
          id: data.parentId,
          sitemapId: pageId,
        },
      })

      if (!parent) {
        return NextResponse.json({ error: 'Parent feedback not found' }, { status: 404 })
      }
    }

    // Create feedback
    const feedback = await prisma.pageFeedback.create({
      data: {
        sitemapId: pageId,
        clientUserId: user.id,
        feedbackType: data.feedbackType,
        message: data.message,
        screenshotUrl: data.screenshotUrl || null,
        parentId: data.parentId || null,
        status: 'PENDING',
      },
      include: {
        clientUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        feedbackType: feedback.feedbackType,
        message: feedback.message,
        screenshotUrl: feedback.screenshotUrl,
        status: feedback.status,
        createdAt: feedback.createdAt,
        author: {
          type: 'client',
          id: feedback.clientUser!.id,
          name: feedback.clientUser!.name,
        },
      },
    })
  } catch (error) {
    console.error('Failed to create feedback:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
