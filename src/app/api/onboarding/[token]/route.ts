import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { SERVICES, ENTITY_TYPES, ONBOARDING_STEPS } from '@/server/onboarding/constants'

// GET: Fetch onboarding proposal by token (public - no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
      include: {
        onboardingDetails: true,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Onboarding link not found or expired' },
        { status: 404 }
      )
    }

    // Check expiration
    if (new Date() > proposal.expiresAt) {
      return NextResponse.json(
        { error: 'This onboarding link has expired. Please contact the team for a new link.' },
        { status: 410 }
      )
    }

    // Mark as viewed if first time
    if (proposal.status === 'SENT' && !proposal.viewedAt) {
      await prisma.clientProposal.update({
        where: { id: proposal.id },
        data: {
          status: 'VIEWED',
          viewedAt: new Date(),
        },
      })
    }

    // Get entity details
    const entity = ENTITY_TYPES.find(e => e.id === proposal.entityType) || ENTITY_TYPES[0]

    // Parse services
    let services = []
    try {
      services = JSON.parse(proposal.services || '[]')
    } catch {
      services = []
    }

    // Determine current step based on status
    let currentStep = proposal.currentStep || 1
    if (proposal.status === 'ACTIVATED' || proposal.portalActivated) currentStep = 6
    else if (proposal.accountOnboardingCompleted) currentStep = 5
    else if (proposal.paymentConfirmed) currentStep = 4
    else if (proposal.slaAccepted) currentStep = 3
    else if (proposal.status === 'DETAILS_CONFIRMED') currentStep = 2

    // Build response
    const response = {
      id: proposal.id,
      token: proposal.token,
      status: proposal.status,
      currentStep,
      steps: ONBOARDING_STEPS,

      // Pre-filled details
      prospect: {
        name: proposal.prospectName,
        email: proposal.prospectEmail,
        phone: proposal.prospectPhone,
        company: proposal.prospectCompany,
      },

      // Client-submitted details (editable in step 1)
      client: {
        name: proposal.clientName || proposal.prospectName,
        email: proposal.clientEmail || proposal.prospectEmail,
        phone: proposal.clientPhone || proposal.prospectPhone,
        company: proposal.clientCompany || proposal.prospectCompany,
        gst: proposal.clientGst,
        address: proposal.clientAddress,
        city: proposal.clientCity,
        state: proposal.clientState,
        pincode: proposal.clientPincode,
      },

      // Services & Pricing
      services,
      serviceNames: services.map((s: { serviceId: string }) =>
        SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId
      ),
      basePrice: proposal.basePrice,
      gstPercentage: proposal.gstPercentage,
      totalPrice: proposal.totalPrice,
      advanceAmount: proposal.advanceAmount,
      advancePercentage: proposal.advancePercentage,

      // Contract details
      contractDuration: proposal.contractDuration,
      paymentTerms: proposal.paymentTerms,

      // Entity details
      entity: {
        id: entity.id,
        name: entity.name,
        legalName: entity.legalName,
        address: entity.address,
        bank: entity.bank,
      },

      // SLA status
      sla: {
        accepted: proposal.slaAccepted,
        acceptedAt: proposal.slaAcceptedAt,
        signerName: proposal.slaSignerName,
      },

      // Invoice status
      invoice: {
        generated: proposal.invoiceGenerated,
        generatedAt: proposal.invoiceGeneratedAt,
        number: proposal.invoiceNumber,
      },

      // Payment status
      payment: {
        confirmed: proposal.paymentConfirmed,
        confirmedAt: proposal.paymentConfirmedAt,
        method: proposal.paymentMethod,
        reference: proposal.paymentReference,
      },

      // Account onboarding status
      accountOnboarding: {
        completed: proposal.accountOnboardingCompleted,
        completedAt: proposal.accountOnboardingCompletedAt,
        details: proposal.onboardingDetails,
      },

      // Manager review status
      review: {
        completed: proposal.managerReviewed,
        accountManager: proposal.accountManagerId,
        teamAllocated: proposal.teamAllocated,
        portalActivated: proposal.portalActivated,
      },

      // Timestamps
      createdAt: proposal.createdAt,
      expiresAt: proposal.expiresAt,
      viewedAt: proposal.viewedAt,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    )
  }
}
