// Service for managing OAuth connections and syncing data
import { prisma } from '@/server/db/prisma'
import { Platform, PlatformAccountInfo, OAuthTokens } from './types'
import { encrypt, decrypt } from './encryption'
import { refreshAccessToken } from './oauth-config'
import { GoogleAnalyticsClient, GoogleSearchConsoleClient, getGoogleUserInfo } from './google/client'
import { MetaClient } from './meta/client'

/**
 * Store a new OAuth connection for a client
 */
export async function createConnection(
  clientId: string,
  platform: Platform,
  tokens: OAuthTokens,
  connectedBy?: string
) {
  // Get user info from platform
  let platformUserId: string | undefined
  let platformEmail: string | undefined

  try {
    if (platform === 'GOOGLE') {
      const userInfo = await getGoogleUserInfo(tokens.accessToken)
      platformUserId = userInfo.id
      platformEmail = userInfo.email
    } else if (platform === 'META') {
      const client = new MetaClient({ accessToken: tokens.accessToken })
      const userInfo = await client.getUserInfo()
      platformUserId = userInfo.id
      platformEmail = userInfo.email
    }
  } catch (error) {
    console.error('Failed to get platform user info:', error)
  }

  // Store connection with encrypted tokens
  const connection = await prisma.clientOAuthConnection.upsert({
    where: {
      clientId_platform: { clientId, platform },
    },
    create: {
      clientId,
      platform,
      accessToken: encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      expiresAt: tokens.expiresAt,
      scopes: tokens.scopes ? JSON.stringify(tokens.scopes) : null,
      status: 'ACTIVE',
      connectedBy,
      platformUserId,
      platformEmail,
    },
    update: {
      accessToken: encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      expiresAt: tokens.expiresAt,
      scopes: tokens.scopes ? JSON.stringify(tokens.scopes) : null,
      status: 'ACTIVE',
      lastError: null,
      connectedBy,
      platformUserId,
      platformEmail,
    },
  })

  // Discover and store accounts
  await discoverAccounts(connection.id)

  return connection
}

/**
 * Get decrypted tokens for a connection
 */
export async function getConnectionTokens(connectionId: string): Promise<OAuthTokens | null> {
  const connection = await prisma.clientOAuthConnection.findUnique({
    where: { id: connectionId },
  })

  if (!connection) return null

  // Check if token needs refresh
  if (connection.expiresAt && connection.expiresAt < new Date()) {
    if (connection.refreshToken) {
      try {
        const newTokens = await refreshAccessToken(
          connection.platform as Platform,
          decrypt(connection.refreshToken)
        )

        // Update stored tokens
        await prisma.clientOAuthConnection.update({
          where: { id: connectionId },
          data: {
            accessToken: encrypt(newTokens.accessToken),
            refreshToken: newTokens.refreshToken
              ? encrypt(newTokens.refreshToken)
              : connection.refreshToken,
            expiresAt: newTokens.expiresIn
              ? new Date(Date.now() + newTokens.expiresIn * 1000)
              : null,
            status: 'ACTIVE',
            lastError: null,
          },
        })

        return {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken || decrypt(connection.refreshToken),
          expiresAt: newTokens.expiresIn
            ? new Date(Date.now() + newTokens.expiresIn * 1000)
            : undefined,
          tokenType: 'Bearer',
        }
      } catch (error) {
        // Mark connection as expired
        await prisma.clientOAuthConnection.update({
          where: { id: connectionId },
          data: {
            status: 'EXPIRED',
            lastError: error instanceof Error ? error.message : 'Token refresh failed',
          },
        })
        return null
      }
    } else {
      // No refresh token, mark as expired
      await prisma.clientOAuthConnection.update({
        where: { id: connectionId },
        data: {
          status: 'EXPIRED',
          lastError: 'Token expired, no refresh token available',
        },
      })
      return null
    }
  }

  return {
    accessToken: decrypt(connection.accessToken),
    refreshToken: connection.refreshToken ? decrypt(connection.refreshToken) : undefined,
    expiresAt: connection.expiresAt || undefined,
    tokenType: 'Bearer',
  }
}

