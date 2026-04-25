'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface MaintenancePlan {
  id: string
  name: string
  billingCycle: string
  price: number
  currency: string
  monthlyEquivalent?: number
  savings?: number
  features: string[]
  recommended: boolean
}

interface CurrentPlan {
  id: string
  type: string
  startDate: string
  endDate: string
  amount: number
  billingCycle: string
  nextBillingDate: string | null
  autoRenew: boolean
  status: string
  daysRemaining: number
}

interface UpsellOption {
  id: string
  name: string
  description: string
  status: string
}

interface MaintenanceData {
  plans: MaintenancePlan[]
  currentPlan: CurrentPlan | null
  maintenanceNeeded: boolean
  websiteUrl: string | null
  upsellOptions: UpsellOption[]
}

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingFilter, setBillingFilter] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMaintenance()
  }, [])

  const fetchMaintenance = async () => {
    try {
      const res = await fetch('/api/web-portal/maintenance')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch maintenance:', error)
      setError('Failed to load maintenance plans')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPlan = async () => {
    if (!selectedPlan) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/web-portal/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          notes: notes.trim() || undefined,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setShowRequestModal(false)
        fetchMaintenance()
      }
    } catch (error) {
      console.error('Failed to request plan:', error)
      setError('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchMaintenance(); }} className="mt-4 text-red-400 underline">
          Try again
        </button>
      </div>
    )
  }

  const filteredPlans = data?.plans.filter(p => p.billingCycle === billingFilter) || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/portal/web" className="text-slate-400 hover:text-teal-600">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-white font-medium">Maintenance Plans</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Maintenance Plans</h1>
        <p className="text-slate-400 mt-1">Keep your website secure, fast, and up-to-date</p>
      </div>

      {/* Success Message */}
      {submitted && (
        <div className="bg-green-500/10 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-400">
              Your maintenance plan request has been submitted. Our team will contact you shortly.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan */}
      {data?.currentPlan && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-teal-100 text-sm uppercase tracking-wide">Current Plan</span>
              <h2 className="text-2xl font-bold mt-1">Active Maintenance</h2>
              <p className="text-teal-100 mt-2">
                {data.currentPlan.billingCycle} plan - {data.currentPlan.daysRemaining} days remaining
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">
                {data.currentPlan.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              </span>
              <p className="text-teal-100">/{data.currentPlan.billingCycle.toLowerCase()}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <span className="text-sm">
              Valid until {formatDateDDMMYYYY(data.currentPlan.endDate)}
            </span>
            {data.currentPlan.autoRenew && (
              <span className="flex items-center gap-1 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Auto-renew enabled
              </span>
            )}
          </div>
        </div>
      )}

      {/* Plans */}
      {!data?.currentPlan && (
        <>
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="bg-slate-800/50 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setBillingFilter('MONTHLY')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingFilter === 'MONTHLY'
                    ? 'glass-card text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingFilter('ANNUAL')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingFilter === 'ANNUAL'
                    ? 'glass-card text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Annual
                <span className="ml-2 text-xs text-green-400">Save 2 months</span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`glass-card rounded-xl border-2 p-6 relative ${
                  plan.recommended
                    ? 'border-teal-500 shadow-none'
                    : selectedPlan === plan.id
                    ? 'border-teal-300'
                    : 'border-white/10'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Recommended
                  </span>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">
                      {plan.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-slate-400">/{plan.billingCycle.toLowerCase()}</span>
                  </div>
                  {plan.monthlyEquivalent && (
                    <p className="text-sm text-green-400 mt-1">
                      {plan.monthlyEquivalent.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}/month
                      <span className="text-green-500"> (Save {plan.savings?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })})</span>
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={`feature-${feature}-${i}`} className="flex items-start gap-2 text-sm text-slate-300">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setSelectedPlan(plan.id)
                    setShowRequestModal(true)
                  }}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.recommended
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  Select Plan
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* AI Tools Upsell */}
      {data?.upsellOptions && data.upsellOptions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">AI-Powered Tools</h3>
              <p className="text-sm text-purple-400">Enhance your website with intelligent features</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.upsellOptions.map((option) => (
              <div key={option.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{option.name}</h4>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-slate-300">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Request Maintenance Plan</h2>
            <p className="text-slate-300 mb-4">
              Our team will contact you to finalize the plan and payment details.
            </p>
            {error && (
              <div className="bg-red-500/10 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Additional Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific requirements or questions..."
                rows={3}
                className="w-full px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 text-slate-300 bg-slate-800/50 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPlan}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Why Maintenance */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Why Website Maintenance?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-medium text-white">Security Updates</h3>
            <p className="text-sm text-slate-400 mt-1">
              Regular patches protect against vulnerabilities and keep your site secure
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-white">Performance</h3>
            <p className="text-sm text-slate-400 mt-1">
              Optimized loading times and smooth user experience
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-medium text-white">Peace of Mind</h3>
            <p className="text-sm text-slate-400 mt-1">
              Regular backups and monitoring ensure your site is always running
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
