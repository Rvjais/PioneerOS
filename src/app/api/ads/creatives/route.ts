import { NextRequest, NextResponse } from 'next/server'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Helper: get client IDs the user is assigned to
async function getAssignedClientIds(userId: string): Promise<string[]> {
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true },
  })
  return assignments.map((a) => a.clientId)
}

// Only allow https:// URLs to prevent XSS via javascript: or data: URIs
const httpsUrl = z.string().url().refine((url) => url.startsWith('https://'), {
  message: 'URL must use HTTPS',
})

const createCreativeSchema = z.object({
  campaignId: z.string().min(1),
  clientId: z.string().min(1),
  name: z.string().min(1).max(255),
  type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT', 'HTML5']),
  platform: z.enum(['GOOGLE', 'META', 'LINKEDIN', 'YOUTUBE']),
  headline: z.string().optional(),
  description: z.string().optional(),
  callToAction: z.string().optional(),
  mediaUrl: httpsUrl.optional(),
  thumbnailUrl: httpsUrl.optional(),
  landingPageUrl: httpsUrl.optional(),
  parentId: z.string().optional(),
})

const updateCreativeSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'RUNNING', 'PAUSED', 'REJECTED']).optional(),
  name: z.string().min(1).max(255).optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  callToAction: z.string().optional(),
  mediaUrl: httpsUrl.optional(),
  thumbnailUrl: httpsUrl.optional(),
  landingPageUrl: httpsUrl.optional(),
  rejectionReason: z.string().optional(),
  impressions: z.number().int().min(0).optional(),
  clicks: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  ctr: z.number().nullable().optional(),
})

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const campaignId = searchParams.get('campaignId')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (clientId) {
        if (!assignedClientIds.includes(clientId)) {
          return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
        }
        where.clientId = clientId
      } else {
        where.clientId = { in: assignedClientIds }
      }
    } else if (clientId) {
      where.clientId = clientId
    }

    if (campaignId) where.campaignId = campaignId
    if (platform) where.platform = platform
    if (status) where.status = status
    if (type) where.type = type

    const [creatives, totalCount] = await Promise.all([
      prisma.adCreative.findMany({
        where,
        include: {
          campaign: { select: { id: true, name: true, platform: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.adCreative.count({ where }),
    ])

    return NextResponse.json({
      creatives,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch creatives:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = createCreativeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({ where: { id: data.campaignId }, select: { id: true } })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (!assignedClientIds.includes(data.clientId)) {
        return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
      }
    }

    // If this is a new version, get next version number
    let version = 1
    if (data.parentId) {
      const parent = await prisma.adCreative.findUnique({ where: { id: data.parentId }, select: { version: true } })
      if (!parent) {
        return NextResponse.json({ error: 'Parent creative not found' }, { status: 404 })
      }
      version = parent.version + 1
    }

    const creative = await prisma.adCreative.create({
      data: {
        campaignId: data.campaignId,
        clientId: data.clientId,
        name: data.name,
        type: data.type,
        platform: data.platform,
        headline: data.headline,
        description: data.description,
        callToAction: data.callToAction,
        mediaUrl: data.mediaUrl,
        thumbnailUrl: data.thumbnailUrl,
        landingPageUrl: data.landingPageUrl,
        parentId: data.parentId,
        version,
        createdById: user.id,
      },
      include: {
        campaign: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ creative }, { status: 201 })
  } catch (error) {
    console.error('Failed to create creative:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = updateCreativeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    const existing = await prisma.adCreative.findUnique({ where: { id: data.id }, select: { id: true, clientId: true, createdById: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Creative not found' }, { status: 404 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (!assignedClientIds.includes(existing.clientId)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Only managers can approve/reject creatives (prevents self-approval)
    if ((data.status === 'APPROVED' || data.status === 'REJECTED') && !isManagerOrAbove(user)) {
      return NextResponse.json({ error: 'Only managers can approve or reject creatives' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.status !== undefined) updateData.status = data.status
    if (data.name !== undefined) updateData.name = data.name
    if (data.headline !== undefined) updateData.headline = data.headline
    if (data.description !== undefined) updateData.description = data.description
    if (data.callToAction !== undefined) updateData.callToAction = data.callToAction
    if (data.mediaUrl !== undefined) updateData.mediaUrl = data.mediaUrl
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl
    if (data.landingPageUrl !== undefined) updateData.landingPageUrl = data.landingPageUrl
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason
    if (data.impressions !== undefined) updateData.impressions = data.impressions
    if (data.clicks !== undefined) updateData.clicks = data.clicks
    if (data.conversions !== undefined) updateData.conversions = data.conversions
    if (data.ctr !== undefined) updateData.ctr = data.ctr

    // Handle approval/rejection
    if (data.status === 'APPROVED') {
      updateData.approvedById = user.id
      updateData.approvedAt = new Date()
    } else if (data.status === 'REJECTED') {
      updateData.approvedById = null
      updateData.approvedAt = null
    }

    const creative = await prisma.adCreative.update({
      where: { id: data.id },
      data: updateData,
      include: {
        campaign: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ creative })
  } catch (error) {
    console.error('Failed to update creative:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
