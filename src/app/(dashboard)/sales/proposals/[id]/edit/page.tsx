'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Proposal {
  id: string
  title: string
  value: number
  services: string | null
  validUntil: string
  status: string
  documentUrl: string | null
  lead: {
    id: string
    companyName: string
    contactName: string
  }
}

const SERVICES = [
  'SEO',
  'Google Ads',
  'Meta Ads',
  'Social Media Marketing',
  'Content Marketing',
  'Website Development',
  'Branding',
  'Video Production',
  'Marketing Automation',
  'Reputation Management',
]

export default function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    services: [] as string[],
    validUntil: '',
    documentUrl: '',
    status: '',
  })
  const [proposal, setProposal] = useState<Proposal | null>(null)

  useEffect(() => {
    fetchProposal()
  }, [id])

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/sales/proposals/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProposal(data)
        setFormData({
          title: data.title,
          value: data.value.toString(),
          services: data.services ? JSON.parse(data.services) : [],
          validUntil: data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '',
          documentUrl: data.documentUrl || '',
          status: data.status,
        })
      } else {
        setError('Proposal not found')
      }
    } catch (err) {
      setError('Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceToggle = (service: string) => {
    if (formData.services.includes(service)) {
      setFormData({ ...formData, services: formData.services.filter(s => s !== service) })
    } else {
      setFormData({ ...formData, services: [...formData.services, service] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.value) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/sales/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          services: JSON.stringify(formData.services),
        }),
      })

      if (res.ok) {
        router.push('/sales/proposals')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update proposal')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (error && !proposal) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Link href="/sales/proposals" className="text-orange-600 hover:underline mt-2 inline-block">
          Back to Proposals
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/sales/proposals" className="text-sm text-slate-400 hover:text-slate-200 mb-1 inline-block">
            &larr; Back to Proposals
          </Link>
          <h1 className="text-xl font-semibold text-white">Edit Proposal</h1>
          <p className="text-sm text-slate-400">For {proposal?.lead.companyName}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Proposal Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Value (INR) *</label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Services</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => handleServiceToggle(service)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  formData.services.includes(service)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'glass-card text-slate-200 border-white/10 hover:border-orange-300'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Valid Until</label>
          <input
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Document URL</label>
          <input
            type="url"
            value={formData.documentUrl}
            onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
            placeholder="https://docs.google.com/..."
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="VIEWED">Viewed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Link
            href="/sales/proposals"
            className="flex-1 px-4 py-2 text-center text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !formData.title || !formData.value}
            className="flex-1 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
