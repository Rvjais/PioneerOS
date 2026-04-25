import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { z } from 'zod'

const taskSchema = z.object({
  clientId: z.string().min(1),
  taskType: z.enum(['ON_PAGE', 'OFF_PAGE', 'TECHNICAL', 'CONTENT', 'REPORTING']),
  category: z.string().max(100).optional(),
  description: z.string().min(1).max(1000),
  assignedToId: z.string().optional(),
  reviewerId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  deadline: z.string().optional(),
})

// GET /api/seo/tasks
export const GET = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const status = searchParams.get('status')
  const assignedToId = searchParams.get('assignedToId')
  const priority = searchParams.get('priority')

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (clientId) where.clientId = clientId
  if (status) where.status = status
  if (priority) where.priority = priority

  // RBAC: Filter tasks based on user's role
  const canViewAllTasks = isManagerOrAbove(user)

  if (!canViewAllTasks) {
    // Regular users see only tasks assigned to them
    where.assignedToId = user.id
  } else {
    // Managers/admins can filter by assignee if provided
    if (assignedToId) where.assignedToId = assignedToId
  }

  const [tasks, total] = await Promise.all([
    prisma.seoTask.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ deadline: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.seoTask.count({ where }),
  ])

  // Sort by priority in logical order (CRITICAL > HIGH > MEDIUM > LOW), then by deadline
  const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  tasks.sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 99
    const pb = priorityOrder[b.priority] ?? 99
    if (pa !== pb) return pa - pb
    if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    if (a.deadline) return -1
    if (b.deadline) return 1
    return 0
  })

  return NextResponse.json({ tasks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// POST /api/seo/tasks
export const POST = withAuth(async (req) => {
  const body = await req.json()
  const result = taskSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const task = await prisma.seoTask.create({
    data: {
      ...result.data,
      deadline: result.data.deadline ? new Date(result.data.deadline) : null,
    },
    include: {
      client: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      reviewer: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ task })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

const updateTaskSchema = z.object({
  id: z.string().min(1),
  taskType: z.enum(['ON_PAGE', 'OFF_PAGE', 'TECHNICAL', 'CONTENT', 'REPORTING']),
  category: z.string().max(100).nullable(),
  description: z.string().min(1).max(1000),
  assignedToId: z.string().nullable(),
  reviewerId: z.string().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  deadline: z.string().nullable(),
}).partial().required({ id: true })

// PUT /api/seo/tasks
export const PUT = withAuth(async (req) => {
  const body = await req.json()
  const result = updateTaskSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 })
  }

  const { id, ...updates } = result.data

  const data: Record<string, unknown> = {}
  if (updates.taskType !== undefined) data.taskType = updates.taskType
  if (updates.category !== undefined) data.category = updates.category
  if (updates.description !== undefined) data.description = updates.description
  if (updates.assignedToId !== undefined) data.assignedToId = updates.assignedToId
  if (updates.reviewerId !== undefined) data.reviewerId = updates.reviewerId
  if (updates.priority !== undefined) data.priority = updates.priority
  if (updates.status !== undefined) {
    data.status = updates.status
    if (updates.status === 'DONE') data.completedAt = new Date()
    else data.completedAt = null  // Clear when moving back from DONE
  }
  if (updates.deadline !== undefined) data.deadline = updates.deadline ? new Date(updates.deadline) : null

  const task = await prisma.seoTask.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      reviewer: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json({ task })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })

// DELETE /api/seo/tasks
export const DELETE = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const record = await prisma.seoTask.findUnique({ where: { id } })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'MANAGER' || user.role === 'OPERATIONS_HEAD'
  if (!isAdmin && record.assignedToId !== user.id) {
    return NextResponse.json({ error: 'Not authorized to delete this record' }, { status: 403 })
  }

  await prisma.seoTask.delete({ where: { id } })
  return NextResponse.json({ success: true })
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE'] })
