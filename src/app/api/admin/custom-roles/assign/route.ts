import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

// POST /api/admin/custom-roles/assign - Assign a user to a custom role
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json()
    const schema = z.object({
      userId: z.string().min(1),
      customRoleId: z.string().min(1),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { userId, customRoleId } = result.data

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if custom role exists and is active
    const customRole = await prisma.customRole.findUnique({
      where: { id: customRoleId },
    })

    if (!customRole) {
      return NextResponse.json({ error: 'Custom role not found' }, { status: 404 })
    }

    if (!customRole.isActive) {
      return NextResponse.json({ error: 'Custom role is not active' }, { status: 400 })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.userCustomRole.findUnique({
      where: {
        userId_customRoleId: {
          userId,
          customRoleId,
        },
      },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'User is already assigned to this role' },
        { status: 400 }
      )
    }

    // Create the assignment
    const assignment = await prisma.userCustomRole.create({
      data: {
        userId,
        customRoleId,
      },
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
          },
        },
        customRole: true,
      },
    })

    return NextResponse.json({
      assignment: {
        ...assignment,
        assignedAt: assignment.assignedAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to assign custom role:', error)
    return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN'] })

// DELETE /api/admin/custom-roles/assign - Remove a user from a custom role
export const DELETE = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const customRoleId = searchParams.get('customRoleId')

    if (!userId || !customRoleId) {
      return NextResponse.json(
        { error: 'User ID and Custom Role ID are required' },
        { status: 400 }
      )
    }

    await prisma.userCustomRole.delete({
      where: {
        userId_customRoleId: {
          userId,
          customRoleId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove custom role assignment:', error)
    return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN'] })
