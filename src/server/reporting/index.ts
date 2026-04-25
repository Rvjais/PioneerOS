/**
 * Unified Reporting System
 *
 * A comprehensive reporting library for generating, transforming, and exporting reports.
 *
 * @example
 * ```typescript
 * import { ReportBuilder, Reports } from '@/server/reporting'
 *
 * // Create a simple report
 * const report = ReportBuilder.create('Monthly Sales')
 *   .type('TACTICAL')
 *   .category('SALES')
 *   .dateRangePreset('this_month')
 *   .addColumns([
 *     { key: 'client', label: 'Client', type: 'text' },
 *     { key: 'revenue', label: 'Revenue', type: 'currency', align: 'right' },
 *   ])
 *   .setData(salesData)
 *   .addCalculatedMetric('total', 'Total Revenue', totalRevenue, previousRevenue, { format: 'currency' })
 *   .addHighlight('Revenue increased by 15% this month')
 *   .build()
 *
 * // Export to different formats
 * const html = report.toHTML()  // For PDF printing
 * const csv = report.toCSV()    // For spreadsheet import
 * const excel = report.toExcel() // Native Excel format
 * ```
 */

// Types
export * from './types'

// Data Transformation Utilities
export {
  getDateRangeFromPreset,
  getComparisonDateRange,
  formatCurrency,
  formatCompactNumber,
  formatPercentage,
  formatNumber,
  formatDate,
  formatDateTime,
  formatMonthYear,
  sumField,
  avgField,
  countField,
  minField,
  maxField,
  groupBy,
  aggregateGroups,
  calculateChange,
  createMetric,
  formatValue,
  serializeData,
} from './transforms'

// PDF Generation
export {
  generateReportHTML,
  generateInvoicePDF,
} from './pdf-generator'

// Excel/CSV Generation
export {
  generateCSV,
  generateExcelXML,
  createDownloadableFile,
  getMimeType,
  getFileExtension,
} from './excel-generator'

// Report Builder
export {
  ReportBuilder,
  Reports,
} from './report-builder'

// Default export
export { ReportBuilder as default } from './report-builder'
