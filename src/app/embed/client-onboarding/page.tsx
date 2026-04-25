'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ServiceIcon } from '@/client/components/ui/ServiceIcons'

// ============================================
// CONSTANTS
// ============================================

const INDUSTRIES = [
  { id: 'hospital', label: 'Hospital', icon: 'hospital' },
  { id: 'clinic', label: 'Clinic', icon: 'clinic' },
  { id: 'doctor', label: 'Doctor', icon: 'doctor' },
  { id: 'dental', label: 'Dental', icon: 'dental' },
  { id: 'diagnostics', label: 'Diagnostics', icon: 'diagnostics' },
  { id: 'wellness', label: 'Wellness', icon: 'wellness' },
  { id: 'technology', label: 'Technology', icon: 'technology' },
  { id: 'ecommerce', label: 'E-Commerce', icon: 'ecommerce' },
  { id: 'education', label: 'Education', icon: 'education' },
  { id: 'real_estate', label: 'Real Estate', icon: 'real_estate' },
  { id: 'other', label: 'Other', icon: 'other' },
]

const SERVICES = [
  { id: 'seo', label: 'SEO', icon: 'seo' },
  { id: 'social', label: 'Social Media', icon: 'social' },
  { id: 'ads', label: 'Paid Ads', icon: 'ads' },
  { id: 'web', label: 'Website', icon: 'web' },
  { id: 'content', label: 'Content', icon: 'content' },
  { id: 'video', label: 'Video', icon: 'video' },
  { id: 'design', label: 'Design', icon: 'design' },
  { id: 'gbp', label: 'Google Business', icon: 'gbp' },
]

const AD_BUDGETS = [
  { id: 'under_25k', label: 'Under ₹25K' },
  { id: '25k_50k', label: '₹25K - 50K' },
  { id: '50k_1l', label: '₹50K - 1L' },
  { id: 'above_1l', label: 'Above ₹1L' },
]

// ============================================
// TYPES
// ============================================

interface FormData {
  businessName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  industry: string
  services: string[]
  adBudget: string
  notes: string
  currentStep: number
}

const INITIAL_FORM: FormData = {
  businessName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  industry: '',
  services: [],
  adBudget: '',
  notes: '',
  currentStep: 0,
}

// ============================================
// MAIN COMPONENT (Embed-optimized)
// ============================================

