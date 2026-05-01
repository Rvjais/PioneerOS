import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

// GET - List all clients with their portal users (for admin access)
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can view this
    const admin = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (admin?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const hasPortalUser = searchParams.get('hasPortalUser') === 'true'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '100')), 100)
    const skip = (page - 1) * limit

    let whereClause: Record<string, unknown> = { deletedAt: null }

    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search } },
          { contactEmail: { contains: search } },
        ],
        deletedAt: null,
      }
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          contactEmail: true,
          status: true,
          lifecycleStage: true,
          clientUsers: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              isActive: true,
              lastLoginAt: true,
            },
            orderBy: { role: 'asc' },
          },
          teamMembers: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              role: true,
            },
            where: { role: 'ACCOUNT_MANAGER' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip,
      }),
      prisma.client.count({ where: whereClause }),
    ])

    // Filter to only clients with portal users if requested
    const filteredClients = hasPortalUser
      ? clients.filter(c => c.clientUsers.length > 0)
      : clients

    return NextResponse.json({
      clients: filteredClients.map(c => ({
        id: c.id,
        name: c.name,
        email: c.contactEmail,
        status: c.status,
        lifecycleStage: c.lifecycleStage,
        clientUsers: c.clientUsers,
        accountManager: c.teamMembers[0]?.user
          ? `${c.teamMembers[0].user.firstName} ${c.teamMembers[0].user.lastName || ''}`.trim()
          : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
