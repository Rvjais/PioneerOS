/**
 * Unified Reporting System - Report Builder
 * Fluent API for building and generating reports
 */

import {
  ReportConfig,
  ReportData,
  ReportMetadata,
  ReportSummary,
  ReportMetric,
  ReportColumn,
  ReportRow,
  ReportChart,
  DateRange,
  DateRangePreset,
  ExportFormat,
  PDFStyles,
  ExcelStyles,
} from './types'
import {
  getDateRangeFromPreset,
  getComparisonDateRange,
  createMetric,
  sumField,
  avgField,
  groupBy,
  serializeData,
} from './transforms'
import { generateReportHTML } from './pdf-generator'
import { generateCSV, generateExcelXML, getMimeType, getFileExtension } from './excel-generator'

/**
 * Report Builder - Fluent API for creating reports
 */
export class ReportBuilder {
  private config: Partial<ReportConfig> = {}
  private dateRange: DateRange | null = null
  private columns: ReportColumn[] = []
  private rows: ReportRow[] = []
  private summary: ReportSummary | null = null
  private charts: ReportChart[] = []
  private metadata: Partial<ReportMetadata> = {}
  private pdfStyles: Partial<PDFStyles> = {}
  private excelStyles: Partial<ExcelStyles> = {}

  /**
   * Create a new report builder
   */
  static create(name: string): ReportBuilder {
    const builder = new ReportBuilder()
    builder.config.name = name
    builder.config.id = `report_${Date.now()}`
    return builder
  }

  /**
   * Set report type
   */
  type(type: ReportConfig['type']): this {
    this.config.type = type
    return this
  }

  /**
   * Set report category
   */
  category(category: ReportConfig['category']): this {
    this.config.category = category
    return this
  }

  /**
   * Set report description
   */
  description(description: string): this {
    this.config.description = description
    return this
  }

  /**
   * Set date range using preset
   */
  dateRangePreset(preset: DateRangePreset): this {
    this.dateRange = getDateRangeFromPreset(preset)
    return this
  }

  /**
   * Set custom date range
   */
  dateRangeCustom(from: Date, to: Date): this {
    this.dateRange = { preset: 'custom', from, to }
    return this
  }

  /**
   * Add a column definition
   */
  addColumn(column: ReportColumn): this {
    this.columns.push(column)
    return this
  }

  /**
   * Add multiple column definitions
   */
  addColumns(columns: ReportColumn[]): this {
    this.columns.push(...columns)
    return this
  }

  /**
   * Set data rows
   */
  setData(rows: ReportRow[]): this {
    this.rows = serializeData(rows)
    return this
  }

  /**
   * Add a single row
   */
  addRow(row: ReportRow): this {
    this.rows.push(serializeData(row))
    return this
  }

  /**
   * Set summary section
   */
  setSummary(title: string, metrics: ReportMetric[], highlights?: string[]): this {
    this.summary = { title, metrics, highlights }
    return this
  }

  /**
   * Add a metric to summary
   */
  addMetric(metric: ReportMetric): this {
    if (!this.summary) {
      this.summary = { title: 'Summary', metrics: [] }
    }
    this.summary.metrics.push(metric)
    return this
  }

  /**
   * Add a calculated metric (with auto comparison)
   */
  addCalculatedMetric(
    key: string,
    label: string,
    currentValue: number,
    previousValue?: number,
    options?: { format?: 'number' | 'currency' | 'percentage'; unit?: string }
  ): this {
    const metric = createMetric(key, label, currentValue, previousValue, options)
    return this.addMetric(metric)
  }

  /**
   * Add a highlight to summary
   */
  addHighlight(highlight: string): this {
    if (!this.summary) {
      this.summary = { title: 'Summary', metrics: [], highlights: [] }
    }
    if (!this.summary.highlights) {
      this.summary.highlights = []
    }
    this.summary.highlights.push(highlight)
    return this
  }

  /**
   * Add a chart
   */
  addChart(chart: ReportChart): this {
    this.charts.push(chart)
    return this
  }

