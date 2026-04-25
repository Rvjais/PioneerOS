'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

export default function NewWorkReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({
    periodStart: '',
    periodEnd: '',
    projectName: '',
    clientId: '',
    description: '',
    hoursWorked: '',
    deliverables: '',
    billableAmount: '',
  })

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const deliverables = form.deliverables
        ? form.deliverables.split('\n').filter((d) => d.trim())
        : []

      const res = await fetch('/api/freelancer/work-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          deliverables,
          clientId: form.clientId || null,
        }),
      })

      if (res.ok) {
        router.push('/freelancer/work-reports')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit work report')
      }
    } catch (error) {
      console.error('Error submitting work report:', error)
      toast.error('Failed to submit work report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-8">
      <div className="mb-6">
        <Link href="/freelancer/work-reports" className="text-blue-400 hover:text-blue-400 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Work Reports
        </Link>
      </div>

      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h1 className="text-xl font-bold text-white mb-6">Submit Work Report</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Period */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Period Start <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.periodStart}
                onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                required
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Period End <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.periodEnd}
                onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                required
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Project and Client */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                required
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Website Redesign"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Client
              </label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" className="bg-slate-800 text-white">Select client (optional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-slate-800 text-white">{client.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Work Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the work completed during this period..."
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Deliverables (one per line)
            </label>
            <textarea
              value={form.deliverables}
              onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Homepage design&#10;About page design&#10;Contact form implementation"
            />
          </div>

          {/* Hours and Amount */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Hours Worked <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.hoursWorked}
                onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                required
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Billable Amount (INR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="100"
                min="0"
                value={form.billableAmount}
                onChange={(e) => setForm({ ...form, billableAmount: e.target.value })}
                required
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 25000"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link
              href="/freelancer/work-reports"
              className="px-4 py-2 text-slate-300 hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
