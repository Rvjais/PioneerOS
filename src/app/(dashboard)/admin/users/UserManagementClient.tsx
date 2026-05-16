'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY, cn } from '@/shared/utils/cn'
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="fixed inset-0 z-[120] overflow-y-auto" suppressHydrationWarning>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Edit Employee</h3>
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee Type</label>
                <select
                  value={employeeType}
                  onChange={(e) => setEmployeeType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  {EMPLOYEE_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-[#c96442] hover:bg-[#b5563a] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 order-1 sm:order-2"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
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
    <div className="bg-white" suppressHydrationWarning>
      {/* Viewing As Banner */}
      {viewingAs && (
        <div className="bg-gradient-to-r from-[#c96442] to-[#b5563a] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-orange-500/10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold">
              Viewing as <span className="underline decoration-white/40">{viewingAs.firstName} {viewingAs.lastName || ''}</span>
              <span className="ml-2 text-[10px] font-black uppercase bg-white/20 px-1.5 py-0.5 rounded tracking-widest">{formatRoleLabel(viewingAs.role)}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {['HR', 'SALES', 'ACCOUNTS', 'WEB', 'ADS', 'SEO'].map((dept) => (
              <Link
                key={dept}
                href={`/${dept.toLowerCase()}`}
                className="text-[10px] font-black px-2 py-1 bg-white/10 hover:bg-white/30 text-white rounded transition-colors uppercase"
              >
                {dept}
              </Link>
            ))}
            <button
              onClick={handleExitView}
              className="text-[10px] font-black px-3 py-1 bg-white hover:bg-slate-100 text-[#c96442] rounded shadow-sm transition-colors uppercase ml-2"
            >
              Exit View
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center bg-slate-50/30">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none cursor-pointer pr-10"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
          >
            <option value="ALL">All Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{formatRoleLabel(role)}</option>
            ))}
          </select>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#c96442] hover:bg-[#b5563a] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quick Add
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Role</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Department</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar user={user} size="sm" showPreview={false} className="ring-2 ring-white shadow-sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.firstName} {user.lastName || ''}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 truncate">
                        {user.empId} • {user.email || user.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className={cn(
                    "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border",
                    roleColors[user.role] || "bg-slate-100 text-slate-500 border-slate-100"
                  )}>
                    {formatRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {user.department}
                  </span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell text-center">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider",
                    statusColors[user.status] || "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewDashboard(user)}
                      className="p-2 text-slate-400 hover:text-[#c96442] hover:bg-orange-50 rounded-xl transition-all"
                      title="View Dashboard"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Edit Employee"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setMagicLinkUser(user)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Magic Link"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setRemovingUser(user)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500 font-medium">No employees found matching your criteria.</p>
          </div>
        )}
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

      {/* Remove User Confirmation */}
      {removingUser && (
        <div className="fixed inset-0 z-[120] overflow-y-auto" suppressHydrationWarning>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => !saving && setRemovingUser(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Remove Employee</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Are you sure you want to remove <strong>{removingUser.firstName} {removingUser.lastName || ''}</strong>? <br/>
                This will mark them as inactive and remove them from all active lists.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setRemovingUser(null)}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveUser}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 order-1 sm:order-2"
                >
                  {saving ? 'Removing...' : 'Yes, Remove'}
                </button>
              </div>
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
        <div className="fixed inset-0 z-[120] overflow-y-auto" suppressHydrationWarning>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMagicLinkUser(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Magic Link</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Generate a one-time login link for <strong>{magicLinkUser.firstName}</strong>. <br/>
                This link expires in 24 hours and will be copied to your clipboard.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGenerateMagicLink}
                  disabled={generatingMagicLink}
                  className="w-full px-6 py-3 bg-[#c96442] hover:bg-[#b5563a] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  {generatingMagicLink ? 'Generating...' : 'Generate & Copy Link'}
                </button>
                <button
                  onClick={() => setMagicLinkUser(null)}
                  className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

