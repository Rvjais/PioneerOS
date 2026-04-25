'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import InfoTip from '@/client/components/ui/InfoTip'

interface Expense {
  id: string
  title: string
  description?: string
  category: string
  amount: number
  date: string
  vendor?: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  submittedBy?: { id: string; name: string }
  approvedBy?: { id: string; name: string }
  receipt?: string
}

const categoryColors = {
  software: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advertising: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  office: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  freelancer: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  utilities: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  travel: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  other: 'bg-slate-900/20 text-slate-400 border-slate-500/30'
}

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-blue-500/20 text-blue-400',
  rejected: 'bg-red-500/20 text-red-400',
  paid: 'bg-emerald-500/20 text-emerald-400'
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [showNewForm, setShowNewForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    category: 'other',
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchExpenses()
  }, [selectedMonth])

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/expenses?month=${selectedMonth}`)
      if (res.ok) {
        const data = await res.json()
        setExpenses(data.expenses || data || [])
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const createExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        })
      })

      if (res.ok) {
        fetchExpenses()
        setShowNewForm(false)
        setNewExpense({
          title: '',
          description: '',
          category: 'other',
          amount: '',
          vendor: '',
          date: new Date().toISOString().split('T')[0]
        })
      }
    } catch (error) {
      console.error('Error creating expense:', error)
    }
  }

  const filteredExpenses = expenses
    .filter(exp => categoryFilter === 'all' || exp.category === categoryFilter)
    .filter(exp => statusFilter === 'all' || exp.status === statusFilter)

  const stats = {
    total: expenses.reduce((sum, e) => sum + e.amount, 0),
    pending: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
    approved: expenses.filter(e => e.status === 'approved' || e.status === 'paid').reduce((sum, e) => sum + e.amount, 0),
    byCategory: Object.entries(
      expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount
        return acc
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Expenses</h1>
            <InfoTooltip
              title="Expense Tracking"
              steps={[
                'Track all company expenses',
                'Categorize by type (software, office, etc.)',
                'Submit for approval workflow',
                'Monitor monthly spend'
              ]}
              tips={[
                'Upload receipts for documentation',
                'Review expenses weekly'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Track and manage company expenses</p>
        </div>

        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-white">Rs. {stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-300">Rs. {stats.pending.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Approved</p>
          <p className="text-2xl font-bold text-emerald-300">Rs. {stats.approved.toLocaleString()}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm">This Month</p>
          <p className="text-2xl font-bold text-blue-300">{expenses.length} entries</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.byCategory.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h3 className="text-sm text-slate-400 mb-3">Expenses by Category</h3>
          <div className="flex flex-wrap gap-4">
            {stats.byCategory.map(([category, amount]) => (
              <div key={category} className={`px-3 py-2 rounded-lg border ${categoryColors[category as keyof typeof categoryColors] || categoryColors.other}`}>
                <span className="capitalize">{category}</span>
                <span className="ml-2 font-bold">Rs. {amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        />

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Categories</option>
          <option value="software">Software Tools</option>
          <option value="advertising">Advertising</option>
          <option value="office">Office Expenses</option>
          <option value="freelancer">Freelancers</option>
          <option value="utilities">Utilities</option>
          <option value="travel">Travel</option>
          <option value="other">Other</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No expenses found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Title</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Category</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Vendor</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredExpenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-400">
                      {formatDateDDMMYYYY(expense.date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{expense.title}</p>
                      {expense.description && (
                        <p className="text-sm text-slate-400">{expense.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full border capitalize ${categoryColors[expense.category as keyof typeof categoryColors] || categoryColors.other}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {expense.vendor || '-'}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      Rs. {expense.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[expense.status]}`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Expense Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-4">Add New Expense</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={e => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                  placeholder="Expense title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Category <InfoTip text="Expense type - Software, Travel, Office Supplies, Client Entertainment, etc." /></label>
                  <select
                    value={newExpense.category}
                    onChange={e => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="software">Software Tools</option>
                    <option value="advertising">Advertising</option>
                    <option value="office">Office Expenses</option>
                    <option value="freelancer">Freelancers</option>
                    <option value="utilities">Utilities</option>
                    <option value="travel">Travel</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Amount <InfoTip text="Total amount in INR including taxes." type="action" /></label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Vendor (optional) <InfoTip text="What was purchased and business purpose. Include vendor name." type="action" /></label>
                  <input
                    type="text"
                    value={newExpense.vendor}
                    onChange={e => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date <InfoTip text="Date of purchase. Must be within last 30 days." /></label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={e => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description (optional) <InfoTip text="What was purchased and business purpose. Include vendor name." type="action" /></label>
                <textarea
                  value={newExpense.description}
                  onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none resize-none"
                  rows={2}
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewForm(false)}
                className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createExpense}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
