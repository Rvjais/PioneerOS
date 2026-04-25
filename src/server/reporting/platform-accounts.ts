/**
 * Platform Accounts Service
 * Manages manual and OAuth-connected platform accounts for clients
 */

import prisma from '@/server/db/prisma'

// Platform types
export const PLATFORMS = [
  'GOOGLE_ANALYTICS',
  'GOOGLE_SEARCH_CONSOLE',
  'GOOGLE_ADS',
  'META_ADS',
  'META_SOCIAL',
  'LINKEDIN',
  'YOUTUBE',
] as const

export type Platform = (typeof PLATFORMS)[number]

// Access types
export const ACCESS_TYPES = ['OAUTH', 'MANUAL', 'DELEGATED'] as const
export type AccessType = (typeof ACCESS_TYPES)[number]

// Sync status
export const SYNC_STATUSES = ['SUCCESS', 'FAILED', 'PENDING'] as const
export type SyncStatus = (typeof SYNC_STATUSES)[number]

// Platform display names and icons
export const PLATFORM_CONFIG: Record<
  Platform,
  {
    name: string
    shortName: string
    icon: string
    color: string
    metrics: string[]
  }
> = {
  GOOGLE_ANALYTICS: {
    name: 'Google Analytics',
    shortName: 'GA',
    icon: 'BarChart2',
    color: '#F9AB00',
    metrics: ['sessions', 'users', 'newUsers', 'pageviews', 'bounceRate', 'avgSessionDuration'],
  },
  GOOGLE_SEARCH_CONSOLE: {
    name: 'Google Search Console',
    shortName: 'GSC',
    icon: 'Search',
    color: '#4285F4',
    metrics: ['impressions', 'clicks', 'ctr', 'position'],
  },
  GOOGLE_ADS: {
    name: 'Google Ads',
    shortName: 'GAds',
    icon: 'Target',
    color: '#34A853',
    metrics: ['impressions', 'clicks', 'cost', 'conversions', 'cpc', 'cpa', 'roas'],
  },
  META_ADS: {
    name: 'Meta Ads',
    shortName: 'Meta',
    icon: 'DollarSign',
    color: '#1877F2',
    metrics: ['impressions', 'reach', 'clicks', 'spend', 'conversions', 'cpm', 'cpc'],
  },
  META_SOCIAL: {
    name: 'Meta Social',
    shortName: 'Social',
    icon: 'Users',
    color: '#E4405F',
    metrics: ['followers', 'followersGained', 'posts', 'reach', 'engagement', 'engagementRate'],
  },
  LINKEDIN: {
    name: 'LinkedIn',
    shortName: 'LI',
    icon: 'Linkedin',
    color: '#0A66C2',
    metrics: ['followers', 'impressions', 'clicks', 'engagement', 'engagementRate'],
  },
  YOUTUBE: {
    name: 'YouTube',
    shortName: 'YT',
    icon: 'Youtube',
    color: '#FF0000',
    metrics: ['subscribers', 'views', 'watchTime', 'avgViewDuration', 'likes', 'comments'],
  },
}

// Input types
export interface AddAccountInput {
  clientId: string
  platform: Platform
  accountId: string
  accountName: string
  accessType: AccessType
  metadata?: Record<string, unknown>
  createdBy?: string
}

export interface UpdateAccountInput {
  accountName?: string
  accessType?: AccessType
  isActive?: boolean
  metadata?: Record<string, unknown>
  lastSyncAt?: Date
  lastSyncStatus?: SyncStatus
  syncError?: string | null
}

/**
 * Add a new platform account for a client
 */
export async function addAccount(input: AddAccountInput) {
  const { clientId, platform, accountId, accountName, accessType, metadata, createdBy } = input

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true },
  })

  if (!client) {
    throw new Error('Client not found')
  }

  // Check if account already exists
  const existing = await prisma.clientPlatformAccount.findUnique({
    where: {
      clientId_platform_accountId: {
        clientId,
        platform,
        accountId,
      },
    },
  })

  if (existing) {
    throw new Error(`Account ${accountId} for ${platform} already exists for this client`)
  }

  // Create the account
  const account = await prisma.clientPlatformAccount.create({
    data: {
      clientId,
      platform,
      accountId,
      accountName,
      accessType,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdBy,
      lastSyncStatus: accessType === 'MANUAL' ? null : 'PENDING',
    },
  })

  return account
}

/**
 * Get all platform accounts for a client
 */
