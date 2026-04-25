'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface BacklinkDeliverable {
  id: string
  clientId: string
  client: { id: string; name: string }
  targetUrl: string
  anchorText: string
  backlinkSource: string
  domainAuthority: number
  status: 'SUBMITTED' | 'LIVE' | 'REJECTED'
  liveUrl?: string
  submittedDate: string
  createdBy: { id: string; firstName: string; lastName: string } | null
  createdAt: string
  updatedAt: string
}

export default function SeoBacklinkDeliverablesPage() {
  const [backlinks, setBacklinks] = useState<BacklinkDeliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState({
    clientId: '',
    targetUrl: '',
    anchorText: '',
    backlinkSource: '',
    domainAuthority: 0,
    liveUrl: '',
  })

  useEffect(() => {
    fetchBacklinks()
    fetch('/api/clients?status=ACTIVE&limit=100')
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
      .catch(() => {})
  }, [])

  const fetchBacklinks = async () => {
    try {
      setError(null)
      const res = await fetch('/api/seo/backlinks')
      if (!res.ok) throw new Error('Failed to fetch backlinks')
      const data = await res.json()
      setBacklinks(data.backlinks || [])
    } catch (err) {
      console.error('Failed to fetch backlinks:', err)
      setError('Failed to load backlink deliverables. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBacklink = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/seo/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: addForm.clientId,
          targetUrl: addForm.targetUrl,
          anchorText: addForm.anchorText,
          backlinkSource: addForm.backlinkSource,
          domainAuthority: addForm.domainAuthority || 0,
          liveUrl: addForm.liveUrl || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create backlink')
      toast.success('Backlink deliverable added successfully')
      setShowAddForm(false)
      setAddForm({ clientId: '', targetUrl: '', anchorText: '', backlinkSource: '', domainAuthority: 0, liveUrl: '' })
      fetchBacklinks()
    } catch {
      toast.error('Failed to add backlink deliverable')
    }
    setSaving(false)
  }

  const handleStatusUpdate = async (item: BacklinkDeliverable, newStatus: 'LIVE' | 'REJECTED') => {
    setUpdatingId(item.id)
    try {
      const res = await fetch('/api/seo/backlinks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      toast.success(`Status updated to ${newStatus}`)
      fetchBacklinks()
    } catch {
      toast.error('Failed to update status')
    }
    setUpdatingId(null)
  }

  const filteredBacklinks = filter === 'all' ? backlinks : backlinks.filter(b => b.status === filter)

  const submittedCount = backlinks.filter(b => b.status === 'SUBMITTED').length
  const liveCount = backlinks.filter(b => b.status === 'LIVE').length
  const rejectedCount = backlinks.filter(b => b.status === 'REJECTED').length
  const avgDA = liveCount > 0
    ? Math.round(backlinks.filter(b => b.status === 'LIVE').reduce((acc, b) => acc + b.domainAuthority, 0) / liveCount)
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-amber-500/20 text-amber-400'
      case 'LIVE': return 'bg-green-500/20 text-green-400'
      case 'REJECTED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getDAColor = (da: number) => {
    if (da >= 50) return 'text-green-400'
    if (da >= 40) return 'text-teal-600'
    if (da >= 30) return 'text-amber-400'
    return 'text-slate-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <svg className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-slate-400">{error}</p>
        <button onClick={() => { setLoading(true); fetchBacklinks() }} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Backlink Deliverables</h1>
            <p className="text-teal-200">Track backlinks created for clients</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all">
            + Add Backlink
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'all' ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 glass-card hover:border-teal-300'
          }`}
        >
          <p className="text-sm text-slate-400">Total</p>
          <p className="text-3xl font-bold text-teal-600">{backlinks.length}</p>
        </button>
        <button
          onClick={() => setFilter('SUBMITTED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'SUBMITTED' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">Submitted</p>
          <p className="text-3xl font-bold text-amber-400">{submittedCount}</p>
        </button>
        <button
          onClick={() => setFilter('LIVE')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'LIVE' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Live</p>
          <p className="text-3xl font-bold text-green-400">{liveCount}</p>
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'REJECTED' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <p className="text-sm text-slate-400">Rejected</p>
          <p className="text-3xl font-bold text-red-400">{rejectedCount}</p>
        </button>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Avg DA (Live)</p>
          <p className="text-3xl font-bold text-purple-400">{avgDA}</p>
        </div>
      </div>

      {/* Backlinks Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {filteredBacklinks.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.07a4.5 4.5 0 00-6.364-6.364L4.5 8.25a4.5 4.5 0 006.364 6.364l4.5-4.5z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No Backlink Deliverables</h3>
            <p className="text-slate-400 mb-4">
              {filter === 'all'
                ? 'Start by adding your first backlink deliverable.'
                : `No backlinks with status "${filter}".`}
            </p>
            {filter === 'all' && (
              <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                Add First Backlink
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">TARGET URL</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">ANCHOR TEXT</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">SOURCE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DA</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DATE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBacklinks.map(backlink => (
                <tr key={backlink.id} className={`border-b border-white/5 hover:bg-slate-900/40 ${
                  backlink.status === 'REJECTED' ? 'bg-red-500/10' : ''
                }`}>
                  <td className="py-3 px-4 text-sm font-medium text-white">{backlink.client.name}</td>
                  <td className="py-3 px-4 text-sm font-mono text-teal-600">{backlink.targetUrl}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-slate-800/50 text-slate-200 text-xs rounded">
                      {backlink.anchorText}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300">{backlink.backlinkSource}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${getDAColor(backlink.domainAuthority)}`}>
                      {backlink.domainAuthority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(backlink.status)}`}>
                      {backlink.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-slate-300">
                    {formatDateDDMMYYYY(backlink.submittedDate)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {backlink.liveUrl && (
                        <a href={backlink.liveUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 text-sm font-medium">
                          View
                        </a>
                      )}
                      {backlink.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(backlink, 'LIVE')}
                            disabled={updatingId === backlink.id}
                            className="text-green-400 hover:text-green-300 text-sm font-medium disabled:opacity-50"
                          >
                            {updatingId === backlink.id ? '...' : 'Live'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(backlink, 'REJECTED')}
                            disabled={updatingId === backlink.id}
                            className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                          >
                            {updatingId === backlink.id ? '...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {backlink.status !== 'SUBMITTED' && !backlink.liveUrl && (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Backlink Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Backlink</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddBacklink} className="space-y-4">
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Target URL *</label>
                <input
                  type="text"
                  value={addForm.targetUrl}
                  onChange={e => setAddForm({ ...addForm, targetUrl: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="e.g., /cardiology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Anchor Text *</label>
                <input
                  type="text"
                  value={addForm.anchorText}
                  onChange={e => setAddForm({ ...addForm, anchorText: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="e.g., best cardiologist delhi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Backlink Source *</label>
                <input
                  type="text"
                  value={addForm.backlinkSource}
                  onChange={e => setAddForm({ ...addForm, backlinkSource: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="e.g., HealthDirectory.in"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Domain Authority</label>
                  <input
                    type="number"
                    value={addForm.domainAuthority}
                    onChange={e => setAddForm({ ...addForm, domainAuthority: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Live URL</label>
                  <input
                    type="text"
                    value={addForm.liveUrl}
                    onChange={e => setAddForm({ ...addForm, liveUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2.5 bg-white/5 text-white rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Backlink'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
