'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

// ============================================
// CONSTANTS
// ============================================

const INDUSTRIES = [
  { value: 'hospital', label: 'Hospital / Multi-Specialty', emoji: '🏥' },
  { value: 'clinic', label: 'Clinic / Polyclinic', emoji: '🩺' },
  { value: 'doctor', label: 'Individual Doctor', emoji: '👨‍⚕️' },
  { value: 'dental', label: 'Dental Practice', emoji: '🦷' },
  { value: 'eyecare', label: 'Eye Care', emoji: '👁️' },
  { value: 'diagnostics', label: 'Diagnostics / Lab', emoji: '🔬' },
  { value: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { value: 'wellness', label: 'Wellness / Spa', emoji: '🧘' },
  { value: 'mental_health', label: 'Mental Health', emoji: '🧠' },
  { value: 'other_healthcare', label: 'Other Healthcare', emoji: '⚕️' },
  { value: 'non_healthcare', label: 'Non-Healthcare', emoji: '🏢' },
]

const SERVICES = [
  { value: 'seo', label: 'SEO & Local SEO', description: 'Rank higher on Google', emoji: '🔍' },
  { value: 'gbp', label: 'Google Business Profile', description: 'Manage your business listing', emoji: '📍' },
  { value: 'social', label: 'Social Media', description: 'Instagram, Facebook, LinkedIn', emoji: '📱' },
  { value: 'ads', label: 'Performance Ads', description: 'Google & Meta Ads', emoji: '📈' },
  { value: 'web', label: 'Website Development', description: 'Build or redesign website', emoji: '🌐' },
  { value: 'content', label: 'Content Writing', description: 'Blogs, articles, copy', emoji: '✍️' },
  { value: 'design', label: 'Graphic Design', description: 'Visual content creation', emoji: '🎨' },
  { value: 'video', label: 'Video Production', description: 'Reels, YouTube, shoots', emoji: '🎬' },
  { value: 'reputation', label: 'Reputation Management', description: 'Reviews & PR', emoji: '⭐' },
]

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', emoji: '📸' },
  { value: 'facebook', label: 'Facebook', emoji: '👤' },
  { value: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { value: 'twitter', label: 'Twitter / X', emoji: '🐦' },
  { value: 'youtube', label: 'YouTube', emoji: '▶️' },
]

const AD_PLATFORMS = [
  { value: 'google_search', label: 'Google Search Ads', emoji: '🔍' },
  { value: 'google_display', label: 'Google Display', emoji: '🖼️' },
  { value: 'youtube_ads', label: 'YouTube Ads', emoji: '▶️' },
  { value: 'meta_ads', label: 'Meta (FB/IG) Ads', emoji: '📱' },
  { value: 'linkedin_ads', label: 'LinkedIn Ads', emoji: '💼' },
]

const CONTENT_CREATION = [
  { value: 'we_create', label: 'Agency Creates', description: 'We handle everything', emoji: '✨' },
  { value: 'client_provides', label: 'You Provide', description: 'You create, we post', emoji: '📤' },
  { value: 'mix', label: 'Mix of Both', description: 'Collaborative approach', emoji: '🤝' },
]

const POST_FREQUENCY = [
  { value: '3_per_week', label: '3 Posts/Week', description: 'Standard presence', emoji: '📅' },
  { value: '5_per_week', label: '5 Posts/Week', description: 'Active presence', emoji: '📆' },
  { value: 'daily', label: 'Daily Posts', description: 'Maximum visibility', emoji: '🔥' },
]

const AD_BUDGETS = [
  { value: 'under_25k', label: 'Under ₹25,000', description: 'Testing phase' },
  { value: '25k_50k', label: '₹25,000 - ₹50,000', description: 'Growth phase' },
  { value: '50k_1l', label: '₹50,000 - ₹1 Lakh', description: 'Scaling up' },
  { value: '1l_3l', label: '₹1 - ₹3 Lakhs', description: 'Aggressive' },
  { value: 'above_3l', label: 'Above ₹3 Lakhs', description: 'Enterprise' },
]

const INVOLVEMENT_LEVELS = [
  { value: 'hands_off', label: 'Hands-Off', description: 'Trust the agency, just show results', emoji: '🙌' },
  { value: 'light_touch', label: 'Light Touch', description: 'Monthly check-ins only', emoji: '👆' },
  { value: 'collaborative', label: 'Collaborative', description: 'Weekly syncs, work as partners', emoji: '🤝' },
  { value: 'hands_on', label: 'Hands-On', description: 'Daily involvement, approve everything', emoji: '✋' },
]

const COMMUNICATION_CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp', description: 'Quick messages & updates', emoji: '💬' },
  { value: 'email', label: 'Email', description: 'Formal communication', emoji: '📧' },
  { value: 'call', label: 'Phone Calls', description: 'Direct calls', emoji: '📞' },
  { value: 'mix', label: 'Mix of All', description: 'Different for different needs', emoji: '🔄' },
]

