import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'

const GOAL_ACCESS_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']

const goalSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  category: z.enum(['MARKETING', 'LEADS', 'REVENUE', 'TRAFFIC', 'ENGAGEMENT', 'CUSTOM']).default('MARKETING'),
  metricType: z.string().min(1).max(50),
  targetValue: z.number().positive('Target value must be a positive number'),
  currentValue: z.number().min(0).default(0),
  unit: z.string().max(20).optional().nullable(),
  periodType: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']).default('MONTHLY'),
  startDate: z.string().refine((s) => !isNaN(Date.parse(s)), { message: 'Invalid start date' }).transform((s) => new Date(s)),
  endDate: z.string().refine((s) => !isNaN(Date.parse(s)), { message: 'Invalid end date' }).transform((s) => new Date(s)),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
  color: z.string().max(20).optional().nullable(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

// GET /api/clients/[clientId]/goals - List goals
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const goals = await prisma.clientGoal.findMany({
    where: { clientId },
    orderBy: [{ displayOrder: 'asc' }, { endDate: 'asc' }],
    take: 100,
  })

  return NextResponse.json({ goals })
})

// POST /api/clients/[clientId]/goals - Create goal
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  const canManage = GOAL_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManage) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const body = await req.json()
  const validation = goalSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  const goal = await prisma.clientGoal.create({
    data: {
      clientId,
      ...data,
    },
  })

  // Create notification for client
  await prisma.portalNotification.create({
    data: {
      clientId,
      title: 'New Goal Set',
      message: `A new goal "${data.name}" has been set with a target of ${data.targetValue} ${data.unit || ''}.`,
      type: 'INFO',
      category: 'GENERAL',
      actionUrl: '/portal/goals',
      actionLabel: 'View Goals',
      sourceType: 'USER',
      sourceId: user.id,
    },
  })

  return NextResponse.json({ success: true, goal })
})

// PUT /api/clients/[clientId]/goals - Update goal
export const PUT = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  const canManage = GOAL_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManage) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...updateData } = body

  if (!id) {
    return NextResponse.json({ error: 'Goal ID required' }, { status: 400 })
  }

  const existing = await prisma.clientGoal.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  const validation = goalSchema.partial().safeParse(updateData)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  // Check if goal should be marked as completed
  let status = existing.status
  const effectiveCurrentValue = data.currentValue ?? existing.currentValue
  const effectiveTargetValue = data.targetValue ?? existing.targetValue
  if (effectiveCurrentValue != null && effectiveTargetValue != null && effectiveCurrentValue >= effectiveTargetValue) {
    status = 'COMPLETED'
  }

  const goal = await prisma.clientGoal.update({
    where: { id },
    data: {
      ...data,
      status,
      achievedAt: status === 'COMPLETED' && existing.status !== 'COMPLETED' ? new Date() : undefined,
    },
  })

  return NextResponse.json({ success: true, goal })
})

// DELETE /api/clients/[clientId]/goals - Delete goal
export const DELETE = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  const canManage = GOAL_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManage) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Goal ID required' }, { status: 400 })
  }

  const existing = await prisma.clientGoal.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  await prisma.clientGoal.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
})
