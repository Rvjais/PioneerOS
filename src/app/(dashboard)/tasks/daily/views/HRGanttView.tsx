'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { GanttChart } from '@/client/components/hr/GanttChart'

interface HRPipelineTask {
  id: string
  userId: string
  candidateId?: string
  employeeId?: string
  taskType: string
  title: string
  description?: string
  startDate: string
  endDate?: string | null
  duration?: number
  progress: number
  dependencies?: string
  status: string
  candidateName?: string
  employeeName?: string
}

interface DailyTask {
  id: string
  activityType: string
  description: string
  status: string
  plannedHours: number
  actualHours: number | null
}

interface Props {
  dailyTasks: DailyTask[]
  pipelineTasks?: HRPipelineTask[]
}

const TASK_TYPE_ICONS: Record<string, string> = {
  SCREENING: '🔍',
  INTERVIEW: '🎤',
  ONBOARDING: '🚀',
  TRAINING: '📚',
  APPRAISAL: '⭐',
}

export function HRGanttView({ dailyTasks, pipelineTasks = [] }: Props) {
  const [tasks, setTasks] = useState<HRPipelineTask[]>(pipelineTasks)
  const [loading, setLoading] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedTask, setSelectedTask] = useState<HRPipelineTask | null>(null)
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt')

  const [newTask, setNewTask] = useState({
    taskType: 'SCREENING',
    title: '',
    description: '',
    candidateName: '',
    employeeName: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: 1,
    status: 'PLANNED',
  })

  useEffect(() => {
    fetchPipelineTasks()
  }, [])

  const fetchPipelineTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hr/pipeline-tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Failed to fetch pipeline tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title) return

    setLoading(true)
    try {
      const res = await fetch('/api/hr/pipeline-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      })

      if (res.ok) {
        const data = await res.json()
        setTasks(prev => [...prev, data.task])
        setShowAddTask(false)
        setNewTask({
          taskType: 'SCREENING',
          title: '',
          description: '',
          candidateName: '',
          employeeName: '',
          startDate: new Date().toISOString().split('T')[0],
          duration: 1,
          status: 'PLANNED',
        })
      }
    } catch (error) {
      console.error('Failed to add task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (taskId: string, progress: number) => {
    try {
      const res = await fetch(`/api/hr/pipeline-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      })

      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => t.id === taskId ? data.task : t))
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  // Stats
  const totalTasks = tasks.length
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const completed = tasks.filter(t => t.status === 'COMPLETED').length
  const avgProgress = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
    : 0

  // Combine pipeline tasks for gantt chart
  const ganttTasks = tasks.map(t => ({
    ...t,
    dependencies: t.dependencies ? JSON.parse(t.dependencies) : undefined,
  }))

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
          <p className="text-green-100 text-sm">Total Pipeline Tasks</p>
          <p className="text-2xl font-bold">{totalTasks}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-sm">In Progress</p>
          <p className="text-2xl font-bold">{inProgress}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-purple-100 text-sm">Completed</p>
          <p className="text-2xl font-bold">{completed}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-amber-100 text-sm">Avg Progress</p>
          <p className="text-2xl font-bold">{avgProgress}%</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between glass-card rounded-lg p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('gantt')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              viewMode === 'gantt' ? 'bg-green-500 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
            }`}
          >
            Gantt View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
            }`}
          >
            List View
          </button>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Pipeline Task
        </button>
      </div>

      {/* Today's HR Activities Summary */}
      {dailyTasks.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-medium text-slate-200 mb-3">Today's HR Activities</h3>
          <div className="flex flex-wrap gap-2">
            {dailyTasks.map(task => (
              <div
                key={task.id}
                className={`px-3 py-2 rounded-lg text-sm ${
                  task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-800/50 text-slate-200'
                }`}
              >
                <span className="font-medium">{task.activityType.replace(/_/g, ' ')}</span>
                <span className="text-xs ml-2 opacity-70">{task.plannedHours}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gantt Chart or List View */}
      {viewMode === 'gantt' ? (
        <GanttChart
          tasks={ganttTasks}
          onTaskClick={task => setSelectedTask(task as HRPipelineTask)}
        />
      ) : (
        <div className="glass-card rounded-xl shadow-none overflow-hidden border border-white/10">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
            <h2 className="font-semibold text-white">HR Pipeline Tasks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/40 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Task</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Person</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Start Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Progress</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No pipeline tasks yet. Click "Add Pipeline Task" to start.
                    </td>
                  </tr>
                ) : (
                  tasks.map(task => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="border-b border-white/5 hover:bg-slate-900/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-lg">{TASK_TYPE_ICONS[task.taskType] || '📋'}</span>
                        <span className="ml-2 text-xs text-slate-400">{task.taskType}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">{task.title}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {task.candidateName || task.employeeName || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {new Date(task.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{task.duration || 1} days</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          task.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-800/50 text-slate-200'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Add Pipeline Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Type *</label>
                <select
                  value={newTask.taskType}
                  onChange={e => setNewTask({ ...newTask, taskType: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                >
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="ONBOARDING">Onboarding</option>
                  <option value="TRAINING">Training</option>
                  <option value="APPRAISAL">Appraisal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Initial screening call"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={newTask.candidateName}
                    onChange={e => setNewTask({ ...newTask, candidateName: e.target.value })}
                    placeholder="For recruitment tasks"
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={newTask.employeeName}
                    onChange={e => setNewTask({ ...newTask, employeeName: e.target.value })}
                    placeholder="For employee tasks"
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTask.duration}
                    onChange={e => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Additional details..."
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white h-20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={loading || !newTask.title}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-2xl mr-2">{TASK_TYPE_ICONS[selectedTask.taskType] || '📋'}</span>
                <span className="text-xs bg-slate-800/50 text-slate-300 px-2 py-1 rounded">{selectedTask.taskType}</span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{selectedTask.title}</h3>
            {selectedTask.description && (
              <p className="text-sm text-slate-300 mb-4">{selectedTask.description}</p>
            )}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Person:</span>
                <span className="text-slate-200 font-medium">
                  {selectedTask.candidateName || selectedTask.employeeName || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Start Date:</span>
                <span className="text-slate-200">
                  {formatDateDDMMYYYY(selectedTask.startDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-slate-200">{selectedTask.duration || 1} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedTask.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                  selectedTask.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-800/50 text-slate-200'
                }`}>
                  {selectedTask.status}
                </span>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Progress:</span>
                  <span className="text-slate-200">{selectedTask.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTask.progress}
                  onChange={e => {
                    const progress = parseInt(e.target.value)
                    setSelectedTask({ ...selectedTask, progress })
                    handleUpdateProgress(selectedTask.id, progress)
                  }}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
