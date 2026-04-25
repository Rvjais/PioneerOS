import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const ADMIN_ROLES = ['SUPER_ADMIN', 'MANAGER', 'HR']

const announcementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  type: z.enum(['INFO', 'UPDATE', 'MAINTENANCE', 'FEATURE', 'ALERT']).default('INFO'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  targetAll: z.boolean().default(false),
  clientId: z.string().optional().nullable(),
  targetTiers: z.array(z.string()).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  actionUrl: z.string().url().optional().nullable(),
  actionLabel: z.string().max(50).optional().nullable(),
  publishAt: z.string().transform((s) => new Date(s)).optional().nullable(),
  expiresAt: z.string().transform((s) => new Date(s)).optional().nullable(),
  isPinned: z.boolean().default(false),
})

// GET /api/admin/announcements - List all announcements
export const GET = withAuth(async (req, { user }) => {
  if (!ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const status = searchParams.get('status') // active, expired, scheduled, all
  const limit = parseInt(searchParams.get('limit') || '50')

  const now = new Date()

  let whereClause = {}
  if (status === 'active') {
    whereClause = {
      isActive: true,
      publishAt: { lte: now },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    }
  } else if (status === 'expired') {
    whereClause = {
      expiresAt: { lte: now },
    }
  } else if (status === 'scheduled') {
    whereClause = {
      publishAt: { gt: now },
    }
  }

  const announcements = await prisma.clientAnnouncement.findMany({
    where: whereClause,
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: {
      client: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ announcements })
})

// POST /api/admin/announcements - Create announcement
export const POST = withAuth(async (req, { user }) => {
  if (!ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await req.json()
  const validation = announcementSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  // Validate targeting - either targetAll, specific client, or tiers
  if (!data.targetAll && !data.clientId && (!data.targetTiers || data.targetTiers.length === 0)) {
    return NextResponse.json({ error: 'Must target all, a specific client, or specific tiers' }, { status: 400 })
  }

  const announcement = await prisma.clientAnnouncement.create({
    data: {
      title: data.title,
      content: data.content,
      type: data.type,
      priority: data.priority,
      targetAll: data.targetAll,
      clientId: data.clientId,
      targetTiers: data.targetTiers ? JSON.stringify(data.targetTiers) : null,
      imageUrl: data.imageUrl,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      publishAt: data.publishAt ?? new Date(),
      expiresAt: data.expiresAt,
      isPinned: data.isPinned,
      createdById: user.id,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ success: true, announcement })
})

// PUT /api/admin/announcements - Update announcement
export const PUT = withAuth(async (req, { user }) => {
  if (!ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...updateData } = body

  if (!id) {
    return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 })
  }

  if (typeof updateData.isActive !== 'undefined' && typeof updateData.isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 })
  }

  const existing = await prisma.clientAnnouncement.findUnique({
    where: { id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
  }

  const validation = announcementSchema.partial().safeParse(updateData)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  const announcement = await prisma.clientAnnouncement.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      type: data.type,
      priority: data.priority,
      targetAll: data.targetAll,
      clientId: data.clientId,
      targetTiers: data.targetTiers ? JSON.stringify(data.targetTiers) : undefined,
      imageUrl: data.imageUrl,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      publishAt: data.publishAt ?? undefined,
      expiresAt: data.expiresAt,
      isPinned: data.isPinned,
      isActive: updateData.isActive,
    },
  })

  return NextResponse.json({ success: true, announcement })
})

// DELETE /api/admin/announcements - Delete announcement
export const DELETE = withAuth(async (req, { user }) => {
  if (!ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 })
  }

  await prisma.clientAnnouncement.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
})
