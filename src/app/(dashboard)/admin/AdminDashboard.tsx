'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PageGuide from '@/client/components/ui/PageGuide'

import { AdminStats, User, SystemSettings, Client } from './components/types'
import OverviewTab from './components/OverviewTab'
import UsersTab from './components/UsersTab'
import ClientsTab from './components/ClientsTab'
import RolesTab from './components/RolesTab'
import SecurityTab from './components/SecurityTab'
import SettingsTab from './components/SettingsTab'
import EditUserModal from './components/EditUserModal'
import AddUserModal from './components/AddUserModal'

interface Props {
  stats: AdminStats
  users: User[]
  settings: SystemSettings
  clients: Client[]
}

export default function AdminDashboard({ stats, users, settings, clients }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'clients' | 'roles' | 'security' | 'settings'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    empId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    department: 'SEO',
    employeeType: 'FULL_TIME',
  })
  const [clientSearch, setClientSearch] = useState('')
  const [showOnlyWithPortal, setShowOnlyWithPortal] = useState(false)
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [magicLinkUserId, setMagicLinkUserId] = useState<string | null>(null)
  const [generatingLink, setGeneratingLink] = useState(false)

  // Magic link generation handler
  useEffect(() => {
    const handleMagicLink = async (e: CustomEvent<{ userId: string; email: string }>) => {
      setMagicLinkUserId(e.detail.userId)
      setMagicLinkEmail(e.detail.email)
    }
    window.addEventListener('generate-magic-link', handleMagicLink as EventListener)
    return () => window.removeEventListener('generate-magic-link', handleMagicLink as EventListener)
  }, [])

  const handleGenerateMagicLink = async () => {
    if (!magicLinkUserId) return
    setGeneratingLink(true)
    try {
      const res = await fetch('/api/admin/generate-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: magicLinkUserId }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        const magicLink = `${window.location.origin}/auth/magic?token=${data.token}`
        await navigator.clipboard.writeText(magicLink)
        toast.success('Magic link copied! Share it with the user.')
      } else {
        toast.error(data.error || 'Failed to generate magic link')
      }
    } catch (error) {
      toast.error('Failed to generate magic link')
    } finally {
      setGeneratingLink(false)
      setMagicLinkUserId(null)
      setMagicLinkEmail('')
    }
  }

  const closeMagicLinkModal = () => {
    setMagicLinkUserId(null)
    setMagicLinkEmail('')
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === '' || user.role === roleFilter
    const matchesStatus = statusFilter === '' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = clientSearch === '' ||
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase())
    const matchesPortal = !showOnlyWithPortal || client.clientUsers.length > 0
    return matchesSearch && matchesPortal
  })

  const handleSaveUser = async (data: { firstName: string; lastName: string | null; email: string | null; phone: string; role: string; department: string; employeeType: string; status: string }) => {
    if (!editingUser) return
    console.log('AdminDashboard: handleSaveUser called for user:', editingUser.id)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('User updated successfully')
        setEditingUser(null)
        router.refresh()
      } else {
        const resData = await res.json()
        toast.error(resData.error || 'Failed to save user')
      }
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0 || bulkLoading) return

    if (bulkAction === 'deactivate') {
      if (!confirm(`Are you sure you want to deactivate ${selectedUsers.length} users?`)) return
      setBulkLoading(true)
      try {
        const results = await Promise.allSettled(
          selectedUsers.map(userId =>
            fetch(`/api/admin/users/${userId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'INACTIVE' }),
            })
          )
        )
        const failed = results.filter(r => r.status === 'rejected').length
        if (failed > 0) {
          toast.error(`${failed} of ${selectedUsers.length} users could not be deactivated`)
        } else {
          toast.success(`${selectedUsers.length} user(s) deactivated successfully`)
        }
        setSelectedUsers([])
        router.refresh()
      } finally {
        setBulkLoading(false)
      }
    } else if (bulkAction === 'activate') {
      setBulkLoading(true)
      try {
        const results = await Promise.allSettled(
          selectedUsers.map(userId =>
            fetch(`/api/admin/users/${userId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'ACTIVE' }),
            })
          )
        )
        const failed = results.filter(r => r.status === 'rejected').length
        if (failed > 0) {
          toast.error(`${failed} of ${selectedUsers.length} users could not be activated`)
        } else {
          toast.success(`${selectedUsers.length} user(s) activated successfully`)
        }
        setSelectedUsers([])
        router.refresh()
      } finally {
        setBulkLoading(false)
      }
    }
  }

  const handleAddUser = async () => {
    if (!newUser.empId || !newUser.firstName || !newUser.phone) {
      toast.error('Please fill in Employee ID, First Name, and Phone')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`User ${newUser.firstName} created! Share the magic link with them to set their password.`)
        setShowAddUser(false)
        setNewUser({
          empId: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'EMPLOYEE',
          department: 'SEO',
          employeeType: 'FULL_TIME',
        })
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-8" suppressHydrationWarning>
      <PageGuide
        pageKey="admin"
        title="Admin Panel"
        description="Manage users, roles, audit logs, and system settings."
        steps={[
          { label: 'Manage users', description: 'Create, edit, and deactivate user accounts' },
          { label: 'Configure roles', description: 'Set up roles and permissions for team members' },
          { label: 'View audit logs', description: 'Review login sessions and suspicious activity' },
          { label: 'Manage system settings', description: 'Configure company entities and app-wide settings' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Super Admin</h1>
          <p className="text-sm text-slate-500">Manage users, roles, security, and system settings</p>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
          Full Access
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { id: 'clients', label: 'Clients', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { id: 'roles', label: 'Roles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          { id: 'security', label: 'Security', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
          { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          stats={stats}
          onSetActiveTab={setActiveTab}
          onShowAddUser={() => setShowAddUser(true)}
        />
      )}

      {activeTab === 'users' && (
        <UsersTab
          users={users}
          filteredUsers={filteredUsers}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedUsers={selectedUsers}
          onSelectedUsersChange={setSelectedUsers}
          bulkAction={bulkAction}
          bulkLoading={bulkLoading}
          onBulkActionChange={setBulkAction}
          onBulkAction={handleBulkAction}
          onShowAddUser={() => setShowAddUser(true)}
          onEditUser={setEditingUser}
        />
      )}

      {activeTab === 'clients' && (
        <ClientsTab
          clients={clients}
          filteredClients={filteredClients}
          clientSearch={clientSearch}
          onClientSearchChange={setClientSearch}
          showOnlyWithPortal={showOnlyWithPortal}
          onShowOnlyWithPortalChange={setShowOnlyWithPortal}
        />
      )}

      {activeTab === 'roles' && (
        <RolesTab stats={stats} />
      )}

      {activeTab === 'security' && (
        <SecurityTab stats={stats} />
      )}

      {activeTab === 'settings' && (
        <SettingsTab settings={settings} />
      )}

      {/* Modals */}
      {editingUser && (
        <EditUserModal
          key={editingUser.id}
          editingUser={editingUser}
          onEditingUserChange={(user) => setEditingUser(user)}
          onSave={handleSaveUser}
          saving={saving}
        />
      )}


      {showAddUser && (
        <AddUserModal
          newUser={newUser}
          onNewUserChange={setNewUser}
          onClose={() => setShowAddUser(false)}
          onAdd={handleAddUser}
          saving={saving}
        />
      )}

      {/* Magic Link Modal */}
      {magicLinkUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Generate Magic Link</h3>
              <button onClick={closeMagicLinkModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                This magic link will allow the user to log in without a password. The link expires in 24 hours.
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">Click below to generate and copy the magic link:</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={closeMagicLinkModal} className="px-4 py-2 text-slate-600 hover:text-slate-900">
                Cancel
              </button>
              <button
                onClick={handleGenerateMagicLink}
                disabled={generatingLink}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
              >
                {generatingLink ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate & Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
