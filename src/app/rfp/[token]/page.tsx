'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import {
  FormLayout,
  FormCard,
  TextInput,
  Textarea,
  SingleSelect,
  MultiSelect,
  DropdownSelect,
  FormButtons,
  Checkbox,
  SuccessScreen,
} from '@/client/components/forms/FormComponents'
import PageGuide from '@/client/components/ui/PageGuide'

// ============================================
// CONSTANTS
// ============================================

const TOTAL_STEPS = 6

const HEALTHCARE_INDUSTRIES = ['healthcare', 'dental', 'aesthetics', 'ivf', 'mental_health', 'veterinary']

const CLIENT_TIERS = [
  { value: 'standard', label: 'Standard', description: 'Growing businesses looking for essential digital marketing', emoji: '🚀' },
  { value: 'premium', label: 'Premium', description: 'Established brands needing comprehensive strategy & execution', emoji: '👑' },
  { value: 'enterprise', label: 'Enterprise', description: 'Multi-location / high-volume operations with dedicated teams', emoji: '🏢' },
]

const CURRENCIES = [
  { value: 'INR', label: '₹ INR (Indian Rupee)' },
  { value: 'USD', label: '$ USD (US Dollar)' },
  { value: 'AED', label: 'د.إ AED (UAE Dirham)' },
  { value: 'GBP', label: '£ GBP (British Pound)' },
  { value: 'EUR', label: '€ EUR (Euro)' },
  { value: 'SGD', label: 'S$ SGD (Singapore Dollar)' },
]

const LOCATIONS_OPTIONS = [
  { value: '1', label: '1 Location' },
  { value: '2-5', label: '2-5 Locations' },
  { value: '6-10', label: '6-10 Locations' },
  { value: '10+', label: '10+ Locations' },
]

const SERVICES_NEEDED = [
  { value: 'seo', label: 'SEO', description: 'Search rankings & organic traffic', emoji: '🔍' },
  { value: 'gbp', label: 'Google Business Profile', description: 'Local SEO & map visibility', emoji: '📍' },
  { value: 'social_media', label: 'Social Media', description: 'Content creation & management', emoji: '📱' },
  { value: 'paid_ads', label: 'Paid Advertising', description: 'Google & Meta Ads', emoji: '📈' },
  { value: 'website', label: 'Website', description: 'New site or redesign', emoji: '🌐' },
  { value: 'content', label: 'Content Marketing', description: 'Blogs, articles, PR', emoji: '✍️' },
  { value: 'video', label: 'Video Production', description: 'Reels, testimonials, ads', emoji: '🎬' },
  { value: 'branding', label: 'Branding & Design', description: 'Logo, identity, creatives', emoji: '🎨' },
  { value: 'reputation', label: 'Reputation Management', description: 'Reviews & online presence', emoji: '⭐' },
  { value: 'ai_automation', label: 'AI & Automation', description: 'Chatbots, workflows, CRM', emoji: '🤖' },
]

const MARKETING_STATUS_OPTIONS = [
  { value: 'no', label: 'No, fresh start', description: 'Starting from scratch', emoji: '🌱' },
  { value: 'inhouse', label: 'In-house team', description: 'We handle it internally', emoji: '🏠' },
  { value: 'agency', label: 'Working with an agency', description: 'Currently outsourced', emoji: '🤝' },
  { value: 'freelancers', label: 'Using freelancers', description: 'Individual contractors', emoji: '💼' },
]

const AGE_GROUP_OPTIONS = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55+', label: '55+' },
  { value: 'all', label: 'All ages' },
]

