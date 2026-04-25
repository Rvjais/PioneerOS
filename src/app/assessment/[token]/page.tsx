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

const TOTAL_STEPS = 8

const EXPERIENCE_OPTIONS = [
  { value: '0-1', label: '0-1 years' },
  { value: '1-2', label: '1-2 years' },
  { value: '2-3', label: '2-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-8', label: '5-8 years' },
  { value: '8+', label: '8+ years' },
]

const NOTICE_PERIOD_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '15_days', label: '15 Days' },
  { value: '30_days', label: '30 Days' },
  { value: '60_days', label: '60 Days' },
  { value: '90_days', label: '90 Days' },
]

const PRIMARY_SKILLS_OPTIONS = [
  { value: 'seo', label: 'SEO' },
  { value: 'sem', label: 'SEM / Google Ads' },
  { value: 'social_media', label: 'Social Media Marketing' },
  { value: 'content_marketing', label: 'Content Marketing' },
  { value: 'email_marketing', label: 'Email Marketing' },
  { value: 'copywriting', label: 'Copywriting' },
  { value: 'graphic_design', label: 'Graphic Design' },
  { value: 'video_editing', label: 'Video Editing' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'analytics', label: 'Analytics & Reporting' },
  { value: 'branding', label: 'Branding & Strategy' },
  { value: 'performance_marketing', label: 'Performance Marketing' },
  { value: 'influencer_marketing', label: 'Influencer Marketing' },
  { value: 'ui_ux', label: 'UI/UX Design' },
  { value: 'ppc', label: 'PPC Management' },
  { value: 'affiliate_marketing', label: 'Affiliate Marketing' },
  { value: 'crm', label: 'CRM Management' },
  { value: 'pr', label: 'Public Relations' },
  { value: 'other', label: 'Other' },
]

const TOOLS_OPTIONS = [
  { value: 'canva', label: 'Canva' },
  { value: 'figma', label: 'Figma' },
  { value: 'photoshop', label: 'Photoshop' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta_business_suite', label: 'Meta Business Suite' },
  { value: 'semrush', label: 'SEMrush' },
  { value: 'ahrefs', label: 'Ahrefs' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'vs_code', label: 'VS Code' },
  { value: 'google_analytics', label: 'Google Analytics' },
  { value: 'mailchimp', label: 'Mailchimp' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'premiere_pro', label: 'Premiere Pro' },
  { value: 'after_effects', label: 'After Effects' },
  { value: 'illustrator', label: 'Illustrator' },
  { value: 'notion', label: 'Notion' },
  { value: 'slack', label: 'Slack' },
]

const LANGUAGES_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'other', label: 'Other' },
]

const JOIN_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'within_1_week', label: 'Within 1 week' },
  { value: 'within_2_weeks', label: 'Within 2 weeks' },
  { value: 'within_1_month', label: 'Within 1 month' },
  { value: 'negotiable', label: 'Negotiable' },
]

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const WORK_PREFERENCE_OPTIONS = [
  { value: 'solo', label: 'Solo' },
  { value: 'collaborative', label: 'Collaborative' },
  { value: 'both', label: 'Both' },
]

const CALL_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning (10 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 3 PM)' },
  { value: 'evening', label: 'Evening (3 PM - 6 PM)' },
]

const SCALE_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}))

const STRENGTHS_OPTIONS = [
  { value: 'communication', label: 'Communication' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'time_management', label: 'Time Management' },
  { value: 'teamwork', label: 'Teamwork' },
  { value: 'adaptability', label: 'Adaptability' },
  { value: 'attention_to_detail', label: 'Attention to Detail' },
  { value: 'analytical_thinking', label: 'Analytical Thinking' },
  { value: 'self_motivation', label: 'Self Motivation' },
  { value: 'technical_skills', label: 'Technical Skills' },
  { value: 'client_management', label: 'Client Management' },
]

const IMPROVEMENT_OPTIONS = [
  { value: 'public_speaking', label: 'Public Speaking' },
  { value: 'delegation', label: 'Delegation' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'technical_skills', label: 'Technical Skills' },
  { value: 'time_management', label: 'Time Management' },
  { value: 'networking', label: 'Networking' },
  { value: 'writing', label: 'Writing' },
  { value: 'patience', label: 'Patience' },
  { value: 'strategic_thinking', label: 'Strategic Thinking' },
  { value: 'conflict_resolution', label: 'Conflict Resolution' },
]

