import { NextResponse } from 'next/server'
import { generate2FASetup, is2FAEnabled } from '@/server/auth/two-factor'
import { check2FASetupRateLimit } from '@/server/security/rateLimit'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/auth/2fa/setup
 * Generate QR code and secret for 2FA setup
 */
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit 2FA setup attempts (3 per hour)
    const rateLimitResult = await check2FASetupRateLimit(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many setup attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          },
        }
      )
    }

    // Check if 2FA is already enabled
    const enabled = await is2FAEnabled(user.id)
    if (enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      )
    }

    const setup = await generate2FASetup(user.id)

    return NextResponse.json({
      qrCode: setup.qrCode,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
    })
  } catch (error) {
    console.error('Failed to generate 2FA setup:', error)
    return NextResponse.json(
      { error: 'Failed to generate 2FA setup' },
      { status: 500 }
    )
  }
})
