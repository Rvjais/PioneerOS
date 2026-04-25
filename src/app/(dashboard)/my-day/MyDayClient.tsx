'use client'

import { useState } from 'react'
import {
  Clock,
  CheckCircle,
  Circle,
  Play,
  Pause,
  Plus,
  BookOpen,
  Target,
  Calendar,
  TrendingUp,
  Coffee,
  Sun,
  Moon,
  Briefcase,
} from 'lucide-react'
import PageGuide from '@/client/components/ui/PageGuide'

interface Task {
  id: string
  activityType: string
  description: string
  plannedHours: number
  actualHours: number | null
  status: string
  plannedStartTime: string | null
  actualStartTime: string | null
  actualEndTime: string | null
  startedAt: string | null
  completedAt: string | null
  sortOrder: number
}

interface LearningEntry {
  id: string
  resourceTitle: string
  topic: string | null
  minutesWatched: number
  month: string
  resourceUrl: string
}

interface AssignedTask {
  id: string
  title: string
  status: string
  dueDate: string | null
  priority: string
}

interface FreelancerProject {
  id: string
  title: string
  status: string
  clientName: string
}

interface Props {
  userId: string
  userName: string
  userRole: string
  department: string
  joiningDate: string | null
  todayPlan: {
    id: string
    date: string
    status: string
    tasks: Task[]
    submittedAt: string | null
  } | null
  recentLearning: LearningEntry[]
  weeklyStats: {
    completedTasks: number
    totalTasks: number
    totalHours: number
    completionRate: number
  }
  assignedTasks: AssignedTask[]
  freelancerProjects: FreelancerProject[]
}

const ACTIVITY_TYPES = [
  'Client Work',
  'Learning',
  'Meeting',
  'Research',
  'Documentation',
  'Code Review',
  'Design Work',
  'Admin Task',
  'Break',
]

