import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const domainCreateSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required').max(100),
  domainName: z.string().min(1, 'Domain name is required').max(253, 'Domain name too long')
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/, 'Invalid domain name format'),
  registrar: z.string().min(1, 'Registrar is required').max(200),
  registrationDate: z.string().min(1, 'Registration date is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid registration date format' }
  ),
  expiryDate: z.string().min(1, 'Expiry date is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid expiry date format' }
  ),
  autoRenew: z.boolean().optional().default(true),
  nameservers: z.string().max(1000).optional().nullable(),
  dnsProvider: z.string().max(200).optional().nullable(),
  sslStatus: z.enum(['NONE', 'ACTIVE', 'EXPIRED', 'PENDING']).optional().default('NONE'),
  sslExpiryDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid SSL expiry date format' }
  ).optional().nullable(),
  purchasedBy: z.string().max(50).optional().default('CLIENT'),
  annualCost: z.union([
    z.number().min(0, 'Annual cost cannot be negative').max(1e8, 'Annual cost too large'),
    z.string().refine((val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0 && n <= 1e8; }, { message: 'Annual cost must be a positive number' }),
  ]).optional().nullable(),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional().nullable(),
})

const domainUpdateSchema = z.object({
  id: z.string().min(1, 'Domain ID is required'),
  domainName: z.string().min(1).max(253).regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/, 'Invalid domain name format').optional(),
  registrar: z.string().min(1).max(200).optional(),
  registrarUrl: z.string().url('Invalid registrar URL').max(500).optional().nullable(),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid expiry date' }).optional(),
  autoRenew: z.boolean().optional(),
  status: z.string().max(50).optional(),
  notes: z.string().max(2000).optional().nullable(),
  registrationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid registration date' }).optional(),
  sslExpiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid SSL expiry date' }).optional(),
  annualCost: z.union([
    z.number().min(0).max(1e8),
    z.string().refine((val) => { const n = parseFloat(val); return !isNaN(n) && n >= 0; }, { message: 'Annual cost must be a positive number' }),
  ]).optional().nullable(),
  nameservers: z.string().max(1000).optional().nullable(),
  dnsProvider: z.string().max(200).optional().nullable(),
  sslStatus: z.enum(['NONE', 'ACTIVE', 'EXPIRED', 'PENDING']).optional(),
  purchasedBy: z.string().max(50).optional(),
})

/**
 * GET /api/web/domains
 * Get all domains
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only web team, operations, or admins can view domains
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']
    const allowedDepartments = ['WEB', 'OPERATIONS', 'MANAGEMENT']
    if (!allowedRoles.includes(session.user.role) && !allowedDepartments.includes(session.user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')
    const sslStatus = searchParams.get('sslStatus')
    const expiringWithin = searchParams.get('expiringWithin') // days
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (clientId) {
      where.clientId = clientId
    }

    if (sslStatus) {
      where.sslStatus = sslStatus
    }

    // Filter domains expiring within X days
    if (expiringWithin) {
      const days = parseInt(expiringWithin, 10)
      if (isNaN(days)) {
        return NextResponse.json({ error: 'Invalid expiringWithin parameter' }, { status: 400 })
      }
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      where.expiryDate = {
        lte: futureDate,
        gte: new Date(),
      }
    }

    const [domains, total] = await Promise.all([
      prisma.domain.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
        },
        orderBy: { expiryDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.domain.count({ where }),
    ])

    return NextResponse.json({ domains, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 })
  }
}

/**
 * POST /api/web/domains
 * Create a new domain
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers can add domains
    const postAllowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']
    const postAllowedDepartments = ['WEB', 'OPERATIONS', 'MANAGEMENT']
    if (!postAllowedRoles.includes(session.user.role) && !postAllowedDepartments.includes(session.user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const parseResult = domainCreateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const {
      clientId,
      domainName,
      registrar,
      registrationDate,
      expiryDate,
      autoRenew,
      nameservers,
      dnsProvider,
      sslStatus,
      sslExpiryDate,
      purchasedBy,
      annualCost,
      notes,
    } = parseResult.data

    // Check for duplicate domain
    const existing = await prisma.domain.findUnique({
      where: { domainName: domainName.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 400 })
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const domain = await prisma.domain.create({
      data: {
        clientId,
        domainName: domainName.toLowerCase(),
        registrar,
        registrationDate: new Date(registrationDate),
        expiryDate: new Date(expiryDate),
        autoRenew: autoRenew ?? true,
        nameservers: nameservers || null,
        dnsProvider: dnsProvider || null,
        sslStatus: sslStatus || 'NONE',
        sslExpiryDate: sslExpiryDate ? new Date(sslExpiryDate) : null,
        purchasedBy: purchasedBy || 'CLIENT',
        annualCost: annualCost ? parseFloat(String(annualCost)) : null,
        notes: notes || null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(domain, { status: 201 })
  } catch (error) {
    console.error('Error creating domain:', error)
    return NextResponse.json({ error: 'Failed to create domain' }, { status: 500 })
  }
}

/**
 * PATCH /api/web/domains
 * Update a domain
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers can update domains
    const patchAllowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']
    const patchAllowedDepartments = ['WEB', 'OPERATIONS', 'MANAGEMENT']
    if (!patchAllowedRoles.includes(session.user.role) && !patchAllowedDepartments.includes(session.user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const patchResult = domainUpdateSchema.safeParse(body)
    if (!patchResult.success) {
      return NextResponse.json(
        { error: patchResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { id, domainName, registrar, registrarUrl, expiryDate, autoRenew, status, notes,
            registrationDate, sslExpiryDate, annualCost, nameservers, dnsProvider, sslStatus, purchasedBy } = patchResult.data

    // Whitelist allowed fields to prevent mass assignment
    const updateData: Record<string, unknown> = {}
    if (domainName !== undefined) updateData.domainName = domainName
    if (registrar !== undefined) updateData.registrar = registrar
    if (registrarUrl !== undefined) updateData.registrarUrl = registrarUrl
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (nameservers !== undefined) updateData.nameservers = nameservers
    if (dnsProvider !== undefined) updateData.dnsProvider = dnsProvider
    if (sslStatus !== undefined) updateData.sslStatus = sslStatus
    if (purchasedBy !== undefined) updateData.purchasedBy = purchasedBy
    if (registrationDate) updateData.registrationDate = new Date(registrationDate)
    if (expiryDate) updateData.expiryDate = new Date(expiryDate)
    if (sslExpiryDate) updateData.sslExpiryDate = new Date(sslExpiryDate)
    if (annualCost !== undefined) updateData.annualCost = annualCost ? parseFloat(String(annualCost)) : null

    const domain = await prisma.domain.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(domain)
  } catch (error) {
    console.error('Error updating domain:', error)
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 })
  }
}

/**
 * DELETE /api/web/domains
 * Delete a domain
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
      return NextResponse.json({ error: 'Missing domain id' }, { status: 400 })
    }

    try {
      await prisma.domain.delete({
        where: { id },
      })
    } catch (deleteError: unknown) {
      if (
        typeof deleteError === 'object' &&
        deleteError !== null &&
        'code' in deleteError &&
        (deleteError as { code: string }).code === 'P2025'
      ) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
      }
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting domain:', error)
    return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 })
  }
}
