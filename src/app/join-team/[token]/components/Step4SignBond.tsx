'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, FileText, ChevronRight, Loader2, Download } from 'lucide-react'
import { GlassCard, PrimaryButton } from './ui'
import { formatCurrency, formatDate } from './types'
import type { StepProps } from './types'
import SignatureCapture from './SignatureCapture'

export default function Step4SignBond({ data, token, onComplete }: StepProps) {
  const [bondContent, setBondContent] = useState('')
  const [bondMonths, setBondMonths] = useState(data.offer.bondDurationMonths)
  const [salary, setSalary] = useState(data.offer.salary)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [signed, setSigned] = useState(data.bond.accepted)
  const [signedAt, setSignedAt] = useState(data.bond.acceptedAt || '')

  const [signerName, setSignerName] = useState(data.bond.signerName || data.candidate.name || '')
  const [agreed, setAgreed] = useState(false)
  const [signatureData, setSignatureData] = useState('')
  const [signatureType, setSignatureType] = useState<'type' | 'draw'>('type')

  useEffect(() => {
    const fetchBond = async () => {
      try {
        const res = await fetch(`/api/employee-onboarding/${token}/bond`)
        const result = await res.json()
        if (!res.ok) throw new Error(result.error)
        setBondContent(result.bondContent)
        setBondMonths(result.bondMonths)
        setSalary(result.salary)
        if (result.alreadySigned) {
          setSigned(true)
          setSignedAt(result.signedAt)
          setSignerName(result.signerName || '')
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load bond')
      } finally {
        setLoading(false)
      }
    }
    fetchBond()
  }, [token])

  const handleSign = async () => {
    if (!signerName || !agreed) {
      setError('Please enter your name and agree to the terms.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/employee-onboarding/${token}/bond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName,
          agreedToTerms: agreed,
          signatureData: signatureType === 'draw' ? signatureData : signerName,
          signatureType,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to sign bond')
      setSigned(true)
      setSignedAt(new Date().toISOString())
      onComplete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Service Bond Agreement</h2>
        <p className="text-gray-500">Review the bond terms and sign below.</p>
      </div>

      {signed && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-600">Bond Agreement Signed</p>
            <p className="text-xs text-gray-500">
              Signed by {signerName} on {signedAt ? formatDate(signedAt) : 'today'}
            </p>
          </div>
          <button
            onClick={() => {}}
            className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      )}

      {/* Bond Amount Info */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Bond Calculation
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-lg font-bold text-gray-900">{bondMonths} mo</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Monthly CTC</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(salary)}</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Training Value</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(salary * 3)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Max Bond Amount</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(salary * 2)}</p>
          </div>
        </div>
      </GlassCard>

      {/* Bond Content */}
      <GlassCard className="p-5">
        <div
          className="max-h-[400px] overflow-y-auto text-sm text-gray-700 leading-relaxed pr-2 custom-scrollbar"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {bondContent}
        </div>
      </GlassCard>

      {/* Signature */}
      {!signed && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Sign This Agreement
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

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <PrimaryButton
            onClick={handleSign}
            loading={submitting}
            disabled={!signerName || !agreed}
            className="w-full mt-4"
          >
            <FileText className="w-4 h-4" /> Sign Bond Agreement
          </PrimaryButton>
        </GlassCard>
      )}

      {signed && (
        <PrimaryButton onClick={onComplete} className="w-full sm:w-auto">
          Continue to Policies <ChevronRight className="w-4 h-4" />
        </PrimaryButton>
      )}
    </div>
  )
}
