'use client'

import { useState } from 'react'

interface CalendarEvent {
  id: string
  title: string
  time: string
  type: 'DEADLINE' | 'MEETING' | 'DEPLOYMENT' | 'REVIEW'
  project: string
}

const EVENTS: Record<string, CalendarEvent[]> = {
  '2024-03-11': [
    { id: '1', title: 'MedPlus Mobile Fixes Due', time: '17:00', type: 'DEADLINE', project: 'MedPlus Landing Page' },
    { id: '2', title: 'Daily Standup', time: '09:00', type: 'MEETING', project: 'Team' },
  ],
  '2024-03-12': [
    { id: '3', title: 'Apollo Hero Section Due', time: '17:00', type: 'DEADLINE', project: 'Apollo Website Revamp' },
    { id: '4', title: 'Client Review - Apollo', time: '14:00', type: 'MEETING', project: 'Apollo Website Revamp' },
  ],
  '2024-03-13': [
    { id: '5', title: 'CareConnect Form Review', time: '11:00', type: 'REVIEW', project: 'CareConnect Website' },
  ],
  '2024-03-14': [
    { id: '6', title: 'HealthFirst Optimization Due', time: '17:00', type: 'DEADLINE', project: 'HealthFirst Labs' },
  ],
  '2024-03-15': [
    { id: '7', title: 'MedPlus Staging Deployment', time: '15:00', type: 'DEPLOYMENT', project: 'MedPlus Landing Page' },
    { id: '8', title: 'Navigation Menu Due', time: '17:00', type: 'DEADLINE', project: 'Apollo Website Revamp' },
  ],
  '2024-03-20': [
    { id: '9', title: 'MedPlus Go Live', time: '10:00', type: 'DEPLOYMENT', project: 'MedPlus Landing Page' },
  ],
  '2024-03-25': [
    { id: '10', title: 'Apollo Website Launch', time: '10:00', type: 'DEPLOYMENT', project: 'Apollo Website Revamp' },
  ],
}

export default function WebCalendarPage() {
  const [selectedDate, setSelectedDate] = useState('2024-03-11')

  const currentMonth = 'March 2024'

  const daysInMonth = 31
  const firstDayOfMonth = 5
  const calendarDays: (number | null)[] = []

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'DEADLINE': return 'bg-red-500/20 text-red-400 border-red-200'
      case 'MEETING': return 'bg-blue-500/20 text-blue-400 border-blue-200'
      case 'DEPLOYMENT': return 'bg-green-500/20 text-green-400 border-green-200'
      case 'REVIEW': return 'bg-purple-500/20 text-purple-400 border-purple-200'
      default: return 'bg-slate-800/50 text-slate-200 border-white/10'
    }
  }

  const selectedEvents = EVENTS[selectedDate] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-indigo-200">{currentMonth}</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Deadlines This Week</p>
              <p className="text-2xl font-bold">4</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Deployments</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <button className="p-2 hover:bg-slate-800/50 rounded-lg">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-semibold text-white">March 2024</h2>
            <button className="p-2 hover:bg-slate-800/50 rounded-lg">
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
                      ? 'bg-indigo-500 text-white'
                      : isToday
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{day}</span>
                  {hasEvents && !isSelected && (
                    <div className="flex justify-center mt-1 gap-0.5">
                      {EVENTS[dateKey].slice(0, 3).map((e, i) => (
                        <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${
                          e.type === 'DEADLINE' ? 'bg-red-500' :
                          e.type === 'DEPLOYMENT' ? 'bg-green-500' :
                          e.type === 'MEETING' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`} />
                      ))}
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
                  </div>
                  <p className="font-medium text-white mb-1">{event.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getEventColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className="text-xs text-slate-400">{event.project}</span>
                  </div>
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
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { date: 'Mar 11', task: 'MedPlus Mobile Fixes', project: 'MedPlus Landing Page' },
            { date: 'Mar 12', task: 'Apollo Hero Section', project: 'Apollo Website Revamp' },
            { date: 'Mar 14', task: 'HealthFirst Optimization', project: 'HealthFirst Labs' },
            { date: 'Mar 15', task: 'Navigation Menu', project: 'Apollo Website Revamp' },
          ].map((deadline, idx) => (
            <div key={deadline.task} className="glass-card rounded-lg p-3 border border-red-100">
              <p className="text-sm text-red-400 font-medium">{deadline.date}</p>
              <p className="font-medium text-white">{deadline.task}</p>
              <p className="text-xs text-slate-400">{deadline.project}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
