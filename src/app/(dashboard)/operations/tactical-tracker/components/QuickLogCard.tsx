'use client'

import { useState } from 'react'

interface Deliverable {
  id: string
  category: string
  workItem: string
  proofUrl: string | null
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUIRED'
}

interface QuickLogCardProps {
  item: Deliverable
  onUpdateProof: (id: string, proofUrl: string) => Promise<void>
}

const statusConfig = {
  PENDING: { color: 'bg-slate-800/50 text-slate-200', icon: '⚪', label: 'Pending' },
  SUBMITTED: { color: 'bg-blue-500/20 text-blue-400', icon: '🔵', label: 'Submitted' },
  APPROVED: { color: 'bg-green-500/20 text-green-400', icon: '✅', label: 'Approved' },
  REVISION_REQUIRED: { color: 'bg-red-500/20 text-red-400', icon: '🔴', label: 'Revision' },
}

const categoryIcons: Record<string, string> = {
  REEL: '🎬',
  POST: '📱',
  STORY: '📖',
  CAROUSEL: '🎠',
  STATIC_POST: '🖼️',
  YOUTUBE_VIDEO: '▶️',
  SHORTS: '📹',
  BLOG: '📝',
  ONPAGE_SEO: '🔍',
  TECHNICAL_SEO: '⚙️',
  GBP_UPDATE: '📍',
  GBP_POST: '📍',
  GOOGLE_ADS: '📊',
  META_ADS: '📈',
  LINKEDIN_ADS: '💼',
  LANDING_PAGE: '🌐',
  WEBSITE_DEV: '💻',
  BUG_FIX: '🐛',
  LOGO: '🎨',
  BANNER: '🖼️',
  MOTION_GRAPHICS: '✨',
}

export function QuickLogCard({ item, onUpdateProof }: QuickLogCardProps) {
  const [editingProof, setEditingProof] = useState(false)
  const [proofUrl, setProofUrl] = useState(item.proofUrl || '')
  const [saving, setSaving] = useState(false)

  const status = statusConfig[item.status]
  const icon = categoryIcons[item.category] || '📋'

  const handleSaveProof = async () => {
    if (!proofUrl) return
    setSaving(true)
    try {
      await onUpdateProof(item.id, proofUrl)
      setEditingProof(false)
    } finally {
      setSaving(false)
    }
  }

  const getCategoryColor = (category: string) => {
    if (category.includes('SOCIAL') || category === 'POST' || category === 'REEL' || category === 'STORY' || category === 'CAROUSEL') {
      return 'border-l-pink-400 bg-pink-50/50'
    }
    if (category.includes('YOUTUBE') || category === 'SHORTS') return 'border-l-red-400 bg-red-500/10'
    if (category.includes('GBP')) return 'border-l-green-400 bg-green-500/10'
    if (category.includes('SEO') || category === 'BLOG') return 'border-l-blue-400 bg-blue-500/10'
    if (category.includes('ADS')) return 'border-l-amber-400 bg-amber-500/10'
    if (category.includes('WEB') || category === 'LANDING_PAGE' || category === 'BUG_FIX') return 'border-l-cyan-400 bg-cyan-50/50'
    if (category.includes('DESIGN') || category === 'LOGO' || category === 'BANNER') return 'border-l-indigo-400 bg-indigo-50/50'
    if (category === 'MOTION_GRAPHICS' || category === 'ANIMATION') return 'border-l-purple-400 bg-purple-500/10'
    return 'border-l-slate-400 bg-slate-900/40'
  }

  return (
    <div className={`glass-card rounded-xl border border-white/10 border-l-4 ${getCategoryColor(item.category)} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white truncate">{item.workItem}</p>
            <p className="text-sm text-slate-400">{item.category.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Proof section */}
      <div className="mt-3 pt-3 border-t border-white/5">
        {editingProof ? (
          <div className="flex gap-2">
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="flex-1 px-3 py-2 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              autoFocus
            />
            <button
              onClick={handleSaveProof}
              disabled={saving || !proofUrl}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? '...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setEditingProof(false)
                setProofUrl(item.proofUrl || '')
              }}
              className="px-3 py-2 bg-white/10 text-slate-200 rounded-lg text-sm font-medium hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        ) : item.proofUrl ? (
          <div className="flex items-center justify-between">
            <a
              href={item.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-800 truncate flex-1"
            >
              {item.proofUrl.length > 40 ? item.proofUrl.substring(0, 40) + '...' : item.proofUrl}
            </a>
            {item.status !== 'APPROVED' && (
              <button
                onClick={() => setEditingProof(true)}
                className="text-sm text-slate-400 hover:text-slate-200 ml-2"
              >
                Edit
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setEditingProof(true)}
            className="w-full py-2 border-2 border-dashed border-white/20 rounded-lg text-sm text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            + Add Proof URL
          </button>
        )}
      </div>
    </div>
  )
}
