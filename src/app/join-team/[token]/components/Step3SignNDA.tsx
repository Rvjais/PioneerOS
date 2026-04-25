'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Shield, ChevronRight, Loader2, Download } from 'lucide-react'
import { GlassCard, PrimaryButton } from './ui'
import { formatDate } from './types'
import type { StepProps } from './types'
import SignatureCapture from './SignatureCapture'

export default function Step3SignNDA({ data, token, onComplete }: StepProps) {
  const [ndaContent, setNdaContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [signed, setSigned] = useState(data.nda.accepted)
  const [signedAt, setSignedAt] = useState(data.nda.acceptedAt || '')

  const [signerName, setSignerName] = useState(data.nda.signerName || data.candidate.name || '')
  const [agreed, setAgreed] = useState(false)
  const [signatureData, setSignatureData] = useState('')
  const [signatureType, setSignatureType] = useState<'type' | 'draw'>('type')

  useEffect(() => {
    const fetchNDA = async () => {
      try {
        const res = await fetch(`/api/employee-onboarding/${token}/nda`)
        const result = await res.json()
        if (!res.ok) throw new Error(result.error)
        setNdaContent(result.ndaContent)
        if (result.alreadySigned) {
          setSigned(true)
          setSignedAt(result.signedAt)
          setSignerName(result.signerName || '')
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load NDA')
      } finally {
        setLoading(false)
      }
    }
    fetchNDA()
  }, [token])

  const handleSign = async () => {
    if (!signerName || !agreed) {
      setError('Please enter your name and agree to the terms.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/employee-onboarding/${token}/nda`, {
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
      if (!res.ok) throw new Error(result.error || 'Failed to sign NDA')
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
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Non-Disclosure Agreement</h2>
        <p className="text-gray-500">Please read the NDA carefully and sign below.</p>
      </div>

      {signed && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-600">NDA Signed</p>
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

      {/* NDA Content */}
      <GlassCard className="p-5">
        <div
          className="max-h-[400px] overflow-y-auto text-sm text-gray-700 leading-relaxed pr-2 custom-scrollbar"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {ndaContent}
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
            <Shield className="w-4 h-4" /> Sign NDA
          </PrimaryButton>
        </GlassCard>
      )}

      {signed && (
        <PrimaryButton onClick={onComplete} className="w-full sm:w-auto">
          Continue to Bond Agreement <ChevronRight className="w-4 h-4" />
        </PrimaryButton>
      )}
    </div>
  )
}
