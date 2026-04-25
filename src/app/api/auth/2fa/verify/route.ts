import { NextRequest, NextResponse } from 'next/server'
import { verify2FASetup, verify2FAToken, is2FAEnabled } from '@/server/auth/two-factor'
import { check2FAVerifyRateLimit } from '@/server/security/rateLimit'
import { withAuth } from '@/server/auth/withAuth'

/**
 * POST /api/auth/2fa/verify
 * Verify TOTP token - used for both setup verification and login
 */
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Rate limit 2FA verification attempts (5 per 15 minutes)
    const rateLimitResult = await check2FAVerifyRateLimit(user.id)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many verification attempts. Please try again later.',
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

    const body = await req.json()
    const { token, mode = 'login' } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Validate token format (6 digits or 8-char backup code)
    const isValidFormat = /^\d{6}$/.test(token) || /^[A-Z0-9]{8}$/i.test(token)
    if (!isValidFormat) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      )
    }

    let result

    if (mode === 'setup') {
      // Verify during initial 2FA setup
      result = await verify2FASetup(user.id, token)
    } else {
      // Verify during login or re-authentication
      const enabled = await is2FAEnabled(user.id)
      if (!enabled) {
        return NextResponse.json(
          { error: '2FA is not enabled' },
          { status: 400 }
        )
      }
      result = await verify2FAToken(user.id, token)
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      usedBackupCode: result.usedBackupCode || false,
    })
  } catch (error) {
    console.error('Failed to verify 2FA token:', error)
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    )
  }
})
