'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceIcon } from '@/client/components/ui/ServiceIcons'

interface Client {
  id: string
  name: string
  contactName: string
  contactEmail: string
  contactPhone: string
  websiteUrl: string
  businessType: string
  industry: string
  onboardingStatus: string
}

interface Props {
  token: string
  client: Client
}

const steps = [
  { id: 1, name: 'Contact Info', description: 'Verify your details' },
  { id: 2, name: 'Business Profile', description: 'Tell us about your business' },
  { id: 3, name: 'Services & Goals', description: 'What you need from us' },
  { id: 4, name: 'Platform Access', description: 'Share credentials' },
  { id: 5, name: 'Review & Confirm', description: 'Finalize setup' },
]

// Predefined options for multiple choice fields
const businessTypes = [
  { value: 'hospital', label: 'Hospital / Multi-Specialty' },
  { value: 'clinic', label: 'Clinic / Nursing Home' },
  { value: 'solo_practice', label: 'Solo Doctor Practice' },
  { value: 'diagnostic', label: 'Diagnostic Center / Lab' },
  { value: 'pharmacy', label: 'Pharmacy / Medical Store' },
  { value: 'dental', label: 'Dental Clinic' },
  { value: 'ayurveda', label: 'Ayurveda / Alternative Medicine' },
  { value: 'ivf', label: 'IVF / Fertility Center' },
  { value: 'cosmetic', label: 'Cosmetic / Aesthetic Clinic' },
  { value: 'physiotherapy', label: 'Physiotherapy Center' },
  { value: 'mental_health', label: 'Mental Health / Counseling' },
  { value: 'other_healthcare', label: 'Other Healthcare' },
  { value: 'non_healthcare', label: 'Non-Healthcare Business' },
]

const specializations = [
  'General Medicine', 'Cardiology', 'Orthopedics', 'Neurology', 'Oncology',
  'Gastroenterology', 'Dermatology', 'Ophthalmology', 'ENT', 'Urology',
  'Nephrology', 'Pulmonology', 'Endocrinology', 'Pediatrics', 'Gynecology',
  'Psychiatry', 'Dentistry', 'Ayurveda', 'Homeopathy', 'Physiotherapy',
]

const servicesInterested = [
  { value: 'social_media', label: 'Social Media Marketing', description: 'Content creation & management' },
  { value: 'seo', label: 'SEO & Google Rankings', description: 'Organic search visibility' },
  { value: 'google_ads', label: 'Google Ads (PPC)', description: 'Paid search advertising' },
  { value: 'meta_ads', label: 'Meta Ads (Facebook/Instagram)', description: 'Paid social advertising' },
  { value: 'website', label: 'Website Design & Development', description: 'New website or redesign' },
  { value: 'content', label: 'Content Writing & Blogs', description: 'Articles & medical content' },
  { value: 'video', label: 'Video Production', description: 'Reels, testimonials, explainers' },
  { value: 'reputation', label: 'Reputation Management', description: 'Reviews & online presence' },
  { value: 'gmb', label: 'Google My Business', description: 'Local listing optimization' },
  { value: 'whatsapp', label: 'WhatsApp Marketing', description: 'Broadcast & automation' },
]

const primaryGoals = [
  { value: 'patient_appointments', label: 'Increase Patient Appointments', icon: 'calendar' },
  { value: 'brand_awareness', label: 'Build Brand Awareness', icon: 'target' },
  { value: 'online_presence', label: 'Establish Online Presence', icon: 'web' },
  { value: 'compete_locally', label: 'Compete with Nearby Clinics', icon: 'trophy' },
  { value: 'reputation', label: 'Improve Online Reputation', icon: 'trophy' },
  { value: 'specific_service', label: 'Promote Specific Service/Treatment', icon: 'clinic' },
  { value: 'new_location', label: 'Promote New Location/Branch', icon: 'gbp' },
  { value: 'doctor_branding', label: 'Personal Branding for Doctor', icon: 'doctor' },
]

const targetAudiences = [
  { value: 'local_patients', label: 'Local Patients (within 5-10 km)' },
  { value: 'city_wide', label: 'City-wide Patients' },
  { value: 'regional', label: 'Regional / Multi-city' },
  { value: 'national', label: 'Pan-India (Medical Tourism)' },
  { value: 'international', label: 'International Patients' },
  { value: 'corporate', label: 'Corporate / B2B Health Services' },
]

