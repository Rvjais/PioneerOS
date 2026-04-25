import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { DEVICE_REQUEST_TYPES, DEVICE_REQUEST_REASONS } from '@/shared/constants/formConstants'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const deviceRequestSchema = z.object({
  deviceType: z.string().min(1, 'Device type is required').max(100),
  reason: z.string().min(1, 'Reason is required').max(100),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  notes: z.string().max(2000).optional().nullable(),
})

// POST /api/hr/devices/request - Submit a device request
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const parsed = deviceRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { deviceType, reason, urgency = 'MEDIUM', notes } = parsed.data

    // Validate device type using centralized constants
    const validTypes = DEVICE_REQUEST_TYPES.map(t => t.value) as string[]
    if (!validTypes.includes(deviceType)) {
      return NextResponse.json(
        { error: `Invalid device type. Valid types: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate reason using centralized constants
    const validReasons = DEVICE_REQUEST_REASONS.map(r => r.value) as string[]
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: `Invalid reason. Valid reasons: ${validReasons.join(', ')}` },
        { status: 400 }
      )
    }

    // Check for existing pending request
    const existingRequest = await prisma.deviceRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
        deviceType,
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this device type' },
        { status: 400 }
      )
    }

    // Create the device request
    const request = await prisma.deviceRequest.create({
      data: {
        userId: user.id,
        deviceType,
        reason,
        urgency,
        notes,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      request: {
        ...request,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create device request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
})

// GET /api/hr/devices/request - Get user's device requests
export const GET = withAuth(async (req, { user, params }) => {
  try {
const requests = await prisma.deviceRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      requests: requests.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch device requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
})
