'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface IdeaUser {
  id: string
  firstName: string
}

interface IdeaVote {
  userId: string
}

interface Idea {
  id: string
  title: string
  description: string
  category: string
  status: string
  user: IdeaUser
  votes: IdeaVote[]
  _count: { votes: number }
}

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-slate-800/50 text-slate-200',
  UNDER_REVIEW: 'bg-blue-500/20 text-blue-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  IMPLEMENTED: 'bg-purple-500/20 text-purple-400',
  REJECTED: 'bg-red-500/20 text-red-400',
}

const categoryColors: Record<string, string> = {
  MARKETING: 'bg-pink-500/20 text-pink-400',
  AUTOMATION: 'bg-yellow-500/20 text-yellow-400',
  PROCESS: 'bg-blue-500/20 text-blue-400',
  GROWTH: 'bg-green-500/20 text-green-400',
  OTHER: 'bg-slate-800/50 text-slate-200',
}

const categories = ['MARKETING', 'AUTOMATION', 'PROCESS', 'GROWTH', 'OTHER']

export default function IdeasClient({ ideas, userId }: { ideas: Idea[]; userId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showForm = searchParams.get('action') === 'new'

  const [form, setForm] = useState({ title: '', description: '', category: 'OTHER' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit idea')
      }

      router.push('/ideas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Innovation Board</h1>
          <p className="text-slate-400 mt-1">Submit ideas and vote on suggestions</p>
        </div>
        {showForm ? (
          <Link
            href="/ideas"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </Link>
        ) : (
          <Link
            href="/ideas?action=new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit Idea
          </Link>
        )}
      </div>

      {/* Submit Form */}
      {showForm && (
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Submit New Idea</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder-gray-500"
                placeholder="Your idea in a few words"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder-gray-500"
                placeholder="Describe your idea in detail..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Idea'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{ideas.length}</p>
          <p className="text-sm text-slate-400">Total Ideas</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">
            {ideas.filter(i => i.status === 'UNDER_REVIEW').length}
          </p>
          <p className="text-sm text-slate-400">Under Review</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">
            {ideas.filter(i => i.status === 'APPROVED').length}
          </p>
          <p className="text-sm text-slate-400">Approved</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-purple-400">
            {ideas.filter(i => i.status === 'IMPLEMENTED').length}
          </p>
          <p className="text-sm text-slate-400">Implemented</p>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl border border-white/10 p-8 text-center text-slate-400">
            No ideas submitted yet. Be the first to share your innovation!
          </div>
        ) : (
          ideas.map((idea) => {
            const hasVoted = idea.votes.some(v => v.userId === userId)
            return (
              <div key={idea.id} className="glass-card rounded-2xl border border-white/10 overflow-hidden hover:shadow-none transition-shadow">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColors[idea.category]}`}>
                      {idea.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[idea.status]}`}>
                      {idea.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{idea.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3">{idea.description}</p>
                </div>
                <div className="px-5 py-3 bg-slate-900/40 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserAvatar user={{ id: idea.user.id, firstName: idea.user.firstName }} size="xs" showPreview={false} />
                    <span className="text-xs text-slate-400">{idea.user.firstName}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    hasVoted
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-slate-300'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                    <span>{idea._count.votes}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
