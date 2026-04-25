'use client'

import { useState, useEffect } from 'react'

interface TimelineTask {
  id: string
  title: string
  client: string
  assignee: string
  startDate: string
  endDate: string
  progress: number
  status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED'
  taskType: string
}

export default function SeoTaskTimelinePage() {
  const [tasks, setTasks] = useState<TimelineTask[]>([])
  const [loading, setLoading] = useState(true)

  // Start of current week (Monday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/seo/tasks')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        const mapped: TimelineTask[] = (data.tasks || data || []).map((t: any, i: number) => {
          const deadline = t.deadline ? new Date(t.deadline) : new Date()
          const created = t.createdAt ? new Date(t.createdAt) : new Date(deadline.getTime() - 3 * 86400000)
          const progress = t.status === 'DONE' ? 100 : t.status === 'IN_PROGRESS' ? 50 : 0
          let status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' = 'ON_TRACK'
          if (deadline < now && t.status !== 'DONE') status = 'DELAYED'
          else if (deadline.getTime() - now.getTime() < 2 * 86400000 && t.status !== 'DONE') status = 'AT_RISK'
          return {
            id: t.id || String(i + 1),
            title: t.title || t.name || 'Untitled',
            client: t.client?.name || t.clientName || t.client || 'N/A',
            assignee: t.assignee?.name || t.assigneeName || t.assignee || 'Unassigned',
            startDate: created.toISOString().split('T')[0],
            endDate: deadline.toISOString().split('T')[0],
            progress,
            status,
            taskType: t.taskType || t.type || t.category || 'General',
          }
        })
        setTasks(mapped)
      } catch (err) {
        console.error('Error fetching SEO tasks for timeline:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const days = Array.from({ length: 28 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return date
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'bg-green-500'
      case 'AT_RISK': return 'bg-amber-500'
      case 'DELAYED': return 'bg-red-500'
      default: return 'bg-slate-900/40'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Content': return 'bg-emerald-500'
      case 'On Page': return 'bg-blue-500'
      case 'Off Page': return 'bg-purple-500'
      case 'Technical': return 'bg-amber-500'
      case 'Reporting': return 'bg-indigo-500'
      default: return 'bg-slate-900/40'
    }
  }

  const calculatePosition = (taskStart: string, taskEnd: string) => {
    const start = new Date(taskStart)
    const end = new Date(taskEnd)
    const startDiff = Math.floor((start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return { left: startDiff, width: duration }
  }

  const today = new Date()
  const todayIndex = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Task Timeline</h1>
          <p className="text-teal-200">Gantt view of SEO tasks</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-700/50 rounded w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/50 rounded w-full" />
            ))}
          </div>
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
            <h1 className="text-2xl font-bold">Task Timeline</h1>
            <p className="text-teal-200">Gantt view of SEO tasks</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-sm">On Track</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-sm">At Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-sm">Delayed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1400px]">
            {/* Header */}
            <div className="flex border-b border-white/10 bg-slate-900/40">
              <div className="w-72 flex-shrink-0 p-3 border-r border-white/10">
                <span className="text-xs font-semibold text-slate-400">TASK</span>
              </div>
              <div className="flex-1 flex">
                {days.map((day, idx) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  const isToday = day.toDateString() === today.toDateString()
                  return (
                    <div
                      key={day.toISOString()}
                      className={`w-10 flex-shrink-0 text-center py-2 border-r border-white/5 ${
                        isWeekend ? 'bg-slate-800/50' : ''
                      } ${isToday ? 'bg-teal-500/20' : ''}`}
                    >
                      <p className="text-xs text-slate-400">{day.toLocaleDateString('en-IN', { weekday: 'short' }).charAt(0)}</p>
                      <p className={`text-sm font-medium ${isToday ? 'text-teal-600' : 'text-slate-200'}`}>
                        {day.getDate()}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tasks */}
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No tasks found for the timeline.</div>
            ) : (
              tasks.map(task => {
                const pos = calculatePosition(task.startDate, task.endDate)
                return (
                  <div key={task.id} className="flex border-b border-white/5 hover:bg-slate-900/40">
                    <div className="w-72 flex-shrink-0 p-3 border-r border-white/10">
                      <p className="font-medium text-white text-sm">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{task.client}</span>
                        <span className="text-xs text-slate-400">-</span>
                        <span className="text-xs text-teal-600">{task.assignee}</span>
                      </div>
                    </div>
                    <div className="flex-1 flex relative h-16">
                      {/* Today line */}
                      {todayIndex >= 0 && todayIndex < 28 && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-teal-500 z-10"
                          style={{ left: `${todayIndex * 40 + 20}px` }}
                        />
                      )}
                      {/* Task bar */}
                      <div
                        className={`absolute top-3 h-10 rounded-md ${getTypeColor(task.taskType)} flex items-center px-2 shadow-none`}
                        style={{
                          left: `${pos.left * 40}px`,
                          width: `${pos.width * 40 - 4}px`
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-black/20 rounded-md"
                          style={{ width: `${task.progress}%` }}
                        />
                        <span className="text-white text-xs font-medium relative z-10 truncate">
                          {task.progress}%
                        </span>
                        <div className={`absolute right-2 w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-slate-200 mb-3">Task Types</h3>
        <div className="flex gap-4 flex-wrap">
          {['Content', 'On Page', 'Off Page', 'Technical', 'Reporting'].map(type => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getTypeColor(type)}`} />
              <span className="text-sm text-slate-300">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
