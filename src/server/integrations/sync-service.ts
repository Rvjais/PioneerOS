// Service for syncing data from connected platforms
import { prisma } from '@/server/db/prisma'
import { getConnectionTokens } from './connection-service'
import { GoogleAnalyticsClient, GoogleSearchConsoleClient } from './google/client'
import { MetaClient } from './meta/client'
import { SyncJobResult, DailyMetrics } from './types'

/**
 * Sync metrics for all active accounts of a connection
 */
export async function syncConnectionMetrics(
  connectionId: string,
  startDate: Date,
  endDate: Date
): Promise<SyncJobResult> {
  const tokens = await getConnectionTokens(connectionId)
  if (!tokens) {
    return {
      success: false,
      recordsProcessed: 0,
      recordsFailed: 0,
      errors: ['Could not get valid tokens'],
    }
  }

  const connection = await prisma.clientOAuthConnection.findUnique({
    where: { id: connectionId },
    include: {
      accounts: {
        where: { isActive: true },
      },
    },
  })

  if (!connection) {
    return {
      success: false,
      recordsProcessed: 0,
      recordsFailed: 0,
      errors: ['Connection not found'],
    }
  }

  // Create sync job
  const job = await prisma.platformSyncJob.create({
    data: {
      connectionId,
      platform: connection.platform,
      syncType: 'INCREMENTAL',
      status: 'RUNNING',
      startedAt: new Date(),
    },
  })

  let recordsProcessed = 0
  let recordsFailed = 0
  const errors: string[] = []

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  for (const account of connection.accounts) {
    try {
      let metrics: DailyMetrics[] = []

      if (account.platform === 'GOOGLE_ANALYTICS') {
        const client = new GoogleAnalyticsClient({ accessToken: tokens.accessToken })
        metrics = await client.getMetrics(account.accountId, startDateStr, endDateStr)
      } else if (account.platform === 'GOOGLE_SEARCH_CONSOLE') {
        const client = new GoogleSearchConsoleClient({ accessToken: tokens.accessToken })
        metrics = await client.getSearchAnalytics(account.accountId, startDateStr, endDateStr)
      } else if (account.platform === 'META_PAGE') {
        const metadata = account.metadata ? JSON.parse(account.metadata) : {}
        if (metadata.pageAccessToken) {
          const client = new MetaClient({ accessToken: tokens.accessToken })
          metrics = await client.getPageInsights(
            account.accountId,
            metadata.pageAccessToken,
            startDate,
            endDate
          )
        }
      } else if (account.platform === 'META_INSTAGRAM') {
        const client = new MetaClient({ accessToken: tokens.accessToken })
        metrics = await client.getInstagramInsights(account.accountId, startDate, endDate)
      } else if (account.platform === 'META_AD_ACCOUNT') {
        const client = new MetaClient({ accessToken: tokens.accessToken })
        const adMetrics = await client.getAdAccountInsights(
          account.accountId,
          startDateStr,
          endDateStr
        )
        metrics = adMetrics.map((m: any) => ({
          date: new Date(m.date),
          metrics: m.metrics,
        }))
      }

      // Store metrics
      for (const dailyMetric of metrics) {
        for (const metric of dailyMetric.metrics) {
          try {
            await prisma.platformMetric.upsert({
              where: {
                accountId_date_metricType_dimension_dimensionValue: {
                  accountId: account.id,
                  date: dailyMetric.date,
                  metricType: metric.metricType,
                  dimension: '',
                  dimensionValue: '',
                },
              },
              create: {
                accountId: account.id,
                date: dailyMetric.date,
                metricType: metric.metricType,
                metricValue: metric.value,
                metricUnit: metric.unit,
                previousValue: metric.previousValue,
                changePercent: metric.changePercent,
                dimension: '',
                dimensionValue: '',
              },
              update: {
                metricValue: metric.value,
                metricUnit: metric.unit,
                previousValue: metric.previousValue,
                changePercent: metric.changePercent,
              },
            })
            recordsProcessed++
          } catch (err) {
            recordsFailed++
            console.error('Failed to store metric:', err)
          }
        }
      }

      // Update account sync status
      await prisma.platformAccount.update({
        where: { id: account.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: 'SUCCESS',
        },
      })
    } catch (error) {
      recordsFailed++
      errors.push(`${account.platform}/${account.accountName}: ${error}`)

      await prisma.platformAccount.update({
        where: { id: account.id },
        data: {
          lastSyncStatus: 'FAILED',
        },
      })
    }
  }

  // Update job status
  await prisma.platformSyncJob.update({
    where: { id: job.id },
    data: {
      status: errors.length === 0 ? 'COMPLETED' : 'FAILED',
      completedAt: new Date(),
      recordsProcessed,
      recordsFailed,
      errorMessage: errors.length > 0 ? errors[0] : null,
      errorDetails: errors.length > 0 ? JSON.stringify(errors) : null,
    },
  })

  // Update connection sync status
  await prisma.clientOAuthConnection.update({
    where: { id: connectionId },
    data: {
      lastSyncAt: new Date(),
      lastSyncStatus: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
    },
  })

  return {
    success: errors.length === 0,
    recordsProcessed,
    recordsFailed,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Sync all active connections (for cron job)
 */
export async function syncAllConnections(daysBack = 7): Promise<{
  total: number
  successful: number
  failed: number
}> {
  const connections = await prisma.clientOAuthConnection.findMany({
    where: {
      status: 'ACTIVE',
    },
  })

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  let successful = 0
  let failed = 0

  for (const connection of connections) {
    try {
      const result = await syncConnectionMetrics(connection.id, startDate, endDate)
      if (result.success) {
        successful++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`Failed to sync connection ${connection.id}:`, error)
      failed++
    }
  }

  return {
    total: connections.length,
    successful,
    failed,
  }
}

/**
 * Get aggregated metrics for a client
 */
export async function getClientMetrics(
  clientId: string,
  startDate: Date,
  endDate: Date
) {
  const accounts = await prisma.platformAccount.findMany({
    where: {
      connection: { clientId },
      isActive: true,
    },
    include: {
      metrics: {
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
      },
    },
  })

  // Group metrics by platform and type
  const result: Record<string, {
    accountName: string
    platform: string
    metrics: Record<string, { dates: string[]; values: number[] }>
  }> = {}

  for (const account of accounts) {
    result[account.id] = {
      accountName: account.accountName,
      platform: account.platform,
      metrics: {},
    }

    for (const metric of account.metrics) {
      if (!result[account.id].metrics[metric.metricType]) {
        result[account.id].metrics[metric.metricType] = {
          dates: [],
          values: [],
        }
      }
      result[account.id].metrics[metric.metricType].dates.push(
        metric.date.toISOString().split('T')[0]
      )
      result[account.id].metrics[metric.metricType].values.push(metric.metricValue)
    }
  }

  return result
}

/**
 * Get summary metrics for reporting
 */
export async function getClientMetricsSummary(
  clientId: string,
  month: Date
) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  // Get previous month for comparison
  const prevStartDate = new Date(month.getFullYear(), month.getMonth() - 1, 1)
  const prevEndDate = new Date(month.getFullYear(), month.getMonth(), 0)

  const accounts = await prisma.platformAccount.findMany({
    where: {
      connection: { clientId },
      isActive: true,
    },
  })

  const summary: Record<string, {
    current: number
    previous: number
    change: number
    changePercent: number
  }> = {}

  for (const account of accounts) {
    // Get current month totals
    const currentMetrics = await prisma.platformMetric.groupBy({
      by: ['metricType'],
      where: {
        accountId: account.id,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { metricValue: true },
    })

    // Get previous month totals
    const previousMetrics = await prisma.platformMetric.groupBy({
      by: ['metricType'],
      where: {
        accountId: account.id,
        date: { gte: prevStartDate, lte: prevEndDate },
      },
      _sum: { metricValue: true },
    })

    const prevMap = new Map(previousMetrics.map(m => [m.metricType, m._sum.metricValue || 0]))

    for (const metric of currentMetrics) {
      const key = `${account.platform}_${metric.metricType}`
      const current = metric._sum.metricValue || 0
      const previous = prevMap.get(metric.metricType) || 0
      const change = current - previous
      const changePercent = previous > 0 ? ((change / previous) * 100) : 0

      if (!summary[key]) {
        summary[key] = { current: 0, previous: 0, change: 0, changePercent: 0 }
      }
      summary[key].current += current
      summary[key].previous += previous
      summary[key].change += change
    }
  }

  // Recalculate percentages after summing
  for (const key of Object.keys(summary)) {
    const { current, previous } = summary[key]
    summary[key].changePercent = previous > 0 ? ((current - previous) / previous * 100) : 0
  }

  return summary
}
