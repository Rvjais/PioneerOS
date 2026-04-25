'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface ExitFormData {
  // Resignation Details
  lastWorkingDate: string
  reasonForLeaving: string
  detailedReason: string
  isNoticePeriodServed: boolean
  noticePeriodShortfall: number

  // Exit Interview
  overallExperience: number
  managerRating: number
  teamRating: number
  growthOpportunities: number
  workLifeBalance: number
  compensation: number
  exitFeedback: string
  wouldRecommend: boolean
  wouldReturn: boolean

  // Handover
  handoverComplete: boolean
  handoverNotes: string
  pendingTasks: string

  // Clearances
  itClearance: boolean
  hrClearance: boolean
  financeClearance: boolean
  adminClearance: boolean

  // Acknowledgments
  ndaAcknowledged: boolean
  fullAndFinalAccepted: boolean
}

interface SettlementBreakdown {
  label: string
  amount: number
  type: 'credit' | 'debit'
}

const mockSettlement: SettlementBreakdown[] = [
  { label: 'Pending Salary (15 days)', amount: 37500, type: 'credit' },
  { label: 'Leave Encashment (8 days)', amount: 20000, type: 'credit' },
  { label: 'Gratuity', amount: 0, type: 'credit' },
  { label: 'RBC Pot Balance', amount: 12500, type: 'credit' },
  { label: 'Notice Period Recovery', amount: -25000, type: 'debit' },
  { label: 'Asset Recovery (Laptop damage)', amount: -5000, type: 'debit' },
  { label: 'Advance Salary Recovery', amount: 0, type: 'debit' },
]

