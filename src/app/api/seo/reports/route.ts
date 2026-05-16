import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1).max(200),
  reportType: z.string().default('Monthly SEO Report'),
  period: z.string().optional(),
})

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  reportType: z.string().optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED']).optional(),
  period: z.string().optional(),
  metrics: z.object({
    organicTraffic: z.number().optional(),
    keywordRankings: z.number().optional(),
    backlinksBuilt: z.number().optional(),
    contentPublished: z.number().optional(),
    technicalFixes: z.number().optional(),
  }).optional(),
})

// GET /api/seo/reports
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

  const [reports, total] = await Promise.all([
    prisma.seoReport.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.seoReport.count({ where }),
  ])

  const formattedReports = reports.map(r => ({
    id: r.id,
    title: r.title,
    client: r.client.name,
    clientId: r.clientId,
    reportType: r.reportType,
    period: r.period || null,
    status: r.status,
    metrics: r.metrics as any || null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    publishedAt: r.publishedAt?.toISOString() || null,
  }))

  return NextResponse.json({
    reports: formattedReports,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/reports
export const POST = withAuth(async (req) => {
  const body = await req.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const report = await prisma.seoReport.create({
    data: {
      clientId: result.data.clientId,
      title: result.data.title,
      reportType: result.data.reportType,
      period: result.data.period,
      status: 'DRAFT',
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ report })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// PUT /api/seo/reports
export const PUT = withAuth(async (req) => {
  const body = await req.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const { id, ...updates } = result.data
  const data: Record<string, unknown> = {}

  if (updates.title !== undefined) data.title = updates.title
  if (updates.reportType !== undefined) data.reportType = updates.reportType
  if (updates.period !== undefined) data.period = updates.period
  if (updates.status !== undefined) {
    data.status = updates.status
    if (updates.status === 'PUBLISHED') {
      data.publishedAt = new Date()
    }
  }
  if (updates.metrics !== undefined) data.metrics = updates.metrics

  const report = await prisma.seoReport.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ report })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/reports
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'OPERATIONS_HEAD'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  await prisma.seoReport.delete({ where: { id } })
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'] })