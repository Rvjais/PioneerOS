'use client'

import { useState, useEffect, use } from 'react'
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

const PAGE_TYPES = ['STATIC', 'DYNAMIC', 'BLOG', 'PRODUCT', 'LANDING']
const STATUSES = ['PLANNED', 'IN_DESIGN', 'IN_DEVELOPMENT', 'REVIEW', 'APPROVED', 'LIVE']

const statusColors: Record<string, string> = {
  PLANNED: 'bg-slate-800/50 text-slate-300',
  IN_DESIGN: 'bg-purple-500/20 text-purple-400',
  IN_DEVELOPMENT: 'bg-blue-500/20 text-blue-400',
  REVIEW: 'bg-amber-500/20 text-amber-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  LIVE: 'bg-emerald-500/20 text-emerald-400',
}

const statusTextColors: Record<string, string> = {
  PLANNED: 'text-slate-300',
  IN_DESIGN: 'text-purple-400',
  IN_DEVELOPMENT: 'text-blue-400',
  REVIEW: 'text-amber-400',
  APPROVED: 'text-green-400',
  LIVE: 'text-emerald-400',
}

export default function SitemapManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [pages, setPages] = useState<SitemapPage[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    pageName: '',
    pageSlug: '',
    pageUrl: '',
    pageType: 'STATIC',
    description: '',
    status: 'PLANNED',
    wireframeUrl: '',
    designUrl: '',
    previewUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [resolvedParams.id])

  const fetchPages = async () => {
    try {
      const res = await fetch(`/api/web-clients/${resolvedParams.id}/sitemap`)
      if (res.ok) {
        const data = await res.json()
        setPages(data.pages)
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.pageName || !formData.pageSlug) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/web-clients/${resolvedParams.id}/sitemap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pageUrl: formData.pageUrl || null,
          wireframeUrl: formData.wireframeUrl || null,
          designUrl: formData.designUrl || null,
          previewUrl: formData.previewUrl || null,
          description: formData.description || null,
        }),
      })

      if (res.ok) {
        setFormData({
          pageName: '',
          pageSlug: '',
          pageUrl: '',
          pageType: 'STATIC',
          description: '',
          status: 'PLANNED',
          wireframeUrl: '',
          designUrl: '',
          previewUrl: '',
        })
        setShowAddModal(false)
        fetchPages()
      }
    } catch (error) {
      console.error('Failed to add page:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-generate slug from page name
  const handlePageNameChange = (name: string) => {
    const slug = '/' + name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    setFormData(d => ({
      ...d,
      pageName: name,
      pageSlug: slug === '/' ? slug : slug,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/web/clients/${resolvedParams.id}`}
            className="p-2 hover:bg-slate-800/50 rounded-lg"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Sitemap Manager</h1>
            <p className="text-slate-400">Manage website pages and track progress</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Page
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {STATUSES.map(status => (
          <div key={status} className="glass-card rounded-lg border border-white/10 p-4">
            <span className={`text-2xl font-bold ${statusTextColors[status]}`}>
              {pages.filter(p => p.status === status).length}
            </span>
            <p className="text-xs text-slate-400 mt-1">{status.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* Page List */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Page</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Links</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Feedback</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {pages.length > 0 ? pages.map(page => (
                <tr key={page.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-white">{page.pageName}</span>
                      <p className="text-sm text-slate-400">{page.pageSlug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">{page.pageType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[page.status]}`}>
                      {page.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {page.designUrl && (
                        <a href={page.designUrl} target="_blank" rel="noopener noreferrer" title="Design">
                          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </a>
                      )}
                      {page.previewUrl && (
                        <a href={page.previewUrl} target="_blank" rel="noopener noreferrer" title="Preview">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      )}
                      {page.pageUrl && (
                        <a href={page.pageUrl} target="_blank" rel="noopener noreferrer" title="Live">
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {page.pendingFeedbackCount > 0 ? (
                      <span className="flex items-center gap-1 text-amber-400 text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {page.pendingFeedbackCount} pending
                      </span>
                    ) : page.feedbackCount > 0 ? (
                      <span className="text-sm text-slate-400">{page.feedbackCount} total</span>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-slate-800/50 rounded">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No pages added yet. Click "Add Page" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Page</h2>
            <form onSubmit={handleAddPage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Page Name *</label>
                  <input
                    type="text"
                    value={formData.pageName}
                    onChange={e => handlePageNameChange(e.target.value)}
                    placeholder="Home"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Page Slug *</label>
                  <input
                    type="text"
                    value={formData.pageSlug}
                    onChange={e => setFormData(d => ({ ...d, pageSlug: e.target.value }))}
                    placeholder="/"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Page Type</label>
                  <select
                    value={formData.pageType}
                    onChange={e => setFormData(d => ({ ...d, pageType: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                  >
                    {PAGE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(d => ({ ...d, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg resize-none"
                  placeholder="Brief description of the page purpose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Design URL</label>
                <input
                  type="url"
                  value={formData.designUrl}
                  onChange={e => setFormData(d => ({ ...d, designUrl: e.target.value }))}
                  placeholder="https://figma.com/..."
                  className="w-full px-3 py-2 border border-white/10 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Preview URL</label>
                <input
                  type="url"
                  value={formData.previewUrl}
                  onChange={e => setFormData(d => ({ ...d, previewUrl: e.target.value }))}
                  placeholder="https://staging.example.com/..."
                  className="w-full px-3 py-2 border border-white/10 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Live URL</label>
                <input
                  type="url"
                  value={formData.pageUrl}
                  onChange={e => setFormData(d => ({ ...d, pageUrl: e.target.value }))}
                  placeholder="https://example.com/..."
                  className="w-full px-3 py-2 border border-white/10 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.pageName || !formData.pageSlug}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