// ============================================
// FORM DATA INTERFACE
// ============================================

interface FormData {
  // Step 1 - Personal Details
  fullName: string
  email: string
  phone: string
  currentCity: string
  dateOfBirth: string
  linkedinUrl: string
  portfolioUrl: string
  resumeUrl: string

  // Step 2 - Professional Background
  totalExperience: string
  currentCompany: string
  currentRole: string
  currentSalary: string
  expectedSalary: string
  noticePeriod: string
  reasonForLeaving: string

  // Step 3 - Skills & Expertise
  primarySkills: string[]
  tools: string[]
  certifications: string
  languages: string[]

  // Step 4 - Office & Availability
  canWorkFromOffice: string
  commuteDetails: string
  distanceFromOffice: string
  howSoonCanJoin: string
  readyForTrial: string
  trialStartDate: string

  // Step 5 - Healthcare Experience
  healthcareExperience: string
  healthcareProjects: string
  healthcareClients: string

  // Step 6 - Work Samples
  workSample1: string
  workSample2: string
  workSample3: string
  workSample4: string
  workSample5: string
  caseStudyUrl: string
  profileUrl: string

  // Step 7 - Screening Questions
  whyInterested: string
  biggestAchievement: string
  challengingSituation: string
  workPreference: string
  stayUpdated: string
  salaryNegotiable: string
  availableForCall: string
  preferredCallTime: string

  // Step 8 - Self Assessment & Final
  selfRelevanceScore: string
  topStrengths: string[]
  areasToImprove: string[]
  ref1Name: string
  ref1Company: string
  ref1Phone: string
  ref2Name: string
  ref2Company: string
  ref2Phone: string
  additionalInfo: string
  questionsForUs: string
  privacyConsent: boolean
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  currentCity: '',
  dateOfBirth: '',
  linkedinUrl: '',
  portfolioUrl: '',
  resumeUrl: '',
  totalExperience: '',
  currentCompany: '',
  currentRole: '',
  currentSalary: '',
  expectedSalary: '',
  noticePeriod: '',
  reasonForLeaving: '',
  primarySkills: [],
  tools: [],
  certifications: '',
  languages: [],
  canWorkFromOffice: '',
  commuteDetails: '',
  distanceFromOffice: '',
  howSoonCanJoin: '',
  readyForTrial: '',
  trialStartDate: '',
  healthcareExperience: '',
  healthcareProjects: '',
  healthcareClients: '',
  workSample1: '',
  workSample2: '',
  workSample3: '',
  workSample4: '',
  workSample5: '',
  caseStudyUrl: '',
  profileUrl: '',
  whyInterested: '',
  biggestAchievement: '',
  challengingSituation: '',
  workPreference: '',
  stayUpdated: '',
  salaryNegotiable: '',
  availableForCall: '',
  preferredCallTime: '',
  selfRelevanceScore: '',
  topStrengths: [],
  areasToImprove: [],
  ref1Name: '',
  ref1Company: '',
  ref1Phone: '',
  ref2Name: '',
  ref2Company: '',
  ref2Phone: '',
  additionalInfo: '',
  questionsForUs: '',
  privacyConsent: false,
}

// ============================================
// ASSESSMENT FORM COMPONENT
// ============================================

