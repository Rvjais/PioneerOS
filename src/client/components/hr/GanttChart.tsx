'use client'

import { useMemo } from 'react'

interface GanttTask {
  id: string
  title: string
  startDate: string
  endDate?: string | null
  duration?: number
  progress: number
  status: string
  taskType: string
  dependencies?: string[]
  candidateName?: string
  employeeName?: string
}

interface Props {
  tasks: GanttTask[]
  startDate?: Date
  endDate?: Date
  onTaskClick?: (task: GanttTask) => void
}

const TASK_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  SCREENING: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-400' },
  INTERVIEW: { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-400' },
  ONBOARDING: { bg: 'bg-green-500/20', border: 'border-green-400', text: 'text-green-400' },
  TRAINING: { bg: 'bg-amber-500/20', border: 'border-amber-400', text: 'text-amber-400' },
  APPRAISAL: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700' },
  DEFAULT: { bg: 'bg-slate-800/50', border: 'border-slate-400', text: 'text-slate-200' },
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-white/20',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  BLOCKED: 'bg-red-500',
}

export function GanttChart({ tasks, startDate, endDate, onTaskClick }: Props) {
  // Calculate date range
  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return { start: startDate, end: endDate }
    }

    const dates = tasks.flatMap(t => {
      const start = new Date(t.startDate)
      const end = t.endDate ? new Date(t.endDate) : new Date(start.getTime() + (t.duration || 1) * 24 * 60 * 60 * 1000)
      return [start, end]
    })

    if (dates.length === 0) {
      const today = new Date()
      return { start: today, end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) }
    }

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

    // Add padding
    minDate.setDate(minDate.getDate() - 2)
    maxDate.setDate(maxDate.getDate() + 5)

    return { start: minDate, end: maxDate }
  }, [tasks, startDate, endDate])

  // Generate days array
  const days = useMemo(() => {
    const result: Date[] = []
    const current = new Date(dateRange.start)
    while (current <= dateRange.end) {
      result.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return result
  }, [dateRange])

  // Calculate task position and width
  const getTaskStyle = (task: GanttTask) => {
    const taskStart = new Date(task.startDate)
    const taskEnd = task.endDate
      ? new Date(task.endDate)
      : new Date(taskStart.getTime() + (task.duration || 1) * 24 * 60 * 60 * 1000)

    const totalDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000)
    const startOffset = (taskStart.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000)
    const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / (24 * 60 * 60 * 1000)

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${Math.max((taskDuration / totalDays) * 100, 2)}%`,
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6
  }

  // Group tasks by person (candidate or employee)
  const groupedTasks = useMemo(() => {
    const groups: Record<string, GanttTask[]> = {}
    tasks.forEach(task => {
      const key = task.candidateName || task.employeeName || 'Unassigned'
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })
    return groups
  }, [tasks])

  const getColors = (taskType: string) => {
    return TASK_TYPE_COLORS[taskType] || TASK_TYPE_COLORS.DEFAULT
  }

  return (
    <div className="glass-card rounded-xl shadow-none overflow-hidden border border-white/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-white">HR Pipeline Gantt Chart</h2>
        <div className="flex items-center gap-3 text-xs text-white/80">
          {Object.entries(TASK_TYPE_COLORS).filter(([key]) => key !== 'DEFAULT').map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
              <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex border-b border-white/10">
            <div className="w-48 flex-shrink-0 px-3 py-2 bg-slate-900/40 font-medium text-sm text-slate-300 border-r border-white/10">
              Person / Task
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {days.map((day, idx) => (
                  <div
                    key={day.toISOString()}
                    className={`flex-1 min-w-[40px] px-1 py-2 text-center text-xs border-r border-white/5 ${
                      isToday(day) ? 'bg-blue-500/10 font-bold text-blue-400' :
                      isWeekend(day) ? 'bg-slate-900/40 text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    <div>{day.getDate()}</div>
                    <div className="text-[10px]">{day.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          {Object.entries(groupedTasks).map(([personName, personTasks]) => (
            <div key={personName} className="border-b border-white/5">
              {/* Person Header */}
              <div className="flex bg-slate-900/40">
                <div className="w-48 flex-shrink-0 px-3 py-2 font-medium text-sm text-slate-200 border-r border-white/10">
                  {personName}
                </div>
                <div className="flex-1 h-8" />
              </div>

              {/* Tasks */}
              {personTasks.map(task => {
                const colors = getColors(task.taskType)
                const style = getTaskStyle(task)

                return (
                  <div key={task.id} className="flex hover:bg-slate-900/40 transition-colors">
                    <div className="w-48 flex-shrink-0 px-3 py-2 text-sm text-slate-300 border-r border-white/10 truncate">
                      <span className={`text-xs ${colors.text}`}>{task.taskType}</span>
                      <p className="truncate">{task.title}</p>
                    </div>
                    <div className="flex-1 relative h-12 py-1">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {days.map((day, idx) => (
                          <div
                            key={day.toISOString()}
                            className={`flex-1 min-w-[40px] border-r border-white/5 ${
                              isToday(day) ? 'bg-blue-500/10' : isWeekend(day) ? 'bg-slate-900/40' : ''
                            }`}
                          />
                        ))}
                      </div>

                      {/* Task Bar */}
                      <div
                        onClick={() => onTaskClick?.(task)}
                        className={`absolute top-1 bottom-1 rounded-md ${colors.bg} ${colors.border} border cursor-pointer
                          hover:shadow-none transition-shadow flex items-center overflow-hidden group`}
                        style={style}
                        title={`${task.title} (${task.progress}%)`}
                      >
                        {/* Progress fill */}
                        <div
                          className={`absolute inset-y-0 left-0 ${STATUS_COLORS[task.status] || 'bg-blue-400'} opacity-30`}
                          style={{ width: `${task.progress}%` }}
                        />

                        {/* Task label */}
                        <span className={`relative px-2 text-xs font-medium truncate ${colors.text}`}>
                          {task.title}
                        </span>

                        {/* Progress indicator */}
                        <span className="absolute right-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {Object.keys(groupedTasks).length === 0 && (
            <div className="px-4 py-8 text-center text-slate-400">
              No HR pipeline tasks found. Create tasks to see them in the Gantt chart.
            </div>
          )}
        </div>
      </div>

      {/* Today marker legend */}
      <div className="px-4 py-2 bg-slate-900/40 border-t border-white/10 flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500/10 border border-blue-200 rounded" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-slate-800/50 rounded" />
          <span>Weekend</span>
        </div>
      </div>
    </div>
  )
}
