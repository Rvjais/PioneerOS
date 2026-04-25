'use client'

import { useState, useEffect } from 'react'

interface DailySpend {
  date: string
  metaSpend: number
  googleSpend: number
  totalSpend: number
  leads: number
  cpl: number
}

interface ClientSpend {
  id: string
  client: string | { name: string }
  todaySpend: number
  weekSpend: number
  monthSpend: number
  dailyTarget: number
  spendStatus: string
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
}

export default function SpendTrackingPage() {
  const [dailyData, setDailyData] = useState<DailySpend[]>([])
  const [clientData, setClientData] = useState<ClientSpend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 7)
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    }
  })

  useEffect(() => {
    async function fetchSpendData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/ads/spend?from=${dateRange.from}&to=${dateRange.to}`)
        if (!res.ok) throw new Error('Failed to fetch spend data')
        const data = await res.json()
        setDailyData(data.dailySpend || data.daily || [])
        setClientData(data.clientSpend || data.clients || [])
      } catch (err) {
        setError('Failed to load spend data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSpendData()
  }, [dateRange])

  const todaySpend = dailyData.length > 0 ? dailyData[0] : { totalSpend: 0, metaSpend: 0, googleSpend: 0, leads: 0, cpl: 0 }
  const weeklySpend = dailyData.reduce((sum, d) => sum + (d.totalSpend || 0), 0)
  const weeklyLeads = dailyData.reduce((sum, d) => sum + (d.leads || 0), 0)

  const getSpendStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-500/20 text-green-400'
      case 'UNDERSPEND': return 'bg-amber-500/20 text-amber-400'
      case 'OVERSPEND': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getClientName = (client: string | { name: string } | undefined) => {
    if (!client) return 'Unknown'
    if (typeof client === 'string') return client
    return client.name
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Spend Tracking</h1>
            <p className="text-red-200">Monitor daily ad spend across platforms</p>
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
            <button
              className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium hover:bg-red-500/10"
              onClick={() => {
                const dailyHeaders = ['Date', 'Meta Spend', 'Google Spend', 'Total Spend', 'Leads', 'CPL']
                const dailyRows = dailyData.map(d => [
                  d.date,
                  d.metaSpend || 0,
                  d.googleSpend || 0,
                  d.totalSpend || 0,
                  d.leads || 0,
                  d.cpl || 0
                ].map(v => `"${v}"`).join(','))
                const clientHeaders = ['Client', 'Today Spend', 'Week Spend', 'Month Spend', 'Daily Target', 'Status']
                const clientRows = clientData.map(c => [
                  getClientName(c.client),
                  c.todaySpend || 0,
                  c.weekSpend || 0,
                  c.monthSpend || 0,
                  c.dailyTarget || 0,
                  c.spendStatus || ''
                ].map(v => `"${v}"`).join(','))
                const csvContent = 'data:text/csv;charset=utf-8,' +
                  encodeURIComponent(
                    ['Daily Spend', dailyHeaders.join(','), ...dailyRows, '', 'Client Spend', clientHeaders.join(','), ...clientRows].join('\n')
                  )
                const link = document.createElement('a')
                link.href = csvContent
                link.download = 'spend-tracking.csv'
                link.click()
              }}
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-red-400">Today&apos;s Spend</p>
          {loading ? <SkeletonBlock className="h-9 w-16" /> : (
            <p className="text-3xl font-bold text-red-400">₹{((todaySpend.totalSpend || 0) / 1000).toFixed(1)}K</p>
          )}
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
          <p className="text-sm text-blue-400">Meta Spend</p>
          {loading ? <SkeletonBlock className="h-9 w-16" /> : (
            <p className="text-3xl font-bold text-blue-400">₹{((todaySpend.metaSpend || 0) / 1000).toFixed(1)}K</p>
          )}
        </div>
        <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
          <p className="text-sm text-orange-400">Google Spend</p>
          {loading ? <SkeletonBlock className="h-9 w-16" /> : (
            <p className="text-3xl font-bold text-orange-400">₹{((todaySpend.googleSpend || 0) / 1000).toFixed(1)}K</p>
          )}
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-green-400">Today&apos;s Leads</p>
          {loading ? <SkeletonBlock className="h-9 w-12" /> : (
            <p className="text-3xl font-bold text-green-400">{todaySpend.leads || 0}</p>
          )}
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-4">
          <p className="text-sm text-purple-400">Today&apos;s CPL</p>
          {loading ? <SkeletonBlock className="h-9 w-16" /> : (
            <p className="text-3xl font-bold text-purple-400">₹{todaySpend.cpl || 0}</p>
          )}
        </div>
      </div>

      {/* Weekly Spend Chart */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Spend Over Period</h2>
          {!loading && dailyData.length > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-white">₹{(weeklySpend / 1000).toFixed(0)}K</p>
              <p className="text-sm text-slate-400">
                {weeklyLeads} leads {weeklyLeads > 0 ? `• ₹${Math.round(weeklySpend / weeklyLeads)} CPL` : ''}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-end gap-2 h-48">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`skeleton-bar-${i}`} className="flex-1 flex flex-col items-center">
                <div className="animate-pulse bg-slate-700/50 rounded w-full h-24" />
                <SkeletonBlock className="h-3 w-10 mt-2" />
              </div>
            ))}
          </div>
        ) : dailyData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400">No spend data for this period</div>
        ) : (
          <>
            {/* Simple Bar Chart */}
            <div className="flex items-end gap-2 h-48">
              {dailyData.slice().reverse().map((day, index) => {
                const maxSpend = Math.max(...dailyData.map(d => Math.max(d.metaSpend || 0, d.googleSpend || 0)), 1)
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="bg-blue-500 rounded-t w-full"
                        style={{ height: `${((day.metaSpend || 0) / maxSpend) * 100}px` }}
                        title={`Meta: ₹${(day.metaSpend || 0).toLocaleString()}`}
                      />
                      <div
                        className="bg-red-500 rounded-b w-full"
                        style={{ height: `${((day.googleSpend || 0) / maxSpend) * 100}px` }}
                        title={`Google: ₹${(day.googleSpend || 0).toLocaleString()}`}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-sm text-slate-300">Meta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-sm text-slate-300">Google</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Client-wise Spend */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Client-wise Spend Status</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">TODAY</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">THIS WEEK</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">THIS MONTH</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">DAILY TARGET</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skeleton-row-${i}`}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="py-3 px-4"><SkeletonBlock className="h-5 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : clientData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No client spend data available</td>
              </tr>
            ) : (
              clientData.map(client => (
                <tr key={client.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-medium text-white">{getClientName(client.client)}</td>
                  <td className="py-3 px-4 text-right text-slate-300">₹{((client.todaySpend || 0) / 1000).toFixed(1)}K</td>
                  <td className="py-3 px-4 text-right text-slate-300">₹{((client.weekSpend || 0) / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-right text-white font-semibold">₹{((client.monthSpend || 0) / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-right text-slate-400">₹{((client.dailyTarget || 0) / 1000).toFixed(1)}K</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getSpendStatusColor(client.spendStatus)}`}>
                      {(client.spendStatus || 'UNKNOWN').replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
