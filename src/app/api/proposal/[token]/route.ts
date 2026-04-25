import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/utils'

type RouteParams = {
  params: Promise<{ token: string }>
}

// GET - View proposal (public, no auth required)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Check if proposal has expired
    const isExpired = new Date(proposal.expiresAt) < new Date()
    if (isExpired && ['DRAFT', 'SENT', 'VIEWED'].includes(proposal.status)) {
      return NextResponse.json({
        error: 'This proposal has expired',
        expired: true,
        expiresAt: proposal.expiresAt,
      }, { status: 410 })
    }

    // Mark as viewed if first time viewing after being sent
    if (proposal.status === 'SENT' && !proposal.viewedAt) {
      await prisma.clientProposal.update({
        where: { id: proposal.id },
        data: {
          status: 'VIEWED',
          viewedAt: new Date(),
        },
      })
    }

    // Return proposal data (without sensitive fields)
    return NextResponse.json({
      proposal: {
        id: proposal.id,
        prospectName: proposal.prospectName,
        prospectEmail: proposal.prospectEmail,
        prospectPhone: proposal.prospectPhone,
        prospectCompany: proposal.prospectCompany,
        services: safeJsonParse(proposal.services, []),
        scopeItems: safeJsonParse(proposal.scopeItems, []),
        basePrice: proposal.basePrice,
        gstPercentage: proposal.gstPercentage,
        totalPrice: proposal.totalPrice,
        allowServiceModification: proposal.allowServiceModification,
        allowScopeModification: proposal.allowScopeModification,
        status: proposal.status,
        entityType: proposal.entityType,
        expiresAt: proposal.expiresAt,
        // If already accepted, return the client-selected data
        selectedServices: proposal.selectedServices ? safeJsonParse(proposal.selectedServices, null) : null,
        selectedScope: proposal.selectedScope ? safeJsonParse(proposal.selectedScope, null) : null,
        finalPrice: proposal.finalPrice,
        clientName: proposal.clientName,
        clientEmail: proposal.clientEmail,
        clientPhone: proposal.clientPhone,
        clientCompany: proposal.clientCompany,
        clientGst: proposal.clientGst,
        acceptedAt: proposal.acceptedAt,
      },
    })
  } catch (error) {
    console.error('Failed to fetch proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
