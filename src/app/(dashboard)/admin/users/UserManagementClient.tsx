'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { QuickAddModal, EMPLOYEE_FIELDS } from '@/client/components/QuickAddModal'
import { formatRoleLabel } from '@/shared/utils/utils'
import { UserAvatar } from '@/client/components/ui/UserAvatar'
import { ConfirmModal } from '@/client/components/ui/Modal'
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
  joiningDate: string | Date
  createdAt: string | Date
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

// Safe Edit User Modal - uses local state to avoid re-render crashes
function EditUserModal({ user, onClose, onSave, saving }: {
  user: User
  onClose: () => void
  onSave: (data: { firstName: string; lastName: string | null; email: string | null; phone: string; role: string; department: string; employeeType: string; status: string }) => void
  saving: boolean
}) {
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName || '')
  const [email, setEmail] = useState(user.email || '')
  const [phone, setPhone] = useState(user.phone)
  const [role, setRole] = useState(user.role)
  const [department, setDepartment] = useState(user.department)
  const [employeeType, setEmployeeType] = useState(user.employeeType)
  const [status, setStatus] = useState(user.status)

  const handleSave = () => {
    onSave({
      firstName,
      lastName: lastName || null,
      email: email || null,
      phone,
      role,
      department,
      employeeType,
      status,
    })
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div 
        style={{ position: 'fixed', inset: 0 }} 
        onClick={onClose} 
      />
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '32rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 51,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>Edit User</h2>
          <button
            onClick={onClose}
            style={{ color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#334155',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#334155',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                {ROLES.map(r => (
                  <option key={r} value={r} style={{ backgroundColor: '#1e293b' }}>{r.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d} style={{ backgroundColor: '#1e293b' }}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Employee Type</label>
              <select
                value={employeeType}
                onChange={(e) => setEmployeeType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                {EMPLOYEE_TYPES.map(t => (
                  <option key={t} value={t} style={{ backgroundColor: '#1e293b' }}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '4px' }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#334155',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s} style={{ backgroundColor: '#1e293b' }}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              color: '#cbd5e1',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              fontSize: '14px',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
              border: 'none'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function UserManagementClient({ users }: UserManagementClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [viewingAs, setViewingAs] = useState<User | null>(null)
  const [removingUser, setRemovingUser] = useState<User | null>(null)
  const [magicLinkUser, setMagicLinkUser] = useState<User | null>(null)
  const [generatingMagicLink, setGeneratingMagicLink] = useState(false)

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

  const handleGenerateMagicLink = async () => {
    if (!magicLinkUser) return
    setGeneratingMagicLink(true)
    try {
      const res = await fetch('/api/admin/generate-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: magicLinkUser.id }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        const magicLink = `${window.location.origin}/auth/magic?token=${data.token}`
        await navigator.clipboard.writeText(magicLink)
        toast.success('Magic link copied! Share it with the user.')
        setMagicLinkUser(null)
      } else {
        toast.error(data.error || 'Failed to generate magic link')
      }
    } catch (error) {
      toast.error('Failed to generate magic link')
    } finally {
      setGeneratingMagicLink(false)
    }
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

  const handleSaveUser = async (formData: { firstName: string; lastName: string | null; email: string | null; phone: string; role: string; department: string; employeeType: string; status: string }) => {
    if (!editingUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const handleRemoveUser = async () => {
    if (!removingUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${removingUser.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setRemovingUser(null)
        toast.success('Employee removed successfully')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to remove employee')
      }
    } catch (error) {
      console.error('Remove user error:', error)
      toast.error('Failed to remove employee')
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
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden" suppressHydrationWarning>
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
          <div className="flex items-center gap-2 text-white mb-2">
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
          className="px-3 py-2 bg-slate-900/40 border border-white/10 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          style={{ colorScheme: 'dark' }}
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
                <td className="px-4 py-3 text-sm text-slate-300">{formatDate(user.joiningDate as Date)}</td>
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
                      onClick={() => setMagicLinkUser(user)}
                      className="text-xs px-2 py-1 bg-amber-500/20 hover:bg-amber-600/30 text-amber-400 rounded border border-amber-500/20"
                      title="Generate magic link for this user"
                    >
                      <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Magic Link
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-600/30 text-blue-400 rounded border border-blue-500/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setRemovingUser(user)}
                      className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-600/30 text-red-400 rounded border border-red-500/20"
                    >
                      Remove
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
        <EditUserModal
          key={editingUser.id}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
          saving={saving}
        />
      )}

      {/* Remove User Confirmation - Custom Modal for guaranteed visibility */}
      {removingUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div 
            style={{ position: 'fixed', inset: 0 }} 
            onClick={() => !saving && setRemovingUser(null)} 
          />
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '28rem',
            position: 'relative',
            zIndex: 10000,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#ef4444'
            }}>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Remove Employee</h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', marginBottom: '32px' }}>
              Are you sure you want to remove <strong>{removingUser.firstName} {removingUser.lastName || ''}</strong>? <br/>
              This will mark them as inactive and remove them from all active lists.
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setRemovingUser(null)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#334155',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUser}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  fontSize: '14px',
                  fontWeight: 700
                }}
              >
                {saving ? 'Removing...' : 'Yes, Remove'}
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

      {/* Magic Link Modal */}
      {magicLinkUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div
            style={{ position: 'fixed', inset: 0 }}
            onClick={() => setMagicLinkUser(null)}
          />
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '28rem',
            position: 'relative',
            zIndex: 51,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>Generate Magic Link</h2>
              <button onClick={() => setMagicLinkUser(null)} style={{ color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                color: '#fbbf24'
              }}>
                <strong>Magic Link for:</strong> {magicLinkUser.firstName} {magicLinkUser.lastName || ''} ({magicLinkUser.empId})<br/>
                <span className="text-slate-400">This link expires in 24 hours and will be copied to your clipboard.</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <button
                onClick={() => setMagicLinkUser(null)}
                style={{
                  padding: '8px 16px',
                  color: '#cbd5e1',
                  fontSize: '14px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateMagicLink}
                disabled={generatingMagicLink}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#d97706',
                  color: 'white',
                  fontSize: '14px',
                  borderRadius: '8px',
                  cursor: generatingMagicLink ? 'not-allowed' : 'pointer',
                  opacity: generatingMagicLink ? 0.5 : 1,
                  border: 'none'
                }}
              >
                {generatingMagicLink ? 'Generating...' : 'Generate & Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

