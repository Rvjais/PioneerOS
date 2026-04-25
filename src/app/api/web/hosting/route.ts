import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const HostingUpdateSchema = z.object({
  id: z.string().min(1, 'Hosting account ID is required'),
  provider: z.string().min(1).max(100).optional(),
  planType: z.string().min(1).max(100).optional(),
  serverLocation: z.string().max(100).optional().nullable(),
  monthlyCost: z.union([
    z.number().min(0, 'Monthly cost cannot be negative').max(1000000),
    z.string().refine((val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0 && n <= 1000000; }, { message: 'Monthly cost must be a positive number up to 1,000,000' }),
  ]).optional(),
  renewalDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid renewal date format' }).optional(),
  storageGB: z.union([
    z.number().min(0).max(100000),
    z.string().refine((val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0; }, { message: 'Storage must be a positive number' }),
  ]).optional().nullable(),
  bandwidthGB: z.union([
    z.number().min(0).max(1000000),
    z.string().refine((val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0; }, { message: 'Bandwidth must be a positive number' }),
  ]).optional().nullable(),
  ipAddress: z.string().max(45).optional().nullable(),
  cpanelUrl: z.string().url('Invalid cPanel URL').max(500).optional().nullable(),
  purchasedBy: z.string().max(50).optional(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.string().max(50).optional(),
})

const HostingCreateSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  provider: z.string().min(1, 'Provider is required').max(100),
  planType: z.string().min(1, 'Plan type is required').max(100),
  serverLocation: z.string().max(100).optional().nullable(),
  monthlyCost: z.union([
    z.number().min(0, 'Monthly cost cannot be negative').max(1000000, 'Monthly cost cannot exceed 1,000,000'),
    z.string().refine((val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0 && n <= 1000000; }, { message: 'Monthly cost must be a positive number up to 1,000,000' }),
  ]),
  renewalDate: z.string().min(1, 'Renewal date is required').refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid renewal date format' }),
  storageGB: z.union([
    z.number().min(0, 'Storage cannot be negative').max(100000, 'Storage cannot exceed 100,000 GB'),
    z.string().refine((val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0; }, { message: 'Storage must be a positive number' }),
  ]).optional().nullable(),
  bandwidthGB: z.union([
    z.number().min(0, 'Bandwidth cannot be negative').max(1000000),
    z.string().refine((val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0; }, { message: 'Bandwidth must be a positive number' }),
  ]).optional().nullable(),
  ipAddress: z.string().max(45).optional().nullable(),
  cpanelUrl: z.string().url('Invalid cPanel URL').max(500).optional().nullable(),
  purchasedBy: z.string().max(50).optional(),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional().nullable(),
})

