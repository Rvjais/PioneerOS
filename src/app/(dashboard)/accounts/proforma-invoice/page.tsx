'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface ProformaInvoice {
  id: string
  invoiceNumber: string
  client: { id: string; name: string }
  company: string
  amount: number
  gstAmount: number
  totalAmount: number
  services: string[]
  validUntil: string
  status: 'draft' | 'sent' | 'accepted' | 'expired' | 'converted'
  createdAt: string
  sentAt?: string
  acceptedAt?: string
}

const statusColors = {
  draft: 'bg-slate-900/20 text-slate-400 border-slate-500/30',
  sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  converted: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
}

const companies = [
  { id: 'branding-pioneers', name: 'Branding Pioneers' },
  { id: 'atz-medappz', name: 'ATZ Medappz' },
  { id: 'bp-academy', name: 'BP Academy' },
]

export default function ProformaInvoicePage() {
  const [invoices, setInvoices] = useState<ProformaInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    clientName: '',
    company: '',
    services: '',
    amount: 0,
    gstRate: 18,
    validityDays: 15
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/accounts/proforma-invoices')
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error fetching proforma invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async () => {
    if (!newInvoice.clientName || !newInvoice.company || !newInvoice.amount) return

    const gstAmount = (newInvoice.amount * newInvoice.gstRate) / 100
    const totalAmount = newInvoice.amount + gstAmount
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + newInvoice.validityDays)

    const invoice: ProformaInvoice = {
      id: `pi-${Date.now()}`,
      invoiceNumber: `PI-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      client: { id: newInvoice.clientId || `client-${Date.now()}`, name: newInvoice.clientName },
      company: companies.find(c => c.id === newInvoice.company)?.name || newInvoice.company,
      amount: newInvoice.amount,
      gstAmount,
      totalAmount,
      services: newInvoice.services.split(',').map(s => s.trim()).filter(Boolean),
      validUntil: validUntil.toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString()
    }

    setInvoices(prev => [invoice, ...prev])
    setShowCreateModal(false)
    setNewInvoice({
      clientId: '',
      clientName: '',
      company: '',
      services: '',
      amount: 0,
      gstRate: 18,
      validityDays: 15
    })

    // Save to API
    try {
      await fetch('/api/accounts/proforma-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      })
    } catch (error) {
      console.error('Error saving proforma invoice:', error)
    }
  }

  const updateStatus = async (id: string, status: ProformaInvoice['status']) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === id
        ? {
            ...inv,
            status,
            ...(status === 'sent' && { sentAt: new Date().toISOString() }),
            ...(status === 'accepted' && { acceptedAt: new Date().toISOString() })
          }
        : inv
    ))

    try {
      await fetch(`/api/accounts/proforma-invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const filteredInvoices = invoices
    .filter(inv => filter === 'all' || inv.status === filter)
    .filter(inv => companyFilter === 'all' || inv.company === companyFilter)

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    accepted: invoices.filter(i => i.status === 'accepted').length,
    totalValue: invoices.filter(i => i.status !== 'expired').reduce((sum, i) => sum + i.totalAmount, 0),
    acceptedValue: invoices.filter(i => i.status === 'accepted' || i.status === 'converted').reduce((sum, i) => sum + i.totalAmount, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Proforma Invoice</h1>
            <InfoTooltip
              title="Proforma Invoice"
              steps={[
                'Create proforma invoice for quotes',
                'Send to client for acceptance',
                'Convert to final invoice after acceptance',
                'Track validity and expiry'
              ]}
              tips={[
                'Set appropriate validity period',
                'Follow up before expiry date'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Create and manage proforma invoices</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Proforma
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-900/10 border border-slate-500/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/10 border border-slate-500/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Draft</p>
          <p className="text-2xl font-bold text-white">{stats.draft}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Sent</p>
          <p className="text-2xl font-bold text-white">{stats.sent}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Accepted</p>
          <p className="text-2xl font-bold text-white">{stats.accepted}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-purple-400 text-sm">Total Value</p>
          <p className="text-xl font-bold text-white">Rs. {(stats.totalValue / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Accepted Value</p>
          <p className="text-xl font-bold text-white">Rs. {(stats.acceptedValue / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="expired">Expired</option>
          <option value="converted">Converted</option>
        </select>

        <select
          value={companyFilter}
          onChange={e => setCompanyFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Companies</option>
          {companies.map(company => (
            <option key={company.id} value={company.name}>{company.name}</option>
          ))}
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
            No proforma invoices found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Invoice #</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Company</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Services</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">GST</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Total</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Valid Until</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInvoices.map(invoice => {
                  const isExpired = new Date(invoice.validUntil) < new Date() && invoice.status === 'sent'

                  return (
                    <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-slate-400">
                          {formatDateDDMMYYYY(invoice.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{invoice.client.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.company === 'Branding Pioneers' ? 'bg-blue-500/20 text-blue-400' :
                          invoice.company === 'ATZ Medappz' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {invoice.company}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
                        {invoice.services.slice(0, 2).join(', ')}
                        {invoice.services.length > 2 && ` +${invoice.services.length - 2}`}
                      </td>
                      <td className="px-4 py-3 text-white">Rs. {invoice.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-400">Rs. {invoice.gstAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">Rs. {invoice.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={isExpired ? 'text-red-400' : 'text-slate-300'}>
                          {formatDateDDMMYYYY(invoice.validUntil)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full border ${statusColors[isExpired ? 'expired' : invoice.status]}`}>
                          {isExpired ? 'Expired' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => updateStatus(invoice.id, 'sent')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            >
                              Send
                            </button>
                          )}
                          {invoice.status === 'sent' && !isExpired && (
                            <button
                              onClick={() => updateStatus(invoice.id, 'accepted')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
                            >
                              Accept
                            </button>
                          )}
                          {invoice.status === 'accepted' && (
                            <button
                              onClick={() => updateStatus(invoice.id, 'converted')}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                            >
                              Convert
                            </button>
                          )}
                          <button
                            className="px-2 py-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs rounded transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Create Proforma Invoice</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Client Name *</label>
                <input
                  type="text"
                  value={newInvoice.clientName}
                  onChange={e => setNewInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Company *</label>
                <select
                  value={newInvoice.company}
                  onChange={e => setNewInvoice(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Services (comma-separated)</label>
                <input
                  type="text"
                  value={newInvoice.services}
                  onChange={e => setNewInvoice(prev => ({ ...prev, services: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  placeholder="SEO, Social Media, Web Development"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Amount (Rs.) *</label>
                  <input
                    type="number"
                    value={newInvoice.amount || ''}
                    onChange={e => setNewInvoice(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">GST Rate (%)</label>
                  <select
                    value={newInvoice.gstRate}
                    onChange={e => setNewInvoice(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Validity (days)</label>
                <select
                  value={newInvoice.validityDays}
                  onChange={e => setNewInvoice(prev => ({ ...prev, validityDays: Number(e.target.value) }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                >
                  <option value={7}>7 days</option>
                  <option value={15}>15 days</option>
                  <option value={30}>30 days</option>
                  <option value={45}>45 days</option>
                  <option value={60}>60 days</option>
                </select>
              </div>

              {/* Preview */}
              {newInvoice.amount > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Preview</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount</span>
                      <span className="text-white">Rs. {newInvoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GST ({newInvoice.gstRate}%)</span>
                      <span className="text-white">Rs. {((newInvoice.amount * newInvoice.gstRate) / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                      <span className="text-slate-300 font-medium">Total</span>
                      <span className="text-emerald-400 font-bold">
                        Rs. {(newInvoice.amount + (newInvoice.amount * newInvoice.gstRate) / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createInvoice}
                disabled={!newInvoice.clientName || !newInvoice.company || !newInvoice.amount}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
