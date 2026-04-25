'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Trash2, Loader2, CheckCircle, Copy, Check,
  Building2, Mail, Phone, CreditCard, FileText
} from 'lucide-react'

interface ScopeField {
  key: string
  label: string
  type: 'number' | 'text' | 'select'
  placeholder?: string
  options?: string[]
  suffix?: string
}

const SERVICES: Array<{ id: string; name: string; emoji: string; defaultPrice: number; scopeFields: ScopeField[] }> = [
  {
    id: 'SEO', name: 'Search Engine Optimization', emoji: '🔍', defaultPrice: 50000,
    scopeFields: [
      { key: 'keywords', label: 'Target Keywords', type: 'number', placeholder: '20', suffix: 'keywords' },
      { key: 'blogs', label: 'Blogs/Month', type: 'number', placeholder: '4', suffix: 'blogs' },
      { key: 'backlinks', label: 'Backlinks/Month', type: 'number', placeholder: '10', suffix: 'links' },
      { key: 'technicalAudits', label: 'Technical Audits', type: 'select', options: ['Monthly', 'Quarterly', 'One-time'] },
      { key: 'gscAccess', label: 'GSC/GA Setup', type: 'select', options: ['New Setup', 'Existing Access', 'Not Required'] },
    ],
  },
  {
    id: 'SOCIAL_MEDIA', name: 'Social Media Management', emoji: '📱', defaultPrice: 40000,
    scopeFields: [
      { key: 'platforms', label: 'Platforms', type: 'text', placeholder: 'Instagram, Facebook, LinkedIn' },
      { key: 'postsPerMonth', label: 'Posts/Month', type: 'number', placeholder: '12', suffix: 'posts' },
      { key: 'reelsPerMonth', label: 'Reels/Month', type: 'number', placeholder: '4', suffix: 'reels' },
      { key: 'stories', label: 'Stories/Week', type: 'number', placeholder: '5', suffix: 'stories' },
      { key: 'communityManagement', label: 'Community Mgmt', type: 'select', options: ['Included', 'Not Included'] },
      { key: 'contentCreation', label: 'Content Source', type: 'select', options: ['Agency Creates', 'Client Provides Raw', 'Collaborative'] },
    ],
  },
  {
    id: 'PAID_ADS', name: 'Paid Advertising (PPC)', emoji: '📈', defaultPrice: 30000,
    scopeFields: [
      { key: 'adPlatforms', label: 'Ad Platforms', type: 'text', placeholder: 'Google Ads, Meta Ads' },
      { key: 'monthlyAdSpend', label: 'Monthly Ad Spend', type: 'number', placeholder: '50000', suffix: '₹/month' },
      { key: 'campaigns', label: 'Active Campaigns', type: 'number', placeholder: '3', suffix: 'campaigns' },
      { key: 'objective', label: 'Primary Objective', type: 'select', options: ['Lead Gen', 'Brand Awareness', 'Sales', 'App Installs', 'Traffic'] },
      { key: 'landingPages', label: 'Landing Pages', type: 'number', placeholder: '2', suffix: 'pages' },
      { key: 'reporting', label: 'Reporting', type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly'] },
    ],
  },
  {
    id: 'WEB_DEVELOPMENT', name: 'Website Development', emoji: '💻', defaultPrice: 100000,
    scopeFields: [
      { key: 'pages', label: 'Number of Pages', type: 'number', placeholder: '10', suffix: 'pages' },
      { key: 'websiteType', label: 'Website Type', type: 'select', options: ['Business Site', 'E-commerce', 'Landing Pages', 'Web App', 'Blog', 'Portfolio'] },
      { key: 'cms', label: 'CMS/Platform', type: 'select', options: ['WordPress', 'Shopify', 'Custom (React/Next.js)', 'Webflow', 'No Preference'] },
      { key: 'features', label: 'Key Features', type: 'text', placeholder: 'Booking, Payment, Chat, Blog...' },
      { key: 'responsiveDesign', label: 'Responsive Design', type: 'select', options: ['Yes', 'No'] },
      { key: 'maintenance', label: 'Post-launch Support', type: 'select', options: ['3 Months', '6 Months', '12 Months', 'None'] },
    ],
  },
  {
    id: 'GBP', name: 'Google Business Profile', emoji: '📍', defaultPrice: 15000,
    scopeFields: [
      { key: 'locations', label: 'Number of Locations', type: 'number', placeholder: '1', suffix: 'locations' },
      { key: 'postsPerMonth', label: 'GBP Posts/Month', type: 'number', placeholder: '8', suffix: 'posts' },
      { key: 'reviewManagement', label: 'Review Management', type: 'select', options: ['Included', 'Not Included'] },
      { key: 'qnaManagement', label: 'Q&A Management', type: 'select', options: ['Included', 'Not Included'] },
    ],
  },
  {
    id: 'CONTENT', name: 'Content Marketing', emoji: '✍️', defaultPrice: 35000,
    scopeFields: [
      { key: 'articlesPerMonth', label: 'Articles/Month', type: 'number', placeholder: '8', suffix: 'articles' },
      { key: 'wordCount', label: 'Avg Word Count', type: 'select', options: ['500-800', '800-1200', '1200-2000', '2000+'] },
      { key: 'contentTypes', label: 'Content Types', type: 'text', placeholder: 'Blogs, Case Studies, Whitepapers...' },
      { key: 'seoOptimized', label: 'SEO Optimized', type: 'select', options: ['Yes', 'No'] },
      { key: 'socialSnippets', label: 'Social Snippets', type: 'select', options: ['Included', 'Not Included'] },
    ],
  },
  {
    id: 'EMAIL', name: 'Email Marketing', emoji: '📧', defaultPrice: 25000,
    scopeFields: [
      { key: 'campaignsPerMonth', label: 'Campaigns/Month', type: 'number', placeholder: '4', suffix: 'campaigns' },
      { key: 'listSize', label: 'Email List Size', type: 'text', placeholder: 'Approx subscribers' },
      { key: 'automationFlows', label: 'Automation Flows', type: 'number', placeholder: '2', suffix: 'flows' },
      { key: 'platform', label: 'Platform', type: 'select', options: ['Mailchimp', 'Sendinblue', 'HubSpot', 'Custom', 'No Preference'] },
    ],
  },
  {
    id: 'BRANDING', name: 'Branding & Design', emoji: '🎨', defaultPrice: 75000,
    scopeFields: [
      { key: 'deliverables', label: 'Deliverables', type: 'text', placeholder: 'Logo, Brand Guide, Cards, Brochure...' },
      { key: 'revisions', label: 'Revision Rounds', type: 'number', placeholder: '3', suffix: 'rounds' },
      { key: 'brandGuide', label: 'Brand Guide', type: 'select', options: ['Included', 'Not Included'] },
      { key: 'socialTemplates', label: 'Social Templates', type: 'number', placeholder: '5', suffix: 'templates' },
    ],
  },
]

const ENTITIES = [
  { id: 'BRANDING_PIONEERS', name: 'Branding Pioneers' },
  { id: 'ATZ_MEDAPPZ', name: 'ATZ Medappz' },
]

const CONTRACT_DURATIONS = [
  { id: '3_MONTHS', label: '3 Months' },
  { id: '6_MONTHS', label: '6 Months' },
  { id: '12_MONTHS', label: '12 Months' },
  { id: '24_MONTHS', label: '24 Months' },
]

const PAYMENT_TERMS = [
  { id: 'ADVANCE_100', label: '100% Advance' },
  { id: 'ADVANCE_50', label: '50% Advance' },
  { id: 'NET_15', label: 'Net 15 Days' },
  { id: 'NET_30', label: 'Net 30 Days' },
]

export default function CreateOnboardingClient() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdLink, setCreatedLink] = useState<{ url: string; token: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Prospect
    prospectName: '',
    prospectEmail: '',
    prospectPhone: '',
    prospectCompany: '',

    // Entity & Services
    entityType: 'BRANDING_PIONEERS',
    services: [] as Array<{ serviceId: string; name: string; price: number; pricePeriod: 'monthly' | 'yearly'; scope: Record<string, string> }>,

    // Contract
    contractDuration: '12_MONTHS',
    paymentTerms: 'ADVANCE_100',
    advancePercentage: 100,

    // Link
    expiresInDays: 7,
    notes: '',
  })

  const calculateTotal = () => {
    const basePrice = formData.services.reduce((sum, s) => sum + s.price, 0)
    const gstAmount = Math.round(basePrice * 0.18)
    const totalPrice = basePrice + gstAmount
    const advanceAmount = Math.round(totalPrice * (formData.advancePercentage / 100))
    return { basePrice, gstAmount, totalPrice, advanceAmount }
  }

  const addService = (serviceId: string) => {
    const service = SERVICES.find(s => s.id === serviceId)
    if (service && !formData.services.find(s => s.serviceId === serviceId)) {
      setFormData({
        ...formData,
        services: [
          ...formData.services,
          { serviceId: service.id, name: service.name, price: service.defaultPrice, pricePeriod: 'monthly' as const, scope: {} },
        ],
      })
    }
  }

  const removeService = (serviceId: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s.serviceId !== serviceId),
    })
  }

  const updateServicePrice = (serviceId: string, price: number) => {
    setFormData({
      ...formData,
      services: formData.services.map(s =>
        s.serviceId === serviceId ? { ...s, price } : s
      ),
    })
  }

  const updateServicePricePeriod = (serviceId: string, period: 'monthly' | 'yearly') => {
    setFormData({
      ...formData,
      services: formData.services.map(s =>
        s.serviceId === serviceId ? { ...s, pricePeriod: period } : s
      ),
    })
  }

  const updateServiceScope = (serviceId: string, key: string, value: string) => {
    setFormData({
      ...formData,
      services: formData.services.map(s =>
        s.serviceId === serviceId ? { ...s, scope: { ...s.scope, [key]: value } } : s
      ),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.prospectName || !formData.prospectEmail || !formData.prospectPhone) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.services.length === 0) {
      setError('Please select at least one service')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { basePrice } = calculateTotal()

      // Ensure all numeric values are numbers, not strings
      const payload = {
        prospectName: formData.prospectName.trim(),
        prospectEmail: formData.prospectEmail.trim(),
        prospectPhone: formData.prospectPhone.trim(),
        prospectCompany: formData.prospectCompany.trim() || undefined,
        entityType: formData.entityType,
        services: formData.services.map(s => ({
          serviceId: s.serviceId,
          name: s.name,
          price: Number(s.price) || 0,
          pricePeriod: s.pricePeriod || 'monthly',
          scope: s.scope || {},
        })),
        contractDuration: formData.contractDuration,
        paymentTerms: formData.paymentTerms,
        advancePercentage: Number(formData.advancePercentage),
        expiresInDays: Number(formData.expiresInDays) || 7,
        notes: formData.notes || undefined,
        basePrice: Number(basePrice),
        gstPercentage: 18,
      }

      const res = await fetch('/api/accounts/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        // Show detailed validation errors if available
        if (result.details) {
          const detailMessages = Object.entries(result.details)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
            .join('. ')
          throw new Error(`${result.error}: ${detailMessages}`)
        }
        throw new Error(result.error || 'Failed to create onboarding link')
      }

      setCreatedLink({
        url: result.proposal.url,
        token: result.proposal.token,
      })
      setIsSuccess(true)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const { basePrice, gstAmount, totalPrice, advanceAmount } = calculateTotal()

  // Success State
  if (isSuccess && createdLink) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Link Created Successfully!</h2>
          <p className="text-gray-300 mb-6">
            Share this link with your client to start their onboarding process.
          </p>

          <div className="bg-gray-900/40 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Onboarding Link</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={createdLink.url}
                readOnly
                className="flex-1 px-3 py-2 glass-card border border-white/20 rounded-lg text-sm"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/accounts/onboarding"
              className="px-4 py-2 border border-white/20 text-gray-200 rounded-lg hover:bg-gray-900/40"
            >
              View All Links
            </Link>
            <button
              onClick={() => {
                setIsSuccess(false)
                setCreatedLink(null)
                setFormData({
                  prospectName: '', prospectEmail: '', prospectPhone: '', prospectCompany: '',
                  entityType: 'BRANDING_PIONEERS', services: [],
                  contractDuration: '12_MONTHS', paymentTerms: 'ADVANCE_100',
                  advancePercentage: 100, expiresInDays: 7, notes: '',
                })
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/accounts/onboarding"
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Onboarding
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Onboarding Link</h1>
        <p className="text-gray-400">Generate a new client onboarding link with pricing and services</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Prospect Details */}
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-gray-400" />
            Prospect Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Company / Brand Name *
              </label>
              <input
                type="text"
                value={formData.prospectName}
                onChange={e => setFormData({ ...formData, prospectName: e.target.value })}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.prospectCompany}
                onChange={e => setFormData({ ...formData, prospectCompany: e.target.value })}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Contact person name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.prospectEmail}
                onChange={e => setFormData({ ...formData, prospectEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.prospectPhone}
                onChange={e => setFormData({ ...formData, prospectPhone: e.target.value })}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
                required
              />
            </div>
          </div>
        </div>

        {/* Entity & Services */}
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-400" />
            Services & Pricing
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Entity
              </label>
              <select
                value={formData.entityType}
                onChange={e => setFormData({ ...formData, entityType: e.target.value })}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {ENTITIES.map(entity => (
                  <option key={entity.id} value={entity.id}>{entity.name}</option>
                ))}
              </select>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Add Services
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICES.filter(s => !formData.services.find(fs => fs.serviceId === s.id)).map(service => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => addService(service.id)}
                    className="inline-flex items-center px-3 py-2 bg-slate-800/50 text-gray-200 rounded-xl hover:bg-white/10 text-sm border border-white/5 hover:border-blue-500/30 transition-all"
                  >
                    <span className="mr-1.5">{service.emoji}</span>
                    {service.name}
                    <Plus className="w-3 h-3 ml-1.5 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Services with Scope */}
            {formData.services.length > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-200">
                  Selected Services & Scope of Work
                </label>
                {formData.services.map(service => {
                  const serviceDef = SERVICES.find(s => s.id === service.serviceId)
                  return (
                    <div
                      key={service.serviceId}
                      className="bg-slate-900/40 rounded-xl border border-white/10 overflow-hidden"
                    >
                      {/* Service Header */}
                      <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{serviceDef?.emoji}</span>
                          <span className="font-medium text-white">{service.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">₹</span>
                          <input
                            type="number"
                            value={service.price}
                            onChange={e => updateServicePrice(service.serviceId, parseInt(e.target.value) || 0)}
                            className="w-24 px-3 py-1.5 bg-slate-800/50 border border-white/10 rounded-lg text-right text-sm text-white focus:ring-1 focus:ring-blue-500"
                            min="0"
                            step="1"
                          />
                          <select
                            value={service.pricePeriod}
                            onChange={e => updateServicePricePeriod(service.serviceId, e.target.value as 'monthly' | 'yearly')}
                            className="px-2 py-1.5 bg-slate-800/50 border border-white/10 rounded-lg text-xs text-gray-300 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="monthly">/mo</option>
                            <option value="yearly">/yr</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeService(service.serviceId)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Scope Fields */}
                      {serviceDef && serviceDef.scopeFields.length > 0 && (
                        <div className="p-4 bg-slate-950/30">
                          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Scope of Work</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {serviceDef.scopeFields.map(field => (
                              <div key={field.key}>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                  {field.label}
                                </label>
                                {field.type === 'select' ? (
                                  <select
                                    value={service.scope[field.key] || ''}
                                    onChange={e => updateServiceScope(service.serviceId, field.key, e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="">Select...</option>
                                    {field.options?.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="flex items-center">
                                    <input
                                      type={field.type}
                                      value={service.scope[field.key] || ''}
                                      onChange={e => updateServiceScope(service.serviceId, field.key, e.target.value)}
                                      placeholder={field.placeholder}
                                      className="w-full px-3 py-1.5 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500"
                                    />
                                    {field.suffix && (
                                      <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">{field.suffix}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Contract Terms */}
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
            Contract Terms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Contract Duration
              </label>
              <select
                value={formData.contractDuration}
                onChange={e => setFormData({ ...formData, contractDuration: e.target.value })}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {CONTRACT_DURATIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Payment Terms
              </label>
              <select
                value={formData.paymentTerms}
                onChange={e => {
                  const term = e.target.value
                  let advPct = 100
                  if (term === 'ADVANCE_50') advPct = 50
                  else if (term === 'NET_15' || term === 'NET_30') advPct = 0
                  setFormData({ ...formData, paymentTerms: term, advancePercentage: advPct })
                }}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_TERMS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Link Expires In
              </label>
              <select
                value={formData.expiresInDays}
                onChange={e => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Internal notes about this proposal..."
            />
          </div>
        </div>

        {/* Summary */}
        {formData.services.length > 0 && (
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Price Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Base Price</p>
                <p className="text-lg font-semibold text-white">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(basePrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">GST (18%)</p>
                <p className="text-lg font-semibold text-white">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(gstAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-lg font-semibold text-white">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPrice)}
                </p>
              </div>
              <div className="glass-card rounded-lg p-2">
                <p className="text-sm text-blue-400">Advance Due</p>
                <p className="text-lg font-bold text-blue-400">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(advanceAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/accounts/onboarding"
            className="px-6 py-2.5 border border-white/20 text-gray-200 rounded-lg hover:bg-gray-900/40"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || formData.services.length === 0}
            className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
