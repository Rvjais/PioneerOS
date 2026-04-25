'use client'

import { useState, useEffect } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Anniversary {
  userId: string
  name: string
  department: string
  joiningDate: string
  anniversaryDate: string
  yearsCompleting: number
  daysUntil: number
  celebrated: boolean
}

interface Stats {
  total: number
  today: number
  thisWeek: number
  milestones: {
    oneYear: number
    twoYears: number
    threeYears: number
    fiveYearsPlus: number
  }
}

export default function WorkAnniversariesPage() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    milestones: { oneYear: 0, twoYears: 0, threeYears: 0, fiveYearsPlus: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [showCelebrateModal, setShowCelebrateModal] = useState<Anniversary | null>(null)

  useEffect(() => {
    fetchAnniversaries()
  }, [days])

  const fetchAnniversaries = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hr/work-anniversaries?days=${days}`)
      if (res.ok) {
        const data = await res.json()
        setAnniversaries(data.upcoming)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch anniversaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMilestoneColor = (years: number) => {
    if (years >= 5) return 'from-yellow-400 to-amber-500'
    if (years >= 3) return 'from-purple-400 to-indigo-500'
    if (years >= 2) return 'from-blue-400 to-cyan-500'
    return 'from-green-400 to-emerald-500'
  }

  const getMilestoneLabel = (years: number) => {
    if (years >= 10) return 'Decade Champion'
    if (years >= 5) return 'Veteran'
    if (years >= 3) return 'Senior Member'
    if (years >= 2) return 'Established'
    return 'First Year Complete'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Work Anniversaries</h1>
            <InfoTooltip
              title="Tracking Work Anniversaries"
              steps={[
                'View upcoming work anniversaries',
                'Plan celebrations in advance',
                'Mark anniversaries as celebrated',
                'Send recognition and appreciation'
              ]}
              tips={[
                'Plan gifts or recognition ahead of time',
                'Announce milestones in team meetings',
                'Consider department celebrations for 5+ years'
              ]}
            />
          </div>
          <p className="text-slate-400 text-sm mt-1">Celebrate team milestones and tenure</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm"
          >
            <option value="7">Next 7 days</option>
            <option value="30">Next 30 days</option>
            <option value="90">Next 90 days</option>
            <option value="365">Next year</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Upcoming</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-sm text-yellow-600">Today</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.today}</p>
        </div>
        <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
          <p className="text-sm text-orange-600">This Week</p>
          <p className="text-2xl font-bold text-orange-700">{stats.thisWeek}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">1 Year Milestones</p>
          <p className="text-2xl font-bold text-green-400">{stats.milestones.oneYear}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">5+ Years</p>
          <p className="text-2xl font-bold text-purple-400">{stats.milestones.fiveYearsPlus}</p>
        </div>
      </div>

      {/* Today's Anniversaries Banner */}
      {anniversaries.filter(a => a.daysUntil === 0).length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Today&apos;s Anniversaries!</h3>
          <div className="flex flex-wrap gap-4">
            {anniversaries.filter(a => a.daysUntil === 0).map(ann => (
              <div key={ann.userId} className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                    🎉
                  </div>
                  <div>
                    <p className="font-bold text-lg">{ann.name}</p>
                    <p className="text-white/90">Completing {ann.yearsCompleting} Year{ann.yearsCompleting > 1 ? 's' : ''}</p>
                    <p className="text-sm text-white/80">{ann.department}</p>
                  </div>
                </div>
                {!ann.celebrated && (
                  <button
                    onClick={() => setShowCelebrateModal(ann)}
                    className="mt-3 w-full py-2 glass-card text-amber-400 rounded-lg font-semibold hover:bg-white/90"
                  >
                    Celebrate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Anniversaries */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Upcoming Anniversaries</h2>
        </div>

        {anniversaries.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No upcoming anniversaries in the selected period
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {anniversaries.map((ann) => (
              <div key={ann.userId} className="p-4 hover:bg-slate-900/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getMilestoneColor(ann.yearsCompleting)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {ann.yearsCompleting}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{ann.name}</p>
                        {ann.celebrated && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Celebrated
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{ann.department}</p>
                      <p className="text-xs text-slate-400">
                        Joined: {new Date(ann.joiningDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      ann.daysUntil === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      ann.daysUntil <= 7 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-800/50 text-slate-300'
                    }`}>
                      {ann.daysUntil === 0 ? 'Today!' :
                       ann.daysUntil === 1 ? 'Tomorrow' :
                       `${ann.daysUntil} days`}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {getMilestoneLabel(ann.yearsCompleting)}
                    </p>
                    {!ann.celebrated && ann.daysUntil <= 7 && (
                      <button
                        onClick={() => setShowCelebrateModal(ann)}
                        className="mt-2 text-sm text-amber-400 hover:text-amber-400"
                      >
                        Mark as Celebrated
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Celebrate Modal */}
      {showCelebrateModal && (
        <CelebrateModal
          anniversary={showCelebrateModal}
          onClose={() => setShowCelebrateModal(null)}
          onSave={() => {
            setShowCelebrateModal(null)
            fetchAnniversaries()
          }}
        />
      )}
    </div>
  )
}

// Celebrate Modal
function CelebrateModal({
  anniversary,
  onClose,
  onSave
}: {
  anniversary: Anniversary
  onClose: () => void
  onSave: () => void
}) {
  const [celebrationNotes, setCelebrationNotes] = useState('')
  const [giftGiven, setGiftGiven] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/hr/work-anniversaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: anniversary.userId,
          yearsCompleted: anniversary.yearsCompleting,
          celebrationNotes,
          giftGiven
        })
      })

      if (res.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Failed to mark celebration:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-white/10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
            🎉
          </div>
          <h2 className="text-xl font-bold text-white">Celebrate {anniversary.name}</h2>
          <p className="text-slate-400">
            {anniversary.yearsCompleting} Year{anniversary.yearsCompleting > 1 ? 's' : ''} with the team
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Celebration Notes</label>
            <textarea
              value={celebrationNotes}
              onChange={(e) => setCelebrationNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="How did you celebrate? Team lunch, cake, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Gift Given</label>
            <input
              type="text"
              value={giftGiven}
              onChange={(e) => setGiftGiven(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="Certificate, Gift card, etc."
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Mark as Celebrated'}
          </button>
        </div>
      </div>
    </div>
  )
}
