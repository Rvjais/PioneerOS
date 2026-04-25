import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import crypto from 'crypto'
import { getCredentialsWithFallback } from '@/server/api-credentials'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'

const verifyPaymentSchema = z.object({
  token: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP - 20 verifications per 5 minutes
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const rateLimit = await checkRateLimit(`payment-verify:${ip}`, {
      maxRequests: 20,
      windowMs: 5 * 60 * 1000,
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 300) } }
      )
    }

    const raw = await req.json()
    const parsed = verifyPaymentSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { token, razorpay_payment_id, razorpay_order_id, razorpay_signature } = parsed.data

    // Get Razorpay credentials from database with .env fallback
    const credentials = await getCredentialsWithFallback('RAZORPAY')
    const secret = credentials.keySecret || process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not configured')
      return NextResponse.json({ error: 'Payment verification not configured' }, { status: 503 })
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Get proposal
    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal || !proposal.clientId) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Idempotency: if payment was already confirmed, return success without re-processing
    if (proposal.status === 'CONVERTED') {
      return NextResponse.json({ success: true, message: 'Payment already verified' })
    }

    // Check for duplicate payment ID to prevent double-processing
    const existingLedger = await prisma.clientLedger.findFirst({
      where: { referenceId: razorpay_payment_id },
    })
    if (existingLedger) {
      return NextResponse.json({ success: true, message: 'Payment already processed' })
    }

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update invoice status
      if (proposal.invoiceId) {
        await tx.invoice.update({
          where: { id: proposal.invoiceId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        })
      }

      // Update client
      await tx.client.update({
        where: { id: proposal.clientId! },
        data: {
          status: 'ONBOARDING',
          onboardingStatus: 'IN_PROGRESS',
          paymentConfirmedAt: new Date(),
          initialPaymentConfirmed: true,
          initialPaymentDate: new Date(),
          ledgerStartedAt: new Date(),
        },
      })

      // Update proposal
      await tx.clientProposal.update({
        where: { id: proposal.id },
        data: { status: 'CONVERTED' },
      })

      // Calculate correct balance from previous ledger entries
      const lastLedgerEntry = await tx.clientLedger.findFirst({
        where: { clientId: proposal.clientId! },
        orderBy: { createdAt: 'desc' },
        select: { balance: true },
      })

      const paymentAmount = proposal.finalPrice || proposal.totalPrice
      const previousBalance = lastLedgerEntry?.balance ?? 0
      // Credit reduces the balance owed (or increases credit balance)
      const newBalance = previousBalance - paymentAmount

      // Create ledger entry with calculated balance
      await tx.clientLedger.create({
        data: {
          clientId: proposal.clientId!,
          type: 'CREDIT',
          category: 'PAYMENT',
          description: `Online payment received - Razorpay ${razorpay_payment_id}`,
          amount: paymentAmount,
          balance: newBalance,
          referenceId: razorpay_payment_id,
          recordedBy: 'SYSTEM',
        },
      })

      // Create onboarding checklist with scope data
      await tx.clientOnboardingChecklist.create({
        data: {
          clientId: proposal.clientId!,
          selectedServices: proposal.selectedServices,
          scopeItems: proposal.selectedScope,
          invoicePaid: true,
          invoicePaidAt: new Date(),
          status: 'PENDING',
        },
      })

      // Create lifecycle event
      await tx.clientLifecycleEvent.create({
        data: {
          clientId: proposal.clientId!,
          fromStage: 'ONBOARDING',
          toStage: 'ACTIVE',
          triggeredBy: 'PAYMENT_RECEIVED',
          notes: `Payment received via Razorpay. Amount: Rs.${proposal.finalPrice || proposal.totalPrice}`,
        },
      })

      // Notify operations team
      const opsUsers = await tx.user.findMany({
        where: {
          OR: [
            { department: 'OPERATIONS' },
            { role: 'MANAGER' },
          ]
        },
        select: { id: true }
      })

      if (opsUsers.length > 0) {
        await tx.notification.createMany({
          data: opsUsers.map(user => ({
            userId: user.id,
            type: 'NEW_CLIENT_ONBOARDING',
            title: 'New Client Ready for Onboarding',
            message: `${proposal.clientName || proposal.prospectName} has completed payment. Ready for onboarding.`,
            link: `/operations/onboarding/${proposal.clientId}`,
          }))
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
