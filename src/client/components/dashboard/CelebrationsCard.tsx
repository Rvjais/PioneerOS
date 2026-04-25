'use client'

/**
 * CLIENT-SIDE CelebrationsCard
 * Used in client components (e.g., DashboardClient) that cannot import server components.
 * Fetches data via API call.
 *
 * NOTE: There's also a SERVER-SIDE version at components/dashboards/CelebrationsCard.tsx
 * which fetches data directly via Prisma. Use that version in Server Components for better performance.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Celebration {
  userId: string
  name: string
  department: string
  type: 'birthday' | 'anniversary'
  date: string
  displayDate: string
  daysUntil: number
  isToday: boolean
  details?: string
  profilePhoto?: string | null
}

interface CelebrationsData {
  today: Celebration[]
  upcoming: Celebration[]
  stats: {
    total: number
    today: number
    thisWeek: number
    birthdays: number
    anniversaries: number
  }
}

export function CelebrationsCard() {
  const [data, setData] = useState<CelebrationsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/celebrations?days=14')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="animate-pulse">
          <div className="h-5 bg-white/10 rounded w-32 mb-4" />
          <div className="space-y-3">
            <div className="h-12 bg-slate-800/50 rounded" />
            <div className="h-12 bg-slate-800/50 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!data || (data.today.length === 0 && data.upcoming.length === 0)) {
    return null // Don't show card if no celebrations
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
          <h3 className="font-semibold">Celebrations</h3>
          {data.stats.today > 0 && (
            <span className="ml-auto px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
              {data.stats.today} today
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Today's Celebrations */}
        {data.today.length > 0 && (
          <div className="space-y-2">
            {data.today.map((celebration, idx) => (
              <div
                key={`${celebration.userId}-${celebration.type}-${idx}`}
                className="glass-card rounded-lg p-3 border border-pink-200 shadow-none"
              >
                <div className="flex items-center gap-3">
                  {celebration.profilePhoto ? (
                    <img
                      src={celebration.profilePhoto}
                      alt={celebration.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-pink-300"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      celebration.type === 'birthday' ? 'bg-pink-500' : 'bg-purple-500'
                    }`}>
                      {getInitials(celebration.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/employees/${celebration.userId}`}
                        className="font-medium text-white hover:text-pink-600 truncate"
                      >
                        {celebration.name}
                      </Link>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        celebration.type === 'birthday'
                          ? 'bg-pink-500/20 text-pink-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {celebration.type === 'birthday' ? 'BIRTHDAY' : celebration.details}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{celebration.department}</p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center">
                    {celebration.type === 'birthday' ? (
                      <svg className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Celebrations */}
        {data.upcoming.length > 0 && (
          <div>
            {data.today.length > 0 && (
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Upcoming</p>
            )}
            <div className="space-y-2">
              {data.upcoming.slice(0, 4).map((celebration, idx) => (
                <div
                  key={`${celebration.userId}-${celebration.type}-${idx}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/80 transition-colors"
                >
                  {celebration.profilePhoto ? (
                    <img
                      src={celebration.profilePhoto}
                      alt={celebration.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                      celebration.type === 'birthday' ? 'bg-pink-400' : 'bg-purple-400'
                    }`}>
                      {getInitials(celebration.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{celebration.name}</p>
                    <p className="text-xs text-slate-400">
                      {celebration.type === 'birthday' ? 'Birthday' : `Work Anniversary (${celebration.details})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-300">{celebration.displayDate}</p>
                    <p className="text-[10px] text-slate-400">
                      {celebration.daysUntil === 1 ? 'Tomorrow' : `In ${celebration.daysUntil} days`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View All Link */}
        {data.stats.total > 4 && (
          <div className="pt-2 border-t border-pink-200">
            <Link
              href="/hr/celebrations"
              className="text-xs font-medium text-pink-600 hover:text-pink-700"
            >
              View all {data.stats.total} celebrations →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
