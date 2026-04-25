'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface RFPForm {
  // Company Information
  companyName: string
  industry: string
  website: string
  companySize: string
  yearEstablished: string

  // Contact Information
  contactName: string
  designation: string
  email: string
  phone: string
  preferredContactMethod: string

  // Project Requirements
  projectType: string[]
  servicesNeeded: string[]
  projectDescription: string
  currentChallenges: string

  // Goals & Objectives
  primaryGoals: string[]
  targetAudience: string
  competitors: string
  uniqueSellingPoints: string

  // Budget & Timeline
  estimatedBudget: string
  timeline: string
  startDate: string
  contractPreference: string

  // Current Status
  currentMarketingActivities: string[]
  hasExistingAgency: boolean
  reasonForChange: string

  // Additional
  specialRequirements: string
  howDidYouHear: string
}

const projectTypes = [
  'Branding & Identity',
  'Website Development',
  'Digital Marketing',
  'Social Media Management',
  'SEO & Content',
  'Paid Advertising',
  'Video Production',
  'E-commerce',
  'App Development',
  'Other',
]

const services = [
  'Brand Strategy',
  'Logo Design',
  'Website Design',
  'Website Development',
  'SEO',
  'Content Marketing',
  'Social Media Management',
  'Facebook/Instagram Ads',
  'Google Ads',
  'Email Marketing',
  'Video Production',
  'Photography',
  'UI/UX Design',
  'E-commerce Solutions',
  'Mobile App Development',
  'PR & Communications',
]

const goalOptions = [
  'Increase Brand Awareness',
  'Generate More Leads',
  'Increase Sales',
  'Improve Online Presence',
  'Launch New Product/Service',
  'Enter New Market',
  'Build Customer Loyalty',
  'Establish Thought Leadership',
  'Improve Customer Experience',
  'Rebrand/Refresh Image',
]

const budgetRanges = [
  { value: 'under_50k', label: 'Under ₹50,000/month' },
  { value: '50k_1L', label: '₹50,000 - ₹1,00,000/month' },
  { value: '1L_2L', label: '₹1,00,000 - ₹2,00,000/month' },
  { value: '2L_5L', label: '₹2,00,000 - ₹5,00,000/month' },
  { value: 'above_5L', label: 'Above ₹5,00,000/month' },
  { value: 'discuss', label: 'Prefer to discuss' },
]

