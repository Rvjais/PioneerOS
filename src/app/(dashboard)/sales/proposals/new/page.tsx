'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  pipeline: string | null
  value: number | null
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

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    }>
      <NewProposalPageContent />
    </Suspense>
  )
}

function NewProposalPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedLeadId = searchParams.get('leadId')

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    leadId: preSelectedLeadId || '',
    title: '',
    value: '',
    services: [] as string[],
    validUntil: '',
    documentUrl: '',
  })

  useEffect(() => {
    fetchLeads()
    // Set default valid until date (30 days from now)
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    setFormData(prev => ({
      ...prev,
      validUntil: defaultDate.toISOString().split('T')[0],
    }))
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/sales/leads')
      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data) ? data : data.data || []
        setLeads(items.filter((l: Lead & { stage: string }) => !['WON', 'LOST'].includes(l.stage)))
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
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

  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    setFormData({
      ...formData,
      leadId,
      title: lead ? `${lead.companyName} - Marketing Proposal` : formData.title,
      value: lead?.value?.toString() || formData.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.leadId || !formData.title || !formData.value) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/sales/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/sales/proposals')
      }
    } catch (error) {
      console.error('Failed to create proposal:', error)
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Create New Proposal</h1>
          <p className="text-sm text-slate-400">Create a proposal for a lead</p>
        </div>
        <Link
          href="/sales/proposals"
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-lg border border-white/10 p-6 space-y-6">
        {/* Lead Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Select Lead *
          </label>
          <select
            value={formData.leadId}
            onChange={(e) => handleLeadSelect(e.target.value)}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="">Choose a lead...</option>
            {leads.map(lead => (
              <option key={lead.id} value={lead.id}>
                {lead.companyName} - {lead.contactName}
              </option>
            ))}
          </select>
        </div>

        {/* Proposal Title */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Proposal Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="E.g., Digital Marketing Proposal - Q1 2024"
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Value */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Proposal Value (INR) *
          </label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="100000"
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Services Included
          </label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(service => (
              <button
                key={service}
                type="button"
                onClick={() => handleServiceToggle(service)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  formData.services.includes(service)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'glass-card text-slate-300 border-white/10 hover:border-orange-300'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* Valid Until */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Valid Until
          </label>
          <input
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Document URL */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Proposal Document URL
          </label>
          <input
            type="url"
            value={formData.documentUrl}
            onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
            placeholder="https://drive.google.com/..."
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Link to the proposal PDF (Google Drive, Dropbox, etc.)
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Link
            href="/sales/proposals"
            className="px-4 py-2 text-slate-300 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !formData.leadId || !formData.title || !formData.value}
            className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </form>
    </div>
  )
}
