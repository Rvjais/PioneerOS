/**
 * Ads Sync Cron Job
 * Runs daily to sync ad campaign data from Google Ads and Meta Ads platforms.
 *
 * - Finds all clients with active platform accounts (GOOGLE_ADS / META_ADS)
 * - Pulls latest campaign metrics from each platform
 * - Stores metrics as PlatformMetricEntry records
 * - Calculates budget pacing and sends overspend alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { acquireLock, releaseLock, startLockHeartbeat } from '@/server/db/distributedLock'
import { syncGoogleAdsCampaigns } from '@/server/integrations/google/ads'
import { syncMetaAdsCampaigns } from '@/server/integrations/meta/ads'
import { calculatePacingStatus, getSpendAlert } from '@/shared/utils/ads/budgetPacing'
import { timingSafeEqual } from 'crypto'

export const maxDuration = 300

const CRON_SECRET = process.env.CRON_SECRET

function isValidCronSecret(provided: string | null): boolean {
  if (!CRON_SECRET || !provided) return false
  const expected = `Bearer ${CRON_SECRET}`
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret with timing-safe comparison
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET) {
      console.error('[Ads Sync] CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
    }
    if (!isValidCronSecret(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Acquire distributed lock with heartbeat to prevent duplicate runs
    const lockTtl = 600 // 10 minutes — longer than maxDuration to account for slow API responses
    const lock = await acquireLock('ads-sync-daily', lockTtl)
    if (!lock.acquired) {
      return NextResponse.json({ message: 'Already running', skipped: true })
    }

    // Heartbeat keeps lock alive if job runs longer than expected
    const lockId = lock.lockId
    if (!lockId) {
      return NextResponse.json({ error: 'Lock acquired but no lockId returned' }, { status: 500 })
    }
    const stopHeartbeat = startLockHeartbeat(lockId, lockTtl)

    const results = {
      accountsProcessed: 0,
      metricsStored: 0,
      overspendAlerts: 0,
      errors: [] as string[],
    }

    try {
      // Find all active platform accounts for Google Ads and Meta Ads
      const platformAccounts = await prisma.clientPlatformAccount.findMany({
        where: {
          isActive: true,
          platform: { in: ['GOOGLE_ADS', 'META_ADS'] },
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              monthlyFee: true,
            },
          },
        },
      })

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const dayOfMonth = now.getDate()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

      for (const account of platformAccounts) {
        try {
          let campaigns: Array<{ id: string; name: string; impressions: number; clicks: number; cost: number; conversions?: number; leads?: number }> = []

          if (account.platform === 'GOOGLE_ADS') {
            // Parse metadata for credentials with safety check
            let metadata: Record<string, string> = {}
            try {
              metadata = account.metadata ? JSON.parse(account.metadata) : {}
            } catch {
              throw new Error('Invalid metadata JSON for platform account')
            }
            if (!metadata.clientId || !metadata.refreshToken) {
              throw new Error('Missing required credentials (clientId, refreshToken) in account metadata')
            }
            const googleCampaigns = await syncGoogleAdsCampaigns(account.accountId, {
              clientId: metadata.clientId,
              clientSecret: metadata.clientSecret || '',
              refreshToken: metadata.refreshToken,
            })
            campaigns = googleCampaigns.map((c) => ({
              id: c.id,
              name: c.name,
              impressions: c.impressions,
              clicks: c.clicks,
              cost: c.cost,
              conversions: c.conversions,
            }))
          } else if (account.platform === 'META_ADS') {
            let metadata: Record<string, string> = {}
            try {
              metadata = account.metadata ? JSON.parse(account.metadata) : {}
            } catch {
              throw new Error('Invalid metadata JSON for platform account')
            }
            if (!metadata.accessToken) {
              throw new Error('Missing required accessToken in account metadata')
            }
            const metaCampaigns = await syncMetaAdsCampaigns(
              account.accountId,
              metadata.accessToken
            )
            campaigns = metaCampaigns.map((c) => ({
              id: c.id,
              name: c.name,
              impressions: c.impressions,
              clicks: c.clicks,
              cost: c.spend,
              leads: c.leads,
            }))
          }

          // Batch store metrics: delete today's entries for this account, then bulk create
          // This eliminates the N+1 pattern of findFirst+update/create per metric per campaign
          if (campaigns.length > 0) {
            const campaignIds = campaigns.map((c) => c.id)

            // Delete existing entries for today in one query
            await prisma.platformMetricEntry.deleteMany({
              where: {
                accountId: account.id,
                date: today,
                dimension: 'campaign',
                dimensionValue: { in: campaignIds },
              },
            })

            // Build all metric entries for batch create
            const allEntries: Array<{
              accountId: string
              date: Date
              metricType: string
              value: number
              dimension: string
              dimensionValue: string
              importSource: string
            }> = []

            for (const campaign of campaigns) {
              allEntries.push(
                { accountId: account.id, date: today, metricType: 'impressions', value: campaign.impressions, dimension: 'campaign', dimensionValue: campaign.id, importSource: 'OAUTH_SYNC' },
                { accountId: account.id, date: today, metricType: 'clicks', value: campaign.clicks, dimension: 'campaign', dimensionValue: campaign.id, importSource: 'OAUTH_SYNC' },
                { accountId: account.id, date: today, metricType: 'cost', value: campaign.cost, dimension: 'campaign', dimensionValue: campaign.id, importSource: 'OAUTH_SYNC' },
              )
              if (campaign.conversions !== undefined) {
                allEntries.push({ accountId: account.id, date: today, metricType: 'conversions', value: campaign.conversions, dimension: 'campaign', dimensionValue: campaign.id, importSource: 'OAUTH_SYNC' })
              }
              if (campaign.leads !== undefined) {
                allEntries.push({ accountId: account.id, date: today, metricType: 'leads', value: campaign.leads, dimension: 'campaign', dimensionValue: campaign.id, importSource: 'OAUTH_SYNC' })
              }
            }

            // Batch insert all metrics in one query
            await prisma.platformMetricEntry.createMany({ data: allEntries })
            results.metricsStored += allEntries.length
          }

          // Update sync status on the platform account
          await prisma.clientPlatformAccount.update({
            where: { id: account.id },
            data: {
              lastSyncAt: now,
              lastSyncStatus: 'SUCCESS',
              syncError: null,
            },
          })

          results.accountsProcessed++

          // Calculate budget pacing and check for overspend
          // Use monthly fee as rough budget allocation (actual budget may differ)
          const allocated = account.client.monthlyFee || 0
          if (allocated > 0) {
            // Sum total spend this month for this account
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const spendEntries = await prisma.platformMetricEntry.aggregate({
              where: {
                accountId: account.id,
                metricType: 'cost',
                date: { gte: startOfMonth, lte: today },
              },
              _sum: { value: true },
            })

            const totalSpent = spendEntries._sum.value || 0
            const pacing = calculatePacingStatus(allocated, totalSpent, dayOfMonth, daysInMonth)
            const alert = getSpendAlert(allocated, totalSpent)

            if (alert && alert.level === 'CRITICAL') {
              results.overspendAlerts++
              console.warn(
                `[Ads Sync] OVERSPEND ALERT for ${account.client.name} (${account.platform}): ${alert.message}. ` +
                `Pacing: ${pacing.status}, projected month-end: ${pacing.projectedMonthEnd.toFixed(2)}`
              )
            }
          }
        } catch (accountError) {
          const errorMsg = `Failed to sync ${account.platform} account ${account.accountId} for client ${account.client.name}: ${accountError instanceof Error ? accountError.message : 'Unknown error'}`
          console.error(`[Ads Sync] ${errorMsg}`)
          results.errors.push(errorMsg)

          // Update sync status as failed
          await prisma.clientPlatformAccount.update({
            where: { id: account.id },
            data: {
              lastSyncAt: now,
              lastSyncStatus: 'FAILED',
              syncError: accountError instanceof Error ? accountError.message : 'Unknown error',
            },
          })
        }
      }

      return NextResponse.json({
        success: true,
        ...results,
        timestamp: new Date().toISOString(),
      })
    } finally {
      stopHeartbeat()
      if (lock.lockId) {
        await releaseLock(lock.lockId)
      }
    }
  } catch (error) {
    console.error('[Ads Sync] Cron job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
