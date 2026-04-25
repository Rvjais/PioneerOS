'use client'

import { useState, useEffect } from 'react'

interface PostEngagement {
  id: string
  client: { id: string; name: string }
  platform: string
  contentType: string
  caption: string | null
  postedAt: string
  likes: number
  comments: number
  shares: number
  saves: number
  engagementRate: number
}

interface ClientEngagement {
  client: string
  totalEngagement: number
  avgRate: number
  posts: number
}

export default function EngagementAnalyticsPage() {
  const [posts, setPosts] = useState<PostEngagement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/social/posts?limit=100')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        // Only published posts (past dates)
        const now = new Date()
        const published = (data.posts || []).filter(
          (p: PostEngagement) => new Date(p.postedAt) <= now
        )
        setPosts(published)
      } catch (err) {
        console.error('Error fetching engagement data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares + p.saves, 0)
  const avgEngagementRate = posts.length > 0 ? (posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length).toFixed(1) : '0.0'

  // Build engagement by client
  const clientMap: Record<string, { totalEngagement: number; totalRate: number; count: number }> = {}
  posts.forEach(p => {
    const name = p.client?.name || 'Unknown'
    if (!clientMap[name]) {
      clientMap[name] = { totalEngagement: 0, totalRate: 0, count: 0 }
    }
    clientMap[name].totalEngagement += p.likes + p.comments + p.shares + p.saves
    clientMap[name].totalRate += p.engagementRate
    clientMap[name].count += 1
  })
  const engagementByClient: ClientEngagement[] = Object.entries(clientMap)
    .map(([client, data]) => ({
      client,
      totalEngagement: data.totalEngagement,
      avgRate: parseFloat((data.totalRate / data.count).toFixed(1)),
      posts: data.count,
    }))
    .sort((a, b) => b.totalEngagement - a.totalEngagement)

  const maxClientEngagement = engagementByClient.length > 0 ? engagementByClient[0].totalEngagement : 1

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM':
      case 'Instagram': return 'text-pink-600'
      case 'FACEBOOK':
      case 'Facebook': return 'text-blue-400'
      case 'LINKEDIN':
      case 'LinkedIn': return 'text-sky-700'
      default: return 'text-slate-300'
    }
  }

  const formatPlatform = (p: string) =>
    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Engagement Analytics</h1>
          <p className="text-pink-200">Track likes, comments, shares and saves</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-slate-400">Loading engagement data...</span>
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
            <h1 className="text-2xl font-bold">Engagement Analytics</h1>
            <p className="text-pink-200">Track likes, comments, shares and saves</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-pink-200 text-sm">Total Engagement</p>
              <p className="text-3xl font-bold">{(totalEngagement / 1000).toFixed(1)}K</p>
            </div>
            <div className="text-right">
              <p className="text-pink-200 text-sm">Avg Rate</p>
              <p className="text-3xl font-bold">{avgEngagementRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
          <p className="text-sm text-pink-600">Total Likes</p>
          <p className="text-3xl font-bold text-pink-700">{posts.reduce((sum, p) => sum + p.likes, 0).toLocaleString()}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Total Comments</p>
          <p className="text-3xl font-bold text-blue-400">{posts.reduce((sum, p) => sum + p.comments, 0)}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Total Shares</p>
          <p className="text-3xl font-bold text-green-400">{posts.reduce((sum, p) => sum + p.shares, 0)}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Total Saves</p>
          <p className="text-3xl font-bold text-purple-400">{posts.reduce((sum, p) => sum + p.saves, 0)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Posts */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Top Performing Posts</h2>
          </div>
          <div className="divide-y divide-white/10">
            {posts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No engagement data found.</div>
            ) : (
              [...posts].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 5).map((post, idx) => (
                <div key={post.id} className="p-4 hover:bg-slate-900/40">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-lg font-bold text-pink-600">#{idx + 1}</span>
                      <div>
                        <h3 className="font-medium text-white">{post.caption || post.contentType}</h3>
                        <p className="text-sm text-slate-400">
                          {post.client.name} • <span className={getPlatformColor(post.platform)}>{formatPlatform(post.platform)}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-400">{post.engagementRate}%</span>
                  </div>
                  <div className="flex items-center gap-4 ml-8 text-sm text-slate-400">
                    <span>❤️ {post.likes.toLocaleString()}</span>
                    <span>💬 {post.comments}</span>
                    <span>↗️ {post.shares}</span>
                    {post.saves > 0 && <span>🔖 {post.saves}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Engagement by Client */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Engagement by Client</h2>
          </div>
          <div className="divide-y divide-white/10">
            {engagementByClient.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No client engagement data found.</div>
            ) : (
              engagementByClient.map(client => (
                <div key={client.client} className="p-4 hover:bg-slate-900/40">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{client.client}</h3>
                    <span className="text-sm font-medium text-green-400">{client.avgRate}% avg</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{ width: `${(client.totalEngagement / maxClientEngagement) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-300 w-16 text-right">{client.totalEngagement.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-400">{client.posts} posts this week</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
