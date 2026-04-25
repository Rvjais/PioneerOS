import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'

// Schema for submitting payment info
const submitPaymentSchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'UPI', 'CHEQUE', 'RAZORPAY']),
  transactionReference: z.string().optional(), // UTR number, UPI ref, etc.
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
})

// POST: Submit payment information (Step 3 - awaiting manual confirmation)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Validate input
    const validation = submitPaymentSchema.safeParse(body)
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

    // Check if SLA is signed
    if (!proposal.slaAccepted) {
      return NextResponse.json(
        { error: 'Please sign the SLA first' },
        { status: 400 }
      )
    }

    // Check if payment is already confirmed
    if (proposal.paymentConfirmed) {
      return NextResponse.json({
        success: true,
        message: 'Payment already confirmed',
        currentStep: 4,
        paymentStatus: 'CONFIRMED',
      })
    }

    // Update proposal with payment info (awaiting manual confirmation)
    const updated = await prisma.clientProposal.update({
      where: { id: proposal.id },
      data: {
        paymentMethod: data.paymentMethod,
        paymentReference: data.transactionReference || null,
        status: 'AWAITING_PAYMENT',
        // Payment will be confirmed manually by accounts team
      },
    })

    // Create notification for accounts team
    const accountsUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ACCOUNTS' },
          { department: 'ACCOUNTS' },
          { role: 'SUPER_ADMIN' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    })

    if (accountsUsers.length > 0) {
      await prisma.notification.createMany({
        data: accountsUsers.map(user => ({
          userId: user.id,
          type: 'PAYMENT_RECEIVED',
          title: 'Payment Submitted - Awaiting Verification',
          message: `${proposal.clientName} has submitted payment info via ${data.paymentMethod}. Reference: ${data.transactionReference || 'Not provided'}. Please verify and confirm.`,
          link: `/accounts/onboarding/${proposal.id}`,
          priority: 'HIGH',
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment information submitted successfully. Our accounts team will verify and confirm your payment shortly.',
      currentStep: 3, // Stay on step 3 until payment is confirmed
      paymentStatus: 'PENDING_VERIFICATION',
      proposal: {
        id: updated.id,
        status: updated.status,
        paymentMethod: updated.paymentMethod,
        paymentReference: updated.paymentReference,
      },
    })
  } catch (error) {
    console.error('Error submitting payment:', error)
    return NextResponse.json(
      { error: 'Failed to submit payment information' },
      { status: 500 }
    )
  }
}

// GET: Check payment status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
      select: {
        id: true,
        paymentConfirmed: true,
        paymentConfirmedAt: true,
        paymentMethod: true,
        paymentReference: true,
        status: true,
        currentStep: true,
      },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Onboarding link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      paymentStatus: proposal.paymentConfirmed ? 'CONFIRMED' : 'PENDING',
      confirmed: proposal.paymentConfirmed,
      confirmedAt: proposal.paymentConfirmedAt,
      method: proposal.paymentMethod,
      reference: proposal.paymentReference,
      currentStep: proposal.paymentConfirmed ? 4 : 3,
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
