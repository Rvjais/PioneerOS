'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface SeoTask {
  id: string
  clientId: string
  client: { id: string; name: string }
  taskType: 'ON_PAGE' | 'OFF_PAGE' | 'TECHNICAL' | 'CONTENT' | 'REPORTING'
  category: string
  description: string
  assignedTo: { id: string; firstName: string; lastName: string } | null
  reviewer: { id: string; firstName: string; lastName: string } | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  deadline: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

interface Client {
  id: string
  name: string
}

interface Employee {
  id: string
  firstName: string
  lastName: string
}

const TASK_TYPES = ['ON_PAGE', 'OFF_PAGE', 'TECHNICAL', 'CONTENT', 'REPORTING'] as const
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const

const TASK_TYPE_LABELS: Record<string, string> = {
  ON_PAGE: 'On Page',
  OFF_PAGE: 'Off Page',
  TECHNICAL: 'Technical SEO',
  CONTENT: 'Content',
  REPORTING: 'Reporting',
}

const STATUS_FLOW: Record<string, string> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'REVIEW',
  REVIEW: 'DONE',
}

const INITIAL_FORM = {
  clientId: '',
  taskType: '' as string,
  category: '',
  description: '',
  assignedToId: '',
  reviewerId: '',
  priority: 'MEDIUM' as string,
  deadline: '',
}

