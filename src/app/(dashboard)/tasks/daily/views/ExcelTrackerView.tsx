'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import {
  getActivitiesForUser,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '@/shared/constants/departmentActivities'

interface Client {
  id: string
  name: string
}

interface Task {
  id: string
  clientId: string | null
  client: Client | null
  clientName: string | null // Custom client name when not in dropdown
  activityType: string
  description: string
  plannedHours: number
  actualHours: number | null
  status: string
  priority: string
  proofUrl?: string | null
  deliverable?: string | null
  startedAt?: string | null
  completedAt?: string | null
}

// Minimal type for creating a new task
interface NewTaskData {
  clientId: string | null
  client: Client | null
  clientName: string | null // Custom client name when not in dropdown
  activityType: string
  description: string
  plannedHours: number
  priority: string
}

interface ExcelTrackerViewProps {
  tasks: Task[]
  clients: Client[]
  department: string
  role: string
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  onAddTask: (task: NewTaskData) => Promise<string | null> // Returns new task ID
  onDeleteTask: (taskId: string) => Promise<void>
  onStartTask: (taskId: string) => Promise<void>
  onCompleteTask: (taskId: string, data: { actualHours: number; deliverable: string; proofUrl: string; clientVisible: boolean }) => Promise<void>
}

// Predefined hours options
const HOUR_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8]

// Departments that should NOT have client field
const INTERNAL_DEPARTMENTS = ['HR']
// Departments where client is optional (not primary focus)
const CLIENT_OPTIONAL_DEPARTMENTS = ['SALES', 'ACCOUNTS']

