import { NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

/**
 * GET /api/auth/2fa/status
 * Get current 2FA status for the authenticated user
 */
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      enabled: dbUser.twoFactorEnabled,
      enabledAt: dbUser.twoFactorVerifiedAt,
    })
  } catch (error) {
    console.error('Failed to get 2FA status:', error)
    return NextResponse.json(
      { error: 'Failed to get 2FA status' },
      { status: 500 }
    )
  }
})
