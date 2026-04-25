'use client'

import { useState, useEffect } from 'react'

interface PublishedPost {
  id: string
  client: { id: string; name: string }
  platform: string
  contentType: string
  caption: string | null
  postUrl: string
  postedAt: string
  likes: number
  comments: number
  shares: number
  saves: number
  engagementRate: number
}

export default function PublishedPostsPage() {
  const [posts, setPosts] = useState<PublishedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/social/posts?limit=50')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        // Filter to past posts (published)
        const now = new Date()
        const published = (data.posts || []).filter(
          (p: PublishedPost) => new Date(p.postedAt) <= now
        )
        setPosts(published)
      } catch (err) {
        console.error('Error fetching published posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM':
      case 'Instagram': return 'text-pink-400 bg-pink-500/10'
      case 'FACEBOOK':
      case 'Facebook': return 'text-blue-400 bg-blue-500/10'
      case 'LINKEDIN':
      case 'LinkedIn': return 'text-sky-700 bg-sky-50'
      case 'YOUTUBE':
      case 'YouTube': return 'text-red-400 bg-red-500/10'
      default: return 'text-slate-300 bg-slate-900/40'
    }
  }

  const formatPlatform = (p: string) =>
    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()

  const totalEngagement = posts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0)
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0)
  const totalComments = posts.reduce((sum, post) => sum + post.comments, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Published Posts</h1>
          <p className="text-pink-200">Track performance of published content</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-slate-400">Loading published posts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Published Posts</h1>
            <p className="text-pink-200">Track performance of published content</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-pink-200 text-sm">Posts This Week</p>
              <p className="text-3xl font-bold">{posts.length}</p>
            </div>
            <div className="text-right">
              <p className="text-pink-200 text-sm">Total Engagement</p>
              <p className="text-3xl font-bold">{(totalEngagement / 1000).toFixed(1)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Posts Published</p>
          <p className="text-3xl font-bold text-green-400">{posts.length}</p>
        </div>
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
          <p className="text-sm text-pink-600">Total Likes</p>
          <p className="text-3xl font-bold text-pink-700">{totalLikes.toLocaleString()}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Total Comments</p>
          <p className="text-3xl font-bold text-blue-400">{totalComments}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Avg Engagement</p>
          <p className="text-3xl font-bold text-purple-400">{posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0}</p>
        </div>
      </div>

      {/* Published Posts List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Recent Publications</h2>
        </div>
        <div className="divide-y divide-white/10">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No published posts found.</div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="p-4 hover:bg-slate-900/40">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{post.caption || post.contentType}</h3>
                    <p className="text-sm text-slate-400">
                      {post.client.name} • {post.contentType} • {new Date(post.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(post.platform)}`}>
                    {formatPlatform(post.platform)}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-pink-600">❤️</span>
                    <span className="text-slate-200 font-medium">{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-blue-400">💬</span>
                    <span className="text-slate-200 font-medium">{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-green-400">↗️</span>
                    <span className="text-slate-200 font-medium">{post.shares}</span>
                  </div>
                  {post.saves > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-purple-400">🔖</span>
                      <span className="text-slate-200 font-medium">{post.saves}</span>
                    </div>
                  )}
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-sm text-pink-600 hover:text-pink-800 font-medium"
                  >
                    View Post →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
