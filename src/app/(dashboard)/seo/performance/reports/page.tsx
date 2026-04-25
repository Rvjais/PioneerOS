'use client'

import { useState, useEffect } from 'react'

interface ContentItem {
  id: string
  title: string
  clientName: string
  status: string
  contentType: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export default function SeoReportsPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seo/content')
      .then(res => res.json())
      .then(data => {
        const items: ContentItem[] = data.content || data || []
        setContentItems(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const draftCount = contentItems.filter(r => r.status === 'DRAFT').length
  const publishedCount = contentItems.filter(r => r.status === 'PUBLISHED').length
  const reviewCount = contentItems.filter(r => r.status === 'REVIEW' || r.status === 'IN_REVIEW').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-800/50 text-slate-200'
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400'
      case 'REVIEW': case 'IN_REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SEO Reports</h1>
            <p className="text-teal-200">Monthly reports shared with clients</p>
          </div>
          <button disabled title="Coming soon" className="px-4 py-2 glass-card text-teal-600 rounded-lg font-medium opacity-50 cursor-not-allowed">
            + Create Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">In Draft</p>
          <p className="text-3xl font-bold text-slate-200">{draftCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">In Review</p>
          <p className="text-3xl font-bold text-amber-400">{reviewCount}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Published</p>
          <p className="text-3xl font-bold text-green-400">{publishedCount}</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {contentItems.map(item => (
          <div key={item.id} className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.clientName} {item.contentType ? `• ${item.contentType}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900/40 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">Created</p>
                <p className="text-xs text-slate-400">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">
                  {item.publishedAt ? 'Published' : 'Last Updated'}
                </p>
                <p className="text-xs text-slate-400">
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '-'}
                </p>
              </div>
            </div>

            {item.status === 'DRAFT' && (
              <div className="mt-3 flex gap-2">
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-teal-400 bg-teal-500/10 rounded-lg opacity-50 cursor-not-allowed">
                  Edit Report
                </button>
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg opacity-50 cursor-not-allowed">
                  Preview
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report Contents */}
      <div className="bg-teal-500/10 rounded-xl border border-teal-500/30 p-4">
        <h3 className="font-semibold text-teal-800 mb-3">Report Includes</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-teal-700">
          <div>
            <p className="font-medium mb-1">Traffic Analysis</p>
            <ul className="space-y-1">
              <li>- Organic traffic trends</li>
              <li>- Top landing pages</li>
              <li>- User behavior metrics</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Keyword Rankings</p>
            <ul className="space-y-1">
              <li>- Ranking improvements</li>
              <li>- New keywords added</li>
              <li>- Competitor comparison</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Backlinks</p>
            <ul className="space-y-1">
              <li>- New backlinks built</li>
              <li>- Domain authority</li>
              <li>- Link sources</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Work Completed</p>
            <ul className="space-y-1">
              <li>- Blogs published</li>
              <li>- Technical fixes</li>
              <li>- On-page optimizations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
