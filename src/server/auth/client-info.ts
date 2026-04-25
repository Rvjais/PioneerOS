import { headers } from 'next/headers'

export interface ClientInfo {
  ip: string
  userAgent: string
  browser: string
  os: string
  deviceType: string
  country?: string
  city?: string
}

// Parse user agent string
export function parseUserAgent(ua: string): {
  browser: string
  os: string
  deviceType: string
} {
  let browser = 'Unknown'
  let os = 'Unknown'
  let deviceType = 'Desktop'

  if (ua.includes('Firefox/')) {
    browser = 'Firefox'
  } else if (ua.includes('Edg/')) {
    browser = 'Edge'
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome'
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari'
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera'
  }

  if (ua.includes('Windows')) {
    os = 'Windows'
    deviceType = 'Windows'
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS'
    deviceType = 'Mac'
  } else if (ua.includes('Linux')) {
    os = 'Linux'
    deviceType = 'Linux'
  } else if (ua.includes('Android')) {
    os = 'Android'
    deviceType = 'Android'
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS'
    deviceType = ua.includes('iPad') ? 'iPad' : 'iPhone'
  }

  return { browser, os, deviceType }
}

// Get client info from request headers
export async function getClientInfo(request: Request): Promise<ClientInfo> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')

  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'Unknown'
  const { browser, os, deviceType } = parseUserAgent(userAgent)

  return {
    ip,
    userAgent,
    browser,
    os,
    deviceType,
  }
}