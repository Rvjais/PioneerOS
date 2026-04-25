import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'

// GET - List all OAuth access requests
export async function GET(request: Request) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const clientId = searchParams.get('clientId') || undefined

    const where: Record<string, unknown> = { status: { not: 'DELETED' } }
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    const requests = await prisma.oAuthAccessRequest.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            whatsapp: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get stats by status
    const stats = await prisma.oAuthAccessRequest.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    return NextResponse.json({
      requests,
      stats: stats.reduce(
        (acc, s) => ({ ...acc, [s.status]: s._count.status }),
        {} as Record<string, number>
      ),
    })
  } catch (error) {
    console.error('Failed to fetch access requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new access request
export async function POST(request: Request) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const body = await request.json()
    const { clientId, platform, serviceType, targetEmail, notes } = body

    // Validate required fields
    if (!clientId || !platform || !serviceType || !targetEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, platform, serviceType, targetEmail' },
        { status: 400 }
      )
    }

    // Check client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Create request
    const accessRequest = await prisma.oAuthAccessRequest.create({
      data: {
        clientId,
        platform,
        serviceType,
        targetEmail,
        notes,
      },
      include: {
        client: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json({
      request: accessRequest,
      message: 'Access request created successfully',
    })
  } catch (error) {
    console.error('Failed to create access request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
