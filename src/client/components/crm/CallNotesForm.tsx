'use client'

import { useState } from 'react'
import InfoTip from '@/client/components/ui/InfoTip'

interface Props {
  leadId: string
  onClose: () => void
  onSuccess: () => void
}

export function CallNotesForm({ leadId, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    outcome: 'NEUTRAL',
    duration: 15,
    type: 'CALL',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/crm/leads/${leadId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to log activity')
      }

      onSuccess()
    } catch (err) {
      setError('Failed to log activity. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Log Activity</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Activity Type<InfoTip text="What kind of interaction - Call, Email, Meeting, or internal Note." />
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'CALL', label: 'Call' },
                { value: 'EMAIL', label: 'Email' },
                { value: 'MEETING', label: 'Meeting' },
                { value: 'NOTE', label: 'Note' },
              ].map((type) => {
                const renderIcon = () => {
                  const iconClass = "w-5 h-5"
                  switch (type.value) {
                    case 'CALL':
                      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    case 'EMAIL':
                      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    case 'MEETING':
                      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    case 'NOTE':
                      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    default:
                      return null
                  }
                }
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-3 rounded-lg border-2 transition-colors text-center flex flex-col items-center ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    {renderIcon()}
                    <div className="text-xs mt-1">{type.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Title <span className="text-red-500">*</span><InfoTip text="Brief summary of the interaction. Include lead/client name." />
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`e.g., ${formData.type === 'CALL' ? 'Discovery call with CEO' : formData.type === 'EMAIL' ? 'Sent proposal follow-up' : formData.type === 'MEETING' ? 'On-site demo' : 'Key requirements noted'}`}
              required
            />
          </div>

          {(formData.type === 'CALL' || formData.type === 'MEETING') && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Duration (minutes)<InfoTip text="How long the call or meeting lasted." />
              </label>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration: mins })}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      formData.duration === mins
                        ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500'
                        : 'bg-slate-800/50 text-slate-300 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Outcome<InfoTip text="POSITIVE = moving forward, NEUTRAL = no change, NEGATIVE = lost interest." />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'POSITIVE', label: 'Positive', color: 'bg-green-500/20 text-green-400 border-green-500' },
                { value: 'NEUTRAL', label: 'Neutral', color: 'bg-slate-800/50 text-slate-200 border-slate-500' },
                { value: 'NEGATIVE', label: 'Negative', color: 'bg-red-500/20 text-red-400 border-red-500' },
              ].map((outcome) => (
                <button
                  key={outcome.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, outcome: outcome.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.outcome === outcome.value
                      ? outcome.color + ' border-2'
                      : 'bg-slate-900/40 text-slate-300 border-2 border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  {outcome.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Notes<InfoTip text="Detailed notes - what was discussed, agreed, and next steps. Your future self will thank you." />
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Key discussion points, action items, next steps..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Log Activity'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
