'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'
import { toast } from 'sonner'

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
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    platform: 'All',
    taskType: 'Content Planning',
    priority: 'MEDIUM',
    deadline: '',
  })

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
      .catch((error) => { console.error('Failed to load tasks:', error); toast.error('Failed to load tasks. Please try again.') })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: `Platform: ${formData.platform}, Type: ${formData.taskType}`,
          type: formData.taskType,
          priority: formData.priority,
          dueDate: formData.deadline,
          department: 'SOCIAL_MEDIA',
          status: 'TODO'
        })
      })
      if (!res.ok) throw new Error('Failed to create task')
      setShowAddModal(false)
      setFormData({ title: '', client: '', platform: 'All', taskType: 'Content Planning', priority: 'MEDIUM', deadline: '' })
      // Refresh
      const result = await (await fetch('/api/tasks?department=SOCIAL_MEDIA')).json()
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

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
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors"
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
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Social Task" size="lg">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && <div className="mb-4 text-red-400 text-sm bg-red-500/10 p-3 rounded">{error}</div>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">Title *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Task Type</label>
                <select value={formData.taskType} onChange={e => setFormData({...formData, taskType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200">
                  <option value="Content Planning">Content Planning</option>
                  <option value="Caption Writing">Caption Writing</option>
                  <option value="Design Coordination">Design Coordination</option>
                  <option value="Scheduling">Scheduling</option>
                  <option value="Reporting">Reporting</option>
                  <option value="Engagement">Engagement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Platform</label>
                <select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200">
                  <option value="All">All</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">Deadline</label>
                <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-slate-200" />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-200 bg-slate-800/50 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 text-sm text-white bg-pink-600 rounded-lg disabled:opacity-50">{submitting ? 'Adding...' : 'Add Task'}</button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
