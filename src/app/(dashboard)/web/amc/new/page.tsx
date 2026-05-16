'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewAMCContractPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    client: '',
    type: 'AMC',
    startDate: '',
    endDate: '',
    amount: '',
    allocatedHours: '10'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/web/amc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create contract')
      }

      toast.success('AMC Contract created successfully')
      router.push('/web/amc')
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Create AMC Contract</h1>
        <p className="text-slate-400 mt-1">Set up a new maintenance or hosting agreement.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-white/10 p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Client Name *</label>
            <input 
              required 
              type="text" 
              value={formData.client}
              onChange={e => setFormData({...formData, client: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white" 
              placeholder="e.g. Apollo Hospitals" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Contract Type</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white"
            >
              <option value="AMC">Annual Maintenance Contract</option>
              <option value="MONTHLY_MAINTENANCE">Monthly Maintenance</option>
              <option value="ANNUAL_HOSTING">Annual Hosting</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Start Date *</label>
              <input 
                required 
                type="date" 
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">End Date *</label>
              <input 
                required 
                type="date" 
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Total Amount (₹) *</label>
              <input 
                required 
                type="number" 
                min="0"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white" 
                placeholder="0" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Allocated Hours (Monthly)</label>
              <input 
                type="number" 
                min="0"
                value={formData.allocatedHours}
                onChange={e => setFormData({...formData, allocatedHours: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button 
            type="button" 
            onClick={() => router.push('/web/amc')}
            className="px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Contract'}
          </button>
        </div>
      </form>
    </div>
  )
}
