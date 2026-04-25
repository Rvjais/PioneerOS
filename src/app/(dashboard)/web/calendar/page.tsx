'use client'

import { useState, useEffect } from 'react'

interface CalendarEvent {
  id: string
  title: string
  type: 'DEVELOPMENT' | 'DESIGN' | 'MEETING' | 'DEPLOYMENT' | 'REVIEW' | 'DEADLINE' | 'CLIENT'
  date: string
  time?: string
  projectName?: string
  assigneeName?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function WebCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const month = currentDate.getMonth()
        const year = currentDate.getFullYear()
        const res = await fetch(`/api/web/calendar?month=${month}&year=${year}`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Failed to fetch calendar events:', error)
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
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const selectedDateEvents = selectedDate ? events.filter(e => e.date === selectedDate) : []

  const getEventColor = (type: string) => {
    switch (type) {
      case 'DEVELOPMENT': return 'bg-blue-500'
      case 'DESIGN': return 'bg-purple-500'
      case 'MEETING': return 'bg-cyan-500'
      case 'DEPLOYMENT': return 'bg-green-500'
      case 'REVIEW': return 'bg-amber-500'
      case 'DEADLINE': return 'bg-red-500'
      case 'CLIENT': return 'bg-indigo-500'
      default: return 'bg-slate-900/40'
    }
  }

  const getEventTypeBg = (type: string) => {
    switch (type) {
      case 'DEVELOPMENT': return 'bg-blue-500/20 text-blue-400'
      case 'DESIGN': return 'bg-purple-500/20 text-purple-400'
      case 'MEETING': return 'bg-cyan-500/20 text-cyan-400'
      case 'DEPLOYMENT': return 'bg-green-500/20 text-green-400'
      case 'REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'DEADLINE': return 'bg-red-500/20 text-red-400'
      case 'CLIENT': return 'bg-indigo-500/20 text-indigo-400'
      default: return 'bg-slate-800/50 text-slate-300'
    }
  }

  // Event type counts
  const eventCounts = {
    development: events.filter(e => e.type === 'DEVELOPMENT').length,
    design: events.filter(e => e.type === 'DESIGN').length,
    meetings: events.filter(e => e.type === 'MEETING').length,
    deployments: events.filter(e => e.type === 'DEPLOYMENT').length,
    deadlines: events.filter(e => e.type === 'DEADLINE').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Web Calendar</h1>
            <p className="text-indigo-200">Development milestones, meetings, and deadlines</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={goToToday} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Development</p>
          <p className="text-3xl font-bold text-blue-400">{eventCounts.development}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Design</p>
          <p className="text-3xl font-bold text-purple-400">{eventCounts.design}</p>
        </div>
        <div className="bg-cyan-500/10 rounded-xl border border-cyan-200 p-4">
          <p className="text-sm text-cyan-400">Meetings</p>
          <p className="text-3xl font-bold text-cyan-400">{eventCounts.meetings}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Deployments</p>
          <p className="text-3xl font-bold text-green-400">{eventCounts.deployments}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Deadlines</p>
          <p className="text-3xl font-bold text-red-400">{eventCounts.deadlines}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 overflow-hidden">
          {/* Month Navigation */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {DAYS.map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-slate-300 bg-slate-900/40">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 border-b border-r border-white/5 bg-slate-900/40" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayEvents = getEventsForDate(day)
              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-24 border-b border-r border-white/5 p-2 text-left hover:bg-indigo-500/10 transition-colors ${
                    isToday(day) ? 'bg-indigo-500/10' : ''
                  } ${isSelected ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                    isToday(day) ? 'bg-indigo-500 text-white' : 'text-slate-200'
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs truncate px-1.5 py-0.5 rounded text-white ${getEventColor(event.type)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-slate-400 px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h3 className="font-semibold text-white">
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                : "Today's Schedule"}
            </h3>
            {selectedDate && (
              <p className="text-sm text-indigo-400">{selectedDateEvents.length} event(s)</p>
            )}
          </div>
          <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
            {selectedDateEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No events for this date</p>
              </div>
            ) : (
              selectedDateEvents.map(event => (
                <div key={event.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getEventColor(event.type)}`} />
                    <div className="flex-1">
                      <p className="font-medium text-white">{event.title}</p>
                      {event.projectName && (
                        <p className="text-sm text-indigo-400">{event.projectName}</p>
                      )}
                      {event.assigneeName && (
                        <p className="text-sm text-slate-400">{event.assigneeName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded capitalize ${getEventTypeBg(event.type)}`}>
                          {event.type}
                        </span>
                        {event.time && (
                          <span className="text-xs text-slate-400">{event.time}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-3">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-300">Development</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-slate-300">Design</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-sm text-slate-300">Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-slate-300">Deployment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-300">Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-slate-300">Deadline</span>
          </div>
        </div>
      </div>
    </div>
  )
}