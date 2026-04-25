import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET /api/org-chart - Get full org chart data
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const department = searchParams.get('department')
    const includeClients = searchParams.get('includeClients') !== 'false'

    // Build where clause
    const whereClause: Record<string, unknown> = {
      status: 'ACTIVE',
      deletedAt: null,
    }
    if (department && department !== 'All') {
      whereClause.department = department
    }

    // Fetch all active users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        status: true,
        email: true,
        phone: true,
        profile: {
          select: {
            profilePicture: true,
          },
        },
        ...(includeClients && {
          clientAssignments: {
            select: {
              clientId: true,
              role: true,
              isPrimary: true,
              client: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        }),
      },
      orderBy: [
        { role: 'asc' },
        { department: 'asc' },
        { firstName: 'asc' },
      ],
    })

    // Get direct reports count for each user (approximate based on department for managers)
    const directReportsCounts = await prisma.user.groupBy({
      by: ['department'],
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        role: { in: ['EMPLOYEE', 'FREELANCER', 'INTERN'] },
      },
      _count: true,
    })

    const deptCountMap = new Map(directReportsCounts.map((d) => [d.department, d._count]))

    // Format response
    const formattedUsers = users.map((user) => {
      type ClientAssignment = {
        clientId: string
        role: string
        isPrimary: boolean
        client: { id: string; name: string }
      }
      // Double assertion needed: clientAssignments is conditionally included in the Prisma select
      const assignments = ((user as Record<string, unknown>).clientAssignments || []) as ClientAssignment[]
      const clientAssignments = includeClients && assignments.length > 0
        ? assignments.map(ca => ({
            clientId: ca.clientId,
            clientName: ca.client?.name || 'Unknown',
            role: ca.role,
            isPrimary: ca.isPrimary,
          }))
        : []

      // Calculate direct reports for managers
      let directReportsCount = 0
      if (user.role === 'MANAGER' || user.role === 'OM') {
        directReportsCount = deptCountMap.get(user.department) || 0
      }

      return {
        id: user.id,
        empId: user.empId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        status: user.status,
        avatarUrl: user.profile?.profilePicture || null,
        email: user.email,
        phone: user.phone,
        clientAssignments,
        directReportsCount,
      }
    })

    // Get list of unique departments
    const departments = [...new Set(users.map((u) => u.department))].sort()

    return NextResponse.json({
      users: formattedUsers,
      departments,
      totalCount: formattedUsers.length,
    })
  } catch (error) {
    console.error('Failed to fetch org chart:', error)
    return NextResponse.json({ error: 'Failed to fetch org chart' }, { status: 500 })
  }
})
