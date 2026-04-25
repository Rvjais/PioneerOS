import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { generateEmployeeId } from '@/server/db/sequence'
import { isValidEmployeeId } from '@/shared/utils/utils'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET: List all users with invalid employee IDs (BP-NaN, etc.)
 */
export const GET = withAuth(async (req, { user }) => {
  try {
// Only super admins can view/fix employee IDs
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find all users and check for invalid empIds
    const allUsers = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        department: true,
        status: true,
      },
      orderBy: { joiningDate: 'desc' },
    })

    const invalidUsers = allUsers.filter(user => !isValidEmployeeId(user.empId))

    return NextResponse.json({
      total: allUsers.length,
      invalid: invalidUsers.length,
      users: invalidUsers.map(u => ({
        id: u.id,
        empId: u.empId,
        name: `${u.firstName} ${u.lastName || ''}`.trim(),
        department: u.department,
        status: u.status,
      })),
    })
  } catch (error) {
    console.error('Error checking employee IDs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

/**
 * POST: Fix a specific user's invalid employee ID
 * Body: { userId: string }
 */
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Only super admins can fix employee IDs
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const schema = z.object({ userId: z.string().min(1) })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { userId } = result.data

    // Get the user
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, empId: true, firstName: true, lastName: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if the empId is already valid
    if (isValidEmployeeId(dbUser.empId)) {
      return NextResponse.json({
        message: 'Employee ID is already valid',
        empId: dbUser.empId,
      })
    }

    // Generate a new employee ID
    const newEmpId = await generateEmployeeId()

    // Update the user
    await prisma.user.update({
      where: { id: userId },
      data: { empId: newEmpId },
    })

    return NextResponse.json({
      success: true,
      message: 'Employee ID fixed successfully',
      oldEmpId: dbUser.empId,
      newEmpId,
      userName: `${dbUser.firstName} ${dbUser.lastName || ''}`.trim(),
    })
  } catch (error) {
    console.error('Error fixing employee ID:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

/**
 * PATCH: Fix ALL invalid employee IDs at once
 */
export const PATCH = withAuth(async (req, { user }) => {
  try {
// Only super admins can fix employee IDs
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find all users with invalid empIds
    const allUsers = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, empId: true, firstName: true, lastName: true },
    })

    const invalidUsers = allUsers.filter(user => !isValidEmployeeId(user.empId))

    if (invalidUsers.length === 0) {
      return NextResponse.json({
        message: 'No invalid employee IDs found',
        fixed: 0,
      })
    }

    // Generate all new employee IDs first (outside transaction for sequence integrity)
    const newIds = await Promise.all(
      invalidUsers.map(() => generateEmployeeId())
    )

    // Prepare results array
    const results: { userId: string; name: string; oldEmpId: string | null; newEmpId: string }[] = []

    // Fix all invalid users in a single transaction (batch update)
    await prisma.$transaction(
      invalidUsers.map((user, index) => {
        results.push({
          userId: user.id,
          name: `${user.firstName} ${user.lastName || ''}`.trim(),
          oldEmpId: user.empId,
          newEmpId: newIds[index],
        })
        return prisma.user.update({
          where: { id: user.id },
          data: { empId: newIds[index] },
        })
      })
    )

    return NextResponse.json({
      success: true,
      message: `Fixed ${results.length} invalid employee IDs`,
      fixed: results.length,
      results,
    })
  } catch (error) {
    console.error('Error fixing employee IDs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
