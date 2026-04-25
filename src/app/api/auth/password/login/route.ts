import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { compare } from 'bcryptjs'
import { checkRateLimit } from '@/server/security/rateLimit'
import { z } from 'zod'

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
})

// Safe JSON parse utility
const safeJsonParse = <T,>(json: string | null, defaultValue: T): T => {
  if (!json) return defaultValue
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : defaultValue
  } catch {
    return defaultValue
  }
}

// POST: Login with phone and password
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = await checkRateLimit(`password-login:${ip}`, {
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
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
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
      include: {
        profile: true,
        customRoles: {
          include: { customRole: true }
        }
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user has password set
    if (!user.password) {
      return NextResponse.json(
        { error: 'No password set. Please set your password first.' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Parse custom roles safely
    const customRoles = user.customRoles
      .filter(ucr => ucr.customRole.isActive)
      .map(ucr => ({
        id: ucr.customRole.id,
        name: ucr.customRole.name,
        displayName: ucr.customRole.displayName,
        baseRoles: safeJsonParse<string[]>(ucr.customRole.baseRoles, []),
        departments: safeJsonParse<string[]>(ucr.customRole.departments, []),
        permissions: safeJsonParse<Record<string, boolean> | null>(ucr.customRole.permissions, null),
      }))

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        empId: user.empId,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        department: user.department,
        ndaSigned: user.profile?.ndaSigned ?? false,
        profileCompletionStatus: user.profileCompletionStatus,
        profilePicture: user.profile?.profilePicture ?? null,
        customRoles,
      },
    })
  } catch (error) {
    console.error('Password login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}