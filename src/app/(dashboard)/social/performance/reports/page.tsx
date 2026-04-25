'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface MetricRecord {
  id: string
  client: { id: string; name: string }
  platform: string
  month: string
  followers: number
  followerGrowth: number
  totalReach: number
  reachGrowth: number
  totalEngagement: number
  engagementRate: number
  postsPublished: number
  reelsPublished: number
  storiesPublished: number
  leadsGenerated: number
  linkClicks: number
  profileVisits: number
}

interface ClientReport {
  client: string
  reportMonth: string
  postsPublished: number
  engagementRate: number
  followersGained: number
  reach: number
}

export default function SocialReportsPage() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<MetricRecord[]>([])
  const [loading, setLoading] = useState(true)

  const userRole = (session?.user?.role as string) || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/social/metrics?limit=100')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setMetrics(data.metrics || [])
      } catch (err) {
        console.error('Error fetching metrics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  // Group metrics by client + month to create reports
  const reportMap: Record<string, ClientReport> = {}
  metrics.forEach(m => {
    const monthStr = new Date(m.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const key = `${m.client.name}-${monthStr}`
    if (!reportMap[key]) {
      reportMap[key] = {
        client: m.client.name,
        reportMonth: monthStr,
        postsPublished: 0,
        engagementRate: 0,
        followersGained: 0,
        reach: 0,
      }
    }
    const report = reportMap[key]
    report.postsPublished += m.postsPublished + m.reelsPublished + m.storiesPublished
    report.engagementRate = Math.max(report.engagementRate, m.engagementRate)
    report.followersGained += Math.round(m.followers * m.followerGrowth / 100)
    report.reach += m.totalReach
  })

  const reports = Object.values(reportMap)
  const reportsWithData = reports.filter(r => r.postsPublished > 0)
  const reportsInProgress = reports.filter(r => r.postsPublished === 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Social Media Reports</h1>
          <p className="text-pink-200">Monthly reports sent to clients</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-slate-400">Loading reports...</span>
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
            <h1 className="text-2xl font-bold">Social Media Reports</h1>
            <p className="text-pink-200">Monthly reports sent to clients</p>
          </div>
          {canEdit && (
            <button className="px-4 py-2 glass-card text-pink-600 rounded-lg font-medium hover:bg-pink-50">
              + Create Report
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Reports</p>
          <p className="text-3xl font-bold text-slate-200">{reports.length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">With Data</p>
          <p className="text-3xl font-bold text-green-400">{reportsWithData.length}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">In Progress</p>
          <p className="text-3xl font-bold text-amber-400">{reportsInProgress.length}</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="glass-card rounded-xl border border-white/10 p-8 text-center text-slate-400">
            No reports found.
          </div>
        ) : (
          reports.map((report, idx) => (
            <div key={`${report.client}-${report.reportMonth}`} className="glass-card rounded-xl border border-white/10 p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">{report.client}</h3>
                  <p className="text-sm text-slate-400">{report.reportMonth}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded ${
                  report.postsPublished > 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-800/50 text-slate-200'
                }`}>
                  {report.postsPublished > 0 ? 'COMPLETE' : 'IN PROGRESS'}
                </span>
              </div>

              {report.postsPublished > 0 ? (
                <div className="grid grid-cols-4 gap-4 p-3 bg-slate-900/40 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">{report.postsPublished}</p>
                    <p className="text-xs text-slate-400">Posts Published</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{report.engagementRate}%</p>
                    <p className="text-xs text-slate-400">Engagement Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">+{report.followersGained}</p>
                    <p className="text-xs text-slate-400">Followers Gained</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{(report.reach / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-slate-400">Total Reach</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/40 rounded-lg text-center text-slate-400">
                  <p className="text-sm">Report in progress - data will be populated at month end</p>
                </div>
              )}

              {report.postsPublished === 0 && canEdit && (
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 text-sm font-medium text-pink-400 bg-pink-500/10 rounded-lg hover:bg-pink-500/20">
                    Edit Report
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg hover:bg-slate-800/50">
                    Preview
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Report Contents */}
      <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
        <h3 className="font-semibold text-pink-800 mb-3">Report Includes</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-pink-700">
          <div>
            <p className="font-medium mb-1">Content Summary</p>
            <ul className="space-y-1">
              <li>- Posts published</li>
              <li>- Content types</li>
              <li>- Top posts</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Engagement</p>
            <ul className="space-y-1">
              <li>- Likes & comments</li>
              <li>- Shares & saves</li>
              <li>- Engagement rate</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Growth</p>
            <ul className="space-y-1">
              <li>- Follower growth</li>
              <li>- Reach & impressions</li>
              <li>- Profile visits</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Recommendations</p>
            <ul className="space-y-1">
              <li>- Best posting times</li>
              <li>- Content ideas</li>
              <li>- Next month plan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
