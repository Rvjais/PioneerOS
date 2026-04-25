/**
 * Client Portal Authentication & Session Management
 *
 * Consolidated module for client portal auth. Provides:
 * - validateClientPortalSession() — for API routes needing full user details
 * - getClientSession() — for Server Components
 * - validateClientSession() — for API routes needing lightweight session
 * - clearClientPortalSession() — logout
 *
 * Previously split across clientPortalAuth.ts and clientSession.ts.
 */

import { cookies } from 'next/headers'
import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'

// ============================================
// TYPES
// ============================================

export interface ClientPortalUser {
  id: string
  email: string
  name: string
  role: string
  clientId: string
  hasMarketingAccess: boolean
  hasWebsiteAccess: boolean
  client: {
    id: string
    name: string
    startDate: Date | null
    endDate: Date | null
    monthlyFee: number | null
    pendingAmount: number | null
  }
}

export type ClientPortalAuthResult =
  | { success: true; user: ClientPortalUser }
  | { success: false; error: NextResponse }

export type ClientSession = {
  clientId: string
  clientUserId: string
  clientName: string
  email: string
}

// ============================================
// SHARED HELPERS
// ============================================

/**
 * Parse session token from a raw cookie header string.
 */
function parseSessionTokenFromHeader(cookieHeader: string): string | undefined {
  if (!cookieHeader) return undefined

  for (const pair of cookieHeader.split(';')) {
    const trimmed = pair.trim()
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim()
      if (key !== 'client_session') continue
      const value = trimmed.substring(eqIdx + 1).trim()
      try {
        return decodeURIComponent(value.replace(/^"|"$/g, ''))
      } catch {
        return value.replace(/^"|"$/g, '')
      }
    }
  }
  return undefined
}

/**
 * Check whether a client user record represents a valid active session.
 */
function isSessionValid(clientUser: { isActive: boolean; sessionExpiresAt: Date | null }): boolean {
  if (!clientUser.isActive) return false
  if (clientUser.sessionExpiresAt && clientUser.sessionExpiresAt < new Date()) return false
  return true
}

// ============================================
// FULL PORTAL AUTH (rich user object + error responses)
// ============================================

/**
 * Validate client portal session from cookie.
 * Returns a detailed ClientPortalUser or an error NextResponse.
 * Best for API routes that need full user details + permissions.
 */
export async function validateClientPortalSession(): Promise<ClientPortalAuthResult> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('client_session')?.value

  if (!sessionToken) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const clientUser = await prisma.clientUser.findUnique({
    where: { sessionToken },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          monthlyFee: true,
          pendingAmount: true,
        },
      },
    },
  })

  if (!clientUser) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Invalid session' }, { status: 401 }),
    }
  }

  if (!clientUser.isActive) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Account is inactive' }, { status: 403 }),
    }
  }

  if (clientUser.sessionExpiresAt && clientUser.sessionExpiresAt < new Date()) {
    return {
      success: false,
      error: NextResponse.json({ error: 'Session expired' }, { status: 401 }),
    }
  }

  return {
    success: true,
    user: {
      id: clientUser.id,
      email: clientUser.email,
      name: clientUser.name,
      role: clientUser.role,
      clientId: clientUser.clientId,
      hasMarketingAccess: clientUser.hasMarketingAccess,
      hasWebsiteAccess: clientUser.hasWebsiteAccess,
      client: clientUser.client,
    },
  }
}

// ============================================
// LIGHTWEIGHT SESSION (for Server Components & simple API checks)
// ============================================

/**
 * Get client session from cookie.
 * For use in Server Components and Server Actions.
 */
export async function getClientSession(): Promise<ClientSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('client_session')?.value

    if (!sessionToken) return null

    const clientUser = await prisma.clientUser.findUnique({
      where: { sessionToken },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    if (!clientUser || !isSessionValid(clientUser)) return null

    return {
      clientId: clientUser.clientId,
      clientUserId: clientUser.id,
      clientName: clientUser.client.name,
      email: clientUser.email,
    }
  } catch (error) {
    console.error('Error getting client session:', error)
    return null
  }
}

/**
 * Validate client session from raw Request object.
 * For use in API routes that need lightweight session data.
 */
export async function validateClientSession(request: Request): Promise<ClientSession | null> {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionToken = parseSessionTokenFromHeader(cookieHeader)

    if (!sessionToken) return null

    const clientUser = await prisma.clientUser.findUnique({
      where: { sessionToken },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    if (!clientUser || !isSessionValid(clientUser)) return null

    return {
      clientId: clientUser.clientId,
      clientUserId: clientUser.id,
      clientName: clientUser.client.name,
      email: clientUser.email,
    }
  } catch (error) {
    console.error('Error validating client session:', error)
    return null
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Clear client portal session (logout).
 */
export async function clearClientPortalSession(userId: string): Promise<void> {
  await prisma.clientUser.update({
    where: { id: userId },
    data: {
      sessionToken: null,
      sessionExpiresAt: null,
    },
  })

  const cookieStore = await cookies()
  cookieStore.delete('client_session')
}
