'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { extractArrayData } from '@/server/apiResponse'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  pipeline: string | null
  rfpStatus: string | null
}

export default function SendRFPPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    }>
      <SendRFPPageContent />
    </Suspense>
  )
}

const ALLOWED_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES']

function SendRFPPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const preSelectedLeadId = searchParams.get('leadId')

  const userRole = (session?.user as { role?: string })?.role
  const canSendRfp = userRole ? ALLOWED_ROLES.includes(userRole) : false

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; rfpUrl?: string; error?: string } | null>(null)

  const [mode, setMode] = useState<'existing' | 'new'>(preSelectedLeadId ? 'existing' : 'new')
  const [formData, setFormData] = useState({
    leadId: preSelectedLeadId || '',
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    pipeline: 'BRANDING_PIONEERS',
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/sales/leads')
      if (res.ok) {
        const data = await res.json()
        const leadsArray = extractArrayData<Lead>(data)
        // Only show leads without RFP sent
        setLeads(leadsArray.filter(l => !l.rfpStatus || l.rfpStatus === 'PENDING'))
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      setFormData({
        ...formData,
        leadId,
        companyName: lead.companyName,
        contactName: lead.contactName,
        contactEmail: lead.contactEmail || '',
        contactPhone: lead.contactPhone || '',
        pipeline: lead.pipeline || 'BRANDING_PIONEERS',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'new' && (!formData.contactEmail || !formData.contactName)) {
      setResult({ success: false, error: 'Name and email are required' })
      return
    }
    if (mode === 'existing' && !formData.leadId) {
      setResult({ success: false, error: 'Please select a lead' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/sales/rfp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'existing' ? { leadId: formData.leadId } : formData),
      })

      if (res.ok) {
        const data = await res.json()
        setResult({ success: true, rfpUrl: data.rfpUrl })
      } else {
        const data = await res.json()
        setResult({ success: false, error: data.error || 'Failed to send RFP' })
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to send RFP' })
    } finally {
      setSending(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!canSendRfp) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-lg border border-white/10 p-6 text-center">
          <p className="text-slate-400">You don&apos;t have permission to send RFPs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Send RFP Form</h1>
          <p className="text-sm text-slate-400">Send the simplified RFP form to a potential client</p>
        </div>
        <Link
          href="/sales/rfp/pending"
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          View Pending RFPs
        </Link>
      </div>

      {result?.success ? (
        <div className="bg-green-500/10 rounded-lg border border-green-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800">RFP Link Generated!</h3>
              <p className="text-sm text-green-400">Share this link with your client</p>
            </div>
          </div>

          <div className="glass-card rounded-lg p-4 border border-green-200">
            <label className="block text-sm font-medium text-slate-200 mb-2">RFP Form URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={result.rfpUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-900/40 border border-white/10 rounded-lg text-sm"
              />
              <button
                onClick={() => copyToClipboard(result.rfpUrl!)}
                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setResult(null)
                setFormData({
                  leadId: '',
                  companyName: '',
                  contactName: '',
                  contactEmail: '',
                  contactPhone: '',
                  pipeline: 'BRANDING_PIONEERS',
                })
              }}
              className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40"
            >
              Send Another
            </button>
            <Link
              href="/sales/rfp/pending"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              View Pending RFPs
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-lg border border-white/10 p-6 space-y-6">
          {result?.error && (
            <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm">
              {result.error}
            </div>
          )}

          {/* Mode Selection */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                mode === 'existing'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/10 hover:border-orange-300'
              }`}
            >
              <p className="font-medium text-white">Existing Lead</p>
              <p className="text-sm text-slate-400">Select from your leads</p>
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                mode === 'new'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-white/10 hover:border-orange-300'
              }`}
            >
              <p className="font-medium text-white">New Contact</p>
              <p className="text-sm text-slate-400">Enter details manually</p>
            </button>
          </div>

          {mode === 'existing' ? (
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
                    {lead.companyName} - {lead.contactName} ({lead.contactEmail || 'No email'})
                  </option>
                ))}
              </select>
              {leads.length === 0 && (
                <p className="text-sm text-slate-400 mt-2">
                  No leads available. All leads either have RFPs sent or no email address.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Company Name"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Pipeline
                </label>
                <select
                  value={formData.pipeline}
                  onChange={(e) => setFormData({ ...formData, pipeline: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="BRANDING_PIONEERS">Branding Pioneers (Marketing)</option>
                  <option value="BRAINMINDS">BrainMinds (Website/AI)</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Link
              href="/sales/pipeline"
              className="px-4 py-2 text-slate-300 hover:text-white"
            >
              Cancel
            </Link>
            {canSendRfp && (
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Generating...' : 'Generate RFP Link'}
              </button>
            )}
          </div>
        </form>
      )}

      {/* Info */}
      <div className="bg-slate-900/40 rounded-lg p-4 border border-white/10">
        <h3 className="font-medium text-slate-200 mb-2">How it works</h3>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
          <li>Generate a unique RFP link for your client</li>
          <li>Share the link via WhatsApp, Email, or any channel</li>
          <li>Client fills out the simplified questionnaire</li>
          <li>You get notified when they complete it</li>
          <li>Lead is automatically updated with their responses</li>
        </ol>
      </div>
    </div>
  )
}
