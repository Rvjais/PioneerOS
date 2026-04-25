'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { HelpContent } from '@/shared/constants/helpContent'

interface Payment {
  id: string
  clientId: string
  client: { id: string; name: string; tier: string }
  invoice?: { id: string; invoiceNumber: string }
  grossAmount: number
  tdsDeducted: number
  tdsPercentage: number
  gstAmount: number
  netAmount: number
  collectedAt: string
  paymentMethod: string
  transactionRef?: string
  bankName?: string
  accountNumber?: string
  retainerMonth?: string
  serviceType?: string
  description?: string
  entityType: string
  status: string
  notes?: string
}

interface Summary {
  totalGross: number
  totalTds: number
  totalGst: number
  totalNet: number
  count: number
}

interface Client {
  id: string
  name: string
  tier: string
  monthlyFee: number
}

const PAYMENT_METHODS = [
  { id: 'NEFT', label: 'NEFT' },
  { id: 'RTGS', label: 'RTGS' },
  { id: 'UPI', label: 'UPI' },
  { id: 'CHEQUE', label: 'Cheque' },
  { id: 'CASH', label: 'Cash' },
  { id: 'ONLINE', label: 'Online' },
]

const BANK_ACCOUNTS = [
  { id: 'HDFC_BP', name: 'HDFC - Branding Pioneers', entity: 'BRANDING_PIONEERS' },
  { id: 'AXIS_BP', name: 'Axis - Branding Pioneers', entity: 'BRANDING_PIONEERS' },
  { id: 'HDFC_ATZ', name: 'HDFC - ATZ Medappz', entity: 'ATZ_MEDAPPZ' },
]

const SERVICE_TYPES = [
  { id: 'RETAINER', label: 'Monthly Retainer' },
  { id: 'PROJECT', label: 'Project Fee' },
  { id: 'ADVANCE', label: 'Advance Payment' },
  { id: 'ADHOC', label: 'Ad-hoc Work' },
]

