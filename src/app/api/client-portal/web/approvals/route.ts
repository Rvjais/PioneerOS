import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

/**
 * GET /api/client-portal/web/approvals
 * Get pending design approvals for the client
 */
export const GET = withClientAuth(async (request, { user }) => {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status') || 'PENDING'

  const approvals = await prisma.webDesignApproval.findMany({
    where: {
      clientId: user.clientId,
      ...(status !== 'all' ? { status } : {}),
    },
    include: {
      project: {
        select: { id: true, projectName: true, currentPhase: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(approvals)
}, { requireWebAccess: true, rateLimit: 'READ' })

/**
 * PATCH /api/client-portal/web/approvals
 * Approve or request changes on a design
 */
export const PATCH = withClientAuth(async (request, { user }) => {
  const body = await request.json()
  const { id, action, feedback, comments } = body

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing required fields: id, action' }, { status: 400 })
  }

  if (!['approve', 'request_changes'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Verify approval belongs to client
  const existingApproval = await prisma.webDesignApproval.findFirst({
    where: {
      id,
      clientId: user.clientId,
    },
  })

  if (!existingApproval) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
  }

  if (existingApproval.status !== 'PENDING') {
    return NextResponse.json({ error: 'Approval is not pending' }, { status: 400 })
  }

  // If requesting changes, feedback is required
  if (action === 'request_changes' && !feedback) {
    return NextResponse.json(
      { error: 'Feedback is required when requesting changes' },
      { status: 400 }
    )
  }

  const approval = await prisma.webDesignApproval.update({
    where: { id },
    data: {
      status: action === 'approve' ? 'APPROVED' : 'CHANGES_REQUESTED',
      approvedById: user.id,
      approvedAt: action === 'approve' ? new Date() : null,
      clientFeedback: feedback || null,
      // Store comments if provided (could be pin comments on design)
      ...(comments ? { clientComments: JSON.stringify(comments) } : {}),
    },
    include: {
      project: {
        select: { id: true, projectName: true },
      },
    },
  })

  return NextResponse.json(approval)
}, { requireWebAccess: true, rateLimit: 'WRITE' })
