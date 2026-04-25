import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { ASSET_CONDITIONS } from '@/shared/constants/formConstants'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const returnDeviceSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required').max(100),
  conditionOnReturn: z.string().max(50).optional(),
  notes: z.string().max(2000).optional().nullable(),
})

// POST /api/hr/devices/return - Return a device
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const parsed = returnDeviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { assignmentId, conditionOnReturn, notes } = parsed.data

    // Find the assignment
    const assignment = await prisma.assetAssignment.findUnique({
      where: { id: assignmentId },
      include: { asset: true },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check ownership (user can only return their own devices)
    if (assignment.userId !== user.id) {
      // Allow HR/Admin to return devices for others
      const isAuthorized =
        user.department === 'HR' ||
        ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'You can only return your own devices' },
          { status: 403 }
        )
      }
    }

    if (assignment.returnedAt) {
      return NextResponse.json(
        { error: 'This device has already been returned' },
        { status: 400 }
      )
    }

    // Validate condition using centralized constants
    const validConditions = ASSET_CONDITIONS.map(c => c.value) as string[]
    const finalCondition = conditionOnReturn || 'GOOD'
    if (!validConditions.includes(finalCondition)) {
      return NextResponse.json(
        { error: `Invalid condition. Valid conditions: ${validConditions.join(', ')}` },
        { status: 400 }
      )
    }

    // Update the assignment with return info
    const updatedAssignment = await prisma.assetAssignment.update({
      where: { id: assignmentId },
      data: {
        returnedAt: new Date(),
        conditionOnReturn: finalCondition,
        notes: notes || assignment.notes,
      },
    })

    // Update the asset status back to available
    await prisma.asset.update({
      where: { id: assignment.assetId },
      data: {
        status: 'AVAILABLE',
        condition: finalCondition,
      },
    })

    // Clear device allocation from profile if this was the allocated device
    const profile = await prisma.profile.findUnique({
      where: { userId: assignment.userId },
    })

    if (profile?.allocatedDeviceId === assignment.assetId) {
      await prisma.profile.update({
        where: { userId: assignment.userId },
        data: {
          allocatedDeviceType: null,
          allocatedDeviceId: null,
          deviceAllocatedAt: null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      assignment: {
        ...updatedAssignment,
        assignedAt: updatedAssignment.assignedAt.toISOString(),
        returnedAt: updatedAssignment.returnedAt?.toISOString() || null,
        createdAt: updatedAssignment.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to return device:', error)
    return NextResponse.json({ error: 'Failed to return device' }, { status: 500 })
  }
})
