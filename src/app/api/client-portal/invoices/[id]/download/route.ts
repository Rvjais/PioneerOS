import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Entity details for letterhead
const ENTITIES = {
  BRANDING_PIONEERS: {
    name: 'Branding Pioneers',
    address: '123 Marketing Street, New Delhi, India - 110001',
    gst: '07AABCU9603R1ZM',
    email: 'accounts@brandingpioneers.in',
    phone: '+91 98765 43210',
  },
  ATZ_MEDAPPZ: {
    name: 'ATZ Medappz',
    address: '456 Tech Park, Gurgaon, Haryana - 122001',
    gst: '06AABCU9603R1ZM',
    email: 'accounts@atzmedappz.com',
    phone: '+91 98765 43211',
  },
}

interface InvoiceItem {
  description: string
  quantity?: number
  rate?: number
  amount: number
}

// GET /api/client-portal/invoices/[id]/download - Download invoice as printable HTML
export const GET = withClientAuth(async (request, { user }, routeContext) => {
  const { id } = await routeContext!.params
  const clientId = user.clientId

  // Fetch the invoice
  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      clientId,
    },
    include: {
      client: {
        select: {
          name: true,
          contactName: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          gstNumber: true,
        },
      },
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  // Parse invoice items
  let items: InvoiceItem[] = []
  if (invoice.items) {
    try {
      items = JSON.parse(invoice.items)
    } catch {
      items = []
    }
  }

  // Get entity details
  const entity = ENTITIES[invoice.entityType as keyof typeof ENTITIES] || ENTITIES.BRANDING_PIONEERS

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice.currency || 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Build client address
  const clientAddress = [
    invoice.client.address,
    invoice.client.city,
    invoice.client.state,
    invoice.client.pincode,
  ].filter(Boolean).join(', ')

  // Generate HTML invoice
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1e293b;
      background: white;
      padding: 40px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
    }
    .company-info h1 {
      font-size: 24px;
      color: #3b82f6;
      margin-bottom: 8px;
    }
    .company-info p {
      color: #64748b;
      font-size: 12px;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-details h2 {
      font-size: 32px;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .invoice-details p {
      font-size: 12px;
      color: #64748b;
    }
    .invoice-meta {
      margin-bottom: 8px;
    }
    .invoice-meta strong {
      color: #1e293b;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .party {
      flex: 1;
    }
    .party h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .party p {
      margin-bottom: 4px;
    }
    .party .name {
      font-weight: 600;
      font-size: 16px;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #f1f5f9;
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    th:last-child, td:last-child {
      text-align: right;
    }
    td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .totals-table {
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals-row.total {
      font-weight: 700;
      font-size: 18px;
      border-bottom: 2px solid #1e293b;
      padding-top: 16px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-PAID {
      background: #dcfce7;
      color: #16a34a;
    }
    .status-SENT, .status-DRAFT {
      background: #dbeafe;
      color: #2563eb;
    }
    .status-OVERDUE {
      background: #fee2e2;
      color: #dc2626;
    }
    .notes {
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    .notes h4 {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .print-button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>${escapeHtml(entity.name)}</h1>
        <p>${escapeHtml(entity.address)}</p>
        <p>GST: ${escapeHtml(entity.gst)}</p>
        <p>Email: ${escapeHtml(entity.email)} | Phone: ${escapeHtml(entity.phone)}</p>
      </div>
      <div class="invoice-details">
        <h2>INVOICE</h2>
        <p class="invoice-meta"><strong>${escapeHtml(invoice.invoiceNumber)}</strong></p>
        <p>Issue Date: ${escapeHtml(formatDate(invoice.createdAt))}</p>
        <p>Due Date: ${escapeHtml(formatDate(invoice.dueDate))}</p>
        ${invoice.paidAt ? `<p>Paid On: ${escapeHtml(formatDate(invoice.paidAt))}</p>` : ''}
        <p style="margin-top: 8px;">
          <span class="status-badge status-${escapeHtml(invoice.status)}">${escapeHtml(invoice.status)}</span>
        </p>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>Bill To</h3>
        <p class="name">${escapeHtml(invoice.client.name)}</p>
        ${invoice.client.contactName ? `<p>${escapeHtml(invoice.client.contactName)}</p>` : ''}
        ${clientAddress ? `<p>${escapeHtml(clientAddress)}</p>` : ''}
        ${invoice.client.gstNumber ? `<p>GST: ${escapeHtml(invoice.client.gstNumber)}</p>` : ''}
      </div>
      <div class="party" style="text-align: right;">
        <h3>Service Period</h3>
        <p class="name">${invoice.serviceMonth ? escapeHtml(formatDate(invoice.serviceMonth)) : 'N/A'}</p>
        ${invoice.isAdvance ? '<p><em>Advance Payment</em></p>' : ''}
      </div>
    </div>

    ${(() => {
      const hasQtyRate = items.some(item => item.quantity != null && item.rate != null)
      return `
    <table>
      <thead>
        <tr>
          <th style="width: ${hasQtyRate ? '50%' : '70%'};">Description</th>
          ${hasQtyRate ? '<th>Qty</th><th>Rate</th>' : ''}
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items.map(item => `
          <tr>
            <td>${escapeHtml(item.description)}</td>
            ${hasQtyRate ? `<td>${escapeHtml(String(item.quantity ?? '-'))}</td><td>${item.rate != null ? escapeHtml(formatCurrency(item.rate)) : '-'}</td>` : ''}
            <td>${escapeHtml(formatCurrency(item.amount))}</td>
          </tr>
        `).join('') : `
          <tr>
            <td>Professional Services</td>
            ${hasQtyRate ? `<td>1</td><td>${escapeHtml(formatCurrency(invoice.amount))}</td>` : ''}
            <td>${escapeHtml(formatCurrency(invoice.amount))}</td>
          </tr>
        `}
      </tbody>
    </table>`
    })()}

    <div class="totals">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${escapeHtml(formatCurrency(invoice.amount))}</span>
        </div>
        ${invoice.tax > 0 ? `
          <div class="totals-row">
            <span>GST (18%)</span>
            <span>${escapeHtml(formatCurrency(invoice.tax))}</span>
          </div>
        ` : ''}
        <div class="totals-row total">
          <span>Total</span>
          <span>${escapeHtml(formatCurrency(invoice.total))}</span>
        </div>
      </div>
    </div>

    ${invoice.notes ? `
      <div class="notes">
        <h4>Notes</h4>
        <p>${escapeHtml(invoice.notes)}</p>
      </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Payment is due within the terms specified. Please include invoice number with your payment.</p>
    </div>
  </div>
</body>
</html>
    `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}, { rateLimit: 'READ' })
