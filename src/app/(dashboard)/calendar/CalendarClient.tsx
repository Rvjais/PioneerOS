'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface Meeting {
  id: string
  title: string
  date: string
  type: string
  client?: { name: string } | null
  participants?: Array<{ user: { firstName: string; lastName?: string | null } }>
}

interface Event {
  id: string
  title: string
  date: string
  type: string
  isAllDay: boolean
}

interface Task {
  id: string
  title: string
  dueDate: string
  priority: string
  client?: { name: string } | null
  assignee?: { firstName: string; lastName?: string | null } | null
}

interface LeaveRequest {
  id: string
  type: string
  startDate: string
  endDate: string
  status: string
  user: {
    id: string
    firstName: string
    lastName?: string | null
  }
}

interface TacticalDeadline {
  month: string
  dueDate: string
  pendingCount: number
}

interface HRAnnouncement {
  id: string
  title: string
  date: string
  type: string
}

interface CalendarData {
  meetings: Meeting[]
  events: Event[]
  tasks: Task[]
  leaves: LeaveRequest[]
  tacticalDeadlines: TacticalDeadline[]
  hrAnnouncements: HRAnnouncement[]
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string | null
}

interface ClientOption {
  id: string
  name: string
}

type CalendarItemType = 'MEETING' | 'DEADLINE' | 'REMINDER' | 'EVENT' | 'TASK'

interface NewCalendarItem {
  title: string
  description: string
  date: string
  endDate: string
  type: CalendarItemType
  isAllDay: boolean
  participantIds: string[]
  clientId: string
}

const INITIAL_NEW_ITEM: NewCalendarItem = {
  title: '',
  description: '',
  date: '',
  endDate: '',
  type: 'EVENT',
  isAllDay: true,
  participantIds: [],
  clientId: '',
}

interface CalendarClientProps {
  initialData: CalendarData
  currentUserId: string
  isManager: boolean
}

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  CLIENT_CALL: { bg: 'bg-blue-500/20', border: 'border-blue-300', text: 'text-blue-400' },
  INTERNAL: { bg: 'bg-purple-500/20', border: 'border-purple-300', text: 'text-purple-400' },
  REVIEW: { bg: 'bg-green-500/20', border: 'border-green-300', text: 'text-green-400' },
  TRAINING: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  EVENT: { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
  DEADLINE: { bg: 'bg-red-500/20', border: 'border-red-300', text: 'text-red-400' },
  LEAVE: { bg: 'bg-amber-500/20', border: 'border-amber-300', text: 'text-amber-400' },
  TACTICAL: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  HR_UPDATE: { bg: 'bg-teal-500/20', border: 'border-teal-500/30', text: 'text-teal-400' },
}

const leaveTypeLabels: Record<string, string> = {
  ANNUAL: 'Annual Leave',
  SICK: 'Sick Leave',
  CASUAL: 'Casual Leave',
  UNPAID: 'Unpaid Leave',
  WFH: 'Work From Home',
}

