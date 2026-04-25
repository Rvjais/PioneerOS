import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { checkRateLimit } from '@/server/security/rateLimit'

// Helper to parse user agent
function parseUserAgent(ua: string): {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  device: string
  deviceType: string
} {
  let browser = 'Unknown'
  let browserVersion = ''
  let os = 'Unknown'
  let osVersion = ''
  let device = 'Desktop'
  let deviceType = 'Unknown'

  // Detect browser
  if (ua.includes('Firefox/')) {
    browser = 'Firefox'
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || ''
  } else if (ua.includes('Edg/')) {
    browser = 'Edge'
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || ''
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome'
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || ''
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari'
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || ''
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera'
    browserVersion = ua.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || ''
  }

  // Detect OS
  if (ua.includes('Windows NT 10')) {
    os = 'Windows'
    osVersion = '10/11'
    deviceType = 'Windows'
  } else if (ua.includes('Windows')) {
    os = 'Windows'
    osVersion = ua.match(/Windows NT ([\d.]+)/)?.[1] || ''
    deviceType = 'Windows'
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS'
    osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || ''
    deviceType = 'Mac'
  } else if (ua.includes('Linux')) {
    os = 'Linux'
    deviceType = 'Linux'
  } else if (ua.includes('Android')) {
    os = 'Android'
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] || ''
    device = 'Mobile'
    deviceType = 'Android'
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS'
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || ''
    device = ua.includes('iPad') ? 'Tablet' : 'Mobile'
    deviceType = ua.includes('iPad') ? 'iPad' : 'iPhone'
  }

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    device = 'Mobile'
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    device = 'Tablet'
  }

  return { browser, browserVersion, os, osVersion, device, deviceType }
}

// POST - Log a successful login
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 5 login logs per minute per user
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

    // Get IP address
    let ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'Unknown'

    // Parse user agent
    const { browser, browserVersion, os, osVersion, device, deviceType } = parseUserAgent(userAgent)

    // Optional: Get geolocation from IP (if you have an IP geolocation API)
    let city: string | null = null
    let region: string | null = null
    let country: string | null = null
    let latitude: number | null = null
    let longitude: number | null = null
    let timezone: string | null = null
    let isp: string | null = null

    // Try to get geo data from ipwho.is (free HTTPS service)
    // Validate IP format before passing to external API
    const isValidIp = /^[\d.]+$/.test(ipAddress) || /^[a-f\d:]+$/i.test(ipAddress)
    if (isValidIp && ipAddress !== 'Unknown' && ipAddress !== '127.0.0.1' && !ipAddress.startsWith('192.168.') && !ipAddress.startsWith('10.')) {
      try {
        const geoResponse = await fetch(`https://ipwho.is/${ipAddress}`, {
          signal: AbortSignal.timeout(3000),
        })
        const geoData = await geoResponse.json()
        if (geoData.success !== false) {
          city = geoData.city
          region = geoData.region
          country = geoData.country
          latitude = geoData.latitude
          longitude = geoData.longitude
          timezone = geoData.timezone?.id || null
          isp = geoData.connection?.isp || null
        }
      } catch {
        // Silently fail geo lookup
      }
    }

    // Generate session token
    const sessionToken = `session_${Date.now()}_${crypto.randomUUID()}`

    // Check if this device/browser combination has been seen before for this user
    const previousSession = await prisma.loginSession.findFirst({
      where: {
        userId: session.user.id,
        browser,
        os,
        deviceType: device,
      },
      select: { id: true },
    })

    // Create login session
    const loginSession = await prisma.loginSession.create({
      data: {
        userId: session.user.id,
        ipAddress,
        userAgent,
        browser,
        browserVersion,
        os,
        osVersion,
        deviceType: device, // Map device to deviceType field
        city,
        region,
        country,
        latitude,
        longitude,
        timezone,
        isp,
        sessionToken,
        isActive: true,
        isNewDevice: !previousSession,
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: loginSession.id,
      sessionToken: loginSession.sessionToken
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

    // Only super admins can view all login logs
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where = userId ? { userId } : {}

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
