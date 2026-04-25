'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface FormData {
  // Step 1: Primary Objective
  primaryObjective: string
  // Step 2: Current Challenges
  currentChallenges: string[]
  // Step 3: Business Type
  businessType: string
  // Healthcare specific
  isHealthcare: boolean
  healthcareType: string
  specialization: string
  patientVolume: string
  numberOfLocations: string
  // Step 4: Past Marketing
  pastMarketing: string[]
  workedWithAgency: boolean
  agencyIssues: string
  // Step 5: Timeline & Budget
  timeline: string
  budgetRange: string
  // Step 6: Contact Info
  contactName: string
  contactEmail: string
  contactPhone: string
  companyName: string
}

const OBJECTIVES = [
  { value: 'GET_CUSTOMERS', label: 'Get more customers/patients' },
  { value: 'BRAND_AWARENESS', label: 'Build brand awareness' },
  { value: 'ONLINE_PRESENCE', label: 'Improve online presence' },
  { value: 'GENERATE_LEADS', label: 'Generate more leads' },
  { value: 'INCREASE_SALES', label: 'Increase sales/revenue' },
]

const CHALLENGES = [
  { value: 'DONT_KNOW_START', label: "Don't know where to start" },
  { value: 'TRIED_DIDNT_WORK', label: "Tried before, didn't work" },
  { value: 'NO_TIME', label: 'No time to manage marketing' },
  { value: 'LIMITED_BUDGET', label: 'Limited budget' },
  { value: 'CANT_MEASURE', label: "Can't measure results" },
  { value: 'OUTDATED_WEBSITE', label: 'Website is outdated' },
  { value: 'AGENCY_FAILED', label: "Agency didn't deliver results" },
]

const BUSINESS_TYPES = [
  { value: 'HEALTHCARE', label: 'Healthcare', hasSubFields: true },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ECOMMERCE', label: 'E-commerce' },
  { value: 'FINANCE', label: 'Finance / Banking' },
  { value: 'HOSPITALITY', label: 'Hospitality / Restaurant' },
  { value: 'TECHNOLOGY', label: 'Technology / SaaS' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'SERVICES', label: 'Professional Services' },
  { value: 'OTHER', label: 'Other' },
]

const HEALTHCARE_TYPES = [
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'DOCTOR', label: 'Individual Doctor/Specialist' },
  { value: 'LAB', label: 'Lab / Diagnostics' },
]

const SPECIALIZATIONS = [
  'General Practice', 'Cardiology', 'Dermatology', 'Dentistry',
  'Orthopedics', 'Pediatrics', 'Gynecology', 'Ophthalmology',
  'Psychiatry', 'Oncology', 'Neurology', 'ENT', 'Other'
]

const PATIENT_VOLUMES = [
  { value: 'UNDER_20', label: 'Under 20 patients/day' },
  { value: '20_50', label: '20-50 patients/day' },
  { value: '50_100', label: '50-100 patients/day' },
  { value: 'OVER_100', label: 'Over 100 patients/day' },
]

const PAST_MARKETING = [
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'GOOGLE_ADS', label: 'Google/Facebook Ads' },
  { value: 'SEO', label: 'SEO' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'NOTHING', label: 'Nothing yet' },
]

const TIMELINES = [
  { value: 'ASAP', label: 'ASAP - Ready to start now' },
  { value: '1-3_MONTHS', label: 'Within 1-3 months' },
  { value: '3-6_MONTHS', label: 'Within 3-6 months' },
  { value: 'EXPLORING', label: 'Just exploring options' },
]

const BUDGETS = [
  { value: 'UNDER_25K', label: 'Under 25,000/month' },
  { value: '25K-50K', label: '25,000 - 50,000/month' },
  { value: '50K-1L', label: '50,000 - 1,00,000/month' },
  { value: '1L-2.5L', label: '1,00,000 - 2,50,000/month' },
  { value: 'ABOVE_2.5L', label: 'Above 2,50,000/month' },
]

