import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'

// GET - List all client OAuth connections
export async function GET(request: Request) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || undefined
    const status = searchParams.get('status') || undefined
    const clientId = searchParams.get('clientId') || undefined
    const agencyAccessOnly = searchParams.get('agencyAccessOnly') === 'true'

    const where: Record<string, unknown> = {}
    if (platform) where.platform = platform
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (agencyAccessOnly) where.agencyAccessGranted = true

    const connections = await prisma.clientOAuthConnection.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactName: true,
            contactEmail: true,
          },
        },
        accounts: {
          select: {
            id: true,
            platform: true,
            accountName: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ client: { name: 'asc' } }, { platform: 'asc' }],
    })

    // Get connection stats
    const stats = await prisma.clientOAuthConnection.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    return NextResponse.json({
      connections,
      stats: stats.reduce(
        (acc, s) => ({ ...acc, [s.status]: s._count.status }),
        {} as Record<string, number>
      ),
    })
  } catch (error) {
    console.error('Failed to fetch OAuth connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