export default function SeoTasksPage() {
  const [tasks, setTasks] = useState<SeoTask[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/seo/tasks')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tasks')
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      toast.error('Failed to load tasks')
    }
  }, [])

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?status=ACTIVE&limit=100')
      const data = await res.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  // Fetch SEO team employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/hr/employees?department=SEO')
      const data = await res.json()
      setEmployees(data.employees || [])
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  useEffect(() => {
    Promise.all([fetchTasks(), fetchClients(), fetchEmployees()])
      .finally(() => setLoading(false))
  }, [fetchTasks])

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (typeFilter !== 'all' && task.taskType !== typeFilter) return false
    if (clientFilter !== 'all' && task.clientId !== clientFilter) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    return true
  })

  // Status counts
  const todoCount = tasks.filter(t => t.status === 'TODO').length
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const reviewCount = tasks.filter(t => t.status === 'REVIEW').length
  const doneCount = tasks.filter(t => t.status === 'DONE').length

  // Status update handler
  const handleStatusAdvance = async (task: SeoTask) => {
    const nextStatus = STATUS_FLOW[task.status]
    if (!nextStatus) return

    try {
      const res = await fetch('/api/seo/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update status')
      toast.success(`Task moved to ${nextStatus.replace(/_/g, ' ')}`)
      fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task status')
    }
  }

  // Add task handler
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clientId || !formData.taskType || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/seo/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          taskType: formData.taskType,
          category: formData.category,
          description: formData.description,
          assignedToId: formData.assignedToId || null,
          reviewerId: formData.reviewerId || null,
          priority: formData.priority,
          deadline: formData.deadline || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create task')
      toast.success('Task created successfully')
      setShowModal(false)
      setFormData(INITIAL_FORM)
      fetchTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

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
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CONTENT': return 'bg-emerald-500/20 text-emerald-400'
      case 'ON_PAGE': return 'bg-blue-500/20 text-blue-400'
      case 'OFF_PAGE': return 'bg-purple-500/20 text-purple-400'
      case 'TECHNICAL': return 'bg-amber-500/20 text-amber-400'
      case 'REPORTING': return 'bg-indigo-500/20 text-indigo-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const formatEmployeeName = (emp: { firstName: string; lastName: string } | null) => {
    if (!emp) return '-'
    return `${emp.firstName} ${emp.lastName}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading tasks...</p>
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
            <h1 className="text-2xl font-bold">SEO Tasks</h1>
            <p className="text-teal-200">Manage all SEO execution tasks</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 glass-card text-teal-600 rounded-lg font-medium hover:bg-teal-500/10"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'TODO' ? 'all' : 'TODO')}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === 'TODO' ? 'border-slate-500 bg-slate-800/50' : 'border-white/10 glass-card hover:border-white/20'
          }`}
        >
          <p className="text-sm text-slate-400">Todo</p>
          <p className="text-3xl font-bold text-slate-200">{todoCount}</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS')}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 glass-card hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{inProgressCount}</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'REVIEW' ? 'all' : 'REVIEW')}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === 'REVIEW' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">Review</p>
          <p className="text-3xl font-bold text-amber-400">{reviewCount}</p>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'DONE' ? 'all' : 'DONE')}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === 'DONE' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Done</p>
          <p className="text-3xl font-bold text-green-400">{doneCount}</p>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        {/* Task Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', ...TASK_TYPES].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                typeFilter === type
                  ? 'bg-teal-600 text-white'
                  : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              {type === 'all' ? 'All Types' : TASK_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Client Filter */}
        <select
          value={clientFilter}
          onChange={e => setClientFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-slate-900/60 border border-white/10 text-slate-300 focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Clients</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-slate-900/60 border border-white/10 text-slate-300 focus:outline-none focus:border-teal-500"
        >
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
          <div className="text-4xl mb-3 opacity-40">📋</div>
          <p className="text-slate-400 text-lg font-medium">No tasks found</p>
          <p className="text-slate-500 text-sm mt-1">
            {tasks.length === 0
              ? 'Create your first SEO task to get started'
              : 'Try adjusting your filters'}
          </p>
          {tasks.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              + Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">DESCRIPTION</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TYPE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PRIORITY</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">ASSIGNED</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DEADLINE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} className={`border-b border-white/5 hover:bg-slate-900/40 ${
                  task.priority === 'CRITICAL' ? 'bg-red-500/10' : ''
                }`}>
                  <td className="py-3 px-4">
                    <p className="font-medium text-white line-clamp-1">{task.description}</p>
                    <p className="text-xs text-slate-400">{task.category}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-white">{task.client?.name || '-'}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(task.taskType)}`}>
                      {TASK_TYPE_LABELS[task.taskType] || task.taskType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-white">{formatEmployeeName(task.assignedTo)}</p>
                    <p className="text-xs text-slate-400">Reviewer: {formatEmployeeName(task.reviewer)}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm ${
                      new Date(task.deadline) < new Date() && task.status !== 'DONE'
                        ? 'text-red-400 font-medium'
                        : 'text-slate-300'
                    }`}>
                      {formatDateDDMMYYYY(task.deadline)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {STATUS_FLOW[task.status] ? (
                      <button
                        onClick={() => handleStatusAdvance(task)}
                        className="px-2 py-1 text-xs font-medium rounded bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors"
                        title={`Move to ${STATUS_FLOW[task.status].replace(/_/g, ' ')}`}
                      >
                        {task.status === 'TODO' && 'Start'}
                        {task.status === 'IN_PROGRESS' && 'Review'}
                        {task.status === 'REVIEW' && 'Done'}
                      </button>
                    ) : (
                      <span className="text-xs text-green-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 glass-card rounded-xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add New Task</h2>
              <button
                onClick={() => { setShowModal(false); setFormData(INITIAL_FORM) }}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                x
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client *</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={e => setFormData(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Type *</label>
                <select
                  required
                  value={formData.taskType}
                  onChange={e => setFormData(f => ({ ...f, taskType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select type</option>
                  {TASK_TYPES.map(t => (
                    <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Blog Writing, Meta Optimization"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Task description"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assigned To</label>
                <select
                  value={formData.assignedToId}
                  onChange={e => setFormData(f => ({ ...f, assignedToId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Reviewer */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Reviewer</label>
                <select
                  value={formData.reviewerId}
                  onChange={e => setFormData(f => ({ ...f, reviewerId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">No reviewer</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:border-teal-500"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData(INITIAL_FORM) }}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-slate-900/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
