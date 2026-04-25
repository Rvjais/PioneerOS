'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface User {
  id: string
  empId: string
  firstName: string
  lastName: string
  department: string
  joiningDate: string
}

interface AppraisalData {
  id: string
  status: string
  overallRating: number | null
  keyAccomplishments: string | null
  challengesFaced: string | null
  goalsAchieved: string | null
  goalsMissed: string | null
  skillsImproved: string | null
  learningCompleted: string | null
  skillsToImprove: string | null
  roleClarity: number | null
  resourcesAdequate: number | null
  workloadBalance: number | null
  teamCollaboration: number | null
  managerSupport: number | null
  cultureFit: number | null
  nextYearGoals: string | null
  careerAspirations: string | null
  supportNeeded: string | null
  trainingRequests: string | null
  companyFeedback: string | null
  teamFeedback: string | null
  processFeedback: string | null
}

interface Achievement {
  id: string
  type: string
  title: string
  description: string | null
  pointsAwarded: number
}

interface Goal {
  id: string
  title: string
  status: string
  targetValue: number | null
  currentValue: number | null
}

interface Props {
  user: User
  appraisal: AppraisalData | null
  achievements: Achievement[]
  goals: Goal[]
  cycleYear: number
}

const STEPS = [
  { id: 1, title: 'Performance Overview', description: 'Rate your overall performance' },
  { id: 2, title: 'Goals Review', description: 'Review your goals achievement' },
  { id: 3, title: 'Skills & Development', description: 'Skills improved and growth areas' },
  { id: 4, title: 'Role & Environment', description: 'Rate your work environment' },
  { id: 5, title: 'Team & Culture', description: 'Collaboration and culture fit' },
  { id: 6, title: 'Future Goals', description: 'Your goals for next year' },
  { id: 7, title: 'Feedback', description: 'Share your feedback' },
]

