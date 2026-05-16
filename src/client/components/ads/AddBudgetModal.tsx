'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { Input } from '@/client/components/ui/Input'

interface Client {
  id: string
  name: string
}

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedMonth: string
}

export function AddBudgetModal({ isOpen, onClose, onSuccess, selectedMonth }: AddBudgetModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingClients, setFetchingClients] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clientId: '',
    month: selectedMonth ? `${selectedMonth}-01T00:00:00Z` : '',
    platform: 'ALL',
    allocatedAmount: '',
    currency: 'INR',
    dailyTarget: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, month: `${selectedMonth}-01T00:00:00Z` }))
      fetchClients()
    }
  }, [isOpen, selectedMonth])

  const fetchClients = async () => {
    try {
      setFetchingClients(true)
      const res = await fetch('/api/clients?limit=100')
      if (!res.ok) throw new Error('Failed to fetch clients')
      const data = await res.json()
      setClients(data.clients || [])
      if (data.clients?.length > 0 && !formData.clientId) {
        setFormData(prev => ({ ...prev, clientId: data.clients[0].id }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetchingClients(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = {
        ...formData,
        allocatedAmount: Number(formData.allocatedAmount),
        dailyTarget: formData.dailyTarget ? Number(formData.dailyTarget) : undefined,
      }

      const res = await fetch('/api/ads/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add budget')
      }

      onSuccess()
      onClose()
      setFormData({
        clientId: clients[0]?.id || '',
        month: `${selectedMonth}-01T00:00:00Z`,
        platform: 'ALL',
        allocatedAmount: '',
        currency: 'INR',
        dailyTarget: '',
        notes: '',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Budget Allocation">
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Client</label>
            <select
              required
              disabled={fetchingClients}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
            >
              <option value="" disabled>Select a client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Month</label>
              <input
                type="month"
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ colorScheme: 'dark' }}
                value={formData.month.substring(0, 7)}
                onChange={e => setFormData({ ...formData, month: `${e.target.value}-01T00:00:00Z` })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Platform</label>
              <select
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.platform}
                onChange={e => setFormData({ ...formData, platform: e.target.value })}
              >
                <option value="ALL">All Platforms</option>
                <option value="META">Meta (FB/IG)</option>
                <option value="GOOGLE">Google Ads</option>
                <option value="LINKEDIN">LinkedIn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Allocated Amount</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.allocatedAmount}
                onChange={e => setFormData({ ...formData, allocatedAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Currency</label>
              <select
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Daily Target (Optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={formData.dailyTarget}
              onChange={e => setFormData({ ...formData, dailyTarget: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any specific instructions..."
              rows={3}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-red-500 hover:to-orange-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Budget'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
