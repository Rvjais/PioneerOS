import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth, AuthenticatedUser } from '@/server/auth/withAuth'
import { checkClientAccess, filterUpdateData, CLIENT_DELETE_ROLES, FINANCIAL_ROLES } from '@/server/services/clientAccess'
import { getLifecycleUpdateData, type LifecycleStage } from '@/server/services/clientStatus'
import { createLifecycleEvent } from '@/server/services/clientLifecycle'
import { isValidTransition } from '@/server/services/clientIntegrity'
import { z } from 'zod'

// Fields that are considered sensitive financial data
const SENSITIVE_FINANCIAL_FIELDS = [
  'monthlyFee',
  'totalContractValue',
  'paymentTerms',
  'billingCycle',
  'invoicePrefix',
  'costOfService',
  'profitMargin',
  'pendingAmount',
  'creditLimit',
]

// Validation schema for client updates
const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brandName: z.string().max(200).optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  gstNumber: z.string().max(20).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  industry: z.string().max(100).optional().nullable(),
  businessType: z.enum(['B2B', 'B2C', 'D2C', 'B2B2C']).optional().nullable(),
  status: z.enum(['ACTIVE', 'LOST', 'ON_HOLD', 'ONBOARDING']).optional(),
  lifecycleStage: z.enum(['LEAD', 'PROSPECT', 'NEGOTIATION', 'WON', 'ONBOARDING', 'ACTIVE', 'AT_RISK', 'CHURNED']).optional(),
  isLost: z.boolean().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  // Admin-only fields
  tier: z.enum(['STARTER', 'STANDARD', 'PREMIUM', 'ENTERPRISE']).optional(),
  monthlyFee: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  accountManagerId: z.string().optional().nullable(),
}).strict()

// Deep circular reference detection: walks up the ancestor chain
// to check if setting parentId would create a cycle
async function hasCircularReference(clientId: string, parentId: string): Promise<boolean> {
  let current = parentId
  const visited = new Set<string>()
  while (current) {
    if (current === clientId) return true
    if (visited.has(current)) return false // already checked, no cycle through this path
    visited.add(current)
    const parent = await prisma.client.findUnique({
      where: { id: current },
      select: { parentClientId: true }
    })
    current = parent?.parentClientId || ''
  }
  return false
}

// GET - Fetch a single client
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      parentClient: {
        select: { id: true, name: true }
      },
      subClients: {
        include: {
          teamMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  department: true,
                  empId: true,
                  role: true,
                  profile: { select: { profilePicture: true } }
                }
              }
            }
          }
        }
      },
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              empId: true,
              role: true,
              profile: { select: { profilePicture: true } }
            }
          }
        }
      },
      _count: {
        select: { tasks: true, meetings: true, dailyTasks: true }
      }
    }
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Payment status fields:
  //   - paymentStatus (authoritative): overall payment standing (PENDING, PAID, OVERDUE)
  //   - invoiceStatus: tracks invoice delivery state (SENT, PENDING, NOT_REQUIRED) — not payment status
  //   - currentPaymentStatus: current-month snapshot (DONE, PENDING, PARTIAL, OVERDUE) — derived/convenience field
  // The authoritative field for payment standing is `paymentStatus`.

  // Remove sensitive financial data for non-authorized users
  if (!access.canSeeFinancials) {
    const filteredClient = { ...client } as Record<string, unknown>
    for (const field of SENSITIVE_FINANCIAL_FIELDS) {
      delete filteredClient[field]
    }
    filteredClient.paymentStatus = 'HIDDEN'
    filteredClient.currentPaymentStatus = 'HIDDEN'
    filteredClient.invoiceStatus = 'HIDDEN'
    return NextResponse.json({ ...filteredClient, _canSeeFinancials: false })
  }

  return NextResponse.json({ ...client, _canSeeFinancials: true })
})

// PUT - Full update (requires admin)
export const PUT = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json({ error: 'You do not have permission to modify this client' }, { status: 403 })
  }

  // Parse and validate body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate against schema
  const validation = updateClientSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors
    }, { status: 400 })
  }

  // Filter out fields user can't update
  const filteredData = filterUpdateData(validation.data as Record<string, unknown>, user)

  // Verify client exists
  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const client = await prisma.client.update({
    where: { id: clientId },
    data: filteredData
  })

  return NextResponse.json(client)
})

