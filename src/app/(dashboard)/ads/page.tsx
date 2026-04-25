'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Megaphone, TrendingUp, Wallet, AlertTriangle, Target, Zap } from 'lucide-react'

interface AnalyticsData {
  activeCampaigns: number
  pausedCampaigns: number
  underReviewCampaigns: number
  leadsToday: number
  leadsThisWeek: number
  leadsThisMonth: number
  dailySpend: number
  monthlySpend: number
  remainingBudget: number
  avgCPL: number
  conversionRate: number
  avgROAS: number
  bestCampaign: {
    name: string
    platform: string
    cpl: number
    leads: number
  } | null
  alerts: { campaign: string; issue: string; severity: string }[]
}

interface RecentCampaign {
  id: string
  name: string
  client: { name: string } | null
  platform: string
  status: string
  totalLeads: number
  costPerLead: number
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
}

export default function AdsDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [analyticsRes, campaignsRes] = await Promise.all([
          fetch('/api/ads/analytics'),
          fetch('/api/ads/campaigns?take=5&orderBy=updatedAt'),
        ])

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          setAnalytics(analyticsData)
        } else {
          // Fallback: set defaults if analytics API not ready
          setAnalytics({
            activeCampaigns: 0,
            pausedCampaigns: 0,
            underReviewCampaigns: 0,
            leadsToday: 0,
            leadsThisWeek: 0,
            leadsThisMonth: 0,
            dailySpend: 0,
            monthlySpend: 0,
            remainingBudget: 0,
            avgCPL: 0,
            conversionRate: 0,
            avgROAS: 0,
            bestCampaign: null,
            alerts: [],
          })
        }

        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json()
          setRecentCampaigns(Array.isArray(campaignsData) ? campaignsData : campaignsData.campaigns || [])
        }
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const quickActions = [
    { label: 'New Campaign', icon: Megaphone, color: 'bg-red-500/20 text-red-400', href: '/ads/campaigns/planner' },
    { label: 'Optimize Ads', icon: Zap, color: 'bg-orange-500/20 text-orange-400', href: '/ads/performance/campaigns' },
    { label: 'View Leads', icon: Target, color: 'bg-amber-500/20 text-amber-400', href: '/ads/leads/performance' },
    { label: 'Budget Report', icon: Wallet, color: 'bg-yellow-500/20 text-yellow-400', href: '/ads/budget/allocations' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400'
      case 'PAUSED': return 'bg-amber-500/20 text-amber-400'
      case 'UNDER_REVIEW': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'META': return 'text-blue-400'
      case 'GOOGLE': return 'text-red-400'
      default: return 'text-slate-300'
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Performance Ads Dashboard</h1>
            <p className="text-red-200">Meta & Google Advertising Performance</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-red-200 text-sm">Leads Today</p>
              {loading ? <SkeletonBlock className="h-9 w-16 ml-auto" /> : (
                <p className="text-3xl font-bold">{analytics?.leadsToday ?? 0}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-red-200 text-sm">Avg CPL</p>
              {loading ? <SkeletonBlock className="h-9 w-20 ml-auto" /> : (
                <p className="text-3xl font-bold">₹{analytics?.avgCPL ?? 0}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 p-4 glass-card rounded-xl border border-white/10 hover:border-red-300 hover:shadow-none transition-all"
          >
            <div className={`p-2 rounded-lg ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-200">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campaign Activity */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-red-400" />
            Campaign Activity
          </h3>
          {loading ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Active</span>
                <span className="font-semibold text-green-400">{analytics?.activeCampaigns ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Paused</span>
                <span className="font-semibold text-amber-400">{analytics?.pausedCampaigns ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Under Review</span>
                <span className="font-semibold text-blue-400">{analytics?.underReviewCampaigns ?? 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Lead Generation */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" />
            Lead Generation
          </h3>
          {loading ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Today</span>
                <span className="font-semibold text-red-400">{analytics?.leadsToday ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">This Week</span>
                <span className="font-semibold text-orange-600">{analytics?.leadsThisWeek ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">This Month</span>
                <span className="font-semibold text-amber-400">{analytics?.leadsThisMonth ?? 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Budget Monitoring */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-red-400" />
            Budget Monitoring
          </h3>
          {loading ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Daily Spend</span>
                <span className="font-semibold text-slate-200">₹{((analytics?.dailySpend ?? 0) / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Monthly Spend</span>
                <span className="font-semibold text-slate-200">₹{((analytics?.monthlySpend ?? 0) / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Remaining</span>
                <span className="font-semibold text-green-400">₹{((analytics?.remainingBudget ?? 0) / 1000).toFixed(0)}K</span>
              </div>
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            Performance
          </h3>
          {loading ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Avg CPL</span>
                <span className="font-semibold text-red-400">₹{analytics?.avgCPL ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Conversion Rate</span>
                <span className="font-semibold text-green-400">{analytics?.conversionRate ?? 0}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {!loading && analytics?.alerts && analytics.alerts.length > 0 && (
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts & Warnings
          </h3>
          <ul className="space-y-2">
            {analytics.alerts.map((alert, idx) => (
              <li key={`alert-${alert.campaign}-${idx}`} className="flex items-center gap-2 text-sm text-red-400">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  alert.severity === 'HIGH' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {alert.severity}
                </span>
                <span className="font-medium">{alert.campaign}:</span>
                {alert.issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Campaigns */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Recent Campaigns</h2>
        </div>
        <div className="divide-y divide-white/10">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="p-4">
                <SkeletonBlock className="h-5 w-64 mb-2" />
                <SkeletonBlock className="h-4 w-40 mb-2" />
                <SkeletonBlock className="h-4 w-32" />
              </div>
            ))
          ) : recentCampaigns.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No campaigns found</div>
          ) : (
            recentCampaigns.map((campaign, idx) => (
              <div key={campaign.id || idx} className="p-4 hover:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-white">{campaign.name}</p>
                    <p className="text-sm text-slate-400">
                      {campaign.client?.name || 'Unknown Client'} • <span className={getPlatformColor(campaign.platform)}>{campaign.platform}</span>
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-slate-300">Leads: <span className="font-semibold text-green-400">{campaign.totalLeads ?? 0}</span></span>
                  <span className="text-slate-300">CPL: <span className="font-semibold text-red-400">₹{campaign.costPerLead ?? 0}</span></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Best Performer */}
      {!loading && analytics?.bestCampaign && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-4">
          <h3 className="font-semibold text-green-400 mb-3">Best Performing Campaign</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-400">{analytics.bestCampaign.name}</p>
              <p className="text-sm text-green-400">{analytics.bestCampaign.platform} Ads</p>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-sm text-green-400">Leads</p>
                <p className="text-2xl font-bold text-green-400">{analytics.bestCampaign.leads}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-400">CPL</p>
                <p className="text-2xl font-bold text-green-400">₹{analytics.bestCampaign.cpl}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