export async function getAccounts(clientId: string, options?: { platform?: Platform; isActive?: boolean }) {
  const accounts = await prisma.clientPlatformAccount.findMany({
    where: {
      clientId,
      ...(options?.platform && { platform: options.platform }),
      ...(options?.isActive !== undefined && { isActive: options.isActive }),
    },
    include: {
      _count: {
        select: { metrics: true },
      },
    },
    orderBy: [{ platform: 'asc' }, { accountName: 'asc' }],
  })

  return accounts.map((account) => ({
    ...account,
    metadata: account.metadata ? JSON.parse(account.metadata) : null,
    metricsCount: account._count.metrics,
  }))
}

/**
 * Get a single platform account by ID
 */
export async function getAccount(accountId: string) {
  const account = await prisma.clientPlatformAccount.findUnique({
    where: { id: accountId },
    include: {
      client: {
        select: { id: true, name: true },
      },
      _count: {
        select: { metrics: true },
      },
    },
  })

  if (!account) {
    return null
  }

  return {
    ...account,
    metadata: account.metadata ? JSON.parse(account.metadata) : null,
    metricsCount: account._count.metrics,
  }
}

/**
 * Update a platform account
 */
export async function updateAccount(accountId: string, input: UpdateAccountInput) {
  const account = await prisma.clientPlatformAccount.findUnique({
    where: { id: accountId },
  })

  if (!account) {
    throw new Error('Account not found')
  }

  const updated = await prisma.clientPlatformAccount.update({
    where: { id: accountId },
    data: {
      ...(input.accountName && { accountName: input.accountName }),
      ...(input.accessType && { accessType: input.accessType }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.metadata && { metadata: JSON.stringify(input.metadata) }),
      ...(input.lastSyncAt && { lastSyncAt: input.lastSyncAt }),
      ...(input.lastSyncStatus && { lastSyncStatus: input.lastSyncStatus }),
      ...(input.syncError !== undefined && { syncError: input.syncError }),
    },
  })

  return {
    ...updated,
    metadata: updated.metadata ? JSON.parse(updated.metadata) : null,
  }
}

/**
 * Delete a platform account and all its metrics
 */
export async function deleteAccount(accountId: string) {
  const account = await prisma.clientPlatformAccount.findUnique({
    where: { id: accountId },
    include: {
      _count: { select: { metrics: true } },
    },
  })

  if (!account) {
    throw new Error('Account not found')
  }

  // Delete the account (cascades to metrics)
  await prisma.clientPlatformAccount.delete({
    where: { id: accountId },
  })

  return {
    deleted: true,
    metricsDeleted: account._count.metrics,
  }
}

/**
 * Get accounts grouped by platform for a client
 */
export async function getAccountsByPlatform(clientId: string) {
  const accounts = await getAccounts(clientId, { isActive: true })

  const grouped: Partial<Record<Platform, typeof accounts>> = {}

  for (const account of accounts) {
    const platform = account.platform as Platform
    if (!grouped[platform]) {
      grouped[platform] = []
    }
    grouped[platform]!.push(account)
  }

  return grouped
}

/**
 * Get platform summary for a client
 */
export async function getPlatformSummary(clientId: string) {
  const accounts = await prisma.clientPlatformAccount.groupBy({
    by: ['platform'],
    where: { clientId },
    _count: { id: true },
  })

  const activeAccounts = await prisma.clientPlatformAccount.groupBy({
    by: ['platform'],
    where: { clientId, isActive: true },
    _count: { id: true },
  })

  const summary: Array<{
    platform: Platform
    config: (typeof PLATFORM_CONFIG)[Platform]
    totalAccounts: number
    activeAccounts: number
    hasData: boolean
  }> = []

  for (const platform of PLATFORMS) {
    const total = accounts.find((a) => a.platform === platform)?._count.id ?? 0
    const active = activeAccounts.find((a) => a.platform === platform)?._count.id ?? 0

    summary.push({
      platform,
      config: PLATFORM_CONFIG[platform],
      totalAccounts: total,
      activeAccounts: active,
      hasData: active > 0,
    })
  }

  return summary
}

/**
 * Update sync status for an account
 */
export async function updateSyncStatus(
  accountId: string,
  status: SyncStatus,
  error?: string
) {
  return prisma.clientPlatformAccount.update({
    where: { id: accountId },
    data: {
      lastSyncAt: new Date(),
      lastSyncStatus: status,
      syncError: status === 'FAILED' ? error : null,
    },
  })
}
