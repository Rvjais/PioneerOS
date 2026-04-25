import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

/**
 * GET /api/web/clients
 * Get all web team clients
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only web team, operations, or admins can view web clients
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']
    const allowedDepartments = ['WEB', 'OPERATIONS', 'MANAGEMENT']
    if (!allowedRoles.includes(session.user.role) && !allowedDepartments.includes(session.user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const includeProjects = searchParams.get('includeProjects') === 'true'
    const includeDomains = searchParams.get('includeDomains') === 'true'
    const includeHosting = searchParams.get('includeHosting') === 'true'
    const includeAmc = searchParams.get('includeAmc') === 'true'
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {
      isWebTeamClient: true,
      deletedAt: null,
    }

    if (status) {
      where.status = status
    }

    // Build select with optional relations
    const selectWithRelations: Record<string, unknown> = {
      id: true,
      name: true,
      brandName: true,
      websiteUrl: true,
      status: true,
      industry: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
    }

    if (includeProjects) {
      selectWithRelations.webProjects = {
        orderBy: { createdAt: 'desc' },
        take: 5,
      }
    }

    if (includeDomains) {
      selectWithRelations.domains = {
        orderBy: { expiryDate: 'asc' },
      }
    }

    if (includeHosting) {
      selectWithRelations.hostingAccounts = {
        orderBy: { renewalDate: 'asc' },
      }
    }

    if (includeAmc) {
      selectWithRelations.maintenanceContracts = {
        where: { status: 'ACTIVE' },
        orderBy: { endDate: 'asc' },
      }
    }

    const take = Math.min(parseInt(searchParams.get('limit') || '200', 10), 500)

    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
      select: selectWithRelations,
      take,
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching web clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}
