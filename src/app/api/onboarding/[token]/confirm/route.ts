import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'

// Schema for confirming initial details
const confirmDetailsSchema = z.object({
  clientName: z.string().min(1, 'Company name is required'),
  clientEmail: z.string().email('Valid email is required'),
  clientPhone: z.string().min(10, 'Valid phone number is required'),
  clientCompany: z.string().min(1, 'Contact name is required'),
  clientGst: z.string().optional(),
  clientAddress: z.string().min(1, 'Address is required'),
  clientCity: z.string().min(1, 'City is required'),
  clientState: z.string().min(1, 'State is required'),
  clientPincode: z.string().optional(),
})

// POST: Confirm/update initial details (Step 1)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Validate input
    const validation = confirmDetailsSchema.safeParse(body)
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
      return NextResponse.json(
        { error: 'Onboarding link not found' },
        { status: 404 }
      )
    }

    // Check expiration
    if (new Date() > proposal.expiresAt) {
      return NextResponse.json(
        { error: 'This onboarding link has expired' },
        { status: 410 }
      )
    }

    // Check if already past this step
    if (proposal.slaAccepted) {
      return NextResponse.json(
        { error: 'Details have already been confirmed and SLA signed. Cannot modify.' },
        { status: 400 }
      )
    }

    // Atomic check: prevent race condition with concurrent confirmations
    const lockResult = await prisma.clientProposal.updateMany({
      where: { id: proposal.id, status: { not: 'DETAILS_CONFIRMED' } },
      data: { status: 'DETAILS_CONFIRMED' },
    })
    if (lockResult.count === 0 && !proposal.clientId) {
      // Another request already confirmed — re-fetch and return
      const updated = await prisma.clientProposal.findUnique({ where: { id: proposal.id } })
      return NextResponse.json({ success: true, currentStep: 2, clientId: updated?.clientId })
    }

    // Re-fetch the proposal to get the authoritative clientId after lock
    // This prevents duplicate client creation on concurrent requests
    const lockedProposal = await prisma.clientProposal.findUnique({
      where: { id: proposal.id },
      select: { clientId: true },
    })

    // Create or update Client record
    let clientId = lockedProposal?.clientId ?? proposal.clientId

    if (!clientId) {
      // Parse services from proposal
      let services: string[] = []
      try {
        const parsedServices = JSON.parse(proposal.services || '[]')
        services = parsedServices.map((s: { serviceId: string }) => s.serviceId)
      } catch {
        services = []
      }

      // Create new client
      const client = await prisma.client.create({
        data: {
          name: data.clientName,
          brandName: data.clientName,
          contactName: data.clientCompany,
          contactEmail: data.clientEmail,
          contactPhone: data.clientPhone,
          gstNumber: data.clientGst || null,
          address: data.clientAddress,
          city: data.clientCity,
          state: data.clientState,
          pincode: data.clientPincode || null,
          status: 'ONBOARDING', // Not active yet - pending SLA and payment
          services: JSON.stringify(services), // Services stored as JSON string
          contractLength: proposal.contractDuration,
          monthlyFee: proposal.basePrice,
          entityType: proposal.entityType,
        },
      })
      clientId = client.id
    }

    // Update proposal with confirmed details and link to client
    const updated = await prisma.clientProposal.update({
      where: { id: proposal.id },
      data: {
        clientId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientCompany: data.clientCompany,
        clientGst: data.clientGst || null,
        clientAddress: data.clientAddress,
        clientCity: data.clientCity,
        clientState: data.clientState,
        clientPincode: data.clientPincode || null,
        status: 'DETAILS_CONFIRMED',
        currentStep: 2,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Details confirmed successfully',
      currentStep: 2,
      proposal: {
        id: updated.id,
        status: updated.status,
        clientId,
      },
    })
  } catch (error) {
    console.error('Error confirming details:', error)
    return NextResponse.json(
      { error: 'Failed to confirm details' },
      { status: 500 }
    )
  }
}
