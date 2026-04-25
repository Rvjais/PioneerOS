/**
 * Data Import Service
 * Handles CSV, Excel, manual entry, and paste imports
 */

import prisma from '@/server/db/prisma'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Platform, PLATFORM_CONFIG } from './platform-accounts'

// Import sources
export const IMPORT_SOURCES = [
  'OAUTH_SYNC',
  'CSV_IMPORT',
  'EXCEL_IMPORT',
  'MANUAL_ENTRY',
  'PASTE_IMPORT',
] as const
export type ImportSource = (typeof IMPORT_SOURCES)[number]

// Import statuses
export const IMPORT_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const
export type ImportStatus = (typeof IMPORT_STATUSES)[number]

// Column mapping for imports
export interface ColumnMapping {
  date: string
  metricType?: string // If single metric per row
  value?: string // If single metric per row
  // Or metric-specific columns
  [metricKey: string]: string | undefined
}

// Parsed row from import
export interface ParsedRow {
  date: Date
  metrics: Array<{
    metricType: string
    value: number
    dimension?: string
    dimensionValue?: string
  }>
  errors: string[]
}

// Import result
export interface ImportResult {
  batchId: string
  totalRows: number
  successRows: number
  failedRows: number
  errors: Array<{ row: number; message: string }>
}

// CSV template definitions per platform
const CSV_TEMPLATES: Record<Platform, { headers: string[]; sampleRow: string[] }> = {
  GOOGLE_ANALYTICS: {
    headers: ['date', 'sessions', 'users', 'newUsers', 'pageviews', 'bounceRate', 'avgSessionDuration'],
    sampleRow: ['2024-01-01', '1000', '800', '300', '2500', '45.5', '120'],
  },
  GOOGLE_SEARCH_CONSOLE: {
    headers: ['date', 'impressions', 'clicks', 'ctr', 'position', 'query', 'page'],
    sampleRow: ['2024-01-01', '5000', '250', '5.0', '8.5', 'digital marketing', '/services'],
  },
  GOOGLE_ADS: {
    headers: ['date', 'impressions', 'clicks', 'cost', 'conversions', 'campaign'],
    sampleRow: ['2024-01-01', '10000', '500', '150.00', '25', 'Brand Campaign'],
  },
  META_ADS: {
    headers: ['date', 'impressions', 'reach', 'clicks', 'spend', 'conversions', 'campaign'],
    sampleRow: ['2024-01-01', '15000', '12000', '600', '200.00', '30', 'Awareness Campaign'],
  },
  META_SOCIAL: {
    headers: ['date', 'followers', 'followersGained', 'posts', 'reach', 'engagement'],
    sampleRow: ['2024-01-01', '10000', '150', '3', '25000', '1500'],
  },
  LINKEDIN: {
    headers: ['date', 'followers', 'impressions', 'clicks', 'engagement'],
    sampleRow: ['2024-01-01', '5000', '8000', '200', '400'],
  },
  YOUTUBE: {
    headers: ['date', 'subscribers', 'views', 'watchTime', 'avgViewDuration', 'likes', 'comments'],
    sampleRow: ['2024-01-01', '10000', '5000', '15000', '180', '250', '45'],
  },
}

/**
 * Generate CSV template for a platform
 */
export function getCSVTemplate(platform: Platform): string {
  const template = CSV_TEMPLATES[platform]
  if (!template) {
    throw new Error(`No template available for platform: ${platform}`)
  }

  const csv = Papa.unparse({
    fields: template.headers,
    data: [template.sampleRow],
  })

  return csv
}

/**
 * Get Excel template for a platform
 */
export function getExcelTemplate(platform: Platform): Buffer {
  const template = CSV_TEMPLATES[platform]
  if (!template) {
    throw new Error(`No template available for platform: ${platform}`)
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([template.headers, template.sampleRow])

  // Set column widths
  worksheet['!cols'] = template.headers.map(() => ({ wch: 15 }))

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  // Add instructions sheet
  const instructions = [
    ['Import Instructions'],
    [''],
    ['1. Fill in your data starting from row 2'],
    ['2. Date format should be YYYY-MM-DD'],
    ['3. All metric values should be numbers'],
    ['4. Optional: Add dimension columns (e.g., campaign, source)'],
    ['5. Save and upload the file'],
    [''],
    ['Metrics Reference:'],
    ...PLATFORM_CONFIG[platform].metrics.map((m) => [`- ${m}`]),
  ]

  const instructionSheet = XLSX.utils.aoa_to_sheet(instructions)
  XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions')

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

/**
 * Parse CSV content
 */
export async function parseCSV(
  content: string,
  platform: Platform,
  columnMapping?: ColumnMapping
): Promise<{ rows: ParsedRow[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('No data found in CSV'))
          return
        }

        const headers = results.meta.fields || []
        const platformMetrics = PLATFORM_CONFIG[platform].metrics

        // Auto-detect or use provided mapping
        const mapping = columnMapping || autoDetectMapping(headers, platformMetrics)

        const rows = results.data.map((row, index) => parseRow(row, mapping, platformMetrics, index + 2))

        resolve({ rows, headers })
      },
      error: (error) => reject(error),
    })
  })
}

