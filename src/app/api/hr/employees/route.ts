import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET - Returns employee list for HR (no sensitive data)
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    // Optional filters
    const department = searchParams.get('department')
    const search = searchParams.get('search')

    const excludeFounders = searchParams.get('excludeFounders') === 'true'
    const where: Record<string, unknown> = { status: 'ACTIVE', deletedAt: null }

    // Exclude founders (RAIN-prefixed SUPER_ADMINs) when used in exit flows
    if (excludeFounders) {
      where.NOT = { AND: [{ empId: { startsWith: 'RAIN-' } }, { role: 'SUPER_ADMIN' }] }
    }

    // MANAGER can only see employees in their own department
    if (user.role === 'MANAGER' && user.department) {
      where.department = user.department
    } else if (department) {
      where.department = department
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { empId: { contains: search } },
      ]
    }

    // Fetch employees and total count in parallel
    const [employees, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          empId: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          profile: {
            select: {
              profilePicture: true,
            },
          },
        },
        orderBy: { firstName: 'asc' },
        take: limit,
        skip,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'HR', 'ACCOUNTS', 'OPERATIONS_HEAD', 'OM'] })
