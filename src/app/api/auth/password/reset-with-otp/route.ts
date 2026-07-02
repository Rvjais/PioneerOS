import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { hash } from 'bcryptjs'
import { randomBytes, createHash } from 'crypto'
import { sendWhatsAppMessage, NotificationTemplates } from '@/server/notifications/wbiztool'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'

const requestOtpSchema = z.object({
  action: z.literal('request-otp'),
  phone: z.string().min(1),
})

const verifyOtpSchema = z.object({
  action: z.literal('verify-otp'),
  phone: z.string().min(1),
  otp: z.string().length(8),
})

const resetSchema = z.object({
  action: z.literal('reset'),
  resetToken: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    return digits.slice(0, 2) + '****' + digits.slice(-4)
  }
  return phone.slice(0, 2) + '****'
}

// POST /api/auth/password/reset-with-otp
// Actions: request-otp | verify-otp | reset
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || 'unknown'

    const raw = await request.json()
    const { action } = raw

    if (action === 'request-otp') {
      const rateLimit = await checkRateLimit(`forgot-password-otp:${ip}`, {
        maxRequests: 5, windowMs: 15 * 60 * 1000,
      })
      if (!rateLimit.success) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 900) } }
        )
      }

      const parsed = requestOtpSchema.safeParse(raw)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
      }
      const { phone } = parsed.data

      const digits = phone.replace(/\D/g, '')
      const phoneVariants: string[] = [phone]
      if (digits.length === 10) {
        phoneVariants.push(`+91${digits}`, `91${digits}`, digits)
      } else if (digits.length === 12 && digits.startsWith('91')) {
        phoneVariants.push(`+${digits}`, digits.slice(2))
      } else if (digits.length === 13 && digits.startsWith('91')) {
        phoneVariants.push(digits.slice(1), digits.slice(3))
      }

      const user = await prisma.user.findFirst({
        where: {
          phone: { in: phoneVariants },
          deletedAt: null,
          status: { in: ['ACTIVE', 'PROBATION'] },
        },
      })

      if (!user || !user.password) {
        return NextResponse.json({
          success: true,
          message: 'If an account exists, an OTP has been sent.',
        })
      }

      // Delete existing OTP tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, purpose: 'RESET_OTP' },
      })

      const otpCode = randomBytes(4).toString('hex').toUpperCase()
      const otpHash = hashToken(otpCode)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      await prisma.passwordResetToken.create({
        data: {
          token: otpHash,
          userId: user.id,
          channel: 'WHATSAPP',
          purpose: 'RESET_OTP',
          expiresAt,
        },
      })

      if (user.phone) {
        await sendWhatsAppMessage({
          phone: user.phone,
          message: NotificationTemplates.passwordResetOtp(user.firstName, otpCode),
        })
      }

      const masked = maskPhone(user.phone)

      return NextResponse.json({
        success: true,
        message: `OTP sent to ${masked}`,
        phone: user.phone,
        maskedPhone: masked,
      })
    }

    if (action === 'verify-otp') {
      const rateLimit = await checkRateLimit(`forgot-password-verify:${ip}`, {
        maxRequests: 10, windowMs: 15 * 60 * 1000,
      })
      if (!rateLimit.success) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 900) } }
        )
      }

      const parsed = verifyOtpSchema.safeParse(raw)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
      }
      const { phone, otp } = parsed.data

      const digits = phone.replace(/\D/g, '')
      const phoneVariants: string[] = [phone]
      if (digits.length === 10) {
        phoneVariants.push(`+91${digits}`, `91${digits}`, digits)
      } else if (digits.length === 12 && digits.startsWith('91')) {
        phoneVariants.push(`+${digits}`, digits.slice(2))
      } else if (digits.length === 13 && digits.startsWith('91')) {
        phoneVariants.push(digits.slice(1), digits.slice(3))
      }

      const user = await prisma.user.findFirst({
        where: {
          phone: { in: phoneVariants },
          deletedAt: null,
          status: { in: ['ACTIVE', 'PROBATION'] },
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }

      const otpHash = hashToken(otp.toUpperCase())

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: otpHash,
          userId: user.id,
          purpose: 'RESET_OTP',
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      })

      if (!resetToken) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
      }

      // Mark OTP as used and generate a verified reset token
      const verifiedResetToken = randomBytes(32).toString('hex')
      const verifiedResetHash = hashToken(verifiedResetToken)
      const verifiedExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min to set password

      await prisma.$transaction([
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        }),
        prisma.passwordResetToken.create({
          data: {
            token: verifiedResetHash,
            userId: user.id,
            channel: 'WHATSAPP',
            purpose: 'VERIFIED_RESET',
            expiresAt: verifiedExpiresAt,
          },
        }),
      ])

      return NextResponse.json({
        success: true,
        message: 'OTP verified. Please set your new password.',
        resetToken: verifiedResetToken,
      })
    }

    if (action === 'reset') {
      const rateLimit = await checkRateLimit(`password-reset:${ip}`, {
        maxRequests: 10, windowMs: 15 * 60 * 1000,
      })
      if (!rateLimit.success) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 900) } }
        )
      }

      const parsed = resetSchema.safeParse(raw)
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        )
      }
      const { resetToken, password } = parsed.data

      const tokenHash = hashToken(resetToken)
      const storedToken = await prisma.passwordResetToken.findUnique({
        where: { token: tokenHash },
        include: { user: true },
      })

      if (!storedToken) {
        return NextResponse.json(
          { error: 'Invalid reset session. Please start over.' },
          { status: 400 }
        )
      }

      if (new Date() > storedToken.expiresAt) {
        return NextResponse.json(
          { error: 'Reset session expired. Please request a new OTP.' },
          { status: 410 }
        )
      }

      if (storedToken.usedAt) {
        return NextResponse.json(
          { error: 'Reset session already used. Please request a new OTP.' },
          { status: 400 }
        )
      }

      if (!['ACTIVE', 'PROBATION'].includes(storedToken.user.status)) {
        return NextResponse.json(
          { error: 'Your account is not active. Please contact HR.' },
          { status: 403 }
        )
      }

      const hashedPassword = await hash(password, 12)

      await prisma.$transaction([
        prisma.user.update({
          where: { id: storedToken.userId },
          data: { password: hashedPassword },
        }),
        prisma.passwordResetToken.update({
          where: { id: storedToken.id },
          data: { usedAt: new Date() },
        }),
        // Clean up any remaining OTP tokens
        prisma.passwordResetToken.deleteMany({
          where: { userId: storedToken.userId, purpose: 'RESET_OTP' },
        }),
      ])

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Password reset with OTP error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
