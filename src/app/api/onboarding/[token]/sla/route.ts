import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { generateSLADocument } from '@/server/onboarding/sla-generator'
import { SERVICES } from '@/server/onboarding/constants'
import { generateProformaNumber } from '@/server/db/sequence'

// Schema for accepting SLA
const acceptSlaSchema = z.object({
  signerName: z.string().min(1, 'Signer name is required'),
  signerDesignation: z.string().optional(),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
})

// GET: Get SLA document content for review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Onboarding link not found' },
        { status: 404 }
      )
    }

    // Check if details are confirmed
    if (!proposal.clientName || !proposal.clientAddress) {
      return NextResponse.json(
        { error: 'Please confirm your details first' },
        { status: 400 }
      )
    }

    // Parse services
    let services: Array<{ serviceId: string }> = []
    try {
      services = JSON.parse(proposal.services || '[]')
    } catch {
      services = []
    }

    // If SLA was already generated and signed, return the stored version
    if (proposal.slaDocumentId) {
      const existingSla = await prisma.sLADocument.findUnique({
        where: { id: proposal.slaDocumentId },
      })
      if (existingSla) {
        return NextResponse.json({
          slaContent: {
            entityName: existingSla.entityName,
            entityAddress: existingSla.entityAddress,
            clientName: existingSla.clientName,
            clientAddress: existingSla.clientAddress,
            clientGst: existingSla.clientGstNumber,
            servicesScope: existingSla.servicesScope,
            monthlyRetainer: existingSla.monthlyRetainer,
            advanceAmount: existingSla.advanceAmount,
            contractDuration: existingSla.contractDuration,
            commencementDate: existingSla.commencementDate,
            paymentTerms: existingSla.paymentTerms,
          },
          proposal: {
            id: proposal.id,
            clientName: proposal.clientName,
            totalPrice: proposal.totalPrice,
            services: services.map(s => ({
              ...s,
              name: SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId,
            })),
          },
          alreadySigned: proposal.slaAccepted,
          signedAt: proposal.slaAcceptedAt,
          signerName: proposal.slaSignerName,
        })
      }
    }

    // Generate SLA content (only on first view before signing)
    const slaContent = generateSLADocument({
      entityType: proposal.entityType,
      clientCompany: proposal.clientName,
      clientAddress: `${proposal.clientAddress}, ${proposal.clientCity}, ${proposal.clientState} ${proposal.clientPincode || ''}`.trim(),
      clientGst: proposal.clientGst || '',
      effectiveDate: new Date(),
      contractDuration: proposal.contractDuration || '12_MONTHS',
      monthlyRetainer: proposal.basePrice,
      advanceAmount: proposal.advanceAmount || proposal.totalPrice,
      paymentTerms: proposal.paymentTerms || 'ADVANCE_100',
      selectedServices: services.map(s => s.serviceId),
    })

    return NextResponse.json({
      slaContent,
      proposal: {
        id: proposal.id,
        clientName: proposal.clientName,
        totalPrice: proposal.totalPrice,
        services: services.map(s => ({
          ...s,
          name: SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId,
        })),
      },
      alreadySigned: proposal.slaAccepted,
      signedAt: proposal.slaAcceptedAt,
      signerName: proposal.slaSignerName,
    })
  } catch (error) {
    console.error('Error generating SLA:', error)
    return NextResponse.json(
      { error: 'Failed to generate SLA document' },
      { status: 500 }
    )
  }
}

// POST: Accept/sign SLA (Step 2)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Validate input
    const validation = acceptSlaSchema.safeParse(body)
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

    // Check if details are confirmed
    if (!proposal.clientName || proposal.status === 'SENT' || proposal.status === 'VIEWED') {
      return NextResponse.json(
        { error: 'Please confirm your details first' },
        { status: 400 }
      )
    }

    // Check if already signed
    if (proposal.slaAccepted) {
      return NextResponse.json(
        { error: 'SLA has already been signed' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Parse services
    let services: Array<{ serviceId: string }> = []
    try {
      services = JSON.parse(proposal.services || '[]')
    } catch {
      services = []
    }

    // Create SLA document record (only if client exists)
    if (!proposal.clientId) {
      return NextResponse.json(
        { error: 'Client must be created before signing SLA' },
        { status: 400 }
      )
    }

    // Wrap SLA creation, invoice generation, and proposal update in a transaction
    const invoiceNumber = await generateProformaNumber()

    const { slaDoc, updated } = await prisma.$transaction(async (tx) => {
      const slaDoc = await tx.sLADocument.create({
        data: {
          clientId: proposal.clientId!,
          entityType: proposal.entityType,
          entityName: proposal.entityType === 'BRANDING_PIONEERS' ? 'Branding Pioneers' : 'ATZ Medappz',
          entityAddress: '750, Udyog Vihar, Third Floor, Gurgaon, Haryana',
          clientName: proposal.clientName || proposal.prospectName,
          clientAddress: `${proposal.clientAddress}, ${proposal.clientCity}, ${proposal.clientState}`,
          clientGstNumber: proposal.clientGst,
          servicesScope: services.map(s =>
            SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId
          ).join(', '),
          monthlyRetainer: proposal.basePrice,
          advanceAmount: proposal.advanceAmount,
          contractDuration: proposal.contractDuration || '12_MONTHS',
          commencementDate: now,
          paymentTerms: proposal.paymentTerms || 'ADVANCE_100',
          clientSignerName: data.signerName,
          clientSignedAt: now,
          status: 'SIGNED',
        },
      })

      // Update proposal
      const updated = await tx.clientProposal.update({
        where: { id: proposal.id },
        data: {
          slaAccepted: true,
          slaAcceptedAt: now,
          slaSignerName: data.signerName,
          slaSignerDesignation: data.signerDesignation || null,
          slaDocumentId: slaDoc.id,
          // Also generate invoice
          invoiceGenerated: true,
          invoiceGeneratedAt: now,
          invoiceNumber,
          status: 'SLA_SIGNED',
          currentStep: 3,
        },
      })

      return { slaDoc, updated }
    })

    return NextResponse.json({
      success: true,
      message: 'SLA accepted successfully. Invoice generated.',
      currentStep: 3,
      sla: {
        documentId: slaDoc.id,
        signedAt: now,
        signerName: data.signerName,
      },
      invoice: {
        number: invoiceNumber,
        amount: proposal.totalPrice,
        advanceAmount: proposal.advanceAmount || proposal.totalPrice,
      },
    })
  } catch (error) {
    console.error('Error accepting SLA:', error)
    return NextResponse.json(
      { error: 'Failed to accept SLA' },
      { status: 500 }
    )
  }
}
