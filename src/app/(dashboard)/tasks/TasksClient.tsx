'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserAvatar } from '@/client/components/ui/UserAvatar'
import { downloadCSV } from '@/client/utils/downloadCSV'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'
import DataDiscovery from '@/client/components/ui/DataDiscovery'

interface Task {
  id: string
  title: string
  description: string | null
  department: string
  priority: string
  status: string
  dueDate: string | null
  startDate: string | null
  estimatedHours: number | null
  actualHours: number | null
  timeSpent: number
  timerStartedAt: string | null
  taskOutcome: string
  breakdownReason: string | null
  proofUrl: string | null
  assignee: {
    id: string
    firstName: string
    lastName: string | null
    email?: string | null
    department?: string | null
    role?: string
    profile?: { profilePicture: string | null } | null
  } | null
  creator: { firstName: string; lastName: string | null }
  client: { id: string; name: string } | null
  createdAt: string
  _count?: { subtasks: number; comments: number }
}

interface TasksClientProps {
  tasks: Task[]
  users: Array<{ id: string; firstName: string; lastName: string | null; department: string }>
  clients: Array<{ id: string; name: string }>
  leads: Array<{ id: string; companyName: string; contactName: string | null }>
  currentUserId: string
  isManager: boolean
  userDepartment: string
  userRole: string
}

// Activities dropdown per department
const DEPT_ACTIVITIES: Record<string, string[]> = {
  WEB: ['Page Development', 'Bug Fix', 'Feature Build', 'Revisions', 'Testing', 'Deployment', 'Other'],
  SEO: ['Keyword Research', 'On-Page Optimization', 'Backlinks', 'Technical SEO', 'Reporting', 'Content Brief', 'Other'],
  SOCIAL: ['Post Design', 'Reel', 'Story', 'Content Calendar', 'Scheduling', 'Engagement', 'Other'],
  GRAPHICS: ['Static Design', 'Carousel', 'Video Edit', 'Thumbnail', 'Motion Graphics', 'Logo/Brand', 'Other'],
  ADS: ['Campaign Setup', 'Optimization', 'Reporting', 'Audit', 'Audience Research', 'Creative Brief', 'Other'],
  ACCOUNTS: ['PI Generation', 'Payment Follow-up', 'GST Filing', 'Reconciliation', 'Expense Tracking', 'Other'],
  SALES: ['Cold Call', 'Follow-up', 'Demo', 'Proposal', 'Negotiation', 'CRM Update', 'Other'],
  HR: ['Hiring Pipeline', 'Escalation', 'Onboarding', 'Policy Update', 'Attendance', 'Other'],
  OPERATIONS: ['Process Setup', 'Escalation', 'Quality Check', 'Client Review', 'Other'],
}

const outcomeColors: Record<string, string> = {
  BREAKTHROUGH: 'bg-emerald-500/20 text-emerald-400 border-emerald-300',
  BREAKDOWN: 'bg-red-500/20 text-red-800 border-red-300',
  PENDING: 'bg-slate-800/50 text-slate-300 border-white/10',
}

