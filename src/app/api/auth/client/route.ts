import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { randomBytes, createHash } from 'crypto'
import { sendCustomNotification } from '@/server/notifications'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'
import { hashSensitive } from '@/server/security/encryption'

const clientAuthSchema = z.object({
  email: z.string().email(),
  action: z.enum(['request-otp', 'verify-otp']),
  otp: z.string().optional(),
})

// Client login - Request OTP
export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP - 5 requests per 15 minutes
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const rateLimit = await checkRateLimit(`client-login:${ip}`, {
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

    const raw = await req.json()
    const parsed = clientAuthSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const body = parsed.data
    const { email, action } = body

    if (action === 'request-otp') {
      // Find client user
      const clientUser = await prisma.clientUser.findUnique({
        where: { email },
        include: { client: true },
      })

      // Don't reveal if user exists or not for security
      if (!clientUser || !clientUser.isActive) {
        return NextResponse.json({
          success: true,
          message: 'If an account exists, OTP has been sent to your registered phone',
        })
      }

      // Generate OTP and store hash (never store plaintext OTP)
      const otpCode = randomBytes(4).toString('hex').toUpperCase()
      const otpHash = createHash('sha256').update(otpCode).digest('hex')
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await prisma.clientUser.update({
        where: { id: clientUser.id },
        data: { otpCode: otpHash, otpExpiresAt, otpAttempts: 0 },
      })

      // Send OTP via WhatsApp if phone available
      if (clientUser.phone || clientUser.client.contactPhone) {
        const phone = clientUser.phone || clientUser.client.contactPhone || ''
        await sendCustomNotification(
          phone,
          `Your Pioneer OS login OTP is: ${otpCode}\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.`,
          { clientId: clientUser.clientId }
        )
      }
      // OTP sent via notification - no console logging for security

      return NextResponse.json({
        success: true,
        message: 'OTP sent to your registered phone',
      })
    }

    if (action === 'verify-otp') {
      const { otp } = body

      const clientUser = await prisma.clientUser.findUnique({
        where: { email },
        include: { client: true },
      })

      if (!clientUser) {
        // Don't reveal if user exists -- return generic error
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
      }

      if (!clientUser.otpCode || !clientUser.otpExpiresAt) {
        return NextResponse.json({ error: 'OTP not requested' }, { status: 400 })
      }

      if (new Date() > clientUser.otpExpiresAt) {
        await prisma.clientUser.update({
          where: { id: clientUser.id },
          data: { otpCode: null, otpExpiresAt: null },
        })
        return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 })
      }

      // Compare hash of submitted OTP against stored hash
      const submittedHash = createHash('sha256').update((otp || '').toUpperCase()).digest('hex')
      if (clientUser.otpCode !== submittedHash) {
        // Invalidate OTP after failed attempt
        await prisma.clientUser.update({
          where: { id: clientUser.id },
          data: { otpCode: null, otpExpiresAt: null },
        })
        return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
      }

      // Clear OTP, update last login, and set session expiry
      const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await prisma.clientUser.update({
        where: { id: clientUser.id },
        data: {
          otpCode: null,
          otpExpiresAt: null,
          lastLoginAt: new Date(),
          sessionExpiresAt,
        },
      })

      // Create session token -- store same value in DB and cookie
      const sessionToken = createHash('sha256')
        .update(`${clientUser.id}-${Date.now()}-${randomBytes(16).toString('hex')}`)
        .digest('hex')

      await prisma.clientUser.update({
        where: { id: clientUser.id },
        data: { sessionToken },
      })

      // Set session cookie with matching token
      const response = NextResponse.json({
        success: true,
        clientId: clientUser.clientId,
        clientUserId: clientUser.id,
        clientName: clientUser.client.name,
      })

      response.cookies.set('client_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      })

      return response
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Client auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
