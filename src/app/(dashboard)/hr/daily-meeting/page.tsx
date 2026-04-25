'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useSession } from 'next-auth/react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Activity {
  id: string
  name: string
  category: string
}

interface DailyTask {
  id: string
  activity: string
  company: string
  client?: string
  description: string
  startTime: string | null
  endTime: string | null
  status: 'pending' | 'in_progress' | 'completed'
  reportedToManager: boolean
  createdAt: string
  duration?: number
}

// HR-specific activities
const hrActivities: Activity[] = [
  { id: 'candidate-screening', name: 'Candidate Screening', category: 'Recruitment' },
  { id: 'interview-scheduling', name: 'Interview Scheduling', category: 'Recruitment' },
  { id: 'interview-conducted', name: 'Interview Conducted', category: 'Recruitment' },
  { id: 'offer-letter', name: 'Offer Letter Preparation', category: 'Recruitment' },
  { id: 'onboarding-call', name: 'Onboarding Call', category: 'Onboarding' },
  { id: 'document-verification', name: 'Document Verification', category: 'Onboarding' },
  { id: 'induction-training', name: 'Induction Training', category: 'Onboarding' },
  { id: 'attendance-review', name: 'Attendance Review', category: 'Attendance' },
  { id: 'leave-approval', name: 'Leave Request Processing', category: 'Leave' },
  { id: 'payroll-processing', name: 'Payroll Processing', category: 'Payroll' },
  { id: 'employee-query', name: 'Employee Query Resolution', category: 'Support' },
  { id: 'escalation-handling', name: 'Escalation Handling', category: 'Support' },
  { id: 'appraisal-coordination', name: 'Appraisal Coordination', category: 'Performance' },
  { id: 'pip-followup', name: 'PIP Follow-up', category: 'Performance' },
  { id: 'exit-interview', name: 'Exit Interview', category: 'Offboarding' },
  { id: 'fnf-processing', name: 'F&F Settlement Processing', category: 'Offboarding' },
  { id: 'policy-update', name: 'Policy Update', category: 'Compliance' },
  { id: 'engagement-activity', name: 'Engagement Activity Planning', category: 'Engagement' },
  { id: 'vendor-coordination', name: 'Vendor Coordination', category: 'Admin' },
  { id: 'meeting-attendance', name: 'Meeting Attendance', category: 'Meetings' },
  { id: 'email-communication', name: 'Email Communication', category: 'Communication' },
  { id: 'other', name: 'Other Task', category: 'Other' },
]

const companies = [
  { id: 'branding-pioneers', name: 'Branding Pioneers' },
  { id: 'atz-medappz', name: 'ATZ Medappz' },
  { id: 'bp-academy', name: 'BP Academy' },
]

