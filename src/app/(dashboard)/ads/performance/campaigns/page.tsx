'use client'

import { useState, useEffect, useCallback } from 'react'

interface CampaignPerformance {
  id: string
  client: string | { name: string }
  campaign: string
  name?: string
  platform: string
  impressions: number
  reach: number
  clicks: number
  ctr: number
  leads: number
  conversions: number
  spend: number
  cpl: number
  roas: number
  trend: string
  totalLeads?: number
  totalClicks?: number
  totalSpend?: number
  costPerLead?: number
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 10 }).map((_, i) => (
        <td key={`skeleton-col-${i}`} className="py-3 px-4"><div className="animate-pulse bg-slate-700/50 rounded h-5 w-full" /></td>
      ))}
    </tr>
  )
}

export default function CampaignPerformancePage() {
  const [data, setData] = useState<CampaignPerformance[]>([])
  const [platformFilter, setPlatformFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('roas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ includeMetrics: 'true' })
      if (platformFilter !== 'ALL') params.set('platform', platformFilter === 'Meta' ? 'META' : 'GOOGLE')
      const res = await fetch(`/api/ads/campaigns?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch campaign performance')
      const responseData = await res.json()
      setData(Array.isArray(responseData) ? responseData : responseData.campaigns || [])
    } catch (err) {
      setError('Failed to load campaign performance data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [platformFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getClientName = (client: string | { name: string } | undefined) => {
    if (!client) return 'Unknown'
    if (typeof client === 'string') return client
    return client.name
  }

  const filteredData = platformFilter === 'ALL' ? data : data.filter(d => {
    const p = (d.platform || '').toUpperCase()
    return platformFilter === 'Meta' ? p === 'META' : p === 'GOOGLE'
  })

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'roas': return (b.roas || 0) - (a.roas || 0)
      case 'leads': return (b.totalLeads ?? b.leads ?? 0) - (a.totalLeads ?? a.leads ?? 0)
      case 'ctr': return (b.ctr || 0) - (a.ctr || 0)
      case 'cpl': return (a.costPerLead ?? a.cpl ?? 0) - (b.costPerLead ?? b.cpl ?? 0)
      default: return 0
    }
  })

  const totalImpressions = data.reduce((sum, d) => sum + (d.impressions || 0), 0)
  const totalClicks = data.reduce((sum, d) => sum + (d.totalClicks ?? d.clicks ?? 0), 0)
  const totalLeads = data.reduce((sum, d) => sum + (d.totalLeads ?? d.leads ?? 0), 0)
  const totalSpend = data.reduce((sum, d) => sum + (d.totalSpend ?? d.spend ?? 0), 0)
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00'

  const getPlatformColor = (platform: string) => {
    const p = (platform || '').toUpperCase()
    switch (p) {
      case 'META': return 'bg-blue-500/20 text-blue-400'
      case 'GOOGLE': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-300'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return '↑'
      case 'DOWN': return '↓'
      case 'STABLE': return '→'
      default: return '-'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP': return 'text-green-400'
      case 'DOWN': return 'text-red-400'
      case 'STABLE': return 'text-slate-400'
      default: return 'text-slate-400'
    }
  }

  // Find top performers from real data
  const bestRoas = sortedData.length > 0 ? [...data].sort((a, b) => (b.roas || 0) - (a.roas || 0))[0] : null
  const mostLeads = data.length > 0 ? [...data].sort((a, b) => (b.totalLeads ?? b.leads ?? 0) - (a.totalLeads ?? a.leads ?? 0))[0] : null
  const lowestCpl = data.length > 0 ? [...data].filter(d => (d.costPerLead ?? d.cpl ?? 0) > 0).sort((a, b) => (a.costPerLead ?? a.cpl ?? 0) - (b.costPerLead ?? b.cpl ?? 0))[0] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Campaign Performance</h1>
            <p className="text-red-200">Comprehensive campaign analytics and insights</p>
          </div>
          <button
            className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium hover:bg-red-500/10"
            onClick={() => {
              const headers = ['Campaign', 'Client', 'Platform', 'Impressions', 'Clicks', 'CTR (%)', 'Leads', 'Spend', 'CPL', 'ROAS', 'Trend']
              const rows = sortedData.map(c => [
                c.campaign || c.name || '',
                getClientName(c.client),
                c.platform,
                c.impressions || 0,
                c.totalClicks ?? c.clicks ?? 0,
                c.ctr || 0,
                c.totalLeads ?? c.leads ?? 0,
                c.totalSpend ?? c.spend ?? 0,
                c.costPerLead ?? c.cpl ?? 0,
                c.roas || 0,
                c.trend || ''
              ].map(v => `"${v}"`).join(','))
              const csvContent = 'data:text/csv;charset=utf-8,' +
                encodeURIComponent([headers.join(','), ...rows].join('\n'))
              const link = document.createElement('a')
              link.href = csvContent
              link.download = 'campaign-performance.csv'
              link.click()
            }}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Impressions</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-slate-200">{(totalImpressions / 1000).toFixed(0)}K</p>
          )}
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
          <p className="text-sm text-blue-400">Clicks</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-blue-400">{(totalClicks / 1000).toFixed(1)}K</p>
          )}
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
          <p className="text-sm text-purple-400">Avg CTR</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-purple-400">{avgCtr}%</p>
          )}
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-green-400">Total Leads</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-green-400">{totalLeads}</p>
          )}
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-red-400">Total Spend</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-red-400">₹{(totalSpend / 1000).toFixed(0)}K</p>
          )}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['ALL', 'Meta', 'Google'].map(platform => (
            <button
              key={platform}
              onClick={() => setPlatformFilter(platform)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                platformFilter === platform
                  ? 'bg-red-600 text-white'
                  : 'glass-card text-slate-300 border border-white/10 hover:border-red-300'
              }`}
            >
              {platform === 'ALL' ? 'All Platforms' : platform}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-300"
            style={{ colorScheme: 'dark' }}
          >
            <option value="roas">ROAS (High to Low)</option>
            <option value="leads">Leads (High to Low)</option>
            <option value="ctr">CTR (High to Low)</option>
            <option value="cpl">CPL (Low to High)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Performance Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CAMPAIGN</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">PLATFORM</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">IMPRESSIONS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CLICKS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CTR</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">LEADS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">SPEND</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CPL</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">ROAS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TREND</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skeleton-row-${i}`} />)
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">No campaign performance data available</td>
              </tr>
            ) : (
              sortedData.map(campaign => (
                <tr key={campaign.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{campaign.campaign || campaign.name}</p>
                    <p className="text-sm text-slate-400">{getClientName(campaign.client)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(campaign.platform)}`}>
                      {campaign.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{((campaign.impressions || 0) / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-right text-blue-400">{(campaign.totalClicks ?? campaign.clicks ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{campaign.ctr || 0}%</td>
                  <td className="py-3 px-4 text-right text-green-400 font-semibold">{campaign.totalLeads ?? campaign.leads ?? 0}</td>
                  <td className="py-3 px-4 text-right text-slate-300">₹{((campaign.totalSpend ?? campaign.spend ?? 0) / 1000).toFixed(1)}K</td>
                  <td className="py-3 px-4 text-right text-red-400 font-medium">₹{campaign.costPerLead ?? campaign.cpl ?? 0}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold ${(campaign.roas || 0) >= 5 ? 'text-green-400' : (campaign.roas || 0) >= 3 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {campaign.roas || 0}x
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-lg font-bold ${getTrendColor(campaign.trend)}`}>
                      {getTrendIcon(campaign.trend)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Performance Insights - dynamic from real data */}
      {!loading && data.length > 0 && (
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <h3 className="font-semibold text-green-400 mb-3">Top Performers</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-green-400">
            <div>
              <p className="font-medium mb-1">Best ROAS</p>
              <p>{bestRoas ? `${getClientName(bestRoas.client)} - ${bestRoas.campaign || bestRoas.name} (${bestRoas.roas}x)` : 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Most Leads</p>
              <p>{mostLeads ? `${getClientName(mostLeads.client)} - ${mostLeads.campaign || mostLeads.name} (${mostLeads.totalLeads ?? mostLeads.leads} leads)` : 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Lowest CPL</p>
              <p>{lowestCpl ? `${getClientName(lowestCpl.client)} - ${lowestCpl.campaign || lowestCpl.name} (₹${lowestCpl.costPerLead ?? lowestCpl.cpl})` : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
