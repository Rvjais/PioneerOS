'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface CalendarEvent {
  id: string
  title: string
  client: string
  type: 'content' | 'approval' | 'scheduling' | 'meeting' | 'report'
  platform?: string
  date?: string
}

export default function SocialCalendarPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('content')
  const [newEventClient, setNewEventClient] = useState('')
  const [newEventPlatform, setNewEventPlatform] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const monthLabel = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startDay = new Date(currentYear, currentMonth, 1).getDay()

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))

  useEffect(() => {
    // Fetch approvals with due dates to populate calendar
    fetch('/api/social/approvals?limit=100')
      .then(res => res.json())
      .then(result => {
        const approvals = result.approvals || []
        const eventMap: Record<string, CalendarEvent[]> = {}
        approvals.forEach((a: any) => {
          if (a.dueDate) {
            const dateStr = new Date(a.dueDate).toISOString().split('T')[0]
            if (!eventMap[dateStr]) eventMap[dateStr] = []
            eventMap[dateStr].push({
              id: a.id,
              title: a.title || 'Approval',
              client: a.client?.name || '',
              type: a.type === 'CREATIVE' ? 'approval' : 'content',
              platform: a.platform || undefined,
            })
          }
        })
        setEvents(eventMap)
      })
      .catch(() => {})
  }, [currentYear, currentMonth])

  const handleAddEvent = async () => {
    if (!selectedDate || !newEventTitle.trim()) {
      toast.error('Please enter an event title')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEventTitle,
          type: newEventType === 'content' ? 'EVENT' : newEventType === 'meeting' ? 'MEETING' : newEventType === 'task' ? 'TASK' : 'DEADLINE',
          date: new Date(selectedDate).toISOString(),
          description: newEventClient ? `Client: ${newEventClient}` : '',
          clientId: newEventClient,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const dateStr = selectedDate
        setEvents(prev => ({
          ...prev,
          [dateStr]: [
            ...(prev[dateStr] || []),
            {
              id: data.id || `evt-${Date.now()}`,
              title: newEventTitle,
              client: newEventClient,
              type: newEventType,
              platform: newEventPlatform,
            },
          ],
        }))
        setShowAddModal(false)
        setNewEventTitle('')
        setNewEventType('content')
        setNewEventClient('')
        setNewEventPlatform('')
        setSelectedDate(null)
        toast.success('Event added successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add event')
      }
    } catch {
      toast.error('Failed to add event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAddModal = (dateStr: string) => {
    setSelectedDate(dateStr)
    setShowAddModal(true)
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'content': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'approval': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'scheduling': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'meeting': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'report': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-slate-800/50 text-slate-200 border-white/10'
    }
  }

  const renderCalendarDays = () => {
    const cells: React.ReactNode[] = []

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 bg-slate-900/40 border border-white/5" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayEvents = events[dateStr] || []
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

      cells.push(
        <div
          key={day}
          onClick={() => openAddModal(dateStr)}
          className={`h-32 border border-white/10 p-2 overflow-hidden cursor-pointer hover:bg-pink-500/5 transition-colors ${isToday ? 'bg-pink-500/10' : 'bg-slate-800/50'}`}
        >
          <div className="flex items-center justify-between">
            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-pink-400' : 'text-slate-300'}`}>
              {day}
            </div>
            <button className="opacity-0 hover:opacity-100 p-1 text-pink-400 hover:bg-pink-500/20 rounded">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1.5 py-0.5 rounded truncate border ${getEventTypeColor(event.type)}`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-slate-400">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      )
    }

    return cells
  }

  // Upcoming deadlines from events
  const upcomingDeadlines = Object.entries(events)
    .flatMap(([date, evts]) => evts.map(e => ({ ...e, date })))
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-pink-200">Content and deadline management</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold">{monthLabel}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        {['content', 'approval', 'scheduling', 'meeting', 'report'].map(type => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${getEventTypeColor(type).split(' ')[0]}`} />
            <span className="text-slate-300 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden">
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
      <div className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Upcoming Deadlines</h2>
        </div>
        <div className="divide-y divide-white/10">
          {upcomingDeadlines.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No upcoming deadlines</div>
          ) : upcomingDeadlines.map((deadline) => (
            <div key={`${deadline.date}-${deadline.id}`} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-pink-400 w-16">
                  {new Date(deadline.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
                <div>
                  <p className="font-medium text-white">{deadline.title}</p>
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

      {/* Add Event Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-slate-800 rounded-xl shadow-none w-full max-w-md">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Add Event</h2>
                <p className="text-sm text-slate-400">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g., Client review, Content deadline..."
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Event Type</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as CalendarEvent['type'])}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                >
                  <option value="content">Content</option>
                  <option value="approval">Approval</option>
                  <option value="scheduling">Scheduling</option>
                  <option value="meeting">Meeting</option>
                  <option value="report">Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Client (optional)</label>
                <input
                  type="text"
                  value={newEventClient}
                  onChange={(e) => setNewEventClient(e.target.value)}
                  placeholder="Client name..."
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Platform (optional)</label>
                <input
                  type="text"
                  value={newEventPlatform}
                  onChange={(e) => setNewEventPlatform(e.target.value)}
                  placeholder="e.g., Instagram, LinkedIn..."
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                />
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!newEventTitle.trim() || isSubmitting}
                className="px-4 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
