'use client'

import { useState } from 'react'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { GlassCard, InputField, TextareaField, SelectField, PrimaryButton } from './ui'
import { BLOOD_GROUPS, formatCurrency, formatDate } from './types'
import type { StepProps } from './types'

export default function Step1ConfirmDetails({ data, token, onComplete }: StepProps) {
  const [form, setForm] = useState({
    confirmedName: data.candidate.name || '',
    dateOfBirth: data.details.dateOfBirth ? data.details.dateOfBirth.split('T')[0] : '',
    bloodGroup: data.details.bloodGroup || '',
    personalPhone: data.candidate.phone || '',
    personalEmail: data.candidate.email || '',
    currentAddress: data.details.currentAddress || '',
    city: data.details.city || '',
    state: data.details.state || '',
    pincode: '',
    parentsAddress: '',
    fatherPhone: '',
    motherPhone: '',
    emergencyName: data.details.emergencyName || '',
    emergencyPhone: data.details.emergencyPhone || '',
    emergencyRelation: '',
    linkedinUrl: '',
    languages: '',
    livingSituation: '',
    distanceFromOffice: '',
    favoriteFood: '',
    healthConditions: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.confirmedName || !form.dateOfBirth || !form.personalPhone || !form.personalEmail || !form.currentAddress) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/employee-onboarding/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'details', ...form }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to save details')
      onComplete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Confirm Your Details</h2>
        <p className="text-gray-500">Please verify and complete your personal information.</p>
      </div>

      {/* Offer Summary */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Offer Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Department', value: data.offer.department },
            { label: 'Position', value: data.offer.position },
            { label: 'Monthly CTC', value: formatCurrency(data.offer.salary) },
            { label: 'Joining Date', value: formatDate(data.offer.joiningDate) },
            { label: 'Probation', value: `${data.offer.probationMonths} months` },
            { label: 'Bond', value: `${data.offer.bondDurationMonths} months` },
          ].map((item) => (
            <div key={item.label} className="bg-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Personal Info */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Full Name" required value={form.confirmedName} onChange={(v) => updateField('confirmedName', v)} />
          <InputField label="Date of Birth" required type="date" value={form.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} />
          <SelectField label="Blood Group" value={form.bloodGroup} onChange={(v) => updateField('bloodGroup', v)} options={BLOOD_GROUPS} />
          <InputField label="Phone Number" required value={form.personalPhone} onChange={(v) => updateField('personalPhone', v)} placeholder="+91 98765 43210" />
          <InputField label="Email Address" required type="email" value={form.personalEmail} onChange={(v) => updateField('personalEmail', v)} />
          <InputField label="LinkedIn URL" value={form.linkedinUrl} onChange={(v) => updateField('linkedinUrl', v)} placeholder="https://linkedin.com/in/..." />
        </div>
      </GlassCard>

      {/* Address */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Address
        </h3>
        <TextareaField label="Current Address" required value={form.currentAddress} onChange={(v) => updateField('currentAddress', v)} placeholder="Your current residential address" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="City" value={form.city} onChange={(v) => updateField('city', v)} />
          <InputField label="State" value={form.state} onChange={(v) => updateField('state', v)} />
          <InputField label="Pincode" value={form.pincode} onChange={(v) => updateField('pincode', v)} />
        </div>
        <TextareaField label="Parents/Guardian Address" value={form.parentsAddress} onChange={(v) => updateField('parentsAddress', v)} placeholder="Address of your parents or guardian" />
      </GlassCard>

      {/* Family & Emergency */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Family & Emergency Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Father's Phone" value={form.fatherPhone} onChange={(v) => updateField('fatherPhone', v)} />
          <InputField label="Mother's Phone" value={form.motherPhone} onChange={(v) => updateField('motherPhone', v)} />
          <InputField label="Emergency Contact Name" value={form.emergencyName} onChange={(v) => updateField('emergencyName', v)} />
          <InputField label="Emergency Contact Phone" value={form.emergencyPhone} onChange={(v) => updateField('emergencyPhone', v)} />
          <InputField label="Relationship" value={form.emergencyRelation} onChange={(v) => updateField('emergencyRelation', v)} placeholder="e.g. Father, Spouse" />
        </div>
      </GlassCard>

      {/* Additional Info */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Additional Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Languages Known" value={form.languages} onChange={(v) => updateField('languages', v)} placeholder="e.g. English, Hindi, Tamil" />
          <InputField label="Living Situation" value={form.livingSituation} onChange={(v) => updateField('livingSituation', v)} placeholder="e.g. With family, PG, Rented flat" />
          <InputField label="Distance from Office" value={form.distanceFromOffice} onChange={(v) => updateField('distanceFromOffice', v)} placeholder="e.g. 12 km" />
          <InputField label="Favorite Food" value={form.favoriteFood} onChange={(v) => updateField('favoriteFood', v)} placeholder="We celebrate birthdays!" />
        </div>
        <TextareaField label="Health Conditions (if any)" value={form.healthConditions} onChange={(v) => updateField('healthConditions', v)} placeholder="Any allergies, conditions, or dietary restrictions" rows={2} />
      </GlassCard>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <PrimaryButton onClick={handleSubmit} loading={loading} className="w-full sm:w-auto">
        Save & Continue <ChevronRight className="w-4 h-4" />
      </PrimaryButton>
    </div>
  )
}
