'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface Keyword {
  id: string
  keyword: string
  client: { id: string; name: string }
  location: string
  searchVolume: number
  currentRank: number | null
  previousRank: number | null
  targetPage: string | null
  updatedAt: string
}

export default function SeoKeywordTrackerPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rank' | 'volume' | 'change'>('rank')
  const [showAddForm, setShowAddForm] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [addForm, setAddForm] = useState({ clientId: '', keyword: '', location: 'India', searchVolume: 0, currentRank: 0, targetPage: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchKeywords()
    fetch('/api/clients?status=ACTIVE&limit=100').then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {})
  }, [])

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/seo/keywords')
      if (res.ok) {
        const data = await res.json()
        setKeywords(data.keywords || [])
      }
    } catch (error) {
      console.error('Failed to fetch keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm, currentRank: addForm.currentRank ?? null }),
      })
      if (res.ok) {
        setShowAddForm(false)
        setAddForm({ clientId: '', keyword: '', location: 'India', searchVolume: 0, currentRank: 0, targetPage: '' })
        fetchKeywords()
      }
    } catch (err) { console.error('Failed to add keyword:', err) }
    setSaving(false)
  }

  const filteredKeywords = filter === 'all' ? keywords : keywords.filter(k => k.client.name === filter)

  const sortedKeywords = [...filteredKeywords].sort((a, b) => {
    if (sortBy === 'rank') return (a.currentRank || 999) - (b.currentRank || 999)
    if (sortBy === 'volume') return b.searchVolume - a.searchVolume
    if (sortBy === 'change') return ((b.previousRank || 0) - (b.currentRank || 0)) - ((a.previousRank || 0) - (a.currentRank || 0))
    return 0
  })

  const ranked = keywords.filter(k => k.currentRank && k.currentRank > 0)
  const top3Count = ranked.filter(k => k.currentRank! <= 3).length
  const top10Count = ranked.filter(k => k.currentRank! <= 10).length
  const top50Count = ranked.filter(k => k.currentRank! <= 50).length

  const clientNames = [...new Set(keywords.map(k => k.client.name))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Keyword Tracker</h1>
            <p className="text-teal-200">Monitor keyword rankings across all clients</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all">
            + Add Keyword
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-sm text-green-400">Top 3 Rankings</p>
          <p className="text-3xl font-bold text-green-300">{top3Count}</p>
        </div>
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
          <p className="text-sm text-teal-400">Top 10 Rankings</p>
          <p className="text-3xl font-bold text-teal-300">{top10Count}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-blue-400">Top 50 Rankings</p>
          <p className="text-3xl font-bold text-blue-300">{top50Count}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-sm text-purple-400">Total Keywords</p>
          <p className="text-3xl font-bold text-purple-300">{keywords.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Clients</option>
          {clientNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'rank' | 'volume' | 'change')}
          className="px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-teal-500"
        >
          <option value="rank">Sort by Rank</option>
          <option value="volume">Sort by Volume</option>
          <option value="change">Sort by Change</option>
        </select>
      </div>

      {/* Keywords Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {sortedKeywords.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No Keywords Tracked Yet</h3>
            <p className="text-slate-400 mb-4">Start tracking keywords for your clients to monitor their SEO performance.</p>
            <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
              Add First Keyword
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-slate-400">Keyword</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-400">Client</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-400">Location</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-400">Volume</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-400">Rank</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-400">Change</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-400">Target Page</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-400">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedKeywords.map(kw => {
                const change = (kw.previousRank || 0) - (kw.currentRank || 0)
                return (
                  <tr key={kw.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{kw.keyword}</td>
                    <td className="px-4 py-3 text-slate-300">{kw.client.name}</td>
                    <td className="px-4 py-3 text-slate-400">{kw.location}</td>
                    <td className="px-4 py-3 text-slate-300">{kw.searchVolume.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {kw.currentRank ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          kw.currentRank <= 3 ? 'bg-green-500/20 text-green-300' :
                          kw.currentRank <= 10 ? 'bg-teal-500/20 text-teal-300' :
                          kw.currentRank <= 50 ? 'bg-blue-500/20 text-blue-300' :
                          'bg-slate-900/20 text-slate-300'
                        }`}>
                          #{kw.currentRank}
                        </span>
                      ) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {kw.previousRank ? (
                        <span className={`flex items-center gap-1 text-sm ${
                          change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {change > 0 ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : change < 0 ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : null}
                          {Math.abs(change)}
                        </span>
                      ) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{kw.targetPage || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {formatDateDDMMYYYY(kw.updatedAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Keyword Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Keyword</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddKeyword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client *</label>
                <select
                  value={addForm.clientId}
                  onChange={e => setAddForm({ ...addForm, clientId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Select client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Keyword *</label>
                <input type="text" value={addForm.keyword} onChange={e => setAddForm({ ...addForm, keyword: e.target.value })} required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="e.g., best dentist in delhi" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                  <input type="text" value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Search Volume</label>
                  <input type="number" value={addForm.searchVolume} onChange={e => setAddForm({ ...addForm, searchVolume: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Current Rank</label>
                  <input type="number" value={addForm.currentRank} onChange={e => setAddForm({ ...addForm, currentRank: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="0 = not ranked" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Page</label>
                  <input type="text" value={addForm.targetPage} onChange={e => setAddForm({ ...addForm, targetPage: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="/services" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2.5 bg-white/5 text-white rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Keyword'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
