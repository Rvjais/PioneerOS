'use client'

import { useState, useEffect } from 'react'

interface CalendarEvent {
  date: string
  title: string
  type: string
  client: string
}

export default function SeoCalendarPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    // Fetch SEO tasks for the current month to populate calendar
    const startDate = new Date(currentYear, currentMonth, 1).toISOString()
    const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString()
    fetch(`/api/seo/tasks?status=ALL`)
      .then(res => res.json())
      .then(data => {
        const tasks = data.tasks || []
        const mapped: CalendarEvent[] = tasks
          .filter((t: any) => t.deadline)
          .map((t: any) => ({
            date: new Date(t.deadline).toISOString().split('T')[0],
            title: t.description?.substring(0, 50) || 'SEO Task',
            type: t.taskType || 'Content',
            client: t.client?.name || '',
          }))
        setEvents(mapped)
      })
      .catch(() => {})
  }, [currentYear, currentMonth])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Content': return 'bg-emerald-500'
      case 'On Page': return 'bg-blue-500'
      case 'Off Page': return 'bg-purple-500'
      case 'Technical': return 'bg-amber-500'
      case 'Reporting': return 'bg-indigo-500'
      case 'Meeting': return 'bg-pink-500'
      default: return 'bg-slate-900/40'
    }
  }

  const days: React.ReactNode[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 bg-slate-900/40" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const events = getEventsForDate(day)
    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
    days.push(
      <div
        key={day}
        className={`h-32 border border-white/10 p-2 ${isToday ? 'bg-teal-500/10' : 'glass-card'}`}
      >
        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-teal-600' : 'text-slate-300'}`}>
          {day}
        </div>
        <div className="space-y-1">
          {events.slice(0, 2).map((event, idx) => (
            <div
              key={event.title}
              className={`text-xs p-1 rounded text-white truncate ${getTypeColor(event.type)}`}
              title={event.title}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SEO Calendar</h1>
            <p className="text-teal-200">{monthName}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              Previous
            </button>
            <button onClick={nextMonth} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {['Content', 'On Page', 'Off Page', 'Technical', 'Reporting', 'Meeting'].map(type => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${getTypeColor(type)}`} />
            <span className="text-sm text-slate-300">{type}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-900/40 border-b border-white/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-300">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Upcoming Deadlines</h2>
        </div>
        <div className="divide-y divide-white/10">
          {events.filter(e => new Date(e.date) >= today).slice(0, 5).length === 0 ? (
            <div className="p-4 text-center text-slate-400">No upcoming deadlines</div>
          ) : events.filter(e => new Date(e.date) >= today).slice(0, 5).map((event, idx) => (
            <div key={`${event.date}-${event.title}`} className="p-4 flex items-center gap-4">
              <div className={`w-2 h-10 rounded-full ${getTypeColor(event.type)}`} />
              <div className="flex-1">
                <p className="font-medium text-white">{event.title}</p>
                <p className="text-sm text-slate-400">{event.client}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-xs text-slate-400">{event.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
