'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface CalendarPost {
  id: string
  client: string
  platform: string
  postType: string
  topic: string
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
}

export default function ContentCalendarPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarPosts, setCalendarPosts] = useState<Record<string, CalendarPost[]>>({})
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay = new Date(year, month, 1).getDay()

  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    setLoading(true)
    fetch(`/api/social/posts?month=${monthStr}`)
      .then(res => res.json())
      .then(result => {
        const items = result.data || result || []
        const grouped: Record<string, CalendarPost[]> = {}
        items.forEach((item: any) => {
          const dateStr = (item.scheduledDate || item.publishedDate || item.createdAt || '').slice(0, 10)
          if (!dateStr) return
          const post: CalendarPost = {
            id: item.id,
            client: item.client?.name || item.client || '',
            platform: item.platform || '',
            postType: item.postType || item.contentType || 'Image Post',
            topic: item.topic || item.postTopic || item.title || '',
            status: item.status || 'DRAFT',
          }
          if (!grouped[dateStr]) grouped[dateStr] = []
          grouped[dateStr].push(post)
        })
        setCalendarPosts(grouped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year, month])

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400 border-green-200'
      case 'SCHEDULED': return 'bg-blue-500/20 text-blue-400 border-blue-200'
      case 'DRAFT': return 'bg-amber-500/20 text-amber-400 border-amber-200'
      default: return 'bg-slate-800/50 text-slate-200 border-white/10'
    }
  }

  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case 'Instagram': return '📸'
      case 'Facebook': return '👤'
      case 'LinkedIn': return '💼'
      case 'YouTube': return '▶️'
      default: return '📱'
    }
  }

  const renderCalendarDays = () => {
    const cells: React.ReactNode[] = []

    // Empty cells for days before the 1st
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-36 bg-slate-900/40 border border-white/5" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const posts = calendarPosts[dateStr] || []
      const today = new Date()
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

      cells.push(
        <div
          key={day}
          className={`h-36 border border-white/10 p-2 overflow-hidden ${isToday ? 'bg-pink-50' : 'glass-card'}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-pink-600' : 'text-slate-300'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {posts.slice(0, 3).map(post => (
              <div
                key={post.id}
                className={`text-xs px-1.5 py-0.5 rounded truncate border ${getStatusColor(post.status)}`}
                title={`${post.client}: ${post.topic}`}
              >
                {getPlatformEmoji(post.platform)} {post.client.split(' ')[0]}
              </div>
            ))}
            {posts.length > 3 && (
              <div className="text-xs text-slate-400">+{posts.length - 3} more</div>
            )}
          </div>
        </div>
      )
    }

    return cells
  }

  // Count posts by status
  const allPosts = Object.values(calendarPosts).flat()
  const publishedCount = allPosts.filter(p => p.status === 'PUBLISHED').length
  const scheduledCount = allPosts.filter(p => p.status === 'SCHEDULED').length
  const draftCount = allPosts.filter(p => p.status === 'DRAFT').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Calendar</h1>
            <p className="text-pink-200">Monthly view of all social media posts</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={goToPrevMonth} className="p-2 hover:bg-white/10 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold">{currentMonth}</span>
            <button onClick={goToNextMonth} className="p-2 hover:bg-white/10 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Posts</p>
          <p className="text-3xl font-bold text-slate-200">{allPosts.length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Published</p>
          <p className="text-3xl font-bold text-green-400">{publishedCount}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Scheduled</p>
          <p className="text-3xl font-bold text-blue-400">{scheduledCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Draft</p>
          <p className="text-3xl font-bold text-amber-400">{draftCount}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-200" />
          <span className="text-slate-300">Published</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-200" />
          <span className="text-slate-300">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-200" />
          <span className="text-slate-300">Draft</span>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <span className="text-slate-400">|</span>
          <span>📸 Instagram</span>
          <span>👤 Facebook</span>
          <span>💼 LinkedIn</span>
          <span>▶️ YouTube</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-slate-900/40 border-b border-white/10">
          {days.map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-slate-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  )
}
