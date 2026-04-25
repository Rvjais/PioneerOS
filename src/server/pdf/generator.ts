/**
 * PDF Generation using jspdf
 *
 * Generates professional PDF documents for invoices, SLAs, and NDAs.
 */

import jsPDF from 'jspdf'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import autoTable from 'jspdf-autotable'

// ============================================================
// SHARED HELPERS
// ============================================================

const BRAND_BLUE: [number, number, number] = [0, 51, 102]
const SLATE_DARK: [number, number, number] = [30, 41, 59]
const SLATE_MID: [number, number, number] = [100, 116, 139]
const SLATE_LIGHT: [number, number, number] = [241, 245, 249]

const ENTITIES: Record<string, { name: string; legalName: string; address: string; gst: string; email: string; phone: string; bank: { name: string; account: string; ifsc: string; branch: string } }> = {
  BRANDING_PIONEERS: {
    name: 'Branding Pioneers',
    legalName: process.env.ENTITY_BP_LEGAL_NAME || 'Branding Pioneers Private Limited',
    address: process.env.ENTITY_BP_ADDRESS || '123 Marketing Street, New Delhi, India - 110001',
    gst: process.env.ENTITY_BP_GST || '07AABCU9603R1ZM',
    email: process.env.ENTITY_BP_EMAIL || 'accounts@brandingpioneers.in',
    phone: process.env.ENTITY_BP_PHONE || '+91 98765 43210',
    bank: {
      name: process.env.ENTITY_BP_BANK_NAME || 'HDFC Bank',
      account: process.env.ENTITY_BP_BANK_ACCOUNT || '50200012345678',
      ifsc: process.env.ENTITY_BP_BANK_IFSC || 'HDFC0001234',
      branch: process.env.ENTITY_BP_BANK_BRANCH || 'Connaught Place, New Delhi',
    },
  },
  ATZ_MEDAPPZ: {
    name: 'ATZ Medappz',
    legalName: process.env.ENTITY_ATZ_LEGAL_NAME || 'ATZ Medappz Private Limited',
    address: process.env.ENTITY_ATZ_ADDRESS || '456 Tech Park, Gurgaon, Haryana - 122001',
    gst: process.env.ENTITY_ATZ_GST || '06AABCU9603R1ZM',
    email: process.env.ENTITY_ATZ_EMAIL || 'accounts@atzmedappz.com',
    phone: process.env.ENTITY_ATZ_PHONE || '+91 98765 43211',
    bank: {
      name: process.env.ENTITY_ATZ_BANK_NAME || 'ICICI Bank',
      account: process.env.ENTITY_ATZ_BANK_ACCOUNT || '12345678901234',
      ifsc: process.env.ENTITY_ATZ_BANK_IFSC || 'ICIC0001234',
      branch: process.env.ENTITY_ATZ_BANK_BRANCH || 'Cyber Hub, Gurgaon',
    },
  },
}

function formatINR(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDateDDMMYYYY(d)
}

function addPageBorder(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  doc.setDrawColor(...BRAND_BLUE)
  doc.setLineWidth(0.5)
  doc.rect(10, 10, pw - 20, ph - 20)
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.2)
  doc.rect(12, 12, pw - 24, ph - 24)
}

function addPageNumbers(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text(`Page ${i} of ${total}`, pw / 2, ph - 5, { align: 'center' })
  }
}

// ============================================================
// INVOICE PDF
// ============================================================

export interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface InvoicePDFData {
  invoiceNumber: string
  entityType?: string
  createdAt: Date | string
  dueDate: Date | string
  paidAt?: Date | string | null
  status: string
  currency?: string

  // Client info
  clientName: string
  clientContactName?: string | null
  clientAddress?: string | null
  clientGST?: string | null

  // Amounts
  amount: number
  tax: number
  tds?: number
  total: number

  // Line items
  items: InvoiceItem[]

  // Service
  serviceMonth?: Date | string | null
  isAdvance?: boolean
  notes?: string | null
}