const ageGroups = [
  { value: '18_30', label: '18-30 years' },
  { value: '30_45', label: '30-45 years' },
  { value: '45_60', label: '45-60 years' },
  { value: '60_plus', label: '60+ years' },
  { value: 'pediatric', label: 'Children (Pediatric)' },
  { value: 'all_ages', label: 'All Age Groups' },
]

const budgetRanges = [
  { value: 'under_25k', label: 'Under ₹25,000/month', tier: 'Starter' },
  { value: '25k_50k', label: '₹25,000 - ₹50,000/month', tier: 'Growth' },
  { value: '50k_1l', label: '₹50,000 - ₹1,00,000/month', tier: 'Professional' },
  { value: '1l_2l', label: '₹1,00,000 - ₹2,00,000/month', tier: 'Premium' },
  { value: '2l_plus', label: 'Above ₹2,00,000/month', tier: 'Enterprise' },
  { value: 'discuss', label: 'Need Consultation', tier: 'Custom' },
]

const communicationPreferences = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'social' },
  { value: 'phone', label: 'Phone Call', icon: 'social' },
  { value: 'email', label: 'Email', icon: 'email' },
  { value: 'video_call', label: 'Video Call', icon: 'video' },
]

const contentPreferences = [
  { value: 'educational', label: 'Educational / Health Tips' },
  { value: 'promotional', label: 'Promotional / Offers' },
  { value: 'testimonials', label: 'Patient Testimonials' },
  { value: 'behind_scenes', label: 'Behind-the-scenes / Culture' },
  { value: 'doctor_stories', label: 'Doctor Stories / Expertise' },
  { value: 'news', label: 'Health News / Updates' },
]

