'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface AdCreative {
  id: string
  client: { id: string; name: string } | null
  name: string
  type: string
  platform: string
  status: string
  headline?: string
  description?: string
  mediaUrl?: string
  thumbnailUrl?: string
  campaign?: { id: string; name: string; platform: string }
  performance?: {
    ctr: number
    leads: number
  }
}

interface Campaign {
  id: string
  name: string
  platform: string
  client?: { id: string; name: string }
}

function SkeletonCard() {
  return (
    <div className="p-4 animate-pulse">
      <div className="flex justify-between mb-2">
        <div>
          <div className="bg-slate-700/50 rounded h-5 w-48 mb-2" />
          <div className="bg-slate-700/50 rounded h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-700/50 rounded h-6 w-16" />
          <div className="bg-slate-700/50 rounded h-6 w-16" />
        </div>
      </div>
      <div className="bg-slate-700/50 rounded h-4 w-full mt-2" />
    </div>
  )
}

export default function AdCreativesPage() {
  const [creatives, setCreatives] = useState<AdCreative[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newCreative, setNewCreative] = useState({
    campaignId: '',
    name: '',
    type: 'IMAGE',
    platform: 'META',
    headline: '',
    description: '',
    callToAction: '',
    mediaUrl: '',
  })

  const fetchCreatives = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('status', filter)
      const res = await fetch(`/api/ads/creatives?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch creatives')
      const data = await res.json()
      setCreatives(Array.isArray(data) ? data : data.creatives || [])
    } catch (err) {
      setError('Failed to load creatives')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/ads/campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns || [])
      }
    } catch {
      // Campaigns are optional
    }
  }, [])

  useEffect(() => {
    fetchCreatives()
    fetchCampaigns()
  }, [fetchCreatives, fetchCampaigns])

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'pioneer-os/ads-creatives')

    try {
      const res = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        return data.url
      }
      const error = await res.json()
      throw new Error(error.error || 'Upload failed')
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadFile(file)
      if (url) {
        setNewCreative(prev => ({ ...prev, mediaUrl: url }))
      }
    } catch (err) {
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCreative.campaignId || !newCreative.name) {
      alert('Please select a campaign and enter a name')
      return
    }

    setUploading(true)
    try {
      const res = await fetch('/api/ads/creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCreative,
          clientId: campaigns.find(c => c.id === newCreative.campaignId)?.client?.id || '',
        }),
      })

      if (res.ok) {
        setShowUploadModal(false)
        setNewCreative({
          campaignId: '',
          name: '',
          type: 'IMAGE',
          platform: 'META',
          headline: '',
          description: '',
          callToAction: '',
          mediaUrl: '',
        })
        fetchCreatives()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create creative')
      }
    } catch (err) {
      alert('Failed to create creative')
    } finally {
      setUploading(false)
    }
  }

  const getCreativeTypeDisplay = (type: string | undefined) => {
    const typeMap: Record<string, string> = {
      IMAGE: 'Image',
      VIDEO: 'Video',
      CAROUSEL: 'Carousel',
      TEXT: 'Text',
      HTML5: 'HTML5',
    }
    return typeMap[type || ''] || type || 'Unknown'
  }

  const filteredCreatives = filter === 'ALL' ? creatives : creatives.filter(c => c.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'APPROVED': return 'bg-blue-500/20 text-blue-400'
      case 'RUNNING': return 'bg-green-500/20 text-green-400'
      case 'PAUSED': return 'bg-red-500/20 text-red-400'
      case 'DRAFT': return 'bg-slate-800/50 text-slate-200'
      case 'REJECTED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getStatusDisplay = (status: string) => {
    const displayMap: Record<string, string> = {
      PENDING_REVIEW: 'Pending',
      DRAFT: 'Draft',
      APPROVED: 'Approved',
      RUNNING: 'Running',
      PAUSED: 'Paused',
      REJECTED: 'Rejected',
    }
    return displayMap[status] || status
  }

  const getCreativeTypeColor = (type: string) => {
    switch (type) {
      case 'IMAGE': return 'bg-blue-500/20 text-blue-400'
      case 'VIDEO': return 'bg-pink-500/20 text-pink-400'
      case 'CAROUSEL': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPlatformColor = (platform: string) => {
    const p = (platform || '').toUpperCase()
    switch (p) {
      case 'META': return 'bg-blue-500/20 text-blue-400'
      case 'GOOGLE': return 'bg-red-500/20 text-red-400'
      case 'BOTH': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-800/50 text-slate-300'
    }
  }

  const videoCount = creatives.filter(c => c.type === 'VIDEO').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ad Creatives</h1>
            <p className="text-red-200">Manage creative assets for campaigns</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center gap-2"
          >
            <span>📤</span> Upload Creative
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Creatives</p>
          {loading ? (
            <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" />
          ) : (
            <p className="text-3xl font-bold text-slate-200">{creatives.length}</p>
          )}
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-green-400">Running</p>
          {loading ? (
            <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" />
          ) : (
            <p className="text-3xl font-bold text-green-400">{creatives.filter(c => c.status === 'RUNNING').length}</p>
          )}
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-4">
          <p className="text-sm text-amber-400">Pending Approval</p>
          {loading ? (
            <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" />
          ) : (
            <p className="text-3xl font-bold text-amber-400">{creatives.filter(c => c.status === 'PENDING_REVIEW' || c.status === 'DRAFT').length}</p>
          )}
        </div>
        <div className="bg-pink-500/10 rounded-xl border border-pink-500/30 p-4">
          <p className="text-sm text-pink-400">Videos</p>
          {loading ? (
            <div className="animate-pulse bg-slate-700/50 rounded h-9 w-12" />
          ) : (
            <p className="text-3xl font-bold text-pink-400">{videoCount}</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'RUNNING', 'APPROVED', 'PENDING_REVIEW', 'PAUSED', 'DRAFT'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-red-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-red-300'
            }`}
          >
            {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Creative List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
          ) : filteredCreatives.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-lg mb-2">No creatives found</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-red-400 hover:text-red-300"
              >
                Upload your first creative
              </button>
            </div>
          ) : (
            filteredCreatives.map(creative => (
              <div key={creative.id} className="p-4 hover:bg-slate-900/40">
                <div className="flex items-start gap-4">
                  {creative.mediaUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                      <img
                        src={creative.mediaUrl}
                        alt={creative.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-white">{creative.name}</h3>
                        <p className="text-sm text-slate-400">{creative.campaign?.name || creative.client?.name || 'Unknown Campaign'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getCreativeTypeColor(creative.type)}`}>
                          {getCreativeTypeDisplay(creative.type)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPlatformColor(creative.platform)}`}>
                          {creative.platform}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(creative.status)}`}>
                          {getStatusDisplay(creative.status)}
                        </span>
                      </div>
                    </div>
                    {creative.headline && (
                      <p className="text-sm text-red-300 font-medium mb-1">{creative.headline}</p>
                    )}
                    {creative.description && (
                      <p className="text-sm text-slate-300 mb-2 line-clamp-1">{creative.description}</p>
                    )}
                    {creative.mediaUrl && (
                      <a
                        href={creative.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        View Media ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Upload Creative</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-600 hover:border-slate-400'
                }`}
              >
                {uploading ? (
                  <div className="text-slate-400">
                    <div className="animate-spin text-3xl mb-2">⏳</div>
                    <p>Uploading...</p>
                  </div>
                ) : newCreative.mediaUrl ? (
                  <div className="text-green-400">
                    <div className="text-3xl mb-2">✓</div>
                    <p>File uploaded!</p>
                    <p className="text-xs text-slate-400 mt-1">Click to upload a different file</p>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    <div className="text-3xl mb-2">📤</div>
                    <p>Drag & drop or click to upload</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, GIF, WebP, PDF up to 10MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Preview */}
              {newCreative.mediaUrl && (
                <div className="border border-slate-700 rounded-lg p-2">
                  <img src={newCreative.mediaUrl} alt="Preview" className="max-h-40 mx-auto rounded" />
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Campaign *</label>
                  <select
                    value={newCreative.campaignId}
                    onChange={e => setNewCreative(prev => ({ ...prev, campaignId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Campaign</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.platform})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Platform *</label>
                  <select
                    value={newCreative.platform}
                    onChange={e => setNewCreative(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="META">Meta</option>
                    <option value="GOOGLE">Google</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="YOUTUBE">YouTube</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Creative Name *</label>
                <input
                  type="text"
                  value={newCreative.name}
                  onChange={e => setNewCreative(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Sale Banner"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={newCreative.type}
                    onChange={e => setNewCreative(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="CAROUSEL">Carousel</option>
                    <option value="TEXT">Text</option>
                    <option value="HTML5">HTML5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Call to Action</label>
                  <select
                    value={newCreative.callToAction}
                    onChange={e => setNewCreative(prev => ({ ...prev, callToAction: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select CTA</option>
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="SHOP_NOW">Shop Now</option>
                    <option value="SIGN_UP">Sign Up</option>
                    <option value="CONTACT_US">Contact Us</option>
                    <option value="GET_QUOTE">Get Quote</option>
                    <option value="BOOK_NOW">Book Now</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  value={newCreative.headline}
                  onChange={e => setNewCreative(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="e.g., Summer Sale - Up to 50% Off!"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={newCreative.description}
                  onChange={e => setNewCreative(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your creative..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !newCreative.mediaUrl || !newCreative.campaignId || !newCreative.name}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Creating...' : 'Create Creative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
