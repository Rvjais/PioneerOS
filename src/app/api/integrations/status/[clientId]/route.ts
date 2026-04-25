// GET /api/integrations/status/[clientId] - Get integration status for a client
import { NextRequest, NextResponse } from 'next/server'
import { getClientConnections, getConnectionStatus } from '@/server/integrations/connection-service'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!

    // Get detailed connection info
    const connections = await getClientConnections(clientId)

    // Get simplified status
    const status = await getConnectionStatus(clientId)

    return NextResponse.json({
      connections: connections.map(conn => ({
        id: conn.id,
        platform: conn.platform,
        status: conn.status,
        lastSyncAt: conn.lastSyncAt,
        lastError: conn.lastError,
        connectedAt: conn.connectedAt,
        platformEmail: conn.platformEmail,
        accounts: conn.accounts.map(acc => ({
          id: acc.id,
          platform: acc.platform,
          accountId: acc.accountId,
          accountName: acc.accountName,
          accountType: acc.accountType,
          isPrimary: acc.isPrimary,
          lastSyncAt: acc.lastSyncAt,
        })),
      })),
      status,
    })
  } catch (error) {
    console.error('Failed to get integration status:', error)
    return NextResponse.json(
      { error: 'Failed to get integration status' },
      { status: 500 }
    )
  }
})