export function ExcelTrackerView({
  tasks,
  clients,
  department,
  role,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  onStartTask,
  onCompleteTask,
}: ExcelTrackerViewProps) {
  const activities = getActivitiesForUser(role, department)
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null)

  // Determine if client column should be shown based on department
  const showClientColumn = !INTERNAL_DEPARTMENTS.includes(department)
  const clientOptional = CLIENT_OPTIONAL_DEPARTMENTS.includes(department)
  const [newRow, setNewRow] = useState({
    clientId: '',
    clientName: '', // Custom client name when typing manually
    activityType: '',
    description: '',
    plannedHours: 1,
    priority: 'MEDIUM',
  })
  const [customClientMode, setCustomClientMode] = useState(false) // Toggle for typing custom client name
  const [saving, setSaving] = useState<string | null>(null)
  const [showStartPrompt, setShowStartPrompt] = useState<{ taskId: string; description: string } | null>(null)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)
  const [completeForm, setCompleteForm] = useState({ proofUrl: '', deliverable: '', clientVisible: false })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const handleCellClick = (taskId: string, field: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && task.status === 'PLANNED') {
      setEditingCell({ taskId, field })
    }
  }

  const handleCellChange = async (taskId: string, field: string, value: string | number) => {
    setSaving(taskId)
    try {
      await onUpdateTask(taskId, { [field]: value })
    } finally {
      setSaving(null)
      setEditingCell(null)
    }
  }

  const handleAddRow = async () => {
    if (!newRow.activityType || !newRow.description) {
      toast.error('Please select an activity and enter a description to add the task.')
      return
    }

    setSaving('new')
    try {
      const taskDescription = newRow.description
      const newTaskId = await onAddTask({
        clientId: newRow.clientId || null,
        client: clients.find(c => c.id === newRow.clientId) || null,
        clientName: customClientMode ? newRow.clientName || null : null,
        activityType: newRow.activityType,
        description: newRow.description,
        plannedHours: newRow.plannedHours,
        priority: newRow.priority,
      })
      setNewRow({
        clientId: '',
        clientName: '',
        activityType: '',
        description: '',
        plannedHours: 1,
        priority: 'MEDIUM',
      })
      setCustomClientMode(false)
      // Show auto-start prompt
      if (newTaskId) {
        setShowStartPrompt({ taskId: newTaskId, description: taskDescription })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setShowStartPrompt(null), 5000)
      }
    } finally {
      setSaving(null)
    }
  }

  const handleAutoStart = async () => {
    if (!showStartPrompt) return
    await onStartTask(showStartPrompt.taskId)
    setShowStartPrompt(null)
  }

  const openCompleteModal = (task: Task) => {
    setCompletingTask(task)
    setCompleteForm({
      proofUrl: task.proofUrl || '',
      deliverable: task.deliverable || '',
      clientVisible: !!task.clientId, // Default to true if task has a client
    })
  }

  const handleComplete = async () => {
    if (!completingTask) return
    setSaving(completingTask.id)
    try {
      // Calculate actual hours from start time
      let actualHours = completingTask.plannedHours
      if (completingTask.startedAt) {
        const startTime = new Date(completingTask.startedAt)
        const now = new Date()
        const durationMs = now.getTime() - startTime.getTime()
        const durationHours = durationMs / (1000 * 60 * 60)
        actualHours = Math.round(durationHours * 4) / 4 // Round to nearest 0.25h
        if (actualHours < 0.25) actualHours = 0.25
      }
      await onCompleteTask(completingTask.id, {
        actualHours,
        deliverable: completeForm.deliverable,
        proofUrl: completeForm.proofUrl,
        clientVisible: completeForm.clientVisible,
      })
      setCompletingTask(null)
    } finally {
      setSaving(null)
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/10'
      case 'IN_PROGRESS': return 'bg-blue-500/10'
      case 'BREAKDOWN': return 'bg-red-500/10'
      default: return 'glass-card'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'LOW': return 'bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
      default: return 'bg-slate-50 text-slate-500 border-slate-200'
    }
  }

  const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const getDuration = (task: Task) => {
    if (task.status === 'COMPLETED' && task.actualHours) {
      return `${task.actualHours}h`
    }
    if (task.status === 'IN_PROGRESS' && task.startedAt) {
      const startTime = new Date(task.startedAt)
      const now = new Date()
      const durationMs = now.getTime() - startTime.getTime()
      const durationMins = Math.floor(durationMs / 60000)
      if (durationMins < 60) return `${durationMins}m`
      const hours = Math.floor(durationMins / 60)
      const mins = durationMins % 60
      return `${hours}h ${mins}m`
    }
    return '-'
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Daily Task Tracker</h2>
          <p className="text-xs text-indigo-200">Click any cell to edit inline</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-white/30 backdrop-blur-sm rounded"></span>
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-300 rounded"></span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-300 rounded"></span>
            <span>Done</span>
          </div>
        </div>
      </div>

      {/* Excel-like Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b-2 border-white/20">
              <th className="px-2 py-2 text-left font-semibold text-slate-900 border-r border-slate-200/50 w-8">#</th>
              {showClientColumn && (
                <th className="px-2 py-2 text-left font-semibold text-slate-900 border-r border-slate-200/50 min-w-[120px]">
                  {clientOptional ? 'Client (Optional)' : 'Client'}
                </th>
              )}
              <th className="px-2 py-2 text-left font-semibold text-slate-900 border-r border-slate-200/50 min-w-[150px]">Activity</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-900 border-r border-slate-200/50 min-w-[200px]">Description</th>
              <th className="px-2 py-2 text-center font-semibold text-slate-900 border-r border-slate-200/50 w-20">Planned</th>
              <th className="px-2 py-2 text-center font-semibold text-slate-900 border-r border-slate-200/50 w-24">Time</th>
              <th className="px-2 py-2 text-center font-semibold text-slate-900 border-r border-slate-200/50 w-24">Priority</th>
              <th className="px-2 py-2 text-center font-semibold text-slate-900 border-r border-slate-200/50 w-28">Status</th>
              <th className="px-2 py-2 text-left font-semibold text-slate-900 border-r border-slate-200/50 min-w-[120px]">Proof URL</th>
              <th className="px-2 py-2 text-center font-semibold text-slate-900 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.id} className={`border-b border-slate-200 ${getStatusBg(task.status)} hover:bg-slate-100 transition-colors ${saving === task.id ? 'opacity-50' : ''}`}>
                {/* Row Number */}
                <td className="px-2 py-2 text-slate-900 border-r border-slate-200 text-center font-mono text-xs">
                  {index + 1}
                </td>

                {/* Client - Dropdown (conditional) */}
                {showClientColumn && (
                  <td
                    className="px-1 py-1 border-r border-slate-200 cursor-pointer hover:bg-indigo-50"
                    onClick={() => handleCellClick(task.id, 'clientId')}
                  >
                    {editingCell?.taskId === task.id && editingCell.field === 'clientId' ? (
                      <select
                        value={task.clientId || ''}
                        onChange={(e) => handleCellChange(task.id, 'clientId', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                        className="w-full px-1 py-1 border border-indigo-400 rounded text-sm glass-card focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">{clientOptional ? 'No Client' : 'Select Client'}</option>
                        {clients.length > 0 && <option disabled className="text-slate-400">── Clients ──</option>}
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="block px-1 py-1 truncate text-slate-900">
                        {task.client?.name || task.clientName || <span className="text-slate-400 italic">{clientOptional ? '-' : 'Select'}</span>}
                        {task.clientName && !task.client && (
                          <span className="text-xs text-amber-600 ml-1" title="Custom client (not in system)">(custom)</span>
                        )}
                      </span>
                    )}
                  </td>
                )}

                {/* Activity Type - Dropdown */}
                <td
                  className="px-1 py-1 border-r border-slate-200 cursor-pointer hover:bg-indigo-50"
                  onClick={() => handleCellClick(task.id, 'activityType')}
                >
                  {editingCell?.taskId === task.id && editingCell.field === 'activityType' ? (
                    <select
                      value={task.activityType}
                      onChange={(e) => handleCellChange(task.id, 'activityType', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="w-full px-1 py-1 border border-indigo-400 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {activities.map(a => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="block px-1 py-1 truncate text-slate-900">
                      {activities.find(a => a.id === task.activityType)?.label || task.activityType}
                    </span>
                  )}
                </td>

                {/* Description - Text Input */}
                <td
                  className="px-1 py-1 border-r border-slate-200 cursor-pointer hover:bg-indigo-50"
                  onClick={() => handleCellClick(task.id, 'description')}
                >
                  {editingCell?.taskId === task.id && editingCell.field === 'description' ? (
                    <input
                      ref={inputRef}
                      type="text"
                      defaultValue={task.description}
                      onBlur={(e) => handleCellChange(task.id, 'description', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellChange(task.id, 'description', e.currentTarget.value)
                        } else if (e.key === 'Escape') {
                          setEditingCell(null)
                        }
                      }}
                      className="w-full px-1 py-1 border border-indigo-400 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="block px-1 py-1 truncate text-slate-900" title={task.description}>
                      {task.description}
                    </span>
                  )}
                </td>

                {/* Planned Hours - Dropdown */}
                <td
                  className="px-1 py-1 border-r border-slate-200 text-center cursor-pointer hover:bg-indigo-50"
                  onClick={() => handleCellClick(task.id, 'plannedHours')}
                >
                  {editingCell?.taskId === task.id && editingCell.field === 'plannedHours' ? (
                    <select
                      value={task.plannedHours}
                      onChange={(e) => handleCellChange(task.id, 'plannedHours', parseFloat(e.target.value))}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="w-full px-1 py-1 border border-indigo-400 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {HOUR_OPTIONS.map(h => (
                        <option key={h} value={h}>{h}h</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold text-slate-900">{task.plannedHours}h</span>
                  )}
                </td>

                {/* Time Tracking */}
                <td className="px-1 py-1 border-r border-slate-200 text-center">
                  {task.status === 'PLANNED' ? (
                    <span className="text-slate-400 text-xs">-</span>
                  ) : task.status === 'IN_PROGRESS' ? (
                    <div className="text-xs">
                      <div className="text-blue-700 font-medium">{formatTime(task.startedAt)}</div>
                      <div className="text-slate-500">{getDuration(task)}</div>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <div className="text-green-700 font-medium">{task.actualHours}h</div>
                      <div className="text-slate-500">{formatTime(task.startedAt)} - {formatTime(task.completedAt)}</div>
                    </div>
                  )}
                </td>

                {/* Priority - Dropdown */}
                <td
                  className="px-1 py-1 border-r border-slate-200 text-center cursor-pointer hover:bg-indigo-50"
                  onClick={() => handleCellClick(task.id, 'priority')}
                >
                  {editingCell?.taskId === task.id && editingCell.field === 'priority' ? (
                    <select
                      value={task.priority}
                      onChange={(e) => handleCellChange(task.id, 'priority', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="w-full px-1 py-1 border border-indigo-400 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {TASK_PRIORITIES.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                </td>

                {/* Status - Dropdown */}
                <td className="px-1 py-1 border-r border-slate-200 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-800' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-800' :
                      task.status === 'BREAKDOWN' ? 'bg-red-500/20 text-red-800' :
                        'bg-slate-200 text-slate-700'
                    }`}>
                    {task.status}
                  </span>
                </td>

                {/* Proof URL */}
                <td
                  className="px-1 py-1 border-r border-slate-200 cursor-pointer hover:bg-indigo-50"
                  onClick={() => task.status !== 'COMPLETED' && handleCellClick(task.id, 'proofUrl')}
                >
                  {editingCell?.taskId === task.id && editingCell.field === 'proofUrl' ? (
                    <input
                      ref={inputRef}
                      type="url"
                      defaultValue={task.proofUrl || ''}
                      placeholder="https://..."
                      onBlur={(e) => handleCellChange(task.id, 'proofUrl', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellChange(task.id, 'proofUrl', e.currentTarget.value)
                        } else if (e.key === 'Escape') {
                          setEditingCell(null)
                        }
                      }}
                      className="w-full px-1 py-1 border border-indigo-400 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : task.proofUrl ? (
                    <a
                      href={task.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 hover:text-indigo-900 truncate block px-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Proof
                    </a>
                  ) : (
                    <span className="text-slate-400 px-1">-</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-2 py-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {task.status === 'PLANNED' && (
                      <>
                        <button
                          onClick={() => onStartTask(task.id)}
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Start"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 bg-red-500/20 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => openCompleteModal(task)}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Done
                      </button>
                    )}
                    {task.status === 'COMPLETED' && (
                      <span className="text-green-700 text-xs font-medium">Completed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* New Row - Add Task */}
            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
              <td className="px-2 py-2 text-indigo-500 border-r border-slate-200 text-center">
                <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </td>
              {showClientColumn && (
                <td className="px-1 py-1 border-r border-slate-200">
                  {customClientMode ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newRow.clientName}
                        onChange={(e) => setNewRow({ ...newRow, clientName: e.target.value, clientId: '' })}
                        placeholder="Type client name..."
                        className="flex-1 px-1 py-1.5 border border-amber-400/50 rounded text-sm glass-card text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomClientMode(false)
                          setNewRow({ ...newRow, clientName: '' })
                        }}
                        className="p-1 text-slate-500 hover:text-slate-900"
                        title="Back to dropdown"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <select
                      value={newRow.clientId}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomClientMode(true)
                          setNewRow({ ...newRow, clientId: '' })
                        } else {
                          setNewRow({ ...newRow, clientId: e.target.value })
                        }
                      }}
                      className="w-full px-1 py-1.5 border border-slate-300 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">{clientOptional ? 'No Client' : 'Select Client'}</option>
                      {clients.length > 0 && <option disabled className="text-slate-400">── Clients ──</option>}
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option disabled className="text-slate-400">──────────</option>
                      <option value="__custom__" className="text-amber-600">✏️ Type client name...</option>
                    </select>
                  )}
                </td>
              )}
              <td className="px-1 py-1 border-r border-slate-200">
                <select
                  value={newRow.activityType}
                  onChange={(e) => setNewRow({ ...newRow, activityType: e.target.value })}
                  className="w-full px-1 py-1.5 border border-slate-300 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select activity...</option>
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </td>
              <td className="px-1 py-1 border-r border-slate-200">
                <input
                  type="text"
                  value={newRow.description}
                  onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                  placeholder="What are you working on?"
                  className="w-full px-1 py-1.5 border border-slate-300 rounded text-sm glass-card text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newRow.activityType && newRow.description) {
                      handleAddRow()
                    }
                  }}
                />
              </td>
              <td className="px-1 py-1 border-r border-slate-200">
                <select
                  value={newRow.plannedHours}
                  onChange={(e) => setNewRow({ ...newRow, plannedHours: parseFloat(e.target.value) })}
                  className="w-full px-1 py-1.5 border border-slate-300 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {HOUR_OPTIONS.map(h => (
                    <option key={h} value={h}>{h}h</option>
                  ))}
                </select>
              </td>
              <td className="px-1 py-1 border-r border-slate-200 text-center text-slate-400 text-xs">
                -
              </td>
              <td className="px-1 py-1 border-r border-slate-200">
                <select
                  value={newRow.priority}
                  onChange={(e) => setNewRow({ ...newRow, priority: e.target.value })}
                  className="w-full px-1 py-1.5 border border-slate-300 rounded text-sm glass-card text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {TASK_PRIORITIES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </td>
              <td className="px-1 py-1 border-r border-slate-200 text-center text-slate-400 text-xs">
                -
              </td>
              <td className="px-1 py-1 border-r border-slate-200 text-center text-slate-400 text-xs">
                -
              </td>
              <td className="px-2 py-1 text-center">
                <button
                  onClick={handleAddRow}
                  disabled={saving === 'new'}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving === 'new' ? 'Adding...' : '+ Add'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-4 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <span className="text-slate-900">
            Total Tasks: <span className="font-bold">{tasks.length}</span>
          </span>
          <span className="text-slate-900">
            Planned Hours: <span className="font-bold">{tasks.reduce((sum, t) => sum + t.plannedHours, 0)}h</span>
          </span>
          <span className="text-slate-900">
            Completed: <span className="font-bold text-green-700">{tasks.filter(t => t.status === 'COMPLETED').length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-800 font-medium">
          <span>Tip: Press Enter to save, Escape to cancel</span>
        </div>
      </div>

      {/* Auto-Start Prompt */}
      {showStartPrompt && (
        <div className="fixed bottom-6 right-6 glass-card rounded-xl shadow-2xl border border-indigo-200 p-4 max-w-sm animate-in slide-in-from-bottom-4 z-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Task Added!</p>
              <p className="text-sm text-slate-300 mt-0.5 truncate" title={showStartPrompt.description}>
                {showStartPrompt.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleAutoStart}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Start Now
                </button>
                <button
                  onClick={() => setShowStartPrompt(null)}
                  className="px-3 py-1.5 text-slate-300 text-sm hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowStartPrompt(null)}
              className="text-slate-400 hover:text-slate-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Complete Task Modal - Portaled to document body to break out of CSS backdrop-filter traps */}
      {completingTask && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-2">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[95vh]">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 shrink-0 rounded-t-xl">
              <h3 className="text-lg font-semibold text-white">Complete Task</h3>
              <p className="text-green-100 text-sm truncate">{completingTask.description}</p>
            </div>
            <div className="flex-1 min-h-0 p-4 space-y-3 overflow-y-auto custom-scrollbar">
              {/* Time Summary */}
              <div className="bg-slate-900/40 rounded-lg p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Started at:</span>
                  <span className="font-medium">{completingTask.startedAt ? new Date(completingTask.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-300">Duration:</span>
                  <span className="font-medium text-green-400">{getDuration(completingTask)}</span>
                </div>
              </div>

              {/* Proof URL */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Proof URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={completeForm.proofUrl}
                  onChange={(e) => setCompleteForm({ ...completeForm, proofUrl: e.target.value })}
                  placeholder="https://docs.google.com/..."
                  className={`w-full px-3 py-1.5 border rounded-lg text-sm glass-card placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${!completeForm.proofUrl.trim() ? 'border-red-300' : 'border-white/20'
                    }`}
                  required
                />
                <div className="mt-1.5 p-1.5 bg-amber-500/10 border border-amber-200 rounded-lg">
                  <p className="text-[10px] text-amber-500 font-medium leading-tight">
                    Proof links must be Google Sheets, Docs, Drive, or any public URL. This will be pushed to your manager.
                  </p>
                </div>
                {!completeForm.proofUrl.trim() && (
                  <p className="text-[10px] text-red-500 mt-1">Proof URL is required</p>
                )}
              </div>

              {/* Deliverable */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  What was delivered?
                </label>
                <input
                  type="text"
                  value={completeForm.deliverable}
                  onChange={(e) => setCompleteForm({ ...completeForm, deliverable: e.target.value })}
                  placeholder="e.g., 5 posts, Landing page"
                  className="w-full px-3 py-1.5 border border-white/20 rounded-lg text-sm glass-card placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Client Visibility Toggle */}
              {completingTask.clientId && (
                <label className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={completeForm.clientVisible}
                    onChange={(e) => setCompleteForm({ ...completeForm, clientVisible: e.target.checked })}
                    className="w-4 h-4 text-blue-400 border-white/20 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-white text-xs">Show in Client Portal</span>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      Client ({completingTask.client?.name}) will see this
                    </p>
                  </div>
                </label>
              )}
            </div>
            <div className="px-4 py-3 bg-slate-900/40 flex items-center justify-end gap-2 shrink-0 rounded-b-xl border-t border-white/10">
              <button
                onClick={() => setCompletingTask(null)}
                className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={saving === completingTask.id || !completeForm.proofUrl.trim()}
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                title={!completeForm.proofUrl.trim() ? 'Proof URL is required to complete task' : ''}
              >
                {saving === completingTask.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
