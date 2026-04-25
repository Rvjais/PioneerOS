/**
 * Dashboard Data Service
 * Provides aggregated data for platform dashboards
 */

import prisma from '@/server/db/prisma'
import { Platform, PLATFORM_CONFIG, PLATFORMS } from './platform-accounts'
import {
  getMetrics,
  getTrends,
  getDimensionBreakdown,
  getDateRange,
  DateRange,
  DateRangePreset,
  AggregatedMetric,
  TrendDataPoint,
} from './metrics-aggregator'
import { format } from 'date-fns'

// Dashboard KPI card
export interface KPICard {
  id: string
  label: string
  value: number
  formattedValue: string
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'neutral'
  unit?: string
  color?: string
}

// Dashboard chart data
export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    color?: string
  }>
}

// Dashboard table row
export interface TableRow {
  id: string
  [key: string]: string | number | boolean | null
}

// Overview dashboard data
export interface OverviewDashboard {
  dateRange: DateRange
  platforms: Array<{
    platform: Platform
    name: string
    color: string
    hasData: boolean
    primaryKPI: KPICard | null
    accountCount: number
  }>
  totalAccounts: number
  recentImports: Array<{
    id: string
    platform: string
    importType: string
    status: string
    totalRows: number
    createdAt: Date
  }>
}

// Platform-specific dashboard data
export interface PlatformDashboard {
  platform: Platform
  platformConfig: (typeof PLATFORM_CONFIG)[Platform]
  dateRange: DateRange
  accounts: Array<{
    id: string
    name: string
    isActive: boolean
    lastSyncAt: Date | null
  }>
  kpis: KPICard[]
  mainChart: ChartData
  breakdownCharts: Array<{
    title: string
    type: 'pie' | 'bar' | 'table'
    data: Array<{ label: string; value: number; percentage?: number }>
  }>
  table: {
    columns: Array<{ key: string; label: string; type: string }>
    rows: TableRow[]
  }
}

/**
 * Format number for display
 */
function formatNumber(value: number, type?: string): string {
  if (type === 'currency') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (type === 'percentage') {
    return `${value.toFixed(2)}%`
  }

  if (type === 'duration') {
    // Assume value is in seconds
    const mins = Math.floor(value / 60)
    const secs = Math.round(value % 60)
    return `${mins}m ${secs}s`
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  return value.toFixed(value % 1 === 0 ? 0 : 2)
}

/**
 * Determine metric display type
 */
function getMetricType(metricType: string): string {
  const currencyMetrics = ['cost', 'spend', 'revenue', 'cpc', 'cpm', 'cpa', 'amount', 'total', 'fee', 'price', 'rate', 'costPerLead']
  const percentageMetrics = ['bounceRate', 'ctr', 'engagementRate', 'conversionRate']
  const durationMetrics = ['avgSessionDuration', 'avgViewDuration', 'watchTime']

  if (currencyMetrics.includes(metricType)) return 'currency'
  if (percentageMetrics.includes(metricType)) return 'percentage'
  if (durationMetrics.includes(metricType)) return 'duration'
  return 'number'
}

/**
 * Build KPI card from metric
 */
function buildKPICard(metric: AggregatedMetric, label?: string): KPICard {
  const type = getMetricType(metric.metricType)
  const trend: 'up' | 'down' | 'neutral' =
    metric.changePercent !== undefined
      ? metric.changePercent > 0
        ? 'up'
        : metric.changePercent < 0
          ? 'down'
          : 'neutral'
      : 'neutral'

  // For some metrics, down is good (bounceRate, cpc, cpa)
  const invertedMetrics = ['bounceRate', 'cpc', 'cpa', 'cpm', 'costPerLead', 'pageLoadTime', 'avgCostPerClick']
  const isInverted = invertedMetrics.includes(metric.metricType)

  return {
    id: metric.metricType,
    label: label || formatMetricLabel(metric.metricType),
    value: metric.value,
    formattedValue: formatNumber(metric.value, type),
    previousValue: metric.previousValue,
    change: metric.change,
    changePercent: metric.changePercent,
    trend: isInverted ? (trend === 'up' ? 'down' : trend === 'down' ? 'up' : 'neutral') : trend,
    unit: type === 'currency' ? '₹' : type === 'percentage' ? '%' : undefined,
  }
}

/**
 * Format metric label for display
 */
function formatMetricLabel(metricType: string): string {
  const labels: Record<string, string> = {
    sessions: 'Sessions',
    users: 'Users',
    newUsers: 'New Users',
    pageviews: 'Pageviews',
    bounceRate: 'Bounce Rate',
    avgSessionDuration: 'Avg. Session Duration',
    impressions: 'Impressions',
    clicks: 'Clicks',
    ctr: 'CTR',
    position: 'Avg. Position',
    cost: 'Cost',
    spend: 'Spend',
    conversions: 'Conversions',
    cpc: 'CPC',
    cpa: 'CPA',
    cpm: 'CPM',
    roas: 'ROAS',
    reach: 'Reach',
    followers: 'Followers',
    followersGained: 'New Followers',
    posts: 'Posts',
    engagement: 'Engagements',
    engagementRate: 'Engagement Rate',
    subscribers: 'Subscribers',
    views: 'Views',
    watchTime: 'Watch Time',
    avgViewDuration: 'Avg. View Duration',
    likes: 'Likes',
    comments: 'Comments',
  }

  return labels[metricType] || metricType.replace(/([A-Z])/g, ' $1').trim()
}

/**
 * Get overview dashboard data
 */
export async function getOverview(
  clientId: string,
  preset: DateRangePreset = '30d',
  customFrom?: Date,
  customTo?: Date
): Promise<OverviewDashboard> {
  const dateRange = getDateRange(preset, customFrom, customTo)

  // Get all accounts for client
  const accounts = await prisma.clientPlatformAccount.findMany({
    where: { clientId },
    include: {
      _count: { select: { metrics: true } },
    },
  })

  // Get recent imports
  const recentImports = await prisma.dataImportBatch.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      platform: true,
      importType: true,
      status: true,
      totalRows: true,
      createdAt: true,
    },
  })

  // Build platform summaries
  const platforms = await Promise.all(
    PLATFORMS.map(async (platform) => {
      const platformAccounts = accounts.filter((a) => a.platform === platform)
      const activeAccount = platformAccounts.find((a) => a.isActive)
      let primaryKPI: KPICard | null = null

      if (activeAccount && activeAccount._count.metrics > 0) {
        const config = PLATFORM_CONFIG[platform]
        const primaryMetric = config.metrics[0] // First metric is primary
        const metrics = await getMetrics(activeAccount.id, dateRange, {
          metricTypes: [primaryMetric],
        })

        if (metrics.length > 0) {
          primaryKPI = buildKPICard(metrics[0])
        }
      }

      return {
        platform,
        name: PLATFORM_CONFIG[platform].name,
        color: PLATFORM_CONFIG[platform].color,
        hasData: platformAccounts.some((a) => a._count.metrics > 0),
        primaryKPI,
        accountCount: platformAccounts.length,
      }
    })
  )

  return {
    dateRange,
    platforms,
    totalAccounts: accounts.length,
    recentImports,
  }
}

