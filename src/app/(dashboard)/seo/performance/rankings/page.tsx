'use client'

import { useState, useEffect } from 'react'

interface Keyword {
  id: string
  keyword: string
  clientName: string
  currentRank: number | null
  previousRank: number | null
  searchVolume: number | null
  difficulty: number | null
}

export default function SeoKeywordRankingsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seo/keywords')
      .then(res => res.json())
      .then(data => {
        const kws: Keyword[] = data.keywords || data || []
        setKeywords(kws)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const rankedKeywords = keywords.filter(k => k.currentRank !== null && k.currentRank !== undefined)
  const top3 = rankedKeywords.filter(k => k.currentRank! <= 3).length
  const top10 = rankedKeywords.filter(k => k.currentRank! <= 10).length
  const top50 = rankedKeywords.filter(k => k.currentRank! <= 50).length
  const total = keywords.length

  // Group by client
  const clientMap: Record<string, { client: string; top3: number; top10: number; top50: number; improved: number }> = {}
  rankedKeywords.forEach(k => {
    const name = k.clientName || 'Unknown'
    if (!clientMap[name]) clientMap[name] = { client: name, top3: 0, top10: 0, top50: 0, improved: 0 }
    if (k.currentRank! <= 3) clientMap[name].top3++
    if (k.currentRank! <= 10) clientMap[name].top10++
    if (k.currentRank! <= 50) clientMap[name].top50++
    if (k.previousRank !== null && k.previousRank !== undefined && k.currentRank! < k.previousRank) clientMap[name].improved++
  })
  const byClient = Object.values(clientMap)

  // Top movers (improved)
  const movers = rankedKeywords
    .filter(k => k.previousRank !== null && k.previousRank !== undefined && k.currentRank! < k.previousRank!)
    .map(k => ({
      keyword: k.keyword,
      client: k.clientName,
      from: k.previousRank!,
      to: k.currentRank!,
      change: k.previousRank! - k.currentRank!,
    }))
    .sort((a, b) => b.change - a.change)
    .slice(0, 5)

  // Decliners
  const decliners = rankedKeywords
    .filter(k => k.previousRank !== null && k.previousRank !== undefined && k.currentRank! > k.previousRank!)
    .map(k => ({
      keyword: k.keyword,
      client: k.clientName,
      from: k.previousRank!,
      to: k.currentRank!,
      change: k.previousRank! - k.currentRank!,
    }))
    .sort((a, b) => a.change - b.change)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Keyword Rankings</h1>
            <p className="text-teal-200">Overall ranking performance across all clients</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-teal-200 text-sm">Top 3</p>
              <p className="text-3xl font-bold">{top3}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">Top 10</p>
              <p className="text-3xl font-bold">{top10}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">Top 50</p>
              <p className="text-3xl font-bold">{top50}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Top 3 Rankings</p>
          <p className="text-3xl font-bold text-green-400">{top3}</p>
          <p className="text-xs text-green-400 mt-1">Premium positions</p>
        </div>
        <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
          <p className="text-sm text-teal-600">Top 10 Rankings</p>
          <p className="text-3xl font-bold text-teal-700">{top10}</p>
          <p className="text-xs text-teal-600 mt-1">First page</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Top 50 Rankings</p>
          <p className="text-3xl font-bold text-blue-400">{top50}</p>
          <p className="text-xs text-blue-400 mt-1">Top 5 pages</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Total Keywords</p>
          <p className="text-3xl font-bold text-purple-400">{total}</p>
          <p className="text-xs text-purple-400 mt-1">Being tracked</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Client */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Rankings by Client</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">TOP 3</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">TOP 10</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">TOP 50</th>
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">IMPROVED</th>
              </tr>
            </thead>
            <tbody>
              {byClient.map((client) => (
                <tr key={client.client} className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">{client.client}</td>
                  <td className="py-3 px-4 text-center font-bold text-green-400">{client.top3}</td>
                  <td className="py-3 px-4 text-center font-semibold text-teal-600">{client.top10}</td>
                  <td className="py-3 px-4 text-center text-slate-300">{client.top50}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-400 font-medium">{client.improved}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Movers */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-green-500/10">
              <h2 className="font-semibold text-green-800">Top Movers (Improved)</h2>
            </div>
            <div className="divide-y divide-white/10">
              {movers.length === 0 && (
                <div className="p-4 text-sm text-slate-400">No improved keywords yet</div>
              )}
              {movers.map((mover) => (
                <div key={mover.keyword} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{mover.keyword}</p>
                    <p className="text-sm text-slate-400">{mover.client}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">#{mover.from}</span>
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-bold text-green-400">#{mover.to}</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                      +{mover.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decliners */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-red-500/10">
              <h2 className="font-semibold text-red-800">Needs Attention (Declined)</h2>
            </div>
            <div className="divide-y divide-white/10">
              {decliners.length === 0 && (
                <div className="p-4 text-sm text-slate-400">No declined keywords</div>
              )}
              {decliners.map((item) => (
                <div key={item.keyword} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{item.keyword}</p>
                    <p className="text-sm text-slate-400">{item.client}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">#{item.from}</span>
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-bold text-red-400">#{item.to}</span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
