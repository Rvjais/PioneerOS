'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Calendar, FileText, Palette, Clock, Send, CheckCircle, TrendingUp, Heart } from 'lucide-react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface DashboardData {
  myWork: { postsDueToday: number; designsPending: number; postsScheduled: number }
  approvals: { designsPendingApproval: number; clientApprovalPending: number }
  publishing: { scheduledToday: number; publishedThisWeek: number }
  performance: {
    engagementThisWeek: number
    topPost: { client: string; platform: string; engagement: number; type: string }
  }
  recentPosts: { client: string; platform: string; type: string; status: string; engagement: number }[]
}

export default function SocialDashboardPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/social/dashboard')
      .then(res => res.json())
      .then(result => setDashboardData(result.data || result))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const quickActions = [
    { label: 'Create Post', icon: FileText, color: 'bg-pink-500/20 text-pink-400', href: '/social/content/planner' },
    { label: 'Creative Request', icon: Palette, color: 'bg-fuchsia-500/20 text-fuchsia-400', href: '/social/content/creative-requests' },
    { label: 'Schedule Post', icon: Clock, color: 'bg-purple-500/20 text-purple-400', href: '/social/publishing/scheduled' },
    { label: 'View Calendar', icon: Calendar, color: 'bg-violet-500/20 text-violet-400', href: '/social/calendar' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  const myWork = dashboardData?.myWork || { postsDueToday: 0, designsPending: 0, postsScheduled: 0 }
  const approvals = dashboardData?.approvals || { designsPendingApproval: 0, clientApprovalPending: 0 }
  const publishing = dashboardData?.publishing || { scheduledToday: 0, publishedThisWeek: 0 }
  const performance = dashboardData?.performance || {
    engagementThisWeek: 0,
    topPost: { client: '-', platform: '-', engagement: 0, type: '-' },
  }
  const recentPosts = dashboardData?.recentPosts || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400'
      case 'SCHEDULED': return 'bg-blue-500/20 text-blue-400'
      case 'IN_REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'DRAFT': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'text-pink-600'
      case 'Facebook': return 'text-blue-400'
      case 'LinkedIn': return 'text-sky-700'
      case 'Twitter/X': return 'text-white'
      case 'YouTube': return 'text-red-400'
      default: return 'text-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Social Media Dashboard</h1>
            <p className="text-pink-200">Welcome back! Here&apos;s your daily overview</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-pink-200 text-sm">Posts This Week</p>
              <p className="text-3xl font-bold">{publishing.publishedThisWeek}</p>
            </div>
            <div className="text-right">
              <p className="text-pink-200 text-sm">Engagement</p>
              <p className="text-3xl font-bold">{(performance.engagementThisWeek / 1000).toFixed(1)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {canEdit && (
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 glass-card rounded-xl border border-white/10 hover:border-pink-300 hover:shadow-none transition-all"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-200">{action.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* My Work */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-pink-600" />
            My Work
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-300">Posts Due Today</span>
              <span className="font-semibold text-pink-600">{myWork.postsDueToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-300">Designs Pending</span>
              <span className="font-semibold text-amber-400">{myWork.designsPending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-300">Posts Scheduled</span>
              <span className="font-semibold text-green-400">{myWork.postsScheduled}</span>
            </div>
          </div>
        </div>

        {/* Approvals */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-pink-600" />
            Approvals
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-300">Design Approval</span>
              <span className="font-semibold text-amber-400">{approvals.designsPendingApproval}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-300">Client Approval</span>
              <span className="font-semibold text-orange-600">{approvals.clientApprovalPending}</span>
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-pink-600" />
            Publishing
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-300">Scheduled Today</span>
              <span className="font-semibold text-blue-400">{publishing.scheduledToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-300">Published This Week</span>
              <span className="font-semibold text-green-400">{publishing.publishedThisWeek}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Recent Posts</h2>
          </div>
          <div className="divide-y divide-white/10">
            {recentPosts.map((post, idx) => (
              <div key={`post-${post.client}-${post.platform}-${idx}`} className="p-4 hover:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-white">{post.client}</p>
                    <p className={`text-sm ${getPlatformColor(post.platform)}`}>{post.platform} • {post.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(post.status)}`}>
                    {post.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {post.engagement > 0 && (
                  <div className="flex items-center gap-1 text-sm text-pink-600">
                    <Heart className="w-4 h-4" />
                    {post.engagement.toLocaleString()} engagements
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Performance This Week</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-pink-500/10 rounded-lg">
                <p className="text-sm text-pink-400">Total Engagement</p>
                <p className="text-3xl font-bold text-pink-300">{performance.engagementThisWeek.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-fuchsia-500/10 rounded-lg">
                <p className="text-sm text-fuchsia-400">Posts Published</p>
                <p className="text-3xl font-bold text-fuchsia-300">{publishing.publishedThisWeek}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-900/40 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">Top Performing Post</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{performance.topPost.client}</p>
                  <p className={`text-sm ${getPlatformColor(performance.topPost.platform)}`}>
                    {performance.topPost.platform} • {performance.topPost.type}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-pink-600 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  {performance.topPost.engagement.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-pink-500/10 rounded-xl border border-pink-500/20 p-4">
        <h3 className="font-semibold text-pink-300 mb-3">Today&apos;s Focus</h3>
        <ul className="space-y-2 text-sm text-pink-200">
          <li className="flex items-start gap-2">
            <span className="text-pink-400">1.</span>
            Review and approve {approvals.designsPendingApproval} pending creative designs
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400">2.</span>
            Publish {publishing.scheduledToday} scheduled posts
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400">3.</span>
            Follow up on {approvals.clientApprovalPending} client approval requests
          </li>
        </ul>
      </div>
    </div>
  )
}
