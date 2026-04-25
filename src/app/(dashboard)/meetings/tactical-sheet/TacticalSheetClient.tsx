'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Award,
  AlertTriangle,
  Plus,
  ExternalLink,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Save,
  ChevronDown,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Target
} from 'lucide-react'

interface Client {
  id: string
  name: string
  brandName: string | null
  platform: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  youtubeUrl: string | null
}

interface Post {
  id: string
  clientId: string
  postUrl: string
  platform: string
  contentType: string
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
  views: number | null
  engagementRate: number | null
  isTopPerformer: boolean
}

interface PageMetric {
  id: string
  clientId: string
  platform: string
  followers: number
  prevFollowers: number | null
  followerGrowth: number | null
  totalReach: number
  engagementRate: number | null
  postsPublished: number
  reelsPublished: number
  storiesPublished: number
}

interface GrowthScore {
  id: string
  performanceScore: number
  accountabilityScore: number
  disciplineScore: number
  learningScore: number
  appreciationScore: number
  escalationsCount: number
  escalationDeduction: number
  clientsLost: number
  churnDeduction: number
  finalScore: number
  scoreGrade: string | null
  tacticalDataSubmitted: boolean
  submittedOnTime: boolean
}

interface Props {
  userId: string
  userName: string
  department: string
  isManager: boolean
  monthName: string
  dayOfMonth: number
  isReminderPeriod: boolean
  clients: Client[]
  posts: Post[]
  pageMetrics: PageMetric[]
  growthScore: GrowthScore | null
  clientCapacity: number
  assignedClientsCount: number
  learningHours: number
  appreciationsCount: number
  escalationsCount: number
  clientsLost: number
}

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400' },
  { key: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-white' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-400' },
]

const CONTENT_TYPES = ['Static Post', 'Carousel', 'Reel', 'Story', 'Video', 'Blog', 'Article']

