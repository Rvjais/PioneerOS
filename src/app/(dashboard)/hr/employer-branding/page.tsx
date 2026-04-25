'use client'

import { useState, useEffect } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { toast } from 'sonner'

interface User {
  id: string
  firstName: string
  lastName: string | null
}

interface BrandingContent {
  id: string
  title: string
  description: string | null
  type: string
  platform: string
  contentText: string | null
  mediaUrls: string | null
  hashtags: string | null
  scheduledFor: string | null
  publishedAt: string | null
  status: string
  createdBy: string
  creator: User
  approvedBy: string | null
  approver: User | null
  approvedAt: string | null
  rejectionReason: string | null
  likes: number
  comments: number
  shares: number
  reach: number
  impressions: number
  createdAt: string
}

interface ContentIdea {
  id: string
  title: string
  description: string | null
  type: string
  theme: string | null
  tags: string | null
  status: string
  usedCount: number
  creator: User
}

const TYPE_OPTIONS = ['POST', 'REEL', 'STORY', 'BLOG', 'VIDEO', 'EMPLOYEE_SPOTLIGHT', 'CULTURE']
const PLATFORM_OPTIONS = ['INSTAGRAM', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'ALL']
const STATUS_COLORS: Record<string, string> = {
  'IDEA': 'bg-slate-800/50 text-slate-200',
  'DRAFT': 'bg-yellow-500/20 text-yellow-400',
  'PENDING_APPROVAL': 'bg-orange-500/20 text-orange-400',
  'APPROVED': 'bg-blue-500/20 text-blue-400',
  'SCHEDULED': 'bg-purple-500/20 text-purple-400',
  'PUBLISHED': 'bg-green-500/20 text-green-400',
  'REJECTED': 'bg-red-500/20 text-red-400',
}

export default function EmployerBrandingPage() {
  const [content, setContent] = useState<BrandingContent[]>([])
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [stats, setStats] = useState({ total: 0, ideas: 0, pendingApproval: 0, scheduled: 0, published: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showIdeasBank, setShowIdeasBank] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hr/employer-branding')
      if (res.ok) {
        const data = await res.json()
        setContent(data.content)
        setIdeas(data.ideas)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContent = content.filter(c => {
    if (filter === 'all') return true
    return c.status === filter
  })

  // Group by date for calendar view
  const contentByDate = content.reduce((acc, c) => {
    if (c.scheduledFor) {
      const date = new Date(c.scheduledFor).toDateString()
      if (!acc[date]) acc[date] = []
      acc[date].push(c)
    }
    return acc
  }, {} as Record<string, BrandingContent[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Employer Branding</h1>
            <InfoTooltip
              title="Employer Branding Content"
              steps={[
                'Create content ideas and save to the Ideas Bank',
                'Draft posts with images, text, and hashtags',
                'Submit for approval before publishing',
                'Schedule approved content for specific dates'
              ]}
              tips={[
                'All content needs founder approval before posting',
                'Use Ideas Bank for content inspiration',
                'Track performance after publishing'
              ]}
            />
          </div>
          <p className="text-slate-400 text-sm mt-1">Manage social media content for employer branding</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIdeasBank(true)}
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Ideas Bank ({ideas.length})
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            Create Content
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Content</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-sm text-yellow-600">Ideas/Drafts</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.ideas}</p>
        </div>
        <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
          <p className="text-sm text-orange-600">Pending Approval</p>
          <p className="text-2xl font-bold text-orange-700">{stats.pendingApproval}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Scheduled</p>
          <p className="text-2xl font-bold text-purple-400">{stats.scheduled}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Published</p>
          <p className="text-2xl font-bold text-green-400">{stats.published}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'IDEA', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'PUBLISHED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-pink-600 text-white'
                : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContent.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 glass-card rounded-xl border border-white/10">
            No content found
          </div>
        ) : (
          filteredContent.map((item) => (
            <ContentCard key={item.id} content={item} onUpdate={fetchContent} />
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddContentModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false)
            fetchContent()
          }}
        />
      )}

      {/* Ideas Bank Modal */}
      {showIdeasBank && (
        <IdeasBankModal
          ideas={ideas}
          onClose={() => setShowIdeasBank(false)}
          onUseIdea={(idea) => {
            setShowIdeasBank(false)
            setShowAddModal(true)
            // The idea data would be passed to the modal
          }}
        />
      )}
    </div>
  )
}

