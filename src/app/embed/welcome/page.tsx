'use client'

// Embeddable Client Onboarding form (no header/footer)
// Usage: <iframe src="https://app.brandingpioneers.in/embed/welcome" />

import { useState } from 'react'
import {
  FormCard,
  TextInput,
  SingleSelect,
  MultiSelect,
  FormButtons,
  Checkbox,
} from '@/client/components/forms/FormComponents'

const INDUSTRIES = [
  { value: 'hospital', label: 'Hospital', emoji: '🏥' },
  { value: 'clinic', label: 'Clinic', emoji: '🩺' },
  { value: 'dental', label: 'Dental', emoji: '🦷' },
  { value: 'wellness', label: 'Wellness', emoji: '🧘' },
  { value: 'other', label: 'Other', emoji: '🏢' },
]

const SERVICES = [
  { value: 'seo', label: 'SEO', emoji: '🔍' },
  { value: 'social', label: 'Social Media', emoji: '📱' },
  { value: 'ads', label: 'Paid Ads', emoji: '📈' },
  { value: 'web', label: 'Website', emoji: '🌐' },
  { value: 'content', label: 'Content', emoji: '✍️' },
  { value: 'video', label: 'Video', emoji: '🎬' },
]

const INVOLVEMENT = [
  { value: 'hands_off', label: 'Hands-Off', emoji: '🙌' },
  { value: 'collaborative', label: 'Collaborative', emoji: '🤝' },
  { value: 'hands_on', label: 'Hands-On', emoji: '✋' },
]

export default function EmbedWelcomePage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    industry: '',
    services: [] as string[],
    involvement: '',
    termsAccepted: false,
  })

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    if (step === 1) return form.businessName && form.contactName && form.contactEmail && form.contactPhone && form.industry
    if (step === 2) return form.services.length > 0 && form.termsAccepted
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/client-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(true)
        window.parent?.postMessage({ type: 'CLIENT_ONBOARDING_SUBMITTED', data: form }, process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl shadow-none p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h2>
          <p className="text-slate-300">Your account manager will reach out within 24 hours to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-slate-200">Step {step} of 2</span>
            <span className="text-purple-400">{step === 1 ? 'About You' : 'Services'}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${step * 50}%` }} />
          </div>
        </div>

        {step === 1 && (
          <FormCard title="Welcome to Branding Pioneers" description="Tell us about your business">
            <div className="space-y-4">
              <TextInput label="Business Name" name="businessName" value={form.businessName} onChange={v => updateField('businessName', v)} required />
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Your Name" name="contactName" value={form.contactName} onChange={v => updateField('contactName', v)} required />
                <TextInput label="Phone" name="contactPhone" value={form.contactPhone} onChange={v => updateField('contactPhone', v)} type="tel" required />
              </div>
              <TextInput label="Email" name="contactEmail" value={form.contactEmail} onChange={v => updateField('contactEmail', v)} type="email" required />
              <SingleSelect label="Industry" name="industry" value={form.industry} onChange={v => updateField('industry', v)} options={INDUSTRIES} columns={5} size="sm" required />
            </div>
            <div className="mt-6">
              <FormButtons onNext={() => setStep(2)} disabled={!canProceed()} showBack={false} />
            </div>
          </FormCard>
        )}

        {step === 2 && (
          <FormCard title="Select Your Services" description="What do you need help with?">
            <div className="space-y-4">
              <MultiSelect label="Services" name="services" value={form.services} onChange={v => updateField('services', v)} options={SERVICES} columns={3} required />
              <SingleSelect label="How involved do you want to be?" name="involvement" value={form.involvement} onChange={v => updateField('involvement', v)} options={INVOLVEMENT} columns={3} size="sm" />
              <Checkbox label="I agree to work with Branding Pioneers based on my selected preferences" name="termsAccepted" checked={form.termsAccepted} onChange={v => updateField('termsAccepted', v)} required />
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
            <div className="mt-6">
              <FormButtons onBack={() => setStep(1)} onSubmit={handleSubmit} submitLabel="Get Started" disabled={!canProceed()} loading={loading} />
            </div>
          </FormCard>
        )}
      </div>
    </div>
  )
}
