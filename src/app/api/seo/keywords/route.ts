import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const keywordSchema = z.object({
  clientId: z.string().min(1),
  keyword: z.string().min(1).max(200),
  location: z.string().default('India'),
  searchVolume: z.number().int().min(0).default(0),
  currentRank: z.number().int().min(0).nullable().optional(),
  targetPage: z.string().max(500).optional(),
})

// GET /api/seo/keywords
export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const allowedSortFields = ['keyword', 'currentRank', 'searchVolume', 'difficulty', 'createdAt']
  const sort = allowedSortFields.includes(searchParams.get('sort') || '') ? searchParams.get('sort')! : 'keyword'
  const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc'

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }
  if (clientId) where.clientId = clientId

  const [keywords, total] = await Promise.all([
    prisma.seoKeyword.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { [sort]: order },
      skip,
      take: limit,
    }),
    prisma.seoKeyword.count({ where }),
  ])

  return NextResponse.json({ keywords, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/keywords
export const POST = withAuth(async (req) => {
  const body = await req.json()
  const result = keywordSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const keyword = await prisma.seoKeyword.create({
    data: {
      ...result.data,
      currentRank: result.data.currentRank ?? null,
    },
    include: { client: { select: { id: true, name: true } } },
  })

  // If rank provided, create initial history entry
  if (result.data.currentRank) {
    await prisma.seoRankHistory.create({
      data: { keywordId: keyword.id, rank: result.data.currentRank },
    })
  }

  return NextResponse.json({ keyword })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

const updateKeywordSchema = z.object({
  id: z.string().min(1),
  keyword: z.string().min(1).max(200),
  location: z.string(),
  searchVolume: z.number().int().min(0),
  currentRank: z.number().int().min(0).nullable(),
  targetPage: z.string().max(500).nullable(),
}).partial().required({ id: true })

// PUT /api/seo/keywords - Update keyword (including rank update)
export const PUT = withAuth(async (req) => {
  const body = await req.json()
  const result = updateKeywordSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const { id, ...updates } = result.data

  const existing = await prisma.seoKeyword.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (updates.keyword !== undefined) data.keyword = updates.keyword
  if (updates.location !== undefined) data.location = updates.location
  if (updates.searchVolume !== undefined) data.searchVolume = updates.searchVolume
  if (updates.targetPage !== undefined) data.targetPage = updates.targetPage

  // Handle rank update — store previous rank and log history (atomic transaction)
  if (updates.currentRank !== undefined && updates.currentRank !== existing.currentRank) {
    data.previousRank = existing.currentRank
    data.currentRank = updates.currentRank

    if (updates.currentRank !== null) {
      const [, updatedKeyword] = await prisma.$transaction([
        prisma.seoRankHistory.create({
          data: { keywordId: id, rank: updates.currentRank },
        }),
        prisma.seoKeyword.update({
          where: { id },
          data,
          include: { client: { select: { id: true, name: true } } },
        }),
      ])
      return NextResponse.json({ keyword: updatedKeyword })
    }
  }

  const keyword = await prisma.seoKeyword.update({
    where: { id },
    data,
    include: { client: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ keyword })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/keywords - Soft delete (deactivate)
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const record = await prisma.seoKeyword.findUnique({ where: { id } })
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

  await prisma.$transaction([
    prisma.seoRankHistory.deleteMany({ where: { keywordId: id } }),
    prisma.seoKeyword.update({ where: { id }, data: { isActive: false } }),
  ])
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })
