'use client'

import { useState, useEffect } from 'react'

interface TacticalInsight {
  id: string
  client: string
  platform: 'Meta' | 'Google'
  insightType: 'OPTIMIZATION' | 'SCALING' | 'TESTING' | 'ALERT'
  title: string
  description: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'NEW' | 'IN_PROGRESS' | 'IMPLEMENTED'
  potentialGain: string
}

export default function TacticalReportPage() {
  const [insights, setInsights] = useState<TacticalInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/ads/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const data = await res.json()

        // Build tactical insights from top campaigns and platform breakdown
        const topCampaigns = data.topCampaigns || []
        const mapped: TacticalInsight[] = topCampaigns.map((c: Record<string, unknown>, idx: number) => {
          const cpl = (c.cpl as number) || 0
          const ctr = (c.ctr as number) || 0
          const roas = (c.roas as number) || 0
          const platform = (c.platform as string) === 'GOOGLE' ? 'Google' as const : 'Meta' as const

          let insightType: TacticalInsight['insightType'] = 'OPTIMIZATION'
          let title = ''
          let description = ''
          let impact: TacticalInsight['impact'] = 'MEDIUM'
          let potentialGain = ''

          if (cpl > 500) {
            insightType = 'ALERT'
            title = `High CPL on ${c.name}`
            description = `CPL is ₹${cpl.toFixed(0)} which is above target. Consider audience refinement or creative refresh.`
            impact = 'HIGH'
            potentialGain = `₹${Math.round(cpl * 0.2)}/lead reduction`
          } else if (ctr < 1) {
            insightType = 'TESTING'
            title = `Low CTR on ${c.name}`
            description = `CTR is ${ctr.toFixed(2)}%. Test new ad creatives or headlines to improve engagement.`
            impact = 'MEDIUM'
            potentialGain = `${(1 - ctr).toFixed(1)}% CTR increase potential`
          } else if (roas > 4) {
            insightType = 'SCALING'
            title = `Scale budget on ${c.name}`
            description = `ROAS is ${roas.toFixed(1)}x. Strong performance suggests room for budget increase.`
            impact = 'HIGH'
            potentialGain = `${Math.round(roas * 0.5)}x additional return`
          } else {
            title = `Optimize ${c.name}`
            description = `Review targeting and creatives for better performance. Current ROAS: ${roas.toFixed(1)}x`
            potentialGain = 'Improved efficiency'
          }

          return {
            id: (c.id as string) || String(idx),
            client: (c.client as Record<string, string>)?.name || 'Unknown',
            platform,
            insightType,
            title,
            description,
            impact,
            status: 'NEW' as const,
            potentialGain,
          }
        })
        setInsights(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tactical data')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div className="space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>
  if (insights.length === 0) return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Tactical Report</h1>
        <p className="text-red-200">Actionable insights and optimization recommendations</p>
      </div>
      <div className="flex items-center justify-center h-64 text-slate-400">No tactical insights available</div>
    </div>
  )

  const filteredInsights = typeFilter === 'ALL' ? insights : insights.filter(i => i.insightType === typeFilter)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'OPTIMIZATION': return 'bg-blue-500/20 text-blue-400'
      case 'SCALING': return 'bg-green-500/20 text-green-400'
      case 'TESTING': return 'bg-purple-500/20 text-purple-400'
      case 'ALERT': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-red-500/20 text-red-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-500/20 text-blue-400'
      case 'IN_PROGRESS': return 'bg-amber-500/20 text-amber-400'
      case 'IMPLEMENTED': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Meta': return 'bg-blue-500/20 text-blue-400'
      case 'Google': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-300'
    }
  }

  const highImpactCount = insights.filter(i => i.impact === 'HIGH').length
  const newCount = insights.filter(i => i.status === 'NEW').length
  const alertCount = insights.filter(i => i.insightType === 'ALERT').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tactical Report</h1>
            <p className="text-red-200">Actionable insights and optimization recommendations</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-200">Insights generated</p>
            <p className="font-medium">Today, 8:00 AM</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Insights</p>
          <p className="text-3xl font-bold text-slate-200">{insights.length}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">High Impact</p>
          <p className="text-3xl font-bold text-red-400">{highImpactCount}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">New This Week</p>
          <p className="text-3xl font-bold text-blue-400">{newCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Alerts</p>
          <p className="text-3xl font-bold text-amber-400">{alertCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'OPTIMIZATION', 'SCALING', 'TESTING', 'ALERT'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === type
                ? 'bg-red-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-red-300'
            }`}
          >
            {type === 'ALL' ? 'All Insights' : type}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map(insight => (
          <div key={insight.id} className="glass-card rounded-xl border border-white/10 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(insight.insightType)}`}>
                  {insight.insightType}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(insight.platform)}`}>
                  {insight.platform}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getImpactColor(insight.impact)}`}>
                  {insight.impact} IMPACT
                </span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(insight.status)}`}>
                {insight.status.replace(/_/g, ' ')}
              </span>
            </div>

            <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
            <p className="text-sm text-slate-400 mb-3">{insight.client}</p>
            <p className="text-sm text-slate-300 mb-4">{insight.description}</p>

            <div className="flex items-center justify-between">
              <div className="bg-green-500/10 rounded-lg px-3 py-1.5">
                <span className="text-sm text-green-400">
                  Potential Gain: <span className="font-semibold">{insight.potentialGain}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {insight.status === 'NEW' && (
                  <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Start Implementation
                  </button>
                )}
                {insight.status === 'IN_PROGRESS' && (
                  <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Mark Complete
                  </button>
                )}
                <button className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Playbook */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Quick Optimization Playbook</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">High CPL?</p>
            <ul className="space-y-1">
              <li>• Refine audience targeting</li>
              <li>• Test new creatives</li>
              <li>• Optimize ad schedule</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Low Volume?</p>
            <ul className="space-y-1">
              <li>• Increase budget</li>
              <li>• Expand audience</li>
              <li>• Add new placements</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Low Quality?</p>
            <ul className="space-y-1">
              <li>• Add qualifying questions</li>
              <li>• Exclude cold audiences</li>
              <li>• Improve landing page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
