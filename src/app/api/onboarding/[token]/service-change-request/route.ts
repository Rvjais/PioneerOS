import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'

const serviceChangeSchema = z.object({
  type: z.enum(['ADD_SERVICE', 'REMOVE_SERVICE']),
  serviceId: z.string().optional(),
  serviceName: z.string().min(1, 'Service name is required'),
  reason: z.string().optional(),
})

// POST: Submit a service change request from onboarding
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    const validation = serviceChangeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Find proposal
    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Onboarding link not found' }, { status: 404 })
    }

    if (new Date() > proposal.expiresAt) {
      return NextResponse.json({ error: 'This onboarding link has expired' }, { status: 410 })
    }

    // Count existing change requests for annexure numbering
    const existingCount = await prisma.serviceChangeRequest.count({
      where: { proposalId: proposal.id },
    })

    const annexureNumber = `ANX-${String(existingCount + 1).padStart(3, '0')}`

    // Create the change request
    const changeRequest = await prisma.serviceChangeRequest.create({
      data: {
        proposalId: proposal.id,
        clientId: proposal.clientId || undefined,
        type: data.type,
        serviceId: data.serviceId || null,
        serviceName: data.serviceName,
        reason: data.reason || null,
        status: 'PENDING',
        annexureNumber,
      },
    })

    // Notify managers and the proposal creator
    const managersAndCreator = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'MANAGER' },
          { role: 'SUPER_ADMIN' },
          { id: proposal.createdById },
        ],
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    })

    const uniqueUserIds = [...new Set(managersAndCreator.map(u => u.id))]

    if (uniqueUserIds.length > 0) {
      await prisma.notification.createMany({
        data: uniqueUserIds.map(userId => ({
          userId,
          type: 'GENERAL',
          title: `Service Change Request: ${data.type === 'ADD_SERVICE' ? 'Add' : 'Remove'} ${data.serviceName}`,
          message: `Client "${proposal.prospectName}" (${proposal.prospectCompany || 'N/A'}) has requested to ${data.type === 'ADD_SERVICE' ? 'add' : 'remove'} "${data.serviceName}". ${data.reason ? `Reason: ${data.reason}` : ''}`,
          link: `/accounts/onboarding/${proposal.id}`,
          priority: 'HIGH',
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Service change request submitted successfully. The team will review and get back to you.',
      changeRequest: {
        id: changeRequest.id,
        type: changeRequest.type,
        serviceName: changeRequest.serviceName,
        status: changeRequest.status,
        annexureNumber: changeRequest.annexureNumber,
      },
    })
  } catch (error) {
    console.error('Error creating service change request:', error)
    return NextResponse.json(
      { error: 'Failed to submit service change request' },
      { status: 500 }
    )
  }
}

// GET: Fetch existing change requests for this proposal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
      select: { id: true },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const requests = await prisma.serviceChangeRequest.findMany({
      where: { proposalId: proposal.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching service change requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}
