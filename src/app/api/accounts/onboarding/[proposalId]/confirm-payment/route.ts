import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { generateInvoiceNumber } from '@/server/db/sequence'
import { withAuth } from '@/server/auth/withAuth'

// Schema for confirming payment
const confirmPaymentSchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'UPI', 'CHEQUE', 'RAZORPAY', 'CASH']),
  transactionReference: z.string().min(1, 'Transaction reference is required'),
  paymentDate: z.string().optional(),
  amountReceived: z.number().optional(),
  notes: z.string().optional(),
})

// POST: Confirm payment (accounts team only)
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Check permissions (Accounts or Admin)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true, firstName: true, lastName: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS']
    const allowedDepartments = ['ACCOUNTS', 'MANAGEMENT']

    if (!allowedRoles.includes(dbUser.role) && !allowedDepartments.includes(dbUser.department || '')) {
      return NextResponse.json({ error: 'Only accounts team can confirm payments' }, { status: 403 })
    }

    const { proposalId } = await routeParams!
    const body = await req.json()

    // Validate input
    const validation = confirmPaymentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Find proposal
    const proposal = await prisma.clientProposal.findUnique({
      where: { id: proposalId },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Check if SLA is signed
    if (!proposal.slaAccepted) {
      return NextResponse.json(
        { error: 'SLA must be signed before confirming payment' },
        { status: 400 }
      )
    }

    // Check if already confirmed
    if (proposal.paymentConfirmed) {
      return NextResponse.json({
        success: true,
        message: 'Payment already confirmed',
        proposal: {
          id: proposal.id,
          paymentConfirmed: true,
          paymentConfirmedAt: proposal.paymentConfirmedAt,
        },
      })
    }

    const now = new Date()
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : now

    // Generate invoice number if needed
    let invoiceNumber = proposal.invoiceNumber
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber()
    }

    // Update proposal
    const updated = await prisma.clientProposal.update({
      where: { id: proposalId },
      data: {
        paymentConfirmed: true,
        paymentConfirmedAt: now,
        paymentConfirmedBy: user.id,
        paymentMethod: data.paymentMethod,
        paymentReference: data.transactionReference,
        invoiceNumber,
        invoiceGenerated: true,
        invoiceGeneratedAt: now,
        status: 'PAYMENT_CONFIRMED',
        currentStep: 4,
      },
    })

    // Create payment collection record if client exists
    const expectedAmount = proposal.advanceAmount || proposal.totalPrice
    const paymentAmount = data.amountReceived || expectedAmount
    const amountMismatch = data.amountReceived && Math.abs(data.amountReceived - expectedAmount) > 100
    const { calculateTDS, TAX_CONFIG } = await import('@/shared/constants/config/accounts')
    const tdsAmount = calculateTDS(paymentAmount)
    const netAmount = paymentAmount - tdsAmount

    if (proposal.clientId) {
      await prisma.paymentCollection.create({
        data: {
          clientId: proposal.clientId,
          grossAmount: paymentAmount,
          tdsDeducted: tdsAmount,
          tdsPercentage: TAX_CONFIG.TDS_DEFAULT_PERCENTAGE,
          gstAmount: 0, // GST already included in gross
          netAmount,
          collectedAt: paymentDate,
          collectedBy: user.id,
          paymentMethod: data.paymentMethod,
          transactionRef: data.transactionReference,
          notes: data.notes || `Payment for onboarding - ${proposal.prospectName}`,
          status: 'CONFIRMED',
        },
      })
    }

    // Notify client (if email exists)
    if (proposal.clientEmail || proposal.prospectEmail) {
      // Create notification for client
      if (proposal.clientId) {
        await prisma.portalNotification.create({
          data: {
            clientId: proposal.clientId,
            title: 'Payment Confirmed',
            message: 'Your payment has been confirmed. Please complete the account onboarding form to proceed.',
            type: 'ACTION_REQUIRED',
            category: 'PAYMENT',
            actionUrl: `/onboarding/${proposal.token}`,
            actionLabel: 'Complete Onboarding',
            sourceType: 'SYSTEM',
            sourceId: proposalId,
          },
        })
      }
    }

    // Notify managers
    const managers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' },
          { role: 'ADMIN' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    })

    if (managers.length > 0) {
      await prisma.notification.createMany({
        data: managers.map(manager => ({
          userId: manager.id,
          type: 'PAYMENT_CONFIRMED',
          title: 'Payment Confirmed',
          message: `Payment confirmed for ${proposal.prospectName} by ${dbUser.firstName}${dbUser.lastName ? ' ' + dbUser.lastName : ''}. Awaiting account onboarding.`,
          link: `/accounts/onboarding/${proposalId}`,
          priority: 'MEDIUM',
        })),
      })
    }

    // Sync to onboarding checklist
    if (updated.clientId) {
      const { syncProposalToChecklist } = await import('@/server/onboarding/syncChecklist')
      await syncProposalToChecklist({
        clientId: updated.clientId,
        slaAccepted: updated.slaAccepted,
        paymentConfirmed: true,
        accountOnboardingCompleted: updated.accountOnboardingCompleted,
        portalActivated: updated.portalActivated,
        accountManagerId: updated.accountManagerId,
        teamAllocated: updated.teamAllocated,
        accountOnboardingData: updated.accountOnboardingData,
      }).catch(err => console.error('Checklist sync failed:', err))
    }

    return NextResponse.json({
      success: true,
      message: amountMismatch
        ? `Payment confirmed. Warning: Amount received (₹${paymentAmount.toLocaleString()}) differs from expected (₹${expectedAmount.toLocaleString()})`
        : 'Payment confirmed successfully',
      amountMismatch,
      proposal: {
        id: updated.id,
        paymentConfirmed: true,
        paymentConfirmedAt: now,
        invoiceNumber,
        currentStep: 4,
      },
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
})
