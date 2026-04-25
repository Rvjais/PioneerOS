'use client'

import { useState, useEffect } from 'react'

interface Campaign {
  id: string
  name: string
  client: string
  platform: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'COMPLETED' | 'PLANNED'
  metrics: {
    reach: number
    impressions: number
    engagement: number
    followersGained: number
  }
}

export default function CampaignPerformancePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/social/clients?limit=100')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()

        const rows: Campaign[] = []
        for (const client of data.clients || []) {
          const metrics = client.platformMetrics || []
          if (metrics.length === 0) {
            rows.push({
              id: client.id,
              name: `${client.name} Campaign`,
              client: client.name,
              platform: (client.socialPlatforms?.[0] || 'All').replace('INSTAGRAM', 'Instagram').replace('FACEBOOK', 'Facebook').replace('LINKEDIN', 'LinkedIn').replace('TWITTER', 'Twitter').replace('YOUTUBE', 'YouTube'),
              startDate: new Date().toISOString().slice(0, 10),
              endDate: new Date().toISOString().slice(0, 10),
              status: 'ACTIVE',
              metrics: { reach: 0, impressions: 0, engagement: 0, followersGained: 0 },
            })
          } else {
            for (const m of metrics) {
              const platformName = (m.platform || 'All')
                .replace('INSTAGRAM', 'Instagram')
                .replace('FACEBOOK', 'Facebook')
                .replace('LINKEDIN', 'LinkedIn')
                .replace('TWITTER', 'Twitter')
                .replace('YOUTUBE', 'YouTube')
              rows.push({
                id: `${client.id}-${m.platform}`,
                name: `${client.name} — ${platformName}`,
                client: client.name,
                platform: platformName,
                startDate: m.month ? new Date(m.month).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                endDate: m.month ? new Date(m.month).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                status: 'ACTIVE',
                metrics: {
                  reach: m.followers || 0,
                  impressions: Math.round((m.followers || 0) * (m.engagementRate || 0) / 100 * 3),
                  engagement: Math.round((m.followers || 0) * (m.engagementRate || 0) / 100),
                  followersGained: m.followerGrowth || 0,
                },
              })
            }
          }
        }
        setCampaigns(rows)
      } catch (err) {
        console.error('Failed to load campaign data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400'
      case 'COMPLETED': return 'bg-blue-500/20 text-blue-400'
      case 'PLANNED': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'text-pink-600'
      case 'Facebook': return 'text-blue-400'
      case 'LinkedIn': return 'text-sky-700'
      case 'All': return 'text-purple-400'
      default: return 'text-slate-300'
    }
  }

  const totalReach = campaigns.reduce((sum, c) => sum + c.metrics.reach, 0)
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0)
  const totalFollowersGained = campaigns.reduce((sum, c) => sum + c.metrics.followersGained, 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 h-28 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 p-4 h-24 animate-pulse bg-slate-800/30" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 p-4 h-40 animate-pulse bg-slate-800/30" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Campaign Performance</h1>
            <p className="text-pink-200">Track reach, impressions and follower growth</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-pink-200 text-sm">Active Campaigns</p>
              <p className="text-3xl font-bold">{activeCampaigns}</p>
            </div>
            <div className="text-right">
              <p className="text-pink-200 text-sm">Total Reach</p>
              <p className="text-3xl font-bold">{(totalReach / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Active Campaigns</p>
          <p className="text-3xl font-bold text-green-400">{activeCampaigns}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Total Reach</p>
          <p className="text-3xl font-bold text-blue-400">{(totalReach / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Total Impressions</p>
          <p className="text-3xl font-bold text-purple-400">{(totalImpressions / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
          <p className="text-sm text-pink-600">Followers Gained</p>
          <p className="text-3xl font-bold text-pink-700">+{totalFollowersGained.toLocaleString()}</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{campaign.name}</h3>
                <p className="text-sm text-slate-400">
                  {campaign.client} • <span className={getPlatformColor(campaign.platform)}>{campaign.platform}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  {new Date(campaign.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(campaign.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-400">Reach</p>
                <p className="text-xl font-bold text-blue-400">{(campaign.metrics.reach / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <p className="text-sm text-purple-400">Impressions</p>
                <p className="text-xl font-bold text-purple-400">{(campaign.metrics.impressions / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-sm text-pink-600">Engagement</p>
                <p className="text-xl font-bold text-pink-700">{campaign.metrics.engagement.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-sm text-green-400">Followers Gained</p>
                <p className="text-xl font-bold text-green-400">+{campaign.metrics.followersGained}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