/**
 * Parse Excel file
 */
export async function parseExcel(
  buffer: Buffer,
  platform: Platform,
  sheetName?: string,
  columnMapping?: ColumnMapping
): Promise<{ rows: ParsedRow[]; headers: string[]; sheets: string[] }> {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })

  const sheets = workbook.SheetNames.filter((s) => s !== 'Instructions')
  const targetSheet = sheetName || sheets[0]

  if (!workbook.Sheets[targetSheet]) {
    throw new Error(`Sheet "${targetSheet}" not found`)
  }

  const worksheet = workbook.Sheets[targetSheet]
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    dateNF: 'yyyy-mm-dd',
  }) as unknown[][]

  if (jsonData.length < 2) {
    throw new Error('No data found in Excel file')
  }

  // First row is headers
  const headerRow = jsonData[0]
  const headers = headerRow.map((h) => String(h || '').trim().toLowerCase())
  const platformMetrics = PLATFORM_CONFIG[platform].metrics

  // Auto-detect or use provided mapping
  const mapping = columnMapping || autoDetectMapping(headers, platformMetrics)

  // Process data rows
  const rows: ParsedRow[] = []
  for (let i = 1; i < jsonData.length; i++) {
    const rowData = jsonData[i]
    const rowObj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      rowObj[h] = rowData[idx] !== undefined ? String(rowData[idx]) : ''
    })
    rows.push(parseRow(rowObj, mapping, platformMetrics, i + 1))
  }

  return { rows, headers, sheets }
}

/**
 * Parse pasted data (tab or comma separated)
 */
