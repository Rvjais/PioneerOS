import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const reimbursementCreateSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  vendor: z.string().min(1, 'Vendor is required'),
  amount: z.number().positive('Amount must be a positive number'),
  paidDate: z.string().min(1, 'Paid date is required'),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
})

const reimbursementUpdateSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  status: z.enum(['APPROVED', 'REJECTED'], { message: 'Status must be APPROVED or REJECTED' }),
  notes: z.string().optional(),
})

/**
 * GET /api/web/reimbursements
 * Get all reimbursements (filtered by user role)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    // Managers can see all, others see only their own
    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'ACCOUNTS'].includes(
      session.user.role
    )

    const where: Record<string, unknown> = {}

    if (!isManager) {
      where.paidById = session.user.id
    }

    if (status) {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    const reimbursements = await prisma.webReimbursement.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        paidBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reimbursements)
  } catch (error) {
    console.error('Error fetching reimbursements:', error)
    return NextResponse.json({ error: 'Failed to fetch reimbursements' }, { status: 500 })
  }
}

/**
 * POST /api/web/reimbursements
 * Create a new reimbursement request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = reimbursementCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message },
        { status: 400 }
      )
    }
    const { clientId, type, description, vendor, amount, paidDate, receiptUrl, notes } = result.data

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const reimbursement = await prisma.webReimbursement.create({
      data: {
        clientId,
        type,
        description,
        vendor: vendor || null,
        amount,
        paidById: session.user.id,
        paidDate: new Date(paidDate),
        receiptUrl: receiptUrl || null,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(reimbursement, { status: 201 })
  } catch (error) {
    console.error('Error creating reimbursement:', error)
    return NextResponse.json({ error: 'Failed to create reimbursement' }, { status: 500 })
  }
}

/**
 * PATCH /api/web/reimbursements
 * Update reimbursement status (approve/reject)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers can approve/reject
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const result = reimbursementUpdateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message },
        { status: 400 }
      )
    }
    const { id, status, notes } = result.data

    // Prevent self-approval
    if (status === 'APPROVED') {
      const reimbursement = await prisma.webReimbursement.findUnique({
        where: { id },
        select: { paidById: true },
      })
      if (!reimbursement) {
        return NextResponse.json({ error: 'Reimbursement not found' }, { status: 404 })
      }
      if (session.user.id === reimbursement.paidById) {
        return NextResponse.json({ error: 'Cannot approve your own reimbursement' }, { status: 403 })
      }
    }

    const updateData: Record<string, unknown> = { status }

    if (status === 'APPROVED') {
      updateData.approvedBy = session.user.id
      updateData.approvedAt = new Date()
    }

    if (notes) {
      updateData.notes = notes
    }

    const reimbursement = await prisma.webReimbursement.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(reimbursement)
  } catch (error) {
    console.error('Error updating reimbursement:', error)
    return NextResponse.json({ error: 'Failed to update reimbursement' }, { status: 500 })
  }
}
