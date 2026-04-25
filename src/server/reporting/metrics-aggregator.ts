/**
 * Metrics Aggregator Service
 * Aggregates and queries platform metrics for reporting
 */

import prisma from '@/server/db/prisma'
import { Platform, PLATFORM_CONFIG } from './platform-accounts'
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval, differenceInDays } from 'date-fns'

// Date range types
export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}

// Aggregation types
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'last'

// Granularity for trend data
export type Granularity = 'day' | 'week' | 'month'

// Metric with aggregated value
export interface AggregatedMetric {
  metricType: string
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
}

// Trend data point
export interface TrendDataPoint {
  date: string
  value: number
  label?: string
}

// Dimension breakdown
export interface DimensionBreakdown {
  dimension: string
  dimensionValue: string
  value: number
  percentage: number
}

/**
 * Get date range from preset
 */
export function getDateRange(preset: DateRangePreset, customFrom?: Date, customTo?: Date): DateRange {
  const today = new Date()

  switch (preset) {
    case 'today':
      return { from: startOfDay(today), to: endOfDay(today) }
    case '7d':
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) }
    case '30d':
      return { from: startOfDay(subDays(today, 29)), to: endOfDay(today) }
    case '90d':
      return { from: startOfDay(subDays(today, 89)), to: endOfDay(today) }
    case 'custom':
      if (!customFrom || !customTo) {
        throw new Error('Custom date range requires from and to dates')
      }
      return { from: startOfDay(customFrom), to: endOfDay(customTo) }
    default:
      return { from: startOfDay(subDays(today, 29)), to: endOfDay(today) }
  }
}

/**
 * Get previous period for comparison
 */
export function getPreviousPeriod(dateRange: DateRange): DateRange {
  const days = differenceInDays(dateRange.to, dateRange.from) + 1
  return {
    from: startOfDay(subDays(dateRange.from, days)),
    to: endOfDay(subDays(dateRange.from, 1)),
  }
}

/**
 * Get aggregated metrics for an account
 */
// Metric group result type
type MetricGroupResult = {
  metricType: string
  _sum: { value: number | null }
  _avg: { value: number | null }
  _min: { value: number | null }
  _max: { value: number | null }
  _count: { value: number }
}

export async function getMetrics(
  accountId: string,
  dateRange: DateRange,
  options?: {
    metricTypes?: string[]
    aggregation?: AggregationType
    includePrevious?: boolean
  }
): Promise<AggregatedMetric[]> {
  const { metricTypes, aggregation = 'sum', includePrevious = true } = options || {}

  const whereClause = {
    accountId,
    date: {
      gte: dateRange.from,
      lte: dateRange.to,
    },
    ...(metricTypes && { metricType: { in: metricTypes } }),
  }

  // Get current period metrics
  // Prisma groupBy return type doesn't expose aggregate fields directly; cast needed
  const currentMetrics = (await prisma.platformMetricEntry.groupBy({
    by: ['metricType'],
    where: whereClause,
    _sum: { value: true },
    _avg: { value: true },
    _min: { value: true },
    _max: { value: true },
    _count: { value: true },
  })) as unknown as MetricGroupResult[]

  // Get previous period if requested
  let previousMetrics: MetricGroupResult[] = []
  if (includePrevious) {
    const prevPeriod = getPreviousPeriod(dateRange)
    // Prisma groupBy return type doesn't expose aggregate fields directly; cast needed
    previousMetrics = (await prisma.platformMetricEntry.groupBy({
      by: ['metricType'],
      where: {
        accountId,
        date: {
          gte: prevPeriod.from,
          lte: prevPeriod.to,
        },
        ...(metricTypes && { metricType: { in: metricTypes } }),
      },
      _sum: { value: true },
      _avg: { value: true },
      _min: { value: true },
      _max: { value: true },
      _count: { value: true },
    })) as unknown as MetricGroupResult[]
  }

  // Build result
  const result: AggregatedMetric[] = []

  for (const metric of currentMetrics) {
    const prevMetric = previousMetrics.find((m) => m.metricType === metric.metricType)

    let value: number
    switch (aggregation) {
      case 'sum':
        value = metric._sum.value || 0
        break
      case 'avg':
        value = metric._avg.value || 0
        break
      case 'min':
        value = metric._min.value || 0
        break
      case 'max':
        value = metric._max.value || 0
        break
      case 'count':
        value = metric._count.value || 0
        break
      default:
        value = metric._sum.value || 0
    }

    let previousValue: number | undefined
    if (prevMetric) {
      switch (aggregation) {
        case 'sum':
          previousValue = prevMetric._sum.value || 0
          break
        case 'avg':
          previousValue = prevMetric._avg.value || 0
          break
        case 'min':
          previousValue = prevMetric._min.value || 0
          break
        case 'max':
          previousValue = prevMetric._max.value || 0
          break
        case 'count':
          previousValue = prevMetric._count.value || 0
          break
        default:
          previousValue = prevMetric._sum.value || 0
      }
    }

    const change = previousValue !== undefined ? value - previousValue : undefined
    const changePercent =
      previousValue !== undefined && previousValue !== 0
        ? ((value - previousValue) / previousValue) * 100
        : undefined

    result.push({
      metricType: metric.metricType,
      value,
      previousValue,
      change,
      changePercent,
    })
  }

  return result
}

