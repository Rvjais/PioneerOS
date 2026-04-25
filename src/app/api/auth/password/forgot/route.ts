import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { sendMagicLinkEmail } from '@/server/email/email'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'
import { checkRateLimit } from '@/server/security/rateLimit'
import crypto from 'crypto'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function buildResetLinkUrl(token: string): string {
  const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${APP_URL}/auth/reset-password?token=${token}`
}

function buildWhatsAppResetMessage(firstName: string, token: string): string {
  const resetLink = buildResetLinkUrl(token)
  return `🔑 *Pioneer OS Password Reset*

Hey ${firstName}!

Click the link below to reset your password:
${resetLink}

⏰ This link expires in 30 minutes.

If you didn't request this, please ignore this message.`
}

function maskPhone(phone: string): string {
  return phone.substring(0, 2) + '****' + phone.substring(phone.length - 4)
}

// POST: Send password reset link
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = await checkRateLimit(`forgot-password:${ip}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 900) } }
      )
    }

    const body = await request.json()
    const { phone, channel = 'WHATSAPP' } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Normalize phone variants
    const digits = phone.replace(/\D/g, '')
    const phoneVariants: string[] = [phone]
    if (digits.length === 10) {
      phoneVariants.push(`+91${digits}`, `91${digits}`)
    } else if (digits.length === 12 && digits.startsWith('91')) {
      phoneVariants.push(`+${digits}`, digits.slice(2))
    } else if (digits.length === 13 && digits.startsWith('91')) {
      phoneVariants.push(digits, `+${digits}`, digits.slice(2))
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        phone: { in: phoneVariants },
        deletedAt: null,
        status: { in: ['ACTIVE', 'PROBATION'] },
      },
    })

    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      })
    }

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      })
    }

    // Delete existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // Create new token
    const token = generateToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    await prisma.passwordResetToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        channel,
        purpose: 'RESET',
        expiresAt,
      },
    })

    // Send via selected channel
    if (channel === 'EMAIL' && user.email) {
      const result = await sendMagicLinkEmail({
        to: user.email,
        token,
        firstName: user.firstName,
      })

      // For reset, we need a custom template - reuse magic link email for now
      // Ideally create a separate password reset email template
      if (!result.success) {
        console.error('Failed to send reset email:', result.error)
        return NextResponse.json(
          { error: 'Failed to send reset link. Please try again.' },
          { status: 500 }
        )
      }
    } else if (channel === 'WHATSAPP' && user.phone) {
      const result = await sendWhatsAppMessage({
        phone: user.phone,
        message: buildWhatsAppResetMessage(user.firstName, token),
      })

      if (result.status !== 1) {
        console.error('Failed to send WhatsApp reset link:', result.message)
        return NextResponse.json(
          { error: result.message || 'Failed to send reset link. Please try again.' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'No email or phone on file. Please contact HR.' },
        { status: 400 }
      )
    }

    const masked = maskPhone(user.phone)

    return NextResponse.json({
      success: true,
      message: channel === 'EMAIL'
        ? `Password reset link sent to your email`
        : `Password reset link sent to ${masked}`,
      channel,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}