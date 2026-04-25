'use client'

import { useState, useEffect } from 'react'

interface AnalyticsEvent {
  id: string
  title: string
  type: 'REPORT' | 'REVIEW' | 'MEETING' | 'DEADLINE'
  date: string | null
  startTime?: string
  description?: string | null
  isAllDay?: boolean
  priority?: string
  status?: string
  client?: { id: string; name: string } | null
  assignee?: { id: string; firstName: string; lastName?: string | null } | null
  participants?: Array<{ id: string; firstName: string; lastName?: string | null }>
}

interface AnalyticsCalendarData {
  events: AnalyticsEvent[]
  eventsByDate: Record<string, AnalyticsEvent[]>
  stats: {
    totalEvents: number
    reports: number
    reviews: number
    meetings: number
    deadlines: number
  }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  REPORT: { bg: 'bg-cyan-500/20', border: 'border-cyan-400', text: 'text-cyan-400' },
  REVIEW: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-400' },
  MEETING: { bg: 'bg-indigo-500/20', border: 'border-indigo-400', text: 'text-indigo-400' },
  DEADLINE: { bg: 'bg-red-500/20', border: 'border-red-400', text: 'text-red-400' },
}

const typeIcons: Record<string, JSX.Element> = {
  REPORT: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  REVIEW: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  MEETING: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  DEADLINE: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

export default function AnalyticsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [data, setData] = useState<AnalyticsCalendarData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'REPORT' | 'REVIEW' | 'MEETING' | 'DEADLINE'>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const res = await fetch(`/api/analytics/calendar?year=${year}&month=${month}`)
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch analytics calendar:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [currentDate])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const events = data?.eventsByDate[dateStr] || []
    if (filter === 'all') return events
    return events.filter(e => e.type === filter)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
  }

  const selectedDateEvents = selectedDate ? (data?.eventsByDate[selectedDate] || []) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Calendar</h1>
          <p className="text-slate-400 mt-1">Reports, reviews, meetings & deadlines</p>
        </div>
        {data?.stats && (
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">{data.stats.reports} Reports</span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">{data.stats.reviews} Reviews</span>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">{data.stats.meetings} Meetings</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'REPORT', 'REVIEW', 'MEETING', 'DEADLINE'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === type ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 overflow-hidden">
          {/* Month Navigation */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-bold">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {DAYS.map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-slate-300 bg-slate-900/40">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-28 border-b border-r border-white/5 bg-slate-900/40" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayEvents = getEventsForDate(day)
              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-28 border-b border-r border-white/5 p-2 text-left hover:bg-cyan-500/10 transition-colors ${isToday(day) ? 'bg-cyan-500/10' : ''} ${isSelected ? 'ring-2 ring-cyan-500 ring-inset' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${isToday(day) ? 'bg-cyan-600 text-white' : 'text-slate-200'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div key={event.id} className={`text-xs truncate px-1.5 py-0.5 rounded text-white ${typeColors[event.type]?.bg || 'bg-slate-700'}`}>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-xs text-slate-400 px-1">+{dayEvents.length - 2} more</div>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h3 className="font-semibold text-white">
              {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' }) : "Today's Events"}
            </h3>
          </div>
          <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
            {selectedDateEvents.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <svg className="w-10 h-10 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="mt-2">No events on this day</p>
              </div>
            ) : (
              selectedDateEvents.map(event => {
                const colors = typeColors[event.type] || typeColors.DEADLINE
                return (
                  <div key={event.id} className={`p-4 border-l-4 ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={colors.text}>{typeIcons[event.type]}</span>
                      <span className={`text-xs font-medium ${colors.text}`}>{event.type}</span>
                    </div>
                    <p className="font-medium text-white mt-1">{event.title}</p>
                    {event.client && <p className="text-sm text-cyan-400 mt-1">{event.client.name}</p>}
                    {event.startTime && <p className="text-sm text-slate-400 mt-1">{event.startTime}</p>}
                    {event.participants && event.participants.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">{event.participants.length} attendees</p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}