export function CalendarClient({ initialData, currentUserId, isManager }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarData>(initialData)
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'meetings' | 'leaves' | 'deadlines' | 'hr'>('all')

  // Add Event modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState<NewCalendarItem>(INITIAL_NEW_ITEM)
  const [creating, setCreating] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [participantSearch, setParticipantSearch] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = formatDateDDMMYYYY(currentDate)

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  // Create calendar grid
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Fetch data when month changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/calendar?year=${year}&month=${month + 1}`)
        if (res.ok) {
          const data = await res.json()
          setCalendarData(data)
        }
      } catch (error) {
        console.error('Failed to fetch calendar data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if not the initial month
    const initialMonth = new Date()
    if (year !== initialMonth.getFullYear() || month !== initialMonth.getMonth()) {
      fetchData()
    }
  }, [year, month])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDay(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDay(new Date().getDate())
  }

  // Fetch team members and clients when the add modal opens
  const fetchModalData = useCallback(async () => {
    try {
      const [usersRes, clientsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/clients?limit=200'),
      ])
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        const users = (usersData.users || usersData || []) as Array<{ id: string; firstName: string; lastName: string | null; status?: string }>
        setTeamMembers(
          users
            .filter((u) => u.status === 'ACTIVE' || !u.status)
            .map((u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }))
        )
      }
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        const list = (clientsData.clients || clientsData || []) as ClientOption[]
        setClients(list.map((c) => ({ id: c.id, name: c.name })))
      }
    } catch {
      // silently ignore - user can still create without participants/client
    }
  }, [])

  const openAddModal = (prefilledDay?: number) => {
    const prefillDate = prefilledDay
      ? new Date(year, month, prefilledDay, 12, 0, 0)
      : new Date(year, month, selectedDay || new Date().getDate(), 12, 0, 0)
    setNewItem({
      ...INITIAL_NEW_ITEM,
      date: prefillDate.toISOString().slice(0, 16),
    })
    setCreateError(null)
    setShowAddModal(true)
    fetchModalData()
  }

  const refreshCalendar = async () => {
    try {
      const res = await fetch(`/api/calendar?year=${year}&month=${month + 1}`)
      if (res.ok) {
        setCalendarData(await res.json())
      }
    } catch {
      // silently ignore
    }
  }

  const handleCreateItem = async () => {
    if (!newItem.title.trim() || !newItem.date) {
      setCreateError('Title and date are required')
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      const payload = {
        title: newItem.title.trim(),
        description: newItem.description.trim() || undefined,
        date: new Date(newItem.date).toISOString(),
        endDate: newItem.endDate ? new Date(newItem.endDate).toISOString() : undefined,
        type: newItem.type,
        isAllDay: newItem.isAllDay,
        participantIds: newItem.participantIds.length > 0 ? newItem.participantIds : undefined,
        clientId: newItem.clientId || undefined,
      }
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowAddModal(false)
        setNewItem(INITIAL_NEW_ITEM)
        await refreshCalendar()
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to create' }))
        setCreateError(err.error || 'Failed to create event')
      }
    } catch {
      setCreateError('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const toggleParticipant = (id: string) => {
    setNewItem(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(id)
        ? prev.participantIds.filter(pid => pid !== id)
        : [...prev.participantIds, id],
    }))
  }

  const filteredTeamMembers = teamMembers.filter(m => {
    if (!participantSearch) return true
    const name = `${m.firstName} ${m.lastName || ''}`.toLowerCase()
    return name.includes(participantSearch.toLowerCase())
  })

  // Helper to check if a date is within a leave range
  const isDateInLeaveRange = (day: number, leave: LeaveRequest) => {
    const date = new Date(year, month, day)
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    date.setHours(12, 0, 0, 0)
    return date >= start && date <= end
  }

  // Get items for a specific day
  const getItemsForDay = (day: number) => {
    const dayDate = new Date(year, month, day)
    const dayStr = dayDate.toISOString().split('T')[0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: Array<{ type: string; label: string; color: string; item: any }> = []

    // Meetings
    if (filter === 'all' || filter === 'meetings') {
      calendarData.meetings.forEach(meeting => {
        if (new Date(meeting.date).getDate() === day &&
            new Date(meeting.date).getMonth() === month &&
            new Date(meeting.date).getFullYear() === year) {
          items.push({
            type: 'meeting',
            label: meeting.title,
            color: typeColors[meeting.type]?.bg || 'bg-blue-500/20',
            item: meeting,
          })
        }
      })
    }

    // Events
    if (filter === 'all') {
      calendarData.events.forEach(event => {
        if (new Date(event.date).getDate() === day &&
            new Date(event.date).getMonth() === month &&
            new Date(event.date).getFullYear() === year) {
          items.push({
            type: 'event',
            label: event.title,
            color: 'bg-pink-500/20',
            item: event,
          })
        }
      })
    }

    // Leaves
    if (filter === 'all' || filter === 'leaves') {
      calendarData.leaves.forEach(leave => {
        if (isDateInLeaveRange(day, leave)) {
          items.push({
            type: 'leave',
            label: `${leave.user.firstName} - ${leaveTypeLabels[leave.type] || leave.type}`,
            color: 'bg-amber-500/20',
            item: leave,
          })
        }
      })
    }

    // Task deadlines
    if (filter === 'all' || filter === 'deadlines') {
      calendarData.tasks.forEach(task => {
        if (task.dueDate &&
            new Date(task.dueDate).getDate() === day &&
            new Date(task.dueDate).getMonth() === month &&
            new Date(task.dueDate).getFullYear() === year) {
          items.push({
            type: 'deadline',
            label: task.title,
            color: 'bg-red-500/20',
            item: task,
          })
        }
      })
    }

    // Tactical meeting deadline (3rd of every month)
    if ((filter === 'all' || filter === 'deadlines') && day === 3) {
      items.push({
        type: 'tactical',
        label: 'Tactical Report Due',
        color: 'bg-indigo-500/20',
        item: { type: 'tactical', dueDate: new Date(year, month, 3) },
      })
    }

    // HR Announcements
    if (filter === 'all' || filter === 'hr') {
      calendarData.hrAnnouncements.forEach(announcement => {
        if (new Date(announcement.date).getDate() === day &&
            new Date(announcement.date).getMonth() === month &&
            new Date(announcement.date).getFullYear() === year) {
          items.push({
            type: 'hr_update',
            label: announcement.title,
            color: 'bg-teal-500/20',
            item: announcement,
          })
        }
      })
    }

    return items
  }

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()

  // Get items for selected day or today
  const selectedDayItems = selectedDay ? getItemsForDay(selectedDay) :
    (month === today.getMonth() && year === today.getFullYear() ? getItemsForDay(today.getDate()) : [])

  // Upcoming leaves summary
  const upcomingLeaves = calendarData.leaves.filter(leave => {
    const start = new Date(leave.startDate)
    return start >= new Date() && leave.status === 'APPROVED'
  }).slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6 pb-8 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-slate-800 rounded" />
            <div className="h-4 w-56 bg-slate-800 rounded mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-800 rounded-xl" />
            <div className="h-6 w-40 bg-slate-800 rounded" />
            <div className="h-10 w-10 bg-slate-800 rounded-xl" />
          </div>
        </div>
        {/* Filter tabs skeleton */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-tab-${i}`} className="h-9 w-24 bg-slate-800 rounded-lg" />
          ))}
        </div>
        {/* Calendar grid skeleton */}
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-white/10">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={`skeleton-day-${i}`} className="p-3 flex justify-center">
                  <div className="h-4 w-8 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={`skeleton-cell-${i}`} className="min-h-[100px] p-2 border-b border-r border-white/5">
                  <div className="w-7 h-7 bg-slate-800 rounded-full mb-1" />
                  <div className="space-y-1">
                    <div className="h-3 w-full bg-slate-800/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 h-48" />
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 h-36" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-slate-400 mt-1">Meetings, leaves, deadlines & HR updates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth('prev')}
            title="Previous month"
            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl hover:bg-slate-900/40 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            Today
          </button>
          <span className="text-lg font-semibold text-white min-w-[180px] text-center">
            {monthName}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            title="Next month"
            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl hover:bg-slate-900/40 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All', icon: '📅' },
          { id: 'meetings', label: 'Meetings', icon: '👥' },
          { id: 'leaves', label: 'Leaves', icon: '🏖️' },
          { id: 'deadlines', label: 'Deadlines', icon: '⏰' },
          { id: 'hr', label: 'HR Updates', icon: '📢' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as 'all' | 'meetings' | 'leaves' | 'deadlines' | 'hr')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-blue-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-white/10 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-slate-400 bg-slate-900/40">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const items = day ? getItemsForDay(day) : []
              const isSelected = day === selectedDay
              const isTodayDate = day ? isToday(day) : false

              return (
                <div
                  key={`cal-${index}`}
                  onClick={() => day && setSelectedDay(day)}
                  className={`min-h-[100px] p-2 border-b border-r border-white/5 cursor-pointer transition-colors ${
                    day ? (isSelected ? 'bg-blue-500/10' : 'hover:bg-slate-900/40') : 'bg-slate-900/40'
                  }`}
                >
                  {day && (
                    <>
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1 ${
                        isTodayDate
                          ? 'bg-blue-600 text-white font-bold'
                          : isSelected
                            ? 'bg-blue-200 text-blue-400 font-medium'
                            : 'text-slate-200'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {items.slice(0, 3).map((item, i) => (
                          <div
                            key={`item-${item.label}-${i}`}
                            className={`px-1.5 py-0.5 rounded text-xs truncate ${item.color} ${
                              item.type === 'meeting' ? 'text-blue-400' :
                              item.type === 'leave' ? 'text-amber-400' :
                              item.type === 'deadline' ? 'text-red-400' :
                              item.type === 'tactical' ? 'text-indigo-700' :
                              item.type === 'hr_update' ? 'text-teal-700' :
                              'text-pink-700'
                            }`}
                          >
                            {item.label}
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="text-xs text-slate-400 px-1">+{items.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Day Details */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="font-semibold text-white">
                {selectedDay ? `${selectedDay} ${monthName}` : "Today's Schedule"}
              </h2>
              <p className="text-sm text-slate-400">
                {selectedDay
                  ? new Date(year, month, selectedDay).toLocaleDateString('en-IN', { weekday: 'long' })
                  : today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-[350px] overflow-y-auto">
              {selectedDayItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <svg className="w-10 h-10 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2">No events this day</p>
                </div>
              ) : (
                selectedDayItems.map((item, i) => {
                  const colors = typeColors[item.type.toUpperCase()] || typeColors.EVENT
                  return (
                    <div key={`event-${item.label}-${i}`} className={`p-3 border-l-4 ${colors.border} ${colors.bg}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${colors.text} capitalize`}>
                          {item.type.replace(/_/g, ' ')}
                        </span>
                        {item.item.type === 'tactical' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-200 text-indigo-700">
                            Due by 3rd
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-white mt-1">{item.label}</p>
                      {item.type === 'meeting' && (item.item as { client?: { name: string } }).client && (
                        <p className="text-xs text-slate-400">{(item.item as { client: { name: string } }).client.name}</p>
                      )}
                      {item.type === 'leave' && item.item.startDate && item.item.endDate && (
                        <p className="text-xs text-slate-400">
                          {new Date(item.item.startDate as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(item.item.endDate as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Upcoming Leaves */}
          {upcomingLeaves.length > 0 && (
            <div className="glass-card rounded-2xl border border-white/10 p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-amber-500">🏖️</span>
                Upcoming Leaves
              </h3>
              <div className="space-y-2">
                {upcomingLeaves.map(leave => (
                  <div key={leave.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="text-slate-300">{leave.user.firstName}</span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {new Date(leave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Stats */}
          <div className="glass-card rounded-2xl border border-white/10 p-4">
            <h3 className="font-semibold text-white mb-3">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-slate-300">Meetings</span>
                </div>
                <span className="font-medium text-white">{calendarData.meetings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-sm text-slate-300">Team Leaves</span>
                </div>
                <span className="font-medium text-white">{calendarData.leaves.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-sm text-slate-300">Deadlines</span>
                </div>
                <span className="font-medium text-white">{calendarData.tasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="text-sm text-slate-300">Tactical Due</span>
                </div>
                <span className="font-medium text-white">3rd</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="glass-card rounded-2xl border border-white/10 p-4">
            <h3 className="font-semibold text-white mb-3">Legend</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { color: 'bg-blue-500/20', label: 'Meetings' },
                { color: 'bg-amber-500/20', label: 'Leaves' },
                { color: 'bg-red-500/20', label: 'Deadlines' },
                { color: 'bg-indigo-500/20', label: 'Tactical' },
                { color: 'bg-teal-500/20', label: 'HR Updates' },
                { color: 'bg-pink-500/20', label: 'Events' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className={`w-3 h-3 rounded ${item.color}`}></span>
                  <span className="text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Event Button */}
      <button
        onClick={() => openAddModal()}
        title="Add calendar event"
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-105 z-40"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add Calendar Event</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {createError && (
                <div className="mb-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {createError}
                </div>
              )}

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Event title"
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    autoFocus
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                  <select
                    value={newItem.type}
                    onChange={e => setNewItem({ ...newItem, type: e.target.value as CalendarItemType })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="EVENT">Event</option>
                    <option value="MEETING">Meeting</option>
                    <option value="DEADLINE">Deadline</option>
                    <option value="REMINDER">Reminder</option>
                    <option value="TASK">Task</option>
                  </select>
                </div>

                {/* Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                    <input
                      type="datetime-local"
                      value={newItem.date}
                      onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={newItem.endDate}
                      onChange={e => setNewItem({ ...newItem, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* All Day Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, isAllDay: !newItem.isAllDay })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      newItem.isAllDay ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        newItem.isAllDay ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-300">All Day</span>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                </div>

                {/* Client */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Client (optional)</label>
                  <select
                    value={newItem.clientId}
                    onChange={e => setNewItem({ ...newItem, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">No Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Participants {newItem.type === 'MEETING' ? '' : '(optional)'}
                  </label>
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={e => setParticipantSearch(e.target.value)}
                    placeholder="Search team members..."
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-2"
                  />
                  {/* Selected badges */}
                  {newItem.participantIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {newItem.participantIds.map(pid => {
                        const member = teamMembers.find(m => m.id === pid)
                        if (!member) return null
                        return (
                          <span
                            key={pid}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs"
                          >
                            {member.firstName} {member.lastName || ''}
                            <button
                              onClick={() => toggleParticipant(pid)}
                              className="hover:text-white"
                            >
                              x
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}
                  {/* Member list */}
                  <div className="max-h-32 overflow-y-auto border border-white/10 rounded-lg divide-y divide-white/5">
                    {filteredTeamMembers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-500">
                        {teamMembers.length === 0 ? 'Loading team members...' : 'No matches found'}
                      </div>
                    ) : (
                      filteredTeamMembers.slice(0, 20).map(member => {
                        const isSelected = newItem.participantIds.includes(member.id)
                        const isSelf = member.id === currentUserId
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => toggleParticipant(member.id)}
                            className={`w-full text-left px-3 py-1.5 text-sm flex items-center justify-between transition-colors ${
                              isSelected ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300 hover:bg-slate-800/50'
                            }`}
                          >
                            <span>
                              {member.firstName} {member.lastName || ''}{isSelf ? ' (you)' : ''}
                            </span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateItem}
                  disabled={creating || !newItem.title.trim() || !newItem.date}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
