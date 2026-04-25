import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { sendMagicLinkEmail } from '@/server/email/email'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'
import { checkRateLimit } from '@/server/security/rateLimit'
import crypto from 'crypto'

// Generate a secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Hash token for storage -- only store hash, never raw token
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function buildMagicLinkUrl(token: string): string {
  return `${APP_URL}/auth/magic?token=${token}`
}

function buildWhatsAppMagicLinkMessage(firstName: string, token: string): string {
  const magicLink = buildMagicLinkUrl(token)
  return `🔐 *Pioneer OS Login*

Hey ${firstName}!

Click the link below to sign in:
${magicLink}

⏰ This link expires in 30 minutes.

If you didn't request this, please ignore this message.`
}

function getMagicLinkErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('permission denied for schema public')) {
    return NextResponse.json(
      { error: 'Magic link is blocked because the database user cannot access schema public. Grant Postgres schema permissions to the app user and retry.' },
      { status: 503 }
    )
  }

  if (message.includes('Authentication failed against database server')) {
    return NextResponse.json(
      { error: 'Magic link is blocked because the database credentials are invalid. Update DATABASE_URL and retry.' },
      { status: 503 }
    )
  }

  if (message.includes("Can't reach database server")) {
    return NextResponse.json(
      { error: 'Magic link is blocked because the database server is unreachable. Check DATABASE_URL and database availability.' },
      { status: 503 }
    )
  }

  return NextResponse.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 }
  )
}

// POST: Send magic link
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP - 5 requests per 15 minutes
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = await checkRateLimit(`magic-link:${ip}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter || 900) }
        }
      )
    }

    const body = await request.json()
    const { identifier, channel = 'EMAIL' } = body

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email, phone, or Employee ID is required' },
        { status: 400 }
      )
    }

    // Normalize phone variants for lookup (users may enter 9XXXXXXXXX, +919XXXXXXXXX, or 919XXXXXXXXX)
    const phoneVariants: string[] = [identifier]
    const digits = identifier.replace(/\D/g, '') // strip non-digits
    if (digits.length === 10) {
      phoneVariants.push(`+91${digits}`, `91${digits}`)
    } else if (digits.length === 12 && digits.startsWith('91')) {
      phoneVariants.push(`+${digits}`, digits.slice(2))
    } else if (digits.length === 13 && digits.startsWith('91')) {
      phoneVariants.push(digits, `+${digits}`, digits.slice(2))
    }

    // Find user and delete existing tokens in parallel to save time
    const [user] = await Promise.all([
      prisma.user.findFirst({
        where: {
          deletedAt: null,
          OR: [
            { email: identifier },
            { phone: { in: phoneVariants } },
            { empId: identifier.toUpperCase() },
          ],
          status: { in: ['ACTIVE', 'PROBATION'] },
        },
      }),
      prisma.magicLinkToken.deleteMany({
        where: {
          user: {
            OR: [
              { email: identifier },
              { phone: { in: phoneVariants } },
              { empId: identifier.toUpperCase() },
            ],
          },
          usedAt: null,
        },
      })
    ])

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a login link has been sent.',
      })
    }

    // If EMAIL channel requested but user has no email, auto-fallback to WhatsApp
    let effectiveChannel = channel
    if (channel === 'EMAIL' && !user.email) {
      if (user.phone) {
        effectiveChannel = 'WHATSAPP' // Silently switch to WhatsApp
      } else {
        return NextResponse.json(
          { error: 'No email or phone on file. Please contact HR.' },
          { status: 400 }
        )
      }
    }

    // Existing tokens already deleted by Promise.all above


    // Opportunistic cleanup: purge expired/used tokens older than 24h (all users)
    // Non-blocking — don't await
    prisma.magicLinkToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null }, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    }).catch(() => { /* ignore cleanup failures */ })

    // Create new token -- store hash in DB, send raw token to user
    const token = generateToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    await prisma.magicLinkToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        channel: effectiveChannel,
        expiresAt,
      },
    })

    if (effectiveChannel === 'EMAIL' && user.email) {
      // Send email via Resend
      const result = await sendMagicLinkEmail({
        to: user.email,
        token,
        firstName: user.firstName,
      })

      if (!result.success) {
        console.error('Failed to send magic link email:', result.error)
        return NextResponse.json(
          { error: 'Failed to send login link. Please try again.' },
          { status: 500 }
        )
      }
    } else if (effectiveChannel === 'WHATSAPP') {
      const whatsappResult = await sendWhatsAppMessage({
        phone: user.phone,
        message: buildWhatsAppMagicLinkMessage(user.firstName, token),
      })

      if (whatsappResult.status !== 1) {
        console.error('Failed to send WhatsApp magic link:', whatsappResult.message)
        return NextResponse.json(
          { error: whatsappResult.message || 'Failed to send WhatsApp link. Please try email.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: effectiveChannel === 'EMAIL'
        ? `Login link sent to ${maskEmail(user.email!)}`
        : `Login link sent to ${maskPhone(user.phone)}`,
      channel: effectiveChannel,
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return getMagicLinkErrorResponse(error)
  }
}

// Helper to mask email
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const maskedLocal = local.substring(0, 2) + '***'
  return `${maskedLocal}@${domain}`
}

// Helper to mask phone
function maskPhone(phone: string): string {
  return phone.substring(0, 2) + '****' + phone.substring(phone.length - 4)
}
