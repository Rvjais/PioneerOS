'use client'

import { useState, useEffect } from 'react'

interface AdStrategy {
  id: string
  client: string
  targetAudience: {
    location: string
    ageGroup: string
    interests: string[]
  }
  campaignFunnel: string[]
  landingPages: string[]
  monthlyBudget: number
  platforms: string[]
}

export default function AdStrategyPage() {
  const [strategies, setStrategies] = useState<AdStrategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStrategies() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/ads/campaigns?limit=50')
        if (!res.ok) throw new Error('Failed to fetch campaigns')
        const data = await res.json()
        const campaigns = data.campaigns || []

        // Group campaigns by client to build strategy view
        const clientMap: Record<string, AdStrategy> = {}
        for (const c of campaigns) {
          const clientId = c.client?.id || c.clientId
          const clientName = c.client?.name || 'Unknown'
          if (!clientMap[clientId]) {
            clientMap[clientId] = {
              id: clientId,
              client: clientName,
              targetAudience: {
                location: c.targetAudience || 'Not specified',
                ageGroup: 'Not specified',
                interests: c.keywords ? (c.keywords as string).split(',').map((k: string) => k.trim()) : [],
              },
              campaignFunnel: [],
              landingPages: [],
              monthlyBudget: 0,
              platforms: [],
            }
          }
          const strategy = clientMap[clientId]
          strategy.monthlyBudget += (c.monthlyBudget || c.totalBudget || 0)

          const platformName = c.platform === 'GOOGLE' ? 'Google' : c.platform === 'META' ? 'Meta' : c.platform
          if (platformName && !strategy.platforms.includes(platformName)) {
            strategy.platforms.push(platformName)
          }

          const objective = c.objective || c.campaignType || ''
          if (objective && !strategy.campaignFunnel.includes(objective)) {
            strategy.campaignFunnel.push(objective)
          }
        }
        setStrategies(Object.values(clientMap))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load strategies')
      } finally {
        setLoading(false)
      }
    }
    fetchStrategies()
  }, [])

  if (loading) return <div className="space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>
  if (strategies.length === 0) return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Ad Strategy</h1>
        <p className="text-red-200">Campaign structure and targeting for each client</p>
      </div>
      <div className="flex items-center justify-center h-64 text-slate-400">No strategies found</div>
    </div>
  )

  const AD_STRATEGIES = strategies
  const getFunnelColor = (funnel: string) => {
    if (funnel.includes('TOF')) return 'bg-blue-500/20 text-blue-400'
    if (funnel.includes('MOF')) return 'bg-amber-500/20 text-amber-400'
    if (funnel.includes('BOF')) return 'bg-green-500/20 text-green-400'
    return 'bg-slate-800/50 text-slate-200'
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Meta': return 'bg-blue-500/20 text-blue-400'
      case 'Google': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ad Strategy</h1>
            <p className="text-red-200">Campaign structure and targeting for each client</p>
          </div>
          <button className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium hover:bg-red-500/10">
            + New Strategy
          </button>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-6">
        {AD_STRATEGIES.map(strategy => (
          <div key={strategy.id} className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/40">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">{strategy.client}</h2>
                <div className="flex items-center gap-2">
                  {strategy.platforms.map(platform => (
                    <span key={platform} className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(platform)}`}>
                      {platform}
                    </span>
                  ))}
                  <span className="text-sm text-red-400 font-semibold">₹{(strategy.monthlyBudget / 1000).toFixed(0)}K/mo</span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Target Audience */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Target Audience</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Location</p>
                    <p className="text-slate-200">{strategy.targetAudience.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Age Group</p>
                    <p className="text-slate-200">{strategy.targetAudience.ageGroup}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Interests</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {strategy.targetAudience.interests.map(interest => (
                        <span key={interest} className="px-2 py-0.5 bg-slate-800/50 text-slate-300 text-xs rounded">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Funnel */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Campaign Funnel</h3>
                <div className="flex flex-wrap gap-2">
                  {strategy.campaignFunnel.map(funnel => (
                    <span key={funnel} className={`px-3 py-1 text-sm rounded-full ${getFunnelColor(funnel)}`}>
                      {funnel}
                    </span>
                  ))}
                </div>
              </div>

              {/* Landing Pages */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Landing Pages</h3>
                <div className="space-y-1">
                  {strategy.landingPages.map(page => (
                    <p key={page} className="text-sm text-red-400 font-mono">
                      {page}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border-t border-white/10">
              <button className="text-sm text-red-400 hover:text-red-800 font-medium">
                Edit Strategy →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Tips */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Strategy Best Practices</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Funnel Structure</p>
            <ul className="space-y-1">
              <li>• TOF: Brand awareness, reach</li>
              <li>• MOF: Engagement, consideration</li>
              <li>• BOF: Lead gen, conversions</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Budget Allocation</p>
            <ul className="space-y-1">
              <li>• 20% for TOF campaigns</li>
              <li>• 30% for MOF campaigns</li>
              <li>• 50% for BOF campaigns</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Optimization Tips</p>
            <ul className="space-y-1">
              <li>• A/B test creatives weekly</li>
              <li>• Review audience overlap</li>
              <li>• Monitor frequency capping</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
