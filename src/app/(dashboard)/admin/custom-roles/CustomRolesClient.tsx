'use client'

import { useState } from 'react'

interface User {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  department: string
  role: string
}

interface UserAssignment {
  id: string
  userId: string
  user: {
    id: string
    empId: string
    firstName: string
    lastName: string | null
    department: string
  }
  assignedAt: string
}

interface CustomRole {
  id: string
  name: string
  displayName: string
  baseRoles: string[]
  departments: string[]
  permissions: Record<string, boolean> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  userAssignments: UserAssignment[]
}

interface Props {
  initialRoles: CustomRole[]
  users: User[]
}

const AVAILABLE_ROLES = ['MANAGER', 'EMPLOYEE', 'SALES', 'ACCOUNTS', 'FREELANCER', 'INTERN']
const AVAILABLE_DEPARTMENTS = ['WEB', 'SEO', 'ADS', 'SOCIAL', 'HR', 'ACCOUNTS', 'SALES', 'OPERATIONS']

const PREDEFINED_ROLES = [
  { name: 'OM_HR_SOCIAL', displayName: 'Operations Manager (HR + Social)', baseRoles: ['MANAGER'], departments: ['HR', 'SOCIAL', 'OPERATIONS'] },
  { name: 'BD_ACCOUNTS', displayName: 'BD & Accounts', baseRoles: ['SALES', 'ACCOUNTS'], departments: ['SALES', 'ACCOUNTS'] },
  { name: 'SENIOR_DESIGNER', displayName: 'Senior Designer', baseRoles: ['EMPLOYEE'], departments: ['DESIGN', 'WEB'] },
]

