import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch employer branding content
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const platform = searchParams.get('platform')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (type) where.type = type
    if (platform) where.platform = platform

    if (from || to) {
      where.scheduledFor = {}
      if (from) (where.scheduledFor as Record<string, unknown>).gte = new Date(from)
      if (to) (where.scheduledFor as Record<string, unknown>).lte = new Date(to)
    }

    const content = await prisma.employerBrandingContent.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: [
        { scheduledFor: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Get stats
    const stats = {
      total: content.length,
      ideas: content.filter(c => c.status === 'IDEA').length,
      pendingApproval: content.filter(c => c.status === 'PENDING_APPROVAL').length,
      scheduled: content.filter(c => c.status === 'SCHEDULED').length,
      published: content.filter(c => c.status === 'PUBLISHED').length,
    }

    // Get content ideas bank
    const ideas = await prisma.contentIdea.findMany({
      where: { status: 'BANK' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ content, stats, ideas })
  } catch (error) {
    console.error('Error fetching branding content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
})

// POST: Create new employer branding content
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR or admins can create employer branding content
    const isHR = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(user.role || '') || user.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      description,
      type,
      platform,
      contentText,
      mediaUrls,
      hashtags,
      scheduledFor,
    } = body

    if (!title || !type || !platform) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const content = await prisma.employerBrandingContent.create({
      data: {
        title,
        description,
        type,
        platform,
        contentText,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        hashtags,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: 'DRAFT', // Always start as DRAFT regardless of request body
        createdBy: user.id
      },
      include: {
        creator: true
      }
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error creating branding content:', error)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
})
