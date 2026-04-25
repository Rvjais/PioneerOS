import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { getClientTeamRoleDefinition } from '@/shared/constants/roleDefinitions'

// GET /api/client-portal/team/[userId] - Get detailed team member info for client portal
export const GET = withClientAuth(async (req, { user }, routeContext) => {
  const { userId } = await routeContext!.params

  const clientId = user.clientId

  // Verify that this user is assigned to the client
  const teamAssignment = await prisma.clientTeamMember.findFirst({
    where: {
      clientId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          email: true,
          profile: {
            select: {
              profilePicture: true,
            },
          },
        },
      },
    },
  })

  if (!teamAssignment) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
  }

  // Get work stats for this client in current period (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const workStats = await prisma.workEntry.aggregate({
    where: {
      userId,
      clientId,
      date: { gte: thirtyDaysAgo },
      status: { in: ['SUBMITTED', 'APPROVED'] },
    },
    _count: { _all: true },
    _sum: { hoursSpent: true },
  })

  // Get last active date for this client
  const lastEntry = await prisma.workEntry.findFirst({
    where: {
      userId,
      clientId,
    },
    orderBy: { date: 'desc' },
    select: { date: true },
  })

  // Get role definition
  const roleDefinition = getClientTeamRoleDefinition(teamAssignment.role)

  // Build response - note: we don't expose phone numbers to clients
  return NextResponse.json({
    id: teamAssignment.user.id,
    firstName: teamAssignment.user.firstName,
    lastName: teamAssignment.user.lastName,
    department: teamAssignment.user.department,
    role: teamAssignment.role,
    avatarUrl: teamAssignment.user.profile?.profilePicture || null,
    isPrimary: teamAssignment.isPrimary,
    email: null, // We don't expose email to clients
    roleDefinition: roleDefinition ? {
      title: roleDefinition.title,
      description: roleDefinition.description,
      responsibilities: roleDefinition.responsibilities,
      isPrimary: roleDefinition.isPrimary,
      escalationContact: roleDefinition.escalationContact,
      billingContact: roleDefinition.billingContact,
    } : null,
    workStats: {
      tasksThisPeriod: workStats._count._all,
      hoursThisPeriod: workStats._sum.hoursSpent || 0,
      lastActiveDate: lastEntry?.date?.toISOString() || null,
    },
  })
}, { rateLimit: 'READ' })