/**
 * Get platform-specific dashboard data
 */
export async function getPlatformDashboard(
  clientId: string,
  platform: Platform,
  preset: DateRangePreset = '30d',
  customFrom?: Date,
  customTo?: Date,
  accountId?: string
): Promise<PlatformDashboard> {
  const dateRange = getDateRange(preset, customFrom, customTo)
  const platformConfig = PLATFORM_CONFIG[platform]

  // Get accounts for this platform
  const accounts = await prisma.clientPlatformAccount.findMany({
    where: { clientId, platform },
    select: {
      id: true,
      accountName: true,
      isActive: true,
      lastSyncAt: true,
    },
  })

  // Use specified account or first active one
  const targetAccount = accountId
    ? accounts.find((a) => a.id === accountId)
    : accounts.find((a) => a.isActive) || accounts[0]

  if (!targetAccount) {
    return {
      platform,
      platformConfig,
      dateRange,
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.accountName,
        isActive: a.isActive,
        lastSyncAt: a.lastSyncAt,
      })),
      kpis: [],
      mainChart: { labels: [], datasets: [] },
      breakdownCharts: [],
      table: { columns: [], rows: [] },
    }
  }

  // Get all metrics for this account
  const metrics = await getMetrics(targetAccount.id, dateRange, {
    metricTypes: platformConfig.metrics,
  })

  // Build KPI cards
  const kpis = metrics.map((m) => buildKPICard(m))

  // Get trend data for primary metric
  const primaryMetric = platformConfig.metrics[0]
  const trendData = await getTrends(targetAccount.id, primaryMetric, dateRange, 'day')

  const mainChart: ChartData = {
    labels: trendData.map((d) => d.label || d.date),
    datasets: [
      {
        label: formatMetricLabel(primaryMetric),
        data: trendData.map((d) => d.value),
        color: platformConfig.color,
      },
    ],
  }

  // Get breakdown charts based on platform
  const breakdownCharts = await getBreakdownCharts(targetAccount.id, platform, dateRange)

  // Get daily data table
  const tableData = await getDailyTableData(targetAccount.id, dateRange, platformConfig.metrics)

  return {
    platform,
    platformConfig,
    dateRange,
    accounts: accounts.map((a) => ({
      id: a.id,
      name: a.accountName,
      isActive: a.isActive,
      lastSyncAt: a.lastSyncAt,
    })),
    kpis,
    mainChart,
    breakdownCharts,
    table: tableData,
  }
}

