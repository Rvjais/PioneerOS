import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface TableColumn {
  header: string
  key: string
  width?: number
}

interface ExportOptions {
  title: string
  subtitle?: string
  filename: string
  orientation?: 'portrait' | 'landscape'
  companyName?: string
  generatedBy?: string
  includeTimestamp?: boolean
}

interface TableData {
  columns: TableColumn[]
  rows: Record<string, string | number>[]
}

interface SummaryItem {
  label: string
  value: string | number
  color?: 'green' | 'red' | 'blue' | 'amber'
}

// Color palette
const COLORS = {
  primary: [79, 70, 229] as [number, number, number], // Indigo
  secondary: [100, 116, 139] as [number, number, number], // Slate
  success: [34, 197, 94] as [number, number, number], // Green
  danger: [239, 68, 68] as [number, number, number], // Red
  warning: [245, 158, 11] as [number, number, number], // Amber
  info: [59, 130, 246] as [number, number, number], // Blue
  dark: [30, 41, 59] as [number, number, number], // Slate-800
  light: [241, 245, 249] as [number, number, number], // Slate-100
}

/**
 * Generate a professional PDF report with tables
 */
export function generateTablePDF(
  data: TableData,
  options: ExportOptions,
  summaryItems?: SummaryItem[]
): void {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin

  // Header with company branding
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(options.companyName || 'Pioneer OS', margin, 18)

  // Report title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(options.title, margin, 28)

  yPos = 45

  // Subtitle and metadata
  doc.setTextColor(...COLORS.dark)
  if (options.subtitle) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(options.subtitle, margin, yPos)
    yPos += 8
  }

  // Generation info
  if (options.includeTimestamp !== false) {
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.secondary)
    const timestamp = new Date().toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short',
    })
    doc.text(`Generated: ${timestamp}`, margin, yPos)
    if (options.generatedBy) {
      doc.text(`By: ${options.generatedBy}`, pageWidth - margin - 50, yPos)
    }
    yPos += 10
  }

  // Summary cards (if provided)
  if (summaryItems && summaryItems.length > 0) {
    const cardWidth = (pageWidth - margin * 2 - (summaryItems.length - 1) * 5) / summaryItems.length
    const cardHeight = 20

    summaryItems.forEach((item, index) => {
      const xPos = margin + index * (cardWidth + 5)

      // Card background
      const bgColor = item.color === 'green' ? COLORS.success :
                     item.color === 'red' ? COLORS.danger :
                     item.color === 'blue' ? COLORS.info :
                     item.color === 'amber' ? COLORS.warning :
                     COLORS.light

      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2], 0.1)
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, 'F')

      // Card content
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.secondary)
      doc.text(item.label, xPos + 3, yPos + 6)

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLORS.dark)
      doc.text(String(item.value), xPos + 3, yPos + 15)
    })

    yPos += cardHeight + 10
    doc.setFont('helvetica', 'normal')
  }

  // Table
  const headers = data.columns.map(col => col.header)
  const rows = data.rows.map(row =>
    data.columns.map(col => String(row[col.key] ?? ''))
  )

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: yPos,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: data.columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width }
      }
      return acc
    }, {} as Record<number, { cellWidth: number }>),
  })

  // Footer
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.secondary)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    doc.text(
      'Confidential - For Internal Use Only',
      margin,
      pageHeight - 10
    )
  }

  // Save
  doc.save(`${options.filename}.pdf`)
}

/**
 * Generate a simple PDF with key-value pairs (summary report)
 */
export function generateSummaryPDF(
  title: string,
  sections: Array<{
    title: string
    items: Array<{ label: string; value: string | number }>
  }>,
  options: Partial<ExportOptions> & { filename: string }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  let yPos = margin

  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin, 20)

  yPos = 40

  // Timestamp
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.secondary)
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, yPos)
  yPos += 15

  // Sections
  sections.forEach(section => {
    // Section title
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.dark)
    doc.text(section.title, margin, yPos)
    yPos += 8

    // Items
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    section.items.forEach(item => {
      doc.setTextColor(...COLORS.secondary)
      doc.text(item.label + ':', margin, yPos)
      doc.setTextColor(...COLORS.dark)
      doc.text(String(item.value), margin + 60, yPos)
      yPos += 6
    })

    yPos += 10
  })

  doc.save(`${options.filename}.pdf`)
}

/**
 * Generate client-facing deliverables report
 */
export function generateDeliverablesReportPDF(
  clientName: string,
  month: string,
  categories: Array<{
    name: string
    items: Array<{ name: string; count: number }>
    total: number
  }>,
  totals: { total: number; approved: number }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  let yPos = margin

  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Deliverables Report', margin, 18)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(clientName, margin, 28)
  doc.text(month, margin, 35)

  yPos = 50

  // Summary
  doc.setFillColor(...COLORS.light)
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.secondary)
  doc.text('Total Deliverables', margin + 10, yPos + 8)
  doc.text('Approved', pageWidth / 2, yPos + 8)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.dark)
  doc.text(String(totals.total), margin + 10, yPos + 16)
  doc.setTextColor(...COLORS.success)
  doc.text(String(totals.approved), pageWidth / 2, yPos + 16)

  yPos += 30

  // Categories
  categories.forEach(category => {
    // Category header
    doc.setFillColor(...COLORS.dark)
    doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${category.name} (${category.total})`, margin + 3, yPos + 5.5)
    yPos += 10

    // Items
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.dark)
    category.items.forEach(item => {
      doc.setFontSize(9)
      doc.text(item.name, margin + 5, yPos + 4)
      doc.text(String(item.count), pageWidth - margin - 15, yPos + 4)
      yPos += 6
    })

    yPos += 5
  })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.secondary)
  doc.text(
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    margin,
    doc.internal.pageSize.getHeight() - 10
  )

  doc.save(`deliverables-${clientName.toLowerCase().replace(/\s+/g, '-')}-${month}.pdf`)
}

/**
 * Export button component helper - returns styles for consistent UI
 */
export const exportButtonStyles = {
  pdf: 'px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 flex items-center gap-1.5',
  csv: 'px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-1.5',
  excel: 'px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-1.5',
}

/**
 * PDF icon SVG for buttons
 */
export const PDFIcon = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`
