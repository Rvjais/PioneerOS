import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import { createReAuthToken, RE_AUTH_SCOPES, ReAuthScope } from '@/server/security/re-auth'
import { checkRateLimit, RATE_LIMITS, resetRateLimit } from '@/server/security/rate-limiter'
import { getClientIp } from '@/server/security'
import { logCredentialAccess } from '@/server/api-credentials'

/**
 * POST /api/admin/api-credentials/re-auth
 *
 * Verify password and return a short-lived re-auth token for viewing credentials
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const ip = getClientIp(request)

    // Check rate limit for failed auth attempts
    const rateLimit = checkRateLimit(`${auth.user.id}:${ip}`, RATE_LIMITS.authAttempt)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many authentication attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.retryAfterMs || 0) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)),
          },
        }
      )
    }

    const body = await request.json()
    const { password, scope = RE_AUTH_SCOPES.VIEW_CREDENTIALS } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Validate scope
    const validScopes = Object.values(RE_AUTH_SCOPES) as string[]
    if (!validScopes.includes(scope)) {
      return NextResponse.json({ error: 'Invalid scope' }, { status: 400 })
    }

    const result = await createReAuthToken(auth.user.id, password, scope as ReAuthScope)

    if (!result.success) {
      // Log failed attempt
      await logCredentialAccess(
        'system',
        'REAUTH_FAILED',
        auth.user.id,
        false,
        result.error,
        ip
      )

      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    // Reset rate limit on successful auth
    resetRateLimit(`${auth.user.id}:${ip}`, RATE_LIMITS.authAttempt.keyPrefix)

    // Log successful re-auth
    await logCredentialAccess(
      'system',
      'REAUTH_SUCCESS',
      auth.user.id,
      true,
      `Scope: ${scope}`,
      ip
    )

    return NextResponse.json({
      token: result.token,
      expiresIn: 300, // 5 minutes
    })
  } catch (error) {
    console.error('Re-auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
