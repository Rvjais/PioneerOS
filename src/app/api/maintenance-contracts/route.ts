import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { getPaginationParams, paginatedResponse } from '@/shared/utils/pagination'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createContractSchema = z.object({
  clientId: z.string().min(1),
  type: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  amount: z.number().min(0),
  autoRenew: z.boolean().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/maintenance-contracts
 * List maintenance contracts
 */
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const upcoming = searchParams.get('upcoming') // Show contracts expiring soon
    const { skip, take, page, limit } = getPaginationParams(req)

    // Build filter
    const filter: Record<string, unknown> = {}

    if (clientId) {
      filter.clientId = clientId
    }

    if (status) {
      filter.status = status
    }

    if (type) {
      filter.type = type
    }

    // Upcoming renewals (next 30 days)
    if (upcoming === 'true') {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      filter.status = 'ACTIVE'
      filter.renewalDate = {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      }
    }

    const [contracts, total] = await Promise.all([
      prisma.maintenanceContract.findMany({
        where: filter,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              brandName: true,
              contactName: true,
              contactPhone: true,
            },
          },
        },
        orderBy: { renewalDate: 'asc' },
        skip,
        take,
      }),
      prisma.maintenanceContract.count({ where: filter }),
    ])

    return NextResponse.json(paginatedResponse(contracts, total, page, limit))
  } catch (error) {
    console.error('Error fetching maintenance contracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance contracts' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/maintenance-contracts
 * Create a maintenance contract for a client
 */
export const POST = withAuth(async (req, { user, params }) => {
  try {
const userRole = user.role as string
    const userDepartment = user.department as string
    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)
    const isWebTeam = userDepartment === 'WEB'
    const isAccounts = userRole === 'ACCOUNTS' || userDepartment === 'ACCOUNTS'

    if (!isAdmin && !isWebTeam && !isAccounts) {
      return NextResponse.json(
        { error: 'Only admins, web team, or accounts can manage contracts' },
        { status: 403 }
      )
    }

    const raw = await req.json()
    const parsed = createContractSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { clientId, type, startDate, endDate, amount, autoRenew, notes } = parsed.data

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Calculate renewal date (30 days before end date)
    const renewalDate = new Date(endDate)
    renewalDate.setDate(renewalDate.getDate() - 30)

    const contract = await prisma.maintenanceContract.create({
      data: {
        clientId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        renewalDate,
        amount: parseFloat(String(amount)),
        status: 'ACTIVE',
        autoRenew: autoRenew || false,
        notes: notes || null,
      },
      include: {
        client: {
          select: { name: true },
        },
      },
    })

    // If client was one-time, and this is a recurring contract, update client type
    if (client.clientType === 'ONE_TIME' && type === 'MONTHLY_MAINTENANCE') {
      await prisma.client.update({
        where: { id: clientId },
        data: { clientType: 'RECURRING' },
      })
    }

    return NextResponse.json({
      success: true,
      contract,
      message: 'Contract created successfully',
    })
  } catch (error) {
    console.error('Error creating maintenance contract:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance contract' },
      { status: 500 }
    )
  }
})

/**
 * PATCH /api/maintenance-contracts
 * Update a maintenance contract
 */
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
const userRole = user.role as string
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(userRole)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins or accounts can update contracts' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { id, status, endDate, amount, autoRenew, notes, renewalDate } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    const contract = await prisma.maintenanceContract.findUnique({
      where: { id },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (status) updateData.status = status
    if (endDate) updateData.endDate = new Date(endDate)
    if (amount) updateData.amount = parseFloat(amount)
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew
    if (notes !== undefined) updateData.notes = notes
    if (renewalDate) updateData.renewalDate = new Date(renewalDate)

    const updatedContract = await prisma.maintenanceContract.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      contract: updatedContract,
    })
  } catch (error) {
    console.error('Error updating maintenance contract:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance contract' },
      { status: 500 }
    )
  }
})
