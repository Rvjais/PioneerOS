'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  title: string
  client: string
  taskType: string
  assignee: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  deadline: string
  status?: string
}

export default function SeoTaskBoardPage() {
  const [boardData, setBoardData] = useState<Record<string, Task[]>>({
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setError(null)
      const res = await fetch('/api/seo/tasks')
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      const tasks: Task[] = data.tasks || []

      // Group tasks by status into board columns
      const grouped: Record<string, Task[]> = {
        TODO: [],
        IN_PROGRESS: [],
        REVIEW: [],
        DONE: [],
      }
      tasks.forEach((task: Task) => {
        const status = task.status || 'TODO'
        if (grouped[status]) {
          grouped[status].push(task)
        } else {
          grouped.TODO.push(task)
        }
      })
      setBoardData(grouped)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-slate-900/40' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'REVIEW', title: 'Review', color: 'bg-amber-500' },
    { id: 'DONE', title: 'Done', color: 'bg-green-500' },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-l-red-500'
      case 'HIGH': return 'border-l-orange-500'
      case 'MEDIUM': return 'border-l-amber-500'
      case 'LOW': return 'border-l-slate-300'
      default: return 'border-l-slate-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Content': return 'bg-emerald-500/20 text-emerald-400'
      case 'On Page': return 'bg-blue-500/20 text-blue-400'
      case 'Off Page': return 'bg-purple-500/20 text-purple-400'
      case 'Technical': return 'bg-amber-500/20 text-amber-400'
      case 'Reporting': return 'bg-indigo-500/20 text-indigo-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Task Board</h1>
          <p className="text-teal-200">Kanban view for SEO tasks</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 min-h-[600px] animate-pulse">
              <div className="h-5 bg-slate-700 rounded w-24 mb-4" />
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="bg-slate-700/50 rounded-lg p-3 h-28" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Task Board</h1>
          <p className="text-teal-200">Kanban view for SEO tasks</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <svg className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-slate-400">{error}</p>
          <button onClick={() => { setLoading(true); fetchTasks() }} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
            Retry
          </button>
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
            <h1 className="text-2xl font-bold">Task Board</h1>
            <p className="text-teal-200">Kanban view for SEO tasks</p>
          </div>
          <div className="flex gap-4">
            {columns.map(col => (
              <div key={col.id} className="text-center">
                <p className="text-teal-200 text-xs">{col.title}</p>
                <p className="text-xl font-bold">{boardData[col.id]?.length || 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column.id} className="bg-slate-800/50 rounded-xl p-4 min-h-[600px]">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h2 className="font-semibold text-white">{column.title}</h2>
              <span className="ml-auto glass-card px-2 py-0.5 rounded text-sm font-medium text-slate-300">
                {boardData[column.id]?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {boardData[column.id]?.map(task => (
                <div
                  key={task.id}
                  className={`glass-card rounded-lg p-3 border-l-4 shadow-none hover:shadow-none transition-shadow cursor-pointer ${getPriorityColor(task.priority)}`}
                >
                  <p className="font-medium text-white text-sm mb-2">{task.title}</p>
                  <p className="text-xs text-slate-400 mb-2">{task.client}</p>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(task.taskType)}`}>
                      {task.taskType}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                        {task.assignee[0]}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className={`${
                      new Date(task.deadline) < new Date() && column.id !== 'DONE'
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}>
                      {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    {task.priority === 'CRITICAL' && (
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                        Critical
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {column.id === 'TODO' && (
              <button className="mt-3 w-full py-2 border-2 border-dashed border-white/20 rounded-lg text-slate-400 text-sm hover:border-teal-500 hover:text-teal-600 transition-colors">
                + Add Task
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