/**
 * Discover accounts for a connection
 */
export async function discoverAccounts(connectionId: string) {
  const tokens = await getConnectionTokens(connectionId)
  if (!tokens) {
    throw new Error('Could not get valid tokens for connection')
  }

  const connection = await prisma.clientOAuthConnection.findUnique({
    where: { id: connectionId },
  })
  if (!connection) {
    throw new Error('Connection not found')
  }

  let accounts: PlatformAccountInfo[] = []

  try {
    if (connection.platform === 'GOOGLE') {
      // Discover Google Analytics properties
      const analyticsClient = new GoogleAnalyticsClient({ accessToken: tokens.accessToken })
      const gaAccounts = await analyticsClient.listProperties()
      accounts.push(...gaAccounts)

      // Discover Search Console sites
      const searchConsoleClient = new GoogleSearchConsoleClient({ accessToken: tokens.accessToken })
      const scSites = await searchConsoleClient.listSites()
      accounts.push(...scSites)
    } else if (connection.platform === 'META') {
      const metaClient = new MetaClient({ accessToken: tokens.accessToken })

      // Discover pages and Instagram accounts
      const pages = await metaClient.listPages()
      accounts.push(...pages)

      // Discover ad accounts
      const adAccounts = await metaClient.listAdAccounts()
      accounts.push(...adAccounts)
    }

    // Store discovered accounts
    for (const account of accounts) {
      await prisma.platformAccount.upsert({
        where: {
          connectionId_platform_accountId: {
            connectionId,
            platform: account.platform,
            accountId: account.accountId,
          },
        },
        create: {
          connectionId,
          platform: account.platform,
          accountId: account.accountId,
          accountName: account.accountName,
          accountType: account.accountType,
          metadata: account.metadata ? JSON.stringify(account.metadata) : null,
          isActive: true,
        },
        update: {
          accountName: account.accountName,
          accountType: account.accountType,
          metadata: account.metadata ? JSON.stringify(account.metadata) : null,
        },
      })
    }

    // Update connection status
    await prisma.clientOAuthConnection.update({
      where: { id: connectionId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
      },
    })

    return accounts
  } catch (error) {
    // Update connection with error
    await prisma.clientOAuthConnection.update({
      where: { id: connectionId },
      data: {
        lastSyncStatus: 'FAILED',
        lastError: error instanceof Error ? error.message : 'Account discovery failed',
      },
    })
    throw error
  }
}

/**
 * Get all connections for a client
 */
export async function getClientConnections(clientId: string) {
  return prisma.clientOAuthConnection.findMany({
    where: { clientId },
    include: {
      accounts: {
        where: { isActive: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Disconnect a platform
 */
export async function disconnectPlatform(clientId: string, platform: Platform) {
  await prisma.clientOAuthConnection.deleteMany({
    where: { clientId, platform },
  })
}

/**
 * Get connection status for a client
 */
export async function getConnectionStatus(clientId: string) {
  const connections = await prisma.clientOAuthConnection.findMany({
    where: { clientId },
    select: {
      platform: true,
      status: true,
      lastSyncAt: true,
      lastError: true,
      accounts: {
        where: { isActive: true },
        select: {
          platform: true,
          accountName: true,
        },
      },
    },
  })

  const platforms: Record<string, {
    connected: boolean
    status: string
    lastSync?: Date
    error?: string
    accounts: string[]
  }> = {}

  for (const conn of connections) {
    platforms[conn.platform] = {
      connected: conn.status === 'ACTIVE',
      status: conn.status,
      lastSync: conn.lastSyncAt || undefined,
      error: conn.lastError || undefined,
      accounts: conn.accounts.map(a => a.accountName),
    }
  }

  return platforms
}
