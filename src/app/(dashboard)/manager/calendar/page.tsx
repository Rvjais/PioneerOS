'use client'

import { useState } from 'react'

interface CalendarEvent {
  id: string
  title: string
  time: string
  duration: string
  type: 'MEETING' | 'REVIEW' | 'CALL' | 'DEADLINE'
  department?: string
  attendees?: string[]
}

const EVENTS: Record<string, CalendarEvent[]> = {
  '2024-03-11': [
    { id: '1', title: 'Daily Operations Meeting', time: '10:00', duration: '30 min', type: 'MEETING', attendees: ['All Team Leads'] },
    { id: '2', title: 'Apollo Hospitals Escalation Call', time: '11:00', duration: '1 hr', type: 'CALL', department: 'SEO' },
    { id: '3', title: 'HR Sync - Interview Pipeline', time: '14:00', duration: '45 min', type: 'MEETING', department: 'HR' },
    { id: '4', title: 'Sales Pipeline Review', time: '15:00', duration: '30 min', type: 'REVIEW', department: 'Sales' },
  ],
  '2024-03-12': [
    { id: '5', title: 'Weekly Tactical Meeting', time: '10:00', duration: '1 hr', type: 'MEETING', attendees: ['Department Heads'] },
    { id: '6', title: 'Senior Developer Interview', time: '14:00', duration: '1 hr', type: 'MEETING', department: 'HR' },
    { id: '7', title: 'Client Retention Review', time: '16:00', duration: '30 min', type: 'REVIEW' },
  ],
  '2024-03-13': [
    { id: '8', title: 'Ads Campaign Review', time: '11:00', duration: '45 min', type: 'REVIEW', department: 'Ads' },
    { id: '9', title: 'Vendor Payment Deadline', time: '17:00', duration: '-', type: 'DEADLINE', department: 'Accounts' },
  ],
  '2024-03-14': [
    { id: '10', title: 'Team Performance Review', time: '10:00', duration: '2 hr', type: 'REVIEW', attendees: ['All Managers'] },
    { id: '11', title: 'Q2 Planning Session', time: '14:00', duration: '2 hr', type: 'MEETING', attendees: ['Leadership'] },
  ],
  '2024-03-15': [
    { id: '12', title: 'Strategic Meeting', time: '10:00', duration: '2 hr', type: 'MEETING', attendees: ['Leadership'] },
    { id: '13', title: 'Monthly Client Satisfaction Review', time: '15:00', duration: '1 hr', type: 'REVIEW' },
  ],
}

export default function ManagerCalendarPage() {
  const [selectedDate, setSelectedDate] = useState('2024-03-11')
  const [currentYear, setCurrentYear] = useState(2024)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2) // March = 2

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const currentMonth = `${monthNames[currentMonthIndex]} ${currentYear}`

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1)
    }
  }

  // Generate calendar days
  const daysInMonth = 31
  const firstDayOfMonth = 5 // Friday (0 = Sunday)
  const calendarDays: (number | null)[] = []

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'MEETING': return 'bg-blue-500/20 text-blue-400 border-blue-200'
      case 'REVIEW': return 'bg-purple-500/20 text-purple-400 border-purple-200'
      case 'CALL': return 'bg-green-500/20 text-green-400 border-green-200'
      case 'DEADLINE': return 'bg-red-500/20 text-red-400 border-red-200'
      default: return 'bg-slate-800/50 text-slate-200 border-white/10'
    }
  }

  const selectedEvents = EVENTS[selectedDate] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-purple-200">{currentMonth}</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-purple-200 text-sm">This Week</p>
              <p className="text-2xl font-bold">{Object.values(EVENTS).flat().length} events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-800/50 rounded-lg">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-semibold text-white">{currentMonth}</h2>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-800/50 rounded-lg">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="p-2" />
              }
              const dateKey = `2024-03-${day.toString().padStart(2, '0')}`
              const hasEvents = EVENTS[dateKey]?.length > 0
              const isSelected = selectedDate === dateKey
              const isToday = day === 11

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    isSelected
                      ? 'bg-purple-500 text-white'
                      : isToday
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{day}</span>
                  {hasEvents && !isSelected && (
                    <div className="flex justify-center mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Events for Selected Day */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">
              {new Date(selectedDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h2>
            <p className="text-sm text-slate-400">{selectedEvents.length} events</p>
          </div>

          <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto">
            {selectedEvents.length > 0 ? (
              selectedEvents.map(event => (
                <div key={event.id} className={`p-4 border-l-4 ${getEventColor(event.type)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-400">{event.time}</span>
                    <span className="text-xs text-slate-400">{event.duration}</span>
                  </div>
                  <p className="font-medium text-white mb-1">{event.title}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getEventColor(event.type)}`}>
                      {event.type}
                    </span>
                    {event.department && (
                      <span className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">
                        {event.department}
                      </span>
                    )}
                  </div>
                  {event.attendees && (
                    <p className="text-xs text-slate-400 mt-2">
                      {event.attendees.join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                No events scheduled
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Upcoming Deadlines</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card rounded-lg p-3 border border-red-100">
            <p className="text-sm text-red-400">Mar 13</p>
            <p className="font-medium text-white">Vendor Payment Deadline</p>
            <p className="text-xs text-slate-400">Accounts</p>
          </div>
          <div className="glass-card rounded-lg p-3 border border-red-100">
            <p className="text-sm text-red-400">Mar 15</p>
            <p className="font-medium text-white">Q1 Report Submission</p>
            <p className="text-xs text-slate-400">All Departments</p>
          </div>
          <div className="glass-card rounded-lg p-3 border border-red-100">
            <p className="text-sm text-red-400">Mar 20</p>
            <p className="font-medium text-white">Client Contract Renewals</p>
            <p className="text-xs text-slate-400">Sales</p>
          </div>
        </div>
      </div>
    </div>
  )
}