export function CustomRolesClient({ initialRoles, users }: Props) {
  const [roles, setRoles] = useState(initialRoles)
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    baseRoles: [] as string[],
    departments: [] as string[],
  })

  const [selectedUserId, setSelectedUserId] = useState('')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const resetForm = () => {
    setFormData({ name: '', displayName: '', baseRoles: [], departments: [] })
    setShowCreateModal(false)
  }

  const handleCreateRole = async () => {
    if (!formData.displayName || formData.baseRoles.length === 0 || formData.departments.length === 0) {
      showToast('Please fill all required fields', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/custom-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || formData.displayName.toUpperCase().replace(/\s+/g, '_'),
          displayName: formData.displayName,
          baseRoles: formData.baseRoles,
          departments: formData.departments,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setRoles(prev => [...prev, { ...data.role, userAssignments: [] }])
        showToast('Custom role created successfully', 'success')
        resetForm()
      } else {
        const error = await res.json()
        showToast(error.error || 'Failed to create role', 'error')
      }
    } catch (error) {
      console.error('Failed to create role:', error)
      showToast('Failed to create role', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (role: CustomRole) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/custom-roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: role.id,
          isActive: !role.isActive,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setRoles(prev => prev.map(r => r.id === role.id ? { ...data.role, userAssignments: r.userAssignments } : r))
        showToast(`Role ${role.isActive ? 'deactivated' : 'activated'}`, 'success')
      } else {
        showToast('Failed to update role', 'error')
      }
    } catch (error) {
      console.error('Failed to toggle role:', error)
      showToast('Failed to update role', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (role: CustomRole) => {
    if (!confirm(`Are you sure you want to delete "${role.displayName}"? This will remove all user assignments.`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/custom-roles?roleId=${role.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setRoles(prev => prev.filter(r => r.id !== role.id))
        showToast('Role deleted successfully', 'success')
      } else {
        showToast('Failed to delete role', 'error')
      }
    } catch (error) {
      console.error('Failed to delete role:', error)
      showToast('Failed to delete role', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignUser = async () => {
    if (!selectedRole || !selectedUserId) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/custom-roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          customRoleId: selectedRole.id,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setRoles(prev => prev.map(r => {
          if (r.id === selectedRole.id) {
            return {
              ...r,
              userAssignments: [...r.userAssignments, data.assignment],
            }
          }
          return r
        }))
        showToast('User assigned successfully', 'success')
        setShowAssignModal(false)
        setSelectedUserId('')
      } else {
        const error = await res.json()
        showToast(error.error || 'Failed to assign user', 'error')
      }
    } catch (error) {
      console.error('Failed to assign user:', error)
      showToast('Failed to assign user', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAssignment = async (role: CustomRole, assignment: UserAssignment) => {
    if (!confirm(`Remove ${assignment.user.firstName} from ${role.displayName}?`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/custom-roles/assign?userId=${assignment.userId}&customRoleId=${role.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setRoles(prev => prev.map(r => {
          if (r.id === role.id) {
            return {
              ...r,
              userAssignments: r.userAssignments.filter(a => a.id !== assignment.id),
            }
          }
          return r
        }))
        showToast('Assignment removed', 'success')
      } else {
        showToast('Failed to remove assignment', 'error')
      }
    } catch (error) {
      console.error('Failed to remove assignment:', error)
      showToast('Failed to remove assignment', 'error')
    } finally {
      setLoading(false)
    }
  }

  const applyPredefinedRole = (preset: typeof PREDEFINED_ROLES[0]) => {
    setFormData({
      name: preset.name,
      displayName: preset.displayName,
      baseRoles: preset.baseRoles,
      departments: preset.departments,
    })
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    }
    return [...array, item]
  }

  // Get users not already assigned to selected role
  const availableUsers = selectedRole
    ? users.filter(u => !selectedRole.userAssignments.some(a => a.userId === u.id))
    : users

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-none ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-in slide-in-from-right`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Roles</h1>
          <p className="text-slate-400 mt-1">Create and manage blended roles with multiple department access</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.length === 0 ? (
          <div className="col-span-full bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Custom Roles</h3>
            <p className="text-slate-400 mb-4">Create your first custom role to enable blended department access.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Create First Role
            </button>
          </div>
        ) : (
          roles.map(role => (
            <div
              key={role.id}
              className={`glass-card rounded-xl shadow-none overflow-hidden ${
                !role.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{role.displayName}</h3>
                  <p className="text-purple-100 text-xs font-mono">{role.name}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${role.isActive ? 'bg-green-400' : 'bg-slate-400'}`} />
              </div>
              <div className="p-4">
                {/* Base Roles */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Base Roles</p>
                  <div className="flex flex-wrap gap-1">
                    {role.baseRoles.map(r => (
                      <span key={r} className="px-2 py-0.5 bg-blue-100 text-blue-700 font-medium text-xs rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Departments */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Departments</p>
                  <div className="flex flex-wrap gap-1">
                    {role.departments.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-purple-100 text-purple-700 font-medium text-xs rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assigned Users */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-600">Assigned Users ({role.userAssignments.length})</p>
                    <button
                      onClick={() => {
                        setSelectedRole(role)
                        setShowAssignModal(true)
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      + Add User
                    </button>
                  </div>
                  {role.userAssignments.length === 0 ? (
                    <p className="text-xs text-slate-500">No users assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {role.userAssignments.map(a => (
                        <span
                          key={a.id}
                          className="px-2 py-1 bg-slate-100 text-slate-700 font-medium text-xs rounded flex items-center gap-1 group border border-slate-200"
                        >
                          {a.user.firstName} {a.user.lastName}
                          <button
                            onClick={() => handleRemoveAssignment(role, a)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => handleToggleActive(role)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      role.isActive
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800'
                    }`}
                  >
                    {role.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 font-medium text-xs rounded-lg hover:bg-red-200 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Create Custom Role</h3>

            {/* Predefined Templates */}
            <div className="mb-4">
              <p className="text-sm text-slate-300 mb-2">Quick Templates:</p>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_ROLES.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyPredefinedRole(preset)}
                    className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    {preset.displayName}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Display Name *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Operations Manager (HR + Social)"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role ID (auto-generated)</label>
                <input
                  type="text"
                  value={formData.name || formData.displayName.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}
                  onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
                  placeholder="AUTO_GENERATED"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Base Roles *</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => setFormData({
                        ...formData,
                        baseRoles: toggleArrayItem(formData.baseRoles, role),
                      })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.baseRoles.includes(role)
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Departments *</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_DEPARTMENTS.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setFormData({
                        ...formData,
                        departments: toggleArrayItem(formData.departments, dept),
                      })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.departments.includes(dept)
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={loading || !formData.displayName || formData.baseRoles.length === 0 || formData.departments.length === 0}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-2">Assign User</h3>
            <p className="text-sm text-slate-300 mb-4">
              Add a user to <span className="font-medium">{selectedRole.displayName}</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Select User</label>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
              >
                <option value="">Select a user...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.empId}) - {user.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedUserId('')
                  setSelectedRole(null)
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignUser}
                disabled={loading || !selectedUserId}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Assigning...' : 'Assign User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
