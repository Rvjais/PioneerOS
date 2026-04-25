'use client'

import { useState, useEffect } from 'react'
import { getInvoiceStatusColor } from '@/shared/constants/portal'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface InvoiceItem {
  description: string
  quantity?: number
  rate?: number
  amount: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  tax: number
  total: number
  status: string
  dueDate: string
  paidAt: string | null
  items: InvoiceItem[]
  notes: string | null
  entityType: string
  currency: string
  serviceMonth: string | null
  createdAt: string
}

interface Summary {
  total: number
  totalAmount: number
  paid: number
  paidAmount: number
  pending: number
  pendingAmount: number
  overdue: number
  overdueAmount: number
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [selectedStatus])

  const fetchInvoices = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedStatus) params.append('status', selectedStatus)

      const res = await fetch(`/api/client-portal/invoices?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices || [])
        setSummary(data.summary || null)
      } else {
        setError('Failed to load invoices')
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      setError('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}-${month}-${d.getFullYear()}`
  }

  const formatMonth = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    })
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'PAID' && status !== 'CANCELLED' && new Date(dueDate) < new Date()
  }

  const handlePrint = (invoiceId: string) => {
    setExpandedInvoice(invoiceId)
    setTimeout(() => window.print(), 100)
  }

  return (
    <div className="space-y-6">
      <PageGuide
        title="Invoices"
        description="View and download your invoices. Expand any invoice to see line items and print."
        pageKey="portal-invoices"
      />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide sidebar, header, navigation */
          aside, header, nav,
          .lg\\:pl-64 > header,
          [class*="fixed inset-y-0"] {
            display: none !important;
          }

          /* Remove sidebar offset */
          .lg\\:pl-64 {
            padding-left: 0 !important;
          }

          /* White background, dark text */
          body, main, div {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Hide filter controls and action buttons */
          .print-hide {
            display: none !important;
          }

          /* Show only expanded invoice content */
          .glass-card, [class*="glass-card"] {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }

          /* Fix text colors for print */
          .text-white { color: black !important; }
          .text-slate-300, .text-slate-400, .text-slate-200 { color: #374151 !important; }
          .text-green-400 { color: #16a34a !important; }
          .text-blue-400 { color: #2563eb !important; }
          .text-red-400 { color: #dc2626 !important; }

          /* Hide non-expanded invoices */
          .invoice-card-collapsed {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Proforma Invoices</h1>
        <p className="text-slate-300 mt-1">View and track your invoices</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print-hide">
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Total Invoices</p>
            <p className="text-2xl font-bold text-white">{summary.total}</p>
            <p className="text-sm text-slate-400 mt-1">{formatCurrency(summary.totalAmount)}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Paid</p>
            <p className="text-2xl font-bold text-green-400">{summary.paid}</p>
            <p className="text-sm text-green-400 mt-1">{formatCurrency(summary.paidAmount)}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-blue-400">{summary.pending}</p>
            <p className="text-sm text-blue-400 mt-1">{formatCurrency(summary.pendingAmount)}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Overdue</p>
            <p className="text-2xl font-bold text-red-400">{summary.overdue}</p>
            <p className="text-sm text-red-400 mt-1">{formatCurrency(summary.overdueAmount)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center print-hide">
        <span className="text-sm text-slate-400 mr-1">Filter:</span>
        <InfoTip text="Filter invoices by their payment status" type="info" />
        {['', 'SENT', 'PAID', 'OVERDUE'].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'glass-card text-slate-300 border border-white/20 hover:bg-slate-900/40'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => { setError(null); fetchInvoices() }} className="px-4 py-2 bg-orange-500 text-white rounded-lg">Try Again</button>
        </div>
      ) : null}

      {/* Invoices List */}
      {!error && loading ? (
        <PortalPageSkeleton titleWidth="w-44" statCards={4} listItems={5} />
      ) : !error && invoices.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border border-white/10">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-1">No Invoices Found</h3>
          <p className="text-slate-400">Your invoices will appear here once they're generated.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className={`glass-card rounded-xl shadow-none border border-white/10 overflow-hidden ${expandedInvoice !== invoice.id ? 'invoice-card-collapsed' : ''}`}
            >
              <div
                className="px-6 py-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
                onClick={() => setExpandedInvoice(expandedInvoice === invoice.id ? null : invoice.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      invoice.status === 'PAID' ? 'bg-green-500/20' :
                      invoice.status === 'OVERDUE' || isOverdue(invoice.dueDate, invoice.status) ? 'bg-red-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        invoice.status === 'PAID' ? 'text-green-400' :
                        invoice.status === 'OVERDUE' || isOverdue(invoice.dueDate, invoice.status) ? 'text-red-400' :
                        'text-blue-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{invoice.invoiceNumber}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getInvoiceStatusColor(invoice.status)}`}>
                          {isOverdue(invoice.dueDate, invoice.status) ? 'OVERDUE' : invoice.status}
                        </span>
                        <InfoTip text="PAID = settled, SENT = awaiting payment, OVERDUE = past due date" type="info" />
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {invoice.serviceMonth ? formatMonth(invoice.serviceMonth) : formatDate(invoice.createdAt)}
                        {' | '}
                        Due: {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{formatCurrency(invoice.total, invoice.currency)}</p>
                      {invoice.paidAt && (
                        <p className="text-sm text-green-400">Paid on {formatDate(invoice.paidAt)}</p>
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedInvoice === invoice.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedInvoice === invoice.id && (
                <div className="px-6 py-4 border-t border-white/5 bg-slate-900/40">
                  {/* Line Items */}
                  {invoice.items.length > 0 && (() => {
                    const hasQtyRate = invoice.items.some(item => item.quantity != null && item.rate != null)
                    return (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-200 mb-2">Items</h4>
                        <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-900/40">
                              <tr>
                                <th className="px-4 py-2 text-left text-slate-300">Description</th>
                                {hasQtyRate && (
                                  <>
                                    <th className="px-4 py-2 text-right text-slate-300">Qty</th>
                                    <th className="px-4 py-2 text-right text-slate-300">Rate</th>
                                  </>
                                )}
                                <th className="px-4 py-2 text-right text-slate-300">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {invoice.items.map((item, index) => (
                                <tr key={`${item.description}-${index}`}>
                                  <td className="px-4 py-2 text-white">{item.description}</td>
                                  {hasQtyRate && (
                                    <>
                                      <td className="px-4 py-2 text-right text-slate-300">{item.quantity ?? '-'}</td>
                                      <td className="px-4 py-2 text-right text-slate-300">
                                        {item.rate != null ? formatCurrency(item.rate, invoice.currency) : '-'}
                                      </td>
                                    </>
                                  )}
                                  <td className="px-4 py-2 text-right text-white font-medium">
                                    {formatCurrency(item.amount, invoice.currency)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Summary */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Subtotal</span>
                        <span className="text-white">{formatCurrency(invoice.amount, invoice.currency)}</span>
                      </div>
                      {invoice.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Tax (GST)</span>
                          <span className="text-white">{formatCurrency(invoice.tax, invoice.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-semibold pt-2 border-t border-white/10">
                        <span className="text-white">Total</span>
                        <span className="text-white">{formatCurrency(invoice.total, invoice.currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-sm font-medium text-slate-200 mb-1">Notes</h4>
                      <p className="text-slate-300 text-sm">{invoice.notes}</p>
                    </div>
                  )}

                  {/* Download & Entity */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      From: {invoice.entityType.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2 print-hide">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrint(invoice.id) }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg font-medium text-sm hover:bg-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print<InfoTip text="Prints the expanded invoice details" type="info" />
                      </button>
                      <a
                        href={`/api/client-portal/invoices/${invoice.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
