'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface ScheduledPost {
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
  user: { id: string; firstName: string; lastName: string | null }
}

export default function ScheduledPostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)

  const userRole = (session?.user?.role as string) || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/social/posts?contentType=&limit=50')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        // Filter to future posts (scheduled)
        const now = new Date()
        const scheduled = (data.posts || []).filter(
          (p: ScheduledPost) => new Date(p.postedAt) > now
        )
        setPosts(scheduled)
      } catch (err) {
        console.error('Error fetching scheduled posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/20 text-blue-400'
      case 'POSTED': return 'bg-green-500/20 text-green-400'
      case 'FAILED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

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

  // Group by date
  const groupedPosts: Record<string, ScheduledPost[]> = {}
  posts.forEach(post => {
    const date = new Date(post.postedAt).toISOString().split('T')[0]
    if (!groupedPosts[date]) {
      groupedPosts[date] = []
    }
    groupedPosts[date].push(post)
  })

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const todayPosts = posts.filter(p => new Date(p.postedAt).toISOString().split('T')[0] === today)
  const tomorrowPosts = posts.filter(p => new Date(p.postedAt).toISOString().split('T')[0] === tomorrow)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Scheduled Posts</h1>
          <p className="text-pink-200">Content ready for publishing</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-slate-400">Loading scheduled posts...</span>
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
            <h1 className="text-2xl font-bold">Scheduled Posts</h1>
            <p className="text-pink-200">Content ready for publishing</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-pink-200 text-sm">Scheduled Today</p>
              <p className="text-3xl font-bold">{todayPosts.length}</p>
            </div>
            <div className="text-right">
              <p className="text-pink-200 text-sm">Tomorrow</p>
              <p className="text-3xl font-bold">{tomorrowPosts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Total Scheduled</p>
          <p className="text-3xl font-bold text-blue-400">{posts.length}</p>
        </div>
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
          <p className="text-sm text-pink-600">Instagram</p>
          <p className="text-3xl font-bold text-pink-700">{posts.filter(p => p.platform === 'INSTAGRAM').length}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Facebook</p>
          <p className="text-3xl font-bold text-blue-400">{posts.filter(p => p.platform === 'FACEBOOK').length}</p>
        </div>
        <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
          <p className="text-sm text-sky-600">LinkedIn</p>
          <p className="text-3xl font-bold text-sky-700">{posts.filter(p => p.platform === 'LINKEDIN').length}</p>
        </div>
      </div>

      {/* Scheduled Posts by Date */}
      {posts.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center text-slate-400">
          No scheduled posts found.
        </div>
      ) : (
        Object.entries(groupedPosts).sort().map(([date, datePosts]) => (
          <div key={date} className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/40">
              <h2 className="font-semibold text-white">
                {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
            </div>
            <div className="divide-y divide-white/10">
              {datePosts.sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()).map(post => {
                const time = new Date(post.postedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
                return (
                  <div key={post.id} className="p-4 hover:bg-slate-900/40">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-lg font-mono text-slate-300 w-14">{time}</div>
                        <div>
                          <h3 className="font-medium text-white">{post.caption || post.contentType}</h3>
                          <p className="text-sm text-slate-400">{post.client.name} • {post.contentType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(post.platform)}`}>
                          {formatPlatform(post.platform)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor('SCHEDULED')}`}>
                          SCHEDULED
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 ml-18">
                      {canEdit && (
                        <>
                          <button className="px-3 py-1.5 text-sm font-medium text-pink-400 bg-pink-500/10 rounded-lg hover:bg-pink-500/20">
                            Edit
                          </button>
                          <button className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20">
                            Reschedule
                          </button>
                        </>
                      )}
                      <button className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800/50">
                        Preview
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
