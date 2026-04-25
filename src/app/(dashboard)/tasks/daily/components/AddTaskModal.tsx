'use client'

import { useState, useEffect } from 'react'
import {
  TASK_PRIORITIES,
} from '@/shared/constants/departmentActivities'
import {
  LeadDropdown,
  DepartmentDropdown,
  AccountsTaskTypeDropdown,
} from '@/client/components/tasks'
import type { Client, Lead, NewTaskState } from './types'

interface TeamMember {
  id: string
  firstName: string
  lastName: string | null
}

interface AddTaskModalProps {
  newTask: NewTaskState
  setNewTask: (task: NewTaskState) => void
  activities: Array<{ id: string; label: string }>
  department: string
  clientsList: Client[]
  localLeads: Lead[]
  isCreatingNewClient: boolean
  setIsCreatingNewClient: (creating: boolean) => void
  newClientName: string
  setNewClientName: (name: string) => void
  loading: boolean
  onAdd: () => void
  onCancel: () => void
  onShowQuickAddLead: () => void
  role?: string
  currentUserId?: string
}

export function AddTaskModal({
  newTask,
  setNewTask,
  activities,
  department,
  clientsList,
  localLeads,
  isCreatingNewClient,
  setIsCreatingNewClient,
  newClientName,
  setNewClientName,
  loading,
  onAdd,
  onCancel,
  onShowQuickAddLead,
  role,
  currentUserId,
}: AddTaskModalProps) {
  // Based on Permission Matrix: SUPER_ADMIN, MANAGER, OPERATIONS_HEAD can assign tasks
  const isManagerRole = role && ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(role)
  // SUPER_ADMIN sees all employees; MANAGER & OPERATIONS_HEAD see their department only
  const seesAllDepartments = role === 'SUPER_ADMIN'
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    if (!isManagerRole) return
    setLoadingMembers(true)
    fetch('/api/admin/users')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const users = (data.users || data || []) as Array<{ id: string; firstName: string; lastName: string | null; status?: string; department?: string }>
          setTeamMembers(
            users
              .filter(u => (u.status === 'ACTIVE' || !u.status) && (seesAllDepartments || !department || u.department === department))
              .map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }))
          )
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMembers(false))
  }, [isManagerRole, department, seesAllDepartments])
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Add New Task</h3>
        <div className="space-y-4">
          {/* Department-specific dropdowns */}
          {department === 'SALES' ? (
            // Sales: Lead dropdown
            <div className="space-y-3">
              <LeadDropdown
                leads={localLeads}
                selectedLeadId={newTask.leadId || null}
                onSelect={(leadId) => setNewTask({ ...newTask, leadId: leadId || '' })}
                onQuickAdd={onShowQuickAddLead}
              />
              {/* Also show client dropdown for existing clients */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Or Link to Client</label>
                <select
                  value={newTask.clientId}
                  onChange={e => setNewTask({ ...newTask, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                >
                  <option value="">No Client</option>
                  {clientsList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : department === 'HR' ? (
            // HR: Department target only (internal tasks)
            <DepartmentDropdown
              selectedDepartment={newTask.departmentTarget || null}
              onSelect={(dept) => setNewTask({ ...newTask, departmentTarget: dept || '' })}
              label="Target Department"
            />
          ) : department === 'ACCOUNTS' ? (
            // Accounts: Task type, department, compliance, and client
            <div className="space-y-3">
              <AccountsTaskTypeDropdown
                selectedTaskType={newTask.accountsTaskType || null}
                selectedComplianceType={newTask.complianceType || null}
                onTaskTypeSelect={(type) => setNewTask({ ...newTask, accountsTaskType: type || '' })}
                onComplianceTypeSelect={(type) => setNewTask({ ...newTask, complianceType: type || '' })}
              />
              {/* Department dropdown for internal accounts tasks */}
              <DepartmentDropdown
                selectedDepartment={newTask.departmentTarget || null}
                onSelect={(dept) => setNewTask({ ...newTask, departmentTarget: dept || '' })}
                label="Related Department (optional)"
              />
              {/* Client dropdown - required for client-related tasks */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Client {['CLIENT_INVOICE', 'CLIENT_PAYMENT'].includes(newTask.accountsTaskType) ? '*' : '(optional)'}
                </label>
                <select
                  value={newTask.clientId}
                  onChange={e => setNewTask({ ...newTask, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  required={['CLIENT_INVOICE', 'CLIENT_PAYMENT'].includes(newTask.accountsTaskType)}
                >
                  <option value="">
                    {['CLIENT_INVOICE', 'CLIENT_PAYMENT'].includes(newTask.accountsTaskType)
                      ? 'Select Client'
                      : 'No Client (Internal)'}
                  </option>
                  {clientsList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            // Default (WEB, SEO, etc.): Client dropdown with prominent quick-add
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Client</label>
              {!isCreatingNewClient ? (
                <div className="flex gap-2">
                  <select
                    value={newTask.clientId}
                    onChange={e => setNewTask({ ...newTask, clientId: e.target.value })}
                    className="flex-1 px-3 py-2 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">Select Client</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewClient(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm font-medium whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      placeholder="Enter new client name"
                      className="flex-1 px-3 py-2 border border-green-300 rounded-lg text-white bg-green-500/10 focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewClient(false)
                        setNewClientName('')
                      }}
                      className="px-3 py-2 text-slate-300 hover:text-white border border-white/20 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-green-400">
                    New client will be created when you add this task
                  </p>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Activity Type *</label>
            <select
              value={newTask.activityType}
              onChange={e => setNewTask({ ...newTask, activityType: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              required
            >
              <option value="">Select Activity</option>
              {activities.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
            <input
              type="text"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="What will you be doing?"
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Planned Start Time</label>
              <input
                type="time"
                value={newTask.plannedStartTime}
                onChange={e => setNewTask({ ...newTask, plannedStartTime: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Hours</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={newTask.plannedHours}
                onChange={e => setNewTask({ ...newTask, plannedHours: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
            <select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            >
              {TASK_PRIORITIES.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={newTask.deadline}
                onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deliverable</label>
              <input
                type="text"
                value={newTask.deliverable}
                onChange={e => setNewTask({ ...newTask, deliverable: e.target.value })}
                placeholder="What will be delivered?"
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
          {/* Assign To (Managers/Admins only) */}
          {isManagerRole && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Assign To</label>
              <select
                value={newTask.assignToId || currentUserId || ''}
                onChange={e => setNewTask({ ...newTask, assignToId: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                disabled={loadingMembers}
              >
                {currentUserId && (
                  <option value={currentUserId}>Self (default)</option>
                )}
                {teamMembers
                  .filter(m => m.id !== currentUserId)
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName || ''}
                    </option>
                  ))}
              </select>
              {loadingMembers && (
                <p className="text-xs text-slate-500 mt-1">Loading team members...</p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              value={newTask.notes}
              onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white h-16"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Remarks</label>
            <input
              type="text"
              value={newTask.remarks}
              onChange={e => setNewTask({ ...newTask, remarks: e.target.value })}
              placeholder="Any remarks about the task..."
              className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={loading || !newTask.activityType || !newTask.description}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