// Content Card Component
function ContentCard({ content, onUpdate }: { content: BrandingContent; onUpdate: () => void }) {
  const [showActions, setShowActions] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/hr/employer-branding/${content.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Status updated to ${newStatus.replace(/_/g, ' ').toLowerCase()}`)
        onUpdate()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden hover:shadow-none transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[content.status]}`}>
            {content.status.replace(/_/g, ' ')}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">{content.type}</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-400">{content.platform}</span>
          </div>
        </div>

        <h3 className="font-semibold text-white mb-1">{content.title}</h3>
        {content.description && (
          <p className="text-sm text-slate-300 line-clamp-2 mb-2">{content.description}</p>
        )}

        {content.scheduledFor && (
          <p className="text-xs text-purple-400 mb-2">
            Scheduled: {new Date(content.scheduledFor).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}

        {content.hashtags && (
          <p className="text-xs text-blue-500 mb-2">{content.hashtags}</p>
        )}

        {/* Performance Metrics (if published) */}
        {content.status === 'PUBLISHED' && (
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
            <span>{content.likes} likes</span>
            <span>{content.comments} comments</span>
            <span>{content.reach} reach</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-slate-400">
            by {content.creator.firstName}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-slate-800/50 rounded"
              title="More actions"
            >
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
            {showActions && (
              <div className="absolute right-0 bottom-8 glass-card border border-white/10 rounded-lg shadow-none py-1 min-w-[140px] z-10">
                {content.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange('PENDING_APPROVAL')}
                    className="w-full px-3 py-1.5 text-left text-sm text-slate-200 hover:bg-slate-900/40"
                  >
                    Submit for Approval
                  </button>
                )}
                {content.status === 'APPROVED' && (
                  <button
                    onClick={() => handleStatusChange('SCHEDULED')}
                    className="w-full px-3 py-1.5 text-left text-sm text-slate-200 hover:bg-slate-900/40"
                  >
                    Schedule
                  </button>
                )}
                {content.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleStatusChange('PUBLISHED')}
                    className="w-full px-3 py-1.5 text-left text-sm text-green-400 hover:bg-green-500/10"
                  >
                    Mark as Published
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Content Modal
function AddContentModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'POST',
    platform: 'ALL',
    contentText: '',
    hashtags: '',
    scheduledFor: '',
    status: 'DRAFT'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title) return

    setSaving(true)
    try {
      const res = await fetch('/api/hr/employer-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        toast.success('Content created successfully')
        onSave()
      } else {
        toast.error('Failed to create content')
      }
    } catch (error) {
      console.error('Failed to create content:', error)
      toast.error('Failed to create content')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Create Content</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="Content title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg"
              >
                {PLATFORM_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="Brief description of the content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Content Text</label>
            <textarea
              value={form.contentText}
              onChange={(e) => setForm({ ...form, contentText: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="The actual post content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Hashtags</label>
            <input
              type="text"
              value={form.hashtags}
              onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
              placeholder="#BrandingPioneers #TeamCulture"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Schedule For</label>
            <input
              type="datetime-local"
              value={form.scheduledFor}
              onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.title}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Content'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Ideas Bank Modal
function IdeasBankModal({
  ideas,
  onClose,
  onUseIdea
}: {
  ideas: ContentIdea[]
  onClose: () => void
  onUseIdea: (idea: ContentIdea) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Ideas Bank</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800/50 rounded-lg" title="Close">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {ideas.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No ideas in the bank yet
            </div>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <div key={idea.id} className="p-4 bg-slate-900/40 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{idea.title}</h3>
                      {idea.description && (
                        <p className="text-sm text-slate-300 mt-1">{idea.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded">{idea.type}</span>
                        {idea.theme && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">{idea.theme}</span>
                        )}
                        <span className="text-xs text-slate-400">Used {idea.usedCount}x</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onUseIdea(idea)}
                      className="px-3 py-1 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
