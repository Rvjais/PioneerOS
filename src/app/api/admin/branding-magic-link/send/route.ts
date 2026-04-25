import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import prisma from '@/server/db/prisma'
import crypto from 'crypto'
import { checkRateLimit } from '@/server/security/rateLimit'
import { logAdminAction } from '@/server/services/adminAudit'
import { sendAdminMagicLinkEmail } from '@/server/email/email'

// POST: Generate a magic link token and email it to the user with Branding Pioneers branding
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify SUPER_ADMIN or ADMIN role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!currentUser || !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Rate limit: 20 link generations per hour per admin
    const rateLimitResult = await checkRateLimit(`branding-magic-link:${session.user.id}`, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
    })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many link generations. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter || 60) } }
      )
    }

    const { userId, email } = await request.json()

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      )
    }

    // Find target user
    let targetUser = null
    let targetEmail = email

    if (userId) {
      targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          status: { in: ['ACTIVE', 'PROBATION'] },
          deletedAt: null,
        },
        select: {
          id: true,
          empId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          department: true,
        },
      })
      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found or inactive' },
          { status: 404 }
        )
      }
      targetEmail = targetUser.email
    } else {
      // Look up by email
      targetUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          status: { in: ['ACTIVE', 'PROBATION'] },
          deletedAt: null,
        },
        select: {
          id: true,
          empId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          department: true,
        },
      })
      if (!targetUser) {
        // Don't reveal if user exists
        return NextResponse.json({
          success: true,
          message: `Login link sent to ${maskEmail(email)}`,
        })
      }
      targetEmail = targetUser.email
    }

    // Delete old unused tokens for this user
    await prisma.magicLinkToken.deleteMany({
      where: {
        userId: targetUser!.id,
        usedAt: null,
      },
    })

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.magicLinkToken.create({
      data: {
        token: tokenHash,
        userId: targetUser!.id,
        channel: 'EMAIL',
        expiresAt,
      },
    })

    // Send email with Branding Pioneers branding
    const emailResult = await sendAdminMagicLinkEmail({
      to: targetEmail,
      token,
      firstName: targetUser!.firstName,
    })

    if (!emailResult.success) {
      console.error('Failed to send admin magic link email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send login link. Please try again.' },
        { status: 500 }
      )
    }

    // Audit log
    await logAdminAction({
      userId: session.user.id,
      action: 'GENERATE_BRANDING_MAGIC_LINK',
      title: 'Branding Magic Link generated',
      message: `Generated Branding Pioneers login link for ${targetUser!.firstName} ${targetUser!.lastName || ''} (${targetUser!.empId || targetUser!.id})`,
      link: `/admin/users/${targetUser!.id}`,
    })

    return NextResponse.json({
      success: true,
      message: `Login link sent to ${maskEmail(targetEmail)}`,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Branding magic link error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const maskedLocal = local.substring(0, 2) + '***'
  return `${maskedLocal}@${domain}`
}
