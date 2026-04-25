import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const contentSchema = z.object({
  clientId: z.string().min(1),
  blogTopic: z.string().min(1).max(300),
  targetKeyword: z.string().max(200).optional(),
  writerId: z.string().optional(),
  wordCount: z.number().int().min(0).default(0),
  deadline: z.string().optional(),
})

// GET /api/seo/content
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

  const [content, total] = await Promise.all([
    prisma.seoContent.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        writer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.seoContent.count({ where }),
  ])

  return NextResponse.json({ content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/content
export const POST = withAuth(async (req) => {
  const body = await req.json()
  const result = contentSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const content = await prisma.seoContent.create({
    data: {
      ...result.data,
      deadline: result.data.deadline ? new Date(result.data.deadline) : null,
    },
    include: {
      client: { select: { id: true, name: true } },
      writer: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ content })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

const updateContentSchema = z.object({
  id: z.string().min(1),
  blogTopic: z.string().min(1).max(300),
  targetKeyword: z.string().max(200).nullable(),
  writerId: z.string().nullable(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED']),
  wordCount: z.number().int().min(0),
  publishedUrl: z.string().max(500).nullable(),
  deadline: z.string().nullable(),
}).partial().required({ id: true })

// PUT /api/seo/content
export const PUT = withAuth(async (req) => {
  const body = await req.json()
  const result = updateContentSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const { id, ...updates } = result.data

  const data: Record<string, unknown> = {}
  if (updates.blogTopic !== undefined) data.blogTopic = updates.blogTopic
  if (updates.targetKeyword !== undefined) data.targetKeyword = updates.targetKeyword
  if (updates.writerId !== undefined) data.writerId = updates.writerId
  if (updates.status !== undefined) data.status = updates.status
  if (updates.wordCount !== undefined) data.wordCount = updates.wordCount
  if (updates.publishedUrl !== undefined) data.publishedUrl = updates.publishedUrl
  if (updates.deadline !== undefined) data.deadline = updates.deadline ? new Date(updates.deadline) : null

  const content = await prisma.seoContent.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
      writer: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ content })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/content
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const record = await prisma.seoContent.findUnique({ where: { id } })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'OPERATIONS_HEAD'
  if (!isAdmin && record.writerId !== user.id) {
    return NextResponse.json({ error: 'Not authorized to delete this record' }, { status: 403 })
  }

  await prisma.seoContent.delete({ where: { id } })
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })
