'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Play, Award, Star, ExternalLink } from 'lucide-react'

interface Badge {
  id: string
  youtubeUrl: string
  thumbnailUrl: string | null
  title: string
  clientName: string
  clientLogo: string | null
  badgeColor: string
  isFeatured: boolean
  receivedAt: string
}

interface TestimonialBadgesProps {
  userId: string
  showStats?: boolean
  maxDisplay?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const BADGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  gold: { bg: 'bg-amber-500/20', border: 'border-amber-400', text: 'text-amber-400' },
  silver: { bg: 'bg-slate-800/50', border: 'border-slate-400', text: 'text-slate-200' },
  bronze: { bg: 'bg-orange-500/20', border: 'border-orange-400', text: 'text-orange-400' },
  platinum: { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-400' },
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-400' },
}

const SIZE_CLASSES = {
  sm: { badge: 'w-10 h-10', icon: 'w-3 h-3', tooltip: 'text-xs' },
  md: { badge: 'w-14 h-14', icon: 'w-4 h-4', tooltip: 'text-sm' },
  lg: { badge: 'w-20 h-20', icon: 'w-5 h-5', tooltip: 'text-base' },
}

export function TestimonialBadges({
  userId,
  showStats = true,
  maxDisplay = 5,
  size = 'md',
  className = '',
}: TestimonialBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState({ totalTestimonials: 0, totalRewardsEarned: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch(`/api/testimonials/user/${userId}/badges`)
        if (res.ok) {
          const data = await res.json()
          setBadges(data.badges)
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch badges:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBadges()
  }, [userId])

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className={`${SIZE_CLASSES[size].badge} rounded-full bg-white/10 animate-pulse`}
          />
        ))}
      </div>
    )
  }

  if (badges.length === 0) {
    return null
  }

  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = badges.length - maxDisplay

  const openYouTube = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const sizeClass = SIZE_CLASSES[size]

  return (
    <div className={className}>
      {/* Stats Header */}
      {showStats && (
        <div className="flex items-center gap-2 mb-3 text-sm text-slate-300">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="font-medium">{stats.totalTestimonials} Video Testimonial{stats.totalTestimonials !== 1 ? 's' : ''}</span>
          {stats.totalRewardsEarned > 0 && (
            <span className="text-green-400 font-medium">
              (+{stats.totalRewardsEarned.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} earned)
            </span>
          )}
        </div>
      )}

      {/* Badge Grid */}
      <div className="flex flex-wrap gap-2">
        {displayBadges.map((badge) => {
          const colors = BADGE_COLORS[badge.badgeColor] || BADGE_COLORS.gold
          return (
            <div
              key={badge.id}
              className="relative group"
            >
              <button
                onClick={() => openYouTube(badge.youtubeUrl)}
                className={`
                  ${sizeClass.badge} rounded-full overflow-hidden border-2 ${colors.border}
                  ${colors.bg} flex items-center justify-center relative
                  hover:scale-110 transition-transform cursor-pointer shadow-none
                  ${badge.isFeatured ? 'ring-2 ring-offset-2 ring-amber-400' : ''}
                `}
                title={`${badge.title} - Click to watch`}
              >
                {badge.thumbnailUrl ? (
                  <Image
                    src={badge.thumbnailUrl}
                    alt={badge.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                ) : badge.clientLogo ? (
                  <Image
                    src={badge.clientLogo}
                    alt={badge.clientName}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <Play className={`${sizeClass.icon} ${colors.text}`} />
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className={`${sizeClass.icon} text-white fill-white`} />
                </div>

                {/* Featured star */}
                {badge.isFeatured && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-none">
                <p className={`font-medium ${sizeClass.tooltip}`}>{badge.title}</p>
                <p className={`${sizeClass.tooltip} text-slate-300`}>{badge.clientName}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          )
        })}

        {/* Show more indicator */}
        {remainingCount > 0 && (
          <button
            onClick={() => setSelectedBadge(badges[0])} // Could open a modal
            className={`
              ${sizeClass.badge} rounded-full bg-slate-800/50 border-2 border-white/20
              flex items-center justify-center text-slate-300 font-medium
              hover:bg-white/10 transition-colors
            `}
          >
            +{remainingCount}
          </button>
        )}
      </div>

      {/* Video Modal (simple version) */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="glass-card rounded-xl max-w-2xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedBadge.title}</h3>
                <p className="text-slate-400">{selectedBadge.clientName}</p>
              </div>
              <button
                onClick={() => openYouTube(selectedBadge.youtubeUrl)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <ExternalLink className="w-4 h-4" />
                Watch on YouTube
              </button>
            </div>
            <div className="aspect-video bg-slate-800/50 rounded-lg flex items-center justify-center">
              {selectedBadge.thumbnailUrl ? (
                <Image
                  src={selectedBadge.thumbnailUrl}
                  alt={selectedBadge.title}
                  fill
                  sizes="48px"
                  className="object-cover rounded-lg"
                  unoptimized
                />
              ) : (
                <Play className="w-16 h-16 text-slate-400" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for sidebar/cards
export function TestimonialBadgeCount({ userId, className = '' }: { userId: string; className?: string }) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch(`/api/testimonials/user/${userId}/badges`)
        if (res.ok) {
          const data = await res.json()
          setCount(data.stats.totalTestimonials)
        }
      } catch {
        // Ignore errors
      } finally {
        setLoading(false)
      }
    }
    fetchCount()
  }, [userId])

  if (loading || count === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Award className="w-4 h-4 text-amber-500" />
      <span className="text-sm font-medium text-slate-200">{count}</span>
    </div>
  )
}
