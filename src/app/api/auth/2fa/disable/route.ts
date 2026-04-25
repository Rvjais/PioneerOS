import { NextRequest, NextResponse } from 'next/server'
import { disable2FA, is2FAEnabled } from '@/server/auth/two-factor'
import { withAuth } from '@/server/auth/withAuth'

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA with password confirmation
 */
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Check if 2FA is enabled
    const enabled = await is2FAEnabled(user.id)
    if (!enabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    const result = await disable2FA(user.id, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to disable 2FA:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
})
