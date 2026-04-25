'use client'

import { useEffect, useState, use } from 'react'

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
    <div className="flex gap-2">
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
            className={`w-9 h-9 transition-colors ${
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

export default function PublicSurveyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [clientName, setClientName] = useState('')
  const [alreadyFilled, setAlreadyFilled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [invalidToken, setInvalidToken] = useState(false)

  const [survey, setSurvey] = useState<SurveyData>({
    overallSatisfaction: 0,
    communicationRating: 0,
    deliveryRating: 0,
    valueRating: 0,
    feedback: '',
    improvements: '',
  })

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/client-portal/survey/public?token=${encodeURIComponent(token)}`)
        if (!res.ok) {
          setInvalidToken(true)
          return
        }
        const data = await res.json()
        setClientName(data.clientName)
        setAlreadyFilled(data.alreadyFilled)
      } catch {
        setInvalidToken(true)
      } finally {
        setIsLoading(false)
      }
    }
    validate()
  }, [token])

  const handleSubmit = async () => {
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
      const res = await fetch('/api/client-portal/survey/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
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

      setIsSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md mx-4 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Invalid Link</h2>
          <p className="text-slate-400">This survey link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pioneer<span className="text-blue-400">OS</span>
          </h1>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Glass effect top bar */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="p-6">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 text-green-400">&#10003;</div>
                <h3 className="text-xl font-semibold text-white mb-2">Thank you!</h3>
                <p className="text-slate-400">
                  Your feedback has been recorded. We appreciate you taking the time to help us improve.
                </p>
              </div>
            ) : alreadyFilled ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">&#128077;</div>
                <h3 className="text-xl font-semibold text-white mb-2">Already Submitted</h3>
                <p className="text-slate-400">
                  You have already submitted your survey for this month. Thank you!
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white">Monthly Satisfaction Survey</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Hi <span className="text-blue-400">{clientName}</span>, help us serve you better
                    — takes less than 2 minutes
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
                      onChange={(e) =>
                        setSurvey((prev) => ({ ...prev, feedback: e.target.value }))
                      }
                      rows={3}
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
                      rows={3}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                      placeholder="Tell us what can be better..."
                    />
                  </div>
                </div>

                {/* Error */}
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

                {/* Submit */}
                <div className="mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium py-3 px-4 rounded-xl transition-colors text-sm"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Powered by PioneerOS
        </p>
      </div>
    </div>
  )
}