/**
 * GET /api/web/hosting
 * Get all hosting accounts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only web team, operations, or admins can view hosting accounts
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']
    const allowedDepartments = ['WEB', 'OPERATIONS', 'MANAGEMENT']
    if (!allowedRoles.includes(session.user.role) && !allowedDepartments.includes(session.user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')
    const provider = searchParams.get('provider')
    const expiringWithin = searchParams.get('expiringWithin') // days
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (clientId) {
      where.clientId = clientId
    }

    if (provider) {
      where.provider = provider
    }

    // Filter accounts renewing within X days
    if (expiringWithin) {
      const days = parseInt(expiringWithin, 10)
      if (isNaN(days)) {
        return NextResponse.json({ error: 'Invalid expiringWithin parameter' }, { status: 400 })
      }
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      where.renewalDate = {
        lte: futureDate,
        gte: new Date(),
      }
    }

    const [hostingAccounts, total] = await Promise.all([
      prisma.hostingAccount.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
        },
        orderBy: { renewalDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.hostingAccount.count({ where }),
    ])

    return NextResponse.json({ hostingAccounts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Error fetching hosting accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch hosting accounts' }, { status: 500 })
  }
}

/**
 * POST /api/web/hosting
 * Create a new hosting account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers can add hosting accounts
    const postAllowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']
    const postAllowedDepartments = ['WEB', 'OPERATIONS', 'MANAGEMENT']
    if (!postAllowedRoles.includes(session.user.role) && !postAllowedDepartments.includes(session.user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const parseResult = HostingCreateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const {
      clientId,
      provider,
      planType,
      serverLocation,
      monthlyCost,
      renewalDate,
      storageGB,
      bandwidthGB,
      ipAddress,
      cpanelUrl,
      purchasedBy,
      notes,
    } = parseResult.data

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const hostingAccount = await prisma.hostingAccount.create({
      data: {
        clientId,
        provider,
        planType,
        serverLocation: serverLocation || null,
        monthlyCost: parseFloat(String(monthlyCost)),
        renewalDate: new Date(renewalDate),
        storageGB: storageGB ? parseFloat(String(storageGB)) : null,
        bandwidthGB: bandwidthGB ? parseFloat(String(bandwidthGB)) : null,
        ipAddress: ipAddress || null,
        cpanelUrl: cpanelUrl || null,
        purchasedBy: purchasedBy || 'CLIENT',
        notes: notes || null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(hostingAccount, { status: 201 })
  } catch (error) {
    console.error('Error creating hosting account:', error)
    return NextResponse.json({ error: 'Failed to create hosting account' }, { status: 500 })
  }
}

/**
 * PATCH /api/web/hosting
 * Update a hosting account
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers can update hosting accounts
    const patchAllowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']
    const patchAllowedDepartments = ['WEB', 'OPERATIONS', 'MANAGEMENT']
    if (!patchAllowedRoles.includes(session.user.role) && !patchAllowedDepartments.includes(session.user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const patchResult = HostingUpdateSchema.safeParse(body)
    if (!patchResult.success) {
      return NextResponse.json(
        { error: patchResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { id, provider, planType, serverLocation, monthlyCost, renewalDate,
            storageGB, bandwidthGB, ipAddress, cpanelUrl, purchasedBy, notes, status } = patchResult.data

    // Whitelist allowed fields to prevent mass assignment
    const updateData: Record<string, unknown> = {}
    if (provider !== undefined) updateData.provider = provider
    if (planType !== undefined) updateData.planType = planType
    if (serverLocation !== undefined) updateData.serverLocation = serverLocation
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress
    if (cpanelUrl !== undefined) updateData.cpanelUrl = cpanelUrl
    if (purchasedBy !== undefined) updateData.purchasedBy = purchasedBy
    if (notes !== undefined) updateData.notes = notes
    if (status !== undefined) updateData.status = status
    if (renewalDate) updateData.renewalDate = new Date(renewalDate)
    if (monthlyCost !== undefined) updateData.monthlyCost = parseFloat(String(monthlyCost))
    if (storageGB !== undefined) updateData.storageGB = parseFloat(String(storageGB))
    if (bandwidthGB !== undefined) updateData.bandwidthGB = parseFloat(String(bandwidthGB))

    const hostingAccount = await prisma.hostingAccount.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(hostingAccount)
  } catch (error) {
    console.error('Error updating hosting account:', error)
    return NextResponse.json({ error: 'Failed to update hosting account' }, { status: 500 })
  }
}

/**
 * DELETE /api/web/hosting
 * Delete a hosting account
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can delete
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing hosting account id' }, { status: 400 })
    }

    try {
      await prisma.hostingAccount.delete({
        where: { id },
      })
    } catch (deleteError: unknown) {
      if (
        typeof deleteError === 'object' &&
        deleteError !== null &&
        'code' in deleteError &&
        (deleteError as { code: string }).code === 'P2025'
      ) {
        return NextResponse.json({ error: 'Hosting account not found' }, { status: 404 })
      }
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hosting account:', error)
    return NextResponse.json({ error: 'Failed to delete hosting account' }, { status: 500 })
  }
}
