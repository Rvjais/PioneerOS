'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Campaign {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  dueDate?: string
  client?: { id: string; name: string }
  assignee?: { firstName: string; lastName: string }
}

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-900/20 text-slate-400',
  IN_PROGRESS: 'bg-green-500/20 text-green-400',
  PAUSED: 'bg-amber-500/20 text-amber-400',
  DONE: 'bg-blue-500/20 text-blue-400',
  BLOCKED: 'bg-red-500/20 text-red-400',
  ACTIVE: 'bg-green-500/20 text-green-400',
  UNDER_REVIEW: 'bg-blue-500/20 text-blue-400',
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-4"><div className="animate-pulse bg-slate-700/50 rounded h-10 w-56" /></td>
      <td className="px-4 py-4"><div className="animate-pulse bg-slate-700/50 rounded h-5 w-24" /></td>
      <td className="px-4 py-4"><div className="animate-pulse bg-slate-700/50 rounded h-5 w-16" /></td>
      <td className="px-4 py-4"><div className="animate-pulse bg-slate-700/50 rounded h-5 w-16" /></td>
      <td className="px-4 py-4"><div className="animate-pulse bg-slate-700/50 rounded h-5 w-20" /></td>
      <td className="px-4 py-4"><div className="animate-pulse bg-slate-700/50 rounded h-5 w-20" /></td>
    </tr>
  )
}

export default function AdsCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const res = await fetch(`/api/ads/campaigns?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(Array.isArray(data) ? data : data.campaigns || [])
    } catch (err) {
      setError('Failed to load campaigns')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const activeCampaigns = campaigns.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ACTIVE')
  const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED' || c.status === 'BLOCKED')
  const completedCampaigns = campaigns.filter(c => c.status === 'DONE')

  return (
    <div className="space-y-6 pb-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Campaigns</h1>
          <p className="text-slate-400 mt-1">Google Ads, Meta Ads, and paid advertising campaigns</p>
        </div>
        <div className="flex gap-3">
          <Link href="/ads/campaigns/planner" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + New Campaign
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          {loading ? (
            <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12 mb-1" />
          ) : (
            <p className="text-3xl font-bold text-white">{campaigns.length}</p>
          )}
          <p className="text-sm text-slate-400">Total Campaigns</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          {loading ? (
            <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12 mb-1" />
          ) : (
            <p className="text-3xl font-bold text-green-400">{activeCampaigns.length}</p>
          )}
          <p className="text-sm text-slate-400">Active</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          {loading ? (
            <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12 mb-1" />
          ) : (
            <p className="text-3xl font-bold text-amber-400">{pausedCampaigns.length}</p>
          )}
          <p className="text-sm text-slate-400">Paused/Blocked</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          {loading ? (
            <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12 mb-1" />
          ) : (
            <p className="text-3xl font-bold text-blue-400">{completedCampaigns.length}</p>
          )}
          <p className="text-sm text-slate-400">Completed</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {['ALL', 'ACTIVE', 'IN_PROGRESS', 'PAUSED', 'DONE', 'BLOCKED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-blue-300'
            }`}
          >
            {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Active Campaigns */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Campaigns</h2>
          <div className="flex gap-2">
            <select
              className="px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm text-slate-300"
              style={{ colorScheme: 'dark' }}
            >
              <option>All Platforms</option>
              <option>Google Ads</option>
              <option>Meta Ads</option>
              <option>LinkedIn Ads</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 backdrop-blur-sm">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Campaign</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skeleton-row-${i}`} />)
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No campaigns found. Click &quot;+ New Campaign&quot; to create one.
                  </td>
                </tr>
              ) : (
                campaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-white">{campaign.title}</p>
                          {campaign.description && (
                            <p className="text-sm text-slate-400 truncate max-w-xs">{campaign.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {campaign.client?.name || 'Internal'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[campaign.status] || statusColors.TODO}`}>
                        {campaign.status === 'IN_PROGRESS' ? 'Active' : campaign.status?.replace(/_/g, ' ') || 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                        campaign.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-900/20 text-slate-400'
                      }`}>
                        {campaign.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {campaign.dueDate
                        ? new Date(campaign.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Link href={`/ads/campaigns/meta?campaignId=${campaign.id}`} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                          View
                        </Link>
                        <Link href={`/ads/campaigns/planner?edit=${campaign.id}`} className="px-3 py-1 text-xs bg-white/10 backdrop-blur-sm text-slate-400 rounded-lg hover:bg-white/20">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-semibold text-white">Google Ads</h3>
          </div>
          <p className="text-sm text-slate-400 mb-3">Manage search and display campaigns</p>
          <Link href="/ads/campaigns/google" className="block w-full px-3 py-2 bg-blue-500/30 text-blue-300 rounded-lg text-sm hover:bg-blue-500/40 text-center">
            Open Google Ads
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h3 className="font-semibold text-white">Meta Ads</h3>
          </div>
          <p className="text-sm text-slate-400 mb-3">Facebook and Instagram campaigns</p>
          <Link href="/ads/campaigns/meta" className="block w-full px-3 py-2 bg-purple-500/30 text-purple-300 rounded-lg text-sm hover:bg-purple-500/40 text-center">
            Open Meta Business
          </Link>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-semibold text-white">Reports</h3>
          </div>
          <p className="text-sm text-slate-400 mb-3">View performance analytics</p>
          <Link href="/ads/performance/reports" className="block w-full px-3 py-2 bg-amber-500/30 text-amber-300 rounded-lg text-sm hover:bg-amber-500/40 text-center">
            Generate Report
          </Link>
        </div>
      </div>

    </div>
  )
}