export default function PaymentLedgerPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<Summary>({ totalGross: 0, totalTds: 0, totalGst: 0, totalNet: 0, count: 0 })
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [formData, setFormData] = useState({
    clientId: '',
    grossAmount: '',
    tdsPercentage: '10',
    tdsDeducted: '',
    gstAmount: '',
    collectedAt: new Date().toISOString().split('T')[0],
    paymentMethod: 'NEFT',
    transactionRef: '',
    bankName: 'HDFC_BP',
    retainerMonth: new Date().toISOString().slice(0, 7),
    serviceType: 'RETAINER',
    description: '',
    entityType: 'BRANDING_PIONEERS',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchPayments(), fetchClients()])
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/accounts/payments?month=${selectedMonth}`)
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
        setSummary(data.summary || { totalGross: 0, totalTds: 0, totalGst: 0, totalNet: 0, count: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : data.clients || [])
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleGrossChange = (value: string) => {
    const gross = parseFloat(value) || 0
    const tdsPercent = parseFloat(formData.tdsPercentage) || 10
    const tds = (gross * tdsPercent / 100).toFixed(2)
    setFormData({ ...formData, grossAmount: value, tdsDeducted: tds })
  }

  const handleTdsPercentChange = (value: string) => {
    const gross = parseFloat(formData.grossAmount) || 0
    const tdsPercent = parseFloat(value) || 10
    const tds = (gross * tdsPercent / 100).toFixed(2)
    setFormData({ ...formData, tdsPercentage: value, tdsDeducted: tds })
  }

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.grossAmount) {
      showToast('Client and amount are required', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/accounts/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grossAmount: parseFloat(formData.grossAmount),
          tdsDeducted: parseFloat(formData.tdsDeducted) || 0,
          tdsPercentage: parseFloat(formData.tdsPercentage) || 10,
          gstAmount: parseFloat(formData.gstAmount) || 0,
          retainerMonth: `${formData.retainerMonth}-01`,
          bankName: BANK_ACCOUNTS.find(b => b.id === formData.bankName)?.name,
        })
      })

      if (res.ok) {
        showToast('Payment recorded successfully', 'success')
        setShowAddModal(false)
        resetForm()
        fetchPayments()
      } else {
        showToast('Failed to record payment', 'error')
      }
    } catch (error) {
      console.error('Failed to record payment:', error)
      showToast('Failed to record payment', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      clientId: '',
      grossAmount: '',
      tdsPercentage: '10',
      tdsDeducted: '',
      gstAmount: '',
      collectedAt: new Date().toISOString().split('T')[0],
      paymentMethod: 'NEFT',
      transactionRef: '',
      bankName: 'HDFC_BP',
      retainerMonth: new Date().toISOString().slice(0, 7),
      serviceType: 'RETAINER',
      description: '',
      entityType: 'BRANDING_PIONEERS',
      notes: ''
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-none ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Payment Ledger</h1>
            <InfoTooltip
              title={HelpContent.accounts.ledger.title}
              steps={HelpContent.accounts.ledger.steps}
              tips={HelpContent.accounts.ledger.tips}
            />
          </div>
          <p className="text-slate-400 mt-1">Track all client payments with TDS, GST, and bank details</p>
        </div>
        <div className="flex gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Record Payment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Gross</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalGross)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">TDS Deducted</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.totalTds)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">GST Collected</p>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.totalGst)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Net Received</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalNet)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Payments</p>
          <p className="text-2xl font-bold text-white">{summary.count}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Retainer For</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Gross</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">TDS</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">GST</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Net</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Bank</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Method</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No payments recorded for this month
                  </td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-slate-300">{formatDate(payment.collectedAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/clients/${payment.clientId}`} className="text-white font-medium hover:text-blue-400">
                        {payment.client.name}
                      </Link>
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                        payment.client.tier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
                        payment.client.tier === 'PREMIUM' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-600 text-slate-400'
                      }`}>
                        {payment.client.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {payment.retainerMonth ? formatDateDDMMYYYY(payment.retainerMonth) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">{formatCurrency(payment.grossAmount)}</td>
                    <td className="px-4 py-3 text-right text-amber-400">
                      {formatCurrency(payment.tdsDeducted)}
                      <span className="text-xs text-slate-400 ml-1">({payment.tdsPercentage}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right text-blue-400">{formatCurrency(payment.gstAmount)}</td>
                    <td className="px-4 py-3 text-right text-green-400 font-medium">{formatCurrency(payment.netAmount)}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{payment.bankName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm font-mono">{payment.transactionRef || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-800">
              <h3 className="text-lg font-bold text-white">Record Payment</h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                >
                  <option value="">Select Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                  ))}
                </select>
              </div>

              {/* Amount Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Gross Amount *</label>
                  <input
                    type="number"
                    value={formData.grossAmount}
                    onChange={e => handleGrossChange(e.target.value)}
                    placeholder="100000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">TDS %</label>
                  <select
                    value={formData.tdsPercentage}
                    onChange={e => handleTdsPercentChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="0">0% (No TDS)</option>
                    <option value="2">2%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">TDS Deducted</label>
                  <input
                    type="number"
                    value={formData.tdsDeducted}
                    onChange={e => setFormData({ ...formData, tdsDeducted: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-amber-400"
                    readOnly
                  />
                </div>
              </div>

              {/* GST & Net */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">GST Amount</label>
                  <input
                    type="number"
                    value={formData.gstAmount}
                    onChange={e => setFormData({ ...formData, gstAmount: e.target.value })}
                    placeholder="18000"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Net Amount (Auto)</label>
                  <div className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-green-400 font-medium">
                    {formatCurrency((parseFloat(formData.grossAmount) || 0) - (parseFloat(formData.tdsDeducted) || 0))}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Collection Date</label>
                  <input
                    type="date"
                    value={formData.collectedAt}
                    onChange={e => setFormData({ ...formData, collectedAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Retainer Month</label>
                  <input
                    type="month"
                    value={formData.retainerMonth}
                    onChange={e => setFormData({ ...formData, retainerMonth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Transaction Ref / UTR</label>
                  <input
                    type="text"
                    value={formData.transactionRef}
                    onChange={e => setFormData({ ...formData, transactionRef: e.target.value })}
                    placeholder="UTR123456789"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Bank Account */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Collected In Account</label>
                  <select
                    value={formData.bankName}
                    onChange={e => {
                      const bank = BANK_ACCOUNTS.find(b => b.id === e.target.value)
                      setFormData({
                        ...formData,
                        bankName: e.target.value,
                        entityType: bank?.entity || 'BRANDING_PIONEERS'
                      })
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  >
                    {BANK_ACCOUNTS.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  >
                    {SERVICE_TYPES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white h-20"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-slate-800">
              <button
                onClick={() => { setShowAddModal(false); resetForm() }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.clientId || !formData.grossAmount}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