export default function MyDayClient({
  userId,
  userName,
  userRole,
  department,
  joiningDate,
  todayPlan,
  recentLearning,
  weeklyStats,
  assignedTasks,
  freelancerProjects,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>(todayPlan?.tasks || [])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    activityType: 'Client Work',
    description: '',
    plannedHours: 1,
  })
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isIntern = userRole === 'INTERN'
  const isFreelancer = userRole === 'FREELANCER'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Good Morning', icon: Sun }
    if (hour < 17) return { text: 'Good Afternoon', icon: Coffee }
    return { text: 'Good Evening', icon: Moon }
  }

  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  const completedToday = tasks.filter(t => t.status === 'COMPLETED').length
  const totalToday = tasks.length
  const hoursLogged = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)

  const handleAddTask = async () => {
    if (!newTask.description.trim()) return

    setSaving(true)
    try {
      const res = await fetch('/api/daily/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...newTask,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTasks([...tasks, data.task])
        setNewTask({ activityType: 'Client Work', description: '', plannedHours: 1 })
        setShowAddTask(false)
      }
    } catch (error) {
      console.error('Failed to add task:', error)
    }
    setSaving(false)
  }

  const handleStartTask = async (taskId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/daily/tasks/${taskId}/start`, {
        method: 'POST',
      })

      if (res.ok) {
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, status: 'IN_PROGRESS', startedAt: new Date().toISOString() } : t
        ))
        setActiveTaskId(taskId)
      }
    } catch (error) {
      console.error('Failed to start task:', error)
    }
    setSaving(false)
  }

  const handleCompleteTask = async (taskId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/daily/tasks/${taskId}/complete`, {
        method: 'POST',
      })

      if (res.ok) {
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() } : t
        ))
        if (activeTaskId === taskId) setActiveTaskId(null)
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
    setSaving(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'IN_PROGRESS':
        return <Play className="w-5 h-5 text-blue-500" />
      default:
        return <Circle className="w-5 h-5 text-slate-300" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-red-500/20 text-red-400'
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400'
      default:
        return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      <PageGuide
        pageKey="my-day"
        title="Daily Planner"
        description="Plan your day, log work hours, and track deliverables."
        steps={[
          { label: 'Plan daily tasks', description: 'Add and organize tasks for your workday' },
          { label: 'Log work hours', description: 'Track time spent on each task accurately' },
          { label: 'Track deliverables', description: 'Monitor progress on assigned work items' },
          { label: 'Submit before deadline', description: 'Complete and submit your daily plan on time' },
        ]}
      />

      {/* Greeting Header */}
      <div className="bg-black rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GreetingIcon className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">{greeting.text}, {userName.split(' ')[0]}!</h1>
            <p className="text-slate-300">
              {isIntern ? 'Intern' : isFreelancer ? 'Freelancer' : department} at Branding Pioneers
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-400">Today</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{completedToday}/{totalToday}</p>
          <p className="text-xs text-slate-500">tasks done</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-slate-400">Hours</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{hoursLogged.toFixed(1)}</p>
          <p className="text-xs text-slate-500">logged today</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-slate-400">This Week</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{weeklyStats.completionRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-500">completion rate</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-slate-400">Learning</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {(recentLearning.reduce((sum, l) => sum + l.minutesWatched, 0) / 60).toFixed(1)}h
          </p>
          <p className="text-xs text-slate-500">this week</p>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="glass-card rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Today's Tasks</h2>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <div className="p-4 bg-indigo-50 border-b border-indigo-100">
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={newTask.activityType}
                onChange={(e) => setNewTask({ ...newTask, activityType: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
              >
                {ACTIVITY_TYPES.map(type => (
                  <option key={type} value={type} className="bg-slate-800">{type}</option>
                ))}
              </select>
              <input
                type="text"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="What are you working on?"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400"
              />
              <input
                type="number"
                value={newTask.plannedHours}
                onChange={(e) => setNewTask({ ...newTask, plannedHours: parseFloat(e.target.value) || 1 })}
                placeholder="Hours"
                className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900"
                min="0.5"
                step="0.5"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddTask}
                  disabled={saving || !newTask.description.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 glass-card text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-800/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="divide-y divide-white/10">
          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No tasks for today yet.</p>
              <p className="text-sm text-slate-400">Add a task to get started!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={`p-4 flex items-center gap-4 hover:bg-slate-900/40 transition-colors ${
                  task.status === 'IN_PROGRESS' ? 'bg-blue-500/10' : ''
                }`}
              >
                <button
                  onClick={() => task.status === 'COMPLETED' ? null : task.status === 'IN_PROGRESS' ? handleCompleteTask(task.id) : handleStartTask(task.id)}
                  disabled={saving}
                  className="flex-shrink-0"
                >
                  {getStatusIcon(task.status)}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded">
                      {task.activityType}
                    </span>
                    <span className="text-xs text-slate-400">
                      {task.plannedHours}h planned
                    </span>
                    {task.actualHours && (
                      <span className="text-xs text-emerald-600">
                        {task.actualHours}h logged
                      </span>
                    )}
                  </div>
                </div>

                {task.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={saving}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30"
                  >
                    Done
                  </button>
                )}
                {task.status === 'PENDING' && (
                  <button
                    onClick={() => handleStartTask(task.id)}
                    disabled={saving}
                    className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200"
                  >
                    Start
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assigned Tasks (for Interns) */}
      {isIntern && assignedTasks.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Assigned by Mentor</h2>
          </div>
          <div className="divide-y divide-white/10">
            {assignedTasks.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-slate-400 mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Projects (for Freelancers) */}
      {isFreelancer && freelancerProjects.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-300" />
            <h2 className="font-semibold text-white">Active Projects</h2>
          </div>
          <div className="divide-y divide-white/10">
            {freelancerProjects.map(project => (
              <div key={project.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{project.title}</p>
                  <p className="text-xs text-slate-400">{project.clientName}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded bg-emerald-500/20 text-emerald-400">
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Learning */}
      {recentLearning.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-white">Recent Learning</h2>
            </div>
            <a href="/learning" className="text-sm text-indigo-600 hover:text-indigo-700">
              View All
            </a>
          </div>
          <div className="divide-y divide-white/10">
            {recentLearning.slice(0, 3).map(entry => (
              <div key={entry.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{entry.resourceTitle}</p>
                  <p className="text-xs text-slate-400">
                    {entry.topic || 'General'} - {(entry.minutesWatched / 60).toFixed(1)}h
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(entry.month).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <a
          href="/learning"
          className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-200 rounded-xl hover:bg-amber-500/20 transition-colors"
        >
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-amber-800">Log Learning</span>
        </a>
        <a
          href="/tasks"
          className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-200 rounded-xl hover:bg-blue-500/20 transition-colors"
        >
          <Target className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-blue-800">All Tasks</span>
        </a>
        <a
          href="/calendar"
          className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-200 rounded-xl hover:bg-purple-500/20 transition-colors"
        >
          <Calendar className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-purple-800">Calendar</span>
        </a>
        <a
          href={isIntern ? '/intern/handbook' : '/knowledge'}
          className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors"
        >
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span className="font-medium text-emerald-800">{isIntern ? 'Handbook' : 'Resources'}</span>
        </a>
      </div>
    </div>
  )
}