function RFPFormV2Content() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [leadInfo, setLeadInfo] = useState<{ companyName?: string; contactName?: string; contactEmail?: string } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    primaryObjective: '',
    currentChallenges: [],
    businessType: '',
    isHealthcare: false,
    healthcareType: '',
    specialization: '',
    patientVolume: '',
    numberOfLocations: '1',
    pastMarketing: [],
    workedWithAgency: false,
    agencyIssues: '',
    timeline: '',
    budgetRange: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
  })

  useEffect(() => {
    if (token) {
      fetchLeadInfo()
    }
  }, [token])

  const fetchLeadInfo = async () => {
    try {
      const res = await fetch(`/api/sales/rfp/${token}`)
      if (res.ok) {
        const data = await res.json()
        setLeadInfo(data)
        setFormData(prev => ({
          ...prev,
          companyName: data.companyName || '',
          contactName: data.contactName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
        }))
      }
    } catch (err) {
      console.error('Failed to fetch lead info:', err)
    }
  }

  const handleObjectiveSelect = (value: string) => {
    setFormData({ ...formData, primaryObjective: value })
  }

  const handleChallengeToggle = (value: string) => {
    const current = formData.currentChallenges
    if (current.includes(value)) {
      setFormData({ ...formData, currentChallenges: current.filter(c => c !== value) })
    } else {
      setFormData({ ...formData, currentChallenges: [...current, value] })
    }
  }

  const handleBusinessTypeSelect = (value: string) => {
    const isHealthcare = value === 'HEALTHCARE'
    setFormData({
      ...formData,
      businessType: value,
      isHealthcare,
      healthcareType: isHealthcare ? formData.healthcareType : '',
      specialization: isHealthcare ? formData.specialization : '',
      patientVolume: isHealthcare ? formData.patientVolume : '',
    })
  }

  const handlePastMarketingToggle = (value: string) => {
    const current = formData.pastMarketing
    if (value === 'NOTHING') {
      setFormData({ ...formData, pastMarketing: ['NOTHING'] })
    } else {
      const filtered = current.filter(c => c !== 'NOTHING')
      if (current.includes(value)) {
        setFormData({ ...formData, pastMarketing: filtered.filter(c => c !== value) })
      } else {
        setFormData({ ...formData, pastMarketing: [...filtered, value] })
      }
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.primaryObjective
      case 2: return formData.currentChallenges.length > 0
      case 3:
        if (!formData.businessType) return false
        if (formData.isHealthcare && !formData.healthcareType) return false
        return true
      case 4: return formData.pastMarketing.length > 0
      case 5: return !!formData.timeline && !!formData.budgetRange
      case 6: return !!formData.contactName && !!formData.contactEmail && !!formData.contactPhone
      default: return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const endpoint = token ? `/api/sales/rfp/${token}` : '/api/public/rfp-v2'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Failed to submit. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-slate-400 mb-6">
            We&apos;ve received your information. Our team will reach out to you within 24 hours with a customized proposal.
          </p>
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-left">
            <p className="text-sm text-indigo-400 font-medium">What happens next?</p>
            <ul className="mt-2 text-sm text-slate-400 space-y-1">
              <li>1. Our team reviews your requirements</li>
              <li>2. We prepare a tailored strategy</li>
              <li>3. Schedule a discovery call</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Let&apos;s Understand Your Goals
          </h1>
          <p className="text-slate-400">
            Answer a few quick questions so we can create the perfect marketing plan for you
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Step {step} of 6</span>
            <span>{Math.round((step / 6) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Primary Objective */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-6">
                What&apos;s your primary goal?
              </h2>
              <div className="space-y-3">
                {OBJECTIVES.map(obj => (
                  <button
                    key={obj.value}
                    onClick={() => handleObjectiveSelect(obj.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                      formData.primaryObjective === obj.value
                        ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/10 shadow-none'
                        : 'border-white/10 hover:border-white/20 hover:bg-slate-800/50 '
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                      formData.primaryObjective === obj.value ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/100' : 'border-white/20'
                    }`}>
                      {formData.primaryObjective === obj.value && (
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-slate-200">{obj.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Current Challenges */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">
                What challenges are you facing?
              </h2>
              <p className="text-sm text-slate-400 mb-6">Select all that apply</p>
              <div className="grid gap-3">
                {CHALLENGES.map(challenge => (
                  <button
                    key={challenge.value}
                    onClick={() => handleChallengeToggle(challenge.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      formData.currentChallenges.includes(challenge.value)
                        ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.currentChallenges.includes(challenge.value)
                        ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/100'
                        : 'border-white/20'
                    }`}>
                      {formData.currentChallenges.includes(challenge.value) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-slate-200">{challenge.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Business Type */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-6">
                What type of business do you have?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {BUSINESS_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleBusinessTypeSelect(type.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.businessType === type.value
                        ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-slate-200 font-medium">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Healthcare Specific Fields */}
              {formData.isHealthcare && (
                <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 space-y-4">
                  <h3 className="font-medium text-emerald-400">Healthcare Details</h3>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Practice Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {HEALTHCARE_TYPES.map(type => (
                        <button
                          key={type.value}
                          onClick={() => setFormData({ ...formData, healthcareType: type.value })}
                          className={`p-3 rounded-lg border text-sm transition-all ${
                            formData.healthcareType === type.value
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-white/10 text-slate-300 hover:bg-slate-800/50'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Specialization</label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select specialty</option>
                      {SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Daily Patient Volume</label>
                      <select
                        value={formData.patientVolume}
                        onChange={(e) => setFormData({ ...formData, patientVolume: e.target.value })}
                        className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select</option>
                        {PATIENT_VOLUMES.map(vol => (
                          <option key={vol.value} value={vol.value}>{vol.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Number of Locations</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.numberOfLocations}
                        onChange={(e) => setFormData({ ...formData, numberOfLocations: e.target.value })}
                        className="w-full p-3 rounded-lg border border-white/10 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Past Marketing */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-2">
                What marketing have you done before?
              </h2>
              <p className="text-sm text-slate-400 mb-6">Select all that apply</p>
              <div className="grid gap-3">
                {PAST_MARKETING.map(marketing => (
                  <button
                    key={marketing.value}
                    onClick={() => handlePastMarketingToggle(marketing.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                      formData.pastMarketing.includes(marketing.value)
                        ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.pastMarketing.includes(marketing.value)
                        ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/100'
                        : 'border-white/20'
                    }`}>
                      {formData.pastMarketing.includes(marketing.value) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-slate-200">{marketing.label}</span>
                  </button>
                ))}
              </div>

              {/* Agency Experience */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-slate-200 mb-3">Have you worked with a marketing agency before?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, workedWithAgency: true })}
                    className={`flex-1 p-3 rounded-lg border-2 ${
                      formData.workedWithAgency
                        ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/10'
                        : 'border-white/10'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, workedWithAgency: false, agencyIssues: '' })}
                    className={`flex-1 p-3 rounded-lg border-2 ${
                      !formData.workedWithAgency
                        ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/10'
                        : 'border-white/10'
                    }`}
                  >
                    No
                  </button>
                </div>

                {formData.workedWithAgency && (
                  <div className="mt-4">
                    <label className="block text-sm text-slate-300 mb-2">
                      What didn&apos;t work with the previous agency?
                    </label>
                    <textarea
                      value={formData.agencyIssues}
                      onChange={(e) => setFormData({ ...formData, agencyIssues: e.target.value })}
                      placeholder="E.g., Poor communication, no results, hidden costs..."
                      rows={3}
                      className="w-full p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Timeline & Budget */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  When do you want to start?
                </h2>
                <div className="grid gap-3">
                  {TIMELINES.map(timeline => (
                    <button
                      key={timeline.value}
                      onClick={() => setFormData({ ...formData, timeline: timeline.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.timeline === timeline.value
                          ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/10'
                          : 'border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-slate-200">{timeline.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  What&apos;s your monthly marketing budget?
                </h2>
                <div className="grid gap-3">
                  {BUDGETS.map(budget => (
                    <button
                      key={budget.value}
                      onClick={() => setFormData({ ...formData, budgetRange: budget.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.budgetRange === budget.value
                          ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/10'
                          : 'border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-slate-200">{budget.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Contact Info */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-6">
                Almost done! How can we reach you?
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Company Name"
                    className="w-full p-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                step === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              Back
            </button>
            {step < 6 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  canProceed()
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                    : 'bg-white/10 text-slate-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  canProceed() && !loading
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                    : 'bg-white/10 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Trusted by 100+ businesses across India</p>
          <p className="mt-1">Your information is secure and will not be shared</p>
        </div>
      </div>
    </div>
  )
}

export default function RFPFormV2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    }>
      <RFPFormV2Content />
    </Suspense>
  )
}
