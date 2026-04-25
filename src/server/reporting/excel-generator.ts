/**
 * Unified Reporting System - Excel/CSV Generator
 * Pure TypeScript implementation (no external dependencies)
 */

import { ReportData, ReportColumn, ExcelStyles, ReportRow } from './types'
import { formatValue } from './transforms'

const DEFAULT_EXCEL_STYLES: ExcelStyles = {
  headerStyle: {
    fill: '#1e293b',
    color: '#ffffff',
    bold: true,
  },
  alternateRows: true,
  freezeHeader: true,
  autoWidth: true,
}

/**
 * Generate CSV content from report data
 */
export function generateCSV(
  data: ReportData,
  options: {
    delimiter?: string
    includeHeaders?: boolean
    quoteStrings?: boolean
  } = {}
): string {
  const {
    delimiter = ',',
    includeHeaders = true,
    quoteStrings = true,
  } = options

  const { config, rows } = data
  const columns = config.columns || []

  if (columns.length === 0) {
    // Auto-detect columns from first row
    if (rows.length > 0) {
      Object.keys(rows[0]).forEach(key => {
        columns.push({ key, label: key, type: 'text' })
      })
    }
  }

  const lines: string[] = []

  // Header row
  if (includeHeaders) {
    const headerRow = columns.map(col => escapeCSV(col.label, delimiter, quoteStrings))
    lines.push(headerRow.join(delimiter))
  }

  // Data rows
  for (const row of rows) {
    const values = columns.map(col => {
      const value = formatValue(row[col.key], col)
      return escapeCSV(value, delimiter, quoteStrings)
    })
    lines.push(values.join(delimiter))
  }

  return lines.join('\n')
}

/**
 * Escape a value for CSV
 */
function escapeCSV(value: string, delimiter: string, quoteStrings: boolean): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  // Check if quoting is needed
  const needsQuoting =
    str.includes(delimiter) ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r') ||
    (quoteStrings && isNaN(Number(str)))

  if (needsQuoting) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Generate Excel XML (SpreadsheetML format)
 * This creates a valid Excel file without external libraries
 */
