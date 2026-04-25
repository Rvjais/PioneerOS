import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { ASSET_CONDITIONS } from '@/shared/constants/formConstants'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const assignDeviceSchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(100),
  assetId: z.string().min(1, 'Asset ID is required').max(100),
  requestId: z.string().max(100).optional(),
  conditionOnAssign: z.string().max(50).optional(),
  notes: z.string().max(2000).optional().nullable(),
  officialPhoneNumber: z.string().max(20).optional().nullable(),
  hasWhatsAppAccess: z.boolean().optional(),
})

// POST /api/hr/devices/assign - Assign a device to a user
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Only HR or admins can assign devices
    const isAuthorized =
      user.department === 'HR' ||
      ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = assignDeviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      userId,
      assetId,
      requestId,
      conditionOnAssign = 'GOOD',
      notes,
      officialPhoneNumber,
      hasWhatsAppAccess = false,
    } = parsed.data

    // Check if user exists
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if asset exists and is available
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    if (asset.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Asset is not available for assignment' },
        { status: 400 }
      )
    }

    // Validate condition using centralized constants
    const validConditions = ASSET_CONDITIONS.map(c => c.value) as string[]
    if (!validConditions.includes(conditionOnAssign)) {
      return NextResponse.json(
        { error: `Invalid condition. Valid conditions: ${validConditions.join(', ')}` },
        { status: 400 }
      )
    }

    // Create the assignment
    const assignment = await prisma.assetAssignment.create({
      data: {
        assetId,
        userId,
        conditionOnAssign,
        notes,
      },
      include: {
        asset: {
          select: {
            id: true,
            assetTag: true,
            name: true,
            type: true,
            brand: true,
            model: true,
          },
        },
      },
    })

    // Update asset status to assigned
    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'ASSIGNED' },
    })

    // Update user's profile with device allocation
    await prisma.profile.upsert({
      where: { userId },
      update: {
        allocatedDeviceType: asset.type,
        allocatedDeviceId: assetId,
        officialPhoneNumber: officialPhoneNumber || undefined,
        hasWhatsAppAccess,
        deviceAllocatedAt: new Date(),
      },
      create: {
        userId,
        allocatedDeviceType: asset.type,
        allocatedDeviceId: assetId,
        officialPhoneNumber,
        hasWhatsAppAccess,
        deviceAllocatedAt: new Date(),
      },
    })

    // Update the device request if provided
    if (requestId) {
      await prisma.deviceRequest.update({
        where: { id: requestId },
        data: {
          status: 'FULFILLED',
          fulfilledAssetId: assetId,
        },
      })
    }

    // Update employee onboarding checklist if exists
    const checklist = await prisma.employeeOnboardingChecklist.findUnique({
      where: { userId },
    })

    if (checklist && !checklist.deviceAllocated) {
      await prisma.employeeOnboardingChecklist.update({
        where: { userId },
        data: {
          deviceAllocated: true,
          deviceAllocatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        assignedAt: assignment.assignedAt.toISOString(),
        createdAt: assignment.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to assign device:', error)
    return NextResponse.json({ error: 'Failed to assign device' }, { status: 500 })
  }
})
