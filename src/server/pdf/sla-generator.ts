import jsPDF from 'jspdf'

interface SLAData {
  // Agreement Details
  agreementNumber: string
  agreementDate: string

  // Service Provider
  providerName: string
  providerLegalName: string
  providerAddress: string
  providerGSTIN: string
  providerDirector: string
  providerDirectorTitle: string

  // Client
  clientName: string
  clientContactPerson: string
  clientDesignation: string
  clientAddress: string
  clientCity: string
  clientState: string
  clientPincode: string
  clientGSTIN: string
  clientEmail: string
  clientPhone: string

  // Contract Details
  services: Array<{ name: string; description?: string }>
  contractValue: number
  contractDuration: string
  paymentTerms: string
  advanceAmount: number

  // SLA Content
  slaContent: string

  // Signature Details
  signerName: string
  signerDesignation: string
  signatureData?: string // Base64 image for drawn signature
  signatureType: 'type' | 'draw'
  signedDate: string
}

export function generateSLAPDF(data: SLAData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin

  // Helper functions
  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 30) {
      doc.addPage()
      yPos = margin
      addPageBorder()
      return true
    }
    return false
  }

  const addPageBorder = () => {
    doc.setDrawColor(0, 51, 102)
    doc.setLineWidth(0.5)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    // Inner decorative border
    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.2)
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    doc.setFontSize(fontSize)
    return doc.splitTextToSize(text, maxWidth)
  }

  // Add page border
  addPageBorder()

  // ========== LETTERHEAD ==========
  // Company Name Header
  doc.setFillColor(0, 51, 102)
  doc.rect(margin, yPos, contentWidth, 15, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(data.providerLegalName.toUpperCase(), pageWidth / 2, yPos + 10, { align: 'center' })
  yPos += 18

  // Address line
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(data.providerAddress, pageWidth / 2, yPos, { align: 'center' })
  yPos += 5
  doc.text(`GSTIN: ${data.providerGSTIN}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  // Decorative line
  doc.setDrawColor(0, 51, 102)
  doc.setLineWidth(1)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 3
  doc.setLineWidth(0.3)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // ========== DOCUMENT TITLE ==========
  doc.setTextColor(0, 51, 102)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SERVICE LEVEL AGREEMENT', pageWidth / 2, yPos, { align: 'center' })
  yPos += 8

  // Agreement Number and Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(`Agreement No: ${data.agreementNumber}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 5
  doc.text(`Date: ${data.agreementDate}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 12

  // ========== PARTIES SECTION ==========
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPos, contentWidth, 8, 'F')
  doc.setTextColor(0, 51, 102)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PARTIES TO THIS AGREEMENT', margin + 3, yPos + 5.5)
  yPos += 12

  // First Party
  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('FIRST PARTY (Service Provider):', margin, yPos)
  yPos += 6

  doc.setFont('helvetica', 'normal')
  const firstPartyDetails = [
    `Name: ${data.providerLegalName}`,
    `Trading As: ${data.providerName}`,
    `Address: ${data.providerAddress}`,
    `GSTIN: ${data.providerGSTIN}`,
    `Represented By: ${data.providerDirector}, ${data.providerDirectorTitle}`,
  ]
  firstPartyDetails.forEach(line => {
    doc.text(line, margin + 5, yPos)
    yPos += 5
  })
  yPos += 5

  // Second Party
  doc.setFont('helvetica', 'bold')
  doc.text('SECOND PARTY (Client):', margin, yPos)
  yPos += 6

  doc.setFont('helvetica', 'normal')
  const secondPartyDetails = [
    `Company Name: ${data.clientName}`,
    `Contact Person: ${data.clientContactPerson}`,
    `Designation: ${data.clientDesignation || 'Authorized Signatory'}`,
    `Address: ${data.clientAddress}`,
    `City/State: ${data.clientCity}, ${data.clientState} - ${data.clientPincode}`,
    `GSTIN: ${data.clientGSTIN || 'Not Provided'}`,
    `Email: ${data.clientEmail}`,
    `Phone: ${data.clientPhone}`,
  ]
  secondPartyDetails.forEach(line => {
    doc.text(line, margin + 5, yPos)
    yPos += 5
  })
  yPos += 8

  // ========== SCOPE OF SERVICES ==========
  addNewPageIfNeeded(50)

  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPos, contentWidth, 8, 'F')
  doc.setTextColor(0, 51, 102)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('SCOPE OF SERVICES', margin + 3, yPos + 5.5)
  yPos += 12

  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  data.services.forEach((service, index) => {
    addNewPageIfNeeded(8)
    doc.text(`${index + 1}. ${service.name}`, margin + 5, yPos)
    yPos += 6
  })
  yPos += 5

  // ========== COMMERCIAL TERMS ==========
  addNewPageIfNeeded(40)

  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPos, contentWidth, 8, 'F')
  doc.setTextColor(0, 51, 102)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('COMMERCIAL TERMS', margin + 3, yPos + 5.5)
  yPos += 12

  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const commercialTerms = [
    ['Contract Duration', data.contractDuration],
    ['Total Contract Value', formatCurrency(data.contractValue)],
    ['Advance Payment', formatCurrency(data.advanceAmount)],
    ['Payment Terms', data.paymentTerms || '100% Advance'],
  ]

  commercialTerms.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, margin + 5, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), margin + 55, yPos)
    yPos += 6
  })
  yPos += 8

  // ========== TERMS AND CONDITIONS ==========
  addNewPageIfNeeded(30)

  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPos, contentWidth, 8, 'F')
  doc.setTextColor(0, 51, 102)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('TERMS AND CONDITIONS', margin + 3, yPos + 5.5)
  yPos += 12

  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Split SLA content into paragraphs and render
  const paragraphs = data.slaContent.split('\n\n')
  paragraphs.forEach(para => {
    if (para.trim()) {
      const lines = wrapText(para.trim(), contentWidth - 10, 9)
      lines.forEach(line => {
        addNewPageIfNeeded(6)
        doc.text(line, margin + 5, yPos)
        yPos += 4.5
      })
      yPos += 3
    }
  })
  yPos += 10

  // ========== SIGNATURES SECTION ==========
  addNewPageIfNeeded(80)

  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPos, contentWidth, 8, 'F')
  doc.setTextColor(0, 51, 102)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('SIGNATURES', margin + 3, yPos + 5.5)
  yPos += 15

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)

  const signatureBoxWidth = (contentWidth - 10) / 2
  const signatureBoxHeight = 50

  // First Party Signature Box
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.rect(margin, yPos, signatureBoxWidth, signatureBoxHeight)

  doc.setFont('helvetica', 'bold')
  doc.text('For ' + data.providerName, margin + 5, yPos + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Provider signature line
  doc.line(margin + 5, yPos + 30, margin + signatureBoxWidth - 10, yPos + 30)
  doc.text('Authorized Signatory', margin + 5, yPos + 35)
  doc.text(data.providerDirector, margin + 5, yPos + 40)
  doc.text(data.providerDirectorTitle, margin + 5, yPos + 45)

  // Second Party Signature Box
  const secondBoxX = margin + signatureBoxWidth + 10
  doc.rect(secondBoxX, yPos, signatureBoxWidth, signatureBoxHeight)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('For ' + data.clientName, secondBoxX + 5, yPos + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // Add signature if available
  if (data.signatureType === 'draw' && data.signatureData) {
    try {
      doc.addImage(data.signatureData, 'PNG', secondBoxX + 10, yPos + 12, 60, 15)
    } catch {
      // Fallback to typed signature
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(14)
      doc.text(data.signerName, secondBoxX + 10, yPos + 22)
    }
  } else {
    // Typed signature in cursive style
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(14)
    doc.text(data.signerName, secondBoxX + 10, yPos + 22)
  }

  // Signature line and details
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.line(secondBoxX + 5, yPos + 30, secondBoxX + signatureBoxWidth - 10, yPos + 30)
  doc.text('Authorized Signatory', secondBoxX + 5, yPos + 35)
  doc.text(data.signerName, secondBoxX + 5, yPos + 40)
  doc.text(data.signerDesignation || 'Authorized Signatory', secondBoxX + 5, yPos + 45)

  yPos += signatureBoxHeight + 10

  // Date signed
  doc.setFontSize(10)
  doc.text(`Date of Execution: ${data.signedDate}`, margin, yPos)
  doc.text(`Place: ${data.clientCity}, ${data.clientState}`, pageWidth - margin - 60, yPos)
  yPos += 15

  // ========== FOOTER ==========
  doc.setFillColor(0, 51, 102)
  doc.rect(margin, yPos, contentWidth, 12, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('This is a computer-generated document. Valid with authorized signatures.', pageWidth / 2, yPos + 5, { align: 'center' })
  doc.text(`Agreement ID: ${data.agreementNumber} | Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, yPos + 9, { align: 'center' })

  // Add page numbers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' })
  }

  return doc
}

export function downloadSLAPDF(data: SLAData, filename: string) {
  const doc = generateSLAPDF(data)
  doc.save(filename)
}
