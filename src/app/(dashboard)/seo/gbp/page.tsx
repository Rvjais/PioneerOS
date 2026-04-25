'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface GBPProfile {
  id: string
  client: string
  profileName: string
  location: string
  category: string
  totalReviews: number
  rating: number
  monthlyPosts: number
  calls: number
  directions: number
  profileViews: number
  websiteClicks: number
  status: 'ACTIVE' | 'NEEDS_ATTENTION' | 'OPTIMIZING'
}

interface GBPPost {
  id: string
  client: string
  postType: 'UPDATE' | 'OFFER' | 'EVENT' | 'PRODUCT'
  content: string
  proofLink: string
  views: number
  publishedDate: string
}

export default function GBPManagementPage() {
  const [profiles, setProfiles] = useState<GBPProfile[]>([])
  const [posts, setPosts] = useState<GBPPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchGBPData()
  }, [])

  const fetchGBPData = async () => {
    try {
      setError(null)
      const res = await fetch('/api/seo/gbp')
      if (!res.ok) throw new Error('Failed to fetch GBP data')
      const data = await res.json()
      setProfiles(data.profiles || [])
      setPosts(data.posts || [])
    } catch (err) {
      console.error('Failed to fetch GBP data:', err)
      setError('Failed to load GBP data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredProfiles = filter === 'ALL' ? profiles : profiles.filter(p => p.status === filter)

  const totalCalls = profiles.reduce((sum, p) => sum + p.calls, 0)
  const totalDirections = profiles.reduce((sum, p) => sum + p.directions, 0)
  const totalReviews = profiles.reduce((sum, p) => sum + p.totalReviews, 0)
  const avgRating = profiles.length > 0 ? (profiles.reduce((sum, p) => sum + p.rating, 0) / profiles.length).toFixed(1) : '0.0'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400'
      case 'NEEDS_ATTENTION': return 'bg-red-500/20 text-red-400'
      case 'OPTIMIZING': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'UPDATE': return 'bg-blue-500/20 text-blue-400'
      case 'OFFER': return 'bg-green-500/20 text-green-400'
      case 'EVENT': return 'bg-purple-500/20 text-purple-400'
      case 'PRODUCT': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">GBP Management</h1>
          <p className="text-green-200">Google Business Profile optimization & tracking</p>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900/40 rounded-xl border border-white/10 p-4 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-24 mb-2" />
              <div className="h-8 bg-slate-700 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">GBP Management</h1>
          <p className="text-green-200">Google Business Profile optimization & tracking</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <svg className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-slate-400">{error}</p>
          <button onClick={() => { setLoading(true); fetchGBPData() }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GBP Management</h1>
            <p className="text-green-200">Google Business Profile optimization & tracking</p>
          </div>
          <button className="px-4 py-2 glass-card text-green-400 rounded-lg font-medium hover:bg-green-500/10">
            + Add GBP Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Profiles</p>
          <p className="text-3xl font-bold text-slate-200">{profiles.length}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Total Calls (Month)</p>
          <p className="text-3xl font-bold text-blue-400">{totalCalls.toLocaleString()}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Total Directions</p>
          <p className="text-3xl font-bold text-purple-400">{totalDirections.toLocaleString()}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Total Reviews</p>
          <p className="text-3xl font-bold text-amber-400">{totalReviews.toLocaleString()}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Avg Rating</p>
          <p className="text-3xl font-bold text-green-400">{avgRating}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'ACTIVE', 'OPTIMIZING', 'NEEDS_ATTENTION'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-green-300'
            }`}
          >
            {status === 'ALL' ? 'All Profiles' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* GBP Profiles Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">GBP Profiles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT / PROFILE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">REVIEWS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">RATING</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">POSTS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">CALLS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DIRECTIONS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">VIEWS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map(profile => (
                <tr key={profile.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{profile.client}</p>
                    <p className="text-sm text-slate-400">{profile.location}</p>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300">{profile.totalReviews.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-amber-500 font-semibold">{profile.rating}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300">{profile.monthlyPosts}</td>
                  <td className="py-3 px-4 text-center text-blue-400 font-semibold">{profile.calls}</td>
                  <td className="py-3 px-4 text-center text-purple-400 font-semibold">{profile.directions}</td>
                  <td className="py-3 px-4 text-center text-slate-300">{profile.profileViews.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(profile.status)}`}>
                      {profile.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-green-400 hover:text-green-400 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent GBP Posts */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent GBP Posts</h2>
          <button className="text-green-400 hover:text-green-400 text-sm font-medium">
            + Add Post
          </button>
        </div>
        <div className="divide-y divide-white/10">
          {posts.map(post => (
            <div key={post.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{post.client}</h3>
                  <p className="text-sm text-slate-400">{formatDateDDMMYYYY(post.publishedDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPostTypeColor(post.postType)}`}>
                    {post.postType}
                  </span>
                  <span className="text-sm text-slate-300">{post.views} views</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-2">{post.content}</p>
              <a href={post.proofLink} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 hover:text-green-400">
                View Proof Link →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* GBP Optimization Tips */}
      <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
        <h3 className="font-semibold text-green-800 mb-3">GBP Optimization Checklist</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-green-400">
          <div>
            <p className="font-medium mb-1">Weekly Tasks</p>
            <ul className="space-y-1">
              <li>• 2 GBP posts minimum</li>
              <li>• Respond to reviews</li>
              <li>• Update photos</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Monthly Tasks</p>
            <ul className="space-y-1">
              <li>• 8-10 posts total</li>
              <li>• Track keyword rankings</li>
              <li>• Review call/direction data</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Optimization</p>
            <ul className="space-y-1">
              <li>• Complete all attributes</li>
              <li>• Add services/products</li>
              <li>• Update business hours</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Reviews Target</p>
            <ul className="space-y-1">
              <li>• 5-10 new reviews/month</li>
              <li>• Respond within 24hrs</li>
              <li>• Maintain 4.5+ rating</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
