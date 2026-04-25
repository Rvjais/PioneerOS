'use client'

import { useState, useEffect, useCallback } from 'react'

interface LeadMetric {
  id: string
  client: string | { name: string }
  campaign: string
  platform: string
  leadSource: string
  totalLeads: number
  qualifiedLeads: number
  qualificationRate: number
  avgResponseTime: string
  status: string
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={`skeleton-col-${i}`} className="py-3 px-4"><div className="animate-pulse bg-slate-700/50 rounded h-5 w-full" /></td>
      ))}
    </tr>
  )
}

export default function LeadPerformancePage() {
  const [metrics, setMetrics] = useState<LeadMetric[]>([])
  const [platformFilter, setPlatformFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeadData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ eventName: 'FORM_SUBMIT,PHONE_CALL' })
      if (platformFilter !== 'ALL') params.set('platform', platformFilter === 'Meta' ? 'META' : 'GOOGLE')
      const res = await fetch(`/api/ads/conversions?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch lead data')
      const data = await res.json()
      setMetrics(Array.isArray(data) ? data : data.leads || data.conversions || [])
    } catch (err) {
      setError('Failed to load lead performance data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [platformFilter])

  useEffect(() => {
    fetchLeadData()
  }, [fetchLeadData])

  const getClientName = (client: string | { name: string } | undefined) => {
    if (!client) return 'Unknown'
    if (typeof client === 'string') return client
    return client.name
  }

  const filteredMetrics = platformFilter === 'ALL' ? metrics : metrics.filter(m => {
    const p = (m.platform || '').toUpperCase()
    return platformFilter === 'Meta' ? p === 'META' : p === 'GOOGLE'
  })

  const totalLeads = metrics.reduce((sum, m) => sum + (m.totalLeads || 0), 0)
  const totalQualified = metrics.reduce((sum, m) => sum + (m.qualifiedLeads || 0), 0)
  const avgQualificationRate = totalLeads > 0 ? Math.round(totalQualified / totalLeads * 100) : 0
  const excellentCount = metrics.filter(m => m.status === 'EXCELLENT').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'bg-green-500/20 text-green-400'
      case 'GOOD': return 'bg-blue-500/20 text-blue-400'
      case 'NEEDS_ATTENTION': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    const p = (platform || '').toUpperCase()
    switch (p) {
      case 'META': return 'bg-blue-500/20 text-blue-400'
      case 'GOOGLE': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lead Performance</h1>
            <p className="text-red-200">Track lead quality and response metrics</p>
          </div>
          <button
            className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium hover:bg-red-500/10"
            onClick={() => {
              const headers = ['Client', 'Campaign', 'Platform', 'Lead Source', 'Total Leads', 'Qualified Leads', 'Qualification Rate (%)', 'Avg Response Time', 'Status']
              const rows = filteredMetrics.map(m => [
                getClientName(m.client),
                m.campaign,
                m.platform,
                m.leadSource || '',
                m.totalLeads || 0,
                m.qualifiedLeads || 0,
                m.qualificationRate || 0,
                m.avgResponseTime || '',
                m.status || ''
              ].map(v => `"${v}"`).join(','))
              const csvContent = 'data:text/csv;charset=utf-8,' +
                encodeURIComponent([headers.join(','), ...rows].join('\n'))
              const link = document.createElement('a')
              link.href = csvContent
              link.download = 'lead-performance.csv'
              link.click()
            }}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
          <p className="text-sm text-orange-400">Total Leads (7 Days)</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-orange-400">{totalLeads}</p>
          )}
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-green-400">Qualified Leads</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-green-400">{totalQualified}</p>
          )}
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
          <p className="text-sm text-blue-400">Qualification Rate</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-blue-400">{avgQualificationRate}%</p>
          )}
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <p className="text-sm text-emerald-400">Excellent Performers</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-emerald-400">{excellentCount}</p>
          )}
        </div>
      </div>

      {/* Platform Filter */}
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Lead Performance Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT / CAMPAIGN</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">PLATFORM</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">LEAD SOURCE</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">TOTAL LEADS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">QUALIFIED</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">QUAL RATE</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">AVG RESPONSE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skeleton-row-${i}`} />)
            ) : filteredMetrics.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">No lead performance data available</td>
              </tr>
            ) : (
              filteredMetrics.map(metric => (
                <tr key={metric.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{getClientName(metric.client)}</p>
                    <p className="text-sm text-slate-400">{metric.campaign}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(metric.platform)}`}>
                      {metric.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{metric.leadSource || '-'}</td>
                  <td className="py-3 px-4 text-right text-white font-semibold">{metric.totalLeads || 0}</td>
                  <td className="py-3 px-4 text-right text-green-400 font-semibold">{metric.qualifiedLeads || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${(metric.qualificationRate || 0) >= 60 ? 'text-green-400' : (metric.qualificationRate || 0) >= 45 ? 'text-blue-400' : 'text-red-400'}`}>
                      {metric.qualificationRate || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{metric.avgResponseTime || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(metric.status)}`}>
                      {(metric.status || 'UNKNOWN').replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quality Tips */}
      <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
        <h3 className="font-semibold text-red-400 mb-3">Lead Quality Improvement Tips</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Form Optimization</p>
            <ul className="space-y-1">
              <li>• Add qualifying questions</li>
              <li>• Use lead form extensions</li>
              <li>• Test form length</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Audience Targeting</p>
            <ul className="space-y-1">
              <li>• Exclude converted leads</li>
              <li>• Use lookalike audiences</li>
              <li>• Narrow demographics</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Response Time</p>
            <ul className="space-y-1">
              <li>• Respond within 5 mins</li>
              <li>• Set up auto-responses</li>
              <li>• Use WhatsApp for speed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
