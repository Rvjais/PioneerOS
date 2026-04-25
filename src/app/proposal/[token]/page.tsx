'use client'

import { useState, useEffect, use } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Service {
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

interface Proposal {
  id: string
  prospectName: string
  prospectEmail: string
  prospectPhone: string | null
  prospectCompany: string | null
  services: Service[]
  scopeItems: ScopeItem[]
  basePrice: number
  gstPercentage: number
  totalPrice: number
  allowServiceModification: boolean
  allowScopeModification: boolean
  status: string
  entityType: string
  expiresAt: string
  acceptedAt: string | null
}

export default function ClientProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()

  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  const [step, setStep] = useState(1) // 1: Review, 2: Details, 3: Confirm
  const [services, setServices] = useState<Service[]>([])
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([])

  // Client details
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientGst, setClientGst] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    fetchProposal()
  }, [token])

  const fetchProposal = async () => {
    try {
      const res = await fetch(`/api/proposal/${token}`)
      const data = await res.json()

      if (!res.ok) {
        if (data.expired) {
          setExpired(true)
          setError('This proposal has expired. Please contact us for a new proposal.')
        } else {
          setError(data.error || 'Failed to load proposal')
        }
        return
      }

      const p = data.proposal
      setProposal(p)
      setServices(p.services)
      setScopeItems(p.scopeItems)

      // Pre-fill client details from prospect
      setClientName(p.prospectName || '')
      setClientEmail(p.prospectEmail || '')
      setClientPhone(p.prospectPhone || '')
      setClientCompany(p.prospectCompany || '')

      // If already accepted, show success
      if (['ACCEPTED', 'CONVERTED'].includes(p.status)) {
        setAccepted(true)
      }
    } catch (err) {
      console.error('Error fetching proposal:', err)
      setError('Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    if (!proposal?.allowServiceModification) return

    setServices(prev => prev.map(s => {
      if (s.serviceId === serviceId && !s.isRequired) {
        return { ...s, isSelected: !s.isSelected }
      }
      return s
    }))
  }

  const updateScopeQuantity = (id: string, quantity: number) => {
    if (!proposal?.allowScopeModification) return

    setScopeItems(prev => prev.map(item => {
      if (item.id === id && item.isModifiable) {
        return { ...item, quantity: Math.max(item.min, Math.min(item.max, quantity)) }
      }
      return item
    }))
  }

  const selectedServices = services.filter(s => s.isSelected)
  const basePrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const gstAmount = (basePrice * (proposal?.gstPercentage || 18)) / 100
  const totalPrice = basePrice + gstAmount

  const handleAccept = async () => {
    if (!clientName || !clientEmail) {
      toast.error('Please fill in your name and email')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/proposal/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          clientCompany,
          clientGst,
          selectedServices: services,
          selectedScope: scopeItems,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to accept proposal')
        return
      }

      // Redirect to payment page
      router.push(`/proposal/${token}/payment`)
    } catch (err) {
      console.error('Error accepting proposal:', err)
      toast.error('Failed to accept proposal')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || expired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${expired ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
            <svg className={`w-8 h-8 ${expired ? 'text-amber-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            {expired ? 'Proposal Expired' : 'Proposal Not Found'}
          </h1>
          <p className="text-slate-400">
            {error || 'The proposal you are looking for does not exist or has been removed.'}
          </p>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Proposal Already Accepted</h1>
          <p className="text-slate-400 mb-4">
            This proposal has been accepted. Please proceed to payment.
          </p>
          <button
            onClick={() => router.push(`/proposal/${token}/payment`)}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-white/10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-white font-semibold text-xl">
                {proposal?.entityType === 'ATZ_MEDAPPZ' ? 'ATZ Medappz' : 'Branding Pioneers'}
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Valid until: {formatDateDDMMYYYY(proposal?.expiresAt || '')}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-8 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
              {[
                { num: 1, label: 'Review Services' },
                { num: 2, label: 'Your Details' },
                { num: 3, label: 'Confirm' },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <button
                    onClick={() => s.num < step && setStep(s.num)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      step === s.num
                        ? 'bg-emerald-600 text-white'
                        : step > s.num
                        ? 'bg-emerald-600/50 text-white'
                        : 'bg-white/10 backdrop-blur-sm text-slate-400'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </button>
                  <span className={`ml-2 text-sm hidden sm:inline ${step === s.num ? 'text-white' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                  {i < 2 && <div className="w-8 sm:w-12 h-px bg-white/10 backdrop-blur-sm mx-2 sm:mx-4" />}
                </div>
              ))}
            </div>

            {/* Step 1: Review Services */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white">Hello, {proposal?.prospectName}!</h1>
                  <p className="text-slate-400 mt-2">Review the services and scope we&apos;ve prepared for you</p>
                </div>

                {/* Services */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Services</h2>
                    {proposal?.allowServiceModification && (
                      <span className="text-xs text-emerald-400">You can customize</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(service => (
                      <div
                        key={service.serviceId}
                        onClick={() => toggleService(service.serviceId)}
                        className={`p-4 rounded-xl border transition-all ${
                          service.isSelected
                            ? 'bg-emerald-600/20 border-emerald-500'
                            : 'bg-white/5 backdrop-blur-sm border-white/10'
                        } ${proposal?.allowServiceModification && !service.isRequired ? 'cursor-pointer hover:border-white/20' : ''}`}
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
                              {service.isRequired && (
                                <span className="text-xs text-amber-400">Required</span>
                              )}
                            </div>
                          </div>
                          <span className="text-emerald-400">Rs.{service.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scope */}
                {scopeItems.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">Scope of Work</h2>
                      {proposal?.allowScopeModification && (
                        <span className="text-xs text-emerald-400">Adjust quantities as needed</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {scopeItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                          <span className="text-slate-300">{item.item}</span>
                          <div className="flex items-center gap-2">
                            {item.isModifiable && proposal?.allowScopeModification ? (
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
                              <span className="text-white">{item.quantity}</span>
                            )}
                            {item.unit && <span className="text-xs text-slate-400">{item.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Investment Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Price</span>
                      <span className="text-white">Rs.{basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GST ({proposal?.gstPercentage || 18}%)</span>
                      <span className="text-white">Rs.{gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-white font-semibold">Total Investment</span>
                      <span className="text-emerald-400 font-bold text-xl">Rs.{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Client Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white">Your Details</h1>
                  <p className="text-slate-400 mt-2">Please confirm your contact information</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Email *</label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={clientCompany}
                        onChange={e => setClientCompany(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                        placeholder="Company Pvt Ltd"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">GST Number (Optional)</label>
                      <input
                        type="text"
                        value={clientGst}
                        onChange={e => setClientGst(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white">Confirm & Accept</h1>
                  <p className="text-slate-400 mt-2">Review your selections and accept the proposal</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Your Information</h3>
                      <p className="text-white font-medium">{clientName}</p>
                      <p className="text-slate-400 text-sm">{clientEmail}</p>
                      {clientPhone && <p className="text-slate-400 text-sm">{clientPhone}</p>}
                      {clientCompany && <p className="text-slate-400 text-sm">{clientCompany}</p>}
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
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Total Investment</span>
                      <span className="text-emerald-400">Rs.{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-400 text-sm">
                    By accepting this proposal, you agree to the services and pricing outlined above.
                    After acceptance, you will be redirected to complete the payment.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="px-6 py-3 bg-white/5 backdrop-blur-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Previous
              </button>

              {step < 3 ? (
                <button
                  onClick={() => {
                    if (step === 2) {
                      if (!clientName.trim() || !clientEmail.trim()) {
                        toast.error('Please fill in your name and email before continuing')
                        return
                      }
                    }
                    setStep(s => s + 1)
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleAccept}
                  disabled={submitting}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Accept Proposal & Proceed to Payment'
                  )}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