/**
 * Get trend data for a metric
 */
export async function getTrends(
  accountId: string,
  metricType: string,
  dateRange: DateRange,
  granularity: Granularity = 'day'
): Promise<TrendDataPoint[]> {
  const metrics = await prisma.platformMetricEntry.findMany({
    where: {
      accountId,
      metricType,
      date: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    orderBy: { date: 'asc' },
  })

  // Group by date
  const byDate = new Map<string, number>()

  for (const metric of metrics) {
    let key: string
    const date = new Date(metric.date)

    switch (granularity) {
      case 'day':
        key = format(date, 'yyyy-MM-dd')
        break
      case 'week':
        key = format(date, "yyyy-'W'ww")
        break
      case 'month':
        key = format(date, 'yyyy-MM')
        break
      default:
        key = format(date, 'yyyy-MM-dd')
    }

    byDate.set(key, (byDate.get(key) || 0) + metric.value)
  }

  // Fill in missing dates for daily granularity
  if (granularity === 'day') {
    const allDates = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
    for (const date of allDates) {
      const key = format(date, 'yyyy-MM-dd')
      if (!byDate.has(key)) {
        byDate.set(key, 0)
      }
    }
  }

  // Convert to array and sort
  const result: TrendDataPoint[] = Array.from(byDate.entries())
    .map(([date, value]) => ({
      date,
      value,
      label: formatDateLabel(date, granularity),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return result
}

/**
 * Format date label for charts
 */
function formatDateLabel(dateStr: string, granularity: Granularity): string {
  switch (granularity) {
    case 'day':
      return format(new Date(dateStr), 'MMM d')
    case 'week':
      return dateStr
    case 'month':
      return format(new Date(dateStr + '-01'), 'MMM yyyy')
    default:
      return dateStr
  }
}

/**
 * Compare two periods
 */
export async function comparePeriods(
  accountId: string,
  period1: DateRange,
  period2: DateRange,
  metricTypes?: string[]
): Promise<{
  period1: AggregatedMetric[]
  period2: AggregatedMetric[]
  comparison: Array<{
    metricType: string
    period1Value: number
    period2Value: number
    change: number
    changePercent: number
  }>
}> {
  const [metrics1, metrics2] = await Promise.all([
    getMetrics(accountId, period1, { metricTypes, includePrevious: false }),
    getMetrics(accountId, period2, { metricTypes, includePrevious: false }),
  ])

  const comparison: Array<{
    metricType: string
    period1Value: number
    period2Value: number
    change: number
    changePercent: number
  }> = []

  for (const m1 of metrics1) {
    const m2 = metrics2.find((m) => m.metricType === m1.metricType)
    const period2Value = m2?.value || 0
    const change = m1.value - period2Value
    const changePercent = period2Value !== 0 ? (change / period2Value) * 100 : 0

    comparison.push({
      metricType: m1.metricType,
      period1Value: m1.value,
      period2Value,
      change,
      changePercent,
    })
  }

  return { period1: metrics1, period2: metrics2, comparison }
}

/**
 * Get dimension breakdown for a metric
 */
export async function getDimensionBreakdown(
  accountId: string,
  metricType: string,
  dateRange: DateRange,
  dimension: string
): Promise<DimensionBreakdown[]> {
  const metrics = await prisma.platformMetricEntry.groupBy({
    by: ['dimensionValue'],
    where: {
      accountId,
      metricType,
      dimension,
      dimensionValue: { not: null },
      date: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    _sum: { value: true },
    orderBy: { _sum: { value: 'desc' } },
    take: 10,
  })

  const total = metrics.reduce((sum, m) => sum + (m._sum.value || 0), 0)

  return metrics.map((m) => ({
    dimension,
    dimensionValue: m.dimensionValue || 'Unknown',
    value: m._sum.value || 0,
    percentage: total > 0 ? ((m._sum.value || 0) / total) * 100 : 0,
  }))
}

/**
 * Get all metrics for a client across all platforms
 */
export async function getClientMetrics(
  clientId: string,
  dateRange: DateRange
): Promise<
  Array<{
    platform: Platform
    accountId: string
    accountName: string
    metrics: AggregatedMetric[]
  }>
> {
  const accounts = await prisma.clientPlatformAccount.findMany({
    where: { clientId, isActive: true },
  })

  const results = await Promise.all(
    accounts.map(async (account) => {
      const platformConfig = PLATFORM_CONFIG[account.platform as Platform]
      const metrics = await getMetrics(account.id, dateRange, {
        metricTypes: platformConfig?.metrics,
      })

      return {
        platform: account.platform as Platform,
        accountId: account.id,
        accountName: account.accountName,
        metrics,
      }
    })
  )

  return results
}

/**
 * Get top performing dimensions
 */
export async function getTopDimensions(
  accountId: string,
  metricType: string,
  dimension: string,
  dateRange: DateRange,
  limit: number = 10
): Promise<Array<{ dimensionValue: string; value: number; trend: TrendDataPoint[] }>> {
  const breakdown = await getDimensionBreakdown(accountId, metricType, dateRange, dimension)
  const topDimensions = breakdown.slice(0, limit)

  // Get trends for each top dimension
  const results = await Promise.all(
    topDimensions.map(async (d) => {
      const metrics = await prisma.platformMetricEntry.findMany({
        where: {
          accountId,
          metricType,
          dimension,
          dimensionValue: d.dimensionValue,
          date: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        orderBy: { date: 'asc' },
      })

      const trend: TrendDataPoint[] = metrics.map((m) => ({
        date: format(new Date(m.date), 'yyyy-MM-dd'),
        value: m.value,
        label: format(new Date(m.date), 'MMM d'),
      }))

      return {
        dimensionValue: d.dimensionValue,
        value: d.value,
        trend,
      }
    })
  )

  return results
}

/**
 * Get metrics summary for quick overview
 */
export async function getMetricsSummary(
  accountId: string,
  dateRange: DateRange
): Promise<{
  totalMetrics: number
  latestDate: Date | null
  earliestDate: Date | null
  metricTypes: string[]
}> {
  const [count, latestEntry, earliestEntry, metricTypes] = await Promise.all([
    prisma.platformMetricEntry.count({
      where: {
        accountId,
        date: { gte: dateRange.from, lte: dateRange.to },
      },
    }),
    prisma.platformMetricEntry.findFirst({
      where: { accountId },
      orderBy: { date: 'desc' },
      select: { date: true },
    }),
    prisma.platformMetricEntry.findFirst({
      where: { accountId },
      orderBy: { date: 'asc' },
      select: { date: true },
    }),
    prisma.platformMetricEntry.findMany({
      where: { accountId },
      distinct: ['metricType'],
      select: { metricType: true },
    }),
  ])

  return {
    totalMetrics: count,
    latestDate: latestEntry?.date || null,
    earliestDate: earliestEntry?.date || null,
    metricTypes: metricTypes.map((m) => m.metricType),
  }
}
