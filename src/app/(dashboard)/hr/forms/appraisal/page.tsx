'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

type Rating = 1 | 2 | 3 | 4 | 5

interface AppraisalForm {
  // Self Assessment
  performanceRating: Rating | null
  achievementsHighlights: string
  challengesFaced: string
  skillsImproved: string
  goalsNextQuarter: string

  // Scores
  qualityOfWork: Rating | null
  productivity: Rating | null
  communication: Rating | null
  teamwork: Rating | null
  initiative: Rating | null
  punctuality: Rating | null
  learningGrowth: Rating | null

  // Development
  trainingNeeds: string
  careerAspirations: string
  feedbackForManagement: string

  // Acknowledgment
  acknowledged: boolean
}

const ratingLabels: Record<Rating, string> = {
  1: 'Needs Improvement',
  2: 'Below Expectations',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding',
}

const ratingColors: Record<Rating, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
  5: 'bg-emerald-500',
}

export default function AppraisalFormPage() {
  const [form, setForm] = useState<AppraisalForm>({
    performanceRating: null,
    achievementsHighlights: '',
    challengesFaced: '',
    skillsImproved: '',
    goalsNextQuarter: '',
    qualityOfWork: null,
    productivity: null,
    communication: null,
    teamwork: null,
    initiative: null,
    punctuality: null,
    learningGrowth: null,
    trainingNeeds: '',
    careerAspirations: '',
    feedbackForManagement: '',
    acknowledged: false,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const updateRating = (field: keyof AppraisalForm, value: Rating) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updateText = (field: keyof AppraisalForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const calculateOverallScore = () => {
    const ratings = [
      form.qualityOfWork,
      form.productivity,
      form.communication,
      form.teamwork,
      form.initiative,
      form.punctuality,
      form.learningGrowth,
    ].filter((r): r is Rating => r !== null)

    if (ratings.length === 0) return 0
    return (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
  }

  const RatingSelector = ({
    label,
    value,
    onChange,
    description,
  }: {
    label: string
    value: Rating | null
    onChange: (value: Rating) => void
    description?: string
  }) => (
    <div className="p-4 bg-slate-900/40 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-white">{label}</p>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
        {value && (
          <span className={`px-2 py-0.5 text-xs text-white rounded ${ratingColors[value]}`}>
            {ratingLabels[value]}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as Rating[]).map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
              value === rating
                ? `${ratingColors[rating]} text-white`
                : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  )

  const handleSubmit = () => {
    toast.success('Appraisal form submitted successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/hr" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
            &larr; Back to HR
          </Link>
          <h1 className="text-2xl font-bold text-white">Self-Appraisal Form</h1>
          <p className="text-slate-400">Q1 2024 Performance Review</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-purple-400">{calculateOverallScore()}</p>
          <p className="text-sm text-slate-400">Current Score</p>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-200">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-slate-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full transition-all"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span className={currentStep >= 1 ? 'text-purple-400' : ''}>Self Assessment</span>
          <span className={currentStep >= 2 ? 'text-purple-400' : ''}>Performance Scores</span>
          <span className={currentStep >= 3 ? 'text-purple-400' : ''}>Development</span>
          <span className={currentStep >= 4 ? 'text-purple-400' : ''}>Review & Submit</span>
        </div>
      </div>

      {/* Step 1: Self Assessment */}
      {currentStep === 1 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Self Assessment</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Overall Performance Rating (Self-Assessment)
            </label>
            <div className="grid grid-cols-5 gap-3">
              {([1, 2, 3, 4, 5] as Rating[]).map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateRating('performanceRating', rating)}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    form.performanceRating === rating
                      ? 'border-purple-600 bg-purple-500/10'
                      : 'border-white/10 hover:border-purple-300'
                  }`}
                >
                  <p className="text-2xl font-bold text-white">{rating}</p>
                  <p className="text-xs text-slate-400 mt-1">{ratingLabels[rating]}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Key Achievements & Highlights
            </label>
            <textarea
              value={form.achievementsHighlights}
              onChange={(e) => updateText('achievementsHighlights', e.target.value)}
              placeholder="List your major accomplishments this quarter..."
              rows={4}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Challenges Faced
            </label>
            <textarea
              value={form.challengesFaced}
              onChange={(e) => updateText('challengesFaced', e.target.value)}
              placeholder="Describe any challenges or obstacles you faced..."
              rows={3}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Skills Improved
            </label>
            <textarea
              value={form.skillsImproved}
              onChange={(e) => updateText('skillsImproved', e.target.value)}
              placeholder="What new skills did you develop or improve?"
              rows={3}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Goals for Next Quarter
            </label>
            <textarea
              value={form.goalsNextQuarter}
              onChange={(e) => updateText('goalsNextQuarter', e.target.value)}
              placeholder="What do you aim to achieve next quarter?"
              rows={3}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Step 2: Performance Scores */}
      {currentStep === 2 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Performance Scores</h2>
          <p className="text-sm text-slate-400 mb-6">Rate yourself on a scale of 1-5 for each category</p>

          <RatingSelector
            label="Quality of Work"
            description="Accuracy, thoroughness, and excellence in deliverables"
            value={form.qualityOfWork}
            onChange={(v) => updateRating('qualityOfWork', v)}
          />

          <RatingSelector
            label="Productivity"
            description="Efficiency, meeting deadlines, and output volume"
            value={form.productivity}
            onChange={(v) => updateRating('productivity', v)}
          />

          <RatingSelector
            label="Communication"
            description="Clarity, responsiveness, and collaboration"
            value={form.communication}
            onChange={(v) => updateRating('communication', v)}
          />

          <RatingSelector
            label="Teamwork"
            description="Collaboration, support, and team contribution"
            value={form.teamwork}
            onChange={(v) => updateRating('teamwork', v)}
          />

          <RatingSelector
            label="Initiative"
            description="Proactiveness, problem-solving, and taking ownership"
            value={form.initiative}
            onChange={(v) => updateRating('initiative', v)}
          />

          <RatingSelector
            label="Punctuality & Attendance"
            description="Reliability, time management, and availability"
            value={form.punctuality}
            onChange={(v) => updateRating('punctuality', v)}
          />

          <RatingSelector
            label="Learning & Growth"
            description="Skill development, adaptability, and continuous improvement"
            value={form.learningGrowth}
            onChange={(v) => updateRating('learningGrowth', v)}
          />
        </div>
      )}

      {/* Step 3: Development */}
      {currentStep === 3 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Development & Feedback</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Training & Development Needs
            </label>
            <textarea
              value={form.trainingNeeds}
              onChange={(e) => updateText('trainingNeeds', e.target.value)}
              placeholder="What training or resources would help you grow?"
              rows={4}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Career Aspirations
            </label>
            <textarea
              value={form.careerAspirations}
              onChange={(e) => updateText('careerAspirations', e.target.value)}
              placeholder="Where do you see yourself in 1-2 years? What role or skills interest you?"
              rows={4}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Feedback for Management
            </label>
            <textarea
              value={form.feedbackForManagement}
              onChange={(e) => updateText('feedbackForManagement', e.target.value)}
              placeholder="Any suggestions or feedback for the team or leadership?"
              rows={4}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Review & Submit</h2>

          {/* Score Summary */}
          <div className="bg-purple-500/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Your Self-Assessment Score</h3>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-400">{calculateOverallScore()}</p>
                <p className="text-sm text-slate-400">out of 5.0</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="glass-card rounded p-2">
                <p className="text-slate-400">Quality</p>
                <p className="font-medium">{form.qualityOfWork || '-'}/5</p>
              </div>
              <div className="glass-card rounded p-2">
                <p className="text-slate-400">Productivity</p>
                <p className="font-medium">{form.productivity || '-'}/5</p>
              </div>
              <div className="glass-card rounded p-2">
                <p className="text-slate-400">Communication</p>
                <p className="font-medium">{form.communication || '-'}/5</p>
              </div>
              <div className="glass-card rounded p-2">
                <p className="text-slate-400">Teamwork</p>
                <p className="font-medium">{form.teamwork || '-'}/5</p>
              </div>
            </div>
          </div>

          {/* Acknowledgment */}
          <label className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={form.acknowledged}
              onChange={(e) => setForm(prev => ({ ...prev, acknowledged: e.target.checked }))}
              className="mt-1 w-5 h-5 text-purple-400 rounded border-white/20 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-200">
              I acknowledge that this self-appraisal represents my honest assessment of my performance.
              I understand that my manager will review this and may provide additional feedback.
              The final appraisal rating will be determined after the review meeting.
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
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!form.acknowledged}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Submit Appraisal
          </button>
        )}
      </div>
    </div>
  )
}