/**
 * Get breakdown charts for a platform
 */
async function getBreakdownCharts(
  accountId: string,
  platform: Platform,
  dateRange: DateRange
): Promise<PlatformDashboard['breakdownCharts']> {
  const charts: PlatformDashboard['breakdownCharts'] = []

  // Platform-specific breakdowns
  switch (platform) {
    case 'GOOGLE_ANALYTICS':
      {
        const sources = await getDimensionBreakdown(accountId, 'sessions', dateRange, 'source')
        if (sources.length > 0) {
          charts.push({
            title: 'Traffic Sources',
            type: 'pie',
            data: sources.map((s) => ({
              label: s.dimensionValue,
              value: s.value,
              percentage: s.percentage,
            })),
          })
        }
      }
      break

    case 'GOOGLE_SEARCH_CONSOLE':
      {
        const queries = await getDimensionBreakdown(accountId, 'clicks', dateRange, 'query')
        if (queries.length > 0) {
          charts.push({
            title: 'Top Queries',
            type: 'bar',
            data: queries.map((q) => ({
              label: q.dimensionValue,
              value: q.value,
              percentage: q.percentage,
            })),
          })
        }
      }
      break

    case 'GOOGLE_ADS':
    case 'META_ADS':
      {
        const campaigns = await getDimensionBreakdown(accountId, 'clicks', dateRange, 'campaign')
        if (campaigns.length > 0) {
          charts.push({
            title: 'Campaign Performance',
            type: 'bar',
            data: campaigns.map((c) => ({
              label: c.dimensionValue,
              value: c.value,
              percentage: c.percentage,
            })),
          })
        }
      }
      break

    default:
      break
  }

  return charts
}

/**
 * Get daily table data
 */
async function getDailyTableData(
  accountId: string,
  dateRange: DateRange,
  metricTypes: string[]
): Promise<{
  columns: Array<{ key: string; label: string; type: string }>
  rows: TableRow[]
}> {
  const metrics = await prisma.platformMetricEntry.findMany({
    where: {
      accountId,
      metricType: { in: metricTypes },
      date: { gte: dateRange.from, lte: dateRange.to },
    },
    orderBy: { date: 'desc' },
  })

  // Group by date
  const byDate = new Map<string, Record<string, number>>()

  for (const metric of metrics) {
    const dateKey = format(new Date(metric.date), 'yyyy-MM-dd')
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {})
    }
    byDate.get(dateKey)![metric.metricType] = metric.value
  }

  // Build columns
  const columns = [
    { key: 'date', label: 'Date', type: 'date' },
    ...metricTypes.map((m) => ({
      key: m,
      label: formatMetricLabel(m),
      type: getMetricType(m),
    })),
  ]

  // Build rows
  const rows: TableRow[] = Array.from(byDate.entries()).map(([date, values]) => ({
    id: date,
    date,
    ...values,
  }))

  return { columns, rows }
}

/**
 * Export dashboard data
 */
export async function exportDashboard(
  clientId: string,
  platform: Platform,
  dateRange: DateRange,
  exportFormat: 'csv' | 'excel' | 'json'
): Promise<{ data: string | Buffer; filename: string; contentType: string }> {
  const dashboard = await getPlatformDashboard(
    clientId,
    platform,
    'custom',
    dateRange.from,
    dateRange.to
  )

  const dateStr = `${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`
  const baseFilename = `${platform.toLowerCase()}_report_${dateStr}`

  switch (exportFormat) {
    case 'csv': {
      const headers = dashboard.table.columns.map((c) => c.label).join(',')
      const rows = dashboard.table.rows
        .map((row) => dashboard.table.columns.map((c) => row[c.key] ?? '').join(','))
        .join('\n')

      return {
        data: `${headers}\n${rows}`,
        filename: `${baseFilename}.csv`,
        contentType: 'text/csv',
      }
    }

    case 'json': {
      return {
        data: JSON.stringify(dashboard, null, 2),
        filename: `${baseFilename}.json`,
        contentType: 'application/json',
      }
    }

    case 'excel': {
      // For Excel, we'd use xlsx library
      // Simplified version returns JSON for now
      return {
        data: JSON.stringify(dashboard, null, 2),
        filename: `${baseFilename}.json`,
        contentType: 'application/json',
      }
    }

    default:
      throw new Error(`Unsupported format: ${exportFormat}`)
  }
}
