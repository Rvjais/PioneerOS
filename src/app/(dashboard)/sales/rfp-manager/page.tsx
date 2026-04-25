'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  FileText, Loader2, CheckCircle, Copy, Check, Building2, Mail,
  Phone, User, Globe, StickyNote, Clock, RefreshCw, Eye,
  ChevronDown, ChevronUp, Send, Plus,
} from 'lucide-react'

// ─── Constants ─────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Healthcare', 'Dental', 'Aesthetics', 'IVF', 'Mental Health',
  'Veterinary', 'E-commerce', 'Real Estate', 'Education', 'Hospitality',
  'Fitness', 'Legal', 'Finance', 'Technology', 'Other',
] as const

const EXPIRY_OPTIONS = [7, 14, 30, 60] as const

const STATUS_COLORS: Record<string, string> = {
  SENT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  VIEWED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SUBMITTED: 'bg-green-500/20 text-green-400 border-green-500/30',
  IN_REVIEW: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  SENT: 'Sent',
  VIEWED: 'Viewed',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  companyName: string
  contactName: string
  email: string
  phone: string
  industry: string
  currentWebsite: string
  internalNotes: string
  expiresInDays: number
}

interface RfpSubmission {
  id: string
  token: string
  companyName: string
  contactName: string
  email: string
  phone: string
  industry: string
  currentWebsite: string
  status: string
  completed: boolean
  createdAt: string
  expiresAt: string
}

