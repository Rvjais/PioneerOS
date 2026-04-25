import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import {
  getCredentialById,
  saveCredentials,
  deleteCredentials,
  updateCredentialStatus,
  logCredentialAccess,
  CredentialType,
  CredentialStatus,
  Environment,
} from '@/server/api-credentials'
import { PROVIDERS } from '@/server/api-credentials/providers'
import { encryptJSON } from '@/server/security/encryption'
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/server/security'
import { verifyReAuthToken, getReAuthToken, RE_AUTH_SCOPES } from '@/server/security/re-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single credential (with full decrypted values)
// REQUIRES: Re-authentication token for viewing decrypted credentials
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const ip = getClientIp(request)

    // Check rate limit for credential viewing
    const rateLimit = checkRateLimit(auth.user.id, RATE_LIMITS.credentialView)
    if (!rateLimit.allowed) {
      await logCredentialAccess(id, 'VIEW_BLOCKED', auth.user.id, false, 'Rate limit exceeded', ip)
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter: Math.ceil((rateLimit.retryAfterMs || 0) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      )
    }

    // Check for re-auth token
    const reAuthToken = getReAuthToken(request)
    if (!reAuthToken) {
      return NextResponse.json(
        { error: 'Re-authentication required', requiresReAuth: true },
        { status: 403 }
      )
    }

    // Verify re-auth token
    const tokenResult = await verifyReAuthToken(reAuthToken, auth.user.id, RE_AUTH_SCOPES.VIEW_CREDENTIALS)
    if (!tokenResult.valid) {
      await logCredentialAccess(id, 'VIEW_DENIED', auth.user.id, false, tokenResult.error, ip)
      return NextResponse.json(
        { error: tokenResult.error, requiresReAuth: true },
        { status: 403 }
      )
    }

    const result = await getCredentialById(id, auth.user.id)

    if (!result) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Enhanced audit log with IP
    await logCredentialAccess(id, 'VIEW', auth.user.id, true, undefined, ip)

    return NextResponse.json({
      credential: result.record,
      values: result.credentials,
    })
  } catch (error) {
    console.error('Failed to fetch credential:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update credential
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const ip = getClientIp(request)

    // Check rate limit for credential updates
    const rateLimit = checkRateLimit(auth.user.id, RATE_LIMITS.credentialUpdate)
    if (!rateLimit.allowed) {
      await logCredentialAccess(id, 'UPDATE_BLOCKED', auth.user.id, false, 'Rate limit exceeded', ip)
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter: Math.ceil((rateLimit.retryAfterMs || 0) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      )
    }

    const body = await request.json()
    const { name, credentials, status, environment } = body

    // Check credential exists
    const existing = await prisma.agencyApiCredential.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedBy: auth.user.id,
      updatedAt: new Date(),
    }

    const changedFields: string[] = []

    if (name && name !== existing.name) {
      updateData.name = name
      changedFields.push('name')
    }

    if (environment && environment !== existing.environment) {
      updateData.environment = environment
      changedFields.push('environment')
    }

    if (status && status !== existing.status) {
      updateData.status = status
      changedFields.push(`status: ${existing.status} -> ${status}`)
    }

    if (credentials && typeof credentials === 'object') {
      // Validate credential fields if provider is known
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
      updateData.credentials = encryptJSON(credentials)
      changedFields.push('credentials (rotated)')
    }

    await prisma.agencyApiCredential.update({
      where: { id },
      data: updateData,
    })

    // Enhanced audit log with IP and detailed field changes
    await logCredentialAccess(
      id,
      'UPDATE',
      auth.user.id,
      true,
      changedFields.length > 0 ? `Changed: ${changedFields.join(', ')}` : undefined,
      ip
    )

    return NextResponse.json({ message: 'Credential updated successfully' })
  } catch (error) {
    console.error('Failed to update credential:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete credential
// REQUIRES: Re-authentication token for deleting credentials
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const ip = getClientIp(request)

    // Check for re-auth token (deleting credentials is sensitive)
    const reAuthToken = getReAuthToken(request)
    if (!reAuthToken) {
      return NextResponse.json(
        { error: 'Re-authentication required', requiresReAuth: true },
        { status: 403 }
      )
    }

    // Verify re-auth token
    const tokenResult = await verifyReAuthToken(reAuthToken, auth.user.id, RE_AUTH_SCOPES.DELETE_CREDENTIALS)
    if (!tokenResult.valid) {
      await logCredentialAccess(id, 'DELETE_DENIED', auth.user.id, false, tokenResult.error, ip)
      return NextResponse.json(
        { error: tokenResult.error, requiresReAuth: true },
        { status: 403 }
      )
    }

    // Check credential exists
    const existing = await prisma.agencyApiCredential.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Log before deletion (since credential will be gone)
    await logCredentialAccess(
      id,
      'DELETE',
      auth.user.id,
      true,
      `Deleted: ${existing.provider} (${existing.environment})`,
      ip
    )

    await deleteCredentials(id, auth.user.id)

    return NextResponse.json({ message: 'Credential deleted successfully' })
  } catch (error) {
    console.error('Failed to delete credential:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
