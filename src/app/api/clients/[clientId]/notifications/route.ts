import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'

const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ACTION_REQUIRED']).default('INFO'),
  category: z.enum(['GENERAL', 'BILLING', 'PROJECT', 'APPROVAL', 'SYSTEM']).default('GENERAL'),
  actionUrl: z.string().max(500).optional().nullable(),
  actionLabel: z.string().max(50).optional().nullable(),
  expiresAt: z.string().transform((s) => new Date(s)).optional().nullable(),
})

// GET /api/clients/[clientId]/notifications - List notifications for client
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
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

  const notifications = await prisma.portalNotification.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ notifications })
})

// POST /api/clients/[clientId]/notifications - Send notification to client
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
  const validation = notificationSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  // Rate limiting: max 10 notifications per client per minute
  const recentCount = await prisma.portalNotification.count({
    where: { clientId, createdAt: { gte: new Date(Date.now() - 60000) } },
  })
  if (recentCount > 10) {
    return NextResponse.json({ error: 'Too many notifications. Please try again later.' }, { status: 429 })
  }

  const notification = await prisma.portalNotification.create({
    data: {
      clientId,
      title: data.title,
      message: data.message,
      type: data.type,
      category: data.category,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      expiresAt: data.expiresAt,
      sourceType: 'USER',
      sourceId: user.id,
    },
  })

  return NextResponse.json({ success: true, notification })
})

// DELETE /api/clients/[clientId]/notifications - Delete notification
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
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
  }

  const existing = await prisma.portalNotification.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
  }

  await prisma.portalNotification.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
})
