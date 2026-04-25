import { NextResponse } from 'next/server'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'

const approvalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['CONTENT', 'CREATIVE', 'AD', 'CAMPAIGN', 'REPORT', 'OTHER']).default('CONTENT'),
  contentUrl: z.string().url().optional().nullable(),
  previewUrl: z.string().url().optional().nullable(),
  attachments: z.array(z.string().url()).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  dueDate: z.string().transform((s) => new Date(s)).optional().nullable(),
})

// GET /api/clients/[clientId]/approvals - List approvals
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const status = searchParams.get('status')

  const approvals = await prisma.contentApproval.findMany({
    where: {
      clientId,
      ...(status ? { status } : {}),
    },
    orderBy: [
      { status: 'asc' },
      { priority: 'asc' },
      { dueDate: 'asc' },
    ],
    take: 100,
    include: {
      reviewedBy: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json({
    approvals: approvals.map((a) => ({
      ...a,
      attachments: (() => { let attachments: string[] = []; try { attachments = JSON.parse(a.attachments || '[]') } catch { attachments = [] } return attachments })(),
      revisionNotes: a.revisionNotes ? JSON.parse(a.revisionNotes) : [],
    })),
  })
})

// POST /api/clients/[clientId]/approvals - Create approval request
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await req.json()
  const validation = approvalSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  const approval = await prisma.contentApproval.create({
    data: {
      clientId,
      title: data.title,
      description: data.description,
      type: data.type,
      contentUrl: data.contentUrl,
      previewUrl: data.previewUrl,
      attachments: data.attachments ? JSON.stringify(data.attachments) : null,
      priority: data.priority,
      dueDate: data.dueDate,
      createdById: user.id,
    },
  })

  // Create notification for client
  await prisma.portalNotification.create({
    data: {
      clientId,
      title: 'New Approval Request',
      message: `"${data.title}" requires your approval.${data.dueDate ? ` Due by ${formatDateDDMMYYYY(data.dueDate)}.` : ''}`,
      type: 'ACTION_REQUIRED',
      category: 'APPROVAL',
      actionUrl: '/portal/approvals',
      actionLabel: 'Review Now',
      sourceType: 'USER',
      sourceId: user.id,
    },
  })

  return NextResponse.json({ success: true, approval })
})

// PUT /api/clients/[clientId]/approvals - Update approval (e.g., cancel, resubmit)
export const PUT = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await req.json()
  const { id, action, ...updateData } = body

  if (!id) {
    return NextResponse.json({ error: 'Approval ID required' }, { status: 400 })
  }

  const existing = await prisma.contentApproval.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
  }

  if (action === 'cancel') {
    await prisma.contentApproval.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
    return NextResponse.json({ success: true, message: 'Approval cancelled' })
  }

  if (action === 'resubmit') {
    // Reset for re-approval
    await prisma.contentApproval.update({
      where: { id },
      data: {
        status: 'PENDING',
        reviewedById: null,
        reviewedAt: null,
        reviewNote: null,
        reminderSent: false,
        ...updateData,
      },
    })

    // Notify client
    await prisma.portalNotification.create({
      data: {
        clientId,
        title: 'Approval Resubmitted',
        message: `"${existing.title}" has been updated and resubmitted for approval.`,
        type: 'ACTION_REQUIRED',
        category: 'APPROVAL',
        actionUrl: '/portal/approvals',
        actionLabel: 'Review Now',
        sourceType: 'USER',
        sourceId: user.id,
      },
    })

    return NextResponse.json({ success: true, message: 'Approval resubmitted' })
  }

  // Generic update
  const validation = approvalSchema.partial().safeParse(updateData)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  const approval = await prisma.contentApproval.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      contentUrl: data.contentUrl,
      previewUrl: data.previewUrl,
      attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
      priority: data.priority,
      dueDate: data.dueDate,
    },
  })

  return NextResponse.json({ success: true, approval })
})

// DELETE /api/clients/[clientId]/approvals - Delete approval
export const DELETE = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Approval ID required' }, { status: 400 })
  }

  const existing = await prisma.contentApproval.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
  }

  await prisma.contentApproval.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
})