export async function parsePastedData(
  text: string,
  platform: Platform,
  columnMapping?: ColumnMapping
): Promise<{ rows: ParsedRow[]; headers: string[] }> {
  // Detect delimiter
  const firstLine = text.split('\n')[0]
  const delimiter = firstLine.includes('\t') ? '\t' : ','

  // Convert to CSV format
  const csvContent = text
    .split('\n')
    .map((line) => line.split(delimiter).map((cell) => `"${cell.trim().replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return parseCSV(csvContent, platform, columnMapping)
}

/**
 * Auto-detect column mapping based on headers
 */
function autoDetectMapping(headers: string[], metrics: string[]): ColumnMapping {
  const mapping: ColumnMapping = { date: '' }

  // Find date column
  const dateCol = headers.find(
    (h) => h === 'date' || h.includes('date') || h === 'day' || h === 'period'
  )
  if (dateCol) {
    mapping.date = dateCol
  }

  // Find metric columns
  for (const metric of metrics) {
    const col = headers.find((h) => h === metric.toLowerCase() || h.includes(metric.toLowerCase()))
    if (col) {
      mapping[metric] = col
    }
  }

  return mapping
}

/**
 * Parse a single row of data
 */
function parseRow(
  row: Record<string, string>,
  mapping: ColumnMapping,
  metrics: string[],
  rowNumber: number
): ParsedRow {
  const errors: string[] = []
  const parsedMetrics: ParsedRow['metrics'] = []

  // Parse date
  let date: Date | null = null
  if (mapping.date && row[mapping.date]) {
    const dateStr = row[mapping.date]
    date = parseDate(dateStr)
    if (!date) {
      errors.push(`Invalid date format: ${dateStr}`)
    }
  } else {
    errors.push('Missing date')
  }

  // Parse metrics
  for (const metric of metrics) {
    const colName = mapping[metric]
    if (colName && row[colName] !== undefined && row[colName] !== '') {
      const value = parseFloat(row[colName])
      if (!isNaN(value)) {
        parsedMetrics.push({
          metricType: metric,
          value,
        })
      } else if (row[colName].trim() !== '') {
        errors.push(`Invalid value for ${metric}: ${row[colName]}`)
      }
    }
  }

  // Check for dimension columns (campaign, source, page, etc.)
  const dimensionCols = ['campaign', 'source', 'page', 'query', 'medium', 'device']
  for (const dimCol of dimensionCols) {
    if (row[dimCol] && row[dimCol].trim() !== '') {
      // Add dimension to all metrics in this row
      for (const m of parsedMetrics) {
        m.dimension = dimCol
        m.dimensionValue = row[dimCol]
      }
      break // Only use first dimension found
    }
  }

  return {
    date: date || new Date(0),
    metrics: parsedMetrics,
    errors,
  }
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  // Try ISO format first
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date
  }

  // Try DD/MM/YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (ddmmyyyy) {
    date = new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]))
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Try MM/DD/YYYY
  const mmddyyyy = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (mmddyyyy) {
    date = new Date(parseInt(mmddyyyy[3]), parseInt(mmddyyyy[1]) - 1, parseInt(mmddyyyy[2]))
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  return null
}

/**
 * Import metrics to database
 */
export async function importMetrics(
  accountId: string,
  rows: ParsedRow[],
  source: ImportSource,
  createdBy: string,
  clientId: string,
  platform: Platform,
  fileName?: string
): Promise<ImportResult> {
  // Create import batch
  const batch = await prisma.dataImportBatch.create({
    data: {
      clientId,
      platform,
      accountId,
      importType: source.replace('_IMPORT', '').replace('_ENTRY', ''),
      fileName,
      totalRows: rows.length,
      successRows: 0,
      failedRows: 0,
      status: 'PROCESSING',
      createdBy,
    },
  })

  let successRows = 0
  let failedRows = 0
  const errors: Array<{ row: number; message: string }> = []

  // Process rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    if (row.errors.length > 0 || row.metrics.length === 0) {
      failedRows++
      errors.push({
        row: i + 2, // Account for header row
        message: row.errors.join('; ') || 'No valid metrics found',
      })
      continue
    }

    try {
      // Create metric entries
      await prisma.platformMetricEntry.createMany({
        data: row.metrics.map((m) => ({
          accountId,
          date: row.date,
          metricType: m.metricType,
          value: m.value,
          dimension: m.dimension,
          dimensionValue: m.dimensionValue,
          importSource: source,
          importBatchId: batch.id,
          createdBy,
        })),
      })
      successRows++
    } catch (error) {
      failedRows++
      errors.push({
        row: i + 2,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Update batch status
  await prisma.dataImportBatch.update({
    where: { id: batch.id },
    data: {
      successRows,
      failedRows,
      errorLog: errors.length > 0 ? JSON.stringify(errors) : null,
      status: failedRows === rows.length ? 'FAILED' : 'COMPLETED',
      completedAt: new Date(),
    },
  })

  return {
    batchId: batch.id,
    totalRows: rows.length,
    successRows,
    failedRows,
    errors,
  }
}

/**
 * Add manual metric entry
 */
export async function addManualEntry(
  accountId: string,
  date: Date,
  metrics: Array<{ metricType: string; value: number; dimension?: string; dimensionValue?: string }>,
  createdBy: string,
  clientId: string,
  platform: Platform
): Promise<ImportResult> {
  // Create a batch for tracking
  const batch = await prisma.dataImportBatch.create({
    data: {
      clientId,
      platform,
      accountId,
      importType: 'MANUAL',
      totalRows: metrics.length,
      successRows: 0,
      failedRows: 0,
      status: 'PROCESSING',
      createdBy,
    },
  })

  try {
    await prisma.platformMetricEntry.createMany({
      data: metrics.map((m) => ({
        accountId,
        date,
        metricType: m.metricType,
        value: m.value,
        dimension: m.dimension,
        dimensionValue: m.dimensionValue,
        importSource: 'MANUAL_ENTRY',
        importBatchId: batch.id,
        createdBy,
      })),
    })

    await prisma.dataImportBatch.update({
      where: { id: batch.id },
      data: {
        successRows: metrics.length,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    return {
      batchId: batch.id,
      totalRows: metrics.length,
      successRows: metrics.length,
      failedRows: 0,
      errors: [],
    }
  } catch (error) {
    await prisma.dataImportBatch.update({
      where: { id: batch.id },
      data: {
        failedRows: metrics.length,
        status: 'FAILED',
        errorLog: JSON.stringify([{ row: 1, message: error instanceof Error ? error.message : 'Unknown error' }]),
        completedAt: new Date(),
      },
    })

    throw error
  }
}

/**
 * Get import batches for a client
 */
export async function getImportBatches(
  clientId: string,
  options?: { platform?: Platform; limit?: number }
) {
  const batches = await prisma.dataImportBatch.findMany({
    where: {
      clientId,
      ...(options?.platform && { platform: options.platform }),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
  })

  return batches.map((batch) => ({
    ...batch,
    errorLog: batch.errorLog ? JSON.parse(batch.errorLog) : null,
  }))
}

/**
 * Delete an import batch and its metrics
 */
export async function deleteImportBatch(batchId: string) {
  // Delete metrics first
  await prisma.platformMetricEntry.deleteMany({
    where: { importBatchId: batchId },
  })

  // Delete batch
  await prisma.dataImportBatch.delete({
    where: { id: batchId },
  })

  return { deleted: true }
}