// PATCH - Partial update for inline editing
export const PATCH = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json({ error: 'You do not have permission to modify this client' }, { status: 403 })
  }

  // Parse body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate against schema (partial)
  const validation = updateClientSchema.partial().safeParse(body)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors
    }, { status: 400 })
  }

  // Validate account manager exists if being set
  if (validation.data.accountManagerId) {
    const mgr = await prisma.user.findUnique({ where: { id: validation.data.accountManagerId } })
    if (!mgr) {
      return NextResponse.json({ error: 'Account manager not found' }, { status: 400 })
    }
  }

  // Circular reference prevention: if parentClientId is being set,
  // walk up the entire ancestor chain to detect cycles
  if (body.parentClientId) {
    const parentClientId = body.parentClientId as string
    if (parentClientId === clientId) {
      return NextResponse.json({ error: 'A client cannot be its own parent' }, { status: 400 })
    }
    const parentExists = await prisma.client.findUnique({
      where: { id: parentClientId },
      select: { id: true }
    })
    if (!parentExists) {
      return NextResponse.json({ error: 'Parent client not found' }, { status: 400 })
    }
    // Deep cycle detection: walk up the ancestor chain from the proposed parent
    const hasCycle = await hasCircularReference(clientId, parentClientId)
    if (hasCycle) {
      return NextResponse.json({ error: 'Circular reference detected: setting this parent would create a cycle in the client hierarchy' }, { status: 400 })
    }
  }

  // Filter out fields user can't update
  let updateData = filterUpdateData(validation.data as Record<string, unknown>, user)

  // Handle lifecycle-related updates to maintain consistency
  if (body.lifecycleStage) {
    const lifecycleData = getLifecycleUpdateData(body.lifecycleStage as LifecycleStage)
    updateData = { ...updateData, ...lifecycleData }
  }
  // If isLost is being set directly, update lifecycleStage and status
  else if (body.isLost !== undefined) {
    if (body.isLost) {
      updateData.lifecycleStage = 'CHURNED'
      updateData.status = 'LOST'
    } else {
      updateData.lifecycleStage = 'ACTIVE'
      updateData.status = 'ACTIVE'
    }
  }
  // If status is being set directly, sync with lifecycleStage
  else if (body.status) {
    const statusToLifecycle: Record<string, LifecycleStage> = {
      'ACTIVE': 'ACTIVE',
      'LOST': 'CHURNED',
      'ON_HOLD': 'AT_RISK',
      'ONBOARDING': 'ONBOARDING',
    }
    const newLifecycle = statusToLifecycle[body.status as string]
    if (newLifecycle) {
      updateData = { ...updateData, ...getLifecycleUpdateData(newLifecycle) }
    }
  }

  // Verify client exists
  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Validate lifecycle stage transition
  if (updateData.lifecycleStage && existing.lifecycleStage !== updateData.lifecycleStage) {
    if (!isValidTransition(existing.lifecycleStage, updateData.lifecycleStage as string)) {
      return NextResponse.json({
        error: `Invalid lifecycle transition from ${existing.lifecycleStage} to ${updateData.lifecycleStage}`,
      }, { status: 400 })
    }
  }

  // Track lifecycle stage changes for event recording
  const lifecycleChanged = updateData.lifecycleStage && existing.lifecycleStage !== updateData.lifecycleStage

  const client = await prisma.client.update({
    where: { id: clientId },
    data: updateData
  })

  // Record lifecycle event when lifecycleStage changes
  if (lifecycleChanged) {
    await createLifecycleEvent(
      clientId,
      existing.lifecycleStage,
      updateData.lifecycleStage as LifecycleStage,
      user.id,
      'Updated via client PATCH'
    )
  }

  // Notify account manager when status or lifecycleStage changes
  if (updateData.status || updateData.lifecycleStage) {
    try {
      const teamMember = await prisma.clientTeamMember.findFirst({
        where: { clientId, role: 'ACCOUNT_MANAGER' }
      })
      if (teamMember && teamMember.userId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: teamMember.userId,
            type: 'GENERAL',
            title: `Client Status Updated: ${existing.name}`,
            message: `Status changed to ${updateData.status || updateData.lifecycleStage}`,
            link: `/clients/${clientId}`,
          }
        }).catch((err) => console.error('[Clients] Failed to send status notification:', err))
      }
    } catch (err) { console.error('[Clients] Non-blocking notification error:', err) }
  }

  return NextResponse.json(client)
})

// DELETE - Delete a client (admin only)
export const DELETE = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Only admins can delete clients
  if (!CLIENT_DELETE_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Only administrators can delete clients' }, { status: 403 })
  }

  // Verify client exists and check for related records
  const existing = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      _count: {
        select: {
          invoices: true,
          tasks: true,
          paymentCollections: true,
        }
      }
    }
  })

  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Warn if client has related records
  const relatedCount = existing._count.invoices + existing._count.tasks + existing._count.paymentCollections
  if (relatedCount > 0) {
    // Soft delete: mark as lost instead of hard delete when there are related records
    await prisma.client.update({
      where: { id: clientId },
      data: {
        status: 'LOST',
        lifecycleStage: 'CHURNED',
        isLost: true,
        notes: `${existing.notes || ''}\n\n[DEACTIVATED by ${user.empId} on ${new Date().toISOString()}]`.trim(),
      }
    })

    return NextResponse.json({
      success: true,
      softDeleted: true,
      message: `Client deactivated (has ${relatedCount} related records)`
    })
  }

  // Hard delete if no related records
  await prisma.client.delete({
    where: { id: clientId }
  })

  return NextResponse.json({ success: true, softDeleted: false })
}, { roles: CLIENT_DELETE_ROLES })
