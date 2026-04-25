'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DailyMeetingFormProps {
  onComplete?: () => void
  isBlocking?: boolean
}

export function DailyMeetingForm({ onComplete, isBlocking = false }: DailyMeetingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [yesterdayWork, setYesterdayWork] = useState<string[]>([''])
  const [yesterdayBlockers, setYesterdayBlockers] = useState('')
  const [todayPlan, setTodayPlan] = useState<string[]>([''])
  const [todayClients, setTodayClients] = useState<string[]>([])
  const [estimatedHours, setEstimatedHours] = useState(8)
  const [workload, setWorkload] = useState('NORMAL')
  const [mood, setMood] = useState('GOOD')
  const [needsHelp, setNeedsHelp] = useState(false)
  const [helpDescription, setHelpDescription] = useState('')
  const [workLocation, setWorkLocation] = useState('OFFICE')

  // Time tracking
  const [currentTime, setCurrentTime] = useState(new Date())
  const isLateTime = currentTime.getHours() >= 11

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Add/remove items from lists
  const addYesterdayItem = () => setYesterdayWork([...yesterdayWork, ''])
  const removeYesterdayItem = (index: number) => {
    if (yesterdayWork.length > 1) {
      setYesterdayWork(yesterdayWork.filter((_, i) => i !== index))
    }
  }
  const updateYesterdayItem = (index: number, value: string) => {
    const updated = [...yesterdayWork]
    updated[index] = value
    setYesterdayWork(updated)
  }

  const addTodayItem = () => setTodayPlan([...todayPlan, ''])
  const removeTodayItem = (index: number) => {
    if (todayPlan.length > 1) {
      setTodayPlan(todayPlan.filter((_, i) => i !== index))
    }
  }
  const updateTodayItem = (index: number, value: string) => {
    const updated = [...todayPlan]
    updated[index] = value
    setTodayPlan(updated)
  }

  const handleSubmit = async () => {
    const filteredYesterday = yesterdayWork.filter(w => w.trim())
    const filteredToday = todayPlan.filter(p => p.trim())

    if (filteredYesterday.length === 0) {
      setError('Please add at least one completed task from yesterday')
      return
    }
    if (filteredToday.length === 0) {
      setError('Please add at least one task for today')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/meetings/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yesterdayWork: filteredYesterday,
          yesterdayBlockers: yesterdayBlockers || null,
          todayPlan: filteredToday,
          todayClients,
          estimatedHours,
          workload,
          mood,
          needsHelp,
          helpDescription: needsHelp ? helpDescription : null,
          workLocation
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit')
        return
      }

      if (onComplete) {
        onComplete()
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const greeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className={`${isBlocking ? 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : ''}`}>
      <div className={`${isBlocking ? 'w-full max-w-2xl mx-4' : ''}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {greeting()}! &#x2600;&#xfe0f;
          </h1>
          <p className="text-slate-400">
            {isBlocking
              ? "Let's start your day with a quick check-in"
              : 'Daily Check-in'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className={`text-sm px-3 py-1 rounded-full ${isLateTime ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              {isLateTime && ' (Late check-in)'}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Yesterday's Work */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              What did you complete yesterday?
            </label>
            <div className="space-y-2">
              {yesterdayWork.map((item, index) => (
                <div key={`yesterday-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateYesterdayItem(index, e.target.value)}
                    placeholder={`Task ${index + 1}...`}
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {yesterdayWork.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYesterdayItem(index)}
                      className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addYesterdayItem}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add another task
              </button>
            </div>
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Any blockers faced? <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={yesterdayBlockers}
              onChange={(e) => setYesterdayBlockers(e.target.value)}
              placeholder="Describe any blockers or challenges..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Today's Plan */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              What will you work on today?
            </label>
            <div className="space-y-2">
              {todayPlan.map((item, index) => (
                <div key={`today-${index}`} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateTodayItem(index, e.target.value)}
                    placeholder={`Task ${index + 1}...`}
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {todayPlan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTodayItem(index)}
                      className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTodayItem}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add another task
              </button>
            </div>
          </div>

          {/* Work Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Where are you working from?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'OFFICE', label: 'Office', icon: '\u{1F3E2}' },
                { value: 'WFH', label: 'Work from Home', icon: '\u{1F3E0}' },
                { value: 'CLIENT_SITE', label: 'Client Site', icon: '\u{1F4BC}' },
                { value: 'FIELD', label: 'Field Work', icon: '\u{1F697}' }
              ].map(loc => (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => setWorkLocation(loc.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${workLocation === loc.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-700 border border-white/10'
                    }`}
                >
                  <span>{loc.icon}</span> {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workload & Mood */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                How&apos;s your workload?
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'LOW', label: 'Light', color: 'emerald' },
                  { value: 'NORMAL', label: 'Normal', color: 'blue' },
                  { value: 'HIGH', label: 'Heavy', color: 'amber' },
                  { value: 'OVERLOADED', label: 'Overloaded', color: 'red' }
                ].map(w => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setWorkload(w.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${workload === w.value
                        ? `bg-${w.color}-600 text-white`
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700 border border-white/10'
                      }`}
                    style={workload === w.value ? {
                      backgroundColor: w.color === 'emerald' ? '#059669' :
                        w.color === 'blue' ? '#2563eb' :
                          w.color === 'amber' ? '#d97706' : '#dc2626'
                    } : {}}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                How are you feeling?
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'GREAT', label: '\u{1F60A} Great' },
                  { value: 'GOOD', label: '\u{1F642} Good' },
                  { value: 'OKAY', label: '\u{1F610} Okay' },
                  { value: 'STRESSED', label: '\u{1F613} Stressed' }
                ].map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mood === m.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700 border border-white/10'
                      }`}
                  >
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-slate-900 rounded-lg p-4 border border-white/5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={needsHelp}
                onChange={(e) => setNeedsHelp(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-200">I need help with something</span>
            </label>
            {needsHelp && (
              <textarea
                value={helpDescription}
                onChange={(e) => setHelpDescription(e.target.value)}
                placeholder="Describe what you need help with..."
                rows={2}
                className="mt-3 w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit &amp; Start My Day
              </>
            )}
          </button>

          {/* Late Warning */}
          {isLateTime && (
            <p className="text-center text-xs text-amber-400">
              Check-in is after 11:00 AM and will be marked as late.
              Please try to submit before 11:00 AM tomorrow.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
