import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const profileSchema = z.object({
  clientId: z.string().min(1),
  profileName: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  category: z.string().max(100).default('Business'),
})

const postSchema = z.object({
  profileId: z.string().min(1),
  postType: z.enum(['UPDATE', 'OFFER', 'EVENT', 'PRODUCT']).default('UPDATE'),
  content: z.string().min(1).max(2000),
  proofLink: z.string().max(500).optional(),
})

const metricSchema = z.object({
  profileId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  calls: z.number().int().min(0).default(0),
  directions: z.number().int().min(0).default(0),
  profileViews: z.number().int().min(0).default(0),
  websiteClicks: z.number().int().min(0).default(0),
  monthlyPosts: z.number().int().min(0).default(0),
})

// GET /api/seo/gbp
export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const profileId = searchParams.get('profileId')

  // Single profile with posts and metrics
  if (profileId) {
    const profile = await prisma.gbpProfile.findUnique({
      where: { id: profileId },
      include: {
        client: { select: { id: true, name: true } },
        posts: { orderBy: { publishedAt: 'desc' }, take: 10 },
        metrics: { orderBy: { month: 'desc' }, take: 6 },
      },
    })
    return NextResponse.json({ profile })
  }

  // All profiles
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (clientId) where.clientId = clientId

  const [profiles, total] = await Promise.all([
    prisma.gbpProfile.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        metrics: { orderBy: { month: 'desc' }, take: 1 },
        _count: { select: { posts: true } },
      },
      orderBy: { profileName: 'asc' },
      skip,
      take: limit,
    }),
    prisma.gbpProfile.count({ where }),
  ])

  // Flatten latest metrics into profile for easy display
  const profilesWithMetrics = profiles.map((p) => {
    const latest = p.metrics[0]
    return {
      ...p,
      calls: latest?.calls || 0,
      directions: latest?.directions || 0,
      profileViews: latest?.profileViews || 0,
      websiteClicks: latest?.websiteClicks || 0,
      monthlyPosts: latest?.monthlyPosts || 0,
      totalPosts: p._count.posts,
    }
  })

  return NextResponse.json({ profiles: profilesWithMetrics, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/gbp - Create profile, post, or update metrics
export const POST = withAuth(async (req) => {
  const body = await req.json()
  const action = body.action || 'profile'

  if (action === 'post') {
    const result = postSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
    const post = await prisma.gbpPost.create({ data: result.data })
    return NextResponse.json({ post })
  }

  if (action === 'metric') {
    const result = metricSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
    const metric = await prisma.gbpMetric.upsert({
      where: { profileId_month: { profileId: result.data.profileId, month: result.data.month } },
      update: result.data,
      create: result.data,
    })
    return NextResponse.json({ metric })
  }

  // Default: create profile
  const result = profileSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  const profile = await prisma.gbpProfile.create({
    data: result.data,
    include: { client: { select: { id: true, name: true } } },
  })
  return NextResponse.json({ profile })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

const updateProfileSchema = z.object({
  id: z.string().min(1),
  profileName: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  category: z.string().max(100),
  totalReviews: z.number().int().min(0),
  rating: z.number().min(0).max(5),
  status: z.enum(['ACTIVE', 'NEEDS_ATTENTION', 'OPTIMIZING']),
}).partial().required({ id: true })

// PUT /api/seo/gbp - Update profile
export const PUT = withAuth(async (req) => {
  const body = await req.json()
  const result = updateProfileSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const { id, ...updates } = result.data

  const data: Record<string, unknown> = {}
  if (updates.profileName !== undefined) data.profileName = updates.profileName
  if (updates.location !== undefined) data.location = updates.location
  if (updates.category !== undefined) data.category = updates.category
  if (updates.totalReviews !== undefined) data.totalReviews = updates.totalReviews
  if (updates.rating !== undefined) data.rating = updates.rating
  if (updates.status !== undefined) data.status = updates.status

  const profile = await prisma.gbpProfile.update({
    where: { id },
    data,
    include: { client: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ profile })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/gbp
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const record = await prisma.gbpProfile.findUnique({ where: { id } })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'OPERATIONS_HEAD'
  if (!isAdmin) {
    const assignment = await prisma.clientTeamMember.findUnique({
      where: { clientId_userId: { clientId: record.clientId, userId: user.id } },
    })
    if (!assignment) {
      return NextResponse.json({ error: 'Not authorized to delete this record' }, { status: 403 })
    }
  }

  await prisma.gbpProfile.delete({ where: { id } })
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })
