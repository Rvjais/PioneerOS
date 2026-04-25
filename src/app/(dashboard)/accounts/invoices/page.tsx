'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDateShort } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { toast } from 'sonner'
import { downloadCSV } from '@/client/utils/downloadCSV'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'

interface Invoice {
  id: string
  invoiceNumber: string
  client: { id: string; name: string }
  amount: number
  tax: number
  total: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED'
  dueDate: string
  paidAmount?: number
  createdAt: string
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-900/20 text-slate-400 border-slate-500/30',
  SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  PARTIALLY_PAID: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PARTIAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function InvoicesPage() {
  const { data: session } = useSession()
  const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
  const canSendInvoice =
    allowedRoles.includes((session?.user as any)?.role) ||
    (session?.user as any)?.department === 'ACCOUNTS'

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    fetchInvoices()
  }, [selectedMonth])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoices?month=${selectedMonth}`)
      if (res.ok) {
        const data = await res.json()
        // API returns { data: [...], pagination: {...} } from paginatedResponse
        const invoiceList = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
        setInvoices(invoiceList)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices
    .filter(inv => statusFilter === 'all' || inv.status === statusFilter)
    .filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(search.toLowerCase())
    )

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'DRAFT').length,
    sent: invoices.filter(i => i.status === 'SENT').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
    paidAmount: invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0)
  }

  const sendInvoice = async (invoiceId: string) => {
    if (!confirm('Send this invoice to the client?')) return
    try {
      const res = await fetch(`/api/accounts/auto-invoice/send/${invoiceId}`, {
        method: 'POST'
      })
      if (res.ok) {
        toast.success('Invoice sent successfully')
        fetchInvoices()
      } else {
        toast.error('Failed to send invoice')
      }
    } catch (error) {
      console.error('Error sending invoice:', error)
      toast.error('Failed to send invoice')
    }
  }

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="invoices"
        title="Invoices"
        description="Create, send, and track client invoices and payment status."
        steps={[
          { label: 'Generate invoices', description: 'Create new invoices for clients' },
          { label: 'Send to clients', description: 'Email or share invoice links' },
          { label: 'Track payments', description: 'Monitor draft, sent, paid, and overdue status' },
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Invoices</h1>
            <InfoTooltip
              title="Invoice Management"
              steps={[
                'View all client invoices',
                'Track invoice status from draft to paid',
                'Send invoices via email/WhatsApp',
                'Monitor overdue invoices'
              ]}
              tips={[
                'Generate invoices by 5th of month',
                'Send within 2 days of generation'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Manage all client invoices</p>
        </div>

        <div className="flex items-center gap-2">
        <button
          onClick={() => downloadCSV(filteredInvoices.map(inv => ({
            'Invoice Number': inv.invoiceNumber,
            'Client Name': inv.client.name,
            Amount: inv.amount,
            Tax: inv.tax,
            Total: inv.total,
            Status: inv.status,
            'Due Date': formatDateShort(inv.dueDate),
            'Paid Date': '',
          })), 'invoices.csv')}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition"
        >
          Export CSV
        </button>
        <Link
          href="/accounts/auto-invoice"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Generate Invoice
          <InfoTip text="Auto-generate invoices for recurring clients" type="action" />
        </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/10 border border-slate-500/20 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Draft</p>
          <p className="text-2xl font-bold text-slate-300">{stats.draft}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Sent</p>
          <p className="text-2xl font-bold text-blue-300">{stats.sent}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Paid</p>
          <p className="text-2xl font-bold text-emerald-300">{stats.paid}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">Overdue</p>
          <p className="text-2xl font-bold text-red-300">{stats.overdue}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Collection</p>
          <p className="text-xl font-bold text-amber-300">
            {stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice or client..."
            className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No invoices found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Invoice #</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">GST</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Total</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Due Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-white">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${invoice.client.id}`}
                        className="text-white hover:text-emerald-400 transition-colors"
                      >
                        {invoice.client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      Rs. {(invoice.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      Rs. {(invoice.tax || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      Rs. {(invoice.total || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDateShort(invoice.dueDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${statusColors[invoice.status]}`}>
                        {invoice.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/finance/invoices/${invoice.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {canSendInvoice && (invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                          <button
                            onClick={() => sendInvoice(invoice.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Send"
                          >
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        )}
                        <a
                          href={`/api/invoices/${invoice.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
