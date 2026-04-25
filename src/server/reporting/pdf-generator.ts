/**
 * Unified Reporting System - PDF Generator
 * Generates print-ready HTML that can be saved as PDF
 */

import { ReportData, ReportColumn, PDFStyles, ReportMetric, ReportRow } from './types'
import { formatValue, formatCurrency, formatPercentage, formatDate } from './transforms'

const DEFAULT_STYLES: PDFStyles = {
  headerColor: '#1e293b',
  accentColor: '#3b82f6',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 12,
  showLogo: true,
  showFooter: true,
  footerText: '© Branding Pioneers',
  orientation: 'portrait',
  pageSize: 'A4',
}

/**
 * Generate a complete HTML report document
 */
export function generateReportHTML(
  data: ReportData,
  styles: Partial<PDFStyles> = {}
): string {
  const s = { ...DEFAULT_STYLES, ...styles }
  const { config, metadata, summary, rows, charts } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name}</title>
  <style>
    ${generateCSS(s)}
  </style>
</head>
<body>
  <div class="report-container">
    ${generateHeader(config.name, config.description, metadata, s)}
    ${summary ? generateSummarySection(summary) : ''}
    ${config.columns ? generateDataTable(rows, config.columns) : ''}
    ${s.showFooter ? generateFooter(s.footerText) : ''}
  </div>
  <script>
    // Auto-print on load (optional)
    // window.onload = () => window.print();
  </script>