function AssessmentForm() {
  const params = useParams()
  const token = params.token as string

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [assessmentInfo, setAssessmentInfo] = useState<{ position?: string; candidateName?: string } | null>(null)

  // Auto-save to localStorage (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasRestoredRef = useRef(false)

  // Restore from localStorage on mount
  useEffect(() => {
    if (hasRestoredRef.current) return
    hasRestoredRef.current = true
    try {
      const saved = localStorage.getItem(`assessment-${token}`)
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
        localStorage.setItem(`assessment-${token}`, JSON.stringify(formData))
      } catch {
        // Ignore storage errors
      }
    }, 500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [formData, token])

  // Fetch assessment data on mount
  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await fetch(`/api/hr/assessment/${token}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (res.status === 404) {
            setFetchError('Assessment not found. Please check your link and try again.')
          } else if (res.status === 410 || data?.error?.includes('completed')) {
            setFetchError('This assessment has already been completed. Thank you for your submission.')
          } else if (data?.error?.includes('expired') || data?.expired) {
            setFetchError('This assessment link has expired. Please contact HR for a new link.')
          } else {
            setFetchError(data?.error || 'Unable to load assessment. Please try again later.')
          }
          return
        }
        const data = await res.json()
        const assessment = data.assessment || data

        setAssessmentInfo({
          position: assessment.position || assessment.jobTitle,
          candidateName: assessment.candidateName || assessment.name,
        })

        setFormData((prev) => ({
          ...prev,
          fullName: assessment.candidateName || assessment.name || '',
          email: assessment.candidateEmail || assessment.email || '',
          phone: assessment.candidatePhone || assessment.phone || '',
        }))
      } catch {
        setFetchError('Network error. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchAssessment()
  }, [token])

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
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

  // Validate per step
  const validateStep = useCallback((currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!formData.currentCity.trim()) newErrors.currentCity = 'Current city is required'
        if (!formData.resumeUrl.trim()) newErrors.resumeUrl = 'Resume/CV link is required'
        break
      case 2:
        if (!formData.totalExperience) newErrors.totalExperience = 'Please select your experience'
        if (!formData.currentRole.trim()) newErrors.currentRole = 'Current role is required'
        if (!formData.expectedSalary.trim()) newErrors.expectedSalary = 'Expected salary is required'
        if (!formData.noticePeriod) newErrors.noticePeriod = 'Please select notice period'
        break
      case 3:
        if (formData.primarySkills.length === 0) newErrors.primarySkills = 'Select at least one skill'
        if (formData.languages.length === 0) newErrors.languages = 'Select at least one language'
        break
      case 4:
        if (!formData.canWorkFromOffice) newErrors.canWorkFromOffice = 'Please select an option'
        if (!formData.howSoonCanJoin) newErrors.howSoonCanJoin = 'Please select when you can join'
        if (!formData.readyForTrial) newErrors.readyForTrial = 'Please select an option'
        break
      case 5:
        if (!formData.healthcareExperience) newErrors.healthcareExperience = 'Please select an option'
        if (formData.healthcareExperience === 'yes' && !formData.healthcareProjects.trim()) {
          newErrors.healthcareProjects = 'Please describe your healthcare projects'
        }
        break
      case 6:
        // Work samples are optional
        break
      case 7:
        if (!formData.whyInterested.trim()) newErrors.whyInterested = 'This field is required'
        if (!formData.biggestAchievement.trim()) newErrors.biggestAchievement = 'This field is required'
        if (!formData.challengingSituation.trim()) newErrors.challengingSituation = 'This field is required'
        if (!formData.workPreference) newErrors.workPreference = 'Please select your preference'
        if (!formData.availableForCall) newErrors.availableForCall = 'Please select an option'
        break
      case 8:
        if (!formData.selfRelevanceScore) newErrors.selfRelevanceScore = 'Please rate yourself'
        if (formData.topStrengths.length === 0) newErrors.topStrengths = 'Select at least one strength'
        if (!formData.privacyConsent) newErrors.privacyConsent = 'You must accept the privacy policy'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

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
      const res = await fetch(`/api/hr/assessment/${token}`, {
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
      try { localStorage.removeItem(`assessment-${token}`) } catch {}

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
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading assessment...</p>
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
          <h1 className="text-2xl font-bold text-white mb-3">Assessment Unavailable</h1>
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
        title="Assessment Submitted!"
        message="Thank you for completing the assessment. Our team will review your responses and get back to you soon."
        details={[
          { label: 'Candidate', value: formData.fullName },
          ...(assessmentInfo?.position ? [{ label: 'Position', value: assessmentInfo.position }] : []),
          { label: 'Submitted', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
        ]}
      />
    )
  }

  // Form steps
  return (
    <FormLayout
      title="Candidate Assessment"
      subtitle="Branding Pioneers - Hiring Assessment"
      step={step}
      totalSteps={TOTAL_STEPS}
      theme="dark"
      brandColor="orange"
    >
      <PageGuide
        title="Candidate Assessment"
        description="Complete this assessment to help us evaluate your fit. Be honest — there are no wrong answers."
        pageKey="assessment-form"
        steps={[
          { label: 'Personal details', description: 'Basic information about you' },
          { label: 'Professional background', description: 'Your work experience and education' },
          { label: 'Skills assessment', description: 'Your core competencies and tools' },
          { label: 'Submit', description: 'Review and submit your assessment' },
        ]}
      />
      {/* Step 1 - Personal Details */}
      {step === 1 && (
        <FormCard
          title="Personal Details"
          description="Let us know more about you"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={(v) => updateField('fullName', v)}
                required
                error={errors.fullName}
                placeholder="Your full name"
              />
              <TextInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(v) => updateField('email', v)}
                required
                error={errors.email}
                placeholder="your@email.com"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(v) => updateField('phone', v)}
                required
                error={errors.phone}
                placeholder="+91 98765 43210"
              />
              <TextInput
                label="Current City"
                name="currentCity"
                value={formData.currentCity}
                onChange={(v) => updateField('currentCity', v)}
                required
                error={errors.currentCity}
                placeholder="e.g. Gurgaon"
              />
            </div>
            <TextInput
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(v) => updateField('dateOfBirth', v)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput
                label="LinkedIn URL"
                name="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={(v) => updateField('linkedinUrl', v)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <TextInput
                label="Portfolio URL"
                name="portfolioUrl"
                type="url"
                value={formData.portfolioUrl}
                onChange={(v) => updateField('portfolioUrl', v)}
                placeholder="https://yourportfolio.com"
              />
            </div>
            <TextInput
              label="Resume/CV URL (Google Drive link)"
              name="resumeUrl"
              type="url"
              value={formData.resumeUrl}
              onChange={(v) => updateField('resumeUrl', v)}
              required
              error={errors.resumeUrl}
              placeholder="https://drive.google.com/..."
              helper="Please share a publicly accessible Google Drive link"
            />
            <FormButtons onNext={handleNext} showBack={false} />
          </div>
        </FormCard>
      )}

      {/* Step 2 - Professional Background */}
      {step === 2 && (
        <FormCard
          title="Professional Background"
          description="Tell us about your work experience"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        >
          <div className="space-y-6">
            <DropdownSelect
              label="Total Years of Experience"
              name="totalExperience"
              value={formData.totalExperience}
              onChange={(v) => updateField('totalExperience', v)}
              options={EXPERIENCE_OPTIONS}
              required
              error={errors.totalExperience}
              placeholder="Select experience range"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput
                label="Current Company"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={(v) => updateField('currentCompany', v)}
                placeholder="Company name (or N/A)"
              />
              <TextInput
                label="Current Role/Designation"
                name="currentRole"
                value={formData.currentRole}
                onChange={(v) => updateField('currentRole', v)}
                required
                error={errors.currentRole}
                placeholder="e.g. Digital Marketing Executive"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TextInput
                label="Current Salary (monthly in \u20B9)"
                name="currentSalary"
                value={formData.currentSalary}
                onChange={(v) => updateField('currentSalary', v)}
                placeholder="e.g. 25000"
              />
              <TextInput
                label="Expected Salary (monthly in \u20B9)"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={(v) => updateField('expectedSalary', v)}
                required
                error={errors.expectedSalary}
                placeholder="e.g. 35000"
              />
            </div>
            <DropdownSelect
              label="Notice Period"
              name="noticePeriod"
              value={formData.noticePeriod}
              onChange={(v) => updateField('noticePeriod', v)}
              options={NOTICE_PERIOD_OPTIONS}
              required
              error={errors.noticePeriod}
              placeholder="Select notice period"
            />
            <Textarea
              label="Reason for leaving current role"
              name="reasonForLeaving"
              value={formData.reasonForLeaving}
              onChange={(v) => updateField('reasonForLeaving', v)}
              placeholder="Why are you looking for a change?"
              rows={3}
            />
            <FormButtons onBack={handleBack} onNext={handleNext} />
          </div>
        </FormCard>
      )}

      {/* Step 3 - Skills & Expertise */}
      {step === 3 && (
        <FormCard
          title="Skills & Expertise"
          description="Highlight your skills and tools proficiency"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        >
          <div className="space-y-6">
            <MultiSelect
              label="Primary Skills"
              name="primarySkills"
              value={formData.primarySkills}
              onChange={(v) => updateField('primarySkills', v)}
              options={PRIMARY_SKILLS_OPTIONS}
              required
              error={errors.primarySkills}
              columns={3}
            />
            <MultiSelect
              label="Tools/Software you use"
              name="tools"
              value={formData.tools}
              onChange={(v) => updateField('tools', v)}
              options={TOOLS_OPTIONS}
              columns={3}
            />
            <Textarea
              label="Certifications"
              name="certifications"
              value={formData.certifications}
              onChange={(v) => updateField('certifications', v)}
              placeholder="List any relevant certifications (e.g. Google Ads Certified, HubSpot Inbound Marketing, etc.)"
              rows={3}
            />
            <MultiSelect
              label="Languages Known"
              name="languages"
              value={formData.languages}
              onChange={(v) => updateField('languages', v)}
              options={LANGUAGES_OPTIONS}
              required
              error={errors.languages}
              columns={4}
            />
            <FormButtons onBack={handleBack} onNext={handleNext} />
          </div>
        </FormCard>
      )}

      {/* Step 4 - Office & Availability */}
      {step === 4 && (
        <FormCard
          title="Office & Availability"
          description="Help us understand your availability and commute preferences"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        >
          <div className="space-y-6">
            <SingleSelect
              label="Can you work from our office at Sector 32, Gurgaon?"
              name="canWorkFromOffice"
              value={formData.canWorkFromOffice}
              onChange={(v) => updateField('canWorkFromOffice', v)}
              options={YES_NO_OPTIONS}
              required
              error={errors.canWorkFromOffice}
              columns={2}
            />
            {formData.canWorkFromOffice === 'yes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TextInput
                  label="How will you commute?"
                  name="commuteDetails"
                  value={formData.commuteDetails}
                  onChange={(v) => updateField('commuteDetails', v)}
                  placeholder="e.g. Metro, Personal vehicle, Cab"
                />
                <TextInput
                  label="Distance from office"
                  name="distanceFromOffice"
                  value={formData.distanceFromOffice}
                  onChange={(v) => updateField('distanceFromOffice', v)}
                  placeholder="e.g. 10 km, 30 minutes"
                />
              </div>
            )}
            <DropdownSelect
              label="How soon can you join?"
              name="howSoonCanJoin"
              value={formData.howSoonCanJoin}
              onChange={(v) => updateField('howSoonCanJoin', v)}
              options={JOIN_OPTIONS}
              required
              error={errors.howSoonCanJoin}
              placeholder="Select joining timeline"
            />
            <SingleSelect
              label="Are you ready for a 1-week paid trial with us?"
              name="readyForTrial"
              value={formData.readyForTrial}
              onChange={(v) => updateField('readyForTrial', v)}
              options={YES_NO_OPTIONS}
              required
              error={errors.readyForTrial}
              columns={2}
            />
            {formData.readyForTrial === 'yes' && (
              <TextInput
                label="When can you start the trial?"
                name="trialStartDate"
                value={formData.trialStartDate}
                onChange={(v) => updateField('trialStartDate', v)}
                placeholder="e.g. Next Monday, After 1 week notice"
              />
            )}
            <FormButtons onBack={handleBack} onNext={handleNext} />
          </div>
        </FormCard>
      )}

      {/* Step 5 - Healthcare Experience */}
      {step === 5 && (
        <FormCard
          title="Healthcare Experience"
          description="Tell us about any healthcare/medical sector experience"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        >
          <div className="space-y-6">
            <SingleSelect
              label="Have you worked in the healthcare/medical sector?"
              name="healthcareExperience"
              value={formData.healthcareExperience}
              onChange={(v) => updateField('healthcareExperience', v)}
              options={YES_NO_OPTIONS}
              required
              error={errors.healthcareExperience}
              columns={2}
            />
            {formData.healthcareExperience === 'yes' && (
              <>
                <Textarea
                  label="Describe your healthcare projects in detail"
                  name="healthcareProjects"
                  value={formData.healthcareProjects}
                  onChange={(v) => updateField('healthcareProjects', v)}
                  required
                  error={errors.healthcareProjects}
                  placeholder="Describe the projects you worked on, your role, strategies used, and outcomes achieved..."
                  rows={6}
                />
                <Textarea
                  label="List healthcare clients/brands you've worked with"
                  name="healthcareClients"
                  value={formData.healthcareClients}
                  onChange={(v) => updateField('healthcareClients', v)}
                  placeholder="e.g. Apollo Hospitals, Max Healthcare, Fortis, etc."
                  rows={3}
                />
              </>
            )}
            <FormButtons onBack={handleBack} onNext={handleNext} />
          </div>
        </FormCard>
      )}

      {/* Step 6 - Work Samples */}
      {step === 6 && (
        <FormCard
          title="Work Samples"
          description="Share links to your best work"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        >
          <div className="space-y-6">
            <p className="text-sm text-slate-400">Share up to 5 links to your best work samples. These can be live projects, campaigns, designs, or any relevant work.</p>
            <TextInput
              label="Work Sample 1"
              name="workSample1"
              type="url"
              value={formData.workSample1}
              onChange={(v) => updateField('workSample1', v)}
              placeholder="https://..."
            />
            <TextInput
              label="Work Sample 2"
              name="workSample2"
              type="url"
              value={formData.workSample2}
              onChange={(v) => updateField('workSample2', v)}
              placeholder="https://..."
            />
            <TextInput
              label="Work Sample 3"
              name="workSample3"
              type="url"
              value={formData.workSample3}
              onChange={(v) => updateField('workSample3', v)}
              placeholder="https://..."
            />
            <TextInput
              label="Work Sample 4"
              name="workSample4"
              type="url"
              value={formData.workSample4}
              onChange={(v) => updateField('workSample4', v)}
              placeholder="https://..."
            />
            <TextInput
              label="Work Sample 5"
              name="workSample5"
              type="url"
              value={formData.workSample5}
              onChange={(v) => updateField('workSample5', v)}
              placeholder="https://..."
            />
            <TextInput
              label="Case Study or Detailed Project URL"
              name="caseStudyUrl"
              type="url"
              value={formData.caseStudyUrl}
              onChange={(v) => updateField('caseStudyUrl', v)}
              placeholder="https://..."
            />
            <TextInput
              label="GitHub / Behance / Dribbble Profile URL"
              name="profileUrl"
              type="url"
              value={formData.profileUrl}
              onChange={(v) => updateField('profileUrl', v)}
              placeholder="https://..."
            />
            <FormButtons onBack={handleBack} onNext={handleNext} />
          </div>
        </FormCard>
      )}

      {/* Step 7 - Screening Questions */}
      {step === 7 && (
        <FormCard
          title="Screening Questions"
          description="Help us understand your motivations and work style"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <div className="space-y-6">
            <Textarea
              label="Why are you interested in this role?"
              name="whyInterested"
              value={formData.whyInterested}
              onChange={(v) => updateField('whyInterested', v)}
              required
              error={errors.whyInterested}
              placeholder="Tell us what excites you about this opportunity..."
              rows={4}
            />
            <Textarea
              label="What's your biggest professional achievement?"
              name="biggestAchievement"
              value={formData.biggestAchievement}
              onChange={(v) => updateField('biggestAchievement', v)}
              required
              error={errors.biggestAchievement}
              placeholder="Describe an achievement you're most proud of..."
              rows={4}
            />
            <Textarea
              label="Describe a challenging situation at work and how you handled it"
              name="challengingSituation"
              value={formData.challengingSituation}
              onChange={(v) => updateField('challengingSituation', v)}
              required
              error={errors.challengingSituation}
              placeholder="Share a specific example..."
              rows={4}
            />
            <SingleSelect
              label="How do you prefer to work?"
              name="workPreference"
              value={formData.workPreference}
              onChange={(v) => updateField('workPreference', v)}
              options={WORK_PREFERENCE_OPTIONS}
              required
              error={errors.workPreference}
              columns={3}
            />
            <Textarea
              label="How do you stay updated with industry trends?"
              name="stayUpdated"
              value={formData.stayUpdated}
              onChange={(v) => updateField('stayUpdated', v)}
              placeholder="Newsletters, blogs, communities, courses, etc."
              rows={3}
            />
            <SingleSelect
              label="Is your expected salary negotiable?"
              name="salaryNegotiable"
              value={formData.salaryNegotiable}
              onChange={(v) => updateField('salaryNegotiable', v)}
              options={YES_NO_OPTIONS}
              columns={2}
            />
            <SingleSelect
              label="Are you available for a phone screening call?"
              name="availableForCall"
              value={formData.availableForCall}
              onChange={(v) => updateField('availableForCall', v)}
              options={YES_NO_OPTIONS}
              required
              error={errors.availableForCall}
              columns={2}
            />
            {formData.availableForCall === 'yes' && (
              <SingleSelect
                label="Preferred call time"
                name="preferredCallTime"
                value={formData.preferredCallTime}
                onChange={(v) => updateField('preferredCallTime', v)}
                options={CALL_TIME_OPTIONS}
                columns={3}
              />
            )}
            <FormButtons onBack={handleBack} onNext={handleNext} />
          </div>
        </FormCard>
      )}

      {/* Step 8 - Self Assessment & Final */}
      {step === 8 && (
        <FormCard
          title="Self Assessment & Final Details"
          description="Almost done! A few final questions"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        >
          <div className="space-y-6">
            <DropdownSelect
              label="On a scale of 1-10, how relevant do you feel for this role?"
              name="selfRelevanceScore"
              value={formData.selfRelevanceScore}
              onChange={(v) => updateField('selfRelevanceScore', v)}
              options={SCALE_OPTIONS}
              required
              error={errors.selfRelevanceScore}
              placeholder="Select a rating"
            />
            <MultiSelect
              label="Your top 3 strengths"
              name="topStrengths"
              value={formData.topStrengths}
              onChange={(v) => updateField('topStrengths', v)}
              options={STRENGTHS_OPTIONS}
              required
              error={errors.topStrengths}
              columns={3}
              max={3}
            />
            <MultiSelect
              label="Areas you'd like to improve"
              name="areasToImprove"
              value={formData.areasToImprove}
              onChange={(v) => updateField('areasToImprove', v)}
              options={IMPROVEMENT_OPTIONS}
              columns={3}
            />

            {/* Professional References */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-200">Professional References</label>
              <div className="p-4 rounded-xl border border-white/10 bg-slate-800/30 space-y-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reference 1</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextInput
                    label="Name"
                    name="ref1Name"
                    value={formData.ref1Name}
                    onChange={(v) => updateField('ref1Name', v)}
                    placeholder="Full name"
                  />
                  <TextInput
                    label="Company"
                    name="ref1Company"
                    value={formData.ref1Company}
                    onChange={(v) => updateField('ref1Company', v)}
                    placeholder="Company name"
                  />
                  <TextInput
                    label="Phone"
                    name="ref1Phone"
                    type="tel"
                    value={formData.ref1Phone}
                    onChange={(v) => updateField('ref1Phone', v)}
                    placeholder="+91 ..."
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-slate-800/30 space-y-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reference 2</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextInput
                    label="Name"
                    name="ref2Name"
                    value={formData.ref2Name}
                    onChange={(v) => updateField('ref2Name', v)}
                    placeholder="Full name"
                  />
                  <TextInput
                    label="Company"
                    name="ref2Company"
                    value={formData.ref2Company}
                    onChange={(v) => updateField('ref2Company', v)}
                    placeholder="Company name"
                  />
                  <TextInput
                    label="Phone"
                    name="ref2Phone"
                    type="tel"
                    value={formData.ref2Phone}
                    onChange={(v) => updateField('ref2Phone', v)}
                    placeholder="+91 ..."
                  />
                </div>
              </div>
            </div>

            <Textarea
              label="Any additional information you'd like to share"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={(v) => updateField('additionalInfo', v)}
              placeholder="Anything else you want us to know..."
              rows={3}
            />
            <Textarea
              label="Questions you have for us"
              name="questionsForUs"
              value={formData.questionsForUs}
              onChange={(v) => updateField('questionsForUs', v)}
              placeholder="Feel free to ask us anything about the role, team, or company..."
              rows={3}
            />
            <Checkbox
              label="I consent to the collection and processing of my personal data for the purpose of this hiring assessment. I understand that my information will be kept confidential and used solely for recruitment purposes."
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={(v) => updateField('privacyConsent', v)}
              required
              error={errors.privacyConsent}
            />
            <FormButtons
              onBack={handleBack}
              onSubmit={handleSubmit}
              loading={submitting}
              submitLabel="Submit Assessment"
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

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <AssessmentForm />
    </Suspense>
  )
}
