import { NextRequest, NextResponse } from 'next/server'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { prisma } from '@/server/db/prisma'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'

const offlineRequestSchema = z.object({
  token: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP - 5 requests per 10 minutes
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const rateLimit = await checkRateLimit(`offline-payment:${ip}`, {
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 600) } }
      )
    }

    const raw = await req.json()
    const parsed = offlineRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { token } = parsed.data

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal || !proposal.clientId) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Update client to indicate waiting for offline payment
    await prisma.client.update({
      where: { id: proposal.clientId },
      data: {
        onboardingStatus: 'AWAITING_PAYMENT',
        accountsNotes: `Client requested offline payment on ${formatDateDDMMYYYY(new Date())}`,
      },
    })

    // Notify accounts team
    const accountsUsers = await prisma.user.findMany({
      where: {
        OR: [
          { department: 'ACCOUNTS' },
          { role: 'ACCOUNTS' },
        ],
        deletedAt: null,
      },
      select: { id: true }
    })

    if (accountsUsers.length > 0) {
      await prisma.notification.createMany({
        data: accountsUsers.map(user => ({
          userId: user.id,
          type: 'OFFLINE_PAYMENT_REQUEST',
          title: 'Offline Payment Requested',
          message: `${proposal.clientName || proposal.prospectName} has requested offline payment. Amount: Rs.${proposal.finalPrice || proposal.totalPrice}`,
          link: `/accounts/proposals/${proposal.id}`,
        }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to process offline request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