</body>
</html>
`
}

/**
 * Generate CSS styles
 */
function generateCSS(styles: PDFStyles): string {
  return `
    @page {
      size: ${styles.pageSize} ${styles.orientation};
      margin: 1.5cm;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize}px;
      color: #1e293b;
      line-height: 1.5;
      background: white;
    }

    .report-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }

    /* Header */
    .report-header {
      border-bottom: 3px solid ${styles.accentColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .report-header h1 {
      color: ${styles.headerColor};
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .report-header .subtitle {
      color: #64748b;
      font-size: 14px;
    }

    .report-meta {
      display: flex;
      gap: 20px;
      margin-top: 15px;
      padding: 10px 15px;
      background: #f8fafc;
      border-radius: 8px;
      font-size: 12px;
      color: #64748b;
    }

    .report-meta span {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Summary Section */
    .summary-section {
      margin-bottom: 30px;
    }

    .summary-title {
      font-size: 16px;
      font-weight: 600;
      color: ${styles.headerColor};
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .metric-card {
      padding: 15px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .metric-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 700;
      color: ${styles.headerColor};
    }

    .metric-change {
      font-size: 11px;
      margin-top: 5px;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .metric-change.increase { color: #10b981; }
    .metric-change.decrease { color: #ef4444; }
    .metric-change.neutral { color: #64748b; }

    /* Highlights */
    .highlights {
      margin-top: 20px;
      padding: 15px;
      background: #eff6ff;
      border-left: 4px solid ${styles.accentColor};
      border-radius: 0 8px 8px 0;
    }

    .highlights h4 {
      font-size: 12px;
      color: ${styles.accentColor};
      margin-bottom: 10px;
    }

    .highlights ul {
      list-style: none;
      font-size: 13px;
    }

    .highlights li {
      padding: 4px 0;
      padding-left: 15px;
      position: relative;
    }

    .highlights li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${styles.accentColor};
    }

    /* Data Table */
    .data-table-section {
      margin-bottom: 30px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .data-table th {
      background: ${styles.headerColor};
      color: white;
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .data-table th:first-child { border-radius: 8px 0 0 0; }
    .data-table th:last-child { border-radius: 0 8px 0 0; }

    .data-table td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .data-table tr:hover {
      background: #f1f5f9;
    }

    .data-table tr:last-child td:first-child { border-radius: 0 0 0 8px; }
    .data-table tr:last-child td:last-child { border-radius: 0 0 8px 0; }

    .align-right { text-align: right; }
    .align-center { text-align: center; }

    /* Footer */
    .report-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }

    /* Utility */
    .text-success { color: #10b981; }
    .text-danger { color: #ef4444; }
    .text-warning { color: #f59e0b; }
    .text-muted { color: #64748b; }
  `
}

/**
 * Generate report header
 */
function generateHeader(
  title: string,
  description: string | undefined,
  metadata: ReportData['metadata'],
  styles: PDFStyles
): string {
  const dateRange = `Generated on ${formatDate(metadata.generatedAt, 'long')}`

  return `
    <header class="report-header">
      ${styles.showLogo ? `
        <div style="margin-bottom: 10px;">
          <img src="/logo.png" alt="Logo" style="height: 40px;" onerror="this.style.display='none'" />
        </div>
      ` : ''}
      <h1>${title}</h1>
      ${description ? `<p class="subtitle">${description}</p>` : ''}
      <div class="report-meta">
        <span>📅 ${dateRange}</span>
        <span>📊 ${metadata.totalRows} records</span>
        ${metadata.generatedBy ? `<span>👤 ${metadata.generatedBy}</span>` : ''}
      </div>
    </header>
  `
}

/**
 * Generate summary section with metrics
 */
function generateSummarySection(summary: ReportData['summary']): string {
  if (!summary) return ''

  const metricsHTML = summary.metrics.map(metric => generateMetricCard(metric)).join('')

  const highlightsHTML = summary.highlights?.length ? `
    <div class="highlights">
      <h4>Key Highlights</h4>
      <ul>
        ${summary.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  ` : ''

  return `
    <section class="summary-section">
      <h3 class="summary-title">${summary.title}</h3>
      <div class="metrics-grid">${metricsHTML}</div>
      ${highlightsHTML}
    </section>
  `
}

/**
 * Generate a single metric card
 */
function generateMetricCard(metric: ReportMetric): string {
  let formattedValue: string

  switch (metric.format) {
    case 'currency':
      formattedValue = formatCurrency(Number(metric.value))
      break
    case 'percentage':
      formattedValue = formatPercentage(Number(metric.value))
      break
    default:
      formattedValue = String(metric.value)
  }

  const changeHTML = metric.change !== undefined ? `
    <div class="metric-change ${metric.changeType}">
      ${metric.changeType === 'increase' ? '↑' : metric.changeType === 'decrease' ? '↓' : '→'}
      ${Math.abs(metric.change).toFixed(1)}% vs previous
    </div>
  ` : ''

  return `
    <div class="metric-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${formattedValue}${metric.unit ? ` ${metric.unit}` : ''}</div>
      ${changeHTML}
    </div>
  `
}

/**
 * Generate data table
 */
function generateDataTable(rows: ReportRow[], columns: ReportColumn[]): string {
  if (rows.length === 0) {
    return `
      <section class="data-table-section">
        <p style="text-align: center; color: #64748b; padding: 20px;">
          No data available for the selected period.
        </p>
      </section>
    `
  }

  const headerHTML = columns.map(col => `
    <th class="${col.align === 'right' ? 'align-right' : col.align === 'center' ? 'align-center' : ''}">
      ${col.label}
    </th>
  `).join('')

  const rowsHTML = rows.map(row => `
    <tr>
      ${columns.map(col => `
        <td class="${col.align === 'right' ? 'align-right' : col.align === 'center' ? 'align-center' : ''}">
          ${formatValue(row[col.key], col)}
        </td>
      `).join('')}
    </tr>
  `).join('')

  return `
    <section class="data-table-section">
      <table class="data-table">
        <thead>
          <tr>${headerHTML}</tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </section>
  `
}

/**
 * Generate footer
 */
function generateFooter(footerText?: string): string {
  return `
    <footer class="report-footer">
      <p>${footerText || '© Branding Pioneers'} | Generated automatically</p>
    </footer>
  `
}

/**
 * Generate a simple invoice PDF
 */
export function generateInvoicePDF(invoice: {
  invoiceNumber: string
  date: Date
  dueDate: Date
  client: { name: string; address?: string; gst?: string }
  entity: { name: string; address: string; gst: string }
  items: { description: string; quantity: number; rate: number; amount: number }[]
  subtotal: number
  tax: number
  total: number
  gstPercentage?: number
  status: string
  notes?: string
}): string {
  const s = DEFAULT_STYLES

  const itemsHTML = invoice.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description}</td>
      <td class="align-center">${item.quantity}</td>
      <td class="align-right">${formatCurrency(item.rate)}</td>
      <td class="align-right">${formatCurrency(item.amount)}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    ${generateCSS(s)}

    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: 700;
      color: ${s.headerColor};
    }

    .invoice-number {
      font-size: 14px;
      color: #64748b;
    }

    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .party h4 {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .party-name {
      font-size: 16px;
      font-weight: 600;
      color: ${s.headerColor};
    }

    .party-details {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
    }

    .invoice-dates {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
    }

    .date-item label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
    }

    .date-item span {
      display: block;
      font-weight: 600;
      color: ${s.headerColor};
    }

    .totals {
      margin-top: 20px;
      margin-left: auto;
      width: 250px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .total-row.grand {
      font-size: 18px;
      font-weight: 700;
      border-bottom: none;
      border-top: 2px solid ${s.headerColor};
      padding-top: 15px;
      margin-top: 10px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-paid { background: #dcfce7; color: #166534; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-draft { background: #f1f5f9; color: #475569; }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="invoice-header">
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
      </div>
      <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span>
    </div>

    <div class="parties">
      <div class="party">
        <h4>From</h4>
        <div class="party-name">${invoice.entity.name}</div>
        ${invoice.entity.address ? `<div class="party-details">${invoice.entity.address}</div>` : ''}
        ${invoice.entity.gst ? `<div class="party-details">GSTIN: ${invoice.entity.gst}</div>` : ''}
      </div>
      <div class="party">
        <h4>Bill To</h4>
        <div class="party-name">${invoice.client.name}</div>
        ${invoice.client.address ? `<div class="party-details">${invoice.client.address}</div>` : ''}
        ${invoice.client.gst ? `<div class="party-details">GSTIN: ${invoice.client.gst}</div>` : ''}
      </div>
    </div>

    <div class="invoice-dates">
      <div class="date-item">
        <label>Invoice Date</label>
        <span>${formatDate(invoice.date, 'long')}</span>
      </div>
      <div class="date-item">
        <label>Due Date</label>
        <span>${formatDate(invoice.dueDate, 'long')}</span>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Description</th>
          <th class="align-center" style="width: 80px;">Qty</th>
          <th class="align-right" style="width: 120px;">Rate</th>
          <th class="align-right" style="width: 120px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
      <div class="total-row">
        <span>GST${invoice.gstPercentage ? ` (${invoice.gstPercentage}%)` : ''}</span>
        <span>${formatCurrency(invoice.tax)}</span>
      </div>
      <div class="total-row grand">
        <span>Total</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
    </div>

    ${invoice.notes ? `
      <div style="margin-top: 40px; padding: 15px; background: #f8fafc; border-radius: 8px;">
        <h4 style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Notes</h4>
        <p style="font-size: 13px; color: #475569;">${invoice.notes}</p>
      </div>
    ` : ''}

    <footer class="report-footer">
      <p>Thank you for your business!</p>
    </footer>
  </div>
</body>
</html>
`
}
