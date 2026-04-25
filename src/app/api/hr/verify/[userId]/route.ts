import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const verifySchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Check if user has HR permissions

    const verifier = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!verifier || (!['SUPER_ADMIN', 'MANAGER', 'HR'].includes(verifier.role) && verifier.department !== 'HR')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { userId } = await routeParams!
    const raw = await req.json()
    const parsed = verifySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { action, reason } = parsed.data

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          profileCompletionStatus: 'VERIFIED',
          hrVerifiedBy: user.id,
          hrVerifiedAt: new Date(),
        },
      })

      // Create notification for the user
      await prisma.notification.create({
        data: {
          userId,
          type: 'GENERAL',
          title: 'Profile Verified',
          message: 'Your profile has been verified by HR. You now have full access to PioneerOS.',
          priority: 'HIGH',
        },
      })

      return NextResponse.json({ success: true, message: 'User verified successfully' })
    } else if (action === 'reject') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          profileCompletionStatus: 'INCOMPLETE',
          onboardingStep: 0,
        },
      })

      // Create notification for the user
      await prisma.notification.create({
        data: {
          userId,
          type: 'GENERAL',
          title: 'Profile Verification Rejected',
          message: `Your profile verification was rejected. Reason: ${reason}. Please update your profile and resubmit.`,
          priority: 'URGENT',
        },
      })

      return NextResponse.json({ success: true, message: 'User verification rejected' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('HR verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
