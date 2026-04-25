'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  UserPlus, Loader2, CheckCircle, Copy, Check, Users, Mail,
  Phone, Building2, Briefcase, Calendar, IndianRupee, Clock,
  Eye, RefreshCw, Shield, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react'

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'WEB', 'SEO', 'ADS', 'SOCIAL', 'HR', 'ACCOUNTS', 'SALES', 'OPERATIONS', 'DESIGN', 'VIDEO',
] as const

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'FREELANCER', label: 'Freelancer' },
] as const

const PROBATION_OPTIONS = [1, 2, 3, 6] as const
const BOND_OPTIONS = [6, 12, 18, 24] as const
const EXPIRY_OPTIONS = [7, 14, 30] as const

const ENTITIES = [
  { id: 'BRANDING_PIONEERS', name: 'Branding Pioneers' },
  { id: 'ATZ_MEDAPPZ', name: 'ATZ Medappz' },
] as const

const STATUS_COLORS: Record<string, string> = {
  SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  VIEWED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  DETAILS_CONFIRMED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  NDA_SIGNED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  BOND_SIGNED: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  POLICIES_ACCEPTED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  DOCS_SUBMITTED: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  ACTIVATED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  SENT: 'Sent',
  VIEWED: 'Viewed',
  DETAILS_CONFIRMED: 'Details Confirmed',
  NDA_SIGNED: 'NDA Signed',
  BOND_SIGNED: 'Bond Signed',
  POLICIES_ACCEPTED: 'Policies Accepted',
  DOCS_SUBMITTED: 'Docs Submitted',
  COMPLETED: 'Completed',
  ACTIVATED: 'Activated',
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  department: string
  position: string
  employmentType: string
  offeredSalary: string
  joiningDate: string
  probationMonths: number
  bondDurationMonths: number
  entityType: string
  expiresInDays: number
}

interface Proposal {
  id: string
  token: string
  candidateName: string
  candidateEmail: string
  department: string
  position: string
  employmentType: string
  offeredSalary: number
  status: string
  currentStep: number
  createdAt: string
  expiresAt: string
  joiningDate: string
}

