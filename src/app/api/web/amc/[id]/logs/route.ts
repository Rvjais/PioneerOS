import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const WEB_AMC_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']

const maintenanceLogCreateSchema = z.object({
  hoursSpent: z.number().positive('hoursSpent must be a positive number'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  billable: z.boolean().optional().default(true),
  date: z.string().optional(),
})

/**
 * GET /api/web/amc/[id]/logs
 * Get maintenance logs for a contract
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const contractId = params?.id
    if (!contractId) {
      return NextResponse.json({ error: 'Missing contract ID' }, { status: 400 })
    }
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    // Verify contract exists
    const contract = await prisma.maintenanceContract.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    const where = { contractId }

    const [logs, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.maintenanceLog.count({ where }),
    ])

    return NextResponse.json({ logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Error fetching maintenance logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}, { roles: WEB_AMC_ROLES })

/**
 * POST /api/web/amc/[id]/logs
 * Add a maintenance log entry
 */
export const POST = withAuth(async (request, { user, params }) => {
  try {
    const contractId = params?.id
    if (!contractId) {
      return NextResponse.json({ error: 'Missing contract ID' }, { status: 400 })
    }
    const body = await request.json()
    const result = maintenanceLogCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message },
        { status: 400 }
      )
    }
    const { hoursSpent, description, category, billable, date } = result.data

    // Verify contract exists
    const contract = await prisma.maintenanceContract.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (contract.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Contract is not active' }, { status: 400 })
    }

    // Check if adding hours would exceed contract limit
    if (contract.allocatedHours && contract.usedHours + hoursSpent > contract.allocatedHours) {
      return NextResponse.json(
        { error: 'Hours exceed contract limit. Available: ' + (contract.allocatedHours - contract.usedHours).toFixed(2) + ' hours' },
        { status: 400 }
      )
    }

    // Create log and update contract's used hours in a transaction
    const txResult = await prisma.$transaction(async (tx) => {
      // Create the log entry
      const log = await tx.maintenanceLog.create({
        data: {
          contractId,
          date: date ? new Date(date) : new Date(),
          hoursSpent,
          description,
          performedById: user.id,
          category,
          billable,
        },
      })

      // Update used hours on the contract
      const updatedContract = await tx.maintenanceContract.update({
        where: { id: contractId },
        data: {
          usedHours: {
            increment: hoursSpent,
          },
        },
      })

      return { log, updatedContract }
    })

    return NextResponse.json(txResult.log, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}, { roles: WEB_AMC_ROLES })

/**
 * DELETE /api/web/amc/[id]/logs
 * Delete a maintenance log entry (and reverse hour tracking)
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const contractId = params?.id
    if (!contractId) {
      return NextResponse.json({ error: 'Missing contract ID' }, { status: 400 })
    }
    const searchParams = request.nextUrl.searchParams
    const logId = searchParams.get('logId')

    if (!logId) {
      return NextResponse.json({ error: 'Missing log id' }, { status: 400 })
    }

    // Get the log to find hours to subtract
    const log = await prisma.maintenanceLog.findUnique({
      where: { id: logId },
    })

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 })
    }

    if (log.contractId !== contractId) {
      return NextResponse.json({ error: 'Log does not belong to this contract' }, { status: 400 })
    }

    // Delete log and update contract hours in a transaction (clamping to 0)
    await prisma.$transaction(async (tx) => {
      await tx.maintenanceLog.delete({
        where: { id: logId },
      })

      const contract = await tx.maintenanceContract.findUniqueOrThrow({
        where: { id: contractId },
      })

      await tx.maintenanceContract.update({
        where: { id: contractId },
        data: {
          usedHours: Math.max(0, contract.usedHours - log.hoursSpent),
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting maintenance log:', error)
    return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 })
  }
}, { roles: WEB_AMC_ROLES })
