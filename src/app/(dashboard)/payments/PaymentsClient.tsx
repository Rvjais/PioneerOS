'use client'

import { useState, useMemo } from 'react'
import { downloadCSV } from '@/client/utils/downloadCSV'

interface Invoice {
  id: string
  invoiceNumber: string
  total: number
  status: string
  dueDate: string
  paidAt: string | null
  client: { name: string }
}

interface Client {
  id: string
  name: string
  monthlyFee: number | null
  paymentStatus: string | null
  paymentDueDay: number | null
  pendingAmount: number | null
}

export function ExportReportButton({ invoices, clients }: { invoices: Invoice[]; clients: Client[] }) {
  const handleExport = () => {
    const rows = invoices.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      Client: inv.client.name,
      Amount: inv.total,
      Status: inv.status,
      'Due Date': new Date(inv.dueDate).toLocaleDateString('en-IN'),
      'Paid At': inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('en-IN') : '',
    }))

    if (rows.length === 0) {
      // Fall back to client data if no invoices
      const clientRows = clients.map(c => ({
        Client: c.name,
        'Monthly Fee': c.monthlyFee ?? '',
        'Payment Due Day': c.paymentDueDay ?? '',
        'Pending Amount': c.pendingAmount ?? 0,
        Status: c.paymentStatus ?? 'PENDING',
      }))
      downloadCSV(clientRows.length ? clientRows : [{ Message: 'No data to export' }], 'payment-report.csv')
      return
    }

    downloadCSV(rows, 'payment-report.csv')
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export Report
    </button>
  )
}

const STATUS_TABS = ['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function ClientPaymentTableClient({ clients }: { clients: Client[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return clients
    return clients.filter(c => (c.paymentStatus || 'PENDING') === statusFilter)
  }, [clients, statusFilter])

  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-lg font-semibold text-white">Client Payment Status</h2>
        <div className="flex-1" />
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === tab
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/40">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Monthly Fee</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Due Day</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Pending</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  {statusFilter === 'ALL' ? 'No clients found' : `No ${statusFilter.toLowerCase()} clients`}
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr key={client.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-white">{client.name}</td>
                  <td className="px-5 py-4 text-slate-300">
                    {client.monthlyFee ? `₹${client.monthlyFee.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {client.paymentDueDay ? ordinal(client.paymentDueDay) : '-'}
                  </td>
                  <td className="px-5 py-4">
                    {client.pendingAmount ? (
                      <span className="text-red-400 font-medium">₹{client.pendingAmount.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-green-400">Clear</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      client.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' :
                      client.paymentStatus === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {client.paymentStatus || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