function EmbedClientOnboardingContent() {
  const searchParams = useSearchParams()
  const theme = searchParams.get('theme') || 'dark' // Default to dark
  const primaryColor = searchParams.get('color') || 'indigo' // Default to indigo
  const source = searchParams.get('source') || 'website'

  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Notify parent of height changes
  useEffect(() => {
    const sendHeight = () => {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'RESIZE',
          height: document.body.scrollHeight,
        }, process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
      }
    }
    sendHeight()
    window.addEventListener('resize', sendHeight)
    return () => window.removeEventListener('resize', sendHeight)
  }, [form.currentStep])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('embed_onboarding')
    if (saved) {
      try {
        setForm(JSON.parse(saved))
      } catch {}
    }
  }, [])

  // Save progress
  const saveProgress = useCallback((data: FormData) => {
    localStorage.setItem('embed_onboarding', JSON.stringify(data))
  }, [])

  // Update field
  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      saveProgress(updated)
      return updated
    })
  }, [saveProgress])

  // Toggle array
  const toggleService = useCallback((id: string) => {
    setForm(prev => {
      const updated = prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id]
      const newForm = { ...prev, services: updated }
      saveProgress(newForm)
      return newForm
    })
  }, [saveProgress])

  // Navigation
  const nextStep = () => {
    setForm(prev => {
      const updated = { ...prev, currentStep: prev.currentStep + 1 }
      saveProgress(updated)
      return updated
    })
  }

  const prevStep = () => {
    setForm(prev => {
      const updated = { ...prev, currentStep: Math.max(0, prev.currentStep - 1) }
      saveProgress(updated)
      return updated
    })
  }

  // Validation
  const isStepValid = () => {
    switch (form.currentStep) {
      case 0:
        return !!form.businessName.trim() && !!form.industry
      case 1:
        return (
          !!form.contactName.trim() &&
          !!form.contactEmail.trim() &&
          form.contactEmail.includes('@') &&
          !!form.contactPhone.trim()
        )
      case 2:
        return form.services.length > 0
      default:
        return true
    }
  }

  // Submit
  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/client-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source,
          embeddedForm: true,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.removeItem('embed_onboarding')
        setSubmitted(true)

        // Notify parent
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'FORM_SUBMITTED',
            data: { ...form, leadId: data.leadId },
          }, process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
        }
      }
    } catch (e) {
      console.error('Submit failed', e)
    } finally {
      setSaving(false)
    }
  }

  const TOTAL_STEPS = 4
  const progress = Math.round((form.currentStep / (TOTAL_STEPS - 1)) * 100)

  // Theme colors - default is dark with indigo accent
  const colors = {
    indigo: {
      bg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      bgLight: 'bg-indigo-500/10',
      border: 'border-indigo-500',
      text: 'text-indigo-400',
      ring: 'ring-4 ring-indigo-500/10',
      shadow: 'shadow-lg shadow-indigo-500/25',
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      bgLight: 'bg-blue-500/10',
      border: 'border-blue-500',
      text: 'text-blue-400',
      ring: 'ring-4 ring-blue-500/10',
      shadow: 'shadow-lg shadow-blue-500/25',
    },
    purple: {
      bg: 'bg-gradient-to-r from-purple-600 to-pink-600',
      bgLight: 'bg-purple-500/10',
      border: 'border-purple-500',
      text: 'text-purple-400',
      ring: 'ring-4 ring-purple-500/10',
      shadow: 'shadow-lg shadow-purple-500/25',
    },
    orange: {
      bg: 'bg-gradient-to-r from-orange-600 to-amber-600',
      bgLight: 'bg-orange-500/10',
      border: 'border-orange-500',
      text: 'text-orange-400',
      ring: 'ring-4 ring-orange-500/10',
      shadow: 'shadow-lg shadow-orange-500/25',
    },
  }
  const c = colors[primaryColor as keyof typeof colors] || colors.indigo
  const isDark = theme === 'dark'

  // Success state
  if (submitted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-slate-900 rounded-2xl">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Thank you!</h2>
          <p className="text-slate-400">
            We&apos;ve received your information and will be in touch shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} p-6 rounded-2xl`}>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Step {form.currentStep + 1} of {TOTAL_STEPS}
          </span>
          <span className={c.text}>{progress}%</span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
          <div
            className={`h-full ${c.bg} transition-all duration-500 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 0: Business Info */}
      {form.currentStep === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Tell us about your business
            </h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              We&apos;ll customize our services for you
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Business Name *
            </label>
            <input
              type="text"
              value={form.businessName}
              onChange={e => updateField('businessName', e.target.value)}
              placeholder="Enter your business name"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${
                isDark
                  ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
              autoFocus
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Industry *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => updateField('industry', ind.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    form.industry === ind.id
                      ? `${c.bgLight} ${c.border} ${c.ring}`
                      : isDark
                        ? 'bg-slate-800/30 border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <ServiceIcon icon={ind.icon} className={`w-6 h-6 mx-auto ${form.industry === ind.id ? c.text : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`text-xs ${form.industry === ind.id ? c.text : isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {ind.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Contact Info */}
      {form.currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Your contact details
            </h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              How can we reach you?
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Your Name *
              </label>
              <input
                type="text"
                value={form.contactName}
                onChange={e => updateField('contactName', e.target.value)}
                placeholder="Full name"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${
                  isDark
                    ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
                autoFocus
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Email *
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={e => updateField('contactEmail', e.target.value)}
                placeholder="email@example.com"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${
                  isDark
                    ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={e => updateField('contactPhone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${
                  isDark
                    ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Services */}
      {form.currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              What services interest you?
            </h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Select all that apply
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SERVICES.map(service => (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  form.services.includes(service.id)
                    ? `${c.bgLight} ${c.border} ${c.ring}`
                    : isDark
                      ? 'bg-slate-800/30 border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <ServiceIcon icon={service.icon} className={`w-8 h-8 mx-auto mb-1 ${form.services.includes(service.id) ? c.text : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <span className={`text-sm font-medium ${form.services.includes(service.id) ? c.text : isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {service.label}
                </span>
              </button>
            ))}
          </div>

          {form.services.includes('ads') && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Monthly Ad Budget (optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AD_BUDGETS.map(budget => (
                  <button
                    key={budget.id}
                    onClick={() => updateField('adBudget', budget.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.adBudget === budget.id
                        ? `${c.bgLight} ${c.border} ${c.ring}`
                        : isDark
                          ? 'bg-slate-800/30 border-white/10 hover:border-white/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-sm ${form.adBudget === budget.id ? c.text : isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {budget.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {form.currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Almost done!
            </h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Review your information
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/30 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="space-y-3">
              <SummaryRow label="Business" value={form.businessName} isDark={isDark} />
              <SummaryRow
                label="Industry"
                value={INDUSTRIES.find(i => i.id === form.industry)?.label || '-'}
                isDark={isDark}
              />
              <SummaryRow label="Contact" value={form.contactName} isDark={isDark} />
              <SummaryRow label="Email" value={form.contactEmail} isDark={isDark} />
              <SummaryRow label="Phone" value={form.contactPhone} isDark={isDark} />
              <SummaryRow
                label="Services"
                value={form.services.map(s => SERVICES.find(sv => sv.id === s)?.label).join(', ')}
                isDark={isDark}
              />
              {form.adBudget && (
                <SummaryRow
                  label="Ad Budget"
                  value={AD_BUDGETS.find(b => b.id === form.adBudget)?.label || '-'}
                  isDark={isDark}
                />
              )}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Anything else? (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={e => updateField('notes', e.target.value)}
              placeholder="Tell us more about your requirements..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border-2 resize-none transition-all outline-none ${
                isDark
                  ? 'bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {form.currentStep > 0 ? (
          <button
            onClick={prevStep}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {form.currentStep < TOTAL_STEPS - 1 ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isStepValid()
                ? `${c.bg} text-white ${c.shadow} hover:opacity-90`
                : isDark
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${c.bg} text-white ${c.shadow} hover:opacity-90 disabled:opacity-50`}
          >
            {saving ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>{label}</span>
      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
    </div>
  )
}

export default function EmbedClientOnboarding() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center bg-slate-900 rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <EmbedClientOnboardingContent />
    </Suspense>
  )
}