function StarRating({ value, onChange, label }: { value: number | null; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-200">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <svg
              className={`w-8 h-8 transition-colors ${
                star <= (value || 0) ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-3 text-sm text-slate-400">
          {value ? ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'][value - 1] : 'Not rated'}
        </span>
      </div>
    </div>
  )
}

export function SelfAppraisalForm({ user, appraisal, achievements, goals, cycleYear }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    overallRating: appraisal?.overallRating || null,
    keyAccomplishments: appraisal?.keyAccomplishments || '',
    challengesFaced: appraisal?.challengesFaced || '',
    goalsAchieved: appraisal?.goalsAchieved || JSON.stringify([]),
    goalsMissed: appraisal?.goalsMissed || JSON.stringify([]),
    skillsImproved: appraisal?.skillsImproved || JSON.stringify([]),
    learningCompleted: appraisal?.learningCompleted || JSON.stringify([]),
    skillsToImprove: appraisal?.skillsToImprove || '',
    roleClarity: appraisal?.roleClarity || null,
    resourcesAdequate: appraisal?.resourcesAdequate || null,
    workloadBalance: appraisal?.workloadBalance || null,
    teamCollaboration: appraisal?.teamCollaboration || null,
    managerSupport: appraisal?.managerSupport || null,
    cultureFit: appraisal?.cultureFit || null,
    nextYearGoals: appraisal?.nextYearGoals || JSON.stringify([]),
    careerAspirations: appraisal?.careerAspirations || '',
    supportNeeded: appraisal?.supportNeeded || '',
    trainingRequests: appraisal?.trainingRequests || JSON.stringify([]),
    companyFeedback: appraisal?.companyFeedback || '',
    teamFeedback: appraisal?.teamFeedback || '',
    processFeedback: appraisal?.processFeedback || '',
  })

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const saveProgress = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/hr/appraisals/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleYear,
          ...formData,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const submitAppraisal = async () => {
    if (!confirm('Are you sure you want to submit? You cannot edit after submission.')) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/hr/appraisals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleYear,
          ...formData,
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        toast.error('Failed to submit: ' + data.error)
      }
    } catch (error) {
      toast.error('Error submitting appraisal')
    } finally {
      setSubmitting(false)
    }
  }

  const nextStep = () => {
    saveProgress()
    setStep(s => Math.min(s + 1, STEPS.length))
  }

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1))
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="glass-card border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setStep(s.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  step === s.id
                    ? 'bg-blue-600 text-white'
                    : step > s.id
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {step > s.id ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.id
                )}
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`w-8 h-1 mx-2 rounded ${step > s.id ? 'bg-green-200' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-300 mt-4">
          Step {step}: {STEPS[step - 1].title}
        </p>
      </div>

      {/* Form Content */}
      <div className="glass-card border border-white/10 rounded-xl p-6">
        {/* Step 1: Performance Overview */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
              <p className="text-sm text-slate-400">Rate your overall performance this year</p>
            </div>

            <StarRating
              label="Overall Self-Rating"
              value={formData.overallRating}
              onChange={(v) => updateField('overallRating', v)}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Key Accomplishments
              </label>
              <textarea
                value={formData.keyAccomplishments}
                onChange={(e) => updateField('keyAccomplishments', e.target.value)}
                rows={5}
                placeholder="List your major accomplishments this year..."
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400">Include specific projects, metrics, and impact</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Challenges Faced & How You Overcame Them
              </label>
              <textarea
                value={formData.challengesFaced}
                onChange={(e) => updateField('challengesFaced', e.target.value)}
                rows={4}
                placeholder="Describe challenges and your approach to solving them..."
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Show achievements for reference */}
            {achievements.length > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Your Achievements This Year</h3>
                <div className="space-y-2">
                  {achievements.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-green-400">{a.title}</span>
                      <span className="text-green-400 font-medium">+{a.pointsAwarded} points</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Goals Review */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Goals Review</h2>
              <p className="text-sm text-slate-400">Review your goals from this year</p>
            </div>

            {/* Show goals for reference */}
            {goals.length > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-lg mb-6">
                <h3 className="font-medium text-blue-800 mb-2">Your Goals This Year</h3>
                <div className="space-y-2">
                  {goals.map(g => (
                    <div key={g.id} className="flex items-center justify-between text-sm">
                      <span className="text-blue-400">{g.title}</span>
                      <span className={`font-medium ${
                        g.status === 'ACHIEVED' ? 'text-green-400' :
                        g.status === 'MISSED' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {g.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Goals Achieved (with evidence)
              </label>
              <textarea
                value={formData.goalsAchieved}
                onChange={(e) => updateField('goalsAchieved', e.target.value)}
                rows={5}
                placeholder="List goals you achieved and provide evidence/metrics..."
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Goals Not Achieved (with reasons)
              </label>
              <textarea
                value={formData.goalsMissed}
                onChange={(e) => updateField('goalsMissed', e.target.value)}
                rows={4}
                placeholder="List goals you couldn't achieve and explain why..."
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 3: Skills & Development */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Skills & Development</h2>
              <p className="text-sm text-slate-400">Reflect on your skill growth</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Skills Improved This Year
              </label>
              <textarea
                value={formData.skillsImproved}
                onChange={(e) => updateField('skillsImproved', e.target.value)}
                rows={4}
                placeholder="List skills you've improved (e.g., technical skills, soft skills)..."
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Courses/Certifications Completed
              </label>
              <textarea
                value={formData.learningCompleted}
                onChange={(e) => updateField('learningCompleted', e.target.value)}
                rows={4}
                placeholder="List courses, certifications, or training completed..."
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Areas for Improvement
              </label>
              <textarea
                value={formData.skillsToImprove}
                onChange={(e) => updateField('skillsToImprove', e.target.value)}
                rows={4}
                placeholder="Skills you want to develop further..."
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 4: Role & Environment */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Role & Work Environment</h2>
              <p className="text-sm text-slate-400">Rate your work environment and role clarity</p>
            </div>

            <StarRating
              label="How clear are your role and responsibilities?"
              value={formData.roleClarity}
              onChange={(v) => updateField('roleClarity', v)}
            />

            <StarRating
              label="Are you provided adequate tools and resources?"
              value={formData.resourcesAdequate}
              onChange={(v) => updateField('resourcesAdequate', v)}
            />

            <StarRating
              label="How would you rate your work-life balance?"
              value={formData.workloadBalance}
              onChange={(v) => updateField('workloadBalance', v)}
            />
          </div>
        )}

        {/* Step 5: Team & Culture */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Team & Culture</h2>
              <p className="text-sm text-slate-400">Rate team collaboration and cultural alignment</p>
            </div>

            <StarRating
              label="How effective is team collaboration?"
              value={formData.teamCollaboration}
              onChange={(v) => updateField('teamCollaboration', v)}
            />

            <StarRating
              label="How supportive is your manager?"
              value={formData.managerSupport}
              onChange={(v) => updateField('managerSupport', v)}
            />

            <StarRating
              label="How well do you fit with company culture?"
              value={formData.cultureFit}
              onChange={(v) => updateField('cultureFit', v)}
            />
          </div>
        )}

        {/* Step 6: Future Goals */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Future Goals</h2>
              <p className="text-sm text-slate-400">Plan for the coming year</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Goals for Next Year
              </label>
              <textarea
                value={formData.nextYearGoals}
                onChange={(e) => updateField('nextYearGoals', e.target.value)}
                rows={5}
                placeholder="What do you want to achieve next year? (Be specific and measurable)"
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Long-term Career Aspirations
              </label>
              <textarea
                value={formData.careerAspirations}
                onChange={(e) => updateField('careerAspirations', e.target.value)}
                rows={4}
                placeholder="Where do you see yourself in 2-3 years?"
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Support Needed from Company
              </label>
              <textarea
                value={formData.supportNeeded}
                onChange={(e) => updateField('supportNeeded', e.target.value)}
                rows={3}
                placeholder="What support do you need to achieve your goals?"
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Training/Certifications Requested
              </label>
              <textarea
                value={formData.trainingRequests}
                onChange={(e) => updateField('trainingRequests', e.target.value)}
                rows={3}
                placeholder="Any specific training or certifications you'd like?"
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 7: Feedback */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Feedback</h2>
              <p className="text-sm text-slate-400">Share your feedback (optional but valuable)</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Feedback About Company
              </label>
              <textarea
                value={formData.companyFeedback}
                onChange={(e) => updateField('companyFeedback', e.target.value)}
                rows={4}
                placeholder="Any feedback about company policies, benefits, or environment?"
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Feedback About Team
              </label>
              <textarea
                value={formData.teamFeedback}
                onChange={(e) => updateField('teamFeedback', e.target.value)}
                rows={4}
                placeholder="Any feedback about team dynamics or collaboration?"
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Process Improvement Suggestions
              </label>
              <textarea
                value={formData.processFeedback}
                onChange={(e) => updateField('processFeedback', e.target.value)}
                rows={4}
                placeholder="Any suggestions to improve processes or workflows?"
                className="w-full px-4 py-3 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={saveProgress}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </button>

            {step < STEPS.length ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitAppraisal}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Appraisal'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
