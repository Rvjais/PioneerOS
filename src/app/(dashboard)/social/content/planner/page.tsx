'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface PlannedPost {
  id: string
  client: string
  clientId?: string
  postType: 'Image Post' | 'Carousel' | 'Reel' | 'Story' | 'Video'
  topic: string
  caption: string
  hashtags: string[]
  platform: string
  status: 'IDEA' | 'PLANNED' | 'WRITING' | 'DESIGN_REQUESTED' | 'READY'
  scheduledDate?: string
}

interface Client {
  id: string
  name: string
}

export default function ContentPlannerPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [posts, setPosts] = useState<PlannedPost[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clientId: '',
    postType: 'Image Post',
    topic: '',
    caption: '',
    platform: 'Instagram',
    scheduledDate: '',
    contentType: 'CONTENT',
    status: 'PENDING',
  })

  useEffect(() => {
    fetch('/api/social/approvals?type=CONTENT')
      .then(res => res.json())
      .then(result => {
        const items = result.approvals || result.data || []
        const mapped: PlannedPost[] = items.map((item: any) => ({
          id: item.id,
          client: item.client?.name || '',
          clientId: item.clientId,
          postType: item.contentType || 'Image Post',
          topic: item.title || '',
          caption: item.description || '',
          hashtags: [],
          platform: item.platform || '',
          status: item.status === 'PENDING' ? 'PLANNED' : item.status === 'APPROVED' ? 'READY' : item.status === 'REVISION_REQUESTED' ? 'WRITING' : 'IDEA',
          scheduledDate: item.dueDate || undefined,
        }))
        setPosts(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (showPlanModal) {
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => setClients(data.clients || []))
        .catch(() => setClients([]))
    }
  }, [showPlanModal])

  async function handleSubmitPost(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/social/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          title: formData.topic,
          description: formData.caption,
          type: 'CONTENT',
          contentType: formData.postType,
          platform: formData.platform,
          dueDate: formData.scheduledDate || undefined,
          status: 'PENDING',
          priority: 'NORMAL',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create post')
      }

      setShowPlanModal(false)
      setFormData({
        clientId: '',
        postType: 'Image Post',
        topic: '',
        caption: '',
        platform: 'Instagram',
        scheduledDate: '',
        contentType: 'CONTENT',
        status: 'PENDING',
      })

      // Refresh posts
      fetch('/api/social/approvals?type=CONTENT')
        .then(res => res.json())
        .then(result => {
          const items = result.approvals || result.data || []
          const mapped: PlannedPost[] = items.map((item: any) => ({
            id: item.id,
            client: item.client?.name || '',
            clientId: item.clientId,
            postType: item.contentType || 'Image Post',
            topic: item.title || '',
            caption: item.description || '',
            hashtags: [],
            platform: item.platform || '',
            status: item.status === 'PENDING' ? 'PLANNED' : item.status === 'APPROVED' ? 'READY' : item.status === 'REVISION_REQUESTED' ? 'WRITING' : 'IDEA',
            scheduledDate: item.dueDate || undefined,
          }))
          setPosts(mapped)
        })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDEA': return 'bg-slate-800/50 text-slate-200'
      case 'PLANNED': return 'bg-blue-500/20 text-blue-400'
      case 'WRITING': return 'bg-amber-500/20 text-amber-400'
      case 'DESIGN_REQUESTED': return 'bg-purple-500/20 text-purple-400'
      case 'READY': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'Carousel': return 'bg-pink-500/20 text-pink-400'
      case 'Reel': return 'bg-fuchsia-100 text-fuchsia-700'
      case 'Story': return 'bg-orange-500/20 text-orange-400'
      case 'Video': return 'bg-red-500/20 text-red-400'
      default: return 'bg-blue-500/20 text-blue-400'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'text-pink-600'
      case 'Facebook': return 'text-blue-400'
      case 'LinkedIn': return 'text-sky-700'
      default: return 'text-slate-300'
    }
  }

  const statusCounts = {
    idea: posts.filter(p => p.status === 'IDEA').length,
    planned: posts.filter(p => p.status === 'PLANNED').length,
    writing: posts.filter(p => p.status === 'WRITING').length,
    designRequested: posts.filter(p => p.status === 'DESIGN_REQUESTED').length,
    ready: posts.filter(p => p.status === 'READY').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Planner</h1>
            <p className="text-pink-200">Plan and organize upcoming posts</p>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-4 py-2 bg-white text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors"
            >
              + Plan Post
            </button>
          )}
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Ideas</p>
          <p className="text-3xl font-bold text-slate-200">{statusCounts.idea}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Planned</p>
          <p className="text-3xl font-bold text-blue-400">{statusCounts.planned}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Writing</p>
          <p className="text-3xl font-bold text-amber-400">{statusCounts.writing}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Design Requested</p>
          <p className="text-3xl font-bold text-purple-400">{statusCounts.designRequested}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Ready</p>
          <p className="text-3xl font-bold text-green-400">{statusCounts.ready}</p>
        </div>
      </div>

      {/* Posts List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Planned Posts</h2>
        </div>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-lg">No posts planned yet</p>
            <p className="text-sm mt-1">Click "Plan Post" to create your first content plan</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {posts.map(post => (
              <div key={post.id} className="p-4 hover:bg-slate-900/40">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{post.topic}</h3>
                    <p className="text-sm text-slate-400">
                      {post.client} • <span className={getPlatformColor(post.platform)}>{post.platform}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPostTypeColor(post.postType)}`}>
                      {post.postType}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(post.status)}`}>
                      {post.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-2 line-clamp-1">{post.caption}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {post.hashtags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-pink-600">{tag}</span>
                    ))}
                  </div>
                  {post.scheduledDate && (
                    <span className="text-xs text-slate-400">
                      Scheduled: {new Date(post.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Post Modal */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} title="Plan New Post" size="lg">
        <form onSubmit={handleSubmitPost}>
          <ModalBody>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Client *</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-pink-500"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Topic / Title *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
                placeholder="e.g., Summer Sale Announcement"
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Caption / Description</label>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                rows={3}
                placeholder="Describe the post content, key messages, call-to-action..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Post Type</label>
                <select
                  value={formData.postType}
                  onChange={(e) => setFormData({ ...formData, postType: e.target.value as PlannedPost['postType'] })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="Image Post">Image Post</option>
                  <option value="Carousel">Carousel</option>
                  <option value="Reel">Reel</option>
                  <option value="Story">Story</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="All">All Platforms</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-pink-500"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => setShowPlanModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.clientId || !formData.topic}
              className="px-6 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Post'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}