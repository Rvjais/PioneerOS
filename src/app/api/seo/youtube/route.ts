import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createSchema = z.object({
  clientId: z.string().min(1),
  videoTitle: z.string().min(1).max(200),
  videoUrl: z.string().max(500).optional(),
  channelName: z.string().max(100).optional(),
  priority: z.string().default('MEDIUM'),
})

const updateSchema = z.object({
  id: z.string().min(1),
  videoTitle: z.string().min(1).max(200).optional(),
  videoUrl: z.string().max(500).optional(),
  channelName: z.string().max(100).optional(),
  views: z.number().int().min(0).optional(),
  likes: z.number().int().min(0).optional(),
  comments: z.number().int().min(0).optional(),
  subscribers: z.number().int().min(0).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'PUBLISHED']).optional(),
  priority: z.string().optional(),
})

// GET /api/seo/youtube
export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const status = searchParams.get('status')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (clientId) where.clientId = clientId
  if (status) where.status = status

  const [videos, total] = await Promise.all([
    prisma.youTubeVideo.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.youTubeVideo.count({ where }),
  ])

  const formattedVideos = videos.map(v => ({
    id: v.id,
    title: v.videoTitle,
    client: v.client.name,
    clientId: v.clientId,
    videoUrl: v.videoUrl,
    thumbnailUrl: v.thumbnailUrl,
    channelName: v.channelName,
    views: v.views,
    likes: v.likes,
    comments: v.comments,
    subscribers: v.subscribers,
    duration: v.duration,
    publishedAt: v.publishedAt?.toISOString().split('T')[0] || null,
    status: v.status,
    priority: v.priority,
    assignedTo: v.assignedTo ? `${v.assignedTo.firstName} ${v.assignedTo.lastName}` : '-',
    assignedToId: v.assignedToId,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }))

  return NextResponse.json({
    videos: formattedVideos,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/youtube
export const POST = withAuth(async (req) => {
  const body = await req.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const video = await prisma.youTubeVideo.create({
    data: {
      clientId: result.data.clientId,
      videoTitle: result.data.videoTitle,
      videoUrl: result.data.videoUrl,
      channelName: result.data.channelName,
      priority: result.data.priority,
      assignedToId: body.assignedToId,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ video })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// PUT /api/seo/youtube - Update video
export const PUT = withAuth(async (req) => {
  const body = await req.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const { id, ...updates } = result.data
  const data: Record<string, unknown> = {}

  if (updates.videoTitle !== undefined) data.videoTitle = updates.videoTitle
  if (updates.videoUrl !== undefined) data.videoUrl = updates.videoUrl
  if (updates.channelName !== undefined) data.channelName = updates.channelName
  if (updates.views !== undefined) data.views = updates.views
  if (updates.likes !== undefined) data.likes = updates.likes
  if (updates.comments !== undefined) data.comments = updates.comments
  if (updates.subscribers !== undefined) data.subscribers = updates.subscribers
  if (updates.status !== undefined) {
    data.status = updates.status
    if (updates.status === 'PUBLISHED') {
      data.publishedAt = new Date()
    }
  }
  if (updates.priority !== undefined) data.priority = updates.priority

  const video = await prisma.youTubeVideo.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ video })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/youtube
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'OPERATIONS_HEAD'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  await prisma.youTubeVideo.delete({ where: { id } })
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'] })