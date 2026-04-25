'use client'

import { useState, useEffect } from 'react'

interface ClientROI {
  id: string
  client: string | { name: string }
  adSpend: number
  revenue: number
  profit: number
  roi: number
  roas: number
  leadToConversion: number
  avgDealValue: number
  ltv: number
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

export default function ROIAnalysisPage() {
  const [data, setData] = useState<ClientROI[]>([])
  const [sortBy, setSortBy] = useState<string>('roi')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchROIData() {
      try {
        setLoading(true)
        const res = await fetch('/api/ads/analytics?type=roi')
        if (!res.ok) throw new Error('Failed to fetch ROI data')
        const responseData = await res.json()
        setData(Array.isArray(responseData) ? responseData : responseData.clients || responseData.roi || [])
      } catch (err) {
        setError('Failed to load ROI data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchROIData()
  }, [])

  const getClientName = (client: string | { name: string } | undefined) => {
    if (!client) return 'Unknown'
    if (typeof client === 'string') return client
    return client.name
  }

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'roi': return (b.roi || 0) - (a.roi || 0)
      case 'roas': return (b.roas || 0) - (a.roas || 0)
      case 'revenue': return (b.revenue || 0) - (a.revenue || 0)
      case 'profit': return (b.profit || 0) - (a.profit || 0)
      default: return 0
    }
  })

  const totalAdSpend = data.reduce((sum, d) => sum + (d.adSpend || 0), 0)
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const totalProfit = data.reduce((sum, d) => sum + (d.profit || 0), 0)
  const avgRoi = totalAdSpend > 0 ? Math.round((totalProfit / totalAdSpend) * 100) : 0
  const avgRoas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(1) : '0'

  const getRoiColor = (roi: number) => {
    if (roi >= 400) return 'text-green-400'
    if (roi >= 250) return 'text-blue-400'
    if (roi >= 150) return 'text-amber-400'
    return 'text-red-400'
  }

  const getRoasColor = (roas: number) => {
    if (roas >= 5) return 'text-green-400'
    if (roas >= 3.5) return 'text-blue-400'
    if (roas >= 2.5) return 'text-amber-400'
    return 'text-red-400'
  }

  // Dynamic insights from real data
  const highestRoi = sortedData.length > 0 ? [...data].sort((a, b) => (b.roi || 0) - (a.roi || 0))[0] : null
  const bestRoas = data.length > 0 ? [...data].sort((a, b) => (b.roas || 0) - (a.roas || 0))[0] : null
  const highestLtv = data.length > 0 ? [...data].sort((a, b) => (b.ltv || 0) - (a.ltv || 0))[0] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ROI Analysis</h1>
            <p className="text-red-200">Return on investment across all clients</p>
          </div>
          <button
            className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium hover:bg-red-500/10"
            onClick={() => {
              const headers = ['Client', 'Ad Spend', 'Revenue', 'Profit', 'ROI (%)', 'ROAS', 'Lead to Conversion (%)', 'Avg Deal Value', 'LTV']
              const rows = sortedData.map(d => [
                getClientName(d.client),
                d.adSpend || 0,
                d.revenue || 0,
                d.profit || 0,
                d.roi || 0,
                d.roas || 0,
                d.leadToConversion || 0,
                d.avgDealValue || 0,
                d.ltv || 0
              ].map(v => `"${v}"`).join(','))
              const csvContent = 'data:text/csv;charset=utf-8,' +
                encodeURIComponent([headers.join(','), ...rows].join('\n'))
              const link = document.createElement('a')
              link.href = csvContent
              link.download = 'roi-analysis.csv'
              link.click()
            }}
          >
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-red-400">Total Ad Spend</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-red-400">₹{(totalAdSpend / 100000).toFixed(1)}L</p>
          )}
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
          <p className="text-sm text-purple-400">Total Revenue</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-purple-400">₹{(totalRevenue / 100000).toFixed(1)}L</p>
          )}
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-green-400">Total Profit</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-16" /> : (
            <p className="text-3xl font-bold text-green-400">₹{(totalProfit / 100000).toFixed(1)}L</p>
          )}
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
          <p className="text-sm text-blue-400">Avg ROI</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-blue-400">{avgRoi}%</p>
          )}
        </div>
        <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
          <p className="text-sm text-orange-400">Avg ROAS</p>
          {loading ? <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" /> : (
            <p className="text-3xl font-bold text-orange-400">{avgRoas}x</p>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">Sort by:</span>
        <div className="flex gap-2">
          {[
            { key: 'roi', label: 'ROI %' },
            { key: 'roas', label: 'ROAS' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'profit', label: 'Profit' },
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

      {/* ROI Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">AD SPEND</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">REVENUE</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">PROFIT</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">ROI</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">ROAS</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">CONV %</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">AVG DEAL</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">LTV</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skeleton-row-${i}`} />)
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">No ROI data available</td>
              </tr>
            ) : (
              sortedData.map(client => (
                <tr key={client.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-medium text-white">{getClientName(client.client)}</td>
                  <td className="py-3 px-4 text-right text-red-400">₹{((client.adSpend || 0) / 100000).toFixed(1)}L</td>
                  <td className="py-3 px-4 text-right text-purple-400 font-semibold">₹{((client.revenue || 0) / 100000).toFixed(1)}L</td>
                  <td className="py-3 px-4 text-right text-green-400 font-semibold">₹{((client.profit || 0) / 100000).toFixed(1)}L</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold ${getRoiColor(client.roi || 0)}`}>{client.roi || 0}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold ${getRoasColor(client.roas || 0)}`}>{client.roas || 0}x</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{client.leadToConversion || 0}%</td>
                  <td className="py-3 px-4 text-right text-slate-300">₹{((client.avgDealValue || 0) / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-right text-blue-400 font-medium">₹{((client.ltv || 0) / 1000).toFixed(0)}K</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ROI Breakdown */}
      {!loading && data.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4">ROI by Client</h3>
            <div className="space-y-3">
              {sortedData.slice(0, 5).map(client => (
                <div key={client.id} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-300 truncate">{getClientName(client.client)}</div>
                  <div className="flex-1 h-4 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${(client.roi || 0) >= 400 ? 'bg-green-500' : (client.roi || 0) >= 250 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (client.roi || 0) / 5)}%` }}
                    />
                  </div>
                  <div className={`w-16 text-right font-bold ${getRoiColor(client.roi || 0)}`}>{client.roi || 0}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4">Revenue vs Ad Spend</h3>
            <div className="space-y-3">
              {sortedData.slice(0, 5).map(client => (
                <div key={client.id} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-300 truncate">{getClientName(client.client)}</div>
                  <div className="flex-1 h-4 bg-red-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, ((client.revenue || 0) / Math.max(client.adSpend || 1, 1)) * 15)}%` }}
                    />
                  </div>
                  <div className={`w-16 text-right font-bold ${getRoasColor(client.roas || 0)}`}>{client.roas || 0}x</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights - dynamic */}
      {!loading && data.length > 0 && (
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <h3 className="font-semibold text-green-400 mb-3">ROI Insights</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-green-400">
            <div>
              <p className="font-medium mb-1">Highest ROI</p>
              <p>{highestRoi ? `${getClientName(highestRoi.client)} at ${highestRoi.roi}%` : 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Best ROAS</p>
              <p>{bestRoas ? `${getClientName(bestRoas.client)} at ${bestRoas.roas}x` : 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Highest LTV</p>
              <p>{highestLtv ? `${getClientName(highestLtv.client)} at ₹${((highestLtv.ltv || 0) / 1000).toFixed(0)}K` : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
