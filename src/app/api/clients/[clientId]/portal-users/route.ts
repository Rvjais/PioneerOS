import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'

// Roles that can manage portal users
const PORTAL_USER_ACCESS_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']

// Validation schema for portal user creation
const createPortalUserSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional().nullable(),
  role: z.enum(['PRIMARY', 'SECONDARY', 'VIEWER']).default('SECONDARY'),
})

// Validation schema for portal user update
const updatePortalUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  role: z.enum(['PRIMARY', 'SECONDARY', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/clients/[clientId]/portal-users - List all portal users for a client
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check if user has access to this client
  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Check if user can view portal users
  const canViewPortalUsers = PORTAL_USER_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canViewPortalUsers) {
    return NextResponse.json({ error: 'You do not have permission to view portal users' }, { status: 403 })
  }

  const portalUsers = await prisma.clientUser.findMany({
    where: { clientId },
    take: 100,
    orderBy: [
      { isActive: 'desc' },
      { role: 'asc' },
      { name: 'asc' },
    ],
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ portalUsers })
})

// POST /api/clients/[clientId]/portal-users - Create a new portal user
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check access
  const access = await checkClientAccess(user, clientId)
  const canManagePortalUsers = PORTAL_USER_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManagePortalUsers) {
    return NextResponse.json({ error: 'You do not have permission to manage portal users' }, { status: 403 })
  }

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Parse and validate body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = createPortalUserSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  // Check if email already exists among active users
  const existingUser = await prisma.clientUser.findFirst({
    where: { email: data.email, isActive: true },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
  }

  const portalUser = await prisma.clientUser.create({
    data: {
      clientId,
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      role: data.role,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  // Log for audit
  console.info(`[PORTAL_USER_CREATED] ClientId: ${clientId}, UserId: ${portalUser.id}, Role: ${data.role}, CreatedBy: ${user.empId}, Timestamp: ${new Date().toISOString()}`)

  return NextResponse.json({ success: true, portalUser })
})

// PUT /api/clients/[clientId]/portal-users - Update a portal user
export const PUT = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check access
  const access = await checkClientAccess(user, clientId)
  const canManagePortalUsers = PORTAL_USER_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManagePortalUsers) {
    return NextResponse.json({ error: 'You do not have permission to manage portal users' }, { status: 403 })
  }

  // Parse body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id, ...updateData } = body as { id?: string } & Record<string, unknown>

  if (!id) {
    return NextResponse.json({ error: 'Portal user ID is required' }, { status: 400 })
  }

  // Verify user belongs to this client
  const existing = await prisma.clientUser.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Portal user not found' }, { status: 404 })
  }

  const validation = updatePortalUserSchema.safeParse(updateData)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  // If changing role away from PRIMARY, ensure there's at least one PRIMARY user left
  if (data.role && data.role !== 'PRIMARY' && existing.role === 'PRIMARY') {
    const primaryCount = await prisma.clientUser.count({
      where: {
        clientId,
        role: 'PRIMARY',
        isActive: true,
        id: { not: id },
      },
    })

    if (primaryCount === 0) {
      return NextResponse.json({
        error: 'Cannot change role. At least one active PRIMARY user is required.'
      }, { status: 400 })
    }
  }

  // If deactivating a PRIMARY user, ensure there's at least one active PRIMARY left
  if (data.isActive === false && existing.role === 'PRIMARY' && existing.isActive) {
    const primaryCount = await prisma.clientUser.count({
      where: {
        clientId,
        role: 'PRIMARY',
        isActive: true,
        id: { not: id },
      },
    })

    if (primaryCount === 0) {
      return NextResponse.json({
        error: 'Cannot deactivate. At least one active PRIMARY user is required.'
      }, { status: 400 })
    }
  }

  const portalUser = await prisma.clientUser.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      phone: data.phone !== undefined ? (data.phone || null) : undefined,
      role: data.role ?? undefined,
      isActive: data.isActive ?? undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  })

  // Log for audit
  console.info(`[PORTAL_USER_UPDATED] ClientId: ${clientId}, UserId: ${id}, UpdatedBy: ${user.empId}, ChangedFields: ${Object.keys(data).join(',')}, Timestamp: ${new Date().toISOString()}`)

  return NextResponse.json({ success: true, portalUser })
})

// DELETE /api/clients/[clientId]/portal-users - Deactivate a portal user
export const DELETE = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check access
  const access = await checkClientAccess(user, clientId)
  const canManagePortalUsers = PORTAL_USER_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManagePortalUsers) {
    return NextResponse.json({ error: 'You do not have permission to manage portal users' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')
  const hardDelete = searchParams.get('hard') === 'true'

  if (!id) {
    return NextResponse.json({ error: 'Portal user ID is required' }, { status: 400 })
  }

  // Verify user belongs to this client
  const existing = await prisma.clientUser.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Portal user not found' }, { status: 404 })
  }

  // If deactivating/deleting a PRIMARY user, ensure there's at least one active PRIMARY left
  if (existing.role === 'PRIMARY' && existing.isActive) {
    const primaryCount = await prisma.clientUser.count({
      where: {
        clientId,
        role: 'PRIMARY',
        isActive: true,
        id: { not: id },
      },
    })

    if (primaryCount === 0) {
      return NextResponse.json({
        error: 'Cannot deactivate. At least one active PRIMARY user is required.'
      }, { status: 400 })
    }
  }

  if (hardDelete && ['SUPER_ADMIN'].includes(user.role)) {
    // Hard delete for super admins
    await prisma.clientUser.delete({
      where: { id },
    })
    console.info(`[PORTAL_USER_HARD_DELETED] ClientId: ${clientId}, UserId: ${id}, DeletedBy: ${user.empId}, Timestamp: ${new Date().toISOString()}`)
  } else {
    // Soft delete by deactivating
    await prisma.clientUser.update({
      where: { id },
      data: {
        isActive: false,
        sessionToken: null, // Clear session to force logout
      },
    })
    console.info(`[PORTAL_USER_DEACTIVATED] ClientId: ${clientId}, UserId: ${id}, DeactivatedBy: ${user.empId}, Timestamp: ${new Date().toISOString()}`)
  }

  return NextResponse.json({ success: true })
})