const MEETING_FREQUENCY = [
  { value: 'weekly', label: 'Weekly', description: 'Every week' },
  { value: 'biweekly', label: 'Every 2 Weeks', description: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
]

const BRAND_VOICE = [
  { value: 'professional', label: 'Professional', description: 'Corporate, formal tone', emoji: '💼' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, conversational', emoji: '😊' },
  { value: 'premium', label: 'Premium', description: 'Luxury, high-end', emoji: '👑' },
  { value: 'caring', label: 'Caring', description: 'Empathetic, patient-focused', emoji: '💚' },
  { value: 'modern', label: 'Modern', description: 'Tech-savvy, innovative', emoji: '🚀' },
]

const STEPS = [
  { num: 1, label: 'About You' },
  { num: 2, label: 'Services' },
  { num: 3, label: 'Preferences' },
  { num: 4, label: 'Communication' },
  { num: 5, label: 'Confirm' },
]

// ============================================
// MAIN COMPONENT
// ============================================

export default function ClientWelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    // Step 1: Basic Info
    businessName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    industry: '',

    // Step 2: Services
    services: [] as string[],
    socialPlatforms: [] as string[],
    adPlatforms: [] as string[],
    contentCreation: '',
    postFrequency: '',
    adBudget: '',

    // Step 3: Preferences
    involvement: '',
    brandVoice: '',
    targetAudience: '',
    usp: '',
    competitors: '',

    // Step 4: Communication
    primaryComm: '',
    meetingFrequency: '',
    preferredTime: '',
    escalationContact: '',
    escalationPhone: '',

    // Step 5: Confirm
    ackAccountManager: false,
    ackWorkingHours: false,
    ackPaymentTerms: false,
    termsAccepted: false,
    additionalNotes: '',
  })

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.businessName && form.contactName && form.contactEmail && form.contactPhone && form.industry
      case 2:
        return form.services.length > 0
      case 3:
        return form.involvement && form.brandVoice
      case 4:
        return form.primaryComm && form.meetingFrequency
      case 5:
        return form.ackAccountManager && form.ackWorkingHours && form.ackPaymentTerms && form.termsAccepted
      default:
        return true
    }
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
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <SuccessScreen
        title="Welcome Aboard!"
        message="Thank you for completing the onboarding. Your dedicated account manager will reach out within 24 hours."
        details={[
          { label: 'Business', value: form.businessName },
          { label: 'Services', value: form.services.length + ' selected' },
          { label: 'Communication', value: COMMUNICATION_CHANNELS.find(c => c.value === form.primaryComm)?.label || '-' },
        ]}
        primaryAction={{
          label: 'Done',
          onClick: () => router.push('/'),
        }}
      />
    )
  }

  return (
    <FormLayout
      title="Welcome to Branding Pioneers"
      subtitle="Client Onboarding"
      step={step}
      totalSteps={STEPS.length}
      brandColor="purple"
    >
      <div className="space-y-6">
        {/* Step 1: About You */}
        {step === 1 && (
          <>
            <FormCard
              title="Tell us about yourself"
              description="Let's personalize your marketing journey"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            >
              <div className="space-y-6">
                <TextInput
                  label="Business / Clinic / Hospital Name"
                  name="businessName"
                  value={form.businessName}
                  onChange={(v) => updateField('businessName', v)}
                  placeholder="e.g., City Hospital, Dr. Sharma's Clinic"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Your Name"
                    name="contactName"
                    value={form.contactName}
                    onChange={(v) => updateField('contactName', v)}
                    placeholder="Primary contact person"
                    required
                  />
                  <TextInput
                    label="Email Address"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={(v) => updateField('contactEmail', v)}
                    type="email"
                    placeholder="email@example.com"
                    required
                  />
                  <TextInput
                    label="Phone Number"
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={(v) => updateField('contactPhone', v)}
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                  />
                  <TextInput
                    label="WhatsApp (if different)"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={(v) => updateField('whatsapp', v)}
                    type="tel"
                    placeholder="Leave blank if same"
                  />
                </div>

                <SingleSelect
                  label="What type of business are you?"
                  name="industry"
                  value={form.industry}
                  onChange={(v) => updateField('industry', v)}
                  options={INDUSTRIES}
                  columns={3}
                  size="sm"
                  required
                />
              </div>
            </FormCard>

            <FormButtons
              onNext={() => setStep(2)}
              disabled={!canProceed()}
              showBack={false}
            />
          </>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <>
            <FormCard
              title="Services You Need"
              description="Select all services included in your package"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
            >
              <div className="space-y-6">
                <MultiSelect
                  label="Select Your Services"
                  name="services"
                  value={form.services}
                  onChange={(v) => updateField('services', v)}
                  options={SERVICES}
                  columns={3}
                  required
                />

                {form.services.includes('social') && (
                  <>
                    <MultiSelect
                      label="Which platforms do you want us to manage?"
                      name="socialPlatforms"
                      value={form.socialPlatforms}
                      onChange={(v) => updateField('socialPlatforms', v)}
                      options={SOCIAL_PLATFORMS}
                      columns={5}
                    />

                    <SingleSelect
                      label="Who will create the content?"
                      name="contentCreation"
                      value={form.contentCreation}
                      onChange={(v) => updateField('contentCreation', v)}
                      options={CONTENT_CREATION}
                      columns={3}
                    />

                    <SingleSelect
                      label="How often should we post?"
                      name="postFrequency"
                      value={form.postFrequency}
                      onChange={(v) => updateField('postFrequency', v)}
                      options={POST_FREQUENCY}
                      columns={3}
                    />
                  </>
                )}

                {form.services.includes('ads') && (
                  <>
                    <MultiSelect
                      label="Which ad platforms?"
                      name="adPlatforms"
                      value={form.adPlatforms}
                      onChange={(v) => updateField('adPlatforms', v)}
                      options={AD_PLATFORMS}
                      columns={3}
                    />

                    <SingleSelect
                      label="Monthly Ad Budget"
                      name="adBudget"
                      value={form.adBudget}
                      onChange={(v) => updateField('adBudget', v)}
                      options={AD_BUDGETS}
                      columns={3}
                    />
                  </>
                )}
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <>
            <FormCard
              title="Your Preferences"
              description="Help us understand how you like to work"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            >
              <div className="space-y-6">
                <SingleSelect
                  label="Your level of involvement"
                  name="involvement"
                  value={form.involvement}
                  onChange={(v) => updateField('involvement', v)}
                  options={INVOLVEMENT_LEVELS}
                  columns={2}
                  required
                />

                <SingleSelect
                  label="What should your brand voice be?"
                  name="brandVoice"
                  value={form.brandVoice}
                  onChange={(v) => updateField('brandVoice', v)}
                  options={BRAND_VOICE}
                  columns={3}
                  required
                />

                <DropdownSelect
                  label="Target Audience Reach"
                  name="targetAudience"
                  value={form.targetAudience}
                  onChange={(v) => updateField('targetAudience', v)}
                  options={[
                    { value: 'local', label: 'Local (5-10 km radius)' },
                    { value: 'city', label: 'City-wide' },
                    { value: 'state', label: 'State/Region' },
                    { value: 'national', label: 'Pan India' },
                    { value: 'international', label: 'International' },
                  ]}
                  placeholder="Select target reach"
                />

                <Textarea
                  label="What makes you unique? (USP)"
                  name="usp"
                  value={form.usp}
                  onChange={(v) => updateField('usp', v)}
                  placeholder="e.g., 20+ years experience, state-of-art equipment, 24/7 emergency..."
                  rows={2}
                />

                <Textarea
                  label="Who are your top competitors?"
                  name="competitors"
                  value={form.competitors}
                  onChange={(v) => updateField('competitors', v)}
                  placeholder="Names or websites of 2-3 competitors..."
                  rows={2}
                />
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 4: Communication */}
        {step === 4 && (
          <>
            <FormCard
              title="Communication Preferences"
              description="How would you like us to stay in touch?"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
            >
              <div className="space-y-6">
                <SingleSelect
                  label="Primary communication channel"
                  name="primaryComm"
                  value={form.primaryComm}
                  onChange={(v) => updateField('primaryComm', v)}
                  options={COMMUNICATION_CHANNELS}
                  columns={4}
                  required
                />

                <SingleSelect
                  label="How often should we have meetings?"
                  name="meetingFrequency"
                  value={form.meetingFrequency}
                  onChange={(v) => updateField('meetingFrequency', v)}
                  options={MEETING_FREQUENCY}
                  columns={4}
                  required
                />

                <DropdownSelect
                  label="Best time to reach you"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={(v) => updateField('preferredTime', v)}
                  options={[
                    { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
                    { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
                    { value: 'evening', label: 'Evening (5 PM - 8 PM)' },
                    { value: 'flexible', label: 'Anytime / Flexible' },
                  ]}
                  placeholder="Select preferred time"
                />

                <div className="bg-slate-900/40 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Backup Contact (if we can&apos;t reach you)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="Name"
                      name="escalationContact"
                      value={form.escalationContact}
                      onChange={(v) => updateField('escalationContact', v)}
                      placeholder="Alternate contact name"
                    />
                    <TextInput
                      label="Phone"
                      name="escalationPhone"
                      value={form.escalationPhone}
                      onChange={(v) => updateField('escalationPhone', v)}
                      type="tel"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 5: Confirm */}
        {step === 5 && (
          <>
            <FormCard
              title="Almost Done!"
              description="Please confirm and accept the terms"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            >
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/40 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Business</p>
                    <p className="font-semibold text-white mt-1 truncate">{form.businessName || '-'}</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Services</p>
                    <p className="font-semibold text-white mt-1">{form.services.length} selected</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Involvement</p>
                    <p className="font-semibold text-white mt-1 capitalize">{form.involvement?.replace(/_/g, ' ') || '-'}</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Meetings</p>
                    <p className="font-semibold text-white mt-1 capitalize">{form.meetingFrequency || '-'}</p>
                  </div>
                </div>

                {/* Acknowledgments */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Please confirm you understand:</h3>

                  <div className="glass-card border border-white/10 rounded-xl p-4 hover:bg-slate-900/40 transition-colors">
                    <Checkbox
                      label={
                        <span>
                          <strong>Dedicated Account Manager</strong> — You&apos;ll have one point of contact who coordinates with all teams
                        </span>
                      }
                      name="ackAccountManager"
                      checked={form.ackAccountManager}
                      onChange={(v) => updateField('ackAccountManager', v)}
                      required
                    />
                  </div>

                  <div className="glass-card border border-white/10 rounded-xl p-4 hover:bg-slate-900/40 transition-colors">
                    <Checkbox
                      label={
                        <span>
                          <strong>Working Hours</strong> — Our team works Monday-Saturday, 10 AM - 7 PM IST. Response within 2-4 working hours.
                        </span>
                      }
                      name="ackWorkingHours"
                      checked={form.ackWorkingHours}
                      onChange={(v) => updateField('ackWorkingHours', v)}
                      required
                    />
                  </div>

                  <div className="glass-card border border-white/10 rounded-xl p-4 hover:bg-slate-900/40 transition-colors">
                    <Checkbox
                      label={
                        <span>
                          <strong>Payment Terms</strong> — Monthly payments due by the 5th. Services may pause for overdue payments.
                        </span>
                      }
                      name="ackPaymentTerms"
                      checked={form.ackPaymentTerms}
                      onChange={(v) => updateField('ackPaymentTerms', v)}
                      required
                    />
                  </div>
                </div>

                <Textarea
                  label="Anything else we should know?"
                  name="additionalNotes"
                  value={form.additionalNotes}
                  onChange={(v) => updateField('additionalNotes', v)}
                  placeholder="Special requirements, upcoming events, expectations..."
                  rows={3}
                />

                {/* Final Terms */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
                  <Checkbox
                    label={
                      <span>
                        I confirm all information is accurate and agree to work with Branding Pioneers based on the preferences I&apos;ve selected. I understand this helps customize my experience.
                      </span>
                    }
                    name="termsAccepted"
                    checked={form.termsAccepted}
                    onChange={(v) => updateField('termsAccepted', v)}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-200 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(4)}
              onSubmit={handleSubmit}
              submitLabel="Complete Onboarding"
              disabled={!canProceed()}
              loading={loading}
            />
          </>
        )}
      </div>
    </FormLayout>
  )
}
