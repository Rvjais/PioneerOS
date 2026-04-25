'use client'

import { useState, useEffect } from 'react'

interface TimelineTask {
  id: string
  title: string
  client: string
  assignee: string
  startDate: string
  endDate: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
}

export default function SocialTaskTimelinePage() {
  const [tasks, setTasks] = useState<TimelineTask[]>([])
  const [loading, setLoading] = useState(true)

  // Start of current week (Monday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)

  // Build 8 days starting from the week start
  const days = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
  const dayLabels = days.map(d => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }))
  const firstDayTime = days[0].getTime()

  useEffect(() => {
    async function fetchApprovals() {
      try {
        const res = await fetch('/api/social/approvals')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        const mapped: TimelineTask[] = (data.approvals || data || []).map((a: any, i: number) => {
          const due = a.dueDate ? new Date(a.dueDate) : new Date()
          const created = a.createdAt ? new Date(a.createdAt) : new Date(due.getTime() - 2 * 86400000)
          let status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO'
          if (a.status === 'APPROVED' || a.status === 'DONE') status = 'DONE'
          else if (a.status === 'IN_REVIEW' || a.status === 'IN_PROGRESS' || a.status === 'PENDING') status = 'IN_PROGRESS'
          return {
            id: a.id || String(i + 1),
            title: a.title || a.caption || a.name || 'Untitled',
            client: a.client?.name || a.clientName || a.client || 'N/A',
            assignee: a.assignee?.name || a.assigneeName || a.createdBy?.name || a.assignee || 'Unassigned',
            startDate: created.toISOString().split('T')[0],
            endDate: due.toISOString().split('T')[0],
            status,
          }
        })
        setTasks(mapped)
      } catch (err) {
        console.error('Error fetching social approvals for timeline:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchApprovals()
  }, [])

  // Extract unique team members from fetched tasks
  const teamMembers = [...new Set(tasks.map(t => t.assignee))].filter(Boolean)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-500'
      case 'IN_PROGRESS': return 'bg-pink-500'
      case 'TODO': return 'bg-slate-400'
      default: return 'bg-slate-400'
    }
  }

  const getTaskWidth = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const totalSpan = days.length * 86400000
    const duration = end - start + 86400000
    return (Math.max(duration, 86400000) / totalSpan * 100) + '%'
  }

  const getTaskLeft = (startDate: string) => {
    const start = new Date(startDate).getTime()
    const totalSpan = days.length * 86400000
    const offset = start - firstDayTime
    return (Math.max(offset, 0) / totalSpan * 100) + '%'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Task Timeline</h1>
          <p className="text-pink-200">Gantt view of workload distribution</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-700/50 rounded w-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-800/50 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Timeline</h1>
            <p className="text-pink-200">Gantt view of workload distribution</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-400" />
              <span>Done</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-pink-400" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-400" />
              <span>To Do</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr] border-b border-white/10">
          <div className="p-4 bg-slate-900/40 border-r border-white/10">
            <span className="font-semibold text-slate-200">Task / Team Member</span>
          </div>
          <div className="grid grid-cols-8 bg-slate-900/40">
            {dayLabels.map(day => (
              <div key={day} className="p-4 text-center text-sm font-medium text-slate-300 border-l border-white/10">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Team Rows */}
        {teamMembers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No tasks found for the timeline.</div>
        ) : (
          teamMembers.map(member => {
            const memberTasks = tasks.filter(t => t.assignee === member)
            return (
              <div key={member} className="border-b border-white/5">
                <div className="grid grid-cols-[200px_1fr]">
                  <div className="p-4 border-r border-white/10 bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-medium">
                        {member[0]}
                      </div>
                      <span className="font-medium text-slate-200">{member}</span>
                    </div>
                  </div>
                  <div className="relative h-20">
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-8">
                      {dayLabels.map((d, idx) => (
                        <div key={d.toString()} className="border-l border-white/5" />
                      ))}
                    </div>
                    {/* Tasks */}
                    {memberTasks.map((task, idx) => (
                      <div
                        key={task.id}
                        className={`absolute h-8 ${getStatusColor(task.status)} rounded-md px-2 flex items-center text-white text-xs font-medium truncate shadow-none`}
                        style={{
                          left: getTaskLeft(task.startDate),
                          width: getTaskWidth(task.startDate, task.endDate),
                          top: `${idx * 24 + 10}px`,
                        }}
                        title={`${task.title} (${task.client})`}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Workload Summary */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-4">Team Workload This Week</h3>
        <div className="grid grid-cols-4 gap-4">
          {teamMembers.map(member => {
            const memberTasks = tasks.filter(t => t.assignee === member)
            const inProgress = memberTasks.filter(t => t.status === 'IN_PROGRESS').length
            const todo = memberTasks.filter(t => t.status === 'TODO').length
            return (
              <div key={member} className="p-3 bg-slate-900/40 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-medium">
                    {member[0]}
                  </div>
                  <span className="font-medium text-slate-200">{member}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-pink-600">{inProgress} active</span>
                  <span className="text-slate-400">{todo} pending</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
