'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WEB_PROJECT_PHASES } from '@/shared/constants/formConstants'

export default function NewWebClientPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    websiteUrl: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Client name is required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/web-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create client')
        return
      }

      router.push(`/web/clients/${data.clientId}`)
    } catch {
      setError('Failed to create client')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/web/clients"
          className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Web Client</h1>
          <p className="text-slate-400">Create a new website project client</p>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card rounded-2xl border border-white/10 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter client or business name"
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Contact Name */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="Primary contact name"
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Contact Phone & Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Website URL (if existing)
            </label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Project Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about the project..."
              rows={4}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* What happens next */}
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
            <h3 className="font-medium text-teal-800 mb-2">What happens next?</h3>
            <p className="text-sm text-teal-700 mb-3">
              When you create this client, the following phases will be automatically created:
            </p>
            <div className="flex flex-wrap gap-2">
              {WEB_PROJECT_PHASES.map((phase) => (
                <span
                  key={phase.value}
                  className={`px-2 py-1 text-xs font-medium rounded ${phase.color}`}
                >
                  {phase.order}. {phase.label}
                </span>
              ))}
            </div>
            <p className="text-sm text-teal-600 mt-3">
              You&apos;ll be assigned as the primary team member automatically.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Link
              href="/web/clients"
              className="flex-1 py-2.5 text-center font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
