'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface ContentDeliverable {
  id: string
  clientId: string
  client: { id: string; name: string }
  blogTopic: string
  targetKeyword: string
  writer: { id: string; firstName: string; lastName: string } | null
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED'
  wordCount: number
  publishedUrl?: string
  deadline: string
  createdAt: string
  updatedAt: string
}

const STATUS_FLOW: Record<string, string> = {
  DRAFT: 'IN_REVIEW',
  IN_REVIEW: 'PUBLISHED',
}

export default function SeoContentDeliverablesPage() {
  const [content, setContent] = useState<ContentDeliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [writers, setWriters] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState({
    clientId: '',
    blogTopic: '',
    targetKeyword: '',
    writerId: '',
    wordCount: 0,
    deadline: '',
  })

  useEffect(() => {
    fetchContent()
    fetch('/api/clients?status=ACTIVE&limit=100')
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
      .catch(() => {})
    fetch('/api/hr/employees?department=SEO')
      .then(r => r.json())
      .then(d => setWriters(d.employees || []))
      .catch(() => {})
  }, [])

  const fetchContent = async () => {
    try {
      setError(null)
      const res = await fetch('/api/seo/content')
      if (!res.ok) throw new Error('Failed to fetch content')
      const data = await res.json()
      setContent(data.content || [])
    } catch (err) {
      console.error('Failed to fetch content:', err)
      setError('Failed to load content deliverables. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/seo/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          wordCount: addForm.wordCount || 0,
          writerId: addForm.writerId || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create content')
      toast.success('Content deliverable added successfully')
      setShowAddForm(false)
      setAddForm({ clientId: '', blogTopic: '', targetKeyword: '', writerId: '', wordCount: 0, deadline: '' })
      fetchContent()
    } catch {
      toast.error('Failed to add content deliverable')
    }
    setSaving(false)
  }

  const handleStatusUpdate = async (item: ContentDeliverable) => {
    const nextStatus = STATUS_FLOW[item.status]
    if (!nextStatus) return
    setUpdatingId(item.id)
    try {
      const res = await fetch('/api/seo/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: nextStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      toast.success(`Status updated to ${nextStatus.replace(/_/g, ' ')}`)
      fetchContent()
    } catch {
      toast.error('Failed to update status')
    }
    setUpdatingId(null)
  }

  const filteredContent = filter === 'all' ? content : content.filter(c => c.status === filter)

  const draftCount = content.filter(c => c.status === 'DRAFT').length
  const reviewCount = content.filter(c => c.status === 'IN_REVIEW').length
  const publishedCount = content.filter(c => c.status === 'PUBLISHED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-800/50 text-slate-200'
      case 'IN_REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Move to Review'
      case 'IN_REVIEW': return 'Mark Published'
      default: return null
    }
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
        <button onClick={() => { setLoading(true); fetchContent() }} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
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
            <h1 className="text-2xl font-bold">Content Deliverables</h1>
            <p className="text-teal-200">Track blog content for SEO campaigns</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all">
            + Add Blog
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'all' ? 'border-teal-500 bg-teal-500/10' : 'border-white/10 glass-card hover:border-teal-300'
          }`}
        >
          <p className="text-sm text-slate-400">Total Blogs</p>
          <p className="text-3xl font-bold text-teal-600">{content.length}</p>
        </button>
        <button
          onClick={() => setFilter('DRAFT')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'DRAFT' ? 'border-slate-500 bg-slate-800/50' : 'border-white/10 glass-card hover:border-white/20'
          }`}
        >
          <p className="text-sm text-slate-400">In Draft</p>
          <p className="text-3xl font-bold text-slate-300">{draftCount}</p>
        </button>
        <button
          onClick={() => setFilter('IN_REVIEW')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'IN_REVIEW' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">In Review</p>
          <p className="text-3xl font-bold text-amber-400">{reviewCount}</p>
        </button>
        <button
          onClick={() => setFilter('PUBLISHED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'PUBLISHED' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Published</p>
          <p className="text-3xl font-bold text-green-400">{publishedCount}</p>
        </button>
      </div>

      {/* Content Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {filteredContent.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No Content Deliverables</h3>
            <p className="text-slate-400 mb-4">
              {filter === 'all'
                ? 'Start by adding your first blog content deliverable.'
                : `No content with status "${filter.replace(/_/g, ' ')}".`}
            </p>
            {filter === 'all' && (
              <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                Add First Blog
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">BLOG TOPIC</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">TARGET KEYWORD</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">WRITER</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">WORDS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DEADLINE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{item.blogTopic}</p>
                    {item.publishedUrl && (
                      <a href={item.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:text-teal-800">
                        View Published
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300">{item.client.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded">
                      {item.targetKeyword}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300">
                    {item.writer ? `${item.writer.firstName} ${item.writer.lastName}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-medium ${item.wordCount >= 1500 ? 'text-green-400' : item.wordCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {item.wordCount > 0 ? item.wordCount : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm ${
                      new Date(item.deadline) < new Date() && item.status !== 'PUBLISHED'
                        ? 'text-red-400 font-medium'
                        : 'text-slate-300'
                    }`}>
                      {formatDateDDMMYYYY(item.deadline)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusAction(item.status) ? (
                      <button
                        onClick={() => handleStatusUpdate(item)}
                        disabled={updatingId === item.id}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium disabled:opacity-50"
                      >
                        {updatingId === item.id ? 'Updating...' : getStatusAction(item.status)}
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">Published</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Content Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Blog Content</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddContent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Client *</label>
                <select
                  value={addForm.clientId}
                  onChange={e => setAddForm({ ...addForm, clientId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Select client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Blog Topic *</label>
                <input
                  type="text"
                  value={addForm.blogTopic}
                  onChange={e => setAddForm({ ...addForm, blogTopic: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                  placeholder="e.g., Best Cardiologist in Delhi - Complete Guide"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Target Keyword *</label>
                <input
                  type="text"
                  value={addForm.targetKeyword}
                  onChange={e => setAddForm({ ...addForm, targetKeyword: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                  placeholder="e.g., best cardiologist delhi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Writer</label>
                <select
                  value={addForm.writerId}
                  onChange={e => setAddForm({ ...addForm, writerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Unassigned</option>
                  {writers.map(w => <option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Word Count</label>
                  <input
                    type="number"
                    value={addForm.wordCount}
                    onChange={e => setAddForm({ ...addForm, wordCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Deadline *</label>
                  <input
                    type="date"
                    value={addForm.deadline}
                    onChange={e => setAddForm({ ...addForm, deadline: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Content'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
