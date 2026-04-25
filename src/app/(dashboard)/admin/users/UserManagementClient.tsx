'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { QuickAddModal, EMPLOYEE_FIELDS } from '@/client/components/QuickAddModal'
import { formatRoleLabel } from '@/shared/utils/utils'
import { UserAvatar } from '@/client/components/ui/UserAvatar'
import Link from 'next/link'

interface User {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string
  role: string
  department: string
  employeeType: string
  status: string
  joiningDate: Date
  createdAt: Date
  profile?: {
    profilePicture: string | null
  } | null
}

interface UserManagementClientProps {
  users: User[]
}

const ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM', 'EMPLOYEE', 'SALES', 'ACCOUNTS', 'HR', 'WEB_MANAGER', 'FREELANCER', 'INTERN']
const DEPARTMENTS = ['OPERATIONS', 'SEO', 'SOCIAL', 'DESIGN', 'ADS', 'WEB', 'SALES', 'ACCOUNTS', 'HR']
const STATUSES = ['ACTIVE', 'PROBATION', 'PIP', 'INACTIVE']
const EMPLOYEE_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCER']

export function UserManagementClient({ users }: UserManagementClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update: updateSession } = useSession()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [impersonating, setImpersonating] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [impersonateTarget, setImpersonateTarget] = useState<User | null>(null)
  const [impersonateReason, setImpersonateReason] = useState('')
  const [viewingAs, setViewingAs] = useState<User | null>(null)

  // Check if we are viewing as another user's dashboard
  const viewingUserId = searchParams.get('viewAs')

  useEffect(() => {
    if (viewingUserId) {
      const user = users.find(u => u.id === viewingUserId)
      if (user) setViewingAs(user)
    } else {
      setViewingAs(null)
    }
  }, [viewingUserId, users])

  const handleViewDashboard = async (user: User) => {
    // Set viewAs cookie then navigate to dashboard
    try {
      const res = await fetch(`/api/admin/view-as?userId=${user.id}&redirectTo=/`, { method: 'POST' })
      if (res.ok) {
        window.location.href = '/'
      } else {
        toast.error('Failed to view dashboard')
      }
    } catch {
      toast.error('Failed to view dashboard')
    }
  }

  const handleExitView = async () => {
    try {
      const res = await fetch(`/api/admin/view-as?redirectTo=/admin/users`, { method: 'DELETE' })
      if (res.ok) {
        setViewingAs(null)
        window.location.href = '/admin/users'
      }
    } catch {
      toast.error('Failed to exit view')
    }
  }

  const handleQuickAddEmployee = async (data: Record<string, string>) => {
    const res = await fetch('/api/admin/quick-add/employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to add employee')
    router.refresh()
  }

  const filteredUsers = users.filter((user) => {
    const matchesRole = filter === 'ALL' || user.role === filter
    const matchesSearch =
      search === '' ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      user.empId.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  const handleStartImpersonate = (user: User) => {
    setImpersonateTarget(user)
    setImpersonateReason('')
  }

  const handleConfirmImpersonate = async () => {
    if (!impersonateTarget || !impersonateReason.trim()) return

    setImpersonating(impersonateTarget.id)
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: impersonateTarget.id, reason: impersonateReason }),
      })

      if (res.ok) {
        const data = await res.json()

        // Update NextAuth session with impersonated user data (session ID stored server-side)
        await updateSession({
          impersonating: true,
          impersonatedUser: data.impersonatedUser,
          impersonationSessionId: data.sessionId,
        })

        setImpersonateTarget(null)
        setImpersonateReason('')

        // Redirect to dashboard to see the impersonated user's view
        window.location.href = '/'
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to start impersonation')
      }
    } catch (error) {
      console.error('Impersonation error:', error)
      toast.error('Failed to start impersonation')
    } finally {
      setImpersonating(null)
    }
  }

  const handleSaveUser = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          department: editingUser.department,
          employeeType: editingUser.employeeType,
          status: editingUser.status,
        }),
      })

      if (res.ok) {
        setEditingUser(null)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Save user error:', error)
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: Date) =>
    formatDateDDMMYYYY(date)

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-500/20 text-purple-400',
    MANAGER: 'bg-blue-500/20 text-blue-400',
    EMPLOYEE: 'bg-green-500/20 text-green-400',
    SALES: 'bg-orange-500/20 text-orange-400',
    ACCOUNTS: 'bg-cyan-100 text-cyan-700',
    FREELANCER: 'bg-pink-500/20 text-pink-400',
    INTERN: 'bg-yellow-500/20 text-yellow-400',
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    PROBATION: 'bg-yellow-500/20 text-yellow-400',
    PIP: 'bg-red-500/20 text-red-400',
    INACTIVE: 'bg-slate-800/50 text-slate-200',
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
      {/* Viewing As Banner */}
      {viewingAs && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm font-medium">
              Viewing as <strong>{viewingAs.firstName} {viewingAs.lastName || ''}</strong>
              <span className="ml-2 text-xs opacity-75">({formatRoleLabel(viewingAs.role)} - {viewingAs.department})</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick nav to key department dashboards */}
            <Link
              href="/accounts"
              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded"
            >
              Finance
            </Link>
            <Link
              href="/sales"
              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded"
            >
              Sales
            </Link>
            <Link
              href="/hr"
              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded"
            >
              HR
            </Link>
            <Link
              href="/seo"
              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded"
            >
              SEO
            </Link>
            <Link
              href="/web"
              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded"
            >
              Web
            </Link>
            <Link
              href="/ads"
              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded"
            >
              Ads
            </Link>
            <Link
              href="/social"
              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded"
            >
              Social
            </Link>
            <button
              onClick={handleExitView}
              className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded font-medium"
            >
              Exit View
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or ID..."
          className="px-3 py-2 border border-white/10 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="EMPLOYEE">Employee</option>
          <option value="SALES">Sales</option>
          <option value="ACCOUNTS">Accounts</option>
          <option value="FREELANCER">Freelancer</option>
          <option value="INTERN">Intern</option>
        </select>
        <span className="text-sm text-slate-400">
          Showing {filteredUsers.length} of {users.length} users
        </span>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Quick Add
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/40">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Department</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="sm" showPreview={false} />
                    <div>
                      <p className="font-medium text-white">
                        {user.firstName} {user.lastName || ''}
                      </p>
                      <p className="text-xs text-slate-400">{user.empId} | {user.email || user.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${roleColors[user.role]}`}>
                    {formatRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">{user.department}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{user.employeeType.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[user.status]}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">{formatDate(user.joiningDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDashboard(user)}
                      className="text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded flex items-center gap-1"
                      title="View this user's dashboard"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleStartImpersonate(user)}
                      disabled={impersonating === user.id || user.role === 'SUPER_ADMIN'}
                      className="text-xs px-2 py-1 bg-slate-800/50 hover:bg-white/10 text-slate-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title={user.role === 'SUPER_ADMIN' ? 'Cannot impersonate admins' : 'Login as this user'}
                    >
                      {impersonating === user.id ? 'Loading...' : 'Impersonate'}
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-200 text-blue-400 rounded"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditingUser(null)} />
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-800 rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 -m-6 mb-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Edit User</h2>
            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">First Name</label>
              <input
                type="text"
                value={editingUser.firstName}
                onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Last Name</label>
              <input
                type="text"
                value={editingUser.lastName || ''}
                onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value || null })}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Email</label>
            <input
              type="email"
              value={editingUser.email || ''}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value || null })}
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Phone</label>
            <input
              type="text"
              value={editingUser.phone}
              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Role</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Department</label>
              <select
                value={editingUser.department}
                onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Employee Type</label>
              <select
                value={editingUser.employeeType}
                onChange={(e) => setEditingUser({ ...editingUser, employeeType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {EMPLOYEE_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Status</label>
              <select
                value={editingUser.status}
                onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={() => setEditingUser(null)}
            className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveUser}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        title="Quick Add Employee"
        fields={EMPLOYEE_FIELDS}
        onSubmit={handleQuickAddEmployee}
        submitLabel="Add Employee"
      />

      {/* Impersonate Modal */}
      {impersonateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setImpersonateTarget(null)} />
          <div className="relative w-full max-w-md bg-slate-800 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Impersonate User</h2>
                <button onClick={() => setImpersonateTarget(null)} className="text-slate-400 hover:text-slate-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-400">
                  <strong>Warning:</strong> You are about to view the app as <strong>{impersonateTarget.firstName} {impersonateTarget.lastName || ''}</strong> ({impersonateTarget.empId}). All actions will be logged for audit.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Reason for impersonation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  placeholder="e.g., Troubleshooting user issue, testing permissions..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setImpersonateTarget(null)}
                className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImpersonate}
                disabled={!impersonateReason.trim() || impersonating === impersonateTarget.id}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {impersonating === impersonateTarget.id ? 'Starting...' : 'Start Impersonation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
