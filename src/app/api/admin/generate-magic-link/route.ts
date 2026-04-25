import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import prisma from '@/server/db/prisma'
import crypto from 'crypto'
import { checkRateLimit } from '@/server/security/rateLimit'
import { logAdminAction } from '@/server/services/adminAudit'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify SUPER_ADMIN role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (currentUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Rate limit: 10 link generations per hour per admin
    const rateLimitResult = await checkRateLimit(`gen-magic-link:${session.user.id}`, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many link generations. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) } }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Verify target user exists and delete old tokens in parallel
    const [targetUser] = await Promise.all([
      prisma.user.findFirst({
        where: {
          id: userId,
          status: { in: ['ACTIVE', 'PROBATION'] },
          deletedAt: null,
        },
      }),
      prisma.magicLinkToken.deleteMany({
        where: {
          userId,
          usedAt: null,
        },
      })
    ])

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      )
    }

    // Existing tokens already deleted by Promise.all above


    // Generate new token -- store hash in DB, return raw token to admin
    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.magicLinkToken.create({
      data: {
        token: tokenHash,
        userId,
        channel: 'EMAIL',
        expiresAt,
      },
    })

    // Audit log for compliance
    await logAdminAction({
      userId: session.user.id,
      action: 'GENERATE_MAGIC_LINK',
      title: 'Magic link generated',
      message: `Generated login link for user ${targetUser.firstName} ${targetUser.lastName || ''} (${targetUser.empId || userId})`,
      link: `/admin/users/${userId}`,
    })

    return NextResponse.json({
      success: true,
      token, // Return raw token (not hash) -- admin sends this to user
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Generate magic link error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
