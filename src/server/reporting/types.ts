/**
 * Unified Reporting System - Types
 */

// Report types across all departments
export type ReportType =
  | 'TACTICAL'
  | 'STRATEGIC'
  | 'OPERATIONS'
  | 'PERFORMANCE'
  | 'FINANCIAL'
  | 'SUMMARY'
  | 'CUSTOM'

// Report categories/departments
export type ReportCategory =
  | 'SALES'
  | 'ADS'
  | 'SEO'
  | 'SOCIAL'
  | 'HR'
  | 'ACCOUNTS'
  | 'CLIENT'
  | 'FREELANCER'
  | 'DASHBOARD'

// Export formats
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html'

// Date range presets
export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom'

// Report configuration
export interface ReportConfig {
  id: string
  name: string
  type: ReportType
  category: ReportCategory
  description?: string
  dateRange: DateRange
  filters?: Record<string, unknown>
  columns?: ReportColumn[]
  groupBy?: string[]
  sortBy?: { field: string; order: 'asc' | 'desc' }[]
  includeCharts?: boolean
  includeSummary?: boolean
}

// Date range
export interface DateRange {
  preset?: DateRangePreset
  from: Date
  to: Date
}

// Report column definition
export interface ReportColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'boolean'
  width?: number | string
  align?: 'left' | 'center' | 'right'
  format?: string
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max'
}

// Report data structure
export interface ReportData {
  config: ReportConfig
  metadata: ReportMetadata
  summary?: ReportSummary
  rows: ReportRow[]
  charts?: ReportChart[]
}

// Report metadata
export interface ReportMetadata {
  generatedAt: Date
  generatedBy?: string
  totalRows: number
  filteredRows: number
  queryTimeMs: number
}

// Summary section
export interface ReportSummary {
  title: string
  metrics: ReportMetric[]
  highlights?: string[]
}

// Individual metric
export interface ReportMetric {
  key: string
  label: string
  value: number | string
  previousValue?: number | string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  unit?: string
  format?: 'number' | 'currency' | 'percentage'
}

// Report row (flexible)
export type ReportRow = Record<string, unknown>

// Chart configuration
export interface ReportChart {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut'
  title: string
  data: ChartData
  options?: Record<string, unknown>
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string
}

// Scheduled report configuration
export interface ScheduledReport {
  id: string
  reportConfig: ReportConfig
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  time: string // HH:MM format
  format: ExportFormat
  recipients: ReportRecipient[]
  enabled: boolean
  lastRunAt?: Date
  nextRunAt?: Date
}

export interface ReportRecipient {
  type: 'user' | 'email' | 'whatsapp' | 'slack'
  target: string // userId, email address, phone number, or channel
  name?: string
}

// PDF styling options
export interface PDFStyles {
  headerColor?: string
  accentColor?: string
  fontFamily?: string
  fontSize?: number
  showLogo?: boolean
  logoUrl?: string
  showFooter?: boolean
  footerText?: string
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'A4' | 'A3' | 'Letter'
}

// Excel styling options
export interface ExcelStyles {
  headerStyle?: {
    fill?: string
    color?: string
    bold?: boolean
  }
  alternateRows?: boolean
  freezeHeader?: boolean
  autoWidth?: boolean
}
