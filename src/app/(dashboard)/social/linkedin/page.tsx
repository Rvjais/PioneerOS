'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface LinkedInProfile {
  id: string
  client: string
  profileName: string
  profileType: 'PERSONAL' | 'COMPANY'
  followers: number
  connections: number
  postsThisMonth: number
  avgReach: number
  avgEngagement: number
  followerGrowth: number
  status: 'ACTIVE' | 'GROWING' | 'NEEDS_CONTENT'
}

interface LinkedInPost {
  id: string
  client: string
  content: string
  proofLink: string
  reach: number
  engagement: number
  publishedDate: string
  month: string
}

export default function LinkedInManagementPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [profiles, setProfiles] = useState<LinkedInProfile[]>([])
  const [posts, setPosts] = useState<LinkedInPost[]>([])
  const [loading, setLoading] = useState(true)
  const [monthFilter, setMonthFilter] = useState<string>('MAR')

  useEffect(() => {
    Promise.all([
      fetch('/api/social/metrics?platform=LINKEDIN').then(res => res.json()),
      fetch('/api/social/posts?platform=LINKEDIN').then(res => res.json()),
    ])
      .then(([metricsResult, postsResult]) => {
        const metricsItems = metricsResult.data || metricsResult || []
        const mappedProfiles: LinkedInProfile[] = metricsItems.map((item: any) => ({
          id: item.id,
          client: item.client?.name || item.client || '',
          profileName: item.profileName || item.name || '',
          profileType: item.profileType || 'PERSONAL',
          followers: item.followers || 0,
          connections: item.connections || 0,
          postsThisMonth: item.postsThisMonth || item.postCount || 0,
          avgReach: item.avgReach || item.reach || 0,
          avgEngagement: item.avgEngagement || item.engagement || 0,
          followerGrowth: item.followerGrowth || item.growth || 0,
          status: item.status || 'ACTIVE',
        }))
        setProfiles(mappedProfiles)

        const postItems = postsResult.data || postsResult || []
        const mappedPosts: LinkedInPost[] = postItems.map((item: any) => {
          const dateStr = item.publishedDate || item.scheduledDate || item.createdAt || ''
          const date = dateStr ? new Date(dateStr) : new Date()
          const monthStr = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
          return {
            id: item.id,
            client: item.client?.name || item.client || '',
            content: item.content || item.caption || item.title || '',
            proofLink: item.proofLink || item.postLink || item.url || '',
            reach: item.reach || 0,
            engagement: item.engagement || 0,
            publishedDate: dateStr,
            month: monthStr,
          }
        })
        setPosts(mappedPosts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalFollowers = profiles.reduce((sum, p) => sum + p.followers, 0)
  const totalPosts = profiles.reduce((sum, p) => sum + p.postsThisMonth, 0)
  const totalGrowth = profiles.reduce((sum, p) => sum + p.followerGrowth, 0)
  const avgEngagement = profiles.length > 0 ? Math.round(profiles.reduce((sum, p) => sum + p.avgEngagement, 0) / profiles.length) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400'
      case 'GROWING': return 'bg-blue-500/20 text-blue-400'
      case 'NEEDS_CONTENT': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getProfileTypeColor = (type: string) => {
    switch (type) {
      case 'PERSONAL': return 'bg-blue-500/20 text-blue-400'
      case 'COMPANY': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">LinkedIn Management</h1>
            <p className="text-blue-200">Professional profile & content management</p>
          </div>
          {canEdit && (
            <button className="px-4 py-2 glass-card text-blue-400 rounded-lg font-medium hover:bg-blue-500/10">
              + Schedule Post
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Total Followers</p>
          <p className="text-3xl font-bold text-blue-400">{(totalFollowers / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Posts This Month</p>
          <p className="text-3xl font-bold text-purple-400">{totalPosts}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Follower Growth</p>
          <p className="text-3xl font-bold text-green-400">+{totalGrowth}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Avg Engagement</p>
          <p className="text-3xl font-bold text-amber-400">{avgEngagement}</p>
        </div>
      </div>

      {/* Profiles */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">LinkedIn Profiles</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT / PROFILE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TYPE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">FOLLOWERS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">POSTS/MONTH</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">AVG REACH</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">AVG ENGAGEMENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">GROWTH</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-3 px-4">
                  <p className="font-medium text-white">{profile.client}</p>
                  <p className="text-sm text-slate-400">{profile.profileName}</p>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getProfileTypeColor(profile.profileType)}`}>
                    {profile.profileType}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-slate-300">{profile.followers.toLocaleString()}</td>
                <td className="py-3 px-4 text-center text-purple-400 font-semibold">{profile.postsThisMonth}</td>
                <td className="py-3 px-4 text-center text-blue-400 font-semibold">{profile.avgReach.toLocaleString()}</td>
                <td className="py-3 px-4 text-center text-amber-400 font-semibold">{profile.avgEngagement}</td>
                <td className="py-3 px-4 text-center text-green-400 font-semibold">+{profile.followerGrowth}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(profile.status)}`}>
                    {profile.status.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Month Filter */}
      <div className="flex gap-2">
        {Array.from(new Set(posts.map(p => p.month))).sort().map(month => (
          <button
            key={month}
            onClick={() => setMonthFilter(month)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              monthFilter === month
                ? 'bg-blue-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-blue-300'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Recent LinkedIn Posts</h2>
        </div>
        <div className="divide-y divide-white/10">
          {posts.filter(p => p.month === monthFilter).map(post => (
            <div key={post.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{post.client}</h3>
                  <p className="text-sm text-slate-400">{new Date(post.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-3 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-blue-400 font-semibold">{post.reach.toLocaleString()} reach</span>
                <span className="text-amber-400 font-semibold">{post.engagement} engagement</span>
                <a href={post.proofLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400">
                  View Post →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LinkedIn Tips */}
      <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
        <h3 className="font-semibold text-blue-800 mb-3">LinkedIn Best Practices</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-blue-400">
          <div>
            <p className="font-medium mb-1">Posting Frequency</p>
            <ul className="space-y-1">
              <li>• 3-5 posts per week</li>
              <li>• Best times: 8-10 AM</li>
              <li>• Tue-Thu perform best</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Content Types</p>
            <ul className="space-y-1">
              <li>• Personal stories</li>
              <li>• Industry insights</li>
              <li>• Carousel documents</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Engagement</p>
            <ul className="space-y-1">
              <li>• Reply to comments</li>
              <li>• Tag relevant people</li>
              <li>• Use 3-5 hashtags</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Growth</p>
            <ul className="space-y-1">
              <li>• Connect daily</li>
              <li>• Comment on others</li>
              <li>• Join relevant groups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
