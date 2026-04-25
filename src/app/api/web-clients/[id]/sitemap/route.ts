import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const pageSchema = z.object({
  pageName: z.string().min(1).max(100),
  pageSlug: z.string().min(1).max(200),
  pageUrl: z.string().url().optional().nullable(),
  pageType: z.enum(['STATIC', 'DYNAMIC', 'BLOG', 'PRODUCT', 'LANDING']).default('STATIC'),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(['PLANNED', 'IN_DESIGN', 'IN_DEVELOPMENT', 'REVIEW', 'APPROVED', 'LIVE']).default('PLANNED'),
  order: z.number().int().min(0).default(0),
  wireframeUrl: z.string().url().optional().nullable(),
  designUrl: z.string().url().optional().nullable(),
  previewUrl: z.string().url().optional().nullable(),
})

// GET /api/web-clients/[id]/sitemap - Get all sitemap pages for a client
export const GET = withAuth(async (req, { user, params: routeParams }) => {

  const { id: clientId } = await routeParams!

  try {
    const pages = await prisma.websiteSitemap.findMany({
      where: { clientId },
      include: {
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
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      feedbackCount: page._count.feedback,
      pendingFeedbackCount: page.feedback.length,
    }))

    return NextResponse.json({ pages: pagesWithStats })
  } catch (error) {
    console.error('Failed to fetch sitemap:', error)
    return NextResponse.json({ error: 'Failed to fetch sitemap' }, { status: 500 })
  }
})

// POST /api/web-clients/[id]/sitemap - Add new page to sitemap
export const POST = withAuth(async (req, { user, params: routeParams }) => {

  const { id: clientId } = await routeParams!

  try {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const body = await req.json()
    const validation = pageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const data = validation.data

    // Get the next order number if not provided
    if (data.order === 0) {
      const lastPage = await prisma.websiteSitemap.findFirst({
        where: { clientId },
        orderBy: { order: 'desc' },
      })
      data.order = (lastPage?.order ?? -1) + 1
    }

    const page = await prisma.websiteSitemap.create({
      data: {
        clientId,
        pageName: data.pageName,
        pageSlug: data.pageSlug,
        pageUrl: data.pageUrl || null,
        pageType: data.pageType,
        description: data.description || null,
        status: data.status,
        order: data.order,
        wireframeUrl: data.wireframeUrl || null,
        designUrl: data.designUrl || null,
        previewUrl: data.previewUrl || null,
      },
    })

    return NextResponse.json({ success: true, page })
  } catch (error: unknown) {
    console.error('Failed to create page:', error)
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
})
