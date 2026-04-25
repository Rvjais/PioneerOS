'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Deliverable {
  id: string
  userId: string
  category: string
  deliverableType: string
  quantity: number
  unitValue: number
  totalValue: number
  status: string
  notes: string | null
  month: string
  createdAt: string
  user: {
    firstName: string
    lastName: string | null
    department: string
  }
  client: { id: string; name: string } | null
}

interface Client {
  id: string
  name: string
}

interface Props {
  deliverables: Deliverable[]
  stats: {
    totalDeliverables: number
    totalQuantity: number
    totalValue: number
  }
  clients: Client[]
  userId: string
  isManager: boolean
}

const DELIVERABLE_TYPES: Record<string, Record<string, number>> = {
  SOCIAL_MEDIA: {
    STANDARD_POST: 100,
    CAROUSEL: 200,
    REEL: 200,
    STORY: 50,
  },
  DESIGN: {
    STANDARD_GRAPHIC: 100,
    CAROUSEL_GRAPHIC: 200,
    MOTION_REEL: 200,
  },
  VIDEO: {
    SHORT_VIDEO: 300,
    SUPER_VIDEO: 1000,
  },
  SEO: {
    SMALL_CLIENT: 1000,
    MID_CLIENT: 2000,
    LARGE_CLIENT: 5000,
    GMB_LOCATION: 500,
  },
  WEB: {
    STANDARD_PAGE: 400,
    LANDING_PAGE: 600,
    SUPER_LANDING_PAGE: 2000,
  },
  ADS: {
    STANDARD_CLIENT: 3000,
    PREMIUM_CLIENT: 5000,
  },
  ACCOUNT_MANAGEMENT: {
    STANDARD_CLIENT: 3000,
    PREMIUM_CLIENT: 5000,
    ENTERPRISE_CLIENT: 8000,
  },
}

export function DeliverablesClient({ deliverables, stats, clients, userId, isManager }: Props) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category: 'DESIGN',
    deliverableType: 'STANDARD_GRAPHIC',
    quantity: 1,
    clientId: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/accountability/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userId,
        }),
      })

      if (res.ok) {
        setShowAddForm(false)
        setForm({
          category: 'DESIGN',
          deliverableType: 'STANDARD_GRAPHIC',
          quantity: 1,
          clientId: '',
          notes: '',
        })
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add deliverable')
      }
    } catch (error) {
      console.error('Failed to add deliverable:', error)
      toast.error('Failed to log deliverable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    const types = Object.keys(DELIVERABLE_TYPES[category] || {})
    setForm({
      ...form,
      category,
      deliverableType: types[0] || '',
    })
  }

  const selectedUnitValue = DELIVERABLE_TYPES[form.category]?.[form.deliverableType] || 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <p className="text-4xl font-bold text-white">{stats.totalQuantity}</p>
          <p className="text-slate-400">Total Units Delivered</p>
        </div>
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <p className="text-4xl font-bold text-white">{stats.totalDeliverables}</p>
          <p className="text-slate-400">Deliverable Records</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <p className="text-4xl font-bold">₹{stats.totalValue.toLocaleString('en-IN')}</p>
          <p className="text-green-100">Potential Incentives</p>
        </div>
      </div>

      {/* Add Deliverable Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Deliverable
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Log New Deliverable</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ colorScheme: 'dark' }}
              >
                {Object.keys(DELIVERABLE_TYPES).map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800 text-white">
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Type</label>
              <select
                value={form.deliverableType}
                onChange={(e) => setForm({ ...form, deliverableType: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ colorScheme: 'dark' }}
              >
                {Object.entries(DELIVERABLE_TYPES[form.category] || {}).map(([type, value]) => (
                  <option key={type} value={type} className="bg-slate-800 text-white">
                    {type.replace(/_/g, ' ')} (₹{value})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Client (optional)</label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" className="bg-slate-800 text-white">Select client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-slate-800 text-white">
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes about this work..."
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : `Add (₹${selectedUnitValue * form.quantity})`}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deliverables Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">This Month&apos;s Deliverables</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Category</th>
                {isManager && (
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Employee</th>
                )}
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {deliverables.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{d.deliverableType.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-slate-800/50 text-slate-300 rounded">
                      {d.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  {isManager && (
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {d.user.firstName} {d.user.lastName || ''}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {d.client?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-white">
                    {d.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-green-400">
                    ₹{d.totalValue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(d.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {deliverables.length === 0 && (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="px-4 py-12 text-center text-slate-400">
                    No deliverables logged yet this month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