  /**
   * Add a line chart from data
   */
  addLineChart(
    id: string,
    title: string,
    labels: string[],
    datasets: { label: string; data: number[]; color?: string }[]
  ): this {
    this.charts.push({
      id,
      type: 'line',
      title,
      data: {
        labels,
        datasets: datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color,
        })),
      },
    })
    return this
  }

  /**
   * Add a bar chart from grouped data
   */
  addBarChartFromData(
    id: string,
    title: string,
    groupByField: string,
    valueField: string
  ): this {
    const grouped = groupBy(this.rows, groupByField)
    const labels = Object.keys(grouped)
    const data = labels.map(label => sumField(grouped[label], valueField))

    this.charts.push({
      id,
      type: 'bar',
      title,
      data: {
        labels,
        datasets: [{ label: valueField, data }],
      },
    })
    return this
  }

  /**
   * Set metadata
   */
  setMetadata(generatedBy?: string): this {
    this.metadata.generatedBy = generatedBy
    return this
  }

  /**
   * Set PDF styling options
   */
  pdfOptions(styles: Partial<PDFStyles>): this {
    this.pdfStyles = { ...this.pdfStyles, ...styles }
    return this
  }

  /**
   * Set Excel styling options
   */
  excelOptions(styles: Partial<ExcelStyles>): this {
    this.excelStyles = { ...this.excelStyles, ...styles }
    return this
  }

  /**
   * Build the report data structure
   */
  build(): ReportData {
    const startTime = Date.now()

    if (!this.dateRange) {
      this.dateRange = getDateRangeFromPreset('this_month')
    }

    const reportData: ReportData = {
      config: {
        id: this.config.id || `report_${Date.now()}`,
        name: this.config.name || 'Untitled Report',
        type: this.config.type || 'CUSTOM',
        category: this.config.category || 'DASHBOARD',
        description: this.config.description,
        dateRange: this.dateRange,
        columns: this.columns,
        filters: this.config.filters,
        groupBy: this.config.groupBy,
        sortBy: this.config.sortBy,
        includeCharts: this.charts.length > 0,
        includeSummary: this.summary !== null,
      },
      metadata: {
        generatedAt: new Date(),
        generatedBy: this.metadata.generatedBy,
        totalRows: this.rows.length,
        filteredRows: this.rows.length,
        queryTimeMs: Date.now() - startTime,
      },
      rows: this.rows,
      summary: this.summary || undefined,
      charts: this.charts.length > 0 ? this.charts : undefined,
    }

    return reportData
  }

  /**
   * Export to specified format
   */
  export(format: ExportFormat): { content: string; mimeType: string; filename: string } {
    const data = this.build()
    const baseFilename = data.config.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()

    switch (format) {
      case 'pdf':
      case 'html':
        return {
          content: generateReportHTML(data, this.pdfStyles),
          mimeType: 'text/html',
          filename: `${baseFilename}.html`,
        }

      case 'excel':
        return {
          content: generateExcelXML(data, this.excelStyles),
          mimeType: getMimeType('excel'),
          filename: `${baseFilename}${getFileExtension('excel')}`,
        }

      case 'csv':
        return {
          content: generateCSV(data),
          mimeType: getMimeType('csv'),
          filename: `${baseFilename}${getFileExtension('csv')}`,
        }

      case 'json':
        return {
          content: JSON.stringify(data, null, 2),
          mimeType: getMimeType('json'),
          filename: `${baseFilename}.json`,
        }

      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Export to HTML (for PDF printing)
   */
  toHTML(): string {
    return this.export('html').content
  }

  /**
   * Export to CSV
   */
  toCSV(): string {
    return this.export('csv').content
  }

  /**
   * Export to Excel XML
   */
  toExcel(): string {
    return this.export('excel').content
  }

  /**
   * Export to JSON
   */
  toJSON(): string {
    return this.export('json').content
  }
}

/**
 * Quick helper to create common report types
 */
export const Reports = {
  /**
   * Create a simple table report
   */
  table(name: string, columns: ReportColumn[], data: ReportRow[]) {
    return ReportBuilder.create(name)
      .type('CUSTOM')
      .addColumns(columns)
      .setData(data)
  },

  /**
   * Create a performance report with metrics
   */
  performance(
    name: string,
    metrics: Array<{ key: string; label: string; current: number; previous?: number }>,
    highlights?: string[]
  ) {
    const builder = ReportBuilder.create(name).type('PERFORMANCE')

    for (const m of metrics) {
      builder.addCalculatedMetric(m.key, m.label, m.current, m.previous)
    }

    if (highlights) {
      for (const h of highlights) {
        builder.addHighlight(h)
      }
    }

    return builder
  },

  /**
   * Create a financial report
   */
  financial(
    name: string,
    revenue: number,
    expenses: number,
    previousRevenue?: number,
    previousExpenses?: number
  ) {
    const profit = revenue - expenses
    const previousProfit = previousRevenue && previousExpenses
      ? previousRevenue - previousExpenses
      : undefined

    return ReportBuilder.create(name)
      .type('FINANCIAL')
      .category('ACCOUNTS')
      .addCalculatedMetric('revenue', 'Revenue', revenue, previousRevenue, { format: 'currency' })
      .addCalculatedMetric('expenses', 'Expenses', expenses, previousExpenses, { format: 'currency' })
      .addCalculatedMetric('profit', 'Net Profit', profit, previousProfit, { format: 'currency' })
      .addHighlight(`Profit margin: ${((profit / revenue) * 100).toFixed(1)}%`)
  },
}

export default ReportBuilder
