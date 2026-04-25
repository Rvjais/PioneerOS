'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, BookOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { GlassCard, PrimaryButton } from './ui'
import { POLICIES, formatDate } from './types'
import type { StepProps } from './types'
import SignatureCapture from './SignatureCapture'

export default function Step5CompanyPolicies({ data, token, onComplete }: StepProps) {
  const [expanded, setExpanded] = useState<string | null>(POLICIES[0].key)

  const initialChecked = useMemo(() => {
    const state: Record<string, boolean> = {}
    for (const policy of POLICIES) {
      const backendKey = policy.key as keyof typeof data.policies
      state[policy.key] = (typeof data.policies[backendKey] === 'boolean' && data.policies[backendKey]) || false
    }
    if (data.policies.accepted) {
      for (const policy of POLICIES) {
        state[policy.key] = true
      }
    }
    return state
  }, [data.policies])

  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [signerName, setSignerName] = useState(data.candidate.name || '')
  const [agreed, setAgreed] = useState(false)
  const [signatureData, setSignatureData] = useState('')
  const [signatureType, setSignatureType] = useState<'type' | 'draw'>('type')

  const totalPolicies = POLICIES.length
  const checkedCount = Object.values(checked).filter(Boolean).length
  const allChecked = checkedCount === totalPolicies

  const togglePolicy = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async () => {
    if (!allChecked) {
      setError('Please acknowledge all policies.')
      return
    }
    if (!signerName || !agreed) {
      setError('Please enter your name and agree to the terms.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/employee-onboarding/${token}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handbookAccepted: checked.handbook,
          socialMediaPolicyAccepted: checked.socialMedia,
          confidentialityAccepted: checked.confidentiality,
          antiHarassmentAccepted: checked.antiHarassment,
          codeOfConductAccepted: checked.codeOfConduct,
          signerName,
          agreedToTerms: agreed,
          signatureData: signatureType === 'draw' ? signatureData : signerName,
          signatureType,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to save')
      onComplete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (data.policies.accepted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Company Policies</h2>
          <p className="text-gray-500">You have already acknowledged all {totalPolicies} policies.</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-600">
            All {totalPolicies} Policies Acknowledged on {data.policies.acceptedAt ? formatDate(data.policies.acceptedAt) : 'previously'}
          </p>
        </div>
        <PrimaryButton onClick={onComplete} className="w-full sm:w-auto">
          Continue to Documents <ChevronRight className="w-4 h-4" />
        </PrimaryButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Company Policies</h2>
        <p className="text-gray-500">Read and acknowledge each of the {totalPolicies} policies to proceed.</p>
      </div>

      <div className="space-y-3">
        {POLICIES.map((policy) => {
          const PolicyIcon = policy.icon
          const isExpanded = expanded === policy.key
          const isChecked = checked[policy.key]

          return (
            <GlassCard key={policy.key} className="overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : policy.key)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isChecked
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                >
                  {isChecked ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <PolicyIcon className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isChecked ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {policy.title}
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-3 max-h-96 overflow-y-auto" style={{ whiteSpace: 'pre-wrap' }}>
                        {policy.content}
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePolicy(policy.key)}
                          className="w-4 h-4 rounded border-gray-400 text-orange-500 focus:ring-orange-500/50 bg-white"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                          I have read and acknowledge the {policy.title}
                        </span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          )
        })}
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-500">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(checkedCount / totalPolicies) * 100}%` }}
          />
        </div>
        <span>{checkedCount}/{totalPolicies} acknowledged</span>
      </div>

      {allChecked && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Confirm Acknowledgment
            </h3>
            <SignatureCapture
              signerName={signerName}
              onSignerNameChange={setSignerName}
              agreed={agreed}
              onAgreedChange={setAgreed}
              signatureData={signatureData}
              onSignatureDataChange={setSignatureData}
              signatureType={signatureType}
              onSignatureTypeChange={setSignatureType}
            />
          </GlassCard>
        </motion.div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <PrimaryButton
        onClick={handleSubmit}
        loading={submitting}
        disabled={!allChecked || !signerName || !agreed}
        className="w-full"
      >
        <BookOpen className="w-4 h-4" /> Acknowledge All Policies & Continue
      </PrimaryButton>
    </div>
  )
}
