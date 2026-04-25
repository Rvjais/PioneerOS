'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InfoTip from '@/client/components/ui/InfoTip'

export default function NewSupportRequestPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: 'REQUEST',
    priority: 'MEDIUM',
    title: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/client-portal/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 401) {
          setError('Please log in to submit a request')
          return
        }
        throw new Error(data.error || 'Failed to submit request')
      }

      router.push('/portal/support')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/portal/support" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
          ← Back to Support
        </Link>
        <h1 className="text-2xl font-bold text-white">New Support Request</h1>
        <p className="text-slate-400 mt-1">Describe your request or issue</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Request Type<InfoTip text="REQUEST = need something new, ISSUE = something is broken, FEEDBACK = suggestion or comment." />
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'REQUEST', label: 'General Request' },
              { value: 'ISSUE', label: 'Report Issue' },
              { value: 'FEEDBACK', label: 'Feedback' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Priority<InfoTip text="LOW = no rush, MEDIUM = needs attention this week, HIGH = urgent/blocking your work." />
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="LOW">Low - General inquiry</option>
            <option value="MEDIUM">Medium - Needs attention</option>
            <option value="HIGH">High - Urgent issue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Subject <span className="text-red-500">*</span><InfoTip text="One-line summary of your request. Be specific so we can route it correctly." />
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 200) })}
            className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of your request"
            maxLength={200}
            required
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-1">{formData.title.length}/200 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Description <span className="text-red-500">*</span><InfoTip text="Full details - what happened, what you expected, steps to reproduce (for issues), or what you need." />
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 2000) })}
            className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            placeholder="Provide detailed information about your request..."
            maxLength={2000}
            required
          />
          <p className="text-xs text-slate-400 mt-1">{formData.description.length}/2000 characters</p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/portal/support"
            className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.description}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