export default function TacticalSheetClient({
  userId,
  userName,
  department,
  isManager,
  monthName,
  dayOfMonth,
  isReminderPeriod,
  clients,
  posts,
  pageMetrics,
  growthScore,
  clientCapacity,
  assignedClientsCount,
  learningHours,
  appreciationsCount,
  escalationsCount,
  clientsLost,
}: Props) {
  const router = useRouter()
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [showAddPost, setShowAddPost] = useState<string | null>(null)
  const [newPost, setNewPost] = useState({
    postUrl: '',
    platform: 'instagram',
    contentType: 'Static Post',
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    reach: 0,
    impressions: 0,
    views: 0,
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'metrics' | 'score'>('posts')

  // Calculate accountability
  const accountabilityPct = clientCapacity > 0
    ? Math.min(100, Math.round((assignedClientsCount / clientCapacity) * 100))
    : 0

  // Calculate overall score preview (if not yet submitted)
  const performancePreview = posts.length > 0 ? 75 : 0 // Placeholder - would calculate from actual KPIs
  const accountabilityPreview = accountabilityPct
  const disciplinePreview = 85 // Would come from attendance data
  const learningPreview = Math.min(100, Math.round((learningHours / 4) * 100)) // 4 hours = 100%
  const appreciationPreview = Math.min(100, appreciationsCount * 20) // 5 appreciations = 100%

  const escalationDeduction = escalationsCount * 5
  const churnDeduction = clientsLost * 10

  const rawScore = Math.round(
    (performancePreview * 0.35) +
    (accountabilityPreview * 0.20) +
    (disciplinePreview * 0.15) +
    (learningPreview * 0.15) +
    (appreciationPreview * 0.15)
  )

  const finalScorePreview = Math.max(0, rawScore - escalationDeduction - churnDeduction)

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-emerald-400 bg-emerald-500/10' }
    if (score >= 80) return { grade: 'A', color: 'text-emerald-400 bg-emerald-500/10' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-400 bg-blue-500/10' }
    if (score >= 60) return { grade: 'C', color: 'text-amber-400 bg-amber-500/10' }
    if (score >= 50) return { grade: 'D', color: 'text-orange-400 bg-orange-500/10' }
    return { grade: 'F', color: 'text-red-400 bg-red-500/10' }
  }

  const scoreData = growthScore || {
    performanceScore: performancePreview,
    accountabilityScore: accountabilityPreview,
    disciplineScore: disciplinePreview,
    learningScore: learningPreview,
    appreciationScore: appreciationPreview,
    finalScore: finalScorePreview,
    scoreGrade: getGrade(finalScorePreview).grade,
    escalationsCount,
    escalationDeduction,
    clientsLost,
    churnDeduction,
  }

  const handleAddPost = async (clientId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/tactical/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPost,
          clientId,
          userId,
        }),
      })

      if (res.ok) {
        setShowAddPost(null)
        setNewPost({
          postUrl: '',
          platform: 'instagram',
          contentType: 'Static Post',
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          reach: 0,
          impressions: 0,
          views: 0,
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add post:', error)
    }
    setSaving(false)
  }

  const handleSubmitTactical = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/tactical/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to submit tactical data:', error)
    }
    setSaving(false)
  }

  const getClientPosts = (clientId: string) => posts.filter(p => p.clientId === clientId)
  const getClientMetrics = (clientId: string) => pageMetrics.filter(m => m.clientId === clientId)

  const getPlatformIcon = (platform: string) => {
    const p = PLATFORMS.find(pl => pl.key === platform.toLowerCase())
    return p ? <p.icon className={`w-4 h-4 ${p.color}`} /> : null
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tactical KPI Sheet</h1>
          <p className="text-slate-400 mt-1">{monthName} - {userName}</p>
        </div>
        {isReminderPeriod && !growthScore?.tacticalDataSubmitted && (
          <div className="bg-amber-500/10 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-amber-800">
              Submit your tactical data by the 5th to avoid penalties
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'posts'
              ? 'border-blue-600 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Work Summary
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'metrics'
              ? 'border-blue-600 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Page Metrics
        </button>
        <button
          onClick={() => setActiveTab('score')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'score'
              ? 'border-blue-600 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Growth Score
        </button>
      </div>

      {/* Work Summary Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {clients.length === 0 ? (
            <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400">No clients assigned to you yet.</p>
            </div>
          ) : (
            clients.map(client => {
              const clientPosts = getClientPosts(client.id)
              const isExpanded = expandedClient === client.id
              const totalLikes = clientPosts.reduce((sum, p) => sum + p.likes, 0)
              const totalReach = clientPosts.reduce((sum, p) => sum + p.reach, 0)
              const topPerformers = clientPosts.filter(p => p.isTopPerformer)

              return (
                <div key={client.id} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                  {/* Client Header */}
                  <button
                    onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                      <div className="text-left">
                        <h3 className="font-semibold text-white">
                          {client.brandName || client.name}
                        </h3>
                        <p className="text-xs text-slate-400">{client.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-white">{clientPosts.length}</p>
                        <p className="text-xs text-slate-400">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white">{totalLikes.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white">{totalReach.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Reach</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-emerald-600">{topPerformers.length}</p>
                        <p className="text-xs text-slate-400">Top Performers</p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {/* Social Links */}
                      <div className="px-4 py-2 bg-slate-900/40 flex items-center gap-3 text-xs">
                        {client.instagramUrl && (
                          <a href={client.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-600 hover:underline">
                            <Instagram className="w-4 h-4" /> Instagram
                          </a>
                        )}
                        {client.facebookUrl && (
                          <a href={client.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                            <Facebook className="w-4 h-4" /> Facebook
                          </a>
                        )}
                        {client.linkedinUrl && (
                          <a href={client.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                            <Linkedin className="w-4 h-4" /> LinkedIn
                          </a>
                        )}
                        {client.youtubeUrl && (
                          <a href={client.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-red-400 hover:underline">
                            <Youtube className="w-4 h-4" /> YouTube
                          </a>
                        )}
                      </div>

                      {/* Posts Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-800/50 text-xs">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-slate-300">Post URL</th>
                              <th className="px-3 py-2 text-center font-medium text-slate-300">Platform</th>
                              <th className="px-3 py-2 text-center font-medium text-slate-300">Type</th>
                              <th className="px-3 py-2 text-center font-medium text-slate-300">
                                <Heart className="w-3 h-3 inline" />
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-slate-300">
                                <MessageCircle className="w-3 h-3 inline" />
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-slate-300">
                                <Share2 className="w-3 h-3 inline" />
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-slate-300">
                                <Bookmark className="w-3 h-3 inline" />
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-slate-300">
                                <Eye className="w-3 h-3 inline" /> Reach
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-slate-300">ER%</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {clientPosts.map(post => (
                              <tr key={post.id} className={post.isTopPerformer ? 'bg-emerald-500/10' : ''}>
                                <td className="px-3 py-2">
                                  <a
                                    href={post.postUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline flex items-center gap-1 max-w-[200px] truncate"
                                  >
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{post.postUrl}</span>
                                  </a>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {getPlatformIcon(post.platform)}
                                </td>
                                <td className="px-3 py-2 text-center text-slate-300">{post.contentType}</td>
                                <td className="px-3 py-2 text-center font-medium">{post.likes.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center font-medium">{post.comments.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center font-medium">{post.shares.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center font-medium">{post.saves.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center font-medium">{post.reach.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`font-medium ${
                                    (post.engagementRate || 0) >= 5 ? 'text-emerald-600' :
                                    (post.engagementRate || 0) >= 3 ? 'text-blue-400' :
                                    'text-slate-300'
                                  }`}>
                                    {post.engagementRate?.toFixed(2) || '-'}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {clientPosts.length === 0 && (
                              <tr>
                                <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                                  No posts added yet for this month
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Post Form */}
                      {showAddPost === client.id ? (
                        <div className="p-4 bg-blue-500/10 border-t border-blue-100">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <input
                              type="url"
                              placeholder="Post URL"
                              value={newPost.postUrl}
                              onChange={e => setNewPost({ ...newPost, postUrl: e.target.value })}
                              className="col-span-2 px-3 py-2 border border-white/20 rounded-lg text-sm"
                            />
                            <select
                              value={newPost.platform}
                              onChange={e => setNewPost({ ...newPost, platform: e.target.value })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            >
                              {PLATFORMS.map(p => (
                                <option key={p.key} value={p.key}>{p.label}</option>
                              ))}
                            </select>
                            <select
                              value={newPost.contentType}
                              onChange={e => setNewPost({ ...newPost, contentType: e.target.value })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            >
                              {CONTENT_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-3">
                            <input
                              type="number"
                              placeholder="Likes"
                              value={newPost.likes || ''}
                              onChange={e => setNewPost({ ...newPost, likes: parseInt(e.target.value) || 0 })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Comments"
                              value={newPost.comments || ''}
                              onChange={e => setNewPost({ ...newPost, comments: parseInt(e.target.value) || 0 })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Shares"
                              value={newPost.shares || ''}
                              onChange={e => setNewPost({ ...newPost, shares: parseInt(e.target.value) || 0 })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Saves"
                              value={newPost.saves || ''}
                              onChange={e => setNewPost({ ...newPost, saves: parseInt(e.target.value) || 0 })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Reach"
                              value={newPost.reach || ''}
                              onChange={e => setNewPost({ ...newPost, reach: parseInt(e.target.value) || 0 })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Impressions"
                              value={newPost.impressions || ''}
                              onChange={e => setNewPost({ ...newPost, impressions: parseInt(e.target.value) || 0 })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Views"
                              value={newPost.views || ''}
                              onChange={e => setNewPost({ ...newPost, views: parseInt(e.target.value) || 0 })}
                              className="px-3 py-2 border border-white/20 rounded-lg text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddPost(client.id)}
                              disabled={saving || !newPost.postUrl}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Add Post'}
                            </button>
                            <button
                              onClick={() => setShowAddPost(null)}
                              className="px-4 py-2 bg-white/10 text-slate-200 rounded-lg text-sm font-medium hover:bg-white/20"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 border-t border-white/10">
                          <button
                            onClick={() => setShowAddPost(client.id)}
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-400 font-medium"
                          >
                            <Plus className="w-4 h-4" /> Add Post
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Page Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/40 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Platform</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Followers</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Growth</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Total Reach</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Eng. Rate</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Posts</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Reels</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Stories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {clients.map(client => {
                    const metrics = getClientMetrics(client.id)
                    if (metrics.length === 0) {
                      return (
                        <tr key={client.id}>
                          <td className="px-4 py-3 font-medium text-white">{client.brandName || client.name}</td>
                          <td colSpan={8} className="px-4 py-3 text-slate-400 italic">No metrics added</td>
                        </tr>
                      )
                    }
                    return metrics.map((m, idx) => (
                      <tr key={m.id}>
                        {idx === 0 && (
                          <td rowSpan={metrics.length} className="px-4 py-3 font-medium text-white border-r border-white/5">
                            {client.brandName || client.name}
                          </td>
                        )}
                        <td className="px-4 py-3">{getPlatformIcon(m.platform)}</td>
                        <td className="px-4 py-3 text-center font-medium">{m.followers.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${
                            (m.followerGrowth || 0) > 0 ? 'text-emerald-600' :
                            (m.followerGrowth || 0) < 0 ? 'text-red-400' :
                            'text-slate-300'
                          }`}>
                            {(m.followerGrowth || 0) > 0 ? '+' : ''}{m.followerGrowth?.toFixed(1) || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{m.totalReach.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${
                            (m.engagementRate || 0) >= 5 ? 'text-emerald-600' :
                            (m.engagementRate || 0) >= 3 ? 'text-blue-400' :
                            'text-slate-300'
                          }`}>
                            {m.engagementRate?.toFixed(2) || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{m.postsPublished}</td>
                        <td className="px-4 py-3 text-center">{m.reelsPublished}</td>
                        <td className="px-4 py-3 text-center">{m.storiesPublished}</td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Growth Score Tab */}
      {activeTab === 'score' && (
        <div className="space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="col-span-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm opacity-80">Final Growth Score</span>
                <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                  getGrade(scoreData.finalScore).color
                }`}>
                  {scoreData.scoreGrade}
                </span>
              </div>
              <p className="text-5xl font-bold">{scoreData.finalScore}</p>
              <p className="text-sm opacity-80 mt-2">out of 100</p>
            </div>

            {/* Component Scores */}
            <ScoreCard
              icon={BarChart3}
              label="Performance"
              score={scoreData.performanceScore}
              weight="35%"
              color="text-blue-400"
            />
            <ScoreCard
              icon={Users}
              label="Accountability"
              score={scoreData.accountabilityScore}
              weight="20%"
              color="text-purple-400"
            />
            <ScoreCard
              icon={Clock}
              label="Discipline"
              score={scoreData.disciplineScore}
              weight="15%"
              color="text-amber-400"
            />
            <ScoreCard
              icon={Target}
              label="Learning"
              score={scoreData.learningScore}
              weight="15%"
              color="text-emerald-600"
            />
          </div>

          {/* Appreciation & Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-slate-300">Appreciation Score</span>
              </div>
              <p className="text-2xl font-bold text-white">{scoreData.appreciationScore}</p>
              <p className="text-xs text-slate-400">{appreciationsCount} recognitions this month (15% weight)</p>
            </div>

            <div className="glass-card rounded-xl border border-red-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-slate-300">Escalation Penalty</span>
              </div>
              <p className="text-2xl font-bold text-red-400">-{scoreData.escalationDeduction}</p>
              <p className="text-xs text-slate-400">{scoreData.escalationsCount} escalation(s) x 5 points</p>
            </div>

            <div className="glass-card rounded-xl border border-red-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
                <span className="text-sm font-medium text-slate-300">Churn Penalty</span>
              </div>
              <p className="text-2xl font-bold text-red-400">-{scoreData.churnDeduction}</p>
              <p className="text-xs text-slate-400">{scoreData.clientsLost} client(s) lost x 10 points</p>
            </div>
          </div>

          {/* Scoring Formula */}
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Scoring Formula</h3>
            <div className="text-xs text-slate-400 space-y-1 font-mono">
              <p>Raw Score = (Performance x 0.35) + (Accountability x 0.20) + (Discipline x 0.15) + (Learning x 0.15) + (Appreciation x 0.15)</p>
              <p>Final Score = Raw Score - (Escalations x 5) - (Clients Lost x 10)</p>
              <p className="pt-2 text-slate-300">
                = ({scoreData.performanceScore} x 0.35) + ({scoreData.accountabilityScore} x 0.20) + ({scoreData.disciplineScore} x 0.15) + ({scoreData.learningScore} x 0.15) + ({scoreData.appreciationScore} x 0.15) - {scoreData.escalationDeduction} - {scoreData.churnDeduction}
              </p>
              <p className="font-bold text-white">= {scoreData.finalScore}</p>
            </div>
          </div>

          {/* Submit Button */}
          {!growthScore?.tacticalDataSubmitted && (
            <div className="flex justify-end">
              <button
                onClick={handleSubmitTactical}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Submitting...' : 'Submit Tactical Data'}
              </button>
            </div>
          )}

          {growthScore?.tacticalDataSubmitted && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Save className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-800">Tactical data submitted</p>
                <p className="text-sm text-emerald-600">
                  {growthScore.submittedOnTime ? 'Submitted on time' : 'Submitted late (-5 penalty applied)'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScoreCard({
  icon: Icon,
  label,
  score,
  weight,
  color
}: {
  icon: React.ComponentType<{ className?: string }>,
  label: string,
  score: number,
  weight: string,
  color: string
}) {
  return (
    <div className="glass-card rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{score}</p>
      <p className="text-xs text-slate-400">{weight} weight</p>
    </div>
  )
}
