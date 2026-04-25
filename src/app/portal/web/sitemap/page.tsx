'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SitemapPage {
  id: string
  pageName: string
  pageSlug: string
  pageUrl: string | null
  pageType: string
  description: string | null
  status: string
  order: number
  wireframeUrl: string | null
  designUrl: string | null
  previewUrl: string | null
  feedbackCount: number
  pendingFeedbackCount: number
}

interface SitemapData {
  pages: SitemapPage[]
  summary: Record<string, number>
  total: number
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PLANNED: { label: 'Planned', color: 'text-slate-300', bg: 'bg-slate-800/50' },
  IN_DESIGN: { label: 'In Design', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  IN_DEVELOPMENT: { label: 'In Development', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  REVIEW: { label: 'Review', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  APPROVED: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20' },
  LIVE: { label: 'Live', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
}

const pageTypeIcons: Record<string, string> = {
  STATIC: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  DYNAMIC: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  BLOG: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  PRODUCT: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  LANDING: 'M13 10V3L4 14h7v7l9-11h-7z',
}

export default function SitemapPage() {
  const [data, setData] = useState<SitemapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSitemap()
  }, [])

  const fetchSitemap = async () => {
    try {
      const res = await fetch('/api/web-portal/sitemap')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch sitemap:', error)
      setError('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  const filteredPages = data?.pages.filter(page =>
    (filter === 'ALL' || page.status === filter) &&
    (searchQuery === '' ||
      page.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.pageSlug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false))
  ) || []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800/50 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-stat-${i}`} className="p-4 rounded-lg border border-white/10 glass-card">
              <div className="h-8 w-12 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-800/50 rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>
        <div className="glass-card rounded-xl border border-white/10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-row-${i}`} className="flex items-center gap-4 p-4 border-b border-white/10 last:border-0">
              <div className="w-10 h-10 bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-800/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchSitemap(); }} className="mt-4 text-red-400 underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/portal/web" className="text-slate-400 hover:text-teal-600">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-white font-medium">Website Pages</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Pages</h1>
          <p className="text-slate-400 mt-1">View your sitemap and provide feedback on each page</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages by name, slug, or description..."
          className="w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-lg bg-slate-900/40 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {(searchQuery || filter !== 'ALL') && (
        <p className="text-sm text-slate-400">
          Showing {filteredPages.length} of {data?.total || 0} pages
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <button
          onClick={() => setFilter('ALL')}
          className={`p-4 rounded-lg border transition-colors ${
            filter === 'ALL' ? 'border-teal-500 bg-teal-500/200/20' : 'border-white/10 glass-card hover:bg-slate-900/40'
          }`}
        >
          <span className="text-2xl font-bold text-white">{data?.total || 0}</span>
          <p className="text-xs text-slate-400 mt-1">All Pages</p>
        </button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`p-4 rounded-lg border transition-colors ${
              filter === status ? 'border-teal-500 bg-teal-500/20' : 'border-white/10 glass-card hover:bg-slate-900/40'
            }`}
          >
            <span className={`text-2xl font-bold ${config.color}`}>
              {data?.summary[status] || 0}
            </span>
            <p className="text-xs text-slate-400 mt-1">{config.label}</p>
          </button>
        ))}
      </div>

      {/* Page List */}
      <div className="glass-card rounded-xl border border-white/10">
        {filteredPages.length > 0 ? (
          <div className="divide-y divide-white/10">
            {filteredPages.map((page) => (
              <Link
                key={page.id}
                href={`/portal/web/sitemap/${page.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-900/40 transition-colors"
              >
                {/* Page Icon */}
                <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pageTypeIcons[page.pageType] || pageTypeIcons.STATIC} />
                  </svg>
                </div>

                {/* Page Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white truncate">{page.pageName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[page.status]?.bg} ${statusConfig[page.status]?.color}`}>
                      {statusConfig[page.status]?.label || page.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-400">{page.pageSlug}</span>
                    {page.description && (
                      <span className="text-sm text-slate-400 truncate hidden md:block">
                        {page.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div className="flex items-center gap-2">
                  {page.designUrl && (
                    <a
                      href={page.designUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg"
                      title="View Design"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </a>
                  )}
                  {page.previewUrl && (
                    <a
                      href={page.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                      title="Preview Page"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                  )}
                  {page.pageUrl && (
                    <a
                      href={page.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                      title="Visit Live Page"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Feedback Count */}
                <div className="flex items-center gap-4">
                  {page.pendingFeedbackCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {page.pendingFeedbackCount}
                    </span>
                  )}
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-1">No pages found</h3>
            <p className="text-slate-400">
              {filter === 'ALL' && !searchQuery
                ? 'No pages have been added to your sitemap yet'
                : searchQuery
                ? `No pages matching "${searchQuery}"`
                : `No pages with status "${statusConfig[filter]?.label}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
