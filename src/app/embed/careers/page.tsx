'use client'

// Embeddable version of the Careers form (no header/footer)
// Usage: <iframe src="https://app.brandingpioneers.in/embed/careers" />

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import {
  FormCard,
  TextInput,
  Textarea,
  SingleSelect,
  MultiSelect,
  DropdownSelect,
  FormButtons,
  Checkbox,
} from '@/client/components/forms/FormComponents'

// Import same constants from careers page
const DEPARTMENTS = [
  { value: 'WEB', label: 'Web Development', description: 'Build websites & apps', emoji: '💻' },
  { value: 'SOCIAL', label: 'Social Media', description: 'Content & community', emoji: '📱' },
  { value: 'ADS', label: 'Performance Ads', description: 'Google & Meta Ads', emoji: '📈' },
  { value: 'SEO', label: 'SEO', description: 'Search optimization', emoji: '🔍' },
  { value: 'SALES', label: 'Sales & BD', description: 'Business development', emoji: '🤝' },
  { value: 'DESIGN', label: 'Design', description: 'Visual & UI/UX', emoji: '🎨' },
]

const POSITIONS: Record<string, { value: string; label: string }[]> = {
  'WEB': [
    { value: 'web_developer', label: 'Web Developer' },
    { value: 'frontend_developer', label: 'Frontend Developer' },
    { value: 'fullstack_developer', label: 'Full Stack Developer' },
  ],
  'SOCIAL': [
    { value: 'social_media_manager', label: 'Social Media Manager' },
    { value: 'content_writer', label: 'Content Writer' },
  ],
  'ADS': [
    { value: 'google_ads_specialist', label: 'Google Ads Specialist' },
    { value: 'meta_ads_specialist', label: 'Meta Ads Specialist' },
  ],
  'SEO': [
    { value: 'seo_executive', label: 'SEO Executive' },
    { value: 'seo_analyst', label: 'SEO Analyst' },
  ],
  'SALES': [
    { value: 'sales_executive', label: 'Sales Executive' },
    { value: 'bd_manager', label: 'Business Development Manager' },
  ],
  'DESIGN': [
    { value: 'graphic_designer', label: 'Graphic Designer' },
    { value: 'motion_designer', label: 'Motion Graphics Designer' },
  ],
}

const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher', emoji: '🌱' },
  { value: 'junior', label: '1-2 yrs', emoji: '📗' },
  { value: 'mid', label: '2-4 yrs', emoji: '📘' },
  { value: 'senior', label: '4+ yrs', emoji: '📙' },
]

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time', emoji: '💼' },
  { value: 'internship', label: 'Internship', emoji: '🎓' },
]

function EmbedCareersContent() {
  const searchParams = useSearchParams()
  const prefilledDept = searchParams.get('dept')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: prefilledDept || '',
    position: '',
    employmentType: '',
    experienceLevel: '',
    expectedSalary: '',
    resumeUrl: '',
    linkedIn: '',
    whyJoin: '',
    privacyAccepted: false,
  })

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    if (step === 1) return form.name && form.email && form.phone && form.department && form.position
    if (step === 2) return form.experienceLevel && form.privacyAccepted
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'website' }),
      })

      if (res.ok) {
        setSuccess(true)
        // Notify parent window
        window.parent?.postMessage({ type: 'CAREER_FORM_SUBMITTED', data: form }, process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl shadow-none p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-300">Thank you for applying. We&apos;ll review your application and get back to you soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-slate-200">Step {step} of 2</span>
            <span className="text-blue-400">{step === 1 ? 'Basic Info' : 'Experience'}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all" style={{ width: `${step * 50}%` }} />
          </div>
        </div>

        {step === 1 && (
          <FormCard title="Apply Now" description="Join our growing team">
            <div className="space-y-4">
              <TextInput label="Full Name" name="name" value={form.name} onChange={v => updateField('name', v)} required />
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Email" name="email" value={form.email} onChange={v => updateField('email', v)} type="email" required />
                <TextInput label="Phone" name="phone" value={form.phone} onChange={v => updateField('phone', v)} type="tel" required />
              </div>
              <SingleSelect label="Department" name="department" value={form.department} onChange={v => { updateField('department', v); updateField('position', '') }} options={DEPARTMENTS} columns={3} size="sm" required />
              {form.department && POSITIONS[form.department] && (
                <DropdownSelect label="Position" name="position" value={form.position} onChange={v => updateField('position', v)} options={POSITIONS[form.department]} placeholder="Select position" required />
              )}
              <SingleSelect label="Type" name="employmentType" value={form.employmentType} onChange={v => updateField('employmentType', v)} options={EMPLOYMENT_TYPES} columns={2} size="sm" />
            </div>
            <div className="mt-6">
              <FormButtons onNext={() => setStep(2)} disabled={!canProceed()} showBack={false} />
            </div>
          </FormCard>
        )}

        {step === 2 && (
          <FormCard title="Your Experience" description="Tell us about your background">
            <div className="space-y-4">
              <SingleSelect label="Experience Level" name="experienceLevel" value={form.experienceLevel} onChange={v => updateField('experienceLevel', v)} options={EXPERIENCE_LEVELS} columns={4} size="sm" required />
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Expected Salary" name="expectedSalary" value={form.expectedSalary} onChange={v => updateField('expectedSalary', v)} placeholder="e.g., 5 LPA" />
                <TextInput label="LinkedIn" name="linkedIn" value={form.linkedIn} onChange={v => updateField('linkedIn', v)} type="url" placeholder="Profile URL" />
              </div>
              <TextInput label="Resume Link" name="resumeUrl" value={form.resumeUrl} onChange={v => updateField('resumeUrl', v)} type="url" placeholder="Google Drive link" />
              <Textarea label="Why do you want to join?" name="whyJoin" value={form.whyJoin} onChange={v => updateField('whyJoin', v)} rows={2} />
              <Checkbox label="I agree to the privacy policy" name="privacyAccepted" checked={form.privacyAccepted} onChange={v => updateField('privacyAccepted', v)} required />
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
            <div className="mt-6">
              <FormButtons onBack={() => setStep(1)} onSubmit={handleSubmit} submitLabel="Submit Application" disabled={!canProceed()} loading={loading} />
            </div>
          </FormCard>
        )}
      </div>
    </div>
  )
}

export default function EmbedCareersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <EmbedCareersContent />
    </Suspense>
  )
}
