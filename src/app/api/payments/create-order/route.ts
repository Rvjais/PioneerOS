import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getCredentialsWithFallback } from '@/server/api-credentials'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'

const createOrderSchema = z.object({
  token: z.string().min(1),
  amount: z.number().optional(),
})

// Lazy-load Razorpay to avoid build-time errors
interface RazorpayInstance {
  orders: {
    create: (options: {
      amount: number
      currency: string
      receipt: string
      notes: Record<string, string>
    }) => Promise<{ id: string; amount: number; currency: string }>
  }
}
let razorpayInstance: RazorpayInstance | null = null
let razorpayKeyId: string | null = null

const getRazorpay = async () => {
  if (!razorpayInstance) {
    const credentials = await getCredentialsWithFallback('RAZORPAY')
    const keyId = credentials.keyId || process.env.RAZORPAY_KEY_ID
    const keySecret = credentials.keySecret || process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured')
    }
    razorpayKeyId = keyId
    const Razorpay = require('razorpay')
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret })
  }
  return { instance: razorpayInstance, keyId: razorpayKeyId }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP - 10 payment orders per 5 minutes
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const rateLimit = await checkRateLimit(`payment-order:${ip}`, {
      maxRequests: 10,
      windowMs: 5 * 60 * 1000, // 5 minutes
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter || 300) }
        }
      )
    }

    const raw = await req.json()
    const parsed = createOrderSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { token, amount: clientAmount } = parsed.data

    // Verify Razorpay is configured
    let razorpay
    let keyId: string | null
    try {
      const result = await getRazorpay()
      razorpay = result.instance
      keyId = result.keyId
    } catch {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 })
    }

    // Verify proposal exists and is accepted
    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (!['ACCEPTED'].includes(proposal.status)) {
      return NextResponse.json({ error: 'Invalid proposal status' }, { status: 400 })
    }

    // SECURITY FIX: Get amount from proposal, not from client
    // Use finalPrice if set, otherwise use totalPrice
    const serverAmount = proposal.finalPrice || proposal.totalPrice

    // Optional: Validate client-provided amount matches server amount (for UX feedback)
    if (clientAmount && Math.abs(serverAmount - clientAmount) > 1) {
      return NextResponse.json({ error: 'Amount mismatch - please refresh the page' }, { status: 400 })
    }

    // Create Razorpay order with server-calculated amount
    const order = await razorpay.orders.create({
      amount: Math.round(serverAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `rcpt_${proposal.id}`,
      notes: {
        proposalId: proposal.id,
        clientId: proposal.clientId || '',
        invoiceId: proposal.invoiceId || '',
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