const initialFormData: FormData = {
  candidateName: '',
  candidateEmail: '',
  candidatePhone: '',
  department: 'WEB',
  position: '',
  employmentType: 'FULL_TIME',
  offeredSalary: '',
  joiningDate: '',
  probationMonths: 3,
  bondDurationMonths: 12,
  entityType: 'BRANDING_PIONEERS',
  expiresInDays: 14,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

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

function getEmploymentLabel(type: string): string {
  return EMPLOYMENT_TYPES.find(t => t.value === type)?.label || type
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EmployeeOnboardingPage() {
  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdLink, setCreatedLink] = useState<{ url: string; token: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // Table state
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Section toggle
  const [showForm, setShowForm] = useState(true)

  // ── Fetch proposals ──────────────────────────────────────────────────────────

  const fetchProposals = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/employee-onboarding/create')
      if (res.ok) {
        const data = await res.json()
        setProposals(data.proposals || [])
      }
    } catch {
      // Silently fail for list - non-critical
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  // ── Form handlers ────────────────────────────────────────────────────────────

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.candidateName || !formData.candidateEmail || !formData.candidatePhone) {
      setError('Please fill in all required fields')
      return
    }

    if (!formData.position) {
      setError('Please enter the position / designation')
      return
    }

    if (!formData.offeredSalary || Number(formData.offeredSalary) <= 0) {
      setError('Please enter a valid CTC / Stipend amount')
      return
    }

    if (!formData.joiningDate) {
      setError('Please select a joining date')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        candidateName: formData.candidateName.trim(),
        candidateEmail: formData.candidateEmail.trim(),
        candidatePhone: formData.candidatePhone.trim(),
        department: formData.department,
        position: formData.position.trim(),
        employmentType: formData.employmentType,
        offeredSalary: Number(formData.offeredSalary),
        joiningDate: formData.joiningDate,
        probationMonths: formData.probationMonths,
        bondDurationMonths: formData.bondDurationMonths,
        entityType: formData.entityType,
        expiresInDays: formData.expiresInDays,
      }

      const res = await fetch('/api/employee-onboarding/create', {
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
        throw new Error(result.error || 'Failed to create onboarding link')
      }

      setCreatedLink({
        url: result.proposal.url,
        token: result.proposal.token,
      })
      setIsSuccess(true)
      fetchProposals()
    } catch (err) {
      console.error('Error creating employee onboarding link:', err)
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

  const copyProposalLink = (token: string) => {
    const baseUrl = window.location.origin
    const url = `${baseUrl}/join-team/${token}`
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

  // ── Success State ────────────────────────────────────────────────────────────

  if (isSuccess && createdLink) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-400" />
            Employee Onboarding
          </h1>
          <p className="text-gray-400 mt-1">Generate and manage employee onboarding links</p>
        </div>

        {/* Success card */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-xl shadow-none border border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Onboarding Link Created!</h2>
            <p className="text-gray-300 mb-6">
              Share this link with the candidate to start their onboarding process.
            </p>

            <div className="bg-gray-900/40 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Onboarding Link</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={createdLink.url}
                  readOnly
                  className="flex-1 px-3 py-2 glass-card border border-white/20 rounded-lg text-sm text-white bg-transparent"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Layout ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-400" />
            Employee Onboarding
          </h1>
          <p className="text-gray-400 mt-1">Generate and manage employee onboarding links</p>
        </div>
        <button
          onClick={fetchProposals}
          className="inline-flex items-center px-3 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </button>
      </div>

      {/* ── Section 1: Create Form ─────────────────────────────────────────────── */}
      <div className="glass-card rounded-xl shadow-none border border-white/10">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Create New Onboarding Link
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

            {/* Candidate Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Candidate Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Candidate Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.candidateName}
                      onChange={e => updateField('candidateName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder-gray-500"
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
                      value={formData.candidateEmail}
                      onChange={e => updateField('candidateEmail', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder-gray-500"
                      placeholder="email@example.com"
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
                      value={formData.candidatePhone}
                      onChange={e => updateField('candidatePhone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder-gray-500"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                Role & Department
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Department <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={e => updateField('department', e.target.value)}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept} className="bg-gray-900">{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Position <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={e => updateField('position', e.target.value)}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder-gray-500"
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Employment Type
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {EMPLOYMENT_TYPES.map(type => (
                      <label
                        key={type.value}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                          formData.employmentType === type.value
                            ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                            : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="radio"
                          name="employmentType"
                          value={type.value}
                          checked={formData.employmentType === type.value}
                          onChange={e => updateField('employmentType', e.target.value)}
                          className="sr-only"
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Compensation & Dates */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-500" />
                Compensation & Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Monthly CTC / Stipend <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      value={formData.offeredSalary}
                      onChange={e => updateField('offeredSalary', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder-gray-500"
                      placeholder="25000"
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Joining Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={e => updateField('joiningDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Probation Period
                  </label>
                  <select
                    value={formData.probationMonths}
                    onChange={e => updateField('probationMonths', Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white"
                  >
                    {PROBATION_OPTIONS.map(m => (
                      <option key={m} value={m} className="bg-gray-900">{m} {m === 1 ? 'Month' : 'Months'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Terms & Link Config */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                Agreement & Link Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Bond Duration
                  </label>
                  <select
                    value={formData.bondDurationMonths}
                    onChange={e => updateField('bondDurationMonths', Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white"
                  >
                    {BOND_OPTIONS.map(m => (
                      <option key={m} value={m} className="bg-gray-900">{m} Months</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Entity
                  </label>
                  <select
                    value={formData.entityType}
                    onChange={e => updateField('entityType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white"
                  >
                    {ENTITIES.map(entity => (
                      <option key={entity.id} value={entity.id} className="bg-gray-900">{entity.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Link Expires In
                  </label>
                  <select
                    value={formData.expiresInDays}
                    onChange={e => updateField('expiresInDays', Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent text-white"
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
                    className="w-full inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
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

      {/* ── Section 2: Active Onboarding Links Table ───────────────────────────── */}
      <div className="glass-card rounded-xl shadow-none border border-white/10">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Active Onboarding Links
            {proposals.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
                {proposals.length}
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-400">Loading onboarding links...</span>
          </div>
        ) : proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Users className="w-10 h-10 mb-3 text-gray-600" />
            <p className="text-sm">No onboarding links created yet</p>
            <p className="text-xs text-gray-600 mt-1">Use the form above to generate the first link</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Candidate</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Department</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Position</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Salary</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Step</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Created</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Expiry</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {proposals.map(proposal => {
                  const expired = isExpired(proposal.expiresAt)
                  return (
                    <tr key={proposal.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{proposal.candidateName}</p>
                          <p className="text-xs text-gray-500">{proposal.candidateEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 bg-slate-800/50 text-gray-300 rounded text-xs font-medium border border-white/5">
                          {proposal.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300">{proposal.position}</p>
                        <p className="text-xs text-gray-500">{getEmploymentLabel(proposal.employmentType)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white font-medium">{formatCurrency(proposal.offeredSalary)}</p>
                        <p className="text-xs text-gray-500">/month</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          expired && proposal.status === 'SENT'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : STATUS_COLORS[proposal.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {expired && proposal.status === 'SENT' ? 'Expired' : STATUS_LABELS[proposal.status] || proposal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5, 6].map(step => (
                              <div
                                key={step}
                                className={`w-2 h-2 rounded-full ${
                                  step <= proposal.currentStep ? 'bg-blue-400' : 'bg-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">{proposal.currentStep}/6</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-400">{formatDate(proposal.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${expired ? 'text-red-400' : 'text-gray-400'}`}>
                          {formatDate(proposal.expiresAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => copyProposalLink(proposal.token)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            title="Copy onboarding link"
                          >
                            {copiedId === proposal.token ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1 text-green-400" />
                                <span className="text-green-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                          <Link
                            href={`/join-team/${proposal.token}`}
                            target="_blank"
                            className="inline-flex items-center px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            title="View onboarding page"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
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
