import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const patchSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
})

// Approval flow configuration
const APPROVAL_FLOW: Record<
  string,
  { nextStatus: string; requiredRoles: string[]; field: string }
> = {
  DRAFT: {
    nextStatus: 'HR_APPROVED',
    requiredRoles: ['HR', 'SUPER_ADMIN', 'MANAGER'],
    field: 'approvedByHR',
  },
  HR_APPROVED: {
    nextStatus: 'FINANCE_APPROVED',
    requiredRoles: ['ACCOUNTS', 'SUPER_ADMIN'],
    field: 'approvedByFinance',
  },
  FINANCE_APPROVED: {
    nextStatus: 'LEADERSHIP_APPROVED',
    requiredRoles: ['MANAGER', 'SUPER_ADMIN'],
    field: 'approvedByLeadership',
  },
  LEADERSHIP_APPROVED: {
    nextStatus: 'PAID',
    requiredRoles: ['ACCOUNTS', 'SUPER_ADMIN'],
    field: 'paidAt',
  },
}

// ---------- GET /api/hr/fnf/:id ----------
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  const fnfRoles = ['SUPER_ADMIN', 'HR', 'ACCOUNTS']
  if (!fnfRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {

    const { id } = await routeParams!

    const settlement = await prisma.fnFSettlement.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
            email: true,
            joiningDate: true,
          },
        },
        exitProcess: {
          select: {
            id: true,
            type: true,
            noticeDate: true,
            lastWorkingDate: true,
            status: true,
          },
        },
        lineItems: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!settlement) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 })
    }

    return NextResponse.json(settlement)
  } catch (error) {
    console.error('Failed to fetch FnF settlement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// ---------- PATCH /api/hr/fnf/:id ----------
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!
    const body = await req.json()
    const result = patchSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { action, notes } = result.data

    const settlement = await prisma.fnFSettlement.findUnique({
      where: { id },
    })

    if (!settlement) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 })
    }

    // Handle rejection: reset to DRAFT
    if (action === 'reject') {
      const updated = await prisma.fnFSettlement.update({
        where: { id },
        data: {
          status: 'DRAFT',
          approvedByHR: null,
          approvedByFinance: null,
          approvedByLeadership: null,
        },
        include: {
          user: {
            select: {
              id: true,
              empId: true,
              firstName: true,
              lastName: true,
              department: true,
            },
          },
          lineItems: { orderBy: { createdAt: 'asc' } },
        },
      })
      return NextResponse.json(updated)
    }

    // Handle approval
    const flow = APPROVAL_FLOW[settlement.status]
    if (!flow) {
      return NextResponse.json(
        { error: `Settlement in status "${settlement.status}" cannot be approved further` },
        { status: 400 }
      )
    }

    const userRole = user.role || ''
    if (!flow.requiredRoles.includes(userRole)) {
      return NextResponse.json(
        {
          error: `Your role (${userRole}) cannot approve at this stage. Required: ${flow.requiredRoles.join(', ')}`,
        },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status: flow.nextStatus,
    }

    if (flow.field === 'paidAt') {
      updateData.paidAt = new Date()
    } else {
      updateData[flow.field] = `${user.firstName || user.id} (${new Date().toISOString()})`
    }

    const updated = await prisma.fnFSettlement.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
        exitProcess: {
          select: { id: true, type: true, lastWorkingDate: true },
        },
        lineItems: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update FnF settlement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
