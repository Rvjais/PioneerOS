'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SOCIAL_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SOCIAL_MEDIA']

interface SocialTask {
  id: string
  title: string
  client: string
  platform: string
  taskType: 'Content Planning' | 'Caption Writing' | 'Design Coordination' | 'Scheduling' | 'Reporting' | 'Engagement'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  assignee: string
  deadline: string
}

export default function SocialTasksPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || ''
  const canEdit = SOCIAL_ROLES.includes(userRole)

  const [tasks, setTasks] = useState<SocialTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetch('/api/tasks?department=SOCIAL_MEDIA')
      .then(res => res.json())
      .then(result => {
        const items = result.data || result || []
        const mapped: SocialTask[] = items.map((item: any) => ({
          id: item.id,
          title: item.title || item.name || '',
          client: item.client?.name || item.client || '',
          platform: item.platform || 'All',
          taskType: item.taskType || item.type || 'Content Planning',
          priority: item.priority || 'MEDIUM',
          status: item.status || 'TODO',
          assignee: item.assignee?.name || item.assignee || '',
          deadline: item.deadline || item.dueDate || '',
        }))
        setTasks(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-slate-800/50 text-slate-200'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'DONE': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-l-red-500'
      case 'HIGH': return 'border-l-pink-500'
      case 'MEDIUM': return 'border-l-amber-500'
      case 'LOW': return 'border-l-slate-300'
      default: return 'border-l-slate-300'
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'Content Planning': return 'bg-pink-500/20 text-pink-400'
      case 'Caption Writing': return 'bg-purple-500/20 text-purple-400'
      case 'Design Coordination': return 'bg-fuchsia-100 text-fuchsia-700'
      case 'Scheduling': return 'bg-blue-500/20 text-blue-400'
      case 'Reporting': return 'bg-green-500/20 text-green-400'
      case 'Engagement': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const statusCounts = {
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    review: tasks.filter(t => t.status === 'REVIEW').length,
    done: tasks.filter(t => t.status === 'DONE').length,
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
            <h1 className="text-2xl font-bold">Social Tasks</h1>
            <p className="text-pink-200">Manage social media team tasks</p>
          </div>
          {canEdit && (
            <button
              onClick={() => alert('Coming soon: Add Task feature is under development.')}
              className="px-4 py-2 glass-card text-pink-600 rounded-lg font-medium hover:bg-pink-50"
            >
              + Add Task
            </button>
          )}
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('TODO')}
          className={`p-4 rounded-xl border transition-all ${filter === 'TODO' ? 'bg-slate-800/50 border-slate-400' : 'bg-slate-900/40 border-white/10 hover:border-white/20'}`}
        >
          <p className="text-sm text-slate-300">To Do</p>
          <p className="text-3xl font-bold text-slate-200">{statusCounts.todo}</p>
        </button>
        <button
          onClick={() => setFilter('IN_PROGRESS')}
          className={`p-4 rounded-xl border transition-all ${filter === 'IN_PROGRESS' ? 'bg-blue-500/20 border-blue-400' : 'bg-blue-500/10 border-blue-200 hover:border-blue-300'}`}
        >
          <p className="text-sm text-blue-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{statusCounts.inProgress}</p>
        </button>
        <button
          onClick={() => setFilter('REVIEW')}
          className={`p-4 rounded-xl border transition-all ${filter === 'REVIEW' ? 'bg-amber-500/20 border-amber-400' : 'bg-amber-500/10 border-amber-200 hover:border-amber-300'}`}
        >
          <p className="text-sm text-amber-400">In Review</p>
          <p className="text-3xl font-bold text-amber-400">{statusCounts.review}</p>
        </button>
        <button
          onClick={() => setFilter('DONE')}
          className={`p-4 rounded-xl border transition-all ${filter === 'DONE' ? 'bg-green-500/20 border-green-400' : 'bg-green-500/10 border-green-200 hover:border-green-300'}`}
        >
          <p className="text-sm text-green-400">Done</p>
          <p className="text-3xl font-bold text-green-400">{statusCounts.done}</p>
        </button>
      </div>

      {/* Filter Reset */}
      {filter !== 'ALL' && (
        <button
          onClick={() => setFilter('ALL')}
          className="text-sm text-pink-600 hover:text-pink-800"
        >
          ← Show all tasks
        </button>
      )}

      {/* Task List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">
            {filter === 'ALL' ? 'All Tasks' : `${filter.replace(/_/g, ' ')} Tasks`}
          </h2>
        </div>
        <div className="divide-y divide-white/10">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 border-l-4 ${getPriorityColor(task.priority)} hover:bg-slate-900/40`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <p className="text-sm text-slate-400">{task.client} • {task.platform}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 text-xs rounded ${getTaskTypeColor(task.taskType)}`}>
                  {task.taskType}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">Assignee: {task.assignee}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">Due: {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
