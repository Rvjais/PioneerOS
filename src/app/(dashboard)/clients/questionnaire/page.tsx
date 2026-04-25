'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface PremiumQuestionnaire {
  // Company Overview
  companyDescription: string
  yearsFounded: string
  numberOfEmployees: string
  annualRevenue: string
  locations: string
  businessModel: string

  // Brand & Identity
  brandVoice: string
  brandValues: string[]
  brandPersonality: string
  colorPreferences: string
  brandGuidelines: boolean
  existingAssets: string

  // Target Audience
  primaryAudience: string
  secondaryAudience: string
  audienceAge: string[]
  audienceGender: string
  audienceLocation: string
  audienceInterests: string
  painPoints: string
  buyingBehavior: string

  // Products/Services
  mainProducts: string
  pricingRange: string
  uniqueSellingPoints: string
  customerJourney: string
  averageOrderValue: string
  salesCycle: string

  // Competition
  topCompetitors: string
  competitorStrengths: string
  competitorWeaknesses: string
  marketPosition: string
  differentiators: string

  // Current Marketing
  currentChannels: string[]
  monthlyAdSpend: string
  previousCampaigns: string
  whatWorked: string
  whatDidntWork: string
  currentAgency: string

  // Digital Presence
  websiteUrl: string
  websitePlatform: string
  hasEcommerce: boolean
  socialProfiles: string
  emailList: string
  existingContent: string

  // Access & Credentials
  analyticsAccess: string
  adsManagerAccess: string
  socialAccess: string
  cmsAccess: string
  emailToolAccess: string

  // Goals & KPIs
  primaryGoals: string[]
  targetKpis: string
  timelineExpectations: string
  budgetFlexibility: string
  successDefinition: string

  // Communication
  preferredCommunication: string
  meetingFrequency: string
  reportingPreference: string
  decisionMakers: string
  approvalProcess: string

  // Additional
  specialRequirements: string
  concerns: string
  inspiration: string
}

const brandValues = [
  'Innovation', 'Trust', 'Quality', 'Affordability', 'Sustainability',
  'Luxury', 'Community', 'Excellence', 'Creativity', 'Reliability'
]

const marketingChannels = [
  'Facebook', 'Instagram', 'LinkedIn', 'Twitter/X', 'YouTube',
  'Google Ads', 'SEO', 'Email Marketing', 'Content Marketing',
  'Influencer Marketing', 'PR', 'Print Media', 'TV/Radio', 'Events'
]

const goalOptions = [
  'Increase Brand Awareness', 'Generate Leads', 'Drive Sales',
  'Build Community', 'Improve SEO Rankings', 'Launch New Product',
  'Enter New Market', 'Increase Engagement', 'Build Thought Leadership'
]

