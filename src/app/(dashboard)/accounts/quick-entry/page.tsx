'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  monthlyFee: number
  pendingAmount: number
  currentPaymentStatus: string
  whatsapp?: string
}

interface RecentPayment {
  id: string
  grossAmount: number
  paymentMethod: string
  collectedAt: string
  client: { name: string }
}

interface RecentExpense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

interface QuickExpensePreset {
  title: string
  category: string
  icon: string
  color: string
}

const EXPENSE_PRESETS: QuickExpensePreset[] = [
  { title: 'Software/Tools', category: 'software', icon: '💻', color: 'blue' },
  { title: 'Ad Spend', category: 'advertising', icon: '📢', color: 'purple' },
  { title: 'Office', category: 'office', icon: '🏢', color: 'amber' },
  { title: 'Freelancer', category: 'freelancer', icon: '👨‍💼', color: 'cyan' },
  { title: 'Travel', category: 'travel', icon: '✈️', color: 'pink' },
  { title: 'Utilities', category: 'utilities', icon: '⚡', color: 'emerald' },
]

export default function QuickEntryPage() {
  const [activeTab, setActiveTab] = useState<'payment' | 'expense' | 'invoice'>('payment')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Payment form
  const [paymentSearch, setPaymentSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('NEFT')
  const [paymentRef, setPaymentRef] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Expense form
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('software')
  const [expenseVendor, setExpenseVendor] = useState('')

  // Invoice quick gen
  const [invoiceClients, setInvoiceClients] = useState<Client[]>([])
  const [selectedInvoiceClients, setSelectedInvoiceClients] = useState<Set<string>>(new Set())

  // Recent activity
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([])
  const [showRecent, setShowRecent] = useState(true)

  useEffect(() => {
    fetchClients()
    fetchRecentActivity()
    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setActiveTab('payment')
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        setActiveTab('expense')
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        setActiveTab('invoice')
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || data || [])
        setInvoiceClients(data.clients || data || [])
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent payments
      const paymentsRes = await fetch('/api/accounts/payments?limit=5')
      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setRecentPayments(data.payments || data || [])
      }

      // Fetch recent expenses
      const expensesRes = await fetch('/api/expenses?limit=5')
      if (expensesRes.ok) {
        const data = await expensesRes.json()
        setRecentExpenses(data.expenses || data || [])
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err)
    }
  }

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(paymentSearch.toLowerCase())
  ).slice(0, 5)

  const selectClient = (client: Client) => {
    setSelectedClient(client)
    setPaymentSearch(client.name)
    setPaymentAmount(client.pendingAmount?.toString() || client.monthlyFee?.toString() || '')
    setShowClientDropdown(false)
  }

  const handlePaymentSubmit = async () => {
    if (!selectedClient || !paymentAmount) {
      setError('Please select a client and enter amount')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/accounts/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          grossAmount: parseFloat(paymentAmount),
          paymentMethod,
          transactionRef: paymentRef || undefined,
          collectedAt: new Date().toISOString(),
        })
      })

      if (res.ok) {
        setSuccess(`Payment of ₹${parseFloat(paymentAmount).toLocaleString()} recorded for ${selectedClient.name}`)
        setSelectedClient(null)
        setPaymentSearch('')
        setPaymentAmount('')
        setPaymentRef('')
        fetchClients()
        fetchRecentActivity()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to record payment')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseSubmit = async () => {
    if (!expenseDescription || !expenseAmount) {
      setError('Please enter description and amount')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseDescription,
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          vendor: expenseVendor || undefined,
          date: new Date().toISOString(),
        })
      })

      if (res.ok) {
        setSuccess(`Expense of ₹${parseFloat(expenseAmount).toLocaleString()} added`)
        setExpenseDescription('')
        setExpenseAmount('')
        setExpenseVendor('')
        fetchRecentActivity()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add expense')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkInvoice = async () => {
    if (selectedInvoiceClients.size === 0) {
      setError('Please select at least one client')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/accounts/auto-invoice/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIds: Array.from(selectedInvoiceClients)
        })
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(`Generated ${data.generated || selectedInvoiceClients.size} invoices`)
        setSelectedInvoiceClients(new Set())
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to generate invoices')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const toggleInvoiceClient = (clientId: string) => {
    setSelectedInvoiceClients(prev => {
      const next = new Set(prev)
      if (next.has(clientId)) {
        next.delete(clientId)
      } else {
        next.add(clientId)
      }
      return next
    })
  }

  const selectAllInvoiceClients = () => {
    if (selectedInvoiceClients.size === invoiceClients.length) {
      setSelectedInvoiceClients(new Set())
    } else {
      setSelectedInvoiceClients(new Set(invoiceClients.map(c => c.id)))
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quick Entry</h1>
          <p className="text-slate-400 mt-1">Fast data entry for common tasks</p>
        </div>
        <Link
          href="/accounts"
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-emerald-400">{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-red-400">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('payment')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'payment'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Record Payment
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'expense'
              ? 'bg-amber-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
          Add Expense
        </button>
        <button
          onClick={() => setActiveTab('invoice')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'invoice'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Quick Invoice
        </button>
      </div>

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Record Payment</h2>

          <div className="space-y-5">
            {/* Client Search */}
            <div ref={searchRef} className="relative">
              <label className="block text-sm font-medium text-slate-400 mb-2">Client</label>
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => {
                  setPaymentSearch(e.target.value)
                  setShowClientDropdown(true)
                  if (!e.target.value) setSelectedClient(null)
                }}
                onFocus={() => setShowClientDropdown(true)}
                placeholder="Type to search client..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 outline-none text-lg"
              />
              {showClientDropdown && paymentSearch && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-none overflow-hidden">
                  {filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => selectClient(client)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">{client.name}</p>
                        <p className="text-sm text-slate-400">
                          Due: ₹{(client.pendingAmount || client.monthlyFee || 0).toLocaleString()}
                        </p>
                      </div>
                      {client.currentPaymentStatus === 'OVERDUE' && (
                        <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Overdue</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Client Info */}
            {selectedClient && (
              <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{selectedClient.name}</p>
                  <p className="text-sm text-slate-400">
                    Monthly: ₹{(selectedClient.monthlyFee || 0).toLocaleString()} |
                    Pending: ₹{(selectedClient.pendingAmount || 0).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedClient(null)
                    setPaymentSearch('')
                    setPaymentAmount('')
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Amount and Method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">₹</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 outline-none text-lg font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['NEFT', 'UPI', 'CASH'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-3 rounded-xl font-medium transition-colors ${
                        paymentMethod === method
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reference (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Reference / UTR <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Transaction reference..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handlePaymentSubmit}
              disabled={loading || !selectedClient || !paymentAmount}
              className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Record Payment
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Expense Tab */}
      {activeTab === 'expense' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Add Expense</h2>

          {/* Quick Category Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {EXPENSE_PRESETS.map(preset => (
                <button
                  key={preset.category}
                  onClick={() => setExpenseCategory(preset.category)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    expenseCategory === preset.category
                      ? `border-${preset.color}-500 bg-${preset.color}-500/20`
                      : 'border-slate-600 hover:border-slate-500 bg-slate-900/30'
                  }`}
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <p className={`text-sm mt-1 ${
                    expenseCategory === preset.category ? 'text-white' : 'text-slate-400'
                  }`}>{preset.title}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {/* Description and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="What was this for?"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">₹</span>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 outline-none text-lg font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Vendor (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Vendor <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={expenseVendor}
                onChange={(e) => setExpenseVendor(e.target.value)}
                placeholder="Who did you pay?"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleExpenseSubmit}
              disabled={loading || !expenseDescription || !expenseAmount}
              className="w-full px-6 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Expense
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Invoice Tab */}
      {activeTab === 'invoice' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Quick Invoice Generation</h2>
            <button
              onClick={selectAllInvoiceClients}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {selectedInvoiceClients.size === invoiceClients.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <p className="text-slate-400 text-sm mb-4">
            Select clients to generate invoices based on their monthly fee:
          </p>

          {/* Client List */}
          <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
            {invoiceClients.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No active clients found</p>
            ) : (
              invoiceClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => toggleInvoiceClient(client.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedInvoiceClients.has(client.id)
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedInvoiceClients.has(client.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-500'
                    }`}>
                      {selectedInvoiceClients.has(client.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-white">{client.name}</span>
                  </div>
                  <span className="text-slate-300 font-semibold">
                    ₹{(client.monthlyFee || 0).toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Summary */}
          {selectedInvoiceClients.size > 0 && (
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400">Selected Clients</p>
                  <p className="text-2xl font-bold text-white">{selectedInvoiceClients.size}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ₹{invoiceClients
                      .filter(c => selectedInvoiceClients.has(c.id))
                      .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleBulkInvoice}
            disabled={loading || selectedInvoiceClients.size === 0}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate {selectedInvoiceClients.size} Invoice{selectedInvoiceClients.size !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowRecent(!showRecent)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
        >
          <h3 className="font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h3>
          <svg className={`w-5 h-5 text-slate-400 transition-transform ${showRecent ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showRecent && (
          <div className="px-6 pb-6 grid md:grid-cols-2 gap-4">
            {/* Recent Payments */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Recent Payments
              </h4>
              {recentPayments.length === 0 ? (
                <p className="text-slate-400 text-sm">No recent payments</p>
              ) : (
                <div className="space-y-2">
                  {recentPayments.slice(0, 5).map(payment => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{payment.client?.name || 'Unknown'}</p>
                        <p className="text-slate-400 text-xs">
                          {payment.paymentMethod} • {formatDateDDMMYYYY(payment.collectedAt)}
                        </p>
                      </div>
                      <span className="text-emerald-400 font-semibold">
                        +₹{(payment.grossAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Expenses */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Recent Expenses
              </h4>
              {recentExpenses.length === 0 ? (
                <p className="text-slate-400 text-sm">No recent expenses</p>
              ) : (
                <div className="space-y-2">
                  {recentExpenses.slice(0, 5).map(expense => (
                    <div key={expense.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{expense.description}</p>
                        <p className="text-slate-400 text-xs capitalize">
                          {expense.category} • {formatDateDDMMYYYY(expense.date)}
                        </p>
                      </div>
                      <span className="text-amber-400 font-semibold">
                        -₹{(expense.amount || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
        <p className="text-slate-400 text-sm text-center">
          Tip: Use keyboard shortcuts - <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">P</kbd> Payment,
          <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs ml-1">E</kbd> Expense,
          <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs ml-1">I</kbd> Invoice
        </p>
      </div>
    </div>
  )
}
