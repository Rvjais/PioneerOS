import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET /api/hr/devices/my - Get user's assigned devices
export const GET = withAuth(async (req, { user, params }) => {
  try {
// Get user's profile with device allocation info
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        allocatedDeviceType: true,
        allocatedDeviceId: true,
        personalMobileNumber: true,
        officialPhoneNumber: true,
        hasWhatsAppAccess: true,
        deviceAllocatedAt: true,
      },
    })

    // Get actual asset assignments
    const assetAssignments = await prisma.assetAssignment.findMany({
      where: {
        userId: user.id,
        returnedAt: null, // Only active assignments
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
            condition: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    })

    // Get pending device requests
    const pendingRequests = await prisma.deviceRequest.findMany({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      profile: profile ? {
        ...profile,
        deviceAllocatedAt: profile.deviceAllocatedAt?.toISOString() || null,
      } : null,
      assignments: assetAssignments.map(a => ({
        ...a,
        assignedAt: a.assignedAt.toISOString(),
        createdAt: a.createdAt.toISOString(),
      })),
      pendingRequests: pendingRequests.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch user devices:', error)
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }
})
