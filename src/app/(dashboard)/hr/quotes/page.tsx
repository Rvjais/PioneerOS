'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Quote {
  id: string
  text: string
  author: string
  isActive: boolean
  createdAt: string
  creator?: { firstName: string; lastName: string } | null
}

export default function QuotesManagementPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [form, setForm] = useState({ text: '', author: '' })
  const [saving, setSaving] = useState(false)

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes?mode=all')
      const data = await res.json()
      setQuotes(data.quotes || [])
    } catch {
      toast.error('Failed to load quotes')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingQuote) {
        const res = await fetch('/api/quotes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingQuote.id, ...form }),
        })
        if (!res.ok) throw new Error()
        toast.success('Quote updated')
      } else {
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        toast.success('Quote added')
      }

      setForm({ text: '', author: '' })
      setShowForm(false)
      setEditingQuote(null)
      fetchQuotes()
    } catch {
      toast.error('Failed to save quote')
    }
    setSaving(false)
  }

  const toggleActive = async (quote: Quote) => {
    try {
      await fetch('/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, isActive: !quote.isActive }),
      })
      fetchQuotes()
      toast.success(quote.isActive ? 'Quote hidden from login' : 'Quote visible on login')
    } catch {
      toast.error('Failed to update')
    }
  }

  const deleteQuote = async (id: string) => {
    if (!confirm('Delete this quote permanently?')) return
    try {
      await fetch(`/api/quotes?id=${id}`, { method: 'DELETE' })
      fetchQuotes()
      toast.success('Quote deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const startEdit = (quote: Quote) => {
    setEditingQuote(quote)
    setForm({ text: quote.text, author: quote.author })
    setShowForm(true)
  }

  const activeCount = quotes.filter((q) => q.isActive).length

  // Calculate today's quote
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const activeQuotes = quotes.filter((q) => q.isActive)
  const todaysQuote = activeQuotes.length > 0 ? activeQuotes[dayOfYear % activeQuotes.length] : null

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quote of the Day</h1>
          <p className="text-slate-400 mt-1">
            Manage motivational quotes shown on the login screen. {activeCount} active quotes rotating daily.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingQuote(null)
            setForm({ text: '', author: '' })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Quote
        </button>
      </div>

      {/* Today's Quote Preview */}
      {todaysQuote && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            TODAY&apos;S QUOTE ON LOGIN SCREEN
          </div>
          <p className="text-xl text-white font-medium italic">&ldquo;{todaysQuote.text}&rdquo;</p>
          <p className="text-blue-300 mt-2 font-semibold">— {todaysQuote.author}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{quotes.length}</p>
          <p className="text-sm text-slate-400">Total Quotes</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
          <p className="text-sm text-slate-400">Active (Rotating)</p>
        </div>
        <div className="bg-slate-500/5 border border-slate-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-slate-400">{quotes.length - activeCount}</p>
          <p className="text-sm text-slate-400">Hidden</p>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingQuote ? 'Edit Quote' : 'Add New Quote'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingQuote(null) }}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quote Text *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  required
                  rows={3}
                  placeholder="Enter an inspiring quote..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Author *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  required
                  placeholder="Who said this?"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingQuote(null) }}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 transition-all"
                >
                  {saving ? 'Saving...' : editingQuote ? 'Update' : 'Add Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 mt-3">Loading quotes...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-slate-400">No quotes yet. Add your first motivational quote!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className={`bg-white/5 border rounded-xl p-4 transition-all ${
                quote.isActive ? 'border-white/10' : 'border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium italic">&ldquo;{quote.text}&rdquo;</p>
                  <p className="text-blue-400 text-sm mt-1 font-semibold">— {quote.author}</p>
                  {quote.creator && (
                    <p className="text-slate-500 text-xs mt-1">
                      Added by {quote.creator.firstName} {quote.creator.lastName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(quote)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      quote.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                    }`}
                  >
                    {quote.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => startEdit(quote)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteQuote(quote.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
