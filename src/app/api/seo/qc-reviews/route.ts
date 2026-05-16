import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createSchema = z.object({
  clientId: z.string().min(1),
  taskTitle: z.string().min(1).max(200),
  taskType: z.string().default('Content'),
  priority: z.string().default('MEDIUM'),
  deadline: z.string().optional(),
})

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'RETURNED']).optional(),
  feedback: z.string().optional(),
})

// GET /api/seo/qc-reviews
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

  const [reviews, total] = await Promise.all([
    prisma.qcReview.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        submittedBy: { select: { id: true, firstName: true, lastName: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.qcReview.count({ where }),
  ])

  const formattedReviews = reviews.map(r => ({
    id: r.id,
    task: r.taskTitle,
    taskType: r.taskType,
    client: r.client.name,
    clientId: r.clientId,
    submittedBy: r.submittedBy ? `${r.submittedBy.firstName} ${r.submittedBy.lastName}` : '-',
    submittedById: r.submittedById,
    submittedDate: r.submittedAt.toISOString().split('T')[0],
    reviewer: r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : '-',
    reviewerId: r.reviewerId,
    status: r.status,
    feedback: r.feedback,
    priority: r.priority,
    deadline: r.deadline ? r.deadline.toISOString().split('T')[0] : null,
  }))

  return NextResponse.json({
    reviews: formattedReviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/qc-reviews
export const POST = withAuth(async (req) => {
  const body = await req.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const review = await prisma.qcReview.create({
    data: {
      clientId: result.data.clientId,
      taskTitle: result.data.taskTitle,
      taskType: result.data.taskType,
      priority: result.data.priority,
      submittedById: body.submittedById,
      deadline: result.data.deadline ? new Date(result.data.deadline) : undefined,
    },
    include: {
      client: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ review })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// PUT /api/seo/qc-reviews - Update review status
export const PUT = withAuth(async (req) => {
  const body = await req.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const { id, ...updates } = result.data
  const data: Record<string, unknown> = {}

  if (updates.status) {
    data.status = updates.status
    if (updates.status === 'APPROVED' || updates.status === 'RETURNED') {
      data.reviewedAt = new Date()
    }
  }
  if (updates.feedback !== undefined) data.feedback = updates.feedback

  const review = await prisma.qcReview.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
      reviewer: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ review })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/qc-reviews
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'OPERATIONS_HEAD'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  await prisma.qcReview.delete({ where: { id } })
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'] })