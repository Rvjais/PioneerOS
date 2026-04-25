import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// Schema for creating a testimonial request
const createTestimonialSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  requestMessage: z.string().optional(),
  clientContactName: z.string().optional(),
  clientContactEmail: z.string().email().optional().or(z.literal('')),
})

// GET /api/testimonials - List testimonials with filters
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const clientId = searchParams.get('clientId')
    const myRequests = searchParams.get('myRequests') === 'true'

    const isManager = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role)

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (userId) {
      where.requestedById = userId
    } else if (myRequests) {
      where.requestedById = user.id
    }

    if (clientId) {
      where.clientId = clientId
    }

    // Non-managers can only see their own requests or verified testimonials
    if (!isManager && !myRequests) {
      where.OR = [
        { requestedById: user.id },
        { status: 'VERIFIED' },
        { status: 'REWARDED' },
      ]
    }

    const testimonials = await prisma.videoTestimonial.findMany({
      where,
      include: {
        requestedBy: {
          select: { id: true, firstName: true, lastName: true, department: true },
        },
        client: {
          select: { id: true, name: true, logoUrl: true },
        },
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get stats
    const stats = await prisma.videoTestimonial.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const statsMap = stats.reduce((acc, s) => {
      acc[s.status] = s._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      testimonials,
      stats: {
        requested: statsMap['REQUESTED'] || 0,
        received: statsMap['RECEIVED'] || 0,
        verified: statsMap['VERIFIED'] || 0,
        rewarded: statsMap['REWARDED'] || 0,
        total: testimonials.length,
      },
    })
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
})

// POST /api/testimonials - Request a new testimonial from client
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const validation = createTestimonialSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const { clientId, requestMessage, clientContactName, clientContactEmail } = validation.data

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, contactName: true, contactEmail: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if there's already a pending request for this client by this user
    const existingRequest = await prisma.videoTestimonial.findFirst({
      where: {
        clientId,
        requestedById: user.id,
        status: 'REQUESTED',
      },
    })

    if (existingRequest) {
      return NextResponse.json({
        error: 'You already have a pending testimonial request for this client',
      }, { status: 400 })
    }

    const testimonial = await prisma.videoTestimonial.create({
      data: {
        requestedById: user.id,
        clientId,
        requestMessage,
        clientContactName: clientContactName || client.contactName,
        clientContactEmail: clientContactEmail || client.contactEmail,
        status: 'REQUESTED',
      },
      include: {
        requestedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        client: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      testimonial,
      message: 'Testimonial request created successfully',
    })
  } catch (error) {
    console.error('Failed to create testimonial request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
})