export default function ExitFormPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [form, setForm] = useState<ExitFormData>({
    lastWorkingDate: '',
    reasonForLeaving: '',
    detailedReason: '',
    isNoticePeriodServed: true,
    noticePeriodShortfall: 0,
    overallExperience: 0,
    managerRating: 0,
    teamRating: 0,
    growthOpportunities: 0,
    workLifeBalance: 0,
    compensation: 0,
    exitFeedback: '',
    wouldRecommend: false,
    wouldReturn: false,
    handoverComplete: false,
    handoverNotes: '',
    pendingTasks: '',
    itClearance: false,
    hrClearance: false,
    financeClearance: false,
    adminClearance: false,
    ndaAcknowledged: false,
    fullAndFinalAccepted: false,
  })

  const updateField = <K extends keyof ExitFormData>(field: K, value: ExitFormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const totalCredit = mockSettlement.filter(s => s.type === 'credit').reduce((sum, s) => sum + s.amount, 0)
  const totalDebit = mockSettlement.filter(s => s.type === 'debit').reduce((sum, s) => sum + Math.abs(s.amount), 0)
  const netSettlement = totalCredit - totalDebit

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const RatingStars = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
      <span className="text-sm text-slate-200">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${
              star <= value ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )

  const handleSubmit = () => {
    toast.success('Exit form submitted successfully! HR will process your clearances.')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/hr" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
          &larr; Back to HR
        </Link>
        <h1 className="text-2xl font-bold text-white">Exit & Full and Final Settlement</h1>
        <p className="text-slate-400">Complete the exit formalities and clearance process</p>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-200">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-slate-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 rounded-full transition-all"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span className={currentStep >= 1 ? 'text-red-400' : ''}>Resignation</span>
          <span className={currentStep >= 2 ? 'text-red-400' : ''}>Exit Interview</span>
          <span className={currentStep >= 3 ? 'text-red-400' : ''}>Handover</span>
          <span className={currentStep >= 4 ? 'text-red-400' : ''}>Clearances</span>
          <span className={currentStep >= 5 ? 'text-red-400' : ''}>Settlement</span>
        </div>
      </div>

      {/* Step 1: Resignation Details */}
      {currentStep === 1 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Resignation Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Last Working Date *
            </label>
            <input
              type="date"
              value={form.lastWorkingDate}
              onChange={(e) => updateField('lastWorkingDate', e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Primary Reason for Leaving *
            </label>
            <select
              value={form.reasonForLeaving}
              onChange={(e) => updateField('reasonForLeaving', e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Select a reason</option>
              <option value="better_opportunity">Better Career Opportunity</option>
              <option value="higher_education">Higher Education</option>
              <option value="relocation">Relocation</option>
              <option value="personal">Personal Reasons</option>
              <option value="health">Health Reasons</option>
              <option value="compensation">Compensation</option>
              <option value="work_culture">Work Environment/Culture</option>
              <option value="career_growth">Limited Career Growth</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Detailed Explanation (Optional)
            </label>
            <textarea
              value={form.detailedReason}
              onChange={(e) => updateField('detailedReason', e.target.value)}
              placeholder="Please share more details about your decision to leave..."
              rows={4}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Notice Period Information</h4>
            <p className="text-sm text-amber-400 mb-4">
              Your notice period is <strong>30 days</strong>. Shortfall in notice period will result in salary recovery.
            </p>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.isNoticePeriodServed}
                onChange={(e) => updateField('isNoticePeriodServed', e.target.checked)}
                className="w-5 h-5 text-amber-400 rounded"
              />
              <span className="text-sm text-slate-200">I will serve the full notice period</span>
            </label>
            {!form.isNoticePeriodServed && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Notice Period Shortfall (Days)
                </label>
                <input
                  type="number"
                  value={form.noticePeriodShortfall}
                  onChange={(e) => updateField('noticePeriodShortfall', parseInt(e.target.value) || 0)}
                  min="0"
                  max="30"
                  className="w-32 px-4 py-2 border border-white/10 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Exit Interview */}
      {currentStep === 2 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Exit Interview</h2>
          <p className="text-sm text-slate-400">Your honest feedback helps us improve. All responses are confidential.</p>

          <div className="space-y-3">
            <RatingStars
              label="Overall Experience at BrandPioneer"
              value={form.overallExperience}
              onChange={(v) => updateField('overallExperience', v)}
            />
            <RatingStars
              label="Manager & Leadership"
              value={form.managerRating}
              onChange={(v) => updateField('managerRating', v)}
            />
            <RatingStars
              label="Team & Colleagues"
              value={form.teamRating}
              onChange={(v) => updateField('teamRating', v)}
            />
            <RatingStars
              label="Career Growth Opportunities"
              value={form.growthOpportunities}
              onChange={(v) => updateField('growthOpportunities', v)}
            />
            <RatingStars
              label="Work-Life Balance"
              value={form.workLifeBalance}
              onChange={(v) => updateField('workLifeBalance', v)}
            />
            <RatingStars
              label="Compensation & Benefits"
              value={form.compensation}
              onChange={(v) => updateField('compensation', v)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              What could we have done better?
            </label>
            <textarea
              value={form.exitFeedback}
              onChange={(e) => updateField('exitFeedback', e.target.value)}
              placeholder="Share your suggestions for improvement..."
              rows={4}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 bg-slate-900/40 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={form.wouldRecommend}
                onChange={(e) => updateField('wouldRecommend', e.target.checked)}
                className="w-5 h-5 text-green-400 rounded"
              />
              <span className="text-sm text-slate-200">I would recommend BrandPioneer to others</span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-slate-900/40 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={form.wouldReturn}
                onChange={(e) => updateField('wouldReturn', e.target.checked)}
                className="w-5 h-5 text-blue-400 rounded"
              />
              <span className="text-sm text-slate-200">I would consider returning in the future</span>
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Handover */}
      {currentStep === 3 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Knowledge Transfer & Handover</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Handover Notes & Documentation *
            </label>
            <textarea
              value={form.handoverNotes}
              onChange={(e) => updateField('handoverNotes', e.target.value)}
              placeholder="Document all ongoing projects, client details, login credentials, and important notes for your replacement..."
              rows={6}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Pending Tasks or Follow-ups
            </label>
            <textarea
              value={form.pendingTasks}
              onChange={(e) => updateField('pendingTasks', e.target.value)}
              placeholder="List any pending tasks, deadlines, or items that need attention..."
              rows={4}
              className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-3">Handover Checklist</h4>
            <div className="space-y-2">
              {[
                'All project files uploaded to shared drive',
                'Client credentials documented',
                'Ongoing tasks assigned to replacement/team',
                'Email auto-reply set up',
                'All access passwords shared with IT',
              ].map((item, i) => (
                <label key={`checklist-${item}`} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-400 rounded" />
                  <span className="text-sm text-slate-200">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={form.handoverComplete}
              onChange={(e) => updateField('handoverComplete', e.target.checked)}
              className="w-5 h-5 text-green-400 rounded"
            />
            <span className="text-sm text-slate-200">
              I confirm that I have completed the knowledge transfer and handover to my team/replacement.
            </span>
          </label>
        </div>
      )}

      {/* Step 4: Clearances */}
      {currentStep === 4 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Department Clearances</h2>
          <p className="text-sm text-slate-400">
            All clearances must be completed before processing the final settlement.
          </p>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${form.itClearance ? 'border-green-200 bg-green-500/10' : 'border-white/10'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">IT Clearance</h3>
                  <p className="text-sm text-slate-400">Return laptop, devices, access cards, revoke system access</p>
                </div>
                <div className="flex items-center gap-3">
                  {form.itClearance ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Cleared</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">Pending</span>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${form.hrClearance ? 'border-green-200 bg-green-500/10' : 'border-white/10'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">HR Clearance</h3>
                  <p className="text-sm text-slate-400">Exit interview, handover verification, documentation</p>
                </div>
                <div className="flex items-center gap-3">
                  {form.hrClearance ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Cleared</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">Pending</span>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${form.financeClearance ? 'border-green-200 bg-green-500/10' : 'border-white/10'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Finance Clearance</h3>
                  <p className="text-sm text-slate-400">Pending reimbursements, advances, expense settlements</p>
                </div>
                <div className="flex items-center gap-3">
                  {form.financeClearance ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Cleared</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">Pending</span>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${form.adminClearance ? 'border-green-200 bg-green-500/10' : 'border-white/10'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Admin Clearance</h3>
                  <p className="text-sm text-slate-400">ID card, parking, gym membership, other facilities</p>
                </div>
                <div className="flex items-center gap-3">
                  {form.adminClearance ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Cleared</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">Pending</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Department clearances are processed by the respective teams.
              This form will be submitted to all departments for approval. You will be notified once each clearance is complete.
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Settlement */}
      {currentStep === 5 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Full & Final Settlement</h2>

          <div className="bg-slate-900/40 rounded-lg p-4">
            <h3 className="font-medium text-white mb-4">Settlement Breakdown</h3>

            <div className="space-y-3">
              {mockSettlement.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span className={`font-medium ${item.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {item.type === 'credit' ? '+' : '-'} {formatCurrency(Math.abs(item.amount))}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Net Settlement Amount</p>
                  <p className="text-xs text-slate-400">Payable within 45 days of last working day</p>
                </div>
                <p className={`text-2xl font-bold ${netSettlement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(netSettlement)}
                </p>
              </div>
            </div>
          </div>

          {/* NDA Reminder */}
          <div className="p-4 bg-red-500/10 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Confidentiality Reminder</h4>
            <p className="text-sm text-red-400 mb-3">
              Your Non-Disclosure Agreement remains in effect for 24 months after your last working day.
              You are prohibited from disclosing any confidential information about clients, strategies,
              or internal processes.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ndaAcknowledged}
                onChange={(e) => updateField('ndaAcknowledged', e.target.checked)}
                className="w-5 h-5 text-red-400 rounded"
              />
              <span className="text-sm text-slate-200">
                I acknowledge and agree to continue honoring my NDA obligations
              </span>
            </label>
          </div>

          {/* Final Acknowledgment */}
          <label className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={form.fullAndFinalAccepted}
              onChange={(e) => updateField('fullAndFinalAccepted', e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-400 rounded"
            />
            <span className="text-sm text-slate-200">
              I have reviewed the Full & Final Settlement breakdown and accept the amounts shown above.
              I understand that upon acceptance, no further claims can be made against BrandPioneer Media Pvt. Ltd.
              regarding my employment.
            </span>
          </label>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 text-slate-300 hover:text-white disabled:opacity-50"
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!form.ndaAcknowledged || !form.fullAndFinalAccepted}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Submit Exit Form
          </button>
        )}
      </div>
    </div>
  )
}
