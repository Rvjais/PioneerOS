'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import {
  FormLayout,
  FormCard,
  TextInput,
  Textarea,
  SingleSelect,
  DropdownSelect,
  FormButtons,
  Checkbox,
  SuccessScreen,
} from '@/client/components/forms/FormComponents'

// ============================================
// CONSTANTS
// ============================================

const LEAVING_REASONS = [
  { value: 'better_opportunity', label: 'Better Career Opportunity', description: 'Found a new role elsewhere', emoji: '🚀' },
  { value: 'higher_education', label: 'Higher Education', description: 'Pursuing further studies', emoji: '🎓' },
  { value: 'relocation', label: 'Relocation', description: 'Moving to another city/country', emoji: '✈️' },
  { value: 'personal', label: 'Personal Reasons', description: 'Family or personal matters', emoji: '👨‍👩‍👧' },
  { value: 'health', label: 'Health Reasons', description: 'Health-related concerns', emoji: '🏥' },
  { value: 'compensation', label: 'Compensation', description: 'Salary or benefits related', emoji: '💰' },
  { value: 'work_culture', label: 'Work Environment', description: 'Culture or environment issues', emoji: '🏢' },
  { value: 'career_growth', label: 'Limited Growth', description: 'Lack of career advancement', emoji: '📊' },
  { value: 'other', label: 'Other', description: 'Different reason', emoji: '📝' },
]

const RATING_OPTIONS = [
  { value: '5', label: 'Excellent', emoji: '🌟' },
  { value: '4', label: 'Good', emoji: '😊' },
  { value: '3', label: 'Average', emoji: '😐' },
  { value: '2', label: 'Below Average', emoji: '😕' },
  { value: '1', label: 'Poor', emoji: '😞' },
]

const YES_NO = [
  { value: 'yes', label: 'Yes', emoji: '👍' },
  { value: 'no', label: 'No', emoji: '👎' },
  { value: 'maybe', label: 'Maybe', emoji: '🤔' },
]

const STEPS = [
  { num: 1, label: 'Verify Identity' },
  { num: 2, label: 'Reason for Leaving' },
  { num: 3, label: 'Your Experience' },
  { num: 4, label: 'Feedback' },
]

// ============================================
// MAIN COMPONENT
// ============================================

function ExitInterviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verified, setVerified] = useState(false)

  const [form, setForm] = useState({
    // Step 1: Identity
    empId: '',
    phone: '',
    email: '',
    lastWorkingDate: '',

    // Step 2: Reason
    primaryReason: '',
    detailedReason: '',
    newEmployer: '',
    newRole: '',

    // Step 3: Experience Ratings
    overallExperience: '',
    managerRating: '',
    teamRating: '',
    growthRating: '',
    workLifeRating: '',
    compensationRating: '',

    // Step 4: Feedback
    bestThings: '',
    improvements: '',
    wouldRecommend: '',
    wouldReturn: '',
    additionalComments: '',
    confidentialityAcknowledged: false,
  })

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return (form.empId || form.phone || form.email) && form.lastWorkingDate
      case 2:
        return form.primaryReason
      case 3:
        return form.overallExperience && form.managerRating && form.teamRating
      case 4:
        return form.confidentialityAcknowledged
      default:
        return true
    }
  }

  const handleVerify = async () => {
    // In a real implementation, verify the employee details
    setVerified(true)
    setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/hr/exit-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, token }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <SuccessScreen
        title="Thank You!"
        message="Your exit interview has been submitted. We appreciate your honest feedback and wish you all the best in your future endeavors."
        details={[
          { label: 'Last Working Date', value: form.lastWorkingDate },
          { label: 'Status', value: 'Interview Completed' },
        ]}
        primaryAction={{
          label: 'Done',
          onClick: () => window.close(),
        }}
      />
    )
  }

  return (
    <FormLayout
      title="Exit Interview"
      subtitle="Branding Pioneers"
      step={step}
      totalSteps={STEPS.length}
      brandColor="pink"
    >
      <div className="space-y-6">
        {/* Step 1: Verify Identity */}
        {step === 1 && (
          <>
            <FormCard
              title="Verify Your Identity"
              description="Please provide your details to access the exit interview form"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            >
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    Enter any one of the following: Employee ID, Phone Number, or Email Address to verify your identity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextInput
                    label="Employee ID"
                    name="empId"
                    value={form.empId}
                    onChange={(v) => updateField('empId', v)}
                    placeholder="e.g., BP-123"
                  />
                  <TextInput
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={(v) => updateField('phone', v)}
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                  <TextInput
                    label="Email Address"
                    name="email"
                    value={form.email}
                    onChange={(v) => updateField('email', v)}
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>

                <TextInput
                  label="Last Working Date"
                  name="lastWorkingDate"
                  value={form.lastWorkingDate}
                  onChange={(v) => updateField('lastWorkingDate', v)}
                  type="date"
                  required
                />
              </div>
            </FormCard>

            <FormButtons
              onNext={handleVerify}
              nextLabel="Verify & Continue"
              disabled={!canProceed()}
              showBack={false}
            />
          </>
        )}

        {/* Step 2: Reason for Leaving */}
        {step === 2 && (
          <>
            <FormCard
              title="Reason for Leaving"
              description="Help us understand your decision to leave"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            >
              <div className="space-y-6">
                <SingleSelect
                  label="Primary Reason for Leaving"
                  name="primaryReason"
                  value={form.primaryReason}
                  onChange={(v) => updateField('primaryReason', v)}
                  options={LEAVING_REASONS}
                  columns={3}
                  required
                />

                <Textarea
                  label="Tell us more (optional)"
                  name="detailedReason"
                  value={form.detailedReason}
                  onChange={(v) => updateField('detailedReason', v)}
                  placeholder="Share more details about your decision to leave..."
                  rows={3}
                />

                {form.primaryReason === 'better_opportunity' && (
                  <div className="bg-slate-900/40 border border-white/10 rounded-xl p-5 space-y-4">
                    <p className="text-sm text-slate-300">We&apos;d love to know where you&apos;re heading (optional):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextInput
                        label="New Employer"
                        name="newEmployer"
                        value={form.newEmployer}
                        onChange={(v) => updateField('newEmployer', v)}
                        placeholder="Company name"
                      />
                      <TextInput
                        label="New Role"
                        name="newRole"
                        value={form.newRole}
                        onChange={(v) => updateField('newRole', v)}
                        placeholder="Your new position"
                      />
                    </div>
                  </div>
                )}
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 3: Experience Ratings */}
        {step === 3 && (
          <>
            <FormCard
              title="Rate Your Experience"
              description="Your honest feedback helps us improve"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            >
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    All responses are confidential and will only be used to improve our workplace.
                  </p>
                </div>

                <SingleSelect
                  label="Overall Experience at Branding Pioneers"
                  name="overallExperience"
                  value={form.overallExperience}
                  onChange={(v) => updateField('overallExperience', v)}
                  options={RATING_OPTIONS}
                  columns={5}
                  size="sm"
                  required
                />

                <SingleSelect
                  label="Manager & Leadership"
                  name="managerRating"
                  value={form.managerRating}
                  onChange={(v) => updateField('managerRating', v)}
                  options={RATING_OPTIONS}
                  columns={5}
                  size="sm"
                  required
                />

                <SingleSelect
                  label="Team & Colleagues"
                  name="teamRating"
                  value={form.teamRating}
                  onChange={(v) => updateField('teamRating', v)}
                  options={RATING_OPTIONS}
                  columns={5}
                  size="sm"
                  required
                />

                <SingleSelect
                  label="Career Growth Opportunities"
                  name="growthRating"
                  value={form.growthRating}
                  onChange={(v) => updateField('growthRating', v)}
                  options={RATING_OPTIONS}
                  columns={5}
                  size="sm"
                />

                <SingleSelect
                  label="Work-Life Balance"
                  name="workLifeRating"
                  value={form.workLifeRating}
                  onChange={(v) => updateField('workLifeRating', v)}
                  options={RATING_OPTIONS}
                  columns={5}
                  size="sm"
                />

                <SingleSelect
                  label="Compensation & Benefits"
                  name="compensationRating"
                  value={form.compensationRating}
                  onChange={(v) => updateField('compensationRating', v)}
                  options={RATING_OPTIONS}
                  columns={5}
                  size="sm"
                />
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 4: Feedback */}
        {step === 4 && (
          <>
            <FormCard
              title="Final Feedback"
              description="Share your thoughts and suggestions"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
            >
              <div className="space-y-6">
                <Textarea
                  label="What did you enjoy most about working here?"
                  name="bestThings"
                  value={form.bestThings}
                  onChange={(v) => updateField('bestThings', v)}
                  placeholder="Share the best parts of your experience..."
                  rows={3}
                />

                <Textarea
                  label="What could we improve?"
                  name="improvements"
                  value={form.improvements}
                  onChange={(v) => updateField('improvements', v)}
                  placeholder="Share your suggestions for improvement..."
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SingleSelect
                    label="Would you recommend Branding Pioneers?"
                    name="wouldRecommend"
                    value={form.wouldRecommend}
                    onChange={(v) => updateField('wouldRecommend', v)}
                    options={YES_NO}
                    columns={3}
                    size="sm"
                  />

                  <SingleSelect
                    label="Would you consider returning?"
                    name="wouldReturn"
                    value={form.wouldReturn}
                    onChange={(v) => updateField('wouldReturn', v)}
                    options={YES_NO}
                    columns={3}
                    size="sm"
                  />
                </div>

                <Textarea
                  label="Any other comments?"
                  name="additionalComments"
                  value={form.additionalComments}
                  onChange={(v) => updateField('additionalComments', v)}
                  placeholder="Anything else you'd like to share..."
                  rows={3}
                />

                {/* Confidentiality Notice */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <svg className="w-5 h-5 text-pink-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-pink-800">NDA Reminder</h4>
                      <p className="text-sm text-pink-700">
                        Your Non-Disclosure Agreement remains in effect for 24 months after your last working day.
                        Please ensure you do not disclose any confidential information about clients, strategies, or internal processes.
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    label={
                      <span>
                        I acknowledge that my NDA obligations continue and I will maintain confidentiality.
                      </span>
                    }
                    name="confidentialityAcknowledged"
                    checked={form.confidentialityAcknowledged}
                    onChange={(v) => updateField('confidentialityAcknowledged', v)}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-200 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(3)}
              onSubmit={handleSubmit}
              submitLabel="Submit Interview"
              disabled={!canProceed()}
              loading={loading}
            />
          </>
        )}
      </div>
    </FormLayout>
  )
}

export default function ExitInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExitInterviewContent />
    </Suspense>
  )
}
