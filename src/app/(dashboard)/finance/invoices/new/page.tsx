'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  contactEmail: string
  monthlyFee: number | null
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    tax: '',
    dueDate: '',
    notes: '',
    items: [{ description: '', quantity: 1, rate: '' }],
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : data.clients || [])
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      return { ...prev, items: newItems }
    })
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: '' }],
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }))
    }
  }

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * (parseFloat(item.rate) || 0))
    }, 0)
    const tax = parseFloat(formData.tax) || 0
    return itemsTotal + tax
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const itemsTotal = formData.items.reduce((sum, item) => {
        return sum + (item.quantity * (parseFloat(item.rate) || 0))
      }, 0)

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          amount: itemsTotal,
          tax: parseFloat(formData.tax) || 0,
          dueDate: formData.dueDate,
          items: formData.items,
          notes: formData.notes,
        }),
      })

      if (res.ok) {
        router.push('/finance/invoices')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create proforma invoice')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/finance/invoices" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
            ← Back to Proforma Invoices
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Proforma Invoice (PI)</h1>
          <p className="text-slate-400">Generate a new proforma invoice for a client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Client Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Client *</label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" className="bg-slate-800 text-white">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id} className="bg-slate-800 text-white">
                    {client.name} - {client.contactEmail}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Line Items</h2>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={`line-item-${index}`} className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    placeholder="Qty"
                    className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    placeholder="Rate (₹)"
                    className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-32 text-right font-medium text-slate-200">
                  ₹{(item.quantity * (parseFloat(item.rate) || 0)).toLocaleString('en-IN')}
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-blue-400 hover:text-blue-400 text-sm font-medium"
            >
              + Add Line Item
            </button>
          </div>
        </div>

        {/* Tax & Notes */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tax (GST)</label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes..."
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-slate-400">Total Amount</p>
              <p className="text-3xl font-bold text-white">
                ₹{calculateTotal().toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-200 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link
            href="/finance/invoices"
            className="px-6 py-3 border border-white/20 text-slate-200 rounded-xl hover:bg-slate-900/40 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create PI'}
          </button>
        </div>
      </form>
    </div>
  )
}
