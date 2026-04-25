'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ContentItem {
  id: string
  title: string
  type: string
  url: string
  description: string | null
  category: string | null
  isActive: boolean
}

const CONTENT_TYPES = [
  { value: 'EBOOK', label: 'eBook', icon: '📚' },
  { value: 'CASE_STUDY', label: 'Case Study', icon: '📊' },
  { value: 'VIDEO', label: 'Video', icon: '🎬' },
  { value: 'TESTIMONIAL', label: 'Testimonial', icon: '⭐' },
  { value: 'WEBSITE_EXAMPLE', label: 'Website Example', icon: '🌐' },
  { value: 'INDUSTRY_INSIGHTS', label: 'Industry Insights', icon: '💡' },
]

const CATEGORIES = ['HEALTHCARE', 'ECOMMERCE', 'SAAS', 'GENERAL']

// Pre-configured content library
const DEFAULT_CONTENT: Omit<ContentItem, 'id'>[] = [
  // eBooks
  {
    title: 'Healthcare Marketing Guide 2024',
    type: 'EBOOK',
    url: 'https://drive.google.com/healthcare-guide',
    description: 'Complete guide to digital marketing for healthcare providers',
    category: 'HEALTHCARE',
    isActive: true,
  },
  {
    title: 'Social Media Marketing Playbook',
    type: 'EBOOK',
    url: 'https://drive.google.com/social-playbook',
    description: 'Step-by-step social media strategy',
    category: 'GENERAL',
    isActive: true,
  },
  // Case Studies
  {
    title: 'Apollo Clinics - 3X Lead Growth',
    type: 'CASE_STUDY',
    url: 'https://brandingpioneers.com/case-studies/apollo',
    description: 'How we helped Apollo achieve 300% lead growth',
    category: 'HEALTHCARE',
    isActive: true,
  },
  {
    title: 'CloudKitch - E-commerce Success',
    type: 'CASE_STUDY',
    url: 'https://brandingpioneers.com/case-studies/cloudkitch',
    description: 'E-commerce transformation story',
    category: 'ECOMMERCE',
    isActive: true,
  },
  // Videos
  {
    title: 'Client Success Stories Compilation',
    type: 'VIDEO',
    url: 'https://youtube.com/watch?v=success-stories',
    description: 'Our clients share their experience',
    category: 'GENERAL',
    isActive: true,
  },
  {
    title: 'Healthcare Digital Marketing Trends',
    type: 'VIDEO',
    url: 'https://youtube.com/watch?v=healthcare-trends',
    description: 'Latest trends in healthcare marketing',
    category: 'HEALTHCARE',
    isActive: true,
  },
  // Testimonials
  {
    title: 'Dr. Sharma - Clinic Growth Story',
    type: 'TESTIMONIAL',
    url: 'https://brandingpioneers.com/testimonials/dr-sharma',
    description: 'Video testimonial from Dr. Sharma',
    category: 'HEALTHCARE',
    isActive: true,
  },
  // Website Examples
  {
    title: 'Skin & You Clinic Website',
    type: 'WEBSITE_EXAMPLE',
    url: 'https://skinandyouclinic.com',
    description: 'Modern healthcare website design',
    category: 'HEALTHCARE',
    isActive: true,
  },
  {
    title: 'TechFlow SaaS Website',
    type: 'WEBSITE_EXAMPLE',
    url: 'https://techflow.io',
    description: 'SaaS product website',
    category: 'SAAS',
    isActive: true,
  },
]

export default function ContentLibraryPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', category: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'EBOOK',
    url: '',
    description: '',
    category: 'GENERAL',
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/sales/nurturing/content')
      if (res.ok) {
        const data = await res.json()
        setContent(data.length > 0 ? data : DEFAULT_CONTENT.map((c, i) => ({ ...c, id: `default-${i}` })))
      } else {
        // Use default content if API doesn't exist
        setContent(DEFAULT_CONTENT.map((c, i) => ({ ...c, id: `default-${i}` })))
      }
    } catch {
      // Use default content if fetch fails
      setContent(DEFAULT_CONTENT.map((c, i) => ({ ...c, id: `default-${i}` })))
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const filteredContent = content.filter(c => {
    if (filter.type && c.type !== filter.type) return false
    if (filter.category && c.category !== filter.category) return false
    return true
  })

  const groupedContent = CONTENT_TYPES.map(type => ({
    ...type,
    items: filteredContent.filter(c => c.type === type.value),
  })).filter(group => group.items.length > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Content Library</h1>
          <p className="text-sm text-slate-400">Pre-configured content for nurturing leads</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/sales/nurturing"
            className="flex items-center gap-2 px-4 py-2 border border-white/10 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-900/40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Nurturing
          </Link>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Content
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 bg-slate-900/40 p-3 rounded-lg border border-white/10">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-3 py-1.5 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Types</option>
          {CONTENT_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="px-3 py-1.5 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {(filter.type || filter.category) && (
          <button
            onClick={() => setFilter({ type: '', category: '' })}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content Grid */}
      <div className="space-y-6">
        {groupedContent.map(group => (
          <div key={group.value}>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-xl">{group.icon}</span>
              {group.label}s
              <span className="text-sm font-normal text-slate-400">({group.items.length})</span>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {group.items.map(item => (
                <div
                  key={item.id}
                  className="glass-card rounded-lg border border-white/10 p-4 hover:shadow-none transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    {item.category && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800/50 text-slate-300">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-400 mt-2">{item.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 text-center text-sm font-medium text-orange-600 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => handleCopyUrl(item.url)}
                      className="px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No content found matching your filters
        </div>
      )}

      {/* Add Content Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Add Content</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Title *</label>
                <input
                  type="text"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Type *</label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {CONTENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
                  <select
                    value={newContent.category}
                    onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">URL *</label>
                <input
                  type="url"
                  value={newContent.url}
                  onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={!newContent.title || !newContent.url}
                className="px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:bg-white/20 disabled:cursor-not-allowed"
              >
                Add Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
