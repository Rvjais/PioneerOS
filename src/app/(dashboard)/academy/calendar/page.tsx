'use client'

import { useState, useEffect } from 'react'

interface AcademyEvent {
  id: string
  title: string
  type: 'COURSE' | 'WEBINAR' | 'ASSIGNMENT' | 'EXAM' | 'SESSION'
  date: string | null
  startTime?: string
  description?: string | null
  isAllDay?: boolean
  priority?: string
  status?: string
  client?: { id: string; name: string } | null
  assignee?: { id: string; firstName: string; lastName?: string | null } | null
}

interface AcademyCalendarData {
  events: AcademyEvent[]
  eventsByDate: Record<string, AcademyEvent[]>
  stats: {
    totalEvents: number
    courses: number
    webinars: number
    assignments: number
    exams: number
    sessions: number
  }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  COURSE: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-400' },
  WEBINAR: { bg: 'bg-indigo-500/20', border: 'border-indigo-400', text: 'text-indigo-400' },
  ASSIGNMENT: { bg: 'bg-amber-500/20', border: 'border-amber-400', text: 'text-amber-400' },
  EXAM: { bg: 'bg-red-500/20', border: 'border-red-400', text: 'text-red-400' },
  SESSION: { bg: 'bg-green-500/20', border: 'border-green-400', text: 'text-green-400' },
}

const typeIcons: Record<string, JSX.Element> = {
  COURSE: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  WEBINAR: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  ASSIGNMENT: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  EXAM: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  SESSION: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
}

export default function AcademyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [data, setData] = useState<AcademyCalendarData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'COURSE' | 'WEBINAR' | 'ASSIGNMENT' | 'EXAM' | 'SESSION'>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const res = await fetch(`/api/academy/calendar?year=${year}&month=${month}`)
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch academy calendar:', error)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Academy Calendar</h1>
          <p className="text-slate-400 mt-1">Courses, webinars, assignments, exams & sessions</p>
        </div>
        {data?.stats && (
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">{data.stats.courses} Courses</span>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">{data.stats.webinars} Webinars</span>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full">{data.stats.assignments} Assignments</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'COURSE', 'WEBINAR', 'ASSIGNMENT', 'EXAM', 'SESSION'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === type ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
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
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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
                  className={`h-28 border-b border-r border-white/5 p-2 text-left hover:bg-blue-500/10 transition-colors ${isToday(day) ? 'bg-blue-500/10' : ''} ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-200'}`}>
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
                const colors = typeColors[event.type] || typeColors.SESSION
                return (
                  <div key={event.id} className={`p-4 border-l-4 ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={colors.text}>{typeIcons[event.type]}</span>
                      <span className={`text-xs font-medium ${colors.text}`}>{event.type}</span>
                    </div>
                    <p className="font-medium text-white mt-1">{event.title}</p>
                    {event.startTime && <p className="text-sm text-slate-400 mt-1">{event.startTime}</p>}
                    {event.assignee && <p className="text-xs text-slate-400 mt-1">Assigned to: {event.assignee.firstName}</p>}
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