export default function HRDailyMeetingPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const [newTask, setNewTask] = useState({
    activity: '',
    company: '',
    client: '',
    description: ''
  })

  const currentMonth = new Date()
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  useEffect(() => {
    fetchTasks()
  }, [selectedDate])

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/daily-meeting/tasks?date=${selectedDate}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const addTask = () => {
    if (!newTask.activity || !newTask.company) return

    const task: DailyTask = {
      id: `task-${Date.now()}`,
      activity: hrActivities.find(a => a.id === newTask.activity)?.name || newTask.activity,
      company: companies.find(c => c.id === newTask.company)?.name || newTask.company,
      client: newTask.client,
      description: newTask.description,
      startTime: null,
      endTime: null,
      status: 'pending',
      reportedToManager: false,
      createdAt: new Date().toISOString()
    }

    setTasks(prev => [...prev, task])
    setNewTask({ activity: '', company: '', client: '', description: '' })
    setShowAddTask(false)

    saveTask(task)
  }

  const saveTask = async (task: DailyTask) => {
    try {
      await fetch('/api/daily-meeting/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, date: selectedDate })
      })
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const startTask = (taskId: string) => {
    const now = new Date().toISOString()
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, startTime: now, status: 'in_progress' }
        : task
    ))
    updateTaskStatus(taskId, { startTime: now, status: 'in_progress' })
  }

  const endTask = (taskId: string) => {
    const now = new Date().toISOString()
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.startTime) {
        const start = new Date(task.startTime)
        const end = new Date(now)
        const duration = Math.round((end.getTime() - start.getTime()) / 60000)
        return { ...task, endTime: now, status: 'completed', duration }
      }
      return task
    }))
    updateTaskStatus(taskId, { endTime: now, status: 'completed' })
  }

  const toggleReported = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, reportedToManager: !task.reportedToManager }
        : task
    ))
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      updateTaskStatus(taskId, { reportedToManager: !task.reportedToManager })
    }
  }

  const updateTaskStatus = async (taskId: string, updates: Partial<DailyTask>) => {
    try {
      await fetch(`/api/daily-meeting/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '-'
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const totalDuration = completedTasks.reduce((sum, t) => sum + (t.duration || 0), 0)

  const reportingManager = 'Nishu Sharma'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Daily Meeting</h1>
            <InfoTooltip
              title="Daily Meeting / Operations"
              steps={[
                'Select HR activity from dropdown',
                'Choose company and start task',
                'Timer tracks your work duration',
                'Mark as reported when informed to manager'
              ]}
              tips={[
                'Start timer as soon as you begin work',
                'Always report completed tasks to your manager'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">
            Track daily HR activities - Assigned to: <span className="text-purple-400">{session?.user?.firstName || 'Self'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            min={monthStart.toISOString().split('T')[0]}
            max={monthEnd.toISOString().split('T')[0]}
            className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-purple-500 outline-none"
          />
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/10 border border-slate-500/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-white">{pendingTasks.length}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-white">{inProgressTasks.length}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-purple-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-white">{completedTasks.length}</p>
        </div>
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
          <p className="text-pink-400 text-sm">Total Time</p>
          <p className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Reported</p>
          <p className="text-2xl font-bold text-white">{completedTasks.filter(t => t.reportedToManager).length}/{completedTasks.length}</p>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Add New Task</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Activity *</label>
                <select
                  value={newTask.activity}
                  onChange={e => setNewTask(prev => ({ ...prev, activity: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-purple-500 outline-none"
                >
                  <option value="">Select Activity</option>
                  {Object.entries(
                    hrActivities.reduce((acc, act) => {
                      if (!acc[act.category]) acc[act.category] = []
                      acc[act.category].push(act)
                      return acc
                    }, {} as Record<string, Activity[]>)
                  ).map(([category, activities]) => (
                    <optgroup key={category} label={category}>
                      {activities.map(act => (
                        <option key={act.id} value={act.id}>{act.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Company *</label>
                <select
                  value={newTask.company}
                  onChange={e => setNewTask(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-purple-500 outline-none"
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Employee/Candidate Name (Optional)</label>
                <input
                  type="text"
                  value={newTask.client}
                  onChange={e => setNewTask(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="Enter name if applicable"
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description (Optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="Brief description of the task..."
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddTask(false)}
                className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTask.activity || !newTask.company}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white">Today's Tasks</h3>
          <span className="text-sm text-slate-400">
            {formatDateDDMMYYYY(selectedDate)}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No tasks for this date. Click "Add Task" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Activity</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Company</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Person</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Start</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">End</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Duration</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Reported?</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{task.activity}</p>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.company === 'Branding Pioneers' ? 'bg-blue-500/20 text-blue-400' :
                        task.company === 'ATZ Medappz' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-pink-500/20 text-pink-400'
                      }`}>
                        {task.company}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{task.client || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={task.startTime ? 'text-purple-400' : 'text-slate-400'}>
                        {formatTime(task.startTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={task.endTime ? 'text-pink-400' : 'text-slate-400'}>
                        {formatTime(task.endTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{formatDuration(task.duration)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                        task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-900/20 text-slate-400'
                      }`}>
                        {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.status === 'completed' ? (
                        <button
                          onClick={() => toggleReported(task.id)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                            task.reportedToManager
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                          }`}
                        >
                          {task.reportedToManager ? 'Yes' : 'No'}
                        </button>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => startTask(task.id)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => endTask(task.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors animate-pulse"
                        >
                          End
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <span className="text-purple-400 text-sm">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reminder */}
      {completedTasks.filter(t => !t.reportedToManager).length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-400">
                {completedTasks.filter(t => !t.reportedToManager).length} task(s) not reported to {reportingManager}
              </p>
              <p className="text-sm text-amber-300">Please inform your reporting manager</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
