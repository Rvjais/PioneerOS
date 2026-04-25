'use client'

import { useState, useEffect } from 'react'

interface PlannedCampaign {
  id: string
  client: string
  campaignName: string
  platform: 'Meta' | 'Google'
  campaignType: string
  budget: number
  launchDate: string
  status: 'PLANNING' | 'CREATIVE_PENDING' | 'READY' | 'LAUNCHED'
  assignee: string
}

export default function CampaignPlannerPage() {
  const [campaigns, setCampaigns] = useState<PlannedCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/ads/campaigns?status=DRAFT&limit=20')
        if (!res.ok) throw new Error('Failed to fetch campaigns')
        const data = await res.json()
        const mapped: PlannedCampaign[] = (data.campaigns || []).map((c: Record<string, unknown>) => ({
          id: c.id as string,
          client: (c.client as Record<string, string>)?.name || 'Unknown',
          campaignName: c.name as string,
          platform: c.platform === 'GOOGLE' ? 'Google' : 'Meta',
          campaignType: (c.campaignType as string) || 'General',
          budget: (c.totalBudget as number) || (c.monthlyBudget as number) || 0,
          launchDate: c.startDate ? new Date(c.startDate as string).toISOString().split('T')[0] : 'TBD',
          status: 'PLANNING',
          assignee: c.assignedTo ? `${(c.assignedTo as Record<string, string>).firstName || ''} ${(c.assignedTo as Record<string, string>).lastName || ''}`.trim() : 'Unassigned',
        }))
        setCampaigns(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaigns')
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [])

  if (loading) return <div className="space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-slate-800/50 text-slate-200'
      case 'CREATIVE_PENDING': return 'bg-amber-500/20 text-amber-400'
      case 'READY': return 'bg-green-500/20 text-green-400'
      case 'LAUNCHED': return 'bg-blue-500/20 text-blue-400'
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

  if (campaigns.length === 0) return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Campaign Planner</h1>
        <p className="text-red-200">Plan and track upcoming campaigns</p>
      </div>
      <div className="flex items-center justify-center h-64 text-slate-400">No planned campaigns found</div>
    </div>
  )

  const PLANNED_CAMPAIGNS = campaigns
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
  const readyCount = campaigns.filter(c => c.status === 'READY').length
  const pendingCount = campaigns.filter(c => c.status === 'CREATIVE_PENDING').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Campaign Planner</h1>
            <p className="text-red-200">Plan and track upcoming campaigns</p>
          </div>
          <button className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium hover:bg-red-500/10">
            + Plan Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Planned Campaigns</p>
          <p className="text-3xl font-bold text-slate-200">{PLANNED_CAMPAIGNS.length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Ready to Launch</p>
          <p className="text-3xl font-bold text-green-400">{readyCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Waiting for Creatives</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Total Budget</p>
          <p className="text-3xl font-bold text-red-400">₹{(totalBudget / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Upcoming Campaigns</h2>
        </div>
        <div className="divide-y divide-white/10">
          {PLANNED_CAMPAIGNS.sort((a, b) => new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime()).map(campaign => (
            <div key={campaign.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{campaign.campaignName}</h3>
                  <p className="text-sm text-slate-400">{campaign.client}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(campaign.platform)}`}>
                    {campaign.platform}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(campaign.status)}`}>
                    {campaign.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-300">Type: <span className="font-medium">{campaign.campaignType}</span></span>
                <span className="text-slate-300">Budget: <span className="text-red-400 font-semibold">₹{(campaign.budget / 1000).toFixed(0)}K</span></span>
                <span className="text-slate-300">Launch: <span className="font-medium">{new Date(campaign.launchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span>
                <span className="text-slate-300">Assignee: <span className="font-medium">{campaign.assignee}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planning Tips */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Campaign Planning Checklist</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Before Launch</p>
            <ul className="space-y-1">
              <li>• Define target audience</li>
              <li>• Set clear objectives</li>
              <li>• Prepare landing page</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Creative Requirements</p>
            <ul className="space-y-1">
              <li>• Multiple ad variations</li>
              <li>• Video + static options</li>
              <li>• Copy A/B testing ready</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Tracking Setup</p>
            <ul className="space-y-1">
              <li>• Pixel/Tag installed</li>
              <li>• Conversion events setup</li>
              <li>• UTM parameters ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
