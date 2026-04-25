'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface Task {
  id: string
  title: string
  client: string
  platform: string
  taskType: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  assignee: string
  deadline: string
}

export default function SocialTaskBoardPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [tasksByStatus, setTasksByStatus] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks?department=SOCIAL_MEDIA')
      .then(res => res.json())
      .then(result => {
        const items = result.data || result || []
        const grouped: Record<string, Task[]> = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] }
        items.forEach((item: any) => {
          const task: Task = {
            id: item.id,
            title: item.title || item.name || '',
            client: item.client?.name || item.client || '',
            platform: item.platform || 'All',
            taskType: item.taskType || item.type || 'Content Planning',
            priority: item.priority || 'MEDIUM',
            assignee: item.assignee?.name || item.assignee || '',
            deadline: item.deadline || item.dueDate || '',
          }
          const status = item.status || 'TODO'
          if (grouped[status]) {
            grouped[status].push(task)
          } else {
            grouped.TODO.push(task)
          }
        })
        setTasksByStatus(grouped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])
  const columns = [
    { id: 'TODO', title: 'To Do', color: 'border-white/20 bg-slate-900/40' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-blue-300 bg-blue-500/10' },
    { id: 'REVIEW', title: 'Review', color: 'border-amber-300 bg-amber-500/10' },
    { id: 'DONE', title: 'Done', color: 'border-green-300 bg-green-500/10' },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-l-red-500'
      case 'HIGH': return 'border-l-pink-500'
      case 'MEDIUM': return 'border-l-amber-500'
      case 'LOW': return 'border-l-slate-300'
      default: return 'border-l-slate-300'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'text-pink-600'
      case 'Facebook': return 'text-blue-400'
      case 'LinkedIn': return 'text-sky-700'
      case 'All': return 'text-purple-400'
      default: return 'text-slate-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Task Board</h1>
            <p className="text-pink-200">Kanban view of social media tasks</p>
          </div>
          {canEdit && (
            <button className="px-4 py-2 glass-card text-pink-600 rounded-lg font-medium hover:bg-pink-50">
              + Add Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column.id} className={`rounded-xl border-2 ${column.color} min-h-[600px]`}>
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{column.title}</h3>
                <span className="text-sm text-slate-400">{tasksByStatus[column.id]?.length || 0}</span>
              </div>
            </div>
            <div className="p-3 space-y-3">
              {tasksByStatus[column.id]?.map(task => (
                <div
                  key={task.id}
                  className={`glass-card rounded-lg border border-white/10 p-3 shadow-none hover:shadow-none transition-shadow cursor-pointer border-l-4 ${getPriorityColor(task.priority)}`}
                >
                  <h4 className="font-medium text-white text-sm mb-2">{task.title}</h4>
                  <p className="text-xs text-slate-400 mb-2">
                    {task.client} • <span className={getPlatformColor(task.platform)}>{task.platform}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded">
                      {task.taskType}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-medium">
                        {task.assignee?.[0] || '?'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
