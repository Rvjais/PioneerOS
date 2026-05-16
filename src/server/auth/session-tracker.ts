/**
 * Session Tracking Service
 *
 * Records login sessions with device and location information
 */

import prisma from '@/server/db/prisma'
import { UAParser } from 'ua-parser-js'
import crypto from 'crypto'

// In-memory geo cache
const geoCache = new Map<string, { data: GeoLocation; expiresAt: number }>()
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000
const GEO_CACHE_MAX_ENTRIES = 1000

function getCachedGeo(ip: string): GeoLocation | null {
  const entry = geoCache.get(ip)
  if (entry && entry.expiresAt > Date.now()) return entry.data
  geoCache.delete(ip)
  return null
}

function setCachedGeo(ip: string, data: GeoLocation): void {
  if (geoCache.size >= GEO_CACHE_MAX_ENTRIES) {
    for (const [key] of geoCache) { geoCache.delete(key); break }
  }
  geoCache.set(ip, { data, expiresAt: Date.now() + GEO_CACHE_TTL })
}

interface SessionInfo {
  userId: string
  userType?: 'EMPLOYEE' | 'CLIENT'
  ipAddress?: string
  userAgent?: string
  sessionToken?: string
}

interface GeoLocation {
  country?: string
  countryCode?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
  isp?: string
}

/**
 * Parse user agent string to extract device info
 */
function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  return {
    deviceType: getDeviceType(result.device.type, userAgent),
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || '',
  }
}

function getDeviceType(type: string | undefined, userAgent: string): string {
  if (type === 'mobile') return 'MOBILE'
  if (type === 'tablet') return 'TABLET'

  // Check user agent for mobile indicators
  const mobileRegex = /Mobile|Android|iPhone|iPad/i
  if (mobileRegex.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) return 'TABLET'
    return 'MOBILE'
  }

  return 'DESKTOP'
}

/**
 * Get geolocation from IP address using free API
 */
async function getGeoLocation(ipAddress: string): Promise<GeoLocation | null> {
  if (
    !ipAddress ||
    ipAddress === '127.0.0.1' ||
    ipAddress === '::1' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.')
  ) {
    return null
  }

  const cached = getCachedGeo(ipAddress)
  if (cached) return cached

  try {
    const response = await fetch(`https://ipwho.is/${ipAddress}`)
    if (!response.ok) return null

    const data = await response.json()
    if (data.success === false) return null

    const geo = {
      country: data.country,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone?.id,
      isp: data.connection?.isp,
    }

    setCachedGeo(ipAddress, geo)
    return geo
  } catch {
    return null
  }
}

/**
 * Check if this is a new device for the user
 */
async function isNewDevice(
  userId: string,
  deviceFingerprint: string
): Promise<boolean> {
  const existingSession = await prisma.loginSession.findFirst({
    where: {
      userId,
      deviceFingerprint,
    },
  })

  return !existingSession
}

/**
 * Generate a simple device fingerprint
 */
function generateDeviceFingerprint(
  userAgent: string,
  ipAddress: string
): string {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  // Create a simple fingerprint based on device characteristics
  const components = [
    result.browser.name,
    result.os.name,
    result.device.type || 'desktop',
  ].filter(Boolean)

  return components.join('-').toLowerCase().replace(/\s+/g, '-')
}

/**
 * Check if login is suspicious
 */
async function checkSuspicious(
  userId: string,
  ipAddress: string,
  country?: string
): Promise<{ isSuspicious: boolean; reason?: string }> {
  // Get recent successful logins
  const recentSessions = await prisma.loginSession.findMany({
    where: {
      userId,
      loginAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    orderBy: { loginAt: 'desc' },
    take: 10,
  })

  // Too many logins in short time
  if (recentSessions.length > 5) {
    return {
      isSuspicious: true,
      reason: 'Multiple login attempts in 24 hours',
    }
  }

  // Login from different country
  if (country && recentSessions.length > 0) {
    const previousCountry = recentSessions[0].country
    if (previousCountry && previousCountry !== country) {
      return {
        isSuspicious: true,
        reason: `Login from new country: ${country} (previously: ${previousCountry})`,
      }
    }
  }

  return { isSuspicious: false }
}

export interface RecordedSession {
  id: string
  sessionToken: string | null
  isSuspicious: boolean
  suspiciousReason: string | null
  isNewDevice: boolean
}

/**
 * Record a new login session
 */
export async function recordLoginSession(
  info: SessionInfo
): Promise<RecordedSession | null> {
  try {
    const { userId, userType = 'EMPLOYEE', ipAddress, userAgent } = info

    const deviceInfo = userAgent ? parseUserAgent(userAgent) : {}

    const deviceFingerprint = userAgent && ipAddress
      ? generateDeviceFingerprint(userAgent, ipAddress)
      : undefined

    const newDevice = deviceFingerprint
      ? await isNewDevice(userId, deviceFingerprint)
      : false

    const geo = ipAddress ? await getGeoLocation(ipAddress) : null
    const suspicious = await checkSuspicious(userId, ipAddress || '', geo?.country)

    const sessionToken = info.sessionToken || `session_${Date.now()}_${crypto.randomUUID()}`

    const session = await prisma.loginSession.create({
      data: {
        userId,
        userType,
        ipAddress,
        userAgent,
        ...deviceInfo,
        ...geo,
        sessionToken,
        isActive: true,
        loginAt: new Date(),
        lastActivityAt: new Date(),
        isNewDevice: newDevice,
        isSuspicious: suspicious.isSuspicious,
        suspiciousReason: suspicious.reason,
        deviceFingerprint,
      },
    })

    return {
      id: session.id,
      sessionToken: session.sessionToken,
      isSuspicious: session.isSuspicious,
      suspiciousReason: session.suspiciousReason,
      isNewDevice: session.isNewDevice,
    }
  } catch (error) {
    console.error('Failed to record login session:', error)
    return null
  }
}

/**
 * Update session activity
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await prisma.loginSession.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    })
  } catch (error) {
    console.error('Failed to update session activity:', error)
  }
}

/**
 * End a login session
 */
export async function endSession(sessionId: string): Promise<void> {
  try {
    await prisma.loginSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        logoutAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to end session:', error)
  }
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(userId: string) {
  return prisma.loginSession.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: { lastActivityAt: 'desc' },
    select: {
      id: true,
      deviceType: true,
      browser: true,
      os: true,
      country: true,
      city: true,
      loginAt: true,
      lastActivityAt: true,
      isNewDevice: true,
      isSuspicious: true,
    },
  })
}