export function OnboardingForm({ token, client }: Props) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Step 1: Contact Info
    contactName: client.contactName || '',
    contactEmail: client.contactEmail || '',
    contactPhone: client.contactPhone || '',
    whatsappNumber: '',
    sameAsPhone: true,
    preferredCommunication: ['whatsapp'],
    bestTimeToCall: '',

    // Step 2: Business Profile
    businessType: client.businessType || '',
    specializations: [] as string[],
    yearsInBusiness: '',
    numberOfDoctors: '',
    numberOfLocations: '',
    currentMonthlyPatients: '',
    hasExistingWebsite: '',
    websiteUrl: client.websiteUrl || '',
    currentMarketingEfforts: [] as string[],

    // Step 3: Services & Goals
    servicesInterested: [] as string[],
    primaryGoal: '',
    secondaryGoals: [] as string[],
    targetAudience: [] as string[],
    targetAgeGroups: [] as string[],
    monthlyBudget: '',
    contentPreferences: [] as string[],
    competitors: '',
    uniqueSellingPoints: '',

    // Step 4: Platform Access
    websiteAdmin: '',
    websitePassword: '',
    hasGoogleAnalytics: '',
    analyticsAccess: '',
    hasGoogleAds: '',
    adsAccess: '',
    facebookPageUrl: '',
    facebookAccess: '',
    instagramHandle: '',
    instagramAccess: '',
    linkedinPageUrl: '',
    gmbAccess: '',

    // Step 5: Confirmation
    additionalNotes: '',
    termsAccepted: false,
    ndaAccepted: false,
  })

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const toggleArrayItem = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[]
    if (currentArray.includes(value)) {
      updateFormData({ [field]: currentArray.filter(v => v !== value) })
    } else {
      updateFormData({ [field]: [...currentArray, value] })
    }
  }

  const handleNext = async () => {
    if (currentStep < steps.length) {
      try {
        await fetch(`/api/onboard/${token}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: currentStep, data: formData }),
        })
      } catch (err) {
        console.error('Failed to save progress:', err)
      }
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/onboard/${token}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to complete onboarding')
      }

      router.push('/onboard/success')
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCheckboxGrid = (
    options: { value: string; label: string; description?: string; icon?: string }[],
    field: keyof typeof formData,
    columns: number = 2
  ) => (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-3`}>
      {options.map(option => {
        const isSelected = (formData[field] as string[]).includes(option.value)
        return (
          <label
            key={option.value}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 hover:border-white/20 hover:bg-slate-900/40'
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleArrayItem(field, option.value)}
              className="w-5 h-5 rounded border-white/20 text-blue-400 focus:ring-blue-500 mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {option.icon && <ServiceIcon icon={option.icon} className="w-5 h-5 text-blue-500" />}
                <span className="font-medium text-white">{option.label}</span>
              </div>
              {option.description && (
                <p className="text-sm text-slate-400 mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )

  const renderRadioCards = (
    options: { value: string; label: string; description?: string; icon?: string; tier?: string }[],
    field: keyof typeof formData
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map(option => {
        const isSelected = formData[field] === option.value
        return (
          <label
            key={option.value}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 hover:border-white/20 hover:bg-slate-900/40'
            }`}
          >
            <input
              type="radio"
              name={field}
              checked={isSelected}
              onChange={() => updateFormData({ [field]: option.value })}
              className="w-5 h-5 border-white/20 text-blue-400 focus:ring-blue-500 mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {option.icon && <ServiceIcon icon={option.icon} className="w-6 h-6 text-blue-500" />}
                <span className="font-medium text-white">{option.label}</span>
                {option.tier && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-white/10 text-slate-300 rounded-full">
                    {option.tier}
                  </span>
                )}
              </div>
              {option.description && (
                <p className="text-sm text-slate-400 mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )

  return (
    <div className="w-full max-w-4xl">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {client.name}!
        </h1>
        <p className="text-slate-300">
          Let&apos;s get you set up for success. This takes about 10 minutes.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium hidden lg:block ${
                  currentStep >= step.id ? 'text-white' : 'text-slate-400'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-6 lg:w-12 h-1 mx-1 lg:mx-2 rounded ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card rounded-2xl shadow-none p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            {steps[currentStep - 1].name}
          </h2>
          <p className="text-slate-300 mt-1">
            {steps[currentStep - 1].description}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="mb-8">
          {/* Step 1: Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => updateFormData({ contactName: e.target.value })}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    WhatsApp Number
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.sameAsPhone}
                        onChange={(e) => updateFormData({ sameAsPhone: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 text-blue-400"
                      />
                      <span className="text-sm text-slate-300">Same as phone number</span>
                    </label>
                    {!formData.sameAsPhone && (
                      <input
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => updateFormData({ whatsappNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="WhatsApp number"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Preferred Mode of Communication <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {communicationPreferences.map(pref => {
                    const isSelected = formData.preferredCommunication.includes(pref.value)
                    return (
                      <label
                        key={pref.value}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleArrayItem('preferredCommunication', pref.value)}
                          className="sr-only"
                        />
                        <ServiceIcon icon={pref.icon} className="w-6 h-6 text-blue-500" />
                        <span className="font-medium text-slate-200">{pref.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Best Time to Contact
                </label>
                <select
                  value={formData.bestTimeToCall}
                  onChange={(e) => updateFormData({ bestTimeToCall: e.target.value })}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select preferred time</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 7 PM)</option>
                  <option value="anytime">Anytime during business hours</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Business Profile */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Type of Healthcare Practice <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {businessTypes.map(type => {
                    const isSelected = formData.businessType === type.value
                    return (
                      <label
                        key={type.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="businessType"
                          checked={isSelected}
                          onChange={() => updateFormData({ businessType: type.value })}
                          className="w-5 h-5 border-white/20 text-blue-400"
                        />
                        <span className="font-medium text-white">{type.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Specializations (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {specializations.map(spec => {
                    const isSelected = formData.specializations.includes(spec)
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleArrayItem('specializations', spec)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        {spec}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Years in Business
                  </label>
                  <select
                    value={formData.yearsInBusiness}
                    onChange={(e) => updateFormData({ yearsInBusiness: e.target.value })}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="new">Just Starting</option>
                    <option value="1_3">1-3 years</option>
                    <option value="3_5">3-5 years</option>
                    <option value="5_10">5-10 years</option>
                    <option value="10_plus">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Number of Doctors
                  </label>
                  <select
                    value={formData.numberOfDoctors}
                    onChange={(e) => updateFormData({ numberOfDoctors: e.target.value })}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="1">1 (Solo Practice)</option>
                    <option value="2_5">2-5 Doctors</option>
                    <option value="6_10">6-10 Doctors</option>
                    <option value="11_25">11-25 Doctors</option>
                    <option value="25_plus">25+ Doctors</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Number of Locations
                  </label>
                  <select
                    value={formData.numberOfLocations}
                    onChange={(e) => updateFormData({ numberOfLocations: e.target.value })}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="1">1 Location</option>
                    <option value="2_3">2-3 Locations</option>
                    <option value="4_10">4-10 Locations</option>
                    <option value="10_plus">10+ Locations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Current Monthly Patient Footfall (Approximate)
                </label>
                <select
                  value={formData.currentMonthlyPatients}
                  onChange={(e) => updateFormData({ currentMonthlyPatients: e.target.value })}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option value="under_100">Under 100 patients</option>
                  <option value="100_300">100-300 patients</option>
                  <option value="300_500">300-500 patients</option>
                  <option value="500_1000">500-1,000 patients</option>
                  <option value="1000_plus">1,000+ patients</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Do you have an existing website?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'yes_good', label: 'Yes, and it works well' },
                    { value: 'yes_needs_work', label: 'Yes, but needs improvement' },
                    { value: 'no', label: 'No, need one' },
                  ].map(option => {
                    const isSelected = formData.hasExistingWebsite === option.value
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasExistingWebsite"
                          checked={isSelected}
                          onChange={() => updateFormData({ hasExistingWebsite: option.value })}
                          className="w-5 h-5 border-white/20 text-blue-400"
                        />
                        <span className="font-medium text-white">{option.label}</span>
                      </label>
                    )
                  })}
                </div>
                {formData.hasExistingWebsite && formData.hasExistingWebsite !== 'no' && (
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => updateFormData({ websiteUrl: e.target.value })}
                    className="w-full mt-3 px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Current Marketing Efforts (Select all that apply)
                </label>
                {renderCheckboxGrid([
                  { value: 'social_media', label: 'Social Media (posting content)' },
                  { value: 'google_ads', label: 'Running Google Ads' },
                  { value: 'meta_ads', label: 'Running Facebook/Instagram Ads' },
                  { value: 'seo', label: 'SEO / Organic Search' },
                  { value: 'print', label: 'Print / Newspaper Ads' },
                  { value: 'referrals', label: 'Word of Mouth / Referrals Only' },
                  { value: 'none', label: 'No Marketing Currently' },
                  { value: 'other', label: 'Other' },
                ], 'currentMarketingEfforts')}
              </div>
            </div>
          )}

          {/* Step 3: Services & Goals */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Services You&apos;re Interested In <span className="text-red-500">*</span>
                </label>
                {renderCheckboxGrid(servicesInterested, 'servicesInterested')}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  What&apos;s Your Primary Goal? <span className="text-red-500">*</span>
                </label>
                {renderRadioCards(primaryGoals, 'primaryGoal')}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Target Patient Location
                </label>
                {renderCheckboxGrid(targetAudiences, 'targetAudience', 3)}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Target Patient Age Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {ageGroups.map(age => {
                    const isSelected = formData.targetAgeGroups.includes(age.value)
                    return (
                      <button
                        key={age.value}
                        type="button"
                        onClick={() => toggleArrayItem('targetAgeGroups', age.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        {age.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Monthly Marketing Budget
                </label>
                {renderRadioCards(budgetRanges, 'monthlyBudget')}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Content Preferences (What type of content do you want?)
                </label>
                {renderCheckboxGrid(contentPreferences, 'contentPreferences', 3)}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Key Competitors (Names or Websites)
                </label>
                <textarea
                  value={formData.competitors}
                  onChange={(e) => updateFormData({ competitors: e.target.value })}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="e.g., Apollo Hospitals, Max Healthcare, Local clinics..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  What Makes You Unique? (USP)
                </label>
                <textarea
                  value={formData.uniqueSellingPoints}
                  onChange={(e) => updateFormData({ uniqueSellingPoints: e.target.value })}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="e.g., 20+ years experience, advanced equipment, affordable pricing, patient-first approach..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Platform Access */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="font-medium text-blue-900">Your data is secure</p>
                    <p className="text-sm text-blue-400">
                      All credentials are encrypted and only accessible to your assigned team. You can skip fields you&apos;re not comfortable sharing now.
                    </p>
                  </div>
                </div>
              </div>

              {/* Website Access */}
              {formData.hasExistingWebsite && formData.hasExistingWebsite !== 'no' && (
                <div className="bg-slate-900/40 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">🌐</span>
                    Website Access
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Admin URL</label>
                      <input
                        type="text"
                        value={formData.websiteAdmin}
                        onChange={(e) => updateFormData({ websiteAdmin: e.target.value })}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., /wp-admin or CMS login URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
                      <input
                        type="password"
                        value={formData.websitePassword}
                        onChange={(e) => updateFormData({ websitePassword: e.target.value })}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Website admin password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Google Analytics */}
              <div className="bg-slate-900/40 rounded-xl p-4">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ServiceIcon icon="chart" className="w-5 h-5 text-orange-600" />
                  </span>
                  Google Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'yes', label: 'Yes, have it set up' },
                      { value: 'no', label: 'No / Not sure' },
                      { value: 'need_setup', label: 'Need help setting up' },
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer ${
                          formData.hasGoogleAnalytics === option.value
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasGoogleAnalytics"
                          checked={formData.hasGoogleAnalytics === option.value}
                          onChange={() => updateFormData({ hasGoogleAnalytics: option.value })}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.hasGoogleAnalytics === 'yes' && (
                    <input
                      type="text"
                      value={formData.analyticsAccess}
                      onChange={(e) => updateFormData({ analyticsAccess: e.target.value })}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Property ID (GA4-XXXXXXXXXX) or share access with team@brandingpioneers.in"
                    />
                  )}
                </div>
              </div>

              {/* Google Ads */}
              <div className="bg-slate-900/40 rounded-xl p-4">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">🎯</span>
                  Google Ads
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'yes', label: 'Yes, have account' },
                      { value: 'no', label: 'No account' },
                      { value: 'need_setup', label: 'Need new account' },
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer ${
                          formData.hasGoogleAds === option.value
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasGoogleAds"
                          checked={formData.hasGoogleAds === option.value}
                          onChange={() => updateFormData({ hasGoogleAds: option.value })}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.hasGoogleAds === 'yes' && (
                    <input
                      type="text"
                      value={formData.adsAccess}
                      onChange={(e) => updateFormData({ adsAccess: e.target.value })}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Account ID or invite team@brandingpioneers.in as manager"
                    />
                  )}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-slate-900/40 rounded-xl p-4">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">📱</span>
                  Social Media Accounts
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Facebook Page URL</label>
                      <input
                        type="url"
                        value={formData.facebookPageUrl}
                        onChange={(e) => updateFormData({ facebookPageUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Instagram Handle</label>
                      <input
                        type="text"
                        value={formData.instagramHandle}
                        onChange={(e) => updateFormData({ instagramHandle: e.target.value })}
                        className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="@yourhandle"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">LinkedIn Page (Optional)</label>
                    <input
                      type="url"
                      value={formData.linkedinPageUrl}
                      onChange={(e) => updateFormData({ linkedinPageUrl: e.target.value })}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
              </div>

              {/* Google My Business */}
              <div className="bg-slate-900/40 rounded-xl p-4">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">📍</span>
                  Google My Business (Maps Listing)
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'yes_verified', label: 'Yes, claimed & verified' },
                    { value: 'yes_not_verified', label: 'Listed but not verified' },
                    { value: 'no', label: 'Not listed yet' },
                    { value: 'not_sure', label: 'Not sure' },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer ${
                        formData.gmbAccess === option.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gmbAccess"
                        checked={formData.gmbAccess === option.value}
                        onChange={() => updateFormData({ gmbAccess: option.value })}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Summary of Your Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Contact</p>
                    <p className="font-medium text-white">{formData.contactName}</p>
                    <p className="text-sm text-slate-300">{formData.contactEmail}</p>
                    <p className="text-sm text-slate-300">{formData.contactPhone}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Business Type</p>
                    <p className="font-medium text-white">
                      {businessTypes.find(t => t.value === formData.businessType)?.label || 'Not specified'}
                    </p>
                    {formData.specializations.length > 0 && (
                      <p className="text-sm text-slate-300">{formData.specializations.join(', ')}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Primary Goal</p>
                    <p className="font-medium text-white">
                      {primaryGoals.find(g => g.value === formData.primaryGoal)?.label || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Budget Range</p>
                    <p className="font-medium text-white">
                      {budgetRanges.find(b => b.value === formData.monthlyBudget)?.label || 'Not specified'}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-slate-400 uppercase mb-1">Services Interested</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.servicesInterested.map(s => (
                        <span key={s} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                          {servicesInterested.find(serv => serv.value === s)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <span>⏭️</span> What happens next?
                </h4>
                <ol className="text-sm text-amber-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    Our accounts team will prepare your Service Level Agreement (SLA)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    You&apos;ll receive the SLA for digital signature via email
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    Once signed and payment is confirmed, your project activates in Pioneer OS
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    Your dedicated team will reach out within 24 hours to kick off
                  </li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Any additional notes or requirements?
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Anything else you'd like us to know..."
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 bg-slate-900/40 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 text-blue-400 focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-sm text-slate-200">
                    I confirm that the information provided is accurate and I agree to the{' '}
                    <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 bg-slate-900/40 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ndaAccepted}
                    onChange={(e) => updateFormData({ ndaAccepted: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 text-blue-400 focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-sm text-slate-200">
                    I understand that all credentials shared will be kept confidential under NDA and used only for managing my marketing campaigns.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-white/10">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="px-6 py-3 text-slate-300 font-medium rounded-xl hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Continue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.termsAccepted || !formData.ndaAccepted}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Complete Onboarding
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
