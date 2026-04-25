'use client'

import { useState, useEffect } from 'react'
import {
  EXPENSE_CATEGORIES,
  EXPENSE_FREQUENCIES,
  EXPENSE_STATUS,
  PAYMENT_METHODS,
  getLabelForValue,
  getColorForValue
} from '@/shared/constants/formConstants'

interface RecurringExpense {
  id: string
  name: string
  description: string | null
  category: string
  vendor: string | null
  frequency: string
  amount: number
  currency: string
  startDate: string
  endDate: string | null
  nextDueDate: string
  lastPaidDate: string | null
  isClientBillable: boolean
  autoPayEnabled: boolean
  reminderDays: number
  status: string
  creator: {
    id: string
    firstName: string
    lastName: string | null
  }
  allocations: Array<{
    id: string
    percentage: number
    fixedAmount: number | null
    client: {
      id: string
      name: string
    } | null
  }>
  payments: Array<{
    id: string
    amount: number
    paidDate: string
    status: string
  }>
}

interface Summary {
  totalExpenses: number
  activeExpenses: number
  monthlyTotal: number
  upcomingDue: number
}

interface Client {
  id: string
  name: string
}

export default function RecurringExpensesPage() {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<RecurringExpense | null>(null)
  const [filter, setFilter] = useState({ status: '', category: '' })
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'SUBSCRIPTION',
    vendor: '',
    frequency: 'MONTHLY',
    amount: '',
    currency: 'INR',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isClientBillable: false,
    autoPayEnabled: false,
    reminderDays: 3,
    allocations: [] as Array<{ clientId: string; percentage: number }>,
  })

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paidDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    transactionRef: '',
    notes: '',
  })

  useEffect(() => {
    fetchExpenses()
    fetchClients()
  }, [filter])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.category) params.append('category', filter.category)

      const res = await fetch(`/api/expenses/recurring?${params}`)
      if (res.ok) {
        const data = await res.json()
        setExpenses(data.expenses)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/expenses/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          reminderDays: parseInt(String(form.reminderDays)),
          endDate: form.endDate || null,
        }),
      })

      if (res.ok) {
        setShowAddModal(false)
        resetForm()
        fetchExpenses()
      }
    } catch (error) {
      console.error('Failed to create expense:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExpense) return

    setSaving(true)
    try {
      const res = await fetch(`/api/expenses/recurring/${selectedExpense.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          amount: paymentForm.amount ? parseFloat(paymentForm.amount) : selectedExpense.amount,
        }),
      })

      if (res.ok) {
        setShowPayModal(false)
        setSelectedExpense(null)
        resetPaymentForm()
        fetchExpenses()
      }
    } catch (error) {
      console.error('Failed to record payment:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (expense: RecurringExpense, newStatus: string) => {
    try {
      const res = await fetch(`/api/expenses/recurring/${expense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      category: 'SUBSCRIPTION',
      vendor: '',
      frequency: 'MONTHLY',
      amount: '',
      currency: 'INR',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isClientBillable: false,
      autoPayEnabled: false,
      reminderDays: 3,
      allocations: [],
    })
  }

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      transactionRef: '',
      notes: '',
    })
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const getDaysUntilDue = (nextDueDate: string) => {
    const days = Math.ceil((new Date(nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const getDueBadgeColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'bg-red-500/20 text-red-800'
    if (daysUntilDue <= 3) return 'bg-orange-500/20 text-orange-400'
    if (daysUntilDue <= 7) return 'bg-amber-500/20 text-amber-800'
    return 'bg-slate-800/50 text-slate-300'
  }

  if (loading && !expenses.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Recurring Expenses</h1>
          <p className="text-slate-300 mt-1">Track and manage recurring business expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Total Expenses</p>
            <p className="text-2xl font-bold text-white">{summary.totalExpenses}</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{summary.activeExpenses}</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Monthly Total</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(summary.monthlyTotal)}</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Due This Week</p>
            <p className="text-2xl font-bold text-amber-400">{summary.upcomingDue}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-white/20 rounded-lg text-white"
        >
          <option value="">All Status</option>
          {EXPENSE_STATUS.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <select
          value={filter.category}
          onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
          className="px-3 py-2 border border-white/20 rounded-lg text-white"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-900/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Expense</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Frequency</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Next Due</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {expenses.map(expense => {
              const daysUntilDue = getDaysUntilDue(expense.nextDueDate)
              return (
                <tr key={expense.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-white">{expense.name}</p>
                      {expense.vendor && (
                        <p className="text-sm text-slate-400">{expense.vendor}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getColorForValue(EXPENSE_CATEGORIES, expense.category)}`}>
                      {getLabelForValue(EXPENSE_CATEGORIES, expense.category)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{formatCurrency(expense.amount, expense.currency)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-slate-300">
                      {getLabelForValue(EXPENSE_FREQUENCIES, expense.frequency)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getDueBadgeColor(daysUntilDue)}`}>
                      {daysUntilDue < 0
                        ? `${Math.abs(daysUntilDue)} days overdue`
                        : daysUntilDue === 0
                          ? 'Due today'
                          : `${daysUntilDue} days`
                      }
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(expense.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={expense.status}
                      onChange={(e) => handleStatusChange(expense, e.target.value)}
                      className="text-sm border border-white/20 rounded px-2 py-1 text-white"
                    >
                      {EXPENSE_STATUS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        setSelectedExpense(expense)
                        setPaymentForm(prev => ({ ...prev, amount: String(expense.amount) }))
                        setShowPayModal(true)
                      }}
                      className="text-blue-400 hover:text-blue-800 text-sm font-medium"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              )
            })}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No recurring expenses found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-none w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Add Recurring Expense</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Expense Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                    placeholder="e.g., AWS Hosting"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => setForm(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  rows={2}
                  placeholder="Brief description of the expense"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Frequency *</label>
                  <select
                    required
                    value={form.frequency}
                    onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  >
                    {EXPENSE_FREQUENCIES.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Amount *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Reminder (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.reminderDays}
                    onChange={(e) => setForm(prev => ({ ...prev, reminderDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">End Date (optional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isClientBillable}
                    onChange={(e) => setForm(prev => ({ ...prev, isClientBillable: e.target.checked }))}
                    className="w-4 h-4 text-blue-400 border-white/20 rounded"
                  />
                  <span className="text-sm text-slate-200">Client Billable</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.autoPayEnabled}
                    onChange={(e) => setForm(prev => ({ ...prev, autoPayEnabled: e.target.checked }))}
                    className="w-4 h-4 text-blue-400 border-white/20 rounded"
                  />
                  <span className="text-sm text-slate-200">Auto-Pay Enabled</span>
                </label>
              </div>

              {form.isClientBillable && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Allocate to Client</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setForm(prev => ({
                          ...prev,
                          allocations: [...prev.allocations, { clientId: e.target.value, percentage: 100 }]
                        }))
                      }
                    }}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">Select client...</option>
                    {clients
                      .filter(c => !form.allocations.some(a => a.clientId === c.id))
                      .map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))
                    }
                  </select>
                  {form.allocations.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {form.allocations.map((alloc, idx) => {
                        const client = clients.find(c => c.id === alloc.clientId)
                        return (
                          <div key={alloc.clientId} className="flex items-center gap-2 p-2 bg-slate-900/40 rounded">
                            <span className="text-sm text-slate-200 flex-1">{client?.name}</span>
                            <input
                              type="number"
                              value={alloc.percentage}
                              onChange={(e) => {
                                const newAllocations = [...form.allocations]
                                newAllocations[idx].percentage = parseInt(e.target.value) || 0
                                setForm(prev => ({ ...prev, allocations: newAllocations }))
                              }}
                              className="w-20 px-2 py-1 border border-white/20 rounded text-sm text-white"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-slate-400">%</span>
                            <button
                              type="button"
                              onClick={() => {
                                setForm(prev => ({
                                  ...prev,
                                  allocations: prev.allocations.filter((_, i) => i !== idx)
                                }))
                              }}
                              className="text-red-500 hover:text-red-400"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 hover:bg-slate-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-none w-full max-w-md m-4">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Record Payment</h2>
              <p className="text-sm text-slate-300 mt-1">{selectedExpense.name}</p>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  placeholder={String(selectedExpense.amount)}
                />
                <p className="text-xs text-slate-400 mt-1">Leave blank to use default: {formatCurrency(selectedExpense.amount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paidDate}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paidDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select method...</option>
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionRef: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  placeholder="Transaction ID or reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayModal(false)
                    setSelectedExpense(null)
                    resetPaymentForm()
                  }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 hover:bg-slate-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
