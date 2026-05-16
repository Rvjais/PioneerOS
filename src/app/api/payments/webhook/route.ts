import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import crypto from 'crypto'

// SECURITY: Verify Razorpay webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || signature.length === 0) return false
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  if (expectedSignature.length !== signature.length) return false
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  )
}

// Map Razorpay events to payment status updates
function getPaymentStatusFromEvent(event: string): string {
  const eventMap: Record<string, string> = {
    'payment.authorized': 'CONFIRMED',
    'payment.captured': 'CONFIRMED',
    'payment.failed': 'FAILED',
    'payment.refunded': 'REFUNDED',
  }
  return eventMap[event] || 'PENDING'
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.warn('[Webhook] Invalid signature received')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event

    const paymentEntity = payload.payload?.payment?.entity
    const orderId = paymentEntity?.order_id
    const paymentId = paymentEntity?.id

    if (!orderId) {
      return NextResponse.json({ received: true })
    }

    // Find the proposal linked to this Razorpay order
    const proposal = await prisma.clientProposal.findFirst({
      where: { razorpayOrderId: orderId },
      select: { id: true, clientId: true, paymentConfirmed: true, razorpayPaymentId: true, status: true },
    })

    if (!proposal) {
      console.warn(`[Webhook] No proposal found for order: ${orderId}`)
      return NextResponse.json({ received: true })
    }

    // Idempotency: skip if payment ID already recorded (already processed)
    if (proposal.razorpayPaymentId === paymentId && event !== 'payment.failed') {
      return NextResponse.json({ received: true })
    }

    // Prevent status overwrite: don't transition from CONFIRMED/PAID back to FAILED
    if (event === 'payment.failed' && (proposal.paymentConfirmed || proposal.razorpayPaymentId)) {
      console.warn(`[Webhook] Ignoring failed event for already-processed order: ${orderId}`)
      return NextResponse.json({ received: true })
    }

    // Update proposal with payment info
    await prisma.clientProposal.update({
      where: { id: proposal.id },
      data: {
        razorpayPaymentId: paymentId,
        ...(event === 'payment.authorized' || event === 'payment.captured'
          ? { paymentConfirmed: true, paymentConfirmedAt: new Date(), paymentReference: paymentId }
          : {}),
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}