const initialFormData: FormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  industry: '',
  currentWebsite: '',
  internalNotes: '',
  expiresInDays: 14,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}-${month}-${d.getFullYear()}`
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

// ─── Component ─────────────────────────────────────────────────────────────────

const RFP_CREATE_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'SALES', 'ACCOUNTS']

export default function RfpManagerPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role || ''
  const canCreateRfp = RFP_CREATE_ROLES.includes(userRole)

  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdLink, setCreatedLink] = useState<{ url: string; token: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // Table state
  const [submissions, setSubmissions] = useState<RfpSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Section toggle
  const [showForm, setShowForm] = useState(true)

  // ── Fetch submissions ──────────────────────────────────────────────────────

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/rfp/create')
      if (res.ok) {
        const data = await res.json()
        const items = data.submissions || data.rfps || []
        setSubmissions(items.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          token: s.token as string,
          companyName: s.companyName as string,
          contactName: s.contactName as string,
          email: (s.email || s.contactEmail || '') as string,
          phone: (s.phone || s.contactPhone || '') as string,
          industry: (s.industry || '') as string,
          currentWebsite: (s.currentWebsite || s.websiteUrl || '') as string,
          status: (s.status === 'NEW' ? 'SENT' : s.status) as string,
          completed: !!s.completed,
          createdAt: (s.createdAt || '') as string,
          expiresAt: (s.expiresAt || '') as string,
        })))
      }
    } catch {
      // Silently fail for list - non-critical
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  // ── Form handlers ──────────────────────────────────────────────────────────

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields')
      return
    }

    if (!formData.industry) {
      setError('Please select an industry')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        industry: formData.industry,
        currentWebsite: formData.currentWebsite.trim() || undefined,
        internalNotes: formData.internalNotes.trim() || undefined,
        expiresInDays: formData.expiresInDays,
      }

      const res = await fetch('/api/rfp/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.details) {
          const detailMessages = Object.entries(result.details)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
            .join('. ')
          throw new Error(`${result.error}: ${detailMessages}`)
        }
        throw new Error(result.error || 'Failed to create RFP link')
      }

      setCreatedLink({
        url: result.rfp?.url || result.url || '',
        token: result.rfp?.token || result.token || '',
      })
      setIsSuccess(true)
      fetchSubmissions()
    } catch (err) {
      console.error('Error creating RFP link:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copySubmissionLink = (token: string) => {
    const baseUrl = window.location.origin
    const url = `${baseUrl}/rfp/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(token)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const resetForm = () => {
    setIsSuccess(false)
    setCreatedLink(null)
    setCopied(false)
    setFormData(initialFormData)
    setError('')
  }

  // ── Success State ──────────────────────────────────────────────────────────

  if (isSuccess && createdLink) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-400" />
            RFP Manager
          </h1>
          <p className="text-gray-400 mt-1">Generate and manage RFP links for prospects</p>
        </div>

        {/* Success card */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-xl shadow-none border border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">RFP Link Created!</h2>
            <p className="text-gray-300 mb-6">
              Share this link with the prospect to collect their requirements.
            </p>

            <div className="bg-gray-900/40 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">RFP Link</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={createdLink.url}
                  readOnly
                  className="flex-1 px-3 py-2 glass-card border border-white/20 rounded-lg text-sm text-white bg-transparent"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Layout ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-400" />
            RFP Manager
          </h1>
          <p className="text-gray-400 mt-1">Generate and manage RFP links for prospects</p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="inline-flex items-center px-3 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </button>
      </div>

      {/* ── Section 1: Create New RFP Link ─────────────────────────────────────── */}
      {canCreateRfp && (
      <div className="glass-card rounded-xl shadow-none border border-white/10">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-400" />
            Create New RFP Link
          </h2>
          {showForm ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                Company & Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Company / Brand Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={e => updateField('companyName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-500"
                      placeholder="Acme Healthcare Pvt. Ltd."
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Contact Person Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={e => updateField('contactName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-500"
                      placeholder="Full name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-500"
                      placeholder="contact@company.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-500"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Industry & Website */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                Industry & Website
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Industry <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={e => updateField('industry', e.target.value)}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white"
                    required
                  >
                    <option value="" className="bg-gray-900" disabled>Select industry...</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind} className="bg-gray-900">{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Current Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="url"
                      value={formData.currentWebsite}
                      onChange={e => updateField('currentWebsite', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-500"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-gray-500" />
                Notes & Link Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={e => updateField('internalNotes', e.target.value)}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-500 resize-none"
                    placeholder="Internal notes about this prospect (not visible to client)..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-gray-500" />
                    Link Expires In
                  </label>
                  <select
                    value={formData.expiresInDays}
                    onChange={e => updateField('expiresInDays', Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white"
                  >
                    {EXPIRY_OPTIONS.map(d => (
                      <option key={d} value={d} className="bg-gray-900">{d} Days</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
      )}

      {/* ── Section 2: RFP Submissions Table ───────────────────────────────────── */}
      <div className="glass-card rounded-xl shadow-none border border-white/10">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            RFP Submissions
            {submissions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs font-medium rounded-full border border-orange-500/20">
                {submissions.length}
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-400">Loading RFP submissions...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FileText className="w-10 h-10 mb-3 text-gray-600" />
            <p className="text-sm">No RFP links created yet</p>
            <p className="text-xs text-gray-600 mt-1">Use the form above to generate the first RFP link</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Company</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Contact</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Industry</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Completed</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Created</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Expiry</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.map(submission => {
                  const expired = isExpired(submission.expiresAt)
                  return (
                    <tr key={submission.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{submission.companyName}</p>
                          <p className="text-xs text-gray-500">{submission.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-300">{submission.contactName}</p>
                          <p className="text-xs text-gray-500">{submission.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 bg-slate-800/50 text-gray-300 rounded text-xs font-medium border border-white/5">
                          {submission.industry}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          expired && submission.status === 'SENT'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : STATUS_COLORS[submission.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {expired && submission.status === 'SENT' ? 'Expired' : STATUS_LABELS[submission.status] || submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {submission.completed ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-500/20 text-gray-400 border-gray-500/30">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-400">{formatDate(submission.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${expired ? 'text-red-400' : 'text-gray-400'}`}>
                          {formatDate(submission.expiresAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => copySubmissionLink(submission.token)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            title="Copy RFP link"
                          >
                            {copiedId === submission.token ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1 text-green-400" />
                                <span className="text-green-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1" />
                                Copy Link
                              </>
                            )}
                          </button>
                          <Link
                            href={`/rfp/${submission.token}`}
                            target="_blank"
                            className="inline-flex items-center px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            title="View RFP details"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
