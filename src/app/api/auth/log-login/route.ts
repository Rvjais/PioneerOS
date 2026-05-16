import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/server/security/rateLimit'
import { recordLoginSession } from '@/server/auth/session-tracker'

// POST - Log a successful login
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitResult = await checkRateLimit(`log-login:${session.user.id}`, {
      maxRequests: 5,
      windowMs: 60 * 1000,
    })
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'Unknown'

    const recorded = await recordLoginSession({
      userId: session.user.id,
      userType: 'EMPLOYEE',
      ipAddress,
      userAgent,
    })

    if (!recorded) {
      return NextResponse.json({ error: 'Failed to log login' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessionId: recorded.id,
      sessionToken: recorded.sessionToken,
      isSuspicious: recorded.isSuspicious,
      suspiciousReason: recorded.suspiciousReason,
      isNewDevice: recorded.isNewDevice,
    })
  } catch (error) {
    console.error('Failed to log login:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Fetch login logs (Super Admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where = userId ? { userId } : {}

    const { prisma } = await import('@/server/db/prisma')

    const [logs, total] = await Promise.all([
      prisma.loginSession.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              empId: true,
              firstName: true,
              lastName: true,
              department: true,
              role: true,
            },
          },
        },
        orderBy: { loginAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.loginSession.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch login logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
