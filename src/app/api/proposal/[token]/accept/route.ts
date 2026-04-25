import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/utils'
import { generateClientId, generateProformaNumber } from '@/server/db/sequence'
import { z } from 'zod'
import crypto from 'crypto'

const acceptProposalSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  clientCompany: z.string().optional(),
  clientGst: z.string().optional(),
  selectedServices: z.array(z.unknown()).optional(),
  selectedScope: z.array(z.unknown()).optional(),
})

type RouteParams = {
  params: Promise<{ token: string }>
}

// POST - Accept proposal and create client
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const raw = await req.json()
    const parsed = acceptProposalSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const {
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      clientGst,
      selectedServices,
      selectedScope,
    } = parsed.data

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Check if already accepted
    if (['ACCEPTED', 'CONVERTED'].includes(proposal.status)) {
      return NextResponse.json({
        error: 'This proposal has already been accepted',
        proposal: {
          status: proposal.status,
          acceptedAt: proposal.acceptedAt,
        },
      }, { status: 400 })
    }

    // Check if expired
    if (new Date(proposal.expiresAt) < new Date()) {
      return NextResponse.json({
        error: 'This proposal has expired',
        expired: true,
      }, { status: 410 })
    }

    // Calculate final price based on selected services
    const originalServices = safeJsonParse(proposal.services, []) as Array<{ isSelected: boolean; name: string; price: number }>
    const finalServices: Array<{ isSelected: boolean; name: string; price: number }> = (selectedServices as Array<{ isSelected: boolean; name: string; price: number }>) || originalServices
    const finalScope = selectedScope || safeJsonParse(proposal.scopeItems, [])

    const finalBasePrice: number = finalServices
      .filter((s) => s.isSelected)
      .reduce((sum: number, s) => sum + s.price, 0)

    const finalGstAmount = (finalBasePrice * proposal.gstPercentage) / 100
    const finalPrice = finalBasePrice + finalGstAmount

    // Generate client ID atomically (prevents race conditions)
    const clientId = await generateClientId()

    // Generate onboarding token
    const onboardingToken = `OB${crypto.randomUUID().replace(/-/g, '').substring(0, 20)}`

    // Generate proforma invoice number atomically (prevents race conditions)
    const invoiceNumber = await generateProformaNumber()

    // Create client in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create client
      const client = await tx.client.create({
        data: {
          clientCode: clientId,
          name: clientCompany || clientName,
          contactName: clientName,
          contactEmail: clientEmail,
          contactPhone: clientPhone,
          gstNumber: clientGst,
          status: 'ONBOARDING',
          onboardingStatus: 'AWAITING_PAYMENT',
          entityType: proposal.entityType,
          proposalId: proposal.id,
          onboardingToken,
          selectedServices: JSON.stringify(finalServices),
          monthlyFee: finalBasePrice as number,
          lifecycleStage: 'ONBOARDING',
        },
      })

      // Create client user for portal access
      await tx.clientUser.create({
        data: {
          clientId: client.id,
          email: clientEmail,
          name: clientName,
          phone: clientPhone,
          role: 'PRIMARY',
        },
      })

      // Create proforma invoice
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 15)

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          clientId: client.id,
          amount: finalBasePrice as number,
          tax: finalGstAmount,
          total: finalPrice,
          status: 'SENT',
          dueDate,
          entityType: proposal.entityType,
          isAdvance: true,
          items: JSON.stringify(
            finalServices
              .filter((s) => s.isSelected)
              .map((s) => ({
                description: s.name,
                amount: s.price,
              }))
          ),
          notes: `Generated from proposal acceptance. GST: ${proposal.gstPercentage}%`,
        },
      })

      // Update proposal
      await tx.clientProposal.update({
        where: { id: proposal.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          clientId: client.id,
          invoiceId: invoice.id,
          clientName,
          clientEmail,
          clientPhone,
          clientCompany,
          clientGst,
          selectedServices: JSON.stringify(finalServices),
          selectedScope: JSON.stringify(finalScope),
          finalPrice,
        },
      })

      // Create lifecycle event
      await tx.clientLifecycleEvent.create({
        data: {
          clientId: client.id,
          fromStage: 'LEAD',
          toStage: 'ONBOARDING',
          triggeredBy: 'PROPOSAL_ACCEPTED',
          notes: `Client accepted proposal. Invoice: ${invoiceNumber}`,
        },
      })

      // Notify accounts team
      const accountsUsers = await tx.user.findMany({
        where: {
          OR: [
            { role: 'ACCOUNTS' },
            { department: 'ACCOUNTS' },
          ]
        },
        select: { id: true }
      })

      if (accountsUsers.length > 0) {
        await tx.notification.createMany({
          data: accountsUsers.map(user => ({
            userId: user.id,
            type: 'PROPOSAL_ACCEPTED',
            title: 'Proposal Accepted',
            message: `${clientName} has accepted the proposal. Proforma Invoice ${invoiceNumber} generated.`,
            link: `/accounts/proposals/${proposal.id}`,
          }))
        })
      }

      return { client, invoice }
    })

    return NextResponse.json({
      success: true,
      message: 'Proposal accepted successfully',
      client: {
        id: result.client.id,
        name: result.client.name,
      },
      invoice: {
        id: result.invoice.id,
        number: result.invoice.invoiceNumber,
        total: result.invoice.total,
      },
      paymentUrl: `/proposal/${token}/payment`,
    })
  } catch (error) {
    console.error('Failed to accept proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
