'use client'

// Embeddable RFP form (minimal UI for iframes)
// Usage: <iframe src="https://app.brandingpioneers.in/embed/rfp" />
// Params: ?theme=dark|light

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FormLayout,
  FormCard,
  TextInput,
  Textarea,
  SingleSelect,
  MultiSelect,
  FormButtons,
  Checkbox,
  SuccessScreen,
  type FormTheme,
} from '@/client/components/forms/FormComponents'

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { value: 'ecommerce', label: 'E-commerce', emoji: '🛒' },
  { value: 'education', label: 'Education', emoji: '🎓' },
  { value: 'real_estate', label: 'Real Estate', emoji: '🏠' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'technology', label: 'Technology', emoji: '💻' },
  { value: 'other', label: 'Other', emoji: '📦' },
]

const SERVICES = [
  { value: 'website', label: 'Website', emoji: '🌐' },
  { value: 'seo', label: 'SEO', emoji: '🔍' },
  { value: 'social_media', label: 'Social Media', emoji: '📱' },
  { value: 'paid_ads', label: 'Paid Ads', emoji: '📈' },
  { value: 'content', label: 'Content', emoji: '✍️' },
  { value: 'branding', label: 'Branding', emoji: '🎨' },
]

const BUDGETS = [
  { value: 'under_50k', label: 'Under ₹50K' },
  { value: '50k_1l', label: '₹50K - 1L' },
  { value: '1l_3l', label: '₹1L - 3L' },
  { value: '3l_plus', label: '₹3L+' },
  { value: 'flexible', label: 'Flexible' },
]

export default function EmbedRFPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1120]" />}>
      <EmbedRFPContent />
    </Suspense>
  )
}

function EmbedRFPContent() {
  const searchParams = useSearchParams()
  const themeParam = searchParams.get('theme') as FormTheme | null
  const theme: FormTheme = themeParam === 'light' ? 'light' : 'embed'

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    servicesNeeded: [] as string[],
    budget: '',
    projectDescription: '',
    privacyAccepted: false,
  })

  // Send height to parent for auto-resize
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight
      window.parent?.postMessage({ type: 'EMBED_RESIZE', height }, process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
    }
    sendHeight()
    const observer = new ResizeObserver(sendHeight)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [step, success])

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    if (step === 1) return form.companyName && form.contactName && form.email && form.phone
    if (step === 2) return form.servicesNeeded.length > 0 && form.budget && form.privacyAccepted
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rfp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'embed' }),
      })

      if (res.ok) {
        setSuccess(true)
        window.parent?.postMessage({ type: 'RFP_FORM_SUBMITTED', data: form }, process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Request Received!</h2>
          <p className="text-slate-400">Our team will review your requirements and get back to you within 24-48 hours.</p>
        </div>
      </div>
    )
  }

  return (
    <FormLayout
      title="Request a Proposal"
      subtitle="Branding Pioneers"
      step={step}
      totalSteps={2}
      theme={theme}
      brandColor="indigo"
      showHeader={false}
      showFooter={false}
    >
      {step === 1 && (
        <FormCard title="Request a Proposal" description="Tell us about your business">
          <div className="space-y-4">
            <TextInput
              label="Company Name"
              name="companyName"
              value={form.companyName}
              onChange={v => updateField('companyName', v)}
              placeholder="Your company name"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Your Name"
                name="contactName"
                value={form.contactName}
                onChange={v => updateField('contactName', v)}
                placeholder="Full name"
                required
              />
              <TextInput
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={v => updateField('phone', v)}
                type="tel"
                placeholder="+91 98765 43210"
                required
              />
            </div>
            <TextInput
              label="Email"
              name="email"
              value={form.email}
              onChange={v => updateField('email', v)}
              type="email"
              placeholder="email@company.com"
              required
            />
            <SingleSelect
              label="Industry"
              name="industry"
              value={form.industry}
              onChange={v => updateField('industry', v)}
              options={INDUSTRIES}
              columns={4}
              size="sm"
            />
          </div>
          <FormButtons
            onNext={() => setStep(2)}
            disabled={!canProceed()}
            showBack={false}
            accentColor="indigo"
          />
        </FormCard>
      )}

      {step === 2 && (
        <FormCard title="Your Requirements" description="What services do you need?">
          <div className="space-y-4">
            <MultiSelect
              label="Services Needed"
              name="servicesNeeded"
              value={form.servicesNeeded}
              onChange={v => updateField('servicesNeeded', v)}
              options={SERVICES}
              columns={3}
              required
            />
            <SingleSelect
              label="Budget Range"
              name="budget"
              value={form.budget}
              onChange={v => updateField('budget', v)}
              options={BUDGETS}
              columns={5}
              size="sm"
              required
            />
            <Textarea
              label="Project Description"
              name="projectDescription"
              value={form.projectDescription}
              onChange={v => updateField('projectDescription', v)}
              placeholder="Tell us about your project..."
              rows={3}
            />
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
              <Checkbox
                label="I agree to be contacted regarding this inquiry"
                name="privacyAccepted"
                checked={form.privacyAccepted}
                onChange={v => updateField('privacyAccepted', v)}
                required
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>
          <FormButtons
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            submitLabel="Submit Request"
            disabled={!canProceed()}
            loading={loading}
            accentColor="indigo"
          />
        </FormCard>
      )}
    </FormLayout>
  )
}
