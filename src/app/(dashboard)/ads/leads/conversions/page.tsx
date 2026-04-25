'use client'

import { useState, useEffect } from 'react'

interface ConversionData {
  id: string
  client: string | { name: string }
  campaign: string
  platform: string
  leads: number
  conversions: number
  conversionRate: number
  cpl: number
  cpc: number
  revenue: number
  roas: number
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

export default function ConversionTrackingPage() {
  const [data, setData] = useState<ConversionData[]>([])
  const [sortBy, setSortBy] = useState<string>('roas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 30)
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    }
  })

  useEffect(() => {
    async function fetchConversions() {
      try {
        setLoading(true)
        const res = await fetch(`/api/ads/conversions?from=${dateRange.from}&to=${dateRange.to}`)
        if (!res.ok) throw new Error('Failed to fetch conversions')
        const responseData = await res.json()
        setData(Array.isArray(responseData) ? responseData : responseData.conversions || [])
      } catch (err) {
        setError('Failed to load conversion data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchConversions()
  }, [dateRange])

  const getClientName = (client: string | { name: string } | undefined) => {
    if (!client) return 'Unknown'
    if (typeof client === 'string') return client
    return client.name
  }

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'roas': return (b.roas || 0) - (a.roas || 0)
      case 'conversionRate': return (b.conversionRate || 0) - (a.conversionRate || 0)
      case 'conversions': return (b.conversions || 0) - (a.conversions || 0)
      case 'cpl': return (a.cpl || 0) - (b.cpl || 0)
      default: return 0
    }
  })

  const totalLeads = data.reduce((sum, d) => sum + (d.leads || 0), 0)
  const totalConversions = data.reduce((sum, d) => sum + (d.conversions || 0), 0)
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const avgConversionRate = totalLeads > 0 ? Math.round(totalConversions / totalLeads * 100) : 0
  const avgRoas = data.length > 0 ? (data.reduce((sum, d) => sum + (d.roas || 0), 0) / data.length).toFixed(1) : '0'

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
            <h1 className="text-2xl font-bold">Conversion Tracking</h1>
            <p className="text-red-200">Monitor lead-to-conversion metrics and ROI</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              style={{ colorScheme: 'dark' }}
            />
            <span className="text-white/60">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              style={{ colorScheme: 'dark' }}
            />
            <button className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium hover:bg-red-500/10">
              Sync Conversions
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
          <p className="text-sm text-orange-400">Total Leads</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-orange-400">{totalLeads}</p>
          )}
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-green-400">Conversions</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-green-400">{totalConversions}</p>
          )}
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
          <p className="text-sm text-blue-400">Conversion Rate</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-blue-400">{avgConversionRate}%</p>
          )}
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
          <p className="text-sm text-purple-400">Total Revenue</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-purple-400">₹{(totalRevenue / 100000).toFixed(1)}L</p>
          )}
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <p className="text-sm text-emerald-400">Avg ROAS</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-emerald-400">{avgRoas}x</p>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">Sort by:</span>
        <div className="flex gap-2">
          {[
            { key: 'roas', label: 'ROAS' },
            { key: 'conversionRate', label: 'Conversion Rate' },
            { key: 'conversions', label: 'Conversions' },
            { key: 'cpl', label: 'CPL (Low to High)' },
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === option.key
                  ? 'bg-red-600 text-white'
                  : 'glass-card text-slate-300 border border-white/10 hover:border-red-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT / CAMPAIGN</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">PLATFORM</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">LEADS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CONVERSIONS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CONV RATE</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CPL</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CPC</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">REVENUE</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skeleton-row-${i}`} />)
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">No conversion data available</td>
              </tr>
            ) : (
              sortedData.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{getClientName(item.client)}</p>
                    <p className="text-sm text-slate-400">{item.campaign}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(item.platform)}`}>
                      {item.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{item.leads || 0}</td>
                  <td className="py-3 px-4 text-right text-green-400 font-semibold">{item.conversions || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${(item.conversionRate || 0) >= 40 ? 'text-green-400' : (item.conversionRate || 0) >= 25 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {item.conversionRate || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-red-400 font-medium">₹{item.cpl || 0}</td>
                  <td className="py-3 px-4 text-right text-slate-300">₹{item.cpc || 0}</td>
                  <td className="py-3 px-4 text-right text-purple-400 font-semibold">₹{((item.revenue || 0) / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold ${(item.roas || 0) >= 5 ? 'text-green-400' : (item.roas || 0) >= 3 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {item.roas || 0}x
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Conversion Funnel */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h3 className="font-semibold text-white mb-4">Overall Conversion Funnel</h3>
        {loading ? (
          <div className="flex items-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-funnel-${i}`} className="flex-1 animate-pulse bg-slate-700/50 rounded-lg h-20" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-blue-500/20 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{totalLeads}</p>
              <p className="text-sm text-blue-400">Leads Generated</p>
            </div>
            <div className="text-slate-400">→</div>
            <div className="flex-1 bg-amber-500/20 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{avgConversionRate}%</p>
              <p className="text-sm text-amber-400">Conversion Rate</p>
            </div>
            <div className="text-slate-400">→</div>
            <div className="flex-1 bg-purple-500/20 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{avgRoas}x</p>
              <p className="text-sm text-purple-400">Avg ROAS</p>
            </div>
            <div className="text-slate-400">→</div>
            <div className="flex-1 bg-green-500/20 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{totalConversions}</p>
              <p className="text-sm text-green-400">Conversions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
