import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { hash } from 'bcryptjs'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'

const registerSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(8).regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

// POST: Register/set password for first-time user
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = await checkRateLimit(`password-register:${ip}`, {
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
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { phone, password } = parsed.data

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

    // Find user by phone
    const user = await prisma.user.findFirst({
      where: {
        phone: { in: phoneVariants },
        deletedAt: null,
        status: { in: ['ACTIVE', 'PROBATION'] },
      },
    })

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { error: 'No account found with this phone number. Please contact HR.' },
        { status: 404 }
      )
    }

    // Check if password already set
    if (user.password) {
      return NextResponse.json(
        { error: 'Password already set. Use forgot password if you need to reset it.' },
        { status: 400 }
      )
    }

    // Hash password and save
    const hashedPassword = await hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: 'Password set successfully. You can now log in with your phone and password.',
    })
  } catch (error) {
    console.error('Password registration error:', error)
    return NextResponse.json(
      { error: 'Failed to set password. Please try again.' },
      { status: 500 }
    )
  }
}
