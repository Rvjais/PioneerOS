'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'invoice' | 'payment_due' | 'contract' | 'meeting' | 'followup'
  client?: string
  amount?: number
}

const eventTypeColors = {
  invoice: 'bg-blue-500',
  payment_due: 'bg-red-500',
  contract: 'bg-purple-500',
  meeting: 'bg-amber-500',
  followup: 'bg-emerald-500'
}

const eventTypeBgColors = {
  invoice: 'bg-blue-500/20 border-blue-500/30',
  payment_due: 'bg-red-500/20 border-red-500/30',
  contract: 'bg-purple-500/20 border-purple-500/30',
  meeting: 'bg-amber-500/20 border-amber-500/30',
  followup: 'bg-emerald-500/20 border-emerald-500/30'
}

export default function AccountsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      // Fetch various financial events
      const [invoicesRes, contractsRes] = await Promise.all([
        fetch(`/api/accounts/calendar-events?year=${year}&month=${month}`),
        fetch(`/api/accounts/contracts?expiring=true`)
      ])

      const generatedEvents: CalendarEvent[] = []

      // Add payment due dates based on clients
      const clientsRes = await fetch('/api/clients?status=ACTIVE')
      if (clientsRes.ok) {
        const clients = await clientsRes.json()
        clients.forEach((client: { id: string; name: string; paymentDueDay?: number; monthlyFee?: number }) => {
          if (client.paymentDueDay) {
            const dueDate = new Date(year, month - 1, client.paymentDueDay)
            generatedEvents.push({
              id: `due-${client.id}`,
              title: `Payment due: ${client.name}`,
              date: dueDate.toISOString(),
              type: 'payment_due',
              client: client.name,
              amount: client.monthlyFee
            })
          }
        })
      }

      // Add invoice generation dates (usually 5th of month)
      generatedEvents.push({
        id: `invoice-gen-${month}`,
        title: 'Generate Monthly Invoices',
        date: new Date(year, month - 1, 5).toISOString(),
        type: 'invoice'
      })

      // Add strategic meeting (last working day)
      const lastDay = new Date(year, month, 0)
      while (lastDay.getDay() === 0 || lastDay.getDay() === 6) {
        lastDay.setDate(lastDay.getDate() - 1)
      }
      generatedEvents.push({
        id: `strategic-${month}`,
        title: 'Strategic Meeting',
        date: lastDay.toISOString(),
        type: 'meeting'
      })

      setEvents(generatedEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: (Date | null)[] = []

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Accounts Calendar</h1>
            <InfoTooltip
              title="Accounts Calendar"
              steps={[
                'View all important financial dates',
                'Payment due dates shown in red',
                'Invoice generation dates in blue',
                'Contract renewals in purple'
              ]}
              tips={[
                'Plan follow-ups around due dates',
                'Set reminders for important deadlines'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Track important financial dates</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(eventTypeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm text-slate-400 capitalize">{type.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const dayEvents = getEventsForDate(day)
                const isToday = day.toDateString() === today.toDateString()
                const isSelected = selectedDate?.toDateString() === day.toDateString()

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square p-1 rounded-lg transition-colors relative ${
                      isSelected
                        ? 'bg-emerald-600'
                        : isToday
                          ? 'bg-white/10 backdrop-blur-sm ring-2 ring-emerald-500'
                          : 'hover:bg-white/5'
                    }`}
                  >
                    <span className={`text-sm ${isSelected ? 'text-white' : isToday ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                      {day.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={`event-${event.type}-${i}`}
                            className={`w-1.5 h-1.5 rounded-full ${eventTypeColors[event.type]}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Day Events */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedDate
              ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
              : 'Select a date'
            }
          </h3>

          {selectedDate ? (
            selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${eventTypeBgColors[event.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${eventTypeColors[event.type]}`} />
                      <div>
                        <p className="font-medium text-white">{event.title}</p>
                        {event.client && (
                          <p className="text-sm text-slate-400">{event.client}</p>
                        )}
                        {event.amount && (
                          <p className="text-sm text-emerald-400">
                            Rs. {event.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No events on this date</p>
            )
          ) : (
            <p className="text-slate-400 text-center py-8">Click a date to see events</p>
          )}

          {/* Upcoming This Week */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Upcoming This Week</h4>
            <div className="space-y-2">
              {events
                .filter(e => {
                  const eventDate = new Date(e.date)
                  const weekFromNow = new Date()
                  weekFromNow.setDate(weekFromNow.getDate() + 7)
                  return eventDate >= today && eventDate <= weekFromNow
                })
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${eventTypeColors[event.type]}`} />
                    <span className="text-slate-400">{formatDateDDMMYYYY(event.date)}</span>
                    <span className="text-slate-300 truncate">{event.title}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