const GEOGRAPHIC_OPTIONS = [
  { value: 'local', label: 'Local (city-level)' },
  { value: 'regional', label: 'Regional (state-level)' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
]

const RETAINER_STANDARD = [
  { value: 'under_30k', label: 'Under ₹30,000/mo' },
  { value: '30k_50k', label: '₹30,000 - ₹50,000/mo' },
  { value: '50k_75k', label: '₹50,000 - ₹75,000/mo' },
  { value: 'flexible', label: 'Flexible / Discuss' },
]

const RETAINER_PREMIUM = [
  { value: '75k_1l', label: '₹75,000 - ₹1 Lakh/mo' },
  { value: '1l_2l', label: '₹1 - ₹2 Lakhs/mo' },
  { value: '2l_3l', label: '₹2 - ₹3 Lakhs/mo' },
  { value: 'flexible', label: 'Flexible / Discuss' },
]

const RETAINER_ENTERPRISE = [
  { value: '2l_5l', label: '₹2 - ₹5 Lakhs/mo' },
  { value: '5l_10l', label: '₹5 - ₹10 Lakhs/mo' },
  { value: '10l_plus', label: '₹10 Lakhs+/mo' },
  { value: 'flexible', label: 'Flexible / Discuss' },
]

const AD_BUDGET_STANDARD = [
  { value: 'under_25k', label: 'Under ₹25,000/mo', description: 'Testing phase' },
  { value: '25k_50k', label: '₹25,000 - ₹50,000/mo', description: 'Growth starter' },
  { value: '50k_1l', label: '₹50,000 - ₹1 Lakh/mo', description: 'Active campaigns' },
  { value: 'flexible', label: 'Flexible / Discuss', description: 'Open to recommendation' },
]

const AD_BUDGET_PREMIUM = [
  { value: '50k_1l', label: '₹50,000 - ₹1 Lakh/mo', description: 'Focused campaigns' },
  { value: '1l_3l', label: '₹1 - ₹3 Lakhs/mo', description: 'Multi-channel' },
  { value: '3l_5l', label: '₹3 - ₹5 Lakhs/mo', description: 'Aggressive growth' },
  { value: '5l_plus', label: '₹5 Lakhs+/mo', description: 'Full-scale operations' },
  { value: 'flexible', label: 'Flexible / Discuss', description: 'Open to recommendation' },
]

const AD_BUDGET_ENTERPRISE = [
  { value: '3l_5l', label: '₹3 - ₹5 Lakhs/mo', description: 'Per location/brand' },
  { value: '5l_10l', label: '₹5 - ₹10 Lakhs/mo', description: 'Multi-location' },
  { value: '10l_plus', label: '₹10 Lakhs+/mo', description: 'Enterprise scale' },
  { value: 'flexible', label: 'Flexible / Discuss', description: 'Custom budgeting' },
]

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP', description: 'Ready to start immediately', emoji: '⚡' },
  { value: '2_weeks', label: '2 Weeks', description: 'Short onboarding window', emoji: '📅' },
  { value: '1_month', label: '1 Month', description: 'Standard timeline', emoji: '🗓️' },
  { value: '2_3_months', label: '2-3 Months', description: 'Planning phase', emoji: '📋' },
  { value: 'flexible', label: 'Flexible', description: 'No rush, exploring options', emoji: '🤔' },
]

const CONTRACT_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: '3_months', label: '3 Months' },
  { value: '6_months', label: '6 Months' },
  { value: '12_months', label: '12 Months' },
]

const GOALS_OPTIONS = [
  { value: 'generate_leads', label: 'Generate Leads', emoji: '🎯' },
  { value: 'brand_awareness', label: 'Brand Awareness', emoji: '📢' },
  { value: 'website_traffic', label: 'Website Traffic', emoji: '🌐' },
  { value: 'social_growth', label: 'Social Media Growth', emoji: '📱' },
  { value: 'reputation', label: 'Reputation Management', emoji: '⭐' },
  { value: 'revenue', label: 'Increase Revenue', emoji: '💰' },
  { value: 'new_market', label: 'Enter New Market', emoji: '🚀' },
  { value: 'patient_volume', label: 'Increase Patient Volume', emoji: '🏥' },
]

const CALL_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning (10 AM - 12 PM)', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 3 PM)', emoji: '☀️' },
  { value: 'evening', label: 'Evening (3 PM - 6 PM)', emoji: '🌇' },
  { value: 'anytime', label: 'Anytime works', emoji: '🕐' },
]

const STEP_LABELS = ['Business', 'Services', 'Audience', 'Budget', 'Goals', 'Submit']

// ============================================
// FORM DATA INTERFACE
// ============================================

