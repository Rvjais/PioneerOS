import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import { testCredentials, logCredentialAccess, handleVerificationResult } from '@/server/api-credentials'
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/server/security'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Test/verify credential connection
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const ip = getClientIp(request)

    // Check rate limit for credential testing
    const rateLimit = checkRateLimit(auth.user.id, RATE_LIMITS.credentialTest)
    if (!rateLimit.allowed) {
      await logCredentialAccess(id, 'VERIFY_BLOCKED', auth.user.id, false, 'Rate limit exceeded', ip)
      return NextResponse.json(
        {
          error: 'Too many test requests. Please wait before testing again.',
          retryAfter: Math.ceil((rateLimit.retryAfterMs || 0) / 1000),
        },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) },
        }
      )
    }

    // Get credential
    const credential = await prisma.agencyApiCredential.findUnique({
      where: { id },
    })

    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Test the connection
    const result = await testCredentials(
      credential.provider,
      undefined, // Use stored credentials
      credential.environment as 'PRODUCTION' | 'SANDBOX'
    )

    // Update verification status
    await prisma.agencyApiCredential.update({
      where: { id },
      data: {
        lastVerifiedAt: new Date(),
        lastVerifiedBy: auth.user.id,
        status: result.success ? 'ACTIVE' : 'INVALID',
        lastError: result.success ? null : result.message,
      },
    })

    // Log the verification with IP
    await logCredentialAccess(
      id,
      'VERIFY',
      auth.user.id,
      result.success,
      result.success ? `Verified: ${credential.provider}` : result.message,
      ip
    )

    // Send alert if verification failed
    if (!result.success) {
      await handleVerificationResult(id, credential.provider, false, result.message)
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
    })
  } catch (error) {
    console.error('Failed to verify credential:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
