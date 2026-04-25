import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import { decrypt, encrypt } from '@/server/security/encryption'
import { refreshAccessToken } from '@/server/integrations/oauth-config'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Force refresh OAuth token
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

    if (!connection.refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available. Client needs to reconnect.' },
        { status: 400 }
      )
    }

    try {
      // Decrypt refresh token
      const decryptedRefreshToken = decrypt(connection.refreshToken)

      // Attempt to refresh
      const result = await refreshAccessToken(
        connection.platform as 'GOOGLE' | 'META' | 'LINKEDIN' | 'TWITTER',
        decryptedRefreshToken
      )

      // Update connection with new tokens
      const updateData: Record<string, unknown> = {
        accessToken: encrypt(result.accessToken),
        status: 'ACTIVE',
        lastError: null,
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
      }

      if (result.refreshToken) {
        updateData.refreshToken = encrypt(result.refreshToken)
      }

      if (result.expiresIn) {
        updateData.expiresAt = new Date(Date.now() + result.expiresIn * 1000)
      }

      await prisma.clientOAuthConnection.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
        expiresAt: result.expiresIn
          ? new Date(Date.now() + result.expiresIn * 1000)
          : null,
      })
    } catch (error) {
      // Update connection status to error
      await prisma.clientOAuthConnection.update({
        where: { id },
        data: {
          status: 'ERROR',
          lastError:
            error instanceof Error ? error.message : 'Token refresh failed',
          lastSyncAt: new Date(),
          lastSyncStatus: 'FAILED',
        },
      })

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Token refresh failed',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to refresh token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