interface RFPFormData {
  // Step 1 — Your Business
  clientTier: string
  currency: string
  locations: string
  city: string
  stateRegion: string
  yearsInBusiness: string

  // Step 2 — Services Needed
  servicesNeeded: string[]
  currentlyDoingMarketing: string
  whatWorked: string
  whatDidntWork: string

  // Step 3 — Target Audience
  targetAudience: string
  ageGroup: string
  geographicTarget: string
  topCompetitors: string
  usp: string
  patientVolume: string
  specializations: string

  // Step 4 — Budget & Timeline
  retainerBudget: string
  adBudget: string
  timeline: string
  contractPreference: string
  expectedStartDate: string

  // Step 5 — Goals
  primaryGoals: string[]
  monthlyLeadTarget: string
  currentMonthlyLeads: string
  successMetrics: string
  biggestChallenge: string

  // Step 6 — Submit
  preferredCallTime: string
  additionalInfo: string
  privacyConsent: boolean
}

const initialFormData: RFPFormData = {
  clientTier: '',
  currency: 'INR',
  locations: '',
  city: '',
  stateRegion: '',
  yearsInBusiness: '',
  servicesNeeded: [],
  currentlyDoingMarketing: '',
  whatWorked: '',
  whatDidntWork: '',
  targetAudience: '',
  ageGroup: '',
  geographicTarget: '',
  topCompetitors: '',
  usp: '',
  patientVolume: '',
  specializations: '',
  retainerBudget: '',
  adBudget: '',
  timeline: '',
  contractPreference: '',
  expectedStartDate: '',
  primaryGoals: [],
  monthlyLeadTarget: '',
  currentMonthlyLeads: '',
  successMetrics: '',
  biggestChallenge: '',
  preferredCallTime: '',
  additionalInfo: '',
  privacyConsent: false,
}

interface CompanyInfo {
  name: string
  contact: string
  email: string
  phone: string
  industry: string
  website: string
}

// ============================================
// HELPER: Get tier-based budget options
// ============================================

function getRetainerOptions(tier: string) {
  switch (tier) {
    case 'premium': return RETAINER_PREMIUM
    case 'enterprise': return RETAINER_ENTERPRISE
    default: return RETAINER_STANDARD
  }
}

function getAdBudgetOptions(tier: string) {
  switch (tier) {
    case 'premium': return AD_BUDGET_PREMIUM
    case 'enterprise': return AD_BUDGET_ENTERPRISE
    default: return AD_BUDGET_STANDARD
  }
}

// ============================================
// RFP FORM COMPONENT
// ============================================