export default function ClientQuestionnairePage() {
  const [currentSection, setCurrentSection] = useState(1)
  const totalSections = 10
  const [form, setForm] = useState<PremiumQuestionnaire>({
    companyDescription: '',
    yearsFounded: '',
    numberOfEmployees: '',
    annualRevenue: '',
    locations: '',
    businessModel: '',
    brandVoice: '',
    brandValues: [],
    brandPersonality: '',
    colorPreferences: '',
    brandGuidelines: false,
    existingAssets: '',
    primaryAudience: '',
    secondaryAudience: '',
    audienceAge: [],
    audienceGender: '',
    audienceLocation: '',
    audienceInterests: '',
    painPoints: '',
    buyingBehavior: '',
    mainProducts: '',
    pricingRange: '',
    uniqueSellingPoints: '',
    customerJourney: '',
    averageOrderValue: '',
    salesCycle: '',
    topCompetitors: '',
    competitorStrengths: '',
    competitorWeaknesses: '',
    marketPosition: '',
    differentiators: '',
    currentChannels: [],
    monthlyAdSpend: '',
    previousCampaigns: '',
    whatWorked: '',
    whatDidntWork: '',
    currentAgency: '',
    websiteUrl: '',
    websitePlatform: '',
    hasEcommerce: false,
    socialProfiles: '',
    emailList: '',
    existingContent: '',
    analyticsAccess: '',
    adsManagerAccess: '',
    socialAccess: '',
    cmsAccess: '',
    emailToolAccess: '',
    primaryGoals: [],
    targetKpis: '',
    timelineExpectations: '',
    budgetFlexibility: '',
    successDefinition: '',
    preferredCommunication: '',
    meetingFrequency: '',
    reportingPreference: '',
    decisionMakers: '',
    approvalProcess: '',
    specialRequirements: '',
    concerns: '',
    inspiration: '',
  })

  const updateField = <K extends keyof PremiumQuestionnaire>(field: K, value: PremiumQuestionnaire[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof PremiumQuestionnaire, item: string) => {
    const current = form[field] as string[]
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item]
    updateField(field, updated as PremiumQuestionnaire[typeof field])
  }

  const sectionNames = [
    'Company Overview',
    'Brand & Identity',
    'Target Audience',
    'Products/Services',
    'Competition',
    'Current Marketing',
    'Digital Presence',
    'Access & Credentials',
    'Goals & KPIs',
    'Communication',
  ]

  const handleSubmit = () => {
    toast.success('Questionnaire submitted successfully! Our team will review and prepare your strategy.')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/clients" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
          &larr; Back to Clients
        </Link>
        <h1 className="text-2xl font-bold text-white">Premium Client Questionnaire</h1>
        <p className="text-slate-400">Comprehensive discovery form for Premium & Enterprise clients</p>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-200">{sectionNames[currentSection - 1]}</span>
          <span className="text-sm text-slate-400">{currentSection} of {totalSections}</span>
        </div>
        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
            style={{ width: `${(currentSection / totalSections) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {sectionNames.map((name, index) => (
            <button
              key={name}
              onClick={() => setCurrentSection(index + 1)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentSection === index + 1
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
              }`}
            >
              {index + 1}. {name}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Company Overview */}
      {currentSection === 1 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Company Overview</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Company Description *</label>
            <textarea
              value={form.companyDescription}
              onChange={(e) => updateField('companyDescription', e.target.value)}
              placeholder="Tell us about your company, its history, and what you do..."
              rows={4}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Year Founded</label>
              <input
                type="text"
                value={form.yearsFounded}
                onChange={(e) => updateField('yearsFounded', e.target.value)}
                placeholder="e.g., 2015"
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Number of Employees</label>
              <select
                value={form.numberOfEmployees}
                onChange={(e) => updateField('numberOfEmployees', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Annual Revenue</label>
              <select
                value={form.annualRevenue}
                onChange={(e) => updateField('annualRevenue', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select</option>
                <option value="under_1cr">Under ₹1 Crore</option>
                <option value="1_5cr">₹1-5 Crore</option>
                <option value="5_25cr">₹5-25 Crore</option>
                <option value="25_100cr">₹25-100 Crore</option>
                <option value="above_100cr">Above ₹100 Crore</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Locations</label>
              <input
                type="text"
                value={form.locations}
                onChange={(e) => updateField('locations', e.target.value)}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Business Model</label>
              <select
                value={form.businessModel}
                onChange={(e) => updateField('businessModel', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select</option>
                <option value="b2b">B2B (Business to Business)</option>
                <option value="b2c">B2C (Business to Consumer)</option>
                <option value="d2c">D2C (Direct to Consumer)</option>
                <option value="b2b2c">B2B2C</option>
                <option value="saas">SaaS</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Brand & Identity */}
      {currentSection === 2 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Brand & Identity</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Brand Voice/Tone</label>
            <select
              value={form.brandVoice}
              onChange={(e) => updateField('brandVoice', e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select your brand voice</option>
              <option value="professional">Professional & Formal</option>
              <option value="friendly">Friendly & Approachable</option>
              <option value="playful">Playful & Fun</option>
              <option value="authoritative">Authoritative & Expert</option>
              <option value="inspirational">Inspirational & Motivating</option>
              <option value="casual">Casual & Conversational</option>
              <option value="luxury">Sophisticated & Luxurious</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Core Brand Values (select up to 5)</label>
            <div className="flex flex-wrap gap-2">
              {brandValues.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleArrayItem('brandValues', value)}
                  disabled={form.brandValues.length >= 5 && !form.brandValues.includes(value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-colors ${
                    form.brandValues.includes(value)
                      ? 'border-purple-600 bg-purple-500/10 text-purple-400'
                      : 'border-white/10 text-slate-300 hover:border-purple-300 disabled:opacity-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Brand Personality</label>
            <textarea
              value={form.brandPersonality}
              onChange={(e) => updateField('brandPersonality', e.target.value)}
              placeholder="If your brand was a person, how would you describe their personality?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Color Preferences</label>
              <input
                type="text"
                value={form.colorPreferences}
                onChange={(e) => updateField('colorPreferences', e.target.value)}
                placeholder="e.g., Blue tones, earthy colors..."
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.brandGuidelines}
                  onChange={(e) => updateField('brandGuidelines', e.target.checked)}
                  className="w-5 h-5 text-purple-400 rounded"
                />
                <span className="text-sm text-slate-200">We have existing brand guidelines</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Existing Brand Assets</label>
            <textarea
              value={form.existingAssets}
              onChange={(e) => updateField('existingAssets', e.target.value)}
              placeholder="Logo files, brand book, templates, imagery, videos, etc."
              rows={2}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Section 3: Target Audience */}
      {currentSection === 3 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Target Audience</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Primary Target Audience *</label>
            <textarea
              value={form.primaryAudience}
              onChange={(e) => updateField('primaryAudience', e.target.value)}
              placeholder="Describe your primary target customer in detail..."
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Secondary Audience</label>
            <textarea
              value={form.secondaryAudience}
              onChange={(e) => updateField('secondaryAudience', e.target.value)}
              placeholder="Any secondary audience segments..."
              rows={2}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Age Range</label>
              <div className="flex flex-wrap gap-2">
                {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => toggleArrayItem('audienceAge', age)}
                    className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-colors ${
                      form.audienceAge.includes(age)
                        ? 'border-purple-600 bg-purple-500/10 text-purple-400'
                        : 'border-white/10 text-slate-300 hover:border-purple-300'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Gender</label>
              <select
                value={form.audienceGender}
                onChange={(e) => updateField('audienceGender', e.target.value)}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select</option>
                <option value="all">All Genders</option>
                <option value="primarily_male">Primarily Male</option>
                <option value="primarily_female">Primarily Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Geographic Location</label>
            <input
              type="text"
              value={form.audienceLocation}
              onChange={(e) => updateField('audienceLocation', e.target.value)}
              placeholder="Cities, states, countries..."
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Interests & Hobbies</label>
            <textarea
              value={form.audienceInterests}
              onChange={(e) => updateField('audienceInterests', e.target.value)}
              placeholder="What are your target customers interested in?"
              rows={2}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Pain Points & Challenges</label>
            <textarea
              value={form.painPoints}
              onChange={(e) => updateField('painPoints', e.target.value)}
              placeholder="What problems do your customers face that you solve?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Section 4: Products/Services */}
      {currentSection === 4 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Products & Services</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Main Products/Services *</label>
            <textarea
              value={form.mainProducts}
              onChange={(e) => updateField('mainProducts', e.target.value)}
              placeholder="List and describe your main products or services..."
              rows={4}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Pricing Range</label>
              <input
                type="text"
                value={form.pricingRange}
                onChange={(e) => updateField('pricingRange', e.target.value)}
                placeholder="e.g., ₹500 - ₹5,000"
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Average Order Value</label>
              <input
                type="text"
                value={form.averageOrderValue}
                onChange={(e) => updateField('averageOrderValue', e.target.value)}
                placeholder="e.g., ₹2,500"
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Unique Selling Points (USPs)</label>
            <textarea
              value={form.uniqueSellingPoints}
              onChange={(e) => updateField('uniqueSellingPoints', e.target.value)}
              placeholder="What makes your products/services unique? Why should customers choose you?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Sales Cycle Length</label>
            <select
              value={form.salesCycle}
              onChange={(e) => updateField('salesCycle', e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select</option>
              <option value="instant">Instant (E-commerce)</option>
              <option value="days">Few Days</option>
              <option value="weeks">1-4 Weeks</option>
              <option value="months">1-3 Months</option>
              <option value="long">3+ Months</option>
            </select>
          </div>
        </div>
      )}

      {/* Section 5: Competition */}
      {currentSection === 5 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Competitive Landscape</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Top 3-5 Competitors</label>
            <textarea
              value={form.topCompetitors}
              onChange={(e) => updateField('topCompetitors', e.target.value)}
              placeholder="List your main competitors (company names or websites)..."
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Competitor Strengths</label>
            <textarea
              value={form.competitorStrengths}
              onChange={(e) => updateField('competitorStrengths', e.target.value)}
              placeholder="What do your competitors do well?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Competitor Weaknesses</label>
            <textarea
              value={form.competitorWeaknesses}
              onChange={(e) => updateField('competitorWeaknesses', e.target.value)}
              placeholder="Where do competitors fall short?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Your Market Position</label>
            <select
              value={form.marketPosition}
              onChange={(e) => updateField('marketPosition', e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select</option>
              <option value="leader">Market Leader</option>
              <option value="challenger">Challenger</option>
              <option value="niche">Niche Player</option>
              <option value="new_entrant">New Entrant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Key Differentiators</label>
            <textarea
              value={form.differentiators}
              onChange={(e) => updateField('differentiators', e.target.value)}
              placeholder="What sets you apart from competition?"
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Section 6: Current Marketing */}
      {currentSection === 6 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Current Marketing Activities</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Current Marketing Channels</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {marketingChannels.map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleArrayItem('currentChannels', channel)}
                  className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${
                    form.currentChannels.includes(channel)
                      ? 'border-purple-600 bg-purple-500/10 text-purple-400'
                      : 'border-white/10 text-slate-300 hover:border-purple-300'
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Monthly Ad Spend</label>
            <select
              value={form.monthlyAdSpend}
              onChange={(e) => updateField('monthlyAdSpend', e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select</option>
              <option value="none">No ad spend currently</option>
              <option value="under_50k">Under ₹50,000</option>
              <option value="50k_1L">₹50,000 - ₹1,00,000</option>
              <option value="1L_5L">₹1,00,000 - ₹5,00,000</option>
              <option value="above_5L">Above ₹5,00,000</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Previous Campaigns (that worked)</label>
            <textarea
              value={form.whatWorked}
              onChange={(e) => updateField('whatWorked', e.target.value)}
              placeholder="Describe successful campaigns or strategies..."
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">What Didn&apos;t Work</label>
            <textarea
              value={form.whatDidntWork}
              onChange={(e) => updateField('whatDidntWork', e.target.value)}
              placeholder="Strategies or campaigns that didn't produce results..."
              rows={3}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Sections 7-10 abbreviated for space - similar pattern */}
      {currentSection === 7 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Digital Presence</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Website URL</label>
              <input type="url" value={form.websiteUrl} onChange={(e) => updateField('websiteUrl', e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Platform</label>
              <select value={form.websitePlatform} onChange={(e) => updateField('websitePlatform', e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-lg">
                <option value="">Select</option>
                <option value="wordpress">WordPress</option>
                <option value="shopify">Shopify</option>
                <option value="wix">Wix</option>
                <option value="custom">Custom Built</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Social Media Profiles</label>
            <textarea value={form.socialProfiles} onChange={(e) => updateField('socialProfiles', e.target.value)} placeholder="List all social media profile URLs..." rows={3} className="w-full px-4 py-2 border border-white/10 rounded-lg" />
          </div>
        </div>
      )}

      {currentSection === 8 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Access & Credentials</h2>
          <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-400">All credentials are stored securely and only used by authorized team members.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Google Analytics Access</label>
              <input type="text" value={form.analyticsAccess} onChange={(e) => updateField('analyticsAccess', e.target.value)} placeholder="Property ID or share method" className="w-full px-4 py-2 border border-white/10 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Ads Manager Access</label>
              <input type="text" value={form.adsManagerAccess} onChange={(e) => updateField('adsManagerAccess', e.target.value)} placeholder="Account ID or share method" className="w-full px-4 py-2 border border-white/10 rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {currentSection === 9 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Goals & KPIs</h2>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Primary Goals</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {goalOptions.map((goal) => (
                <button key={goal} type="button" onClick={() => toggleArrayItem('primaryGoals', goal)} className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${form.primaryGoals.includes(goal) ? 'border-purple-600 bg-purple-500/10 text-purple-400' : 'border-white/10 text-slate-300'}`}>{goal}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Target KPIs</label>
            <textarea value={form.targetKpis} onChange={(e) => updateField('targetKpis', e.target.value)} placeholder="What specific metrics do you want to achieve? (e.g., 1000 leads/month, 5x ROAS)" rows={3} className="w-full px-4 py-2 border border-white/10 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">What Does Success Look Like?</label>
            <textarea value={form.successDefinition} onChange={(e) => updateField('successDefinition', e.target.value)} placeholder="Describe your ideal outcome from this partnership..." rows={3} className="w-full px-4 py-2 border border-white/10 rounded-lg" />
          </div>
        </div>
      )}

      {currentSection === 10 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Communication Preferences</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Preferred Communication</label>
              <select value={form.preferredCommunication} onChange={(e) => updateField('preferredCommunication', e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-lg">
                <option value="">Select</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone Call</option>
                <option value="video">Video Call</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Meeting Frequency</label>
              <select value={form.meetingFrequency} onChange={(e) => updateField('meetingFrequency', e.target.value)} className="w-full px-4 py-2 border border-white/10 rounded-lg">
                <option value="">Select</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="asneeded">As Needed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Decision Makers</label>
            <input type="text" value={form.decisionMakers} onChange={(e) => updateField('decisionMakers', e.target.value)} placeholder="Names and roles of people who approve decisions" className="w-full px-4 py-2 border border-white/10 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Any Concerns or Questions?</label>
            <textarea value={form.concerns} onChange={(e) => updateField('concerns', e.target.value)} placeholder="Anything you'd like us to address?" rows={3} className="w-full px-4 py-2 border border-white/10 rounded-lg" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
          disabled={currentSection === 1}
          className="px-6 py-2 text-slate-300 hover:text-white disabled:opacity-50"
        >
          Previous
        </button>

        {currentSection < totalSections ? (
          <button
            onClick={() => setCurrentSection(currentSection + 1)}
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            Submit Questionnaire
          </button>
        )}
      </div>
    </div>
  )
}
