import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createSchema = z.object({
  clientId: z.string().min(1),
  deliverable: z.string().min(1).max(200),
  deliverableType: z.string().default('Content Draft'),
  reviewerName: z.string().optional(),
  dueDate: z.string().optional(),
})

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['PENDING', 'APPROVED', 'CHANGES_REQUESTED']).optional(),
  feedback: z.string().optional(),
})

// GET /api/seo/client-approvals
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

  const [approvals, total] = await Promise.all([
    prisma.clientApproval.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        submittedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.clientApproval.count({ where }),
  ])

  const formattedApprovals = approvals.map(a => ({
    id: a.id,
    client: a.client.name,
    clientId: a.clientId,
    deliverable: a.deliverable,
    deliverableType: a.deliverableType,
    submittedDate: a.submittedAt.toISOString().split('T')[0],
    reviewer: a.reviewerName || '-',
    status: a.status,
    feedback: a.feedback,
    dueDate: a.dueDate ? a.dueDate.toISOString().split('T')[0] : null,
    submittedBy: a.submittedBy ? `${a.submittedBy.firstName} ${a.submittedBy.lastName}` : '-',
  }))

  return NextResponse.json({
    approvals: formattedApprovals,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/client-approvals
export const POST = withAuth(async (req) => {
  const body = await req.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const approval = await prisma.clientApproval.create({
    data: {
      clientId: result.data.clientId,
      deliverable: result.data.deliverable,
      deliverableType: result.data.deliverableType,
      reviewerName: result.data.reviewerName,
      submittedById: body.submittedById,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
    },
    include: {
      client: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ approval })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// PUT /api/seo/client-approvals
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
    if (updates.status === 'APPROVED') {
      data.completedAt = new Date()
    }
  }
  if (updates.feedback !== undefined) data.feedback = updates.feedback

  const approval = await prisma.clientApproval.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ approval })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/client-approvals
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'OPERATIONS_HEAD'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  await prisma.clientApproval.delete({ where: { id } })
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'] })