export function TasksClient({ tasks: initialTasks, users, clients, leads, currentUserId, isManager, userDepartment, userRole }: TasksClientProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState({ status: 'ALL', assignee: 'ALL' })
  const [updating, setUpdating] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

  // Inline creation state
  const [showInline, setShowInline] = useState(false)
  const [newClientId, setNewClientId] = useState('')
  const [newActivity, setNewActivity] = useState('')
  const [newCustomText, setNewCustomText] = useState('') // For WEB: page name, HR: custom text
  const [newLeadId, setNewLeadId] = useState('') // For SALES

  // Stop modal
  const [showStopModal, setShowStopModal] = useState<Task | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [breakdownReason, setBreakdownReason] = useState('')

  // Timer tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => { setTasks(initialTasks) }, [initialTasks])

  const dept = userDepartment
  const isSales = dept === 'SALES'
  const isHR = dept === 'HR'
  const activities = DEPT_ACTIVITIES[dept] || DEPT_ACTIVITIES['WEB'] || []

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filter.status === 'ALL' || task.status === filter.status
    const matchesAssignee = filter.assignee === 'ALL' || task.assignee?.id === filter.assignee
    return matchesStatus && matchesAssignee
  })

  const formatMinutes = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hrs}h ${mins}m`
  }

  const getRunningTime = (task: Task) => {
    let totalMins = task.timeSpent || 0
    if (task.timerStartedAt) {
      const diffMs = now.getTime() - new Date(task.timerStartedAt).getTime()
      totalMins += Math.floor(diffMs / 60000)
    }
    return formatMinutes(totalMins)
  }

  // --- Inline Task Creation ---
  const handleInlineCreate = async () => {
    // Build title from selections
    let title = ''
    let clientId: string | null = null

    if (isSales) {
      const lead = leads.find(l => l.id === newLeadId)
      title = `${lead?.companyName || 'Lead'} - ${newActivity}`
    } else if (isHR) {
      title = `${newActivity}${newCustomText ? ': ' + newCustomText : ''}`
    } else {
      const client = clients.find(c => c.id === newClientId)
      clientId = newClientId || null
      const detail = dept === 'WEB' ? newCustomText : ''
      title = `${client?.name || 'Internal'} - ${newActivity}${detail ? ' (' + detail + ')' : ''}`
    }

    if (!newActivity) return

    setUpdating('creating')
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department: dept,
          clientId,
          assigneeId: currentUserId,
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          startTimer: true, // Auto-start timer
        }),
      })
      if (res.ok) {
        // Reset form
        setNewClientId('')
        setNewActivity('')
        setNewCustomText('')
        setNewLeadId('')
        setShowInline(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setUpdating(null)
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdating(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleStartTimer = async (taskId: string) => {
    setUpdating(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START' }),
      })
      if (res.ok) {
        const { task } = await res.json()
        setTasks(tasks.map(t => t.id === taskId ? { ...t, ...task } : t))
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to start timer:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleStopTimerSubmit = async () => {
    if (!showStopModal) return
    const taskId = showStopModal.id

    const startDate = new Date(showStopModal.startDate || showStopModal.createdAt)
    const isSameDay =
      startDate.getFullYear() === now.getFullYear() &&
      startDate.getMonth() === now.getMonth() &&
      startDate.getDate() === now.getDate()

    if (!isSameDay && !breakdownReason.trim()) {
      toast.error("Breakdown reason is required because this task was not completed on the same day it was started.")
      return
    }
    if (!proofUrl.trim()) {
      toast.error("Proof URL is required to close a task.")
      return
    }

    setUpdating(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'STOP', proofUrl, breakdownReason }),
      })
      if (res.ok) {
        const { task } = await res.json()
        setTasks(tasks.map(t => t.id === taskId ? { ...t, ...task } : t))
        setShowStopModal(null)
        setProofUrl('')
        setBreakdownReason('')
        router.refresh()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to stop timer")
      }
    } catch (error) {
      console.error('Failed to stop timer:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to cancel this task?')) return
    setUpdating(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId))
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="tasks"
        title="Tasks"
        description="View and manage all assigned tasks with timer tracking."
        steps={[
          { label: 'Filter by status', description: 'Focus on To Do, In Progress, or Completed tasks' },
          { label: 'Use timers', description: 'Track time spent on each task accurately' },
          { label: 'Create tasks', description: 'Add new tasks with client and activity details' },
        ]}
      />

      <DataDiscovery dataType="tasks" />

      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4 rounded-t-xl border-b border-white/10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Task Sheet</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCSV(filteredTasks.map(t => ({
              Title: t.title,
              Status: t.status,
              Priority: t.priority,
              Assignee: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName || ''}`.trim() : 'Unassigned',
              Client: t.client?.name || '',
              'Due Date': t.dueDate ? formatDateDDMMYYYY(t.dueDate) : '',
              'Created Date': formatDateDDMMYYYY(t.createdAt),
            })), 'tasks.csv')}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition"
          >
            Export CSV
          </button>
          <span className="flex items-center">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <InfoTip text="Filter tasks by their current status" type="action" />
          </span>
          {isManager && (
            <select
              value={filter.assignee}
              onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="ALL">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName || ''}</option>
              ))}
            </select>
          )}
          {!isManager && (
            <button
              onClick={() => setShowInline(!showInline)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Quick Add
            </button>
          )}
        </div>
      </div>

      {/* Inline Creation Row */}
      {showInline && !isManager && (
        <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Col 1: Client/Lead selector */}
            {isSales ? (
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lead / CRM <InfoTip text="Which client or lead this task is for. Select 'Internal' for non-client work." /></label>
                <select
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                >
                  <option value="">Select Lead...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.companyName} {l.contactName ? `(${l.contactName})` : ''}</option>
                  ))}
                </select>
              </div>
            ) : isHR ? (
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category <InfoTip text="Type of work - options depend on your department (SEO, Ads, Social, Web, etc.)." /></label>
                <select
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                >
                  <option value="">Select Category...</option>
                  {activities.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            ) : (
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client <InfoTip text="Which client or lead this task is for. Select 'Internal' for non-client work." /></label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                >
                  <option value="">Select Client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Col 2: Activity */}
            {!isHR && (
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Activity <InfoTip text="Type of work - options depend on your department (SEO, Ads, Social, Web, etc.)." /></label>
                <select
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                >
                  <option value="">Select Activity...</option>
                  {activities.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            )}

            {/* Col 3: Extra detail (for WEB: page name, HR: description) */}
            {(dept === 'WEB' || isHR) && (
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {dept === 'WEB' ? 'Page / Section' : 'Details'} <InfoTip text="Specific page or area you're working on. Helps track deliverable location." />
                </label>
                <input
                  type="text"
                  value={newCustomText}
                  onChange={(e) => setNewCustomText(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm glass-card"
                  placeholder={dept === 'WEB' ? 'e.g. Homepage, About Us' : 'Details...'}
                />
              </div>
            )}

            {/* Start button */}
            <button
              onClick={handleInlineCreate}
              disabled={updating === 'creating' || !newActivity}
              className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              {updating === 'creating' ? 'Starting...' : 'Start Task'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Timer will auto-start when you click Start Task</p>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-b-xl border border-t-0 border-white/10 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/5 w-8 text-center bg-slate-900/40">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/5 w-1/4">Task & Client</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/5 w-36">Status</th>
                {isManager && <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/5 w-36">Assignee</th>}
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/5 w-32 text-center">Timer</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/5 w-32 text-center">Outcome</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.map((task, index) => (
                <tr key={task.id} className="hover:bg-blue-500/10 transition-colors group">
                  <td className="px-4 py-3 text-xs text-slate-400 text-center border-r border-white/5 bg-slate-900/40">{index + 1}</td>

                  {/* Task Name */}
                  <td className="px-4 py-3 border-r border-white/5">
                    <p className="font-medium text-slate-900 dark:text-white text-sm leading-tight">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/10 px-1.5 py-0.5 rounded">{task.department}</span>
                      {task.client && <span className="text-xs text-slate-400 truncate max-w-[150px]" title={task.client.name}>- {task.client.name}</span>}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-2 py-2 border-r border-white/5">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      disabled={updating === task.id || task.status === 'COMPLETED'}
                      className="w-full text-xs font-medium px-2 py-1.5 border border-transparent hover:border-white/10 focus:border-blue-400 rounded transition-all bg-transparent focus:glass-card outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="TODO">TO DO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </td>

                  {/* Assignee (managers only) */}
                  {isManager && (
                    <td className="px-4 py-3 text-xs font-medium text-slate-200 border-r border-white/5">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            user={task.assignee}
                            size="xs"
                            showPreview={true}
                          />
                          <span className="truncate">{task.assignee.firstName} {task.assignee.lastName || ''}</span>
                        </div>
                      ) : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                  )}

                  {/* Timer */}
                  <td className="px-4 py-2 border-r border-white/5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-xs font-mono font-medium ${task.timerStartedAt ? 'text-blue-400 animate-pulse' : 'text-slate-300'}`}>
                        {getRunningTime(task)}
                      </span>
                      {task.status !== 'COMPLETED' && (
                        <>
                          {!task.timerStartedAt ? (
                            <button
                              onClick={() => handleStartTimer(task.id)}
                              disabled={updating === task.id}
                              className="w-7 h-7 rounded-full bg-slate-800/50 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors disabled:opacity-50"
                              title="Start"
                            >
                              <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowStopModal(task)}
                              disabled={updating === task.id}
                              className="w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-200 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                              title="Stop & Complete"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>

                  {/* Outcome */}
                  <td className="px-4 py-3 border-r border-white/5 text-center">
                    {task.status === 'COMPLETED' ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${outcomeColors[task.taskOutcome]}`}>
                          {task.taskOutcome}
                        </span>
                        {task.proofUrl && (
                          <a href={task.proofUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 font-medium">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            Proof
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    {isManager && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={updating === task.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                        title="Cancel Task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="p-16 text-center">
              <div className="inline-flex w-16 h-16 bg-slate-800/50 rounded-full items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No tasks found</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {isManager ? 'No tasks match the current filters.' : 'Click "Quick Add" above to create your first task.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stop & Submit Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/5">
            <div className="p-6 border-b border-white/5 bg-slate-100 dark:bg-slate-900/40">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Complete Task</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Submit your work to stop the timer and close the task.</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">Proof of Work (URL) * <InfoTip text="Link to the completed work (Google Docs, Figma, live URL, etc.). Required to close task." /></label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Google Docs link, Figma link..."
                />
              </div>

              {(() => {
                const startDate = new Date(showStopModal.startDate || showStopModal.createdAt)
                const isSameDay =
                  startDate.getFullYear() === now.getFullYear() &&
                  startDate.getMonth() === now.getMonth() &&
                  startDate.getDate() === now.getDate()

                if (!isSameDay) {
                  return (
                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-100">
                      <label className="block text-sm font-semibold text-red-800 mb-1.5 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Task Roll Over (Breakdown) <InfoTip text="Explain why this task couldn't be completed today. Helps managers identify blockers." />
                      </label>
                      <p className="text-xs text-red-400 mb-3">This task was not completed on the same day it was started. Please explain why.</p>
                      <textarea
                        value={breakdownReason}
                        onChange={(e) => setBreakdownReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-400/20 text-sm outline-none glass-card"
                        placeholder="Why did this task carry over? *"
                        rows={3}
                      />
                    </div>
                  )
                }

                return (
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-start gap-3">
                    <div className="mt-0.5 text-emerald-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Same-Day Completion! (Breakthrough)</p>
                      <p className="text-xs text-emerald-600 mt-0.5">This task will be marked as a Breakthrough.</p>
                    </div>
                  </div>
                )
              })()}
            </div>
            <div className="p-4 border-t border-white/5 bg-slate-900/40 flex justify-end gap-3">
              <button
                onClick={() => { setShowStopModal(null); setProofUrl(''); setBreakdownReason(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStopTimerSubmit}
                disabled={updating === showStopModal.id}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-none transition-colors disabled:opacity-50"
              >
                {updating === showStopModal.id ? 'Submitting...' : 'Stop & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
