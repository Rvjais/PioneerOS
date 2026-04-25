'use client'

import { useState, useEffect } from 'react'

interface PlatformAccount {
  id: string
  platform: string
  clientCount: number
  followers: number
  followersGrowth: number
  postsPerMonth: number
  avgEngagement: number
  totalEngagement: number
  status: 'ACTIVE' | 'PAUSED'
}

export default function SocialPlatformsPage() {
  const [platforms, setPlatforms] = useState<PlatformAccount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlatforms() {
      try {
        const res = await fetch('/api/social/metrics?groupBy=platform')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        // groupBy=platform returns a flat array of platform aggregations
        setPlatforms(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching platform data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlatforms()
  }, [])

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM':
      case 'Instagram': return 'bg-gradient-to-r from-pink-500 to-purple-500'
      case 'FACEBOOK':
      case 'Facebook': return 'bg-blue-600'
      case 'LINKEDIN':
      case 'LinkedIn': return 'bg-sky-700'
      case 'YOUTUBE':
      case 'YouTube': return 'bg-red-600'
      case 'TWITTER':
      case 'Twitter/X': return 'bg-slate-800'
      default: return 'bg-slate-600'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM':
      case 'Instagram': return 'IG'
      case 'FACEBOOK':
      case 'Facebook': return 'FB'
      case 'LINKEDIN':
      case 'LinkedIn': return 'LI'
      case 'YOUTUBE':
      case 'YouTube': return 'YT'
      case 'TWITTER':
      case 'Twitter/X': return 'X'
      default: return '?'
    }
  }

  const formatPlatform = (p: string) =>
    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()

  const totalFollowers = platforms.reduce((sum, a) => sum + a.followers, 0)
  const avgGrowth = platforms.length > 0 ? (platforms.reduce((sum, a) => sum + a.followersGrowth, 0) / platforms.length).toFixed(1) : '0.0'
  const totalAccounts = platforms.reduce((sum, a) => sum + (a.clientCount || 1), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Social Media Platforms</h1>
          <p className="text-pink-200">Manage client social accounts</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-slate-400">Loading platform data...</span>
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
            <h1 className="text-2xl font-bold">Social Media Platforms</h1>
            <p className="text-pink-200">Manage client social accounts</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-pink-200 text-sm">Total Followers</p>
              <p className="text-3xl font-bold">{(totalFollowers / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-right">
              <p className="text-pink-200 text-sm">Avg Growth</p>
              <p className="text-3xl font-bold">+{avgGrowth}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-5 gap-4">
        {platforms.map(platform => (
          <div key={platform.id} className="glass-card rounded-xl border border-white/10 p-4">
            <div className={`w-10 h-10 ${getPlatformColor(platform.platform)} rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3`}>
              {getPlatformIcon(platform.platform)}
            </div>
            <p className="text-sm text-slate-300">{formatPlatform(platform.platform)}</p>
            <p className="text-2xl font-bold text-white">{platform.clientCount || 0}</p>
            <p className="text-xs text-slate-400">{(platform.followers / 1000).toFixed(0)}K followers</p>
          </div>
        ))}
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
          <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3">
            All
          </div>
          <p className="text-sm text-pink-600">Total Accounts</p>
          <p className="text-2xl font-bold text-pink-700">{totalAccounts}</p>
          <p className="text-xs text-pink-500">{(totalFollowers / 1000).toFixed(0)}K followers</p>
        </div>
      </div>

      {/* Platform Accounts Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">All Platform Accounts</h2>
        </div>
        {platforms.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No platform data found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">PLATFORM</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENTS</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">FOLLOWERS</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">GROWTH</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">POSTS/MO</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">ENGAGEMENT</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map(account => (
                <tr key={account.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 ${getPlatformColor(account.platform)} rounded-lg flex items-center justify-center text-white font-bold text-xs`}>
                      {getPlatformIcon(account.platform)}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{account.clientCount} clients</td>
                  <td className="py-3 px-4 text-right text-slate-300">{account.followers.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-green-400 font-medium">+{account.followersGrowth}%</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{account.postsPerMonth}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-pink-600 font-medium">{account.avgEngagement}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
