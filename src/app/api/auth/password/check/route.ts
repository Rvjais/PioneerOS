import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'

const checkSchema = z.object({
  phone: z.string().min(10),
})

// POST: Check if user exists and needs password setup
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = await checkRateLimit(`password-check:${ip}`, {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 900) } }
      )
    }

    const body = await request.json()
    const parsed = checkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    const { phone } = parsed.data

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
      select: {
        id: true,
        firstName: true,
        password: true,
      },
    })

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { error: 'No account found with this phone number. Please contact HR.' },
        { status: 404 }
      )
    }

    if (user.password) {
      return NextResponse.json(
        { error: 'Password already set. Please use login with your existing password.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      firstName: user.firstName,
    })
  } catch (error) {
    console.error('Password check error:', error)
    return NextResponse.json(
      { error: 'Failed to verify account. Please try again.' },
      { status: 500 }
    )
  }
}