function RFPForm() {
  const params = useParams()
  const token = params.token as string

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RFPFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof RFPFormData, string>>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [company, setCompany] = useState<CompanyInfo | null>(null)

  // Auto-save to localStorage (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasRestoredRef = useRef(false)

  // Restore from localStorage on mount
  useEffect(() => {
    if (hasRestoredRef.current) return
    hasRestoredRef.current = true
    try {
      const saved = localStorage.getItem(`rfp-${token}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setFormData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // Ignore parse errors
    }
  }, [token])

  // Save to localStorage on formData change (debounced)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`rfp-${token}`, JSON.stringify(formData))
      } catch {
        // Ignore storage errors
      }
    }, 500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [formData, token])

  const isHealthcare = company ? HEALTHCARE_INDUSTRIES.includes(company.industry || '') : false
  const needsAdBudget = formData.servicesNeeded.includes('paid_ads')

  // Fetch RFP data on mount
  useEffect(() => {
    async function fetchRFP() {
      try {
        const res = await fetch(`/api/rfp/${token}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (res.status === 404) {
            setFetchError('RFP not found. Please check your link and try again.')
          } else if (res.status === 410) {
            setFetchError('This RFP link has expired. Please contact us for a new link.')
          } else {
            setFetchError(data?.error || 'Unable to load RFP. Please try again later.')
          }
          return
        }
        const data = await res.json()

        if (data.completed) {
          setFetchError('This RFP has already been submitted. Thank you for your response!')
          return
        }

        if (data.isExpired) {
          setFetchError('This RFP link has expired. Please contact us for a new link.')
          return
        }

        setCompany(data.company || null)
      } catch {
        setFetchError('Network error. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchRFP()
  }, [token])

  const updateField = useCallback(<K extends keyof RFPFormData>(field: K, value: RFPFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev }
        delete next[field]
        return next
      }
      return prev
    })
  }, [])

  // Reset retainer/ad budget when tier changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, retainerBudget: '', adBudget: '' }))
  }, [formData.clientTier])

  // Validate per step
  const validateStep = useCallback((currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof RFPFormData, string>> = {}

    switch (currentStep) {
      case 1:
        if (!formData.clientTier) newErrors.clientTier = 'Please select a client tier'
        if (!formData.currency) newErrors.currency = 'Please select a currency'
        if (!formData.locations) newErrors.locations = 'Please select number of locations'
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.stateRegion.trim()) newErrors.stateRegion = 'State/Region is required'
        if (!formData.yearsInBusiness.trim()) newErrors.yearsInBusiness = 'Years in business is required'
        break

      case 2:
        if (formData.servicesNeeded.length === 0) newErrors.servicesNeeded = 'Please select at least one service'
        if (!formData.currentlyDoingMarketing) newErrors.currentlyDoingMarketing = 'Please select your current marketing status'
        if (formData.currentlyDoingMarketing && formData.currentlyDoingMarketing !== 'no') {
          if (!formData.whatWorked.trim()) newErrors.whatWorked = 'Please share what has worked'
          if (!formData.whatDidntWork.trim()) newErrors.whatDidntWork = 'Please share what hasn\'t worked'
        }
        break

      case 3:
        if (!formData.targetAudience.trim()) newErrors.targetAudience = 'Target audience description is required'
        if (!formData.ageGroup) newErrors.ageGroup = 'Please select an age group'
        if (!formData.geographicTarget) newErrors.geographicTarget = 'Please select a geographic target'
        if (isHealthcare) {
          if (!formData.patientVolume.trim()) newErrors.patientVolume = 'Patient volume is required for healthcare'
        }
        break

      case 4:
        if (!formData.retainerBudget) newErrors.retainerBudget = 'Please select a retainer budget'
        if (needsAdBudget && !formData.adBudget) newErrors.adBudget = 'Please select an ad budget'
        if (!formData.timeline) newErrors.timeline = 'Please select a timeline'
        if (!formData.contractPreference) newErrors.contractPreference = 'Please select a contract preference'
        break

      case 5:
        if (formData.primaryGoals.length === 0) newErrors.primaryGoals = 'Please select at least one goal'
        if (!formData.biggestChallenge.trim()) newErrors.biggestChallenge = 'Please describe your biggest challenge'
        break

      case 6:
        if (!formData.preferredCallTime) newErrors.preferredCallTime = 'Please select a preferred call time'
        if (!formData.privacyConsent) newErrors.privacyConsent = 'You must accept the privacy policy to submit'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, isHealthcare, needsAdBudget])

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step, validateStep])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!validateStep(step)) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/rfp/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data?.error || 'Submission failed. Please try again.')
        return
      }

      // Clear auto-saved data on successful submission
      try { localStorage.removeItem(`rfp-${token}`) } catch {}

      setSubmitted(true)
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }, [step, validateStep, token, formData])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your RFP...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">RFP Unavailable</h1>
          <p className="text-slate-400">{fetchError}</p>
        </div>
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <SuccessScreen
        theme="dark"
        title="RFP Submitted Successfully!"
        message="Thank you for sharing your requirements. Our team will review your submission and get back to you within 24 hours."
        details={[
          { label: 'Company', value: company?.name || 'N/A' },
          { label: 'Tier', value: formData.clientTier ? formData.clientTier.charAt(0).toUpperCase() + formData.clientTier.slice(1) : 'N/A' },
          { label: 'Services', value: `${formData.servicesNeeded.length} selected` },
          { label: 'Timeline', value: TIMELINE_OPTIONS.find(t => t.value === formData.timeline)?.label || 'N/A' },
        ]}
      />
    )
  }

  // Helper to build summary items for Step 6
  const summaryItems = [
    { label: 'Company', value: company?.name || 'N/A' },
    { label: 'Tier', value: CLIENT_TIERS.find(t => t.value === formData.clientTier)?.label || 'N/A' },
    { label: 'Currency', value: formData.currency || 'N/A' },
    { label: 'Locations', value: formData.locations || 'N/A' },
    { label: 'Location', value: [formData.city, formData.stateRegion].filter(Boolean).join(', ') || 'N/A' },
    { label: 'Years in Business', value: formData.yearsInBusiness || 'N/A' },
    { label: 'Services', value: formData.servicesNeeded.map(s => SERVICES_NEEDED.find(sn => sn.value === s)?.label || s).join(', ') || 'N/A' },
    { label: 'Marketing Status', value: MARKETING_STATUS_OPTIONS.find(o => o.value === formData.currentlyDoingMarketing)?.label || 'N/A' },
    { label: 'Target Audience', value: formData.targetAudience ? (formData.targetAudience.length > 60 ? formData.targetAudience.slice(0, 60) + '...' : formData.targetAudience) : 'N/A' },
    { label: 'Age Group', value: AGE_GROUP_OPTIONS.find(o => o.value === formData.ageGroup)?.label || 'N/A' },
    { label: 'Geographic Target', value: GEOGRAPHIC_OPTIONS.find(o => o.value === formData.geographicTarget)?.label || 'N/A' },
    { label: 'Retainer Budget', value: getRetainerOptions(formData.clientTier).find(o => o.value === formData.retainerBudget)?.label || 'N/A' },
    ...(needsAdBudget ? [{ label: 'Ad Budget', value: getAdBudgetOptions(formData.clientTier).find(o => o.value === formData.adBudget)?.label || 'N/A' }] : []),
    { label: 'Timeline', value: TIMELINE_OPTIONS.find(o => o.value === formData.timeline)?.label || 'N/A' },
    { label: 'Contract', value: CONTRACT_OPTIONS.find(o => o.value === formData.contractPreference)?.label || 'N/A' },
    ...(formData.expectedStartDate ? [{ label: 'Start Date', value: formData.expectedStartDate }] : []),
    { label: 'Goals', value: formData.primaryGoals.map(g => GOALS_OPTIONS.find(go => go.value === g)?.label || g).join(', ') || 'N/A' },
    ...(formData.monthlyLeadTarget ? [{ label: 'Monthly Lead Target', value: formData.monthlyLeadTarget }] : []),
    ...(formData.currentMonthlyLeads ? [{ label: 'Current Monthly Leads', value: formData.currentMonthlyLeads }] : []),
  ]

  return (
    <FormLayout
      title="Request for Proposal"
      subtitle={company?.name ? `Prepared for ${company.name}` : 'Tell us about your needs'}
      step={step}
      totalSteps={TOTAL_STEPS}
      brandColor="orange"
      theme="dark"
    >
      <PageGuide
        title="Request for Proposal"
        description="Tell us about your business needs so we can prepare a tailored proposal."
        pageKey="rfp-form"
      />
      {/* ============================================ */}
      {/* STEP 1 — YOUR BUSINESS */}
      {/* ============================================ */}
      {step === 1 && (
        <FormCard
          title="Your Business"
          description="Let us know about your company and operations"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        >
          <div className="space-y-6">
            {/* Pre-filled company info card */}
            {company && (
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5 mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-sm font-semibold text-orange-400">Your Company Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 block">Company</span>
                    <span className="text-white font-medium">{company.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact</span>
                    <span className="text-white font-medium">{company.contact || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email</span>
                    <span className="text-white font-medium">{company.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Industry</span>
                    <span className="text-white font-medium">{company.industry ? company.industry.charAt(0).toUpperCase() + company.industry.slice(1).replace(/_/g, ' ') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            <SingleSelect
              label="Client Tier"
              name="clientTier"
              value={formData.clientTier}
              onChange={(v) => updateField('clientTier', v)}
              options={CLIENT_TIERS}
              required
              error={errors.clientTier}
              columns={3}
              accentColor="orange"
            />

            <DropdownSelect
              label="Preferred Currency"
              name="currency"
              value={formData.currency}
              onChange={(v) => updateField('currency', v)}
              options={CURRENCIES}
              required
              error={errors.currency}
            />

            <SingleSelect
              label="Number of Locations"
              name="locations"
              value={formData.locations}
              onChange={(v) => updateField('locations', v)}
              options={LOCATIONS_OPTIONS}
              required
              error={errors.locations}
              columns={4}
              size="sm"
              accentColor="orange"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="City"
                name="city"
                value={formData.city}
                onChange={(v) => updateField('city', v)}
                placeholder="e.g., Mumbai"
                required
                error={errors.city}
              />
              <TextInput
                label="State / Region"
                name="stateRegion"
                value={formData.stateRegion}
                onChange={(v) => updateField('stateRegion', v)}
                placeholder="e.g., Maharashtra"
                required
                error={errors.stateRegion}
              />
            </div>

            <TextInput
              label="Years in Business"
              name="yearsInBusiness"
              value={formData.yearsInBusiness}
              onChange={(v) => updateField('yearsInBusiness', v)}
              placeholder="e.g., 5"
              type="number"
              required
              error={errors.yearsInBusiness}
            />

            <FormButtons
              onNext={handleNext}
              showBack={false}
              nextLabel="Continue to Services"
              accentColor="orange"
            />
          </div>
        </FormCard>
      )}

      {/* ============================================ */}
      {/* STEP 2 — SERVICES NEEDED */}
      {/* ============================================ */}
      {step === 2 && (
        <FormCard
          title="Services Needed"
          description="Select the marketing services you're interested in"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
        >
          <div className="space-y-6">
            <MultiSelect
              label="Which services do you need?"
              name="servicesNeeded"
              value={formData.servicesNeeded}
              onChange={(v) => updateField('servicesNeeded', v)}
              options={SERVICES_NEEDED}
              required
              error={errors.servicesNeeded}
              columns={2}
              min={1}
              accentColor="orange"
            />

            <SingleSelect
              label="Are you currently doing any marketing?"
              name="currentlyDoingMarketing"
              value={formData.currentlyDoingMarketing}
              onChange={(v) => updateField('currentlyDoingMarketing', v)}
              options={MARKETING_STATUS_OPTIONS}
              required
              error={errors.currentlyDoingMarketing}
              columns={2}
              accentColor="orange"
            />

            {formData.currentlyDoingMarketing && formData.currentlyDoingMarketing !== 'no' && (
              <div className="space-y-4 p-4 bg-slate-800/30 border border-white/5 rounded-xl">
                <p className="text-sm text-orange-400 font-medium">Help us understand your current efforts</p>
                <Textarea
                  label="What has worked well?"
                  name="whatWorked"
                  value={formData.whatWorked}
                  onChange={(v) => updateField('whatWorked', v)}
                  placeholder="Share any marketing wins, successful campaigns, or channels that performed well..."
                  required
                  error={errors.whatWorked}
                  rows={3}
                />
                <Textarea
                  label="What hasn't worked or needs improvement?"
                  name="whatDidntWork"
                  value={formData.whatDidntWork}
                  onChange={(v) => updateField('whatDidntWork', v)}
                  placeholder="Channels that underperformed, wasted budget, poor results..."
                  required
                  error={errors.whatDidntWork}
                  rows={3}
                />
              </div>
            )}

            <FormButtons
              onBack={handleBack}
              onNext={handleNext}
              nextLabel="Continue to Audience"
              accentColor="orange"
            />
          </div>
        </FormCard>
      )}

      {/* ============================================ */}
      {/* STEP 3 — TARGET AUDIENCE */}
      {/* ============================================ */}
      {step === 3 && (
        <FormCard
          title="Target Audience"
          description="Tell us about the customers you want to reach"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        >
          <div className="space-y-6">
            <Textarea
              label="Describe your ideal customer"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={(v) => updateField('targetAudience', v)}
              placeholder="Who is your ideal customer? What are their needs, demographics, and pain points?"
              required
              error={errors.targetAudience}
              rows={4}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SingleSelect
                label="Target Age Group"
                name="ageGroup"
                value={formData.ageGroup}
                onChange={(v) => updateField('ageGroup', v)}
                options={AGE_GROUP_OPTIONS}
                required
                error={errors.ageGroup}
                columns={1}
                size="sm"
                accentColor="orange"
              />
              <SingleSelect
                label="Geographic Target"
                name="geographicTarget"
                value={formData.geographicTarget}
                onChange={(v) => updateField('geographicTarget', v)}
                options={GEOGRAPHIC_OPTIONS}
                required
                error={errors.geographicTarget}
                columns={1}
                size="sm"
                accentColor="orange"
              />
            </div>

            <Textarea
              label="Top Competitors"
              name="topCompetitors"
              value={formData.topCompetitors}
              onChange={(v) => updateField('topCompetitors', v)}
              placeholder="List your main competitors (names, websites, or what they do well)..."
              rows={3}
            />

            <Textarea
              label="What makes you unique? (USP)"
              name="usp"
              value={formData.usp}
              onChange={(v) => updateField('usp', v)}
              placeholder="What sets your business apart from the competition?"
              rows={3}
            />

            {/* Healthcare-specific fields */}
            {isHealthcare && (
              <div className="space-y-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                <p className="text-sm text-orange-400 font-medium">Healthcare-Specific Details</p>
                <TextInput
                  label="Monthly Patient Volume"
                  name="patientVolume"
                  value={formData.patientVolume}
                  onChange={(v) => updateField('patientVolume', v)}
                  placeholder="e.g., 200 patients/month"
                  required
                  error={errors.patientVolume}
                />
                <Textarea
                  label="Specializations / Departments"
                  name="specializations"
                  value={formData.specializations}
                  onChange={(v) => updateField('specializations', v)}
                  placeholder="e.g., Orthopedics, Cardiology, General Surgery..."
                  rows={3}
                />
              </div>
            )}

            <FormButtons
              onBack={handleBack}
              onNext={handleNext}
              nextLabel="Continue to Budget"
              accentColor="orange"
            />
          </div>
        </FormCard>
      )}

      {/* ============================================ */}
      {/* STEP 4 — BUDGET & TIMELINE */}
      {/* ============================================ */}
      {step === 4 && (
        <FormCard
          title="Budget & Timeline"
          description="Help us understand your investment comfort and urgency"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        >
          <div className="space-y-6">
            <SingleSelect
              label="Monthly Retainer Budget"
              name="retainerBudget"
              value={formData.retainerBudget}
              onChange={(v) => updateField('retainerBudget', v)}
              options={getRetainerOptions(formData.clientTier)}
              required
              error={errors.retainerBudget}
              columns={2}
              accentColor="orange"
            />

            {needsAdBudget && (
              <SingleSelect
                label="Monthly Ad Spend Budget"
                name="adBudget"
                value={formData.adBudget}
                onChange={(v) => updateField('adBudget', v)}
                options={getAdBudgetOptions(formData.clientTier)}
                required
                error={errors.adBudget}
                columns={2}
                accentColor="orange"
              />
            )}

            <SingleSelect
              label="When do you want to get started?"
              name="timeline"
              value={formData.timeline}
              onChange={(v) => updateField('timeline', v)}
              options={TIMELINE_OPTIONS}
              required
              error={errors.timeline}
              columns={3}
              size="sm"
              accentColor="orange"
            />

            <SingleSelect
              label="Contract Preference"
              name="contractPreference"
              value={formData.contractPreference}
              onChange={(v) => updateField('contractPreference', v)}
              options={CONTRACT_OPTIONS}
              required
              error={errors.contractPreference}
              columns={4}
              size="sm"
              accentColor="orange"
            />

            <TextInput
              label="Preferred Start Date"
              name="expectedStartDate"
              value={formData.expectedStartDate}
              onChange={(v) => updateField('expectedStartDate', v)}
              type="date"
              helper="Optional - leave blank if flexible"
            />

            <FormButtons
              onBack={handleBack}
              onNext={handleNext}
              nextLabel="Continue to Goals"
              accentColor="orange"
            />
          </div>
        </FormCard>
      )}

      {/* ============================================ */}
      {/* STEP 5 — GOALS */}
      {/* ============================================ */}
      {step === 5 && (
        <FormCard
          title="Goals & Expectations"
          description="What does success look like for your business?"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        >
          <div className="space-y-6">
            <MultiSelect
              label="Primary Goals"
              name="primaryGoals"
              value={formData.primaryGoals}
              onChange={(v) => updateField('primaryGoals', v)}
              options={GOALS_OPTIONS}
              required
              error={errors.primaryGoals}
              columns={2}
              min={1}
              accentColor="orange"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Monthly Lead Target"
                name="monthlyLeadTarget"
                value={formData.monthlyLeadTarget}
                onChange={(v) => updateField('monthlyLeadTarget', v)}
                placeholder="e.g., 50"
                type="number"
                helper="How many leads do you want per month?"
              />
              <TextInput
                label="Current Monthly Leads"
                name="currentMonthlyLeads"
                value={formData.currentMonthlyLeads}
                onChange={(v) => updateField('currentMonthlyLeads', v)}
                placeholder="e.g., 10"
                type="number"
                helper="How many leads do you currently get?"
              />
            </div>

            <Textarea
              label="How will you measure success?"
              name="successMetrics"
              value={formData.successMetrics}
              onChange={(v) => updateField('successMetrics', v)}
              placeholder="What KPIs or outcomes would make this engagement a success for you?"
              rows={3}
            />

            <Textarea
              label="What is your biggest marketing challenge right now?"
              name="biggestChallenge"
              value={formData.biggestChallenge}
              onChange={(v) => updateField('biggestChallenge', v)}
              placeholder="What's the main thing holding your business back from growing?"
              required
              error={errors.biggestChallenge}
              rows={3}
            />

            <FormButtons
              onBack={handleBack}
              onNext={handleNext}
              nextLabel="Review & Submit"
              accentColor="orange"
            />
          </div>
        </FormCard>
      )}

      {/* ============================================ */}
      {/* STEP 6 — REVIEW & SUBMIT */}
      {/* ============================================ */}
      {step === 6 && (
        <FormCard
          title="Review & Submit"
          description="Almost done! Review your details and submit"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        >
          <div className="space-y-6">
            <SingleSelect
              label="Best time for a call?"
              name="preferredCallTime"
              value={formData.preferredCallTime}
              onChange={(v) => updateField('preferredCallTime', v)}
              options={CALL_TIME_OPTIONS}
              required
              error={errors.preferredCallTime}
              columns={4}
              size="sm"
              accentColor="orange"
            />

            <Textarea
              label="Anything else we should know?"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={(v) => updateField('additionalInfo', v)}
              placeholder="Any additional context, specific requirements, or questions for our team..."
              rows={4}
            />

            {/* Summary Card */}
            <div className="bg-slate-800/30 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 bg-slate-800/50">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Your Submission Summary</h3>
              </div>
              <div className="p-5">
                <div className="space-y-2.5">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="flex justify-between items-start py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-sm text-slate-500 shrink-0">{item.label}</span>
                      <span className="text-sm text-white font-medium text-right ml-4 max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Checkbox
              label={
                <span>
                  I agree to the{' '}
                  <a href="https://brandingpioneers.in/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">
                    Privacy Policy
                  </a>{' '}
                  and consent to Branding Pioneers processing my information to prepare a proposal.
                </span>
              }
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={(v) => updateField('privacyConsent', v)}
              required
              error={errors.privacyConsent}
              accentColor="orange"
            />

            <FormButtons
              onBack={handleBack}
              onSubmit={handleSubmit}
              submitLabel="Submit RFP"
              loading={submitting}
              disabled={!formData.privacyConsent}
              accentColor="orange"
            />
          </div>
        </FormCard>
      )}
    </FormLayout>
  )
}

// ============================================
// PAGE WITH SUSPENSE
// ============================================

export default function RFPTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <RFPForm />
    </Suspense>
  )
}
