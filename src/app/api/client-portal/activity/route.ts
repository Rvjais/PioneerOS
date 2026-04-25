import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'

const logActivitySchema = z.object({
  action: z.string().min(1, 'Action is required').max(100),
  resource: z.string().max(500).optional().nullable(),
  resourceType: z.string().max(100).optional().nullable(),
  details: z.record(z.string(), z.unknown()).optional().nullable(),
})

// GET /api/client-portal/activity - Get activity logs (PRIMARY can see all, others see own)
export const GET = withClientAuth(async (req: NextRequest, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const action = searchParams.get('action')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50') || 50, 100)
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0') || 0)

  // Build query
  const where: Record<string, unknown> = {}

  // PRIMARY users can see all activities for their client
  if (user.role === 'PRIMARY') {
    // Get all users for this client
    const clientUsers = await prisma.clientUser.findMany({
      where: { clientId: user.clientId },
      select: { id: true },
    })
    where.clientUserId = { in: clientUsers.map((u) => u.id) }

    if (userId) {
      // Validate userId belongs to this client before filtering
      const isValidUser = clientUsers.some((u) => u.id === userId)
      if (!isValidUser) {
        return NextResponse.json({ error: 'Invalid userId - user does not belong to your client' }, { status: 403 })
      }
      where.clientUserId = userId
    }
  } else {
    // Others can only see their own activity
    where.clientUserId = user.id
  }

  if (action) {
    where.action = action
  }

  const [activities, totalCount] = await Promise.all([
    prisma.clientUserActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        clientUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
    prisma.clientUserActivity.count({ where }),
  ])

  // Get unique actions for filtering
  const actionTypes = await prisma.clientUserActivity.groupBy({
    by: ['action'],
    where: user.role === 'PRIMARY'
      ? { clientUser: { clientId: user.clientId } }
      : { clientUserId: user.id },
  })

  return NextResponse.json({
    activities: activities.map((a) => ({
      ...a,
      details: safeJsonParse(a.details, null),
    })),
    totalCount,
    hasMore: offset + limit < totalCount,
    actionTypes: actionTypes.map((a) => a.action),
  })
}, { rateLimit: 'READ' })

// POST /api/client-portal/activity - Log an activity (internal use)
export const POST = withClientAuth(async (req: NextRequest, { user }) => {
  const body = await req.json()
  const parsed = logActivitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { action, resource, resourceType, details } = parsed.data

  const activity = await prisma.clientUserActivity.create({
    data: {
      clientUserId: user.id,
      action,
      resource,
      resourceType,
      details: details ? JSON.stringify(details) : null,
    },
  })

  return NextResponse.json({ success: true, activity })
}, { rateLimit: 'WRITE' })
