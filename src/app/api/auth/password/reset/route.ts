import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { hash } from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

// POST: Reset password with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = resetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    // Hash the token to look up
    const tokenHash = hashToken(token)

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    // Check if already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: 'This reset link has already been used. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if user is active
    if (!['ACTIVE', 'PROBATION'].includes(resetToken.user.status)) {
      return NextResponse.json(
        { error: 'Your account is not active. Please contact HR.' },
        { status: 403 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update password and mark token as used atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}
