'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

interface ServiceItem {
  serviceId: string
  name: string
  price: number
  isRequired: boolean
  isSelected: boolean
  description?: string
}

interface ScopeItem {
  id: string
  category: string
  item: string
  quantity: number
  isModifiable: boolean
  min: number
  max: number
  unit?: string
}

const defaultServices: ServiceItem[] = [
  { serviceId: 'seo', name: 'SEO', price: 25000, isRequired: false, isSelected: false, description: 'Search Engine Optimization' },
  { serviceId: 'social', name: 'Social Media Management', price: 20000, isRequired: false, isSelected: false, description: 'Content creation & posting' },
  { serviceId: 'ads', name: 'Paid Ads Management', price: 15000, isRequired: false, isSelected: false, description: 'Google & Meta Ads' },
  { serviceId: 'web', name: 'Website Development', price: 50000, isRequired: false, isSelected: false, description: 'Custom website' },
  { serviceId: 'content', name: 'Content Writing', price: 10000, isRequired: false, isSelected: false, description: 'Blogs & articles' },
  { serviceId: 'gmb', name: 'Google My Business', price: 5000, isRequired: false, isSelected: false, description: 'GMB optimization' },
  { serviceId: 'email', name: 'Email Marketing', price: 8000, isRequired: false, isSelected: false, description: 'Email campaigns' },
  { serviceId: 'video', name: 'Video Production', price: 30000, isRequired: false, isSelected: false, description: 'Reels & video content' },
]

const scopeTemplates: Record<string, ScopeItem[]> = {
  seo: [
    { id: 'seo-blogs', category: 'SEO', item: 'Blog Posts', quantity: 4, isModifiable: true, min: 2, max: 10, unit: 'per month' },
    { id: 'seo-backlinks', category: 'SEO', item: 'Backlinks', quantity: 20, isModifiable: true, min: 10, max: 50, unit: 'per month' },
    { id: 'seo-keywords', category: 'SEO', item: 'Target Keywords', quantity: 10, isModifiable: false, min: 10, max: 10 },
  ],
  social: [
    { id: 'social-posts', category: 'Social', item: 'Posts', quantity: 15, isModifiable: true, min: 8, max: 30, unit: 'per month' },
    { id: 'social-reels', category: 'Social', item: 'Reels', quantity: 4, isModifiable: true, min: 2, max: 8, unit: 'per month' },
    { id: 'social-stories', category: 'Social', item: 'Stories', quantity: 20, isModifiable: true, min: 10, max: 30, unit: 'per month' },
  ],
  ads: [
    { id: 'ads-campaigns', category: 'Ads', item: 'Campaigns', quantity: 2, isModifiable: true, min: 1, max: 5 },
    { id: 'ads-creatives', category: 'Ads', item: 'Ad Creatives', quantity: 10, isModifiable: true, min: 5, max: 20, unit: 'per month' },
  ],
  web: [
    { id: 'web-pages', category: 'Web', item: 'Pages', quantity: 10, isModifiable: true, min: 5, max: 30 },
    { id: 'web-revisions', category: 'Web', item: 'Revisions', quantity: 3, isModifiable: false, min: 3, max: 3, unit: 'rounds' },
  ],
}

const entities = [
  { id: 'BRANDING_PIONEERS', name: 'Branding Pioneers' },
  { id: 'ATZ_MEDAPPZ', name: 'ATZ Medappz' },
]

