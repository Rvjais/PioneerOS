import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { SERVICES, ENTITY_TYPES } from '@/server/onboarding/constants'
import { withAuth } from '@/server/auth/withAuth'

// GET: Get single proposal details (internal)
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { proposalId } = await routeParams!

    const proposal = await prisma.clientProposal.findUnique({
      where: { id: proposalId },
      include: {
        onboardingDetails: true,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
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

    // Parse onboarding details JSON fields
    let parsedOnboardingDetails: Record<string, unknown> | null = null
    if (proposal.onboardingDetails) {
      const details = proposal.onboardingDetails
      parsedOnboardingDetails = {
        ...details,
        seoDetails: details.seoDetails ? JSON.parse(details.seoDetails) : null,
        socialDetails: details.socialDetails ? JSON.parse(details.socialDetails) : null,
        adsDetails: details.adsDetails ? JSON.parse(details.adsDetails) : null,
        webDetails: details.webDetails ? JSON.parse(details.webDetails) : null,
        gbpDetails: details.gbpDetails ? JSON.parse(details.gbpDetails) : null,
      }
    }

    // Generate URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const onboardingUrl = `${baseUrl}/onboarding/${proposal.token}`

    return NextResponse.json({
      proposal: {
        ...proposal,
        onboardingDetails: parsedOnboardingDetails,
        services,
        serviceNames: services.map((s: { serviceId: string }) =>
          SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId
        ),
        entity,
        url: onboardingUrl,
      },
    })
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposal' },
      { status: 500 }
    )
  }
})

// DELETE: Cancel/delete proposal (only if not yet accepted)
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { proposalId } = await routeParams!

    const proposal = await prisma.clientProposal.findUnique({
      where: { id: proposalId },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Cannot delete if SLA is signed
    if (proposal.slaAccepted) {
      return NextResponse.json(
        { error: 'Cannot delete proposal after SLA has been signed' },
        { status: 400 }
      )
    }

    await prisma.clientProposal.delete({
      where: { id: proposalId },
    })

    return NextResponse.json({
      success: true,
      message: 'Proposal deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting proposal:', error)
    return NextResponse.json(
      { error: 'Failed to delete proposal' },
      { status: 500 }
    )
  }
})
