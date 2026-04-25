'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Upload, ChevronRight, Link2 } from 'lucide-react'
import { GlassCard, FieldLabel, InputField, PrimaryButton } from './ui'
import { formatDate } from './types'
import type { StepProps } from './types'

export default function Step6SubmitDocuments({ data, token, onComplete }: StepProps) {
  const [form, setForm] = useState({
    profilePictureUrl: data.documents.profilePicture || '',
    panCardUrl: data.documents.panCard || '',
    aadhaarUrl: data.documents.aadhaar || '',
    educationCertUrl: data.documents.educationCert || '',
    bankAccountName: data.documents.bankDetails.name || '',
    bankName: data.documents.bankDetails.bank || '',
    bankAccountNumber: '',
    bankIfscCode: data.documents.bankDetails.ifsc || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.panCardUrl || !form.aadhaarUrl) {
      setError('PAN Card and Aadhaar Card links are required.')
      return
    }
    if (!form.bankAccountName || !form.bankName || !form.bankAccountNumber || !form.bankIfscCode) {
      setError('All bank details are required.')
      return
    }
    if (form.bankIfscCode.length !== 11) {
      setError('IFSC Code must be exactly 11 characters.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/employee-onboarding/${token}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to submit documents')
      onComplete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (data.documents.submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Documents</h2>
          <p className="text-gray-500">Your documents have been submitted successfully.</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-600">
            Documents Submitted on {data.documents.submittedAt ? formatDate(data.documents.submittedAt) : 'previously'}
          </p>
        </div>
        <PrimaryButton onClick={onComplete} className="w-full sm:w-auto">
          Continue to Welcome <ChevronRight className="w-4 h-4" />
        </PrimaryButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Submit Documents</h2>
        <p className="text-gray-500">Upload your documents and share bank details.</p>
      </div>

      {/* Instructions */}
      <GlassCard className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Upload className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">How to Upload Documents</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              For file uploads, please email to:{' '}
              <span className="text-orange-600 font-medium">brandingpioneers@gmail.in</span>.
              Or upload to Google Drive and paste the shareable links below.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Document Links */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Document Links
        </h3>
        <div className="space-y-4">
          <div>
            <FieldLabel>Profile Picture (Google Drive URL)</FieldLabel>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={form.profilePictureUrl}
                onChange={(e) => updateField('profilePictureUrl', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>
          <div>
            <FieldLabel required>PAN Card (Google Drive URL)</FieldLabel>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={form.panCardUrl}
                onChange={(e) => updateField('panCardUrl', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>
          <div>
            <FieldLabel required>Aadhaar Card (Google Drive URL)</FieldLabel>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={form.aadhaarUrl}
                onChange={(e) => updateField('aadhaarUrl', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Education Certificates (Google Drive URL)</FieldLabel>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={form.educationCertUrl}
                onChange={(e) => updateField('educationCertUrl', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Bank Details */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Bank Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Account Holder Name" required value={form.bankAccountName} onChange={(v) => updateField('bankAccountName', v)} placeholder="Name as per bank records" />
          <InputField label="Bank Name" required value={form.bankName} onChange={(v) => updateField('bankName', v)} placeholder="e.g. HDFC Bank" />
          <InputField label="Account Number" required value={form.bankAccountNumber} onChange={(v) => updateField('bankAccountNumber', v)} placeholder="Enter account number" />
          <InputField label="IFSC Code" required value={form.bankIfscCode} onChange={(v) => updateField('bankIfscCode', v.toUpperCase())} placeholder="e.g. HDFC0001234" />
        </div>
        {form.bankIfscCode && form.bankIfscCode.length !== 11 && (
          <p className="text-xs text-amber-600">IFSC Code must be exactly 11 characters ({form.bankIfscCode.length}/11)</p>
        )}
      </GlassCard>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <PrimaryButton onClick={handleSubmit} loading={submitting} className="w-full">
        <Upload className="w-4 h-4" /> Submit Documents & Continue
      </PrimaryButton>
    </div>
  )
}
