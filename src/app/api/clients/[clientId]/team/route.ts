import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { ADMIN_ROLES } from '@/shared/constants/roles'
import { addTeamMemberSchema, validateBody, validationError, idSchema } from '@/shared/validation/validation'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Roles that can manage client teams
const TEAM_MANAGER_ROLES = ADMIN_ROLES

// Check if user has access to a client's team
async function hasClientAccess(userId: string, userRole: string, clientId: string): Promise<boolean> {
  if (TEAM_MANAGER_ROLES.includes(userRole)) return true
  // Check if user is a team member of this client
  const isMember = await prisma.clientTeamMember.findFirst({
    where: { clientId, userId },
  })
  return !!isMember
}

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!

    // SECURITY FIX: Only managers or team members can view client team
    const hasAccess = await hasClientAccess(user.id, user.role || '', clientId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const team = await prisma.clientTeamMember.findMany({
      where: { clientId },
      select: {
        id: true,
        role: true,
        isPrimary: true,
        assignedAt: true,
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
            role: true,
          },
        },
      },
      take: 50, // Limit to 50 team members per client
      orderBy: [{ isPrimary: 'desc' }, { assignedAt: 'desc' }],
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error('Failed to fetch team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // SECURITY FIX: Only managers can add team members
    if (!TEAM_MANAGER_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Only managers can add team members' }, { status: 403 })
    }

    const { clientId } = await routeParams!

    // Validate request body
    const validation = await validateBody(req, addTeamMemberSchema)
    if (!validation.success) {
      return validationError(validation.error)
    }

    const { userId, role, isPrimary } = validation.data

    // Check if user already assigned to this client
    const existing = await prisma.clientTeamMember.findUnique({
      where: { clientId_userId: { clientId, userId } }
    })

    if (existing) {
      // Update existing assignment
      const updated = await prisma.clientTeamMember.update({
        where: { id: existing.id },
        data: { role, isPrimary: isPrimary || false },
        select: {
          id: true,
          role: true,
          isPrimary: true,
          assignedAt: true,
          user: {
            select: {
              id: true,
              empId: true,
              firstName: true,
              lastName: true,
              department: true,
              role: true,
            },
          },
        },
      })
      return NextResponse.json(updated)
    }

    // If setting as primary, unset other primaries
    if (isPrimary) {
      await prisma.clientTeamMember.updateMany({
        where: { clientId },
        data: { isPrimary: false },
      })

      // Update client's accountManagerId if role is ACCOUNT_MANAGER
      if (role === 'ACCOUNT_MANAGER') {
        await prisma.client.update({
          where: { id: clientId },
          data: { accountManagerId: userId }
        })
      }
    }

    const member = await prisma.clientTeamMember.create({
      data: {
        clientId,
        userId,
        role,
        isPrimary: isPrimary || false,
      },
      select: {
        id: true,
        role: true,
        isPrimary: true,
        assignedAt: true,
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
            role: true,
          },
        },
      },
    })

    // Create notification for the assigned user
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    })

    await prisma.notification.create({
      data: {
        userId,
        type: 'GENERAL',
        title: 'New Client Assignment',
        message: `You have been assigned to ${client?.name} as ${role.replace(/_/g, ' ')}.`,
        link: `/clients/${clientId}`,
        priority: 'NORMAL',
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Failed to add team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // SECURITY FIX: Only managers can remove team members
    if (!TEAM_MANAGER_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Only managers can remove team members' }, { status: 403 })
    }

    const { clientId } = await routeParams!
    const { searchParams } = new URL(req.url)
    const memberIdParam = searchParams.get('memberId')

    // Validate memberId
    const memberIdValidation = idSchema.safeParse(memberIdParam)
    if (!memberIdValidation.success) {
      return NextResponse.json({ error: 'Valid member ID required' }, { status: 400 })
    }
    const memberId = memberIdValidation.data

    // SECURITY FIX: Verify member belongs to this client
    const member = await prisma.clientTeamMember.findFirst({
      where: { id: memberId, clientId }
    })

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    if (member.isPrimary && member.role === 'ACCOUNT_MANAGER') {
      // Clear the accountManagerId from client
      await prisma.client.update({
        where: { id: clientId },
        data: { accountManagerId: null }
      })
    }

    await prisma.clientTeamMember.delete({
      where: { id: memberId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