export function generateExcelXML(
  data: ReportData,
  styles: Partial<ExcelStyles> = {}
): string {
  const s = { ...DEFAULT_EXCEL_STYLES, ...styles }
  const { config, metadata, rows } = data
  const columns = config.columns || autoDetectColumns(rows)

  const worksheetName = config.name.substring(0, 31).replace(/[\\/*?[\]:]/g, '')

  // Generate column widths
  const columnWidths = columns.map((col, idx) => {
    if (s.autoWidth) {
      const maxLength = Math.max(
        col.label.length,
        ...rows.slice(0, 100).map(row => String(row[col.key] || '').length)
      )
      return Math.min(Math.max(maxLength * 1.2, 10), 50)
    }
    return 15
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">

  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>${escapeXML(config.name)}</Title>
    <Author>${escapeXML(metadata.generatedBy || 'System')}</Author>
    <Created>${metadata.generatedAt.toISOString()}</Created>
  </DocumentProperties>

  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="${s.headerStyle?.color || '#ffffff'}"/>
      <Interior ss:Color="${s.headerStyle?.fill || '#1e293b'}" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      </Borders>
    </Style>
    <Style ss:ID="Number">
      <NumberFormat ss:Format="#,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="₹#,##0.00"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="Percentage">
      <NumberFormat ss:Format="0.0%"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="Date">
      <NumberFormat ss:Format="dd-mmm-yyyy"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="AltRow">
      <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
    </Style>
  </Styles>

  <Worksheet ss:Name="${escapeXML(worksheetName)}">
    <Table ss:DefaultColumnWidth="80" ss:DefaultRowHeight="20">
      ${columnWidths.map((w, i) => `<Column ss:Index="${i + 1}" ss:Width="${w * 7}"/>`).join('\n      ')}

      <!-- Header Row -->
      <Row ss:StyleID="Header" ss:Height="25">
        ${columns.map(col => `
        <Cell><Data ss:Type="String">${escapeXML(col.label)}</Data></Cell>
        `).join('')}
      </Row>

      <!-- Data Rows -->
      ${rows.map((row, rowIdx) => `
      <Row${s.alternateRows && rowIdx % 2 === 1 ? ' ss:StyleID="AltRow"' : ''}>
        ${columns.map(col => generateCell(row[col.key], col)).join('')}
      </Row>
      `).join('')}
    </Table>

    ${s.freezeHeader ? `
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
    ` : ''}
  </Worksheet>

  <!-- Summary Sheet if available -->
  ${data.summary ? generateSummarySheet(data.summary) : ''}

</Workbook>`
}

/**
 * Generate a cell element
 */
function generateCell(value: unknown, column: ReportColumn): string {
  if (value === null || value === undefined) {
    return '<Cell><Data ss:Type="String"></Data></Cell>'
  }

  let dataType = 'String'
  let styleId = ''
  let formattedValue = String(value)

  switch (column.type) {
    case 'number':
      dataType = 'Number'
      styleId = ' ss:StyleID="Number"'
      formattedValue = String(Number(value) || 0)
      break

    case 'currency':
      dataType = 'Number'
      styleId = ' ss:StyleID="Currency"'
      formattedValue = String(Number(value) || 0)
      break

    case 'percentage':
      dataType = 'Number'
      styleId = ' ss:StyleID="Percentage"'
      // Values are already percentages (e.g., 45 = 45%), convert to decimal for Excel (0.45 = 45%)
      formattedValue = String((Number(value) || 0) / 100)
      break

    case 'date':
      dataType = 'DateTime'
      styleId = ' ss:StyleID="Date"'
      const date = value instanceof Date ? value : new Date(String(value))
      formattedValue = date.toISOString()
      break

    case 'boolean':
      dataType = 'String'
      formattedValue = value ? 'Yes' : 'No'
      break

    default:
      dataType = 'String'
      formattedValue = escapeXML(String(value))
  }

  return `<Cell${styleId}><Data ss:Type="${dataType}">${formattedValue}</Data></Cell>`
}

/**
 * Generate summary sheet
 */
function generateSummarySheet(summary: NonNullable<ReportData['summary']>): string {
  return `
  <Worksheet ss:Name="Summary">
    <Table>
      <Column ss:Width="150"/>
      <Column ss:Width="120"/>
      <Column ss:Width="100"/>

      <Row ss:StyleID="Header" ss:Height="25">
        <Cell><Data ss:Type="String">Metric</Data></Cell>
        <Cell><Data ss:Type="String">Value</Data></Cell>
        <Cell><Data ss:Type="String">Change</Data></Cell>
      </Row>

      ${summary.metrics.map(metric => `
      <Row>
        <Cell><Data ss:Type="String">${escapeXML(metric.label)}</Data></Cell>
        <Cell><Data ss:Type="${typeof metric.value === 'number' ? 'Number' : 'String'}">${metric.value}</Data></Cell>
        <Cell><Data ss:Type="String">${metric.change !== undefined ? `${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%` : '-'}</Data></Cell>
      </Row>
      `).join('')}
    </Table>
  </Worksheet>`
}

/**
 * Auto-detect columns from data
 */
function autoDetectColumns(rows: ReportRow[]): ReportColumn[] {
  if (rows.length === 0) return []

  const firstRow = rows[0]
  return Object.keys(firstRow).map(key => {
    const value = firstRow[key]
    let type: ReportColumn['type'] = 'text'

    if (typeof value === 'number') {
      type = 'number'
    } else if (value instanceof Date) {
      type = 'date'
    } else if (typeof value === 'boolean') {
      type = 'boolean'
    }

    return {
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      type,
    }
  })
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Create a downloadable file from content
 */
export function createDownloadableFile(
  content: string,
  filename: string,
  mimeType: string
): { blob: Blob; dataUrl: string } {
  const blob = new Blob([content], { type: mimeType })
  const dataUrl = URL.createObjectURL(blob)
  return { blob, dataUrl }
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: 'csv' | 'excel' | 'json'): string {
  switch (format) {
    case 'csv':
      return 'text/csv;charset=utf-8'
    case 'excel':
      return 'application/vnd.ms-excel'
    case 'json':
      return 'application/json'
    default:
      return 'text/plain'
  }
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: 'csv' | 'excel' | 'json'): string {
  switch (format) {
    case 'csv':
      return '.csv'
    case 'excel':
      return '.xls'
    case 'json':
      return '.json'
    default:
      return '.txt'
  }
}
