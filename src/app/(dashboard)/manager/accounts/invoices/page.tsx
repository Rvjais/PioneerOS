'use client'

import { useState } from 'react'

interface Invoice {
  id: string
  invoiceNumber: string
  client: string
  amount: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  dueDate: string
  sentDate: string
  services: string[]
}

const INVOICES: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2024-001', client: 'Apollo Hospitals', amount: 150000, status: 'PAID', dueDate: '2024-03-10', sentDate: '2024-03-01', services: ['SEO', 'Ads', 'Social'] },
  { id: '2', invoiceNumber: 'INV-2024-002', client: 'MaxCare Hospital', amount: 200000, status: 'SENT', dueDate: '2024-03-15', sentDate: '2024-03-05', services: ['SEO', 'Ads'] },
  { id: '3', invoiceNumber: 'INV-2024-003', client: 'MedPlus Clinics', amount: 80000, status: 'OVERDUE', dueDate: '2024-03-05', sentDate: '2024-02-25', services: ['SEO', 'Web'] },
  { id: '4', invoiceNumber: 'INV-2024-004', client: 'HealthFirst Labs', amount: 60000, status: 'SENT', dueDate: '2024-03-20', sentDate: '2024-03-10', services: ['Ads', 'Social'] },
  { id: '5', invoiceNumber: 'INV-2024-005', client: 'CareConnect', amount: 120000, status: 'OVERDUE', dueDate: '2024-03-01', sentDate: '2024-02-20', services: ['SEO', 'Ads', 'Web'] },
  { id: '6', invoiceNumber: 'INV-2024-006', client: 'WellnessHub', amount: 45000, status: 'DRAFT', dueDate: '2024-03-25', sentDate: '-', services: ['Social', 'Web'] },
]

export default function ManagerAccountsInvoicesPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredInvoices = filter === 'all' ? INVOICES : INVOICES.filter(i => i.status === filter)

  const totalAmount = INVOICES.reduce((sum, i) => sum + i.amount, 0)
  const paidAmount = INVOICES.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0)
  const overdueAmount = INVOICES.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0)
  const pendingAmount = INVOICES.filter(i => i.status === 'SENT').reduce((sum, i) => sum + i.amount, 0)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-500/20 text-green-400'
      case 'SENT': return 'bg-blue-500/20 text-blue-400'
      case 'OVERDUE': return 'bg-red-500/20 text-red-400'
      case 'DRAFT': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoice Management</h1>
            <p className="text-emerald-100">Track and manage client invoices</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Total Invoiced</p>
              <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Collected</p>
              <p className="text-3xl font-bold">{formatCurrency(paidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter(filter === 'PAID' ? 'all' : 'PAID')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'PAID' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Paid</p>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(paidAmount)}</p>
          <p className="text-xs text-slate-400">{INVOICES.filter(i => i.status === 'PAID').length} invoices</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'SENT' ? 'all' : 'SENT')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'SENT' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 glass-card hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-slate-400">Pending</p>
          <p className="text-3xl font-bold text-blue-400">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-slate-400">{INVOICES.filter(i => i.status === 'SENT').length} invoices</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'OVERDUE' ? 'all' : 'OVERDUE')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'OVERDUE' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <p className="text-sm text-slate-400">Overdue</p>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(overdueAmount)}</p>
          <p className="text-xs text-slate-400">{INVOICES.filter(i => i.status === 'OVERDUE').length} invoices</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'DRAFT' ? 'all' : 'DRAFT')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'DRAFT' ? 'border-slate-500 bg-slate-900/40' : 'border-white/10 glass-card hover:border-white/20'
          }`}
        >
          <p className="text-sm text-slate-400">Draft</p>
          <p className="text-3xl font-bold text-slate-300">{formatCurrency(INVOICES.filter(i => i.status === 'DRAFT').reduce((sum, i) => sum + i.amount, 0))}</p>
          <p className="text-xs text-slate-400">{INVOICES.filter(i => i.status === 'DRAFT').length} invoices</p>
        </button>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">INVOICE</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">AMOUNT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DUE DATE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">SERVICES</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(invoice => (
              <tr key={invoice.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <span className="font-medium text-white">{invoice.invoiceNumber}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-white">{invoice.client}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-medium text-white">{formatCurrency(invoice.amount)}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-400">
                    {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex gap-1 justify-center flex-wrap">
                    {invoice.services.map(s => (
                      <span key={s} className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">{s}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Items */}
      <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
        <h3 className="font-semibold text-emerald-800 mb-3">Invoice Actions</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-emerald-700">
          <div>
            <p className="font-medium mb-1">Overdue Follow-ups</p>
            <ul className="space-y-1">
              <li>- MedPlus: 6 days overdue (80K)</li>
              <li>- CareConnect: 10 days overdue (1.2L)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Upcoming Due</p>
            <ul className="space-y-1">
              <li>- MaxCare: Due Mar 15 (2L)</li>
              <li>- HealthFirst: Due Mar 20 (60K)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Pending Actions</p>
            <ul className="space-y-1">
              <li>- WellnessHub: Send draft invoice</li>
              <li>- Review Q1 billing status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
