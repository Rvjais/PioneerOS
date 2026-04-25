import { NextRequest, NextResponse } from 'next/server'
import { regenerateBackupCodes, is2FAEnabled } from '@/server/auth/two-factor'
import { withAuth } from '@/server/auth/withAuth'

/**
 * POST /api/auth/2fa/backup-codes
 * Regenerate backup codes with password confirmation
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

    const result = await regenerateBackupCodes(user.id, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      backupCodes: result.backupCodes,
    })
  } catch (error) {
    console.error('Failed to regenerate backup codes:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate backup codes' },
      { status: 500 }
    )
  }
})
