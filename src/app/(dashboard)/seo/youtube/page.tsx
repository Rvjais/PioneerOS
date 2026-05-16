'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { toast } from 'sonner'

interface YouTubeVideo {
  id: string
  title: string
  client: string
  clientId?: string
  videoUrl?: string
  thumbnailUrl?: string
  channelName?: string
  views: number
  likes: number
  comments: number
  subscribers: number
  duration?: string
  publishedAt: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'PUBLISHED'
  priority: string
  assignedTo: string
  assignedToId?: string
  createdAt: string
  updatedAt: string
}

interface Client {
  id: string
  name: string
}

export default function YouTubeSEOPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    videoTitle: '',
    videoUrl: '',
    channelName: ''
  })

  useEffect(() => {
    fetchVideos()
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE&limit=100')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch {
      // silently fail
    }
  }

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/seo/youtube')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setVideos(data.videos || [])
    } catch (err) {
      console.error('Failed to fetch YouTube videos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create video')
      toast.success('YouTube video tracked successfully')
      setShowVideoModal(false)
      setFormData({ clientId: '', videoTitle: '', videoUrl: '', channelName: '' })
      fetchVideos()
    } catch (err: any) {
      toast.error(err.message || 'Error tracking video')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (video: YouTubeVideo, newStatus: string) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/youtube', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: video.id, status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success('Status updated successfully')
      fetchVideos()
    } catch (err: any) {
      toast.error(err.message || 'Error updating status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (video: YouTubeVideo) => {
    setSelectedVideo(video)
    setShowDetailsModal(true)
  }

  const filteredVideos = filter === 'all' ? videos : videos.filter(v => v.status === filter)

  const totalVideos = videos.length
  const todoCount = videos.filter(v => v.status === 'TODO').length
  const inProgressCount = videos.filter(v => v.status === 'IN_PROGRESS').length
  const publishedCount = videos.filter(v => v.status === 'PUBLISHED' || v.status === 'DONE').length
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)

  const clientGroups = videos.reduce((acc, v) => {
    const name = v.client || 'Unknown'
    if (!acc[name]) acc[name] = { total: 0, published: 0, views: 0 }
    acc[name].total++
    if (v.status === 'PUBLISHED' || v.status === 'DONE') acc[name].published++
    acc[name].views += v.views
    return acc
  }, {} as Record<string, { total: number; published: number; views: number }>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400'
      case 'DONE': return 'bg-green-500/20 text-green-400'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'TODO': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/20 text-red-400'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">YouTube SEO</h1>
            <p className="text-red-200">Video optimization & channel performance</p>
          </div>
          <button
            onClick={() => setShowVideoModal(true)}
            className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            + Add Video
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Videos</p>
          <p className="text-3xl font-bold text-slate-200">{totalVideos}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">To Do</p>
          <p className="text-3xl font-bold text-red-400">{todoCount}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{inProgressCount}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Published</p>
          <p className="text-3xl font-bold text-purple-400">{publishedCount}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Total Views</p>
          <p className="text-3xl font-bold text-green-400">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'TODO', 'IN_PROGRESS', 'REVIEW', 'PUBLISHED', 'DONE'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-red-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-red-300'
            }`}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Content by Client */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Content Activity by Client</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TOTAL VIDEOS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PUBLISHED</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TOTAL VIEWS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(clientGroups).map(([client, stats]) => (
              <tr key={client} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-3 px-4">
                  <p className="font-medium text-white">{client}</p>
                </td>
                <td className="py-3 px-4 text-center text-slate-300">{stats.total}</td>
                <td className="py-3 px-4 text-center text-green-400 font-semibold">{stats.published}</td>
                <td className="py-3 px-4 text-center text-red-400 font-semibold">{stats.views.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      const video = videos.find(v => v.client === client)
                      if (video) handleViewDetails(video)
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {Object.keys(clientGroups).length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No YouTube videos tracked yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Videos */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Videos</h2>
          <span className="text-sm text-slate-400">Showing {filteredVideos.length} videos</span>
        </div>
        <div className="divide-y divide-white/10">
          {filteredVideos.slice(0, 20).map(video => (
            <div key={video.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-white">{video.title}</h3>
                  <p className="text-sm text-slate-400">
                    {video.client} {video.channelName ? `• ${video.channelName}` : ''}
                    {video.publishedAt ? ` • ${new Date(video.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(video.priority)}`}>
                    {video.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(video.status)}`}>
                    {video.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{video.views.toLocaleString()} views</span>
                <span>{video.likes.toLocaleString()} likes</span>
                <span>{video.comments.toLocaleString()} comments</span>
              </div>
            </div>
          ))}
          {filteredVideos.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No videos found
            </div>
          )}
        </div>
      </div>

      {/* YouTube Best Practices */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">YouTube SEO Best Practices</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Video Frequency</p>
            <ul className="space-y-1">
              <li>• 8-12 videos/month</li>
              <li>• Mix of Shorts & Long</li>
              <li>• Consistent schedule</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Optimization</p>
            <ul className="space-y-1">
              <li>• Keyword in title</li>
              <li>• Detailed description</li>
              <li>• Relevant tags</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Thumbnails</p>
            <ul className="space-y-1">
              <li>• Custom thumbnails</li>
              <li>• High contrast text</li>
              <li>• Faces perform well</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Engagement</p>
            <ul className="space-y-1">
              <li>• Reply to comments</li>
              <li>• Community posts</li>
              <li>• End screens & cards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Video Modal */}
      <Modal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} title="Add YouTube Video" size="md">
        <form onSubmit={handleVideoSubmit}>
          <ModalBody>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Client *</label>
              <select
                required
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
              >
                <option value="">Select a client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Video Title *</label>
              <input
                required
                type="text"
                value={formData.videoTitle}
                onChange={e => setFormData({...formData, videoTitle: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                placeholder="e.g. Q3 Company Overview"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">YouTube URL (optional)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Channel Name (optional)</label>
              <input
                type="text"
                value={formData.channelName}
                onChange={e => setFormData({...formData, channelName: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200"
                placeholder="e.g. Client Brand Channel"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setShowVideoModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Video'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Video Details" size="lg">
        <ModalBody>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-slate-400">Title</p>
                  <p className="font-medium text-white">{selectedVideo.title}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="font-medium text-white">{selectedVideo.client}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Channel</p>
                  <p className="font-medium text-white">{selectedVideo.channelName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedVideo.status)}`}>
                    {selectedVideo.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Priority</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPriorityColor(selectedVideo.priority)}`}>
                    {selectedVideo.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Views</p>
                  <p className="font-medium text-red-400">{selectedVideo.views.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Likes</p>
                  <p className="font-medium text-white">{selectedVideo.likes.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Comments</p>
                  <p className="font-medium text-white">{selectedVideo.comments.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Subscribers</p>
                  <p className="font-medium text-white">{selectedVideo.subscribers.toLocaleString()}</p>
                </div>
              </div>
              {selectedVideo.videoUrl && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  <p className="text-sm text-slate-400 mb-1">Video URL</p>
                  <a href={selectedVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 break-all">
                    {selectedVideo.videoUrl}
                  </a>
                </div>
              )}
              <div className="border-t border-white/10 pt-4 mt-4 flex gap-2">
                {selectedVideo.status === 'TODO' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedVideo, 'IN_PROGRESS'); setShowDetailsModal(false) }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Start Working
                  </button>
                )}
                {selectedVideo.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedVideo, 'REVIEW'); setShowDetailsModal(false) }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    Submit for Review
                  </button>
                )}
                {selectedVideo.status === 'REVIEW' && (
                  <button
                    onClick={() => { handleStatusUpdate(selectedVideo, 'PUBLISHED'); setShowDetailsModal(false) }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark as Published
                  </button>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Close</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}