'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'

interface SurveyData {
  overallSatisfaction: number
  communicationRating: number
  deliveryRating: number
  valueRating: number
  feedback: string
  improvements: string
}

const QUESTIONS = [
  { key: 'overallSatisfaction' as const, label: 'Overall satisfaction with our services this month?' },
  { key: 'communicationRating' as const, label: 'How would you rate our communication?' },
  { key: 'deliveryRating' as const, label: 'Quality of deliverables and results?' },
  { key: 'valueRating' as const, label: 'Value for money?' },
]

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <svg
            className={`w-8 h-8 transition-colors ${
              star <= (hover || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600 fill-slate-700'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function MonthlySurveyPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [error, setError] = useState('')

  const [survey, setSurvey] = useState<SurveyData>({
    overallSatisfaction: 0,
    communicationRating: 0,
    deliveryRating: 0,
    valueRating: 0,
    feedback: '',
    improvements: '',
  })

  const checkSurvey = useCallback(async () => {
    // Check sessionStorage for dismissal
    if (typeof window !== 'undefined' && sessionStorage.getItem('survey_dismissed')) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/client-portal/survey')
      if (!res.ok) {
        setIsLoading(false)
        return
      }

      const data = await res.json()
      if (data.hasPendingSurvey) {
        setIsVisible(true)
      }
    } catch {
      // Silently fail - don't block the dashboard
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSurvey()
  }, [checkSurvey])

  const handleDismiss = () => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('survey_dismissed', 'true')
    }
  }

  const handleSubmit = async () => {
    // Validate all ratings are filled
    const ratingKeys = ['overallSatisfaction', 'communicationRating', 'deliveryRating', 'valueRating'] as const
    for (const key of ratingKeys) {
      if (survey[key] === 0) {
        setError('Please rate all questions before submitting.')
        return
      }
    }

    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/client-portal/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallSatisfaction: survey.overallSatisfaction,
          communicationRating: survey.communicationRating,
          deliveryRating: survey.deliveryRating,
          valueRating: survey.valueRating,
          feedback: survey.feedback || null,
          improvements: survey.improvements || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to submit survey')
        return
      }

      setShowThankYou(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Glass effect top bar */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {showThankYou ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">&#10003;</div>
              <h3 className="text-xl font-semibold text-white mb-2">Thank you!</h3>
              <p className="text-slate-400">Your feedback helps us serve you better.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Quick Monthly Check-in</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Help us serve you better — takes less than 2 minutes
                </p>
              </div>

              {/* Rating Questions */}
              <div className="space-y-5">
                {QUESTIONS.map((q) => (
                  <div key={q.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {q.label}
                    </label>
                    <StarRating
                      value={survey[q.key]}
                      onChange={(v) => setSurvey((prev) => ({ ...prev, [q.key]: v }))}
                    />
                  </div>
                ))}
              </div>

              {/* Text Fields */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Any feedback or suggestions?{' '}
                    <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={survey.feedback}
                    onChange={(e) => setSurvey((prev) => ({ ...prev, feedback: e.target.value }))}
                    rows={2}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                    placeholder="Share your thoughts..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Anything we can improve?{' '}
                    <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={survey.improvements}
                    onChange={(e) =>
                      setSurvey((prev) => ({ ...prev, improvements: e.target.value }))
                    }
                    rows={2}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                    placeholder="Tell us what can be better..."
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
              )}

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors py-2.5 px-4"
                >
                  Remind me later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
