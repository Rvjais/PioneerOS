'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  client: string
  type: 'launch' | 'optimization' | 'review' | 'report' | 'meeting'
  platform?: string
}

export default function AdsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarEvents, setCalendarEvents] = useState<Record<string, CalendarEvent[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/ads/campaigns?limit=50')
        if (!res.ok) throw new Error('Failed to fetch campaigns')
        const data = await res.json()
        const campaigns = data.campaigns || []

        // Group campaigns by their start date as calendar events
        const eventsMap: Record<string, CalendarEvent[]> = {}
        for (const campaign of campaigns) {
          const dateStr = campaign.startDate
            ? new Date(campaign.startDate).toISOString().split('T')[0]
            : campaign.createdAt
              ? new Date(campaign.createdAt).toISOString().split('T')[0]
              : null
          if (!dateStr) continue

          const eventType: CalendarEvent['type'] =
            campaign.status === 'DRAFT' ? 'review'
            : campaign.status === 'ACTIVE' ? 'launch'
            : campaign.status === 'PAUSED' ? 'optimization'
            : campaign.status === 'COMPLETED' ? 'report'
            : 'review'

          const event: CalendarEvent = {
            id: campaign.id,
            title: campaign.name,
            client: campaign.client?.name || 'Unknown',
            type: eventType,
            platform: campaign.platform,
          }

          if (!eventsMap[dateStr]) eventsMap[dateStr] = []
          eventsMap[dateStr].push(event)

          // Also add end date as a separate event if present
          if (campaign.endDate) {
            const endDateStr = new Date(campaign.endDate).toISOString().split('T')[0]
            if (endDateStr !== dateStr) {
              const endEvent: CalendarEvent = {
                id: `${campaign.id}-end`,
                title: `${campaign.name} (ends)`,
                client: campaign.client?.name || 'Unknown',
                type: 'report',
                platform: campaign.platform,
              }
              if (!eventsMap[endDateStr]) eventsMap[endDateStr] = []
              eventsMap[endDateStr].push(endEvent)
            }
          }
        }
        setCalendarEvents(eventsMap)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calendar data')
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [currentDate])

  if (loading) return <div className="space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().split('T')[0]

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'launch': return 'bg-green-500/20 text-green-400 border-green-200'
      case 'optimization': return 'bg-orange-500/20 text-orange-400 border-orange-200'
      case 'review': return 'bg-blue-500/20 text-blue-400 border-blue-200'
      case 'report': return 'bg-purple-500/20 text-purple-400 border-purple-200'
      case 'meeting': return 'bg-amber-500/20 text-amber-400 border-amber-200'
      default: return 'bg-slate-800/50 text-slate-200 border-white/10'
    }
  }

  const renderCalendarDays = () => {
    const cells: React.ReactNode[] = []

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 bg-slate-900/40 border border-white/5" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const events = calendarEvents[dateStr] || []
      const isToday = dateStr === todayStr

      cells.push(
        <div
          key={day}
          className={`h-32 border border-white/10 p-2 overflow-hidden ${isToday ? 'bg-red-500/10' : 'glass-card'}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-red-400' : 'text-slate-300'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1.5 py-0.5 rounded truncate border ${getEventTypeColor(event.type)}`}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-slate-400">+{events.length - 2} more</div>
            )}
          </div>
        </div>
      )
    }

    return cells
  }

  // Derive upcoming deadlines from fetched calendar events (future dates only)
  const upcomingDeadlines = Object.entries(calendarEvents)
    .filter(([dateStr]) => dateStr >= todayStr)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([dateStr, events]) =>
      events.map(event => ({
        date: new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        task: event.title,
        client: event.client,
        type: event.type,
      }))
    )
    .slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-red-200">Campaign launches and deadlines</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg" aria-label="Previous month" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold">{currentMonth}</span>
            <button className="p-2 hover:bg-white/10 rounded-lg" aria-label="Next month" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-200" />
          <span className="text-slate-300">Launch</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-200" />
          <span className="text-slate-300">Optimization</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-200" />
          <span className="text-slate-300">Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-200" />
          <span className="text-slate-300">Report</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-200" />
          <span className="text-slate-300">Meeting</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-900/40 border-b border-white/10">
          {days.map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-slate-300">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Upcoming Deadlines</h2>
        </div>
        <div className="divide-y divide-white/10">
          {upcomingDeadlines.map((deadline, idx) => (
            <div key={`${deadline.date}-${deadline.task}`} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-red-400 w-16">{deadline.date}</div>
                <div>
                  <p className="font-medium text-white">{deadline.task}</p>
                  <p className="text-sm text-slate-400">{deadline.client}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getEventTypeColor(deadline.type)}`}>
                {deadline.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
