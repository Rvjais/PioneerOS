import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const backlinkSchema = z.object({
  clientId: z.string().min(1),
  targetUrl: z.string().min(1).max(500),
  anchorText: z.string().min(1).max(200),
  backlinkSource: z.string().min(1).max(500),
  domainAuthority: z.number().int().min(0).max(100).default(0),
  liveUrl: z.string().max(500).optional(),
})

// GET /api/seo/backlinks
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

  const [backlinks, total] = await Promise.all([
    prisma.seoBacklink.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.seoBacklink.count({ where }),
  ])

  return NextResponse.json({ backlinks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/backlinks
export const POST = withAuth(async (req, { user }) => {
  const body = await req.json()
  const result = backlinkSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const backlink = await prisma.seoBacklink.create({
    data: {
      ...result.data,
      createdById: user.id,
    },
    include: {
      client: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ backlink })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

const updateBacklinkSchema = z.object({
  id: z.string().min(1),
  targetUrl: z.string().min(1).max(500),
  anchorText: z.string().min(1).max(200),
  backlinkSource: z.string().min(1).max(500),
  domainAuthority: z.number().int().min(0).max(100),
  status: z.enum(['SUBMITTED', 'LIVE', 'REJECTED']),
  liveUrl: z.string().max(500).nullable(),
}).partial().required({ id: true })

// PUT /api/seo/backlinks
export const PUT = withAuth(async (req) => {
  const body = await req.json()
  const result = updateBacklinkSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const { id, ...updates } = result.data

  const data: Record<string, unknown> = {}
  if (updates.targetUrl !== undefined) data.targetUrl = updates.targetUrl
  if (updates.anchorText !== undefined) data.anchorText = updates.anchorText
  if (updates.backlinkSource !== undefined) data.backlinkSource = updates.backlinkSource
  if (updates.domainAuthority !== undefined) data.domainAuthority = updates.domainAuthority
  if (updates.status !== undefined) data.status = updates.status
  if (updates.liveUrl !== undefined) data.liveUrl = updates.liveUrl

  const backlink = await prisma.seoBacklink.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ backlink })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/backlinks
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const record = await prisma.seoBacklink.findUnique({ where: { id } })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'OPERATIONS_HEAD'
  if (!isAdmin && record.createdById !== user.id) {
    return NextResponse.json({ error: 'Not authorized to delete this record' }, { status: 403 })
  }

  await prisma.seoBacklink.delete({ where: { id } })
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })
