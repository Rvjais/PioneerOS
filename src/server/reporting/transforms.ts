/**
 * Unified Reporting System - Data Transformations
 */

import { DateRange, DateRangePreset, ReportColumn, ReportMetric, ReportRow } from './types'

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Get date range from preset
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case 'today':
      return { preset, from: today, to: now }

    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const endOfYesterday = new Date(yesterday)
      endOfYesterday.setHours(23, 59, 59, 999)
      return { preset, from: yesterday, to: endOfYesterday }
    }

    case 'this_week': {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      return { preset, from: startOfWeek, to: now }
    }

    case 'last_week': {
      const startOfLastWeek = new Date(today)
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
      const endOfLastWeek = new Date(startOfLastWeek)
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
      endOfLastWeek.setHours(23, 59, 59, 999)
      return { preset, from: startOfLastWeek, to: endOfLastWeek }
    }

    case 'this_month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return { preset, from: startOfMonth, to: now }
    }

    case 'last_month': {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      endOfLastMonth.setHours(23, 59, 59, 999)
      return { preset, from: startOfLastMonth, to: endOfLastMonth }
    }

    case 'this_quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1)
      return { preset, from: startOfQuarter, to: now }
    }

    case 'last_quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const lastQuarterStart = quarter === 0 ? -3 : (quarter - 1) * 3
      const lastQuarterYear = quarter === 0 ? now.getFullYear() - 1 : now.getFullYear()
      const startOfLastQuarter = new Date(lastQuarterYear, quarter === 0 ? 9 : lastQuarterStart, 1)
      const endOfLastQuarter = new Date(now.getFullYear(), quarter * 3, 0)
      endOfLastQuarter.setHours(23, 59, 59, 999)
      return { preset, from: startOfLastQuarter, to: endOfLastQuarter }
    }

    case 'this_year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      return { preset, from: startOfYear, to: now }
    }

    case 'last_year': {
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1)
      const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      return { preset, from: startOfLastYear, to: endOfLastYear }
    }

    default:
      return { preset: 'this_month', from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
  }
}

/**
 * Get comparison date range (previous period)
 */
export function getComparisonDateRange(dateRange: DateRange): DateRange {
  const duration = dateRange.to.getTime() - dateRange.from.getTime()
  const from = new Date(dateRange.from.getTime() - duration)
  const to = new Date(dateRange.from.getTime() - 1)
  return { from, to }
}

// ============================================
// NUMBER FORMATTING
// ============================================

/**
 * Format currency (INR by default)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format number with abbreviation (K, L, Cr)
 */
