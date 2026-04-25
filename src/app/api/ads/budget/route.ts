import { NextRequest, NextResponse } from 'next/server'
import { withAuth, isManagerOrAbove } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Helper: get client IDs the user is assigned to
async function getAssignedClientIds(userId: string): Promise<string[]> {
  const assignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true },
  })
  return assignments.map((a) => a.clientId)
}

const createBudgetSchema = z.object({
  clientId: z.string().min(1),
  month: z.string().datetime(), // First day of month
  platform: z.enum(['GOOGLE', 'META', 'LINKEDIN', 'ALL']),
  allocatedAmount: z.number().positive(),
  currency: z.string().default('INR'),
  dailyTarget: z.number().positive().optional(),
  notes: z.string().optional(),
})

const updateBudgetSchema = z.object({
  id: z.string().min(1),
  spentAmount: z.number().min(0).optional(),
  allocatedAmount: z.number().positive().optional(),
  pacingStatus: z.enum(['ON_TRACK', 'UNDERSPEND', 'OVERSPEND']).optional(),
  dailyTarget: z.number().positive().nullable().optional(),
  notes: z.string().optional(),
  approvedById: z.string().optional(),
})

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const month = searchParams.get('month') // ISO date string for first day of month
    const platform = searchParams.get('platform')

    const where: Record<string, unknown> = {}

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (clientId) {
        if (!assignedClientIds.includes(clientId)) {
          return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
        }
        where.clientId = clientId
      } else {
        where.clientId = { in: assignedClientIds }
      }
    } else if (clientId) {
      where.clientId = clientId
    }

    if (platform) where.platform = platform

    if (month) {
      where.month = new Date(month)
    }

    const budgets = await prisma.budgetAllocation.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, logoUrl: true } },
      },
      orderBy: [{ month: 'desc' }, { platform: 'asc' }],
    })

    // Calculate summary
    const summary = {
      totalAllocated: budgets.reduce((sum, b) => sum + b.allocatedAmount, 0),
      totalSpent: budgets.reduce((sum, b) => sum + b.spentAmount, 0),
      utilizationRate: 0 as number,
    }
    summary.utilizationRate = summary.totalAllocated > 0
      ? (summary.totalSpent / summary.totalAllocated) * 100
      : 0

    return NextResponse.json({ budgets, summary })
  } catch (error) {
    console.error('Failed to fetch budget allocations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = createBudgetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: data.clientId }, select: { id: true } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (!assignedClientIds.includes(data.clientId)) {
        return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
      }
    }

    // Upsert to handle updates for same client/month/platform
    const budget = await prisma.budgetAllocation.upsert({
      where: {
        clientId_month_platform: {
          clientId: data.clientId,
          month: new Date(data.month),
          platform: data.platform,
        },
      },
      update: {
        allocatedAmount: data.allocatedAmount,
        dailyTarget: data.dailyTarget,
        notes: data.notes,
        currency: data.currency,
      },
      create: {
        clientId: data.clientId,
        month: new Date(data.month),
        platform: data.platform,
        allocatedAmount: data.allocatedAmount,
        currency: data.currency,
        dailyTarget: data.dailyTarget,
        notes: data.notes,
        approvedById: user.id,
        approvedAt: new Date(),
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ budget }, { status: 201 })
  } catch (error) {
    console.error('Failed to create budget allocation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = updateBudgetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    const existing = await prisma.budgetAllocation.findUnique({ where: { id: data.id }, select: { id: true, clientId: true } })
    if (!existing) {
      return NextResponse.json({ error: 'Budget allocation not found' }, { status: 404 })
    }

    // Tenant isolation
    if (!isManagerOrAbove(user)) {
      const assignedClientIds = await getAssignedClientIds(user.id)
      if (!assignedClientIds.includes(existing.clientId)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (data.spentAmount !== undefined) updateData.spentAmount = data.spentAmount
    if (data.allocatedAmount !== undefined) updateData.allocatedAmount = data.allocatedAmount
    if (data.pacingStatus !== undefined) updateData.pacingStatus = data.pacingStatus
    if (data.dailyTarget !== undefined) updateData.dailyTarget = data.dailyTarget
    if (data.notes !== undefined) updateData.notes = data.notes
    // approvedById is always the current user, not caller-supplied
    if (data.approvedById) {
      updateData.approvedById = user.id
      updateData.approvedAt = new Date()
    }

    const budget = await prisma.budgetAllocation.update({
      where: { id: data.id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ budget })
  } catch (error) {
    console.error('Failed to update budget allocation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
