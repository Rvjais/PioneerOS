'use client'

import { useState, useEffect, useCallback } from 'react'
import { CampaignCreateModal } from '@/client/components/ads/CampaignCreateModal'

interface GoogleCampaign {
  id: string
  name: string
  client: { name: string } | string
  campaignType: string
  keywords: number
  landingPage: string
  status: string
  dailyBudget: number
  spend: number
  clicks: number
  leads: number
  cpl: number
  totalSpend?: number
  totalLeads?: number
  totalClicks?: number
  costPerLead?: number
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={`skeleton-col-${i}`} className="py-3 px-4"><div className="animate-pulse bg-slate-700/50 rounded h-5 w-full" /></td>
      ))}
    </tr>
  )
}

export default function GoogleCampaignsPage() {
  const [campaigns, setCampaigns] = useState<GoogleCampaign[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ platform: 'GOOGLE' })
      if (filter !== 'ALL') params.set('status', filter)
      const res = await fetch(`/api/ads/campaigns?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(Array.isArray(data) ? data : data.campaigns || [])
    } catch (err) {
      setError('Failed to load Google campaigns')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const filteredCampaigns = filter === 'ALL' ? campaigns : campaigns.filter(c => c.status === filter)

  const totalSpend = campaigns.reduce((sum, c) => sum + (c.totalSpend ?? c.spend ?? 0), 0)
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.totalLeads ?? c.leads ?? 0), 0)
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.totalClicks ?? c.clicks ?? 0), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400'
      case 'PAUSED': return 'bg-amber-500/20 text-amber-400'
      case 'UNDER_REVIEW': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'Search': return 'bg-red-500/20 text-red-400'
      case 'Display': return 'bg-blue-500/20 text-blue-400'
      case 'YouTube': return 'bg-pink-500/20 text-pink-400'
      case 'Performance Max': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getClientName = (client: { name: string } | string | undefined) => {
    if (!client) return 'Unknown'
    if (typeof client === 'string') return client
    return client.name
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Google Campaigns</h1>
            <p className="text-red-200">Search, Display & YouTube Advertising</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
            + New Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-green-400">Active Campaigns</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-green-400">{activeCampaigns}</p>
          )}
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-red-400">Total Spend</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-red-400">₹{(totalSpend / 1000).toFixed(1)}K</p>
          )}
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
          <p className="text-sm text-blue-400">Total Clicks</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-blue-400">{totalClicks}</p>
          )}
        </div>
        <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
          <p className="text-sm text-orange-400">Total Leads</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-orange-400">{totalLeads}</p>
          )}
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
          <p className="text-sm text-purple-400">Avg CPL</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-purple-400">₹{totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0}</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'ACTIVE', 'PAUSED', 'UNDER_REVIEW'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-red-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-red-300'
            }`}
          >
            {status === 'ALL' ? 'All Campaigns' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Campaign Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CAMPAIGN</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">TYPE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">KEYWORDS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">SPEND</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CLICKS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">LEADS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CPL</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skeleton-row-${i}`} />)
            ) : filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">No Google campaigns found</td>
              </tr>
            ) : (
              filteredCampaigns.map(campaign => (
                <tr key={campaign.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{campaign.name}</p>
                    {campaign.landingPage && (
                      <p className="text-xs text-slate-400 font-mono">{campaign.landingPage}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{getClientName(campaign.client)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getCampaignTypeColor(campaign.campaignType)}`}>
                      {campaign.campaignType || 'Search'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300">{campaign.keywords || '-'}</td>
                  <td className="py-3 px-4 text-right text-slate-300">₹{(campaign.totalSpend ?? campaign.spend ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-blue-400 font-medium">{campaign.totalClicks ?? campaign.clicks ?? 0}</td>
                  <td className="py-3 px-4 text-right text-green-400 font-medium">{campaign.totalLeads ?? campaign.leads ?? 0}</td>
                  <td className="py-3 px-4 text-right text-red-400 font-medium">
                    {(campaign.costPerLead ?? campaign.cpl ?? 0) > 0 ? `₹${campaign.costPerLead ?? campaign.cpl}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(campaign.status)}`}>
                      {campaign.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CampaignCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCampaigns}
        platform="GOOGLE"
      />
    </div>
  )
}
