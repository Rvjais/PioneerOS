import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import { rotateCredentials, logCredentialAccess } from '@/server/api-credentials'
import { PROVIDERS } from '@/server/api-credentials/providers'
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/server/security'
import { verifyReAuthToken, getReAuthToken, RE_AUTH_SCOPES } from '@/server/security/re-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Rotate credential keys
// REQUIRES: Re-authentication token for rotating credentials
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const ip = getClientIp(request)

    // Check rate limit for credential rotation (strict limit)
    const rateLimit = checkRateLimit(auth.user.id, RATE_LIMITS.credentialRotate)
    if (!rateLimit.allowed) {
      await logCredentialAccess(id, 'ROTATE_BLOCKED', auth.user.id, false, 'Rate limit exceeded', ip)
      return NextResponse.json(
        {
          error: 'Credential rotation limit reached. Please try again later.',
          retryAfter: Math.ceil((rateLimit.retryAfterMs || 0) / 1000),
        },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) },
        }
      )
    }

    // Check for re-auth token (rotating credentials is very sensitive)
    const reAuthToken = getReAuthToken(request)
    if (!reAuthToken) {
      return NextResponse.json(
        { error: 'Re-authentication required', requiresReAuth: true },
        { status: 403 }
      )
    }

    // Verify re-auth token
    const tokenResult = await verifyReAuthToken(reAuthToken, auth.user.id, RE_AUTH_SCOPES.ROTATE_CREDENTIALS)
    if (!tokenResult.valid) {
      await logCredentialAccess(id, 'ROTATE_DENIED', auth.user.id, false, tokenResult.error, ip)
      return NextResponse.json(
        { error: tokenResult.error, requiresReAuth: true },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { credentials } = body

    // Get existing credential
    const existing = await prisma.agencyApiCredential.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    if (!credentials || typeof credentials !== 'object') {
      return NextResponse.json(
        { error: 'New credentials are required' },
        { status: 400 }
      )
    }

    // Validate credential fields
    const providerConfig = PROVIDERS[existing.provider]
    if (providerConfig) {
      for (const field of providerConfig.fields) {
        if (field.required && !credentials[field.key]) {
          return NextResponse.json(
            { error: `Missing required field: ${field.label}` },
            { status: 400 }
          )
        }
      }
    }

    // Rotate the credentials
    const newCredentialId = await rotateCredentials(
      existing.provider,
      credentials,
      auth.user.id,
      existing.environment as 'PRODUCTION' | 'SANDBOX'
    )

    // Log successful rotation with IP
    await logCredentialAccess(
      newCredentialId,
      'ROTATE',
      auth.user.id,
      true,
      `Rotated: ${existing.provider} (${existing.environment})`,
      ip
    )

    return NextResponse.json({
      id: newCredentialId,
      message: 'Credentials rotated successfully',
    })
  } catch (error) {
    console.error('Failed to rotate credentials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
