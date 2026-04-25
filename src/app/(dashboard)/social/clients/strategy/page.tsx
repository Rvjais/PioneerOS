'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface ContentStrategy {
  id: string
  client: string
  contentPillars: string[]
  postingFrequency: string
  campaignGoals: string[]
  targetAudience: string
  toneOfVoice: string
}

export default function ContentStrategyPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [strategies, setStrategies] = useState<ContentStrategy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/social/clients')
      .then(res => res.json())
      .then(result => {
        const items = result.clients || result.data || []
        const mapped: ContentStrategy[] = items.map((item: any) => ({
          id: item.id,
          client: item.name || '',
          contentPillars: item.socialPlatforms || [],
          postingFrequency: '',
          campaignGoals: [],
          targetAudience: item.industry || '',
          toneOfVoice: '',
        }))
        setStrategies(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])
  const getGoalColor = (goal: string) => {
    if (goal.includes('Brand')) return 'bg-purple-500/20 text-purple-400'
    if (goal.includes('Lead')) return 'bg-green-500/20 text-green-400'
    if (goal.includes('Education') || goal.includes('Trust')) return 'bg-blue-500/20 text-blue-400'
    if (goal.includes('Engagement')) return 'bg-pink-500/20 text-pink-400'
    return 'bg-slate-800/50 text-slate-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Strategy</h1>
            <p className="text-pink-200">Content themes and goals for each client</p>
          </div>
          {canEdit && (
            <button disabled title="Coming soon" className="px-4 py-2 glass-card text-pink-600 rounded-lg font-medium opacity-50 cursor-not-allowed">
              + New Strategy
            </button>
          )}
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-6">
        {strategies.map(strategy => (
          <div key={strategy.id} className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/40">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">{strategy.client}</h2>
                <span className="text-sm text-pink-600 font-medium">{strategy.postingFrequency}</span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Content Pillars */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Content Pillars</h3>
                <div className="flex flex-wrap gap-2">
                  {strategy.contentPillars.map(pillar => (
                    <span key={pillar} className="px-3 py-1 bg-pink-50 text-pink-700 text-sm rounded-full">
                      {pillar}
                    </span>
                  ))}
                </div>
              </div>

              {/* Campaign Goals */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Campaign Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {strategy.campaignGoals.map(goal => (
                    <span key={goal} className={`px-3 py-1 text-sm rounded-full ${getGoalColor(goal)}`}>
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target & Tone */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Target Audience</h3>
                  <p className="text-sm text-slate-200">{strategy.targetAudience}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Tone of Voice</h3>
                  <p className="text-sm text-slate-200">{strategy.toneOfVoice}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border-t border-white/10">
              <button disabled title="Coming soon" className="text-sm text-pink-600 font-medium opacity-50 cursor-not-allowed">
                Edit Strategy →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Tips */}
      <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
        <h3 className="font-semibold text-pink-800 mb-3">Strategy Best Practices</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-pink-700">
          <div>
            <p className="font-medium mb-1">Content Mix</p>
            <ul className="space-y-1">
              <li>• 60% Educational</li>
              <li>• 25% Promotional</li>
              <li>• 15% Engagement</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Posting Times</p>
            <ul className="space-y-1">
              <li>• Instagram: 9 AM, 1 PM, 7 PM</li>
              <li>• Facebook: 1 PM, 4 PM</li>
              <li>• LinkedIn: 10 AM, 12 PM</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Engagement Goals</p>
            <ul className="space-y-1">
              <li>• Reply to comments within 2 hours</li>
              <li>• Share user-generated content weekly</li>
              <li>• Run polls/questions 2x per week</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
