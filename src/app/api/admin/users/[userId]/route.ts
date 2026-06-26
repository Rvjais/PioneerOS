import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'
import { logAdminAction } from '@/server/services/adminAudit'

const UserPatchSchema = z.object({
  firstName: z.string().min(1).max(100, 'First name must be 100 characters or less').optional(),
  lastName: z.string().min(1).max(100, 'Last name must be 100 characters or less').optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(15, 'Phone must be 15 characters or less').optional().nullable(),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'HR', 'EMPLOYEE', 'FREELANCER', 'INTERN', 'ACCOUNTS', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'SALES']).optional(),
  department: z.string().min(1).max(100).optional(),
  employeeType: z.string().min(1).max(50).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'PROBATION']).optional(),
  buddyId: z.string().min(1).optional().nullable(),
})

// GET - Get user details
export const GET = withAuth(async (req, { user, params }) => {
  try {
    if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const p = await params
    const userId = p!['userId']
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Never expose password hash in API responses
    const { password: _password, ...userWithoutPassword } = dbUser

    // MANAGER viewers should not see sensitive PII fields
    if (user.role === 'MANAGER' && userWithoutPassword.profile) {
      const { panCard, aadhaar, bankDetailsUrl, ...safeProfile } = userWithoutPassword.profile as Record<string, unknown>
      return NextResponse.json({ ...userWithoutPassword, profile: safeProfile })
    }

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update user
export const PATCH = withAuth(async (req, { user, params }) => {
  try {
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admins can edit users.' }, { status: 401 })
    }

    const p = await params
    const userId = p!['userId']
    const body = await req.json()

    // Validate input
    const parseResult = UserPatchSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    // Validate the target user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent assigning user as their own buddy
    if (parseResult.data.buddyId && parseResult.data.buddyId === userId) {
      return NextResponse.json({ error: 'Cannot assign yourself as buddy' }, { status: 400 })
    }

    // Extract allowed fields
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
      employeeType,
      status,
      buddyId,
    } = parseResult.data

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined) updateData.role = role
    if (department !== undefined) updateData.department = department
    if (employeeType !== undefined) updateData.employeeType = employeeType
    if (status !== undefined) updateData.status = status
    if (buddyId !== undefined) updateData.buddyId = buddyId

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Audit log
    const changedFields = Object.keys(parseResult.data).join(', ')
    await logAdminAction({
      userId: user.id,
      action: 'USER_UPDATE',
      title: 'User updated',
      message: `Updated ${existingUser.firstName} ${existingUser.lastName || ''} (${existingUser.empId}): ${changedFields}`,
      link: `/admin/users/${userId}`,
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE - Permanently delete user
export const DELETE = withAuth(async (req, { user, params }) => {
  try {
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const p2 = await params
    const userId = p2!['userId']

    // Don't allow deleting yourself
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Fetch user info before deletion for audit log
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { empId: true, firstName: true, lastName: true, phone: true, email: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Nullify employee proposals referencing this user (no cascade)
      await tx.employeeProposal.updateMany({
        where: { createdById: userId },
        data: { createdById: '' },
      })
      await tx.employeeProposal.updateMany({
        where: { userId },
        data: { userId: null },
      })

      // Delete the user (cascades to most related tables)
      await tx.user.delete({ where: { id: userId } })
    })

    // Audit log
    await logAdminAction({
      userId: user.id,
      action: 'USER_DELETE',
      title: 'User permanently deleted',
      message: `Deleted ${targetUser.firstName || ''} ${targetUser.lastName || ''} (${targetUser.empId || userId})`,
    })

    return NextResponse.json({
      success: true,
      message: 'User permanently deleted',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
