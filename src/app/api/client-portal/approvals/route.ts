import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Log activity
async function logActivity(clientUserId: string, action: string, resource?: string, resourceType?: string, details?: object) {
  await prisma.clientUserActivity.create({
    data: {
      clientUserId,
      action,
      resource,
      resourceType,
      details: details ? JSON.stringify(details) : null,
    },
  })
}

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'REVISION_REQUESTED']),
  reviewNote: z.string().max(1000).optional(),
})

// GET /api/client-portal/approvals - Get pending approvals for client
export const GET = withClientAuth(async (req: NextRequest, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const status = searchParams.get('status') || 'PENDING'
  const type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  const where: Record<string, unknown> = {
    clientId: user.clientId,
  }

  if (status !== 'ALL') {
    where.status = status
  }

  if (type) {
    where.type = type
  }

  const [approvals, pendingCount, totalCount, types] = await Promise.all([
    prisma.contentApproval.findMany({
      where,
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
      include: {
        reviewedBy: { select: { name: true } },
      },
    }),
    prisma.contentApproval.count({
      where: { clientId: user.clientId, status: 'PENDING' },
    }),
    prisma.contentApproval.count({ where }),
    prisma.contentApproval.groupBy({
      by: ['type'],
      where: { clientId: user.clientId },
      _count: { type: true },
    }),
  ])

  return NextResponse.json({
    approvals: approvals.map((a) => ({
      ...a,
      attachments: a.attachments ? JSON.parse(a.attachments) : [],
      revisionNotes: a.revisionNotes ? JSON.parse(a.revisionNotes) : [],
      isOverdue: a.dueDate && new Date(a.dueDate) < new Date() && a.status === 'PENDING',
    })),
    pendingCount,
    totalCount,
    hasMore: offset + limit < totalCount,
    types: types.map((t) => ({ type: t.type, count: t._count.type })),
  })
}, { rateLimit: 'READ' })

// PUT /api/client-portal/approvals - Submit approval decision (PRIMARY/SECONDARY only)
export const PUT = withClientAuth(async (req: NextRequest, { user }) => {
  if (user.role !== 'PRIMARY' && user.role !== 'SECONDARY') {
    return NextResponse.json({ error: 'Only PRIMARY and SECONDARY users can submit approvals' }, { status: 403 })
  }

  const body = await req.json()
  const { approvalId, ...reviewData } = body

  if (!approvalId) {
    return NextResponse.json({ error: 'Approval ID required' }, { status: 400 })
  }

  const validation = reviewSchema.safeParse(reviewData)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const { status, reviewNote } = validation.data

  // Find the approval
  const approval = await prisma.contentApproval.findFirst({
    where: {
      id: approvalId,
      clientId: user.clientId,
      status: 'PENDING',
    },
  })

  if (!approval) {
    return NextResponse.json({ error: 'Approval not found or already processed' }, { status: 404 })
  }

  // Parse existing revision notes
  let revisionNotes: { date: string; note: string; status: string }[] = []
  if (approval.revisionNotes) {
    try {
      revisionNotes = JSON.parse(approval.revisionNotes)
    } catch {
      revisionNotes = []
    }
  }

  // Add new note if revision requested
  if (status === 'REVISION_REQUESTED' && reviewNote) {
    revisionNotes.push({
      date: new Date().toISOString(),
      note: reviewNote,
      status: 'REVISION_REQUESTED',
    })
  }

  // Update approval
  const updated = await prisma.contentApproval.update({
    where: { id: approvalId },
    data: {
      status,
      reviewedById: user.id,
      reviewedAt: new Date(),
      reviewNote,
      revisionCount: status === 'REVISION_REQUESTED' ? { increment: 1 } : undefined,
      revisionNotes: revisionNotes.length > 0 ? JSON.stringify(revisionNotes) : null,
    },
  })

  // Log activity
  await logActivity(user.id, `APPROVAL_${status}`, `approval:${approvalId}`, 'APPROVAL', {
    title: approval.title,
    type: approval.type,
    status,
  })

  // Create notification for staff (would need staff notification system)
  console.error(`[APPROVAL_${status}] ApprovalId: ${approvalId}, Title: ${approval.title}, ReviewedBy: ${user.name}`)

  return NextResponse.json({ success: true, approval: updated })
}, { rateLimit: 'WRITE' })