export function formatCompactNumber(value: number, locale: string = 'en-IN'): string {
  if (locale === 'en-IN') {
    if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`
    if (value >= 100000) return `${(value / 100000).toFixed(2)} L`
    if (value >= 1000) return `${(value / 1000).toFixed(1)} K`
    return value.toFixed(0)
  }

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, locale: string = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(value)
}

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-IN'
): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const formatOptions: Record<typeof format, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: '2-digit' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }

  return new Intl.DateTimeFormat(locale, formatOptions[format]).format(d)
}

/**
 * Format date-time for display
 */
export function formatDateTime(
  date: Date | string,
  locale: string = 'en-IN'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format month-year
 */
export function formatMonthYear(date: Date | string, locale: string = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d)
}

// ============================================
// DATA AGGREGATION
// ============================================

/**
 * Sum values for a field
 */
export function sumField(rows: ReportRow[], field: string): number {
  return rows.reduce((sum, row) => sum + (Number(row[field]) || 0), 0)
}

/**
 * Average values for a field
 */
export function avgField(rows: ReportRow[], field: string): number {
  if (rows.length === 0) return 0
  return sumField(rows, field) / rows.length
}

/**
 * Count non-null values for a field
 */
export function countField(rows: ReportRow[], field: string): number {
  return rows.filter(row => row[field] != null).length
}

/**
 * Get min value for a field
 */
export function minField(rows: ReportRow[], field: string): number {
  if (rows.length === 0) return 0
  return Math.min(...rows.map(row => Number(row[field]) || 0))
}

/**
 * Get max value for a field
 */
export function maxField(rows: ReportRow[], field: string): number {
  if (rows.length === 0) return 0
  return Math.max(...rows.map(row => Number(row[field]) || 0))
}

/**
 * Group rows by a field
 */
export function groupBy<T extends ReportRow>(
  rows: T[],
  field: string
): Record<string, T[]> {
  return rows.reduce((groups, row) => {
    const key = String(row[field] ?? 'Unknown')
    if (!groups[key]) groups[key] = []
    groups[key].push(row)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Aggregate grouped data
 */
export function aggregateGroups(
  groups: Record<string, ReportRow[]>,
  aggregations: { field: string; type: 'sum' | 'avg' | 'count' | 'min' | 'max' }[]
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {}

  for (const [groupKey, rows] of Object.entries(groups)) {
    result[groupKey] = {}
    for (const agg of aggregations) {
      switch (agg.type) {
        case 'sum': result[groupKey][agg.field] = sumField(rows, agg.field); break
        case 'avg': result[groupKey][agg.field] = avgField(rows, agg.field); break
        case 'count': result[groupKey][agg.field] = countField(rows, agg.field); break
        case 'min': result[groupKey][agg.field] = minField(rows, agg.field); break
        case 'max': result[groupKey][agg.field] = maxField(rows, agg.field); break
      }
    }
  }

  return result
}

// ============================================
// METRIC CALCULATIONS
// ============================================

/**
 * Calculate change percentage between two values
 */
export function calculateChange(current: number, previous: number): {
  change: number
  changePercent: number
  changeType: 'increase' | 'decrease' | 'neutral'
} {
  const change = current - previous
  const changePercent = previous === 0 ? (current > 0 ? 100 : 0) : ((change / previous) * 100)
  const changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral'

  return { change, changePercent, changeType }
}

/**
 * Create a metric object
 */
export function createMetric(
  key: string,
  label: string,
  current: number,
  previous?: number,
  options?: {
    format?: 'number' | 'currency' | 'percentage'
    unit?: string
  }
): ReportMetric {
  const metric: ReportMetric = {
    key,
    label,
    value: current,
    format: options?.format,
    unit: options?.unit,
  }

  if (previous !== undefined) {
    const { change, changePercent, changeType } = calculateChange(current, previous)
    metric.previousValue = previous
    metric.change = changePercent
    metric.changeType = changeType
  }

  return metric
}

// ============================================
// VALUE FORMATTING BY COLUMN TYPE
// ============================================

/**
 * Format a value based on column type
 */
export function formatValue(
  value: unknown,
  column: ReportColumn,
  locale: string = 'en-IN'
): string {
  if (value == null) return '-'

  switch (column.type) {
    case 'number':
      return formatNumber(Number(value), locale)

    case 'currency':
      return formatCurrency(Number(value), 'INR', locale)

    case 'percentage':
      return formatPercentage(Number(value))

    case 'date':
      return formatDate(value as Date | string, 'medium', locale)

    case 'boolean':
      return value ? 'Yes' : 'No'

    case 'text':
    default:
      return String(value)
  }
}

// ============================================
// DATA SERIALIZATION
// ============================================

/**
 * Serialize data for JSON (handles Dates, BigInt, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- recursive serializer intentionally widens types
export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) return data
  // Double assertions required: we transform Date->string / bigint->number
  // but the generic signature promises T for structural compatibility with callers.
  if (data instanceof Date) return data.toISOString() as unknown as T
  if (typeof data === 'bigint') return Number(data) as unknown as T
  if (Array.isArray(data)) return data.map(item => serializeData(item)) as unknown as T
  if (typeof data === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeData(value)
    }
    return result as T
  }
  return data
}