export default function NewProposalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Step 1: Prospect Details
  const [prospectName, setProspectName] = useState('')
  const [prospectEmail, setProspectEmail] = useState('')
  const [prospectPhone, setProspectPhone] = useState('')
  const [prospectCompany, setProspectCompany] = useState('')
  const [entityType, setEntityType] = useState('BRANDING_PIONEERS')

  // Step 2: Services & Scope
  const [services, setServices] = useState<ServiceItem[]>(defaultServices)
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([])
  const [customPrice, setCustomPrice] = useState<number | null>(null)

  // Step 3: Settings
  const [gstPercentage, setGstPercentage] = useState(18)
  const [validityDays, setValidityDays] = useState(15)
  const [allowServiceModification, setAllowServiceModification] = useState(true)
  const [allowScopeModification, setAllowScopeModification] = useState(true)

  const toggleService = (serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.serviceId === serviceId) {
        const newSelected = !s.isSelected
        // Add or remove scope items
        if (newSelected && scopeTemplates[serviceId]) {
          setScopeItems(items => [...items, ...scopeTemplates[serviceId]])
        } else {
          setScopeItems(items => items.filter(item => item.category.toLowerCase() !== serviceId))
        }
        return { ...s, isSelected: newSelected }
      }
      return s
    }))
  }

  const updateServicePrice = (serviceId: string, price: number) => {
    setServices(prev => prev.map(s =>
      s.serviceId === serviceId ? { ...s, price } : s
    ))
  }

  const updateScopeQuantity = (id: string, quantity: number) => {
    setScopeItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(item.min, Math.min(item.max, quantity)) } : item
    ))
  }

  const selectedServices = services.filter(s => s.isSelected)
  const basePrice = customPrice ?? selectedServices.reduce((sum, s) => sum + s.price, 0)
  const gstAmount = (basePrice * gstPercentage) / 100
  const totalPrice = basePrice + gstAmount

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/accounts/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName,
          prospectEmail,
          prospectPhone,
          prospectCompany,
          entityType,
          services: selectedServices,
          scopeItems,
          basePrice,
          gstPercentage,
          allowServiceModification,
          allowScopeModification,
          validityDays,
        }),
      })

      if (res.ok) {
        router.push('/accounts/proposals')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create proposal')
      }
    } catch (error) {
      console.error('Error creating proposal:', error)
      toast.error('Failed to create proposal')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return prospectName && prospectEmail
    }
    if (step === 2) {
      return selectedServices.length > 0
    }
    return true
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/accounts/proposals" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to Proposals
          </Link>
          <h1 className="text-2xl font-bold text-white">Create New Proposal</h1>
          <p className="text-slate-400 mt-1">Build a proposal for your prospect</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => s < step && setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step === s
                  ? 'bg-emerald-600 text-white'
                  : step > s
                  ? 'bg-emerald-600/50 text-white cursor-pointer'
                  : 'bg-white/10 backdrop-blur-sm text-slate-400'
              }`}
            >
              {step > s ? '✓' : s}
            </button>
            <span className={`ml-2 text-sm ${step === s ? 'text-white' : 'text-slate-400'}`}>
              {s === 1 ? 'Prospect Details' : s === 2 ? 'Services & Scope' : 'Review & Create'}
            </span>
            {s < 3 && <div className="w-12 h-px bg-white/10 backdrop-blur-sm mx-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Prospect Details */}
      {step === 1 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Prospect Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name *</label>
              <input
                type="text"
                value={prospectName}
                onChange={e => setProspectName(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email *</label>
              <input
                type="email"
                value={prospectEmail}
                onChange={e => setProspectEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Phone</label>
              <input
                type="tel"
                value={prospectPhone}
                onChange={e => setProspectPhone(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Company</label>
              <input
                type="text"
                value={prospectCompany}
                onChange={e => setProspectCompany(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                placeholder="Company Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Billing Entity</label>
            <div className="flex gap-4">
              {entities.map(entity => (
                <button
                  key={entity.id}
                  onClick={() => setEntityType(entity.id)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    entityType === entity.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 backdrop-blur-sm border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {entity.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Services & Scope */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Select Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div
                  key={service.serviceId}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    service.isSelected
                      ? 'bg-emerald-600/20 border-emerald-500'
                      : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => toggleService(service.serviceId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        service.isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-white/30'
                      }`}>
                        {service.isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-slate-400">{service.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Rs.</span>
                        <input
                          type="number"
                          value={service.price}
                          onChange={e => updateServicePrice(service.serviceId, Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded text-white text-right focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {scopeItems.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Scope of Work</h2>
              <div className="space-y-4">
                {Object.entries(
                  scopeItems.reduce((acc, item) => {
                    acc[item.category] = acc[item.category] || []
                    acc[item.category].push(item)
                    return acc
                  }, {} as Record<string, ScopeItem[]>)
                ).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                          <span className="text-white">{item.item}</span>
                          <div className="flex items-center gap-2">
                            {item.isModifiable ? (
                              <>
                                <button
                                  onClick={() => updateScopeQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 rounded bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-white">{item.quantity}</span>
                                <button
                                  onClick={() => updateScopeQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 rounded bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-400">{item.quantity}</span>
                            )}
                            {item.unit && <span className="text-xs text-slate-400">{item.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Custom Pricing (Optional)</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customPrice !== null}
                  onChange={e => setCustomPrice(e.target.checked ? basePrice : null)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-slate-300">Override calculated price</span>
              </label>
              {customPrice !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Rs.</span>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={e => setCustomPrice(Number(e.target.value))}
                    className="w-32 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Create */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Proposal Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">GST Rate (%)</label>
                <select
                  value={gstPercentage}
                  onChange={e => setGstPercentage(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Valid For</label>
                <select
                  value={validityDays}
                  onChange={e => setValidityDays(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
                >
                  <option value={7}>7 days</option>
                  <option value={15}>15 days</option>
                  <option value={30}>30 days</option>
                  <option value={45}>45 days</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowServiceModification}
                  onChange={e => setAllowServiceModification(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-slate-300">Allow client to modify services</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowScopeModification}
                  onChange={e => setAllowScopeModification(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-slate-300">Allow client to modify scope quantities</span>
              </label>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Proposal Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Prospect</h3>
                <p className="text-white font-medium">{prospectName}</p>
                <p className="text-slate-400 text-sm">{prospectEmail}</p>
                {prospectCompany && <p className="text-slate-400 text-sm">{prospectCompany}</p>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Selected Services</h3>
                <div className="space-y-1">
                  {selectedServices.map(s => (
                    <div key={s.serviceId} className="flex justify-between text-sm">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="text-white">Rs.{s.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 mt-4 pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Base Price</span>
                <span className="text-white">Rs.{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">GST ({gstPercentage}%)</span>
                <span className="text-white">Rs.{gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-white/10 pt-2">
                <span className="text-white">Total</span>
                <span className="text-emerald-400">Rs.{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="px-6 py-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Previous
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Proposal'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
