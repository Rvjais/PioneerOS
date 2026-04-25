'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  status: string
  receipt: string | null
  clientId: string | null
}

const CATEGORIES = ['TOOLS', 'SOFTWARE', 'ADS', 'SALARY', 'OFFICE', 'TRAVEL', 'MARKETING', 'OTHER']

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-200',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-200',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-200',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ category: '', status: '', search: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Expense>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    category: 'OTHER',
    description: '',
    amount: 0,
    status: 'PENDING',
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses')
      if (res.ok) {
        const data = await res.json()
        setExpenses(Array.isArray(data) ? data : data.expenses || [])
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      })

      if (res.ok) {
        const created = await res.json()
        setExpenses([created, ...expenses])
        setNewExpense({
          date: new Date().toISOString().split('T')[0],
          category: 'OTHER',
          description: '',
          amount: 0,
          status: 'PENDING',
        })
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Failed to add expense:', error)
    }
  }

  const handleUpdateExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (res.ok) {
        setExpenses(expenses.map(e => e.id === id ? { ...e, ...editData } : e))
        setEditingId(null)
        setEditData({})
      }
    } catch (error) {
      console.error('Failed to update expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setExpenses(expenses.filter(e => e.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditData(expense)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const filteredExpenses = expenses.filter(e => {
    if (filter.category && e.category !== filter.category) return false
    if (filter.status && e.status !== filter.status) return false
    if (filter.search && !e.description.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingAmount = filteredExpenses.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + e.amount, 0)

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Expenses</h1>
          <p className="text-sm text-slate-400">
            {filteredExpenses.length} records • Total: {formatCurrency(totalAmount)}
            {pendingAmount > 0 && <span className="text-amber-400 ml-2">• Pending: {formatCurrency(pendingAmount)}</span>}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-slate-900/40 p-3 rounded-lg border border-white/10">
        <input
          type="text"
          placeholder="Search descriptions..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-3 py-1.5 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="px-3 py-1.5 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ colorScheme: 'dark' }}
        >
          <option value="" className="bg-slate-800 text-white">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
          ))}
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-1.5 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ colorScheme: 'dark' }}
        >
          <option value="" className="bg-slate-800 text-white">All Status</option>
          <option value="PENDING" className="bg-slate-800 text-white">Pending</option>
          <option value="APPROVED" className="bg-slate-800 text-white">Approved</option>
          <option value="REJECTED" className="bg-slate-800 text-white">Rejected</option>
        </select>
        {(filter.search || filter.category || filter.status) && (
          <button
            onClick={() => setFilter({ category: '', status: '', search: '' })}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40 border-b border-white/10">
                <th className="text-left px-4 py-3 font-medium text-slate-300 w-28">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300 w-32">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Description</th>
                <th className="text-right px-4 py-3 font-medium text-slate-300 w-28">Amount</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300 w-28">Status</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {/* Add Row */}
              {isAdding && (
                <tr className="bg-blue-500/10">
                  <td className="px-4 py-2">
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ colorScheme: 'dark' }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Description..."
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      placeholder="0"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className="px-2 py-1 text-xs font-medium rounded border bg-amber-500/20 text-amber-400 border-amber-200">
                      PENDING
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={handleAddExpense}
                        className="p-1.5 text-green-400 hover:bg-green-500/20 rounded"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsAdding(false)}
                        className="p-1.5 text-slate-400 hover:bg-slate-800/50 rounded"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {filteredExpenses.length === 0 && !isAdding ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No expenses found. Click "Add Row" to create one.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-900/40 group">
                    {editingId === expense.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={editData.date?.split('T')[0] || ''}
                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={editData.category}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ colorScheme: 'dark' }}
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editData.amount}
                            onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <select
                            value={editData.status}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                            className="px-2 py-1.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="PENDING" className="bg-slate-800 text-white">PENDING</option>
                            <option value="APPROVED" className="bg-slate-800 text-white">APPROVED</option>
                            <option value="REJECTED" className="bg-slate-800 text-white">REJECTED</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleUpdateExpense(expense.id)}
                              className="p-1.5 text-green-400 hover:bg-green-500/20 rounded"
                              title="Save"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-slate-400 hover:bg-slate-800/50 rounded"
                              title="Cancel"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-slate-300">
                          {formatDateDDMMYYYY(expense.date)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800/50 text-slate-200">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white">{expense.description}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${statusColors[expense.status]}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(expense)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="flex items-center justify-between text-sm text-slate-400 px-1">
        <span>Showing {filteredExpenses.length} of {expenses.length} expenses</span>
        <div className="flex gap-4">
          <span>Total: <strong className="text-white">{formatCurrency(totalAmount)}</strong></span>
          {pendingAmount > 0 && (
            <span>Pending: <strong className="text-amber-400">{formatCurrency(pendingAmount)}</strong></span>
          )}
        </div>
      </div>
    </div>
  )
}
