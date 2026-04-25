'use client'

import { useState, useEffect } from 'react'
import {
  getActivitiesForUser,
  isWeeklyPlanningDay,
  calculateTotalHours,
} from '@/shared/constants/departmentActivities'
import { QuickAddLeadModal } from '@/client/components/tasks'
import { getResponseError } from '@/shared/utils/utils'
import { BDTrackerView } from './views/BDTrackerView'
import { HRGanttView } from './views/HRGanttView'
import { OpsClientListView } from './views/OpsClientListView'
import { ExcelTrackerView } from './views/ExcelTrackerView'
import {
  ToastNotification,
  PlannerHeader,
  EscalationsBanner,
  StatsRow,
  TaskTableView,
  AddTaskModal,
  EditTaskModal,
  CompleteTaskModal,
  CommunicateModal,
  LoadingOverlay,
  ManagerReviewPanel,
} from './components'
import type {
  Task,
  Plan,
  TeamPlan,
  Escalation,
  Lead,
  HRPipelineTask,
  PendingReviewTask,
  ViewType,
  TaskMessageData,
  CompleteFormState,
  NewTaskState,
  Client,
} from './components/types'
import { NEW_TASK_INITIAL_STATE } from './components/types'

interface Props {
  initialPlan: Plan | null
  clients: Client[]
  teamPlans: TeamPlan[]
  escalations: Escalation
  currentUserId: string
  department: string
  role: string
  isManager: boolean
  viewType?: ViewType
  leads?: Lead[]
  hrPipelineTasks?: HRPipelineTask[]
  pendingReviewTasks?: PendingReviewTask[]
  viewAsUserId?: string // When admin is viewing as another user
}

