'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import { BRAND } from '@/shared/constants/constants'

interface OnboardingData {
  businessName: string
  businessDescription: string
  industry: string
  targetAudience: string
  websiteType: string
  requiredPages: string[]
  features: string[]
  colorPreferences: { primary: string; secondary: string }
  stylePreference: string
  referenceUrls: string[]
  hasLogo: boolean
  hasContent: boolean
  logoUrl: string
  brandGuideUrl: string
  hasDomain: boolean
  domainName: string
  hasHosting: boolean
  hostingProvider: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

const WEBSITE_TYPES = [
  { value: 'ECOMMERCE', label: 'E-commerce', description: 'Online store with product catalog' },
  { value: 'CORPORATE', label: 'Corporate', description: 'Professional business website' },
  { value: 'PORTFOLIO', label: 'Portfolio', description: 'Showcase your work' },
  { value: 'LANDING', label: 'Landing Page', description: 'Single page for campaigns' },
  { value: 'BLOG', label: 'Blog', description: 'Content-focused website' },
  { value: 'CUSTOM', label: 'Custom', description: 'Something unique' },
]

const COMMON_PAGES = ['Home', 'About Us', 'Services', 'Products', 'Contact', 'Blog', 'FAQ', 'Testimonials', 'Team', 'Gallery']

const COMMON_FEATURES = ['Contact Form', 'Live Chat', 'Newsletter Signup', 'Search', 'Social Media Integration', 'Blog/News', 'E-commerce', 'User Accounts', 'Booking/Calendar', 'Maps']

const STYLE_OPTIONS = [
  { value: 'MODERN', label: 'Modern', description: 'Clean, contemporary design' },
  { value: 'MINIMAL', label: 'Minimal', description: 'Simple and elegant' },
  { value: 'BOLD', label: 'Bold', description: 'Strong visuals and colors' },
  { value: 'CLASSIC', label: 'Classic', description: 'Timeless and professional' },
  { value: 'PLAYFUL', label: 'Playful', description: 'Fun and creative' },
]

const INDUSTRIES = ['Technology', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'E-commerce', 'Food & Beverage', 'Fashion', 'Travel', 'Legal', 'Manufacturing', 'Other']

export default function WebOnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params)
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<'loading' | 'pending' | 'submitted' | 'converted' | 'error'>('loading')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    businessDescription: '',
    industry: '',
    targetAudience: '',
    websiteType: '',
    requiredPages: [],
    features: [],
    colorPreferences: { primary: '', secondary: '' },
    stylePreference: '',
    referenceUrls: [],
    hasLogo: false,
    hasContent: false,
    logoUrl: '',
    brandGuideUrl: '',
    hasDomain: false,
    domainName: '',
    hasHosting: false,
    hostingProvider: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  })
  const [referenceUrl, setReferenceUrl] = useState('')

  useEffect(() => {
    fetchOnboarding()
  }, [resolvedParams.token])

  const fetchOnboarding = async () => {
    try {
      const res = await fetch(`/api/web-onboarding/${resolvedParams.token}`)
      const result = await res.json()

      if (result.status === 'SUBMITTED') {
        setStatus('submitted')
      } else if (result.status === 'CONVERTED') {
        setStatus('converted')
      } else if (result.data) {
        setData(prev => ({
          ...prev,
          ...result.data,
          requiredPages: result.data.requiredPages || [],
          features: result.data.features || [],
          referenceUrls: result.data.referenceUrls || [],
          colorPreferences: result.data.colorPreferences || { primary: '', secondary: '' },
        }))
        setStatus('pending')
      } else {
        setStatus('pending')
      }
    } catch (error) {
      console.error('Failed to fetch onboarding:', error)
      setStatus('error')
    }
  }

  const saveDraft = async () => {
    setSaving(true)
    try {
      await fetch(`/api/web-onboarding/${resolvedParams.token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/web-onboarding/${resolvedParams.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setStatus('submitted')
      }
    } catch (error) {
      console.error('Failed to submit:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const nextStep = () => {
    saveDraft()
    setStep(s => Math.min(s + 1, 6))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const addReferenceUrl = () => {
    if (referenceUrl && !data.referenceUrls.includes(referenceUrl)) {
      setData(d => ({ ...d, referenceUrls: [...d.referenceUrls, referenceUrl] }))
      setReferenceUrl('')
    }
  }

  const removeReferenceUrl = (url: string) => {
    setData(d => ({ ...d, referenceUrls: d.referenceUrls.filter(u => u !== url) }))
  }

  const togglePage = (page: string) => {
    setData(d => ({
      ...d,
      requiredPages: d.requiredPages.includes(page)
        ? d.requiredPages.filter(p => p !== page)
        : [...d.requiredPages, page]
    }))
  }

  const toggleFeature = (feature: string) => {
    setData(d => ({
      ...d,
      features: d.features.includes(feature)
        ? d.features.filter(f => f !== feature)
        : [...d.features, feature]
    }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900/40 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-900/40 flex items-center justify-center">
        <div className="glass-card rounded-xl border border-white/10 p-8 max-w-md text-center">
          <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-white">Invalid Link</h2>
          <p className="text-slate-400 mt-2">This onboarding link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  if (status === 'submitted' || status === 'converted') {
    return (
      <div className="min-h-screen bg-slate-900/40 flex items-center justify-center">
        <div className="glass-card rounded-xl border border-white/10 p-8 max-w-md text-center">
          <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-xl font-semibold text-white">
            {status === 'submitted' ? 'Thank You!' : 'Already Completed'}
          </h2>
          <p className="text-slate-400 mt-2">
            {status === 'submitted'
              ? 'Your information has been submitted. Our team will review and contact you shortly.'
              : 'This onboarding form has already been completed.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900/40">
      {/* Header */}
      <header className="glass-card border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden">
              <Image src={BRAND.logo} alt={BRAND.logoAlt} fill sizes="40px" className="object-contain" />
            </div>
            <div>
              <span className="font-semibold text-white">Website Onboarding</span>
              <p className="text-xs text-slate-400">{BRAND.name}</p>
            </div>
          </div>
          {saving && <span className="text-sm text-slate-400">Saving...</span>}
        </div>
      </header>

      {/* Progress */}
      <div className="glass-card border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {['Business', 'Website', 'Design', 'Assets', 'Domain', 'Review'].map((label, i) => (
              <div key={label} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 < step ? 'bg-teal-500 text-white' :
                  i + 1 === step ? 'bg-teal-100 text-teal-600 border-2 border-teal-500' :
                  'bg-slate-800/50 text-slate-400'
                }`}>
                  {i + 1 < step ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                {i < 5 && <div className={`w-12 h-1 mx-1 ${i + 1 < step ? 'bg-teal-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            {['Business', 'Website', 'Design', 'Assets', 'Domain', 'Review'].map(label => (
              <span key={label} className="w-20 text-center">{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Tell us about your business</h2>
              <p className="text-slate-400 mt-1">Help us understand your company and goals</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Business Name *</label>
              <input
                type="text"
                value={data.businessName}
                onChange={e => setData(d => ({ ...d, businessName: e.target.value }))}
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Industry</label>
              <select
                value={data.industry}
                onChange={e => setData(d => ({ ...d, industry: e.target.value }))}
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Business Description</label>
              <textarea
                value={data.businessDescription}
                onChange={e => setData(d => ({ ...d, businessDescription: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="What does your business do? What products or services do you offer?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Target Audience</label>
              <textarea
                value={data.targetAudience}
                onChange={e => setData(d => ({ ...d, targetAudience: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Who are your ideal customers? Age, location, interests..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Website Requirements */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Website Requirements</h2>
              <p className="text-slate-400 mt-1">What kind of website do you need?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">Website Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {WEBSITE_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setData(d => ({ ...d, websiteType: type.value }))}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      data.websiteType === type.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="font-medium text-white">{type.label}</span>
                    <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">Required Pages</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_PAGES.map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => togglePage(page)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      data.requiredPages.includes(page)
                        ? 'bg-teal-100 border-teal-300 text-teal-700'
                        : 'glass-card border-white/10 text-slate-300 hover:bg-slate-900/40'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">Features Needed</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      data.features.includes(feature)
                        ? 'bg-teal-100 border-teal-300 text-teal-700'
                        : 'glass-card border-white/10 text-slate-300 hover:bg-slate-900/40'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Design Preferences */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Design Preferences</h2>
              <p className="text-slate-400 mt-1">Help us understand your visual style</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">Style Preference</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STYLE_OPTIONS.map(style => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setData(d => ({ ...d, stylePreference: style.value }))}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      data.stylePreference === style.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="font-medium text-white">{style.label}</span>
                    <p className="text-xs text-slate-400 mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.colorPreferences.primary || '#000000'}
                    onChange={e => setData(d => ({ ...d, colorPreferences: { ...d.colorPreferences, primary: e.target.value } }))}
                    className="w-10 h-10 rounded border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.colorPreferences.primary}
                    onChange={e => setData(d => ({ ...d, colorPreferences: { ...d.colorPreferences, primary: e.target.value } }))}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.colorPreferences.secondary || '#000000'}
                    onChange={e => setData(d => ({ ...d, colorPreferences: { ...d.colorPreferences, secondary: e.target.value } }))}
                    className="w-10 h-10 rounded border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.colorPreferences.secondary}
                    onChange={e => setData(d => ({ ...d, colorPreferences: { ...d.colorPreferences, secondary: e.target.value } }))}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Reference Websites</label>
              <p className="text-xs text-slate-400 mb-2">Add websites you like as reference</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={e => setReferenceUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 border border-white/10 rounded-lg"
                />
                <button
                  type="button"
                  onClick={addReferenceUrl}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add
                </button>
              </div>
              {data.referenceUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.referenceUrls.map(url => (
                    <span key={url} className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 rounded-full text-sm">
                      {url.replace(/^https?:\/\//, '').substring(0, 30)}
                      <button onClick={() => removeReferenceUrl(url)} className="text-slate-400 hover:text-slate-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Assets */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Content & Assets</h2>
              <p className="text-slate-400 mt-1">What assets do you have ready?</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-card rounded-lg border border-white/10">
                <div>
                  <h3 className="font-medium text-white">Logo</h3>
                  <p className="text-sm text-slate-400">Do you have a company logo?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.hasLogo}
                    onChange={e => setData(d => ({ ...d, hasLogo: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {data.hasLogo && (
                <div className="pl-4 border-l-2 border-teal-200">
                  <label className="block text-sm font-medium text-slate-200 mb-1">Logo URL (optional)</label>
                  <input
                    type="url"
                    value={data.logoUrl}
                    onChange={e => setData(d => ({ ...d, logoUrl: e.target.value }))}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2 border border-white/10 rounded-lg text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1">Link to Google Drive, Dropbox, or direct image URL</p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 glass-card rounded-lg border border-white/10">
                <div>
                  <h3 className="font-medium text-white">Website Content</h3>
                  <p className="text-sm text-slate-400">Do you have text content ready?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.hasContent}
                    onChange={e => setData(d => ({ ...d, hasContent: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Brand Guidelines (optional)</label>
                <input
                  type="url"
                  value={data.brandGuideUrl}
                  onChange={e => setData(d => ({ ...d, brandGuideUrl: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 border border-white/10 rounded-lg text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">If you have brand guidelines, share a link</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Domain & Hosting */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Domain & Hosting</h2>
              <p className="text-slate-400 mt-1">Technical setup information</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-card rounded-lg border border-white/10">
                <div>
                  <h3 className="font-medium text-white">Domain Name</h3>
                  <p className="text-sm text-slate-400">Do you already have a domain?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.hasDomain}
                    onChange={e => setData(d => ({ ...d, hasDomain: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {data.hasDomain && (
                <div className="pl-4 border-l-2 border-teal-200">
                  <label className="block text-sm font-medium text-slate-200 mb-1">Domain Name</label>
                  <input
                    type="text"
                    value={data.domainName}
                    onChange={e => setData(d => ({ ...d, domainName: e.target.value }))}
                    placeholder="example.com"
                    className="w-full px-4 py-2 border border-white/10 rounded-lg text-sm"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 glass-card rounded-lg border border-white/10">
                <div>
                  <h3 className="font-medium text-white">Web Hosting</h3>
                  <p className="text-sm text-slate-400">Do you have hosting set up?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.hasHosting}
                    onChange={e => setData(d => ({ ...d, hasHosting: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {data.hasHosting && (
                <div className="pl-4 border-l-2 border-teal-200">
                  <label className="block text-sm font-medium text-slate-200 mb-1">Hosting Provider</label>
                  <input
                    type="text"
                    value={data.hostingProvider}
                    onChange={e => setData(d => ({ ...d, hostingProvider: e.target.value }))}
                    placeholder="e.g., Hostinger, AWS, DigitalOcean"
                    className="w-full px-4 py-2 border border-white/10 rounded-lg text-sm"
                  />
                </div>
              )}

              {!data.hasDomain && !data.hasHosting && (
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-400">
                      No worries! We can help you set up domain and hosting as part of your project.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Review & Contact */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Review & Submit</h2>
              <p className="text-slate-400 mt-1">Confirm your details and submit</p>
            </div>

            <div className="glass-card rounded-lg border border-white/10 divide-y divide-white/10">
              <div className="p-4">
                <h3 className="font-medium text-white">{data.businessName || 'Business Name'}</h3>
                <p className="text-sm text-slate-400">{data.industry} | {WEBSITE_TYPES.find(t => t.value === data.websiteType)?.label || 'Website Type'}</p>
              </div>
              {data.requiredPages.length > 0 && (
                <div className="p-4">
                  <span className="text-sm text-slate-400">Pages:</span>
                  <p className="text-sm text-white">{data.requiredPages.join(', ')}</p>
                </div>
              )}
              {data.features.length > 0 && (
                <div className="p-4">
                  <span className="text-sm text-slate-400">Features:</span>
                  <p className="text-sm text-white">{data.features.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900/40 rounded-lg p-4">
              <h3 className="font-medium text-white mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={data.contactName}
                    onChange={e => setData(d => ({ ...d, contactName: e.target.value }))}
                    className="w-full px-4 py-2 border border-white/10 rounded-lg"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Email *</label>
                  <input
                    type="email"
                    value={data.contactEmail}
                    onChange={e => setData(d => ({ ...d, contactEmail: e.target.value }))}
                    className="w-full px-4 py-2 border border-white/10 rounded-lg"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={data.contactPhone}
                    onChange={e => setData(d => ({ ...d, contactPhone: e.target.value }))}
                    className="w-full px-4 py-2 border border-white/10 rounded-lg"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : <div />}

          {step < 6 ? (
            <button
              onClick={nextStep}
              disabled={step === 1 && !data.businessName || step === 2 && !data.websiteType}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              Next
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !data.contactName || !data.contactEmail}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit'}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
