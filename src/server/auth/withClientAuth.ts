/**
 * Client Portal API Route Wrapper
 *
 * Eliminates duplicated session validation across all 42+ client portal API routes.
 * Provides:
 * - Automatic session validation
 * - Rate limiting (configurable per-route)
 * - Consistent error responses
 * - IP extraction for rate limit keys
 *
 * Usage:
 *   export const GET = withClientAuth(async (req, { user }) => {
 *     return NextResponse.json({ data: ... })
 *   })
 *
 *   // With options:
 *   export const POST = withClientAuth(async (req, { user }) => { ... }, {
 *     requiredRole: 'PRIMARY',
 *     requireWebAccess: true,
 *     rateLimit: 'WRITE',
 *   })
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateClientPortalSession, type ClientPortalUser } from '@/server/auth/clientAuth'
import { checkRateLimit, type RateLimitResult } from '@/server/security/rateLimit'
import { RATE_LIMITS } from '@/shared/constants/clientPortalConstants'

// ============================================
// TYPES
// ============================================

export interface AuthContext {
  /** Authenticated client portal user */
  user: ClientPortalUser
}

export type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthContext,
  routeContext?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>

export interface WithClientAuthOptions {
  /** Require a specific role (e.g. 'PRIMARY') */
  requiredRole?: string
  /** Require website access flag */
  requireWebAccess?: boolean
  /** Require marketing access flag */
  requireMarketingAccess?: boolean
  /** Rate limit tier: 'AUTH' | 'WRITE' | 'READ' | 'SENSITIVE' or custom config */
  rateLimit?: keyof typeof RATE_LIMITS | { maxRequests: number; windowMs: number }
  /** Custom rate limit key prefix (defaults to route path) */
  rateLimitKeyPrefix?: string
}

// ============================================
// HELPERS
// ============================================

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      },
    }
  )
}

// ============================================
// WRAPPER
// ============================================

export function withClientAuth(
  handler: AuthenticatedHandler,
  options: WithClientAuthOptions = {}
) {
  return async (request: NextRequest, routeContext?: { params: Promise<Record<string, string>> }) => {
    try {
      // --- Rate limiting (before auth to protect against brute-force) ---
      if (options.rateLimit) {
        const config =
          typeof options.rateLimit === 'string'
            ? RATE_LIMITS[options.rateLimit]
            : options.rateLimit

        const ip = getClientIP(request)
        const prefix = options.rateLimitKeyPrefix || request.nextUrl.pathname
        const rateLimitResult = await checkRateLimit(`client-portal:${prefix}:${ip}`, config)

        if (!rateLimitResult.success) {
          return rateLimitResponse(rateLimitResult)
        }
      }

      // --- Authentication ---
      const auth = await validateClientPortalSession()
      if (!auth.success) {
        return auth.error
      }

      const { user } = auth

      // --- Authorization: role ---
      if (options.requiredRole && user.role !== options.requiredRole) {
        return NextResponse.json(
          { error: `This action requires ${options.requiredRole} access` },
          { status: 403 }
        )
      }

      // --- Authorization: web access ---
      if (options.requireWebAccess && !user.hasWebsiteAccess) {
        return NextResponse.json({ error: 'No website access' }, { status: 403 })
      }

      // --- Authorization: marketing access ---
      if (options.requireMarketingAccess && !user.hasMarketingAccess) {
        return NextResponse.json({ error: 'No marketing access' }, { status: 403 })
      }

      // --- Execute handler ---
      return await handler(request, { user }, routeContext)
    } catch (error) {
      console.error(`[ClientPortal] ${request.method} ${request.nextUrl.pathname} error:`, error)
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      )
    }
  }
}