export function DailyTaskPlannerClient({
  initialPlan,
  clients,
  teamPlans,
  escalations,
  currentUserId,
  department,
  role,
  isManager,
  viewType = 'default',
  leads = [],
  hrPipelineTasks = [],
  pendingReviewTasks: initialPendingReviewTasks = [],
  viewAsUserId,
}: Props) {
  // When admin is viewing as another user, use viewAsUserId for all operations
  const effectiveUserId = viewAsUserId || currentUserId
  const [plan, setPlan] = useState<Plan | null>(initialPlan)
  const [pendingReviewTasks, setPendingReviewTasks] = useState<PendingReviewTask[]>(initialPendingReviewTasks)
  const [tasks, setTasks] = useState<Task[]>(initialPlan?.tasks || [])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddTask, setShowAddTask] = useState(false)
  const [viewMode, setViewMode] = useState<'my' | 'team'>('my')
  const [activeView, setActiveView] = useState<ViewType>(viewType)
  const [layoutMode, setLayoutMode] = useState<'table' | 'excel'>('excel')

  // Modal states
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)
  const [completeForm, setCompleteForm] = useState<CompleteFormState>({ actualHours: 0, isBreakdown: false, breakdownReason: '', rateTask: 0, deliverable: '', proofUrl: '', clientVisible: false })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Unsaved changes detection
  const hasUnsavedChanges = showAddTask || !!editingTask || !!completingTask

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  // Client communication modal states
  const [showCommunicateModal, setShowCommunicateModal] = useState(false)
  const [taskMessageData, setTaskMessageData] = useState<TaskMessageData | null>(null)
  const [editedMessage, setEditedMessage] = useState('')
  const [loadingMessage, setLoadingMessage] = useState(false)

  const activities = getActivitiesForUser(role, department)
  const isMonday = isWeeklyPlanningDay()
  const { planned: totalPlanned, actual: totalActual } = calculateTotalHours(tasks)

  const [newTask, setNewTask] = useState<NewTaskState>(NEW_TASK_INITIAL_STATE)

  // Quick-add lead modal state
  const [showQuickAddLead, setShowQuickAddLead] = useState(false)
  const [localLeads, setLocalLeads] = useState(leads)

  // New client creation states
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [clientsList, setClientsList] = useState(clients)

  // Show toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (selectedDate !== new Date().toISOString().split('T')[0]) {
      fetchPlan(selectedDate)
    }
  }, [selectedDate])

  const fetchPlan = async (date: string) => {
    setLoading(true)
    try {
      const url = viewAsUserId
        ? `/api/tasks/daily?date=${date}&viewAsUserId=${viewAsUserId}`
        : `/api/tasks/daily?date=${date}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setPlan(data.plan)
        setTasks(data.plan?.tasks || [])
      }
    } catch (error) {
      console.error('Failed to fetch plan:', error)
      showToast('Failed to fetch plan', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.activityType || !newTask.description) return

    setLoading(true)
    try {
      let clientId = newTask.clientId

      // Create new client if needed
      if (isCreatingNewClient && newClientName.trim()) {
        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newClientName.trim(),
            status: 'ACTIVE',
            lifecycleStage: 'ACTIVE',
          }),
        })

        if (clientRes.ok) {
          const clientData = await clientRes.json()
          clientId = clientData.id
          setClientsList(prev => [...prev, { id: clientData.id, name: clientData.name }].sort((a, b) => a.name.localeCompare(b.name)))
          showToast(`Client "${newClientName}" created`, 'success')
        } else {
          showToast('Failed to create client', 'error')
          setLoading(false)
          return
        }
      }

      const taskPayload = { ...newTask, clientId }
      // Include assignToId for manager task delegation or when viewing as another user
      const res = await fetch('/api/tasks/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          task: taskPayload,
          // When admin is viewing as another user, create task in their plan
          assignToId: viewAsUserId || taskPayload.assignToId || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setPlan(data.plan)
        setTasks(data.plan.tasks)
        setShowAddTask(false)
        setIsCreatingNewClient(false)
        setNewClientName('')
        setNewTask(NEW_TASK_INITIAL_STATE)
        showToast('Task added successfully', 'success')
      } else {
        const errorMsg = await getResponseError(res, 'Failed to add task')
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      console.error('Failed to add task:', error)
      showToast('Unable to add task. Please check your connection and try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTask = async () => {
    if (!editingTask) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/daily/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: editingTask.clientId || null,
          activityType: editingTask.activityType,
          description: editingTask.description,
          plannedStartTime: editingTask.plannedStartTime,
          plannedHours: editingTask.plannedHours,
          priority: editingTask.priority,
          notes: editingTask.notes,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => (t.id === editingTask.id ? data.task : t)))
        setEditingTask(null)
        showToast('Task updated successfully', 'success')
      } else {
        const errorMsg = await getResponseError(res, 'Failed to update task')
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      showToast('Unable to update task. Please check your connection and try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/daily/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        showToast('Task deleted successfully', 'success')
      } else {
        const errorMsg = await getResponseError(res, 'Failed to delete task')
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      showToast('Unable to delete task. Please check your connection and try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTask = async (taskId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/daily/${taskId}/start`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => (t.id === taskId ? data.task : t)))
        showToast('Task started', 'success')
      } else {
        const errorMsg = await getResponseError(res, 'Failed to start task')
        showToast(errorMsg, 'error')
      }
    } catch (error) {
      console.error('Failed to start task:', error)
      showToast('Unable to start task. Please check your connection and try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openCompleteModal = (task: Task) => {
    setCompletingTask(task)
    setCompleteForm({
      actualHours: task.plannedHours,
      isBreakdown: false,
      breakdownReason: '',
      rateTask: 0,
      deliverable: task.deliverable || '',
      proofUrl: '',
      clientVisible: false,
    })
  }

  const handleCompleteTask = async () => {
    if (!completingTask) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/daily/${completingTask.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualHours: completeForm.actualHours,
          isBreakdown: completeForm.isBreakdown,
          breakdownReason: completeForm.isBreakdown ? completeForm.breakdownReason : null,
          rateTask: completeForm.rateTask || null,
          deliverable: completeForm.deliverable || null,
          proofUrl: completeForm.proofUrl || null,
          clientVisible: completeForm.clientVisible,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => (t.id === completingTask.id ? data.task : t)))
        const completedTask = completingTask
        setCompletingTask(null)
        showToast(completeForm.isBreakdown ? 'Task marked as breakdown' : 'Task completed', 'success')

        // If task has a client and wasn't a breakdown, prompt for client communication
        if (completedTask.clientId && !completeForm.isBreakdown) {
          promptClientCommunication(completedTask.id)
        }
      } else {
        showToast('Failed to complete task', 'error')
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
      showToast('Failed to complete task', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Excel view handlers
  const handleExcelUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/daily/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(prev => prev.map(t => (t.id === taskId ? data.task : t)))
      } else {
        showToast('Failed to update task', 'error')
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      showToast('Failed to update task', 'error')
    }
  }

  const handleExcelAddTask = async (taskData: { clientId: string | null; clientName?: string | null; activityType: string; description: string; plannedHours: number; priority: string }): Promise<string | null> => {
    try {
      const res = await fetch('/api/tasks/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          task: {
            clientId: taskData.clientId || null,
            clientName: taskData.clientName || null,
            activityType: taskData.activityType,
            description: taskData.description,
            plannedHours: taskData.plannedHours,
            priority: taskData.priority,
          },
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setPlan(data.plan)
        setTasks(data.plan.tasks)
        showToast('Task added', 'success')
        const newTask = data.plan.tasks[data.plan.tasks.length - 1]
        return newTask?.id || null
      } else {
        showToast('Failed to add task', 'error')
        return null
      }
    } catch (error) {
      console.error('Failed to add task:', error)
      showToast('Failed to add task', 'error')
      return null
    }
  }

  const handleExcelCompleteTask = async (taskId: string, data: { actualHours: number; deliverable: string; proofUrl: string; clientVisible: boolean }) => {
    try {
      const res = await fetch(`/api/tasks/daily/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualHours: data.actualHours,
          isBreakdown: false,
          deliverable: data.deliverable,
          proofUrl: data.proofUrl,
          clientVisible: data.clientVisible,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        setTasks(prev => prev.map(t => (t.id === taskId ? result.task : t)))
        showToast('Task completed', 'success')
      } else {
        showToast('Failed to complete task', 'error')
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
      showToast('Failed to complete task', 'error')
    }
  }

  // Client communication handlers
  const promptClientCommunication = async (taskId: string) => {
    setLoadingMessage(true)
    try {
      const res = await fetch('/api/whatsapp/task-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })
      if (res.ok) {
        const data = await res.json()
        setTaskMessageData(data)
        setEditedMessage(data.message)
        setShowCommunicateModal(true)
      }
    } catch (error) {
      console.error('Failed to generate task message:', error)
    } finally {
      setLoadingMessage(false)
    }
  }

  const handleSendWhatsAppExternal = async () => {
    if (!taskMessageData || !editedMessage.trim()) return

    const encodedMessage = encodeURIComponent(editedMessage)

    if (taskMessageData.clientPhone) {
      const phone = taskMessageData.clientPhone.replace(/[^\d+]/g, '')
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer')
    }

    try {
      await fetch(`/api/tasks/daily/${taskMessageData.taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientCommunicated: true,
          communicatedVia: 'WHATSAPP',
          communicationMessage: editedMessage,
        }),
      })
      setTasks(prev =>
        prev.map(t =>
          t.id === taskMessageData.taskId
            ? { ...t, clientCommunicated: true, communicatedVia: 'WHATSAPP' }
            : t
        )
      )
    } catch (error) {
      console.error('Failed to update task communication status:', error)
    }

    setShowCommunicateModal(false)
    setTaskMessageData(null)
    showToast('WhatsApp opened with message', 'success')
  }

  const handleSendWhatsAppInternal = async () => {
    if (!taskMessageData || !editedMessage.trim() || !taskMessageData.accountId || !taskMessageData.clientPhone) return

    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/task-message', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: taskMessageData.taskId,
          accountId: taskMessageData.accountId,
          phoneNumber: taskMessageData.clientPhone,
          message: editedMessage,
        }),
      })

      if (res.ok) {
        setTasks(prev =>
          prev.map(t =>
            t.id === taskMessageData.taskId
              ? { ...t, clientCommunicated: true, communicatedVia: 'WHATSAPP' }
              : t
          )
        )
        setShowCommunicateModal(false)
        setTaskMessageData(null)
        showToast('Message sent via WhatsApp', 'success')
      } else {
        const error = await res.json()
        showToast(error.error || 'Failed to send message', 'error')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      showToast('Failed to send message', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenWhatsAppGroup = (joinLink: string) => {
    window.open(joinLink, '_blank', 'noopener,noreferrer')
    setShowCommunicateModal(false)
    showToast('WhatsApp group opened', 'success')
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(editedMessage)
      showToast('Message copied to clipboard', 'success')
    } catch (error) {
      console.error('Failed to copy:', error)
      showToast('Failed to copy message', 'error')
    }
  }

  const handleSkipCommunication = () => {
    setShowCommunicateModal(false)
    setTaskMessageData(null)
  }

  const handleSubmitPlan = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks/daily/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      })
      if (res.ok) {
        const data = await res.json()
        setPlan(data.plan)
        showToast('Plan submitted successfully', 'success')
      } else {
        showToast('Failed to submit plan', 'error')
      }
    } catch (error) {
      console.error('Failed to submit plan:', error)
      showToast('Failed to submit plan', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <ToastNotification toast={toast} />

      {/* Header */}
      <PlannerHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isMonday={isMonday}
        viewType={viewType}
        activeView={activeView}
        setActiveView={setActiveView}
        isManager={isManager}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Role-Specific Views */}
      {activeView === 'bd' && (
        <BDTrackerView
          tasks={tasks.map(t => ({
            id: t.id,
            clientId: t.clientId,
            client: t.client,
            activityType: t.activityType,
            description: t.description,
            plannedHours: t.plannedHours,
            actualHours: t.actualHours,
            status: t.status,
            priority: t.priority,
            leadId: t.leadId || undefined,
            lead: t.lead ? {
              id: t.lead.id,
              companyName: t.lead.companyName,
              contactName: t.lead.contactName,
              stage: t.lead.stage || 'LEAD_RECEIVED',
              value: null,
              nextFollowUp: null,
              lastContactedAt: null,
            } : undefined,
          }))}
          leads={leads}
          onTaskClick={(task) => {
            const foundTask = tasks.find(t => t.id === task.id)
            if (foundTask) setEditingTask(foundTask)
          }}
        />
      )}

      {activeView === 'hr' && (
        <HRGanttView
          dailyTasks={tasks}
          pipelineTasks={hrPipelineTasks}
        />
      )}

      {activeView === 'ops' && (
        <OpsClientListView
          dailyTasks={tasks}
          clients={clients}
        />
      )}

      {activeView !== 'default' && <div className="border-t border-slate-700 my-6" />}

      {/* Escalations Banner (for managers) */}
      {isManager && <EscalationsBanner escalations={escalations} />}

      {/* Manager Review Panel */}
      {isManager && pendingReviewTasks.length > 0 && (
        <ManagerReviewPanel
          tasks={pendingReviewTasks}
          onReviewComplete={async () => {
            try {
              const res = await fetch('/api/tasks/daily/pending-reviews')
              if (res.ok) {
                const data = await res.json()
                setPendingReviewTasks(data.tasks || [])
              }
            } catch (error) {
              console.error('Failed to refresh pending reviews:', error)
            }
          }}
        />
      )}

      {/* Stats Row */}
      <StatsRow
        totalPlanned={totalPlanned}
        totalActual={totalActual}
        taskCount={tasks.length}
        plan={plan}
      />

      {/* Layout Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white text-lg">
          {viewMode === 'my' ? 'My Tasks' : 'Team Tasks'} - {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </h2>
        <div className="flex items-center gap-3">
          {/* Layout Toggle */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setLayoutMode('excel')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                layoutMode === 'excel' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={() => setLayoutMode('table')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                layoutMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Detailed
            </button>
          </div>
          {tasks.length > 0 && plan?.status !== 'SUBMITTED' && (
            <button
              onClick={handleSubmitPlan}
              disabled={loading}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              Submit Plan
            </button>
          )}
        </div>
      </div>

      {/* Excel View */}
      {layoutMode === 'excel' && (
        <ExcelTrackerView
          tasks={tasks}
          clients={clients}
          department={department}
          role={role}
          onUpdateTask={handleExcelUpdateTask}
          onAddTask={handleExcelAddTask}
          onDeleteTask={handleDeleteTask}
          onStartTask={handleStartTask}
          onCompleteTask={handleExcelCompleteTask}
        />
      )}

      {/* Detailed Table View */}
      {layoutMode === 'table' && (
        <TaskTableView
          tasks={tasks}
          activities={activities}
          totalActual={totalActual}
          loading={loading}
          onShowAddTask={() => setShowAddTask(true)}
          onStartTask={handleStartTask}
          onEditTask={setEditingTask}
          onDeleteTask={handleDeleteTask}
          onCompleteTask={openCompleteModal}
          onPromptClientCommunication={promptClientCommunication}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          newTask={newTask}
          setNewTask={setNewTask}
          activities={activities}
          department={department}
          clientsList={clientsList}
          localLeads={localLeads}
          isCreatingNewClient={isCreatingNewClient}
          setIsCreatingNewClient={setIsCreatingNewClient}
          newClientName={newClientName}
          setNewClientName={setNewClientName}
          loading={loading}
          onAdd={handleAddTask}
          onCancel={() => setShowAddTask(false)}
          onShowQuickAddLead={() => setShowQuickAddLead(true)}
          role={role}
          currentUserId={currentUserId}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          activities={activities}
          clientsList={clientsList}
          loading={loading}
          onSave={handleEditTask}
        />
      )}

      {/* Complete Task Modal */}
      {completingTask && (
        <CompleteTaskModal
          completingTask={completingTask}
          completeForm={completeForm}
          setCompleteForm={setCompleteForm}
          loading={loading}
          onComplete={handleCompleteTask}
          onCancel={() => setCompletingTask(null)}
        />
      )}

      {/* Communicate to Client Modal */}
      {showCommunicateModal && taskMessageData && (
        <CommunicateModal
          taskMessageData={taskMessageData}
          editedMessage={editedMessage}
          setEditedMessage={setEditedMessage}
          loading={loading}
          onSendExternal={handleSendWhatsAppExternal}
          onSendInternal={handleSendWhatsAppInternal}
          onOpenGroup={handleOpenWhatsAppGroup}
          onCopyMessage={handleCopyMessage}
          onSkip={handleSkipCommunication}
        />
      )}

      {/* Loading indicator for message generation */}
      <LoadingOverlay visible={loadingMessage} />

      {/* Quick Add Lead Modal (for Sales) */}
      <QuickAddLeadModal
        isOpen={showQuickAddLead}
        onClose={() => setShowQuickAddLead(false)}
        onSuccess={(lead) => {
          setLocalLeads(prev => [...prev, {
            ...lead,
            value: null,
            nextFollowUp: null,
            lastContactedAt: null,
          }])
          setNewTask({ ...newTask, leadId: lead.id })
          showToast(`Lead "${lead.companyName}" created`, 'success')
        }}
      />
    </div>
  )
}
