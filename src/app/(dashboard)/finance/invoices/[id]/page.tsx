import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

type PageProps = {
  params: Promise<{ id: string }>
}

async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          gstNumber: true,
        },
      },
    },
  })
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-800/50 text-slate-200 border-white/10',
    SENT: 'bg-blue-500/20 text-blue-400 border-blue-200',
    PAID: 'bg-green-500/20 text-green-400 border-green-200',
    OVERDUE: 'bg-red-500/20 text-red-400 border-red-200',
    CANCELLED: 'bg-slate-800/50 text-slate-400 border-white/10',
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Parse items JSON
  let items: Array<{ description: string; quantity: number; rate: number; amount: number }> = []
  if (invoice.items) {
    try {
      items = JSON.parse(invoice.items)
    } catch {
      // Invalid JSON, ignore
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/finance/invoices"
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Proforma Invoice {invoice.invoiceNumber}</h1>
            <p className="text-slate-400 mt-1">Created on {formatDate(invoice.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${statusColors[invoice.status]}`}>
            {invoice.status}
          </span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden print:border-0 print:shadow-none">
        {/* Invoice Header */}
        <div className="p-6 border-b border-white/10 bg-slate-900/40">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">PROFORMA INVOICE</h2>
              <p className="text-slate-300 mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">Branding Pioneers</p>
              <p className="text-sm text-slate-300">Gurugram, Haryana</p>
              <p className="text-sm text-slate-300">GSTIN: 06AABCB1234A1ZA</p>
            </div>
          </div>
        </div>

        {/* Client & Invoice Details */}
        <div className="p-6 grid md:grid-cols-2 gap-6 border-b border-white/10">
          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
            <p className="font-semibold text-white">{invoice.client.name}</p>
            {invoice.client.contactName && (
              <p className="text-slate-300">{invoice.client.contactName}</p>
            )}
            {invoice.client.address && (
              <p className="text-slate-300">
                {[invoice.client.address, invoice.client.city, invoice.client.state, invoice.client.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {invoice.client.gstNumber && (
              <p className="text-slate-300">GSTIN: {invoice.client.gstNumber}</p>
            )}
          </div>
          <div className="text-right">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-slate-400">Invoice Date:</span>
                <span className="ml-2 font-medium text-white">{formatDate(invoice.createdAt)}</span>
              </div>
              <div>
                <span className="text-sm text-slate-400">Due Date:</span>
                <span className="ml-2 font-medium text-white">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.serviceMonth && (
                <div>
                  <span className="text-sm text-slate-400">Service Period:</span>
                  <span className="ml-2 font-medium text-white">{formatDate(invoice.serviceMonth)}</span>
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <span className="text-sm text-slate-400">Paid On:</span>
                  <span className="ml-2 font-medium text-green-400">{formatDate(invoice.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6 border-b border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-sm font-medium text-slate-400 uppercase tracking-wider">Description</th>
                <th className="text-right py-2 text-sm font-medium text-slate-400 uppercase tracking-wider">Qty</th>
                <th className="text-right py-2 text-sm font-medium text-slate-400 uppercase tracking-wider">Rate</th>
                <th className="text-right py-2 text-sm font-medium text-slate-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={`item-${item.description}-${index}`} className="border-b border-white/5">
                    <td className="py-3 text-white">{item.description}</td>
                    <td className="py-3 text-right text-slate-300">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-300">{formatCurrency(item.rate)}</td>
                    <td className="py-3 text-right font-medium text-white">{formatCurrency(item.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-white/5">
                  <td className="py-3 text-white">Professional Services</td>
                  <td className="py-3 text-right text-slate-300">1</td>
                  <td className="py-3 text-right text-slate-300">{formatCurrency(invoice.amount)}</td>
                  <td className="py-3 text-right font-medium text-white">{formatCurrency(invoice.amount)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-6 bg-slate-900/40">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300">Subtotal</span>
              <span className="font-medium text-white">{formatCurrency(invoice.amount)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-300">GST (18%)</span>
                <span className="font-medium text-white">{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-white">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-900/40 text-center text-sm text-slate-400">
          <p>This is a computer-generated proforma invoice and does not require a signature.</p>
          <p className="mt-1">Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}
