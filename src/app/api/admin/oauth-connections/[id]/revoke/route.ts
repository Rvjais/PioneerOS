import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import { decrypt } from '@/server/security/encryption'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Revoke OAuth connection
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params

    // Get connection
    const connection = await prisma.clientOAuthConnection.findUnique({
      where: { id },
      include: {
        client: { select: { name: true } },
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Attempt to revoke token with platform (best effort)
    try {
      const decryptedToken = decrypt(connection.accessToken)

      // Platform-specific revocation
      switch (connection.platform) {
        case 'GOOGLE':
          await fetch(
            `https://oauth2.googleapis.com/revoke?token=${decryptedToken}`,
            { method: 'POST' }
          )
          break
        case 'META':
          // Meta doesn't have a simple revoke endpoint; app manages permissions
          break
        case 'LINKEDIN':
          // LinkedIn doesn't have a revoke endpoint for OAuth 2.0
          break
        // Twitter and others - best effort
      }
    } catch {
      // Ignore revocation errors - we'll still mark as revoked locally
    }

    // Update connection status
    await prisma.clientOAuthConnection.update({
      where: { id },
      data: {
        status: 'REVOKED',
        accessToken: '', // Clear tokens
        refreshToken: null,
        lastError: 'Connection revoked by admin',
      },
    })

    // Deactivate associated accounts
    await prisma.platformAccount.updateMany({
      where: { connectionId: id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: `OAuth connection for ${connection.client?.name} (${connection.platform}) has been revoked`,
    })
  } catch (error) {
    console.error('Failed to revoke connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
