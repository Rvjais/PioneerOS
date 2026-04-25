'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CalendarEvent {
  id: string
  title: string
  type: 'DESIGN' | 'REVIEW' | 'APPROVAL' | 'DELIVERY' | 'CLIENT' | 'MEETING'
  date: string
  time?: string
  personName?: string
  personId?: string
  status?: string
  priority?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


export default function DesignCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const month = currentDate.getMonth()
        const year = currentDate.getFullYear()
        const res = await fetch(`/api/design/calendar?month=${month}&year=${year}`)
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
      case 'DESIGN': return 'bg-purple-500'
      case 'REVIEW': return 'bg-violet-500'
      case 'APPROVAL': return 'bg-emerald-500'
      case 'DELIVERY': return 'bg-teal-500'
      case 'CLIENT': return 'bg-fuchsia-500'
      case 'MEETING': return 'bg-pink-500'
      default: return 'bg-slate-900/40'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'DESIGN': return 'Design'
      case 'REVIEW': return 'Review'
      case 'APPROVAL': return 'Approval'
      case 'DELIVERY': return 'Delivery'
      case 'CLIENT': return 'Client'
      case 'MEETING': return 'Meeting'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Design Calendar</h1>
          <p className="text-sm text-slate-400">Track design projects, reviews, approvals, and deliveries</p>
        </div>
        <Link
          href="/design/content"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium rounded-lg hover:opacity-90"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Content
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 overflow-hidden">
          {/* Month Navigation */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600 to-violet-600 text-white">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-lg">
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
                  className={`h-24 border-b border-r border-white/5 p-2 text-left hover:bg-violet-500/10 transition-colors ${
                    isToday(day) ? 'bg-violet-500/10' : ''
                  } ${isSelected ? 'ring-2 ring-violet-500 ring-inset' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                    isToday(day) ? 'bg-violet-500 text-white' : 'text-slate-200'
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
                : 'Select a date'}
            </h3>
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
                      {event.personName && (
                        <p className="text-sm text-violet-400">
                          {event.personName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded capitalize ${
                          event.type === 'DESIGN' ? 'bg-purple-500/20 text-purple-400' :
                          event.type === 'REVIEW' ? 'bg-violet-500/20 text-violet-400' :
                          event.type === 'APPROVAL' ? 'bg-emerald-500/20 text-emerald-400' :
                          event.type === 'DELIVERY' ? 'bg-teal-500/20 text-teal-400' :
                          event.type === 'CLIENT' ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                          'bg-pink-500/20 text-pink-400'
                        }`}>
                          {getEventTypeLabel(event.type)}
                        </span>
                        {event.time && (
                          <span className="text-xs text-slate-400">{event.time}</span>
                        )}
                      </div>
                      {event.status && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">
                          {event.status}
                        </span>
                      )}
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
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-slate-300">Design</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-sm text-slate-300">Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-300">Approval</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-sm text-slate-300">Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
            <span className="text-sm text-slate-300">Client</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-sm text-slate-300">Meeting</span>
          </div>
        </div>
      </div>
    </div>
  )
}
