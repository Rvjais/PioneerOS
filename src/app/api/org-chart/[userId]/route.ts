import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET /api/org-chart/[userId] - Get detailed user profile for org chart
export const GET = withAuth(async (
  req: NextRequest,
  { params, user: currentUser }
) => {
  try {
    const userId = params?.userId
    // Restrict contact info for FREELANCER/INTERN
    const isRestricted = ['FREELANCER', 'INTERN'].includes(currentUser.role)

    // Fetch user with all details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        status: !isRestricted,
        email: !isRestricted,
        phone: !isRestricted,
        joiningDate: !isRestricted,
        profile: {
          select: {
            profilePicture: true,
          },
        },
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
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get direct reports count (for managers - count users in same department)
    let directReportsCount = 0
    if (user.role === 'MANAGER' || user.role === 'OM' || user.role === 'SUPER_ADMIN') {
      const reportsCount = await prisma.user.count({
        where: {
          department: user.department,
          status: 'ACTIVE',
          deletedAt: null,
          role: { in: ['EMPLOYEE', 'FREELANCER', 'INTERN'] },
        },
      })
      directReportsCount = reportsCount
    }

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const workStats = await prisma.workEntry.aggregate({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
        status: { in: ['SUBMITTED', 'APPROVED'] },
      },
      _count: { _all: true },
      _sum: { hoursSpent: true },
    })

    // Get last active date
    const lastEntry = await prisma.workEntry.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    })

    // Format client assignments
    const clientAssignments = user.clientAssignments.map((ca) => ({
      clientId: ca.clientId,
      clientName: ca.client.name,
      role: ca.role,
      isPrimary: ca.isPrimary,
    }))

    return NextResponse.json({
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
      joiningDate: user.joiningDate?.toISOString() || null,
      clientAssignments,
      directReportsCount,
      recentActivity: {
        tasksCompleted: workStats._count._all,
        hoursWorked: workStats._sum.hoursSpent || 0,
        lastActive: lastEntry?.date?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
})