export function generateInvoicePDF(data: InvoicePDFData): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const margin = 20
  const cw = pw - margin * 2
  let y = margin

  const entity = ENTITIES[data.entityType || 'BRANDING_PIONEERS'] || ENTITIES.BRANDING_PIONEERS
  const curr = data.currency || 'INR'

  addPageBorder(doc)

  // ---- Header ----
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(margin, y, cw, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(entity.legalName.toUpperCase(), pw / 2, y + 10, { align: 'center' })
  y += 18

  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(entity.address, pw / 2, y, { align: 'center' })
  y += 5
  doc.text(`GSTIN: ${entity.gst}  |  Email: ${entity.email}  |  Phone: ${entity.phone}`, pw / 2, y, { align: 'center' })
  y += 10

  // Decorative line
  doc.setDrawColor(...BRAND_BLUE)
  doc.setLineWidth(1)
  doc.line(margin, y, pw - margin, y)
  y += 3
  doc.setLineWidth(0.3)
  doc.line(margin, y, pw - margin, y)
  y += 10

  // ---- INVOICE title ----
  doc.setTextColor(...BRAND_BLUE)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pw / 2, y, { align: 'center' })
  y += 12

  // ---- Invoice meta + Bill To ----
  // Left: Bill To
  doc.setFontSize(9)
  doc.setTextColor(...SLATE_MID)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', margin, y)
  // Right: Invoice details
  doc.text('INVOICE DETAILS', pw - margin - 55, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...SLATE_DARK)
  doc.setFontSize(11)
  doc.text(data.clientName, margin, y)
  doc.setFontSize(10)
  doc.text(data.invoiceNumber, pw - margin - 55, y)
  y += 5

  doc.setFontSize(9)
  if (data.clientContactName) {
    doc.text(data.clientContactName, margin, y)
    y += 5
  }
  if (data.clientAddress) {
    const addrLines = doc.splitTextToSize(data.clientAddress, 80)
    addrLines.forEach((line: string) => {
      doc.text(line, margin, y)
      y += 4
    })
    y += 1
  }
  if (data.clientGST) {
    doc.text(`GSTIN: ${data.clientGST}`, margin, y)
  }

  // Right column details
  let ry = y - (data.clientContactName ? 10 : 5) - (data.clientAddress ? 4 : 0)
  if (ry < y - 20) ry = y - 15
  const rightX = pw - margin - 55
  doc.setFontSize(9)
  doc.setTextColor(...SLATE_MID)
  doc.text(`Issue Date:`, rightX, ry)
  doc.setTextColor(...SLATE_DARK)
  doc.text(formatDate(data.createdAt), rightX + 25, ry)
  ry += 5
  doc.setTextColor(...SLATE_MID)
  doc.text(`Due Date:`, rightX, ry)
  doc.setTextColor(...SLATE_DARK)
  doc.text(formatDate(data.dueDate), rightX + 25, ry)
  ry += 5
  doc.setTextColor(...SLATE_MID)
  doc.text(`Status:`, rightX, ry)
  doc.setTextColor(...SLATE_DARK)
  doc.text(data.status, rightX + 25, ry)
  if (data.paidAt) {
    ry += 5
    doc.setTextColor(...SLATE_MID)
    doc.text(`Paid On:`, rightX, ry)
    doc.setTextColor(...SLATE_DARK)
    doc.text(formatDate(data.paidAt), rightX + 25, ry)
  }
  if (data.serviceMonth) {
    ry += 5
    doc.setTextColor(...SLATE_MID)
    doc.text(`Service Month:`, rightX, ry)
    doc.setTextColor(...SLATE_DARK)
    doc.text(formatDate(data.serviceMonth), rightX + 35, ry)
  }

  y = Math.max(y, ry) + 15

  // ---- Items Table ----
  const tableItems = data.items.length > 0
    ? data.items
    : [{ description: 'Professional Services', quantity: 1, rate: data.amount, amount: data.amount }]

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Description', 'Qty', 'Rate', 'Amount']],
    body: tableItems.map((item, i) => [
      String(i + 1),
      item.description,
      String(item.quantity),
      formatINR(item.rate, curr),
      formatINR(item.amount, curr),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: BRAND_BLUE, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  })

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // ---- Totals ----
  const totalsX = pw - margin - 70
  const totals: [string, string][] = [
    ['Subtotal', formatINR(data.amount, curr)],
  ]
  if (data.tax > 0) {
    totals.push(['GST (18%)', formatINR(data.tax, curr)])
  }
  if (data.tds && data.tds > 0) {
    totals.push(['TDS Deducted', `- ${formatINR(data.tds, curr)}`])
  }
  totals.push(['Total Due', formatINR(data.total, curr)])

  totals.forEach(([label, value], i) => {
    const isTotal = i === totals.length - 1
    if (isTotal) {
      doc.setFillColor(...BRAND_BLUE)
      doc.rect(totalsX - 5, y - 4, 75, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
    } else {
      doc.setTextColor(...SLATE_DARK)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
    }
    doc.text(label, totalsX, y)
    doc.text(value, pw - margin, y, { align: 'right' })
    y += isTotal ? 14 : 6
  })

  y += 5

  // ---- Bank Details ----
  const ph = doc.internal.pageSize.getHeight()
  if (y + 40 > ph - 30) {
    doc.addPage()
    addPageBorder(doc)
    y = margin
  }

  doc.setFillColor(...SLATE_LIGHT)
  doc.rect(margin, y, cw, 30, 'F')
  y += 6
  doc.setTextColor(...BRAND_BLUE)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BANK DETAILS FOR PAYMENT', margin + 5, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE_DARK)
  doc.text(`Bank: ${entity.bank.name}  |  A/C No: ${entity.bank.account}`, margin + 5, y)
  y += 5
  doc.text(`IFSC: ${entity.bank.ifsc}  |  Branch: ${entity.bank.branch}`, margin + 5, y)
  y += 5
  doc.text(`Beneficiary: ${entity.legalName}`, margin + 5, y)
  y += 10

  // ---- Notes ----
  if (data.notes) {
    doc.setTextColor(...SLATE_MID)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const noteLines = doc.splitTextToSize(data.notes, cw)
    noteLines.forEach((line: string) => {
      doc.text(line, margin, y)
      y += 4
    })
  }

  // ---- Footer ----
  doc.setTextColor(...SLATE_MID)
  doc.setFontSize(8)
  doc.text('Thank you for your business!', pw / 2, ph - 18, { align: 'center' })
  doc.text('Please include the invoice number with your payment.', pw / 2, ph - 14, { align: 'center' })

  addPageNumbers(doc)

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

// ============================================================
// SLA PDF
// ============================================================

export interface SLAPDFData {
  agreementNumber: string
  agreementDate: string

  providerName: string
  providerLegalName: string
  providerAddress: string
  providerGSTIN: string
  providerDirector: string
  providerDirectorTitle: string

  clientName: string
  clientContactPerson: string
  clientDesignation?: string
  clientAddress: string
  clientCity: string
  clientState: string
  clientPincode: string
  clientGSTIN?: string
  clientEmail: string
  clientPhone: string

  services: Array<{ name: string; description?: string }>
  contractValue: number
  contractDuration: string
  paymentTerms: string
  advanceAmount: number

  slaContent: string

  signerName: string
  signerDesignation?: string
  signatureData?: string
  signatureType: 'type' | 'draw'
  signedDate: string
}

export function generateSLAPDF(data: SLAPDFData): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margin = 20
  const cw = pw - margin * 2
  let y = margin

  const checkPage = (space: number) => {
    if (y + space > ph - 30) {
      doc.addPage()
      y = margin
      addPageBorder(doc)
    }
  }

  addPageBorder(doc)

  // Letterhead
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(margin, y, cw, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(data.providerLegalName.toUpperCase(), pw / 2, y + 10, { align: 'center' })
  y += 18

  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(data.providerAddress, pw / 2, y, { align: 'center' })
  y += 5
  doc.text(`GSTIN: ${data.providerGSTIN}`, pw / 2, y, { align: 'center' })
  y += 10

  doc.setDrawColor(...BRAND_BLUE)
  doc.setLineWidth(1)
  doc.line(margin, y, pw - margin, y)
  y += 3
  doc.setLineWidth(0.3)
  doc.line(margin, y, pw - margin, y)
  y += 10

  // Title
  doc.setTextColor(...BRAND_BLUE)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SERVICE LEVEL AGREEMENT', pw / 2, y, { align: 'center' })
  y += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(`Agreement No: ${data.agreementNumber}`, pw / 2, y, { align: 'center' })
  y += 5
  doc.text(`Date: ${data.agreementDate}`, pw / 2, y, { align: 'center' })
  y += 12

  // Parties
  const sectionHeader = (title: string) => {
    doc.setFillColor(...SLATE_LIGHT)
    doc.rect(margin, y, cw, 8, 'F')
    doc.setTextColor(...BRAND_BLUE)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 3, y + 5.5)
    y += 12
  }

  sectionHeader('PARTIES TO THIS AGREEMENT')

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('FIRST PARTY (Service Provider):', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const fp = [
    `Name: ${data.providerLegalName}`,
    `Trading As: ${data.providerName}`,
    `Address: ${data.providerAddress}`,
    `GSTIN: ${data.providerGSTIN}`,
    `Represented By: ${data.providerDirector}, ${data.providerDirectorTitle}`,
  ]
  fp.forEach(l => { doc.text(l, margin + 5, y); y += 5 })
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('SECOND PARTY (Client):', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const sp = [
    `Company Name: ${data.clientName}`,
    `Contact Person: ${data.clientContactPerson}`,
    `Designation: ${data.clientDesignation || 'Authorized Signatory'}`,
    `Address: ${data.clientAddress}`,
    `City/State: ${data.clientCity}, ${data.clientState} - ${data.clientPincode}`,
    `GSTIN: ${data.clientGSTIN || 'Not Provided'}`,
    `Email: ${data.clientEmail}`,
    `Phone: ${data.clientPhone}`,
  ]
  sp.forEach(l => { doc.text(l, margin + 5, y); y += 5 })
  y += 8

  // Scope of Services
  checkPage(50)
  sectionHeader('SCOPE OF SERVICES')
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  data.services.forEach((svc, i) => {
    checkPage(8)
    doc.text(`${i + 1}. ${svc.name}`, margin + 5, y)
    y += 6
  })
  y += 5

  // Commercial Terms
  checkPage(40)
  sectionHeader('COMMERCIAL TERMS')
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const terms: [string, string][] = [
    ['Contract Duration', data.contractDuration],
    ['Total Contract Value', formatINR(data.contractValue)],
    ['Advance Payment', formatINR(data.advanceAmount)],
    ['Payment Terms', data.paymentTerms || '100% Advance'],
  ]
  terms.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, margin + 5, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 55, y)
    y += 6
  })
  y += 8

  // Terms and Conditions
  checkPage(30)
  sectionHeader('TERMS AND CONDITIONS')
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const paragraphs = data.slaContent.split('\n\n')
  paragraphs.forEach(para => {
    if (para.trim()) {
      const lines = doc.splitTextToSize(para.trim(), cw - 10)
      lines.forEach((line: string) => {
        checkPage(6)
        doc.text(line, margin + 5, y)
        y += 4.5
      })
      y += 3
    }
  })
  y += 10

  // Signatures
  checkPage(80)
  sectionHeader('SIGNATURES')

  const sbw = (cw - 10) / 2
  const sbh = 50

  // First party
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.rect(margin, y, sbw, sbh)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text('For ' + data.providerName, margin + 5, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.line(margin + 5, y + 30, margin + sbw - 10, y + 30)
  doc.text('Authorized Signatory', margin + 5, y + 35)
  doc.text(data.providerDirector, margin + 5, y + 40)
  doc.text(data.providerDirectorTitle, margin + 5, y + 45)

  // Second party
  const sx = margin + sbw + 10
  doc.rect(sx, y, sbw, sbh)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('For ' + data.clientName, sx + 5, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  if (data.signatureType === 'draw' && data.signatureData) {
    try {
      doc.addImage(data.signatureData, 'PNG', sx + 10, y + 12, 60, 15)
    } catch {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(14)
      doc.text(data.signerName, sx + 10, y + 22)
    }
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(14)
    doc.text(data.signerName, sx + 10, y + 22)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.line(sx + 5, y + 30, sx + sbw - 10, y + 30)
  doc.text('Authorized Signatory', sx + 5, y + 35)
  doc.text(data.signerName, sx + 5, y + 40)
  doc.text(data.signerDesignation || 'Authorized Signatory', sx + 5, y + 45)

  y += sbh + 10
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text(`Date of Execution: ${data.signedDate}`, margin, y)
  doc.text(`Place: ${data.clientCity}, ${data.clientState}`, pw - margin - 60, y)
  y += 15

  // Footer
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(margin, y, cw, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('This is a computer-generated document. Valid with authorized signatures.', pw / 2, y + 5, { align: 'center' })
  doc.text(`Agreement ID: ${data.agreementNumber} | Generated on: ${new Date().toLocaleString('en-IN')}`, pw / 2, y + 9, { align: 'center' })

  addPageNumbers(doc)

  return Buffer.from(doc.output('arraybuffer'))
}

// ============================================================
// NDA PDF
// ============================================================

export interface NDAPDFData {
  ndaNumber: string
  ndaDate: string

  disclosingPartyName: string
  disclosingPartyAddress: string
  disclosingPartyRepresentative: string
  disclosingPartyTitle: string

  receivingPartyName: string
  receivingPartyAddress: string
  receivingPartyRepresentative: string
  receivingPartyTitle: string

  purpose: string
  duration: string
  jurisdiction: string

  additionalClauses?: string[]

  signerName: string
  signerDesignation?: string
  signatureData?: string
  signatureType?: 'type' | 'draw'
  signedDate: string
}

export function generateNDAPDF(data: NDAPDFData): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const margin = 20
  const cw = pw - margin * 2
  let y = margin

  const checkPage = (space: number) => {
    if (y + space > ph - 30) {
      doc.addPage()
      y = margin
      addPageBorder(doc)
    }
  }

  addPageBorder(doc)

  // Header
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(margin, y, cw, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('NON-DISCLOSURE AGREEMENT', pw / 2, y + 10, { align: 'center' })
  y += 20

  doc.setTextColor(80, 80, 80)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`NDA Reference: ${data.ndaNumber}`, pw / 2, y, { align: 'center' })
  y += 5
  doc.text(`Date: ${data.ndaDate}`, pw / 2, y, { align: 'center' })
  y += 12

  doc.setDrawColor(...BRAND_BLUE)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pw - margin, y)
  y += 10

  // Introduction
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const intro = `This Non-Disclosure Agreement ("Agreement") is entered into as of ${data.ndaDate} by and between the parties identified below, for the purpose of preventing the unauthorized disclosure of Confidential Information as defined herein.`
  const introLines = doc.splitTextToSize(intro, cw)
  introLines.forEach((line: string) => { doc.text(line, margin, y); y += 5 })
  y += 8

  // Parties
  const sectionHeader = (title: string) => {
    checkPage(12)
    doc.setFillColor(...SLATE_LIGHT)
    doc.rect(margin, y, cw, 8, 'F')
    doc.setTextColor(...BRAND_BLUE)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 3, y + 5.5)
    y += 12
  }

  sectionHeader('1. PARTIES')

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Disclosing Party:', margin + 5, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(data.disclosingPartyName, margin + 10, y); y += 5
  doc.text(data.disclosingPartyAddress, margin + 10, y); y += 5
  doc.text(`Represented by: ${data.disclosingPartyRepresentative}, ${data.disclosingPartyTitle}`, margin + 10, y); y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Receiving Party:', margin + 5, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(data.receivingPartyName, margin + 10, y); y += 5
  doc.text(data.receivingPartyAddress, margin + 10, y); y += 5
  doc.text(`Represented by: ${data.receivingPartyRepresentative}, ${data.receivingPartyTitle}`, margin + 10, y); y += 10

  // Standard Clauses
  const clauses = [
    {
      title: '2. DEFINITION OF CONFIDENTIAL INFORMATION',
      body: `"Confidential Information" means any data, documents, trade secrets, business plans, financial information, technical specifications, customer lists, marketing strategies, source code, designs, processes, and any other information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, or by any other means, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.`,
    },
    {
      title: '3. PURPOSE',
      body: `The Confidential Information is being disclosed solely for the purpose of: ${data.purpose}`,
    },
    {
      title: '4. OBLIGATIONS OF RECEIVING PARTY',
      body: `The Receiving Party agrees to: (a) hold the Confidential Information in strict confidence; (b) not disclose the Confidential Information to any third party without prior written consent of the Disclosing Party; (c) use the Confidential Information only for the Purpose stated above; (d) take reasonable precautions to protect the confidentiality of the information, using at least the same degree of care as it uses to protect its own confidential information.`,
    },
    {
      title: '5. EXCLUSIONS',
      body: `This Agreement does not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was known to the Receiving Party prior to disclosure; (c) is independently developed by the Receiving Party without use of the Confidential Information; (d) is rightfully received from a third party without restriction on disclosure.`,
    },
    {
      title: '6. DURATION',
      body: `This Agreement shall remain in effect for a period of ${data.duration} from the date of execution. The obligations of confidentiality shall survive the termination of this Agreement.`,
    },
    {
      title: '7. RETURN OF INFORMATION',
      body: `Upon termination of this Agreement or upon request, the Receiving Party shall promptly return or destroy all copies of Confidential Information in its possession.`,
    },
    {
      title: '8. GOVERNING LAW & JURISDICTION',
      body: `This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of courts in ${data.jurisdiction}.`,
    },
  ]

  clauses.forEach(clause => {
    checkPage(20)
    sectionHeader(clause.title)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(clause.body, cw - 10)
    lines.forEach((line: string) => {
      checkPage(5)
      doc.text(line, margin + 5, y)
      y += 4.5
    })
    y += 5
  })

  // Additional clauses
  if (data.additionalClauses && data.additionalClauses.length > 0) {
    checkPage(20)
    sectionHeader('9. ADDITIONAL TERMS')
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    data.additionalClauses.forEach((clause, i) => {
      checkPage(8)
      doc.text(`${i + 1}. ${clause}`, margin + 5, y)
      y += 6
    })
    y += 5
  }

  // Signatures
  checkPage(80)
  sectionHeader('SIGNATURES')

  const sbw = (cw - 10) / 2
  const sbh = 50

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)

  // Disclosing party
  doc.rect(margin, y, sbw, sbh)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text('Disclosing Party', margin + 5, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.line(margin + 5, y + 30, margin + sbw - 10, y + 30)
  doc.text(data.disclosingPartyRepresentative, margin + 5, y + 36)
  doc.text(data.disclosingPartyTitle, margin + 5, y + 41)
  doc.text(data.disclosingPartyName, margin + 5, y + 46)

  // Receiving party
  const sx = margin + sbw + 10
  doc.rect(sx, y, sbw, sbh)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Receiving Party', sx + 5, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  if (data.signatureType === 'draw' && data.signatureData) {
    try {
      doc.addImage(data.signatureData, 'PNG', sx + 10, y + 12, 60, 15)
    } catch {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(14)
      doc.text(data.signerName, sx + 10, y + 22)
    }
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(14)
    doc.text(data.signerName, sx + 10, y + 22)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.line(sx + 5, y + 30, sx + sbw - 10, y + 30)
  doc.text(data.receivingPartyRepresentative, sx + 5, y + 36)
  doc.text(data.receivingPartyTitle || 'Authorized Signatory', sx + 5, y + 41)
  doc.text(data.receivingPartyName, sx + 5, y + 46)

  y += sbh + 10

  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text(`Date of Execution: ${data.signedDate}`, margin, y)
  y += 15

  // Footer
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(margin, y, cw, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('This is a computer-generated document. Valid with authorized signatures.', pw / 2, y + 5, { align: 'center' })
  doc.text(`NDA Ref: ${data.ndaNumber} | Generated on: ${new Date().toLocaleString('en-IN')}`, pw / 2, y + 9, { align: 'center' })

  addPageNumbers(doc)

  return Buffer.from(doc.output('arraybuffer'))
}