export default function RFPFormPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6
  const [form, setForm] = useState<RFPForm>({
    companyName: '',
    industry: '',
    website: '',
    companySize: '',
    yearEstablished: '',
    contactName: '',
    designation: '',
    email: '',
    phone: '',
    preferredContactMethod: 'email',
    projectType: [],
    servicesNeeded: [],
    projectDescription: '',
    currentChallenges: '',
    primaryGoals: [],
    targetAudience: '',
    competitors: '',
    uniqueSellingPoints: '',
    estimatedBudget: '',
    timeline: '',
    startDate: '',
    contractPreference: '',
    currentMarketingActivities: [],
    hasExistingAgency: false,
    reasonForChange: '',
    specialRequirements: '',
    howDidYouHear: '',
  })

  const updateField = <K extends keyof RFPForm>(field: K, value: RFPForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof RFPForm, item: string) => {
    const current = form[field] as string[]
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item]
    updateField(field, updated as RFPForm[typeof field])
  }

  const handleSubmit = () => {
    toast.success('RFP submitted successfully! Our team will review and get back to you within 24 hours.')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/crm" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
          &larr; Back to CRM
        </Link>
        <h1 className="text-2xl font-bold text-white">Request for Proposal (RFP)</h1>
        <p className="text-slate-400">Help us understand your requirements to provide the best proposal</p>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-200">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-slate-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Company Information */}
      {currentStep === 1 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Company Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Company Name *</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Industry *</label>
              <select
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select industry</option>
                <option value="healthcare">Healthcare</option>
                <option value="technology">Technology</option>
                <option value="retail">Retail / E-commerce</option>
                <option value="food">Food & Beverage</option>
                <option value="education">Education</option>
                <option value="real_estate">Real Estate</option>
                <option value="finance">Finance / Banking</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="hospitality">Hospitality</option>
                <option value="professional_services">Professional Services</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Year Established</label>
              <input
                type="text"
                value={form.yearEstablished}
                onChange={(e) => updateField('yearEstablished', e.target.value)}
                placeholder="e.g., 2015"
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Company Size *</label>
            <div className="grid grid-cols-5 gap-3">
              {['1-10', '11-50', '51-200', '201-500', '500+'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateField('companySize', size)}
                  className={`py-2 px-4 text-sm rounded-lg border-2 transition-colors ${
                    form.companySize === size
                      ? 'border-blue-600 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-slate-300 hover:border-blue-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Contact Information */}
      {currentStep === 2 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Contact Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Contact Person *</label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Designation</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => updateField('designation', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Preferred Contact Method</label>
            <div className="flex gap-3">
              {['email', 'phone', 'whatsapp'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => updateField('preferredContactMethod', method)}
                  className={`flex-1 py-2 px-4 text-sm rounded-lg border-2 transition-colors capitalize ${
                    form.preferredContactMethod === method
                      ? 'border-blue-600 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-slate-300 hover:border-blue-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Services & Requirements */}
      {currentStep === 3 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Services & Requirements</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Project Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayItem('projectType', type)}
                  className={`py-2 px-3 text-xs rounded-lg border-2 transition-colors ${
                    form.projectType.includes(type)
                      ? 'border-blue-600 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-slate-300 hover:border-blue-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Services Needed *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {services.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleArrayItem('servicesNeeded', service)}
                  className={`py-2 px-3 text-xs rounded-lg border-2 transition-colors text-left ${
                    form.servicesNeeded.includes(service)
                      ? 'border-green-600 bg-green-500/10 text-green-400'
                      : 'border-white/10 text-slate-300 hover:border-green-300'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Project Description *</label>
            <textarea
              value={form.projectDescription}
              onChange={(e) => updateField('projectDescription', e.target.value)}
              placeholder="Describe your project requirements in detail..."
              rows={4}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Current Challenges</label>
            <textarea
              value={form.currentChallenges}
              onChange={(e) => updateField('currentChallenges', e.target.value)}
              placeholder="What marketing challenges are you currently facing?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 4: Goals & Target Audience */}
      {currentStep === 4 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Goals & Target Audience</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Primary Goals *</label>
            <div className="grid grid-cols-2 gap-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleArrayItem('primaryGoals', goal)}
                  className={`py-2 px-3 text-sm rounded-lg border-2 transition-colors text-left ${
                    form.primaryGoals.includes(goal)
                      ? 'border-purple-600 bg-purple-500/10 text-purple-400'
                      : 'border-white/10 text-slate-300 hover:border-purple-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Target Audience *</label>
            <textarea
              value={form.targetAudience}
              onChange={(e) => updateField('targetAudience', e.target.value)}
              placeholder="Describe your ideal customer (demographics, location, interests, etc.)"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Key Competitors</label>
            <textarea
              value={form.competitors}
              onChange={(e) => updateField('competitors', e.target.value)}
              placeholder="List your main competitors (names or websites)"
              rows={2}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Unique Selling Points</label>
            <textarea
              value={form.uniqueSellingPoints}
              onChange={(e) => updateField('uniqueSellingPoints', e.target.value)}
              placeholder="What makes your business unique? What are your key differentiators?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 5: Budget & Timeline */}
      {currentStep === 5 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Budget & Timeline</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Estimated Monthly Budget *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {budgetRanges.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => updateField('estimatedBudget', range.value)}
                  className={`py-3 px-4 text-sm rounded-lg border-2 transition-colors ${
                    form.estimatedBudget === range.value
                      ? 'border-green-600 bg-green-500/10 text-green-400'
                      : 'border-white/10 text-slate-300 hover:border-green-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Project Timeline</label>
              <select
                value={form.timeline}
                onChange={(e) => updateField('timeline', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select timeline</option>
                <option value="asap">ASAP / Urgent</option>
                <option value="1_month">Within 1 month</option>
                <option value="1_3_months">1-3 months</option>
                <option value="3_6_months">3-6 months</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Preferred Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Contract Preference</label>
            <div className="flex gap-3">
              {['monthly', 'quarterly', 'annual', 'project'].map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => updateField('contractPreference', pref)}
                  className={`flex-1 py-2 px-4 text-sm rounded-lg border-2 transition-colors capitalize ${
                    form.contractPreference === pref
                      ? 'border-blue-600 bg-blue-500/10 text-blue-400'
                      : 'border-white/10 text-slate-300 hover:border-blue-300'
                  }`}
                >
                  {pref === 'project' ? 'Project-Based' : pref}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasExistingAgency}
                onChange={(e) => updateField('hasExistingAgency', e.target.checked)}
                className="w-5 h-5 text-blue-400 rounded"
              />
              <span className="text-sm text-slate-200">Currently working with another agency</span>
            </label>
            {form.hasExistingAgency && (
              <div className="mt-3">
                <input
                  type="text"
                  value={form.reasonForChange}
                  onChange={(e) => updateField('reasonForChange', e.target.value)}
                  placeholder="Reason for considering a change"
                  className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 6: Additional Information */}
      {currentStep === 6 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Additional Information</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Special Requirements or Notes</label>
            <textarea
              value={form.specialRequirements}
              onChange={(e) => updateField('specialRequirements', e.target.value)}
              placeholder="Any specific requirements, preferences, or additional information..."
              rows={4}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">How did you hear about us?</label>
            <select
              value={form.howDidYouHear}
              onChange={(e) => updateField('howDidYouHear', e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an option</option>
              <option value="google">Google Search</option>
              <option value="social_media">Social Media</option>
              <option value="referral">Referral</option>
              <option value="linkedin">LinkedIn</option>
              <option value="event">Event/Conference</option>
              <option value="existing_client">Existing Client Recommendation</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Summary */}
          <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-3">RFP Summary</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Company</p>
                <p className="font-medium text-white">{form.companyName || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Industry</p>
                <p className="font-medium text-white">{form.industry || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Services</p>
                <p className="font-medium text-white">{form.servicesNeeded.join(', ') || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Budget</p>
                <p className="font-medium text-white">
                  {budgetRanges.find(b => b.value === form.estimatedBudget)?.label || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 text-slate-300 hover:text-white disabled:opacity-50"
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            Submit RFP
          </button>
        )}
      </div>
    </div>
  )
}
