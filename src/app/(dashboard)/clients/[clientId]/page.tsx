'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ErrorState } from '@/client/components/ErrorBoundary'
import { Skeleton, SkeletonAvatar, SkeletonText, SkeletonTable } from '@/client/components/ui/Skeleton'
import { ConfirmModal } from '@/client/components/ui/Modal'
import { CredentialForm } from '@/client/components/clients/CredentialForm'
import { PortalUserForm } from '@/client/components/clients/PortalUserForm'
import { ProfilePicture } from '@/client/components/ui/ProfilePicture'
import { UserAvatar, UserAvatarGroup } from '@/client/components/ui/UserAvatar'
import { ClientAvatar } from '@/client/components/ui/ClientAvatar'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'

interface TeamMember {
  id: string
  role: string
  isPrimary: boolean
  user: {
    id: string
    firstName: string
    lastName: string | null
    email?: string | null
    department: string | null
    employeeId: string
    role?: string
    profile?: { profilePicture: string | null } | null
  }
}

interface SubClient {
  id: string
  name: string
  brandName: string | null
  status: string
  healthScore: number | null
  teamMembers: TeamMember[]
}

interface TacticalData {
  id: string
  date: string
  userId: string
  userName: string
  department: string
  activityType: string
  description: string
  status: string
  hours: number
}

interface Credential {
  id: string
  platform: string
  category: string
  username: string | null
  password: string | null
  email: string | null
  url: string | null
  apiKey: string | null
  notes: string | null
  isActive: boolean
  lastUpdated: string
  createdAt: string
}

interface PortalUser {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'PRIMARY' | 'SECONDARY' | 'VIEWER'
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

interface Client {
  id: string
  name: string
  brandName: string | null
  logoUrl: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  whatsapp: string | null
  websiteUrl: string | null
  industry: string | null
  tier: string
  clientSegment: string
  status: string
  healthScore: number | null
  healthStatus: string | null
  monthlyFee: number | null
  paymentStatus: string
  startDate: string | null
  parentClientId: string | null
  parentClient: { id: string; name: string } | null
  subClients: SubClient[]
  teamMembers: TeamMember[]
  _count: {
    tasks: number
    meetings: number
    dailyTasks: number
  }
  _canSeeFinancials?: boolean
}

const CLIENT_ROLES = [
  { value: 'ACCOUNT_MANAGER', label: 'Account Manager' },
  { value: 'SEO_SPECIALIST', label: 'SEO Specialist' },
  { value: 'ADS_SPECIALIST', label: 'Ads Specialist' },
  { value: 'SOCIAL_MANAGER', label: 'Social Media Manager' },
  { value: 'CONTENT_WRITER', label: 'Content Writer' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'WEB_DEVELOPER', label: 'Web Developer' },
  { value: 'AUTOMATION_ENGINEER', label: 'Automation Engineer' },
]

const healthColors: Record<string, string> = {
  HEALTHY: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  WARNING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  AT_RISK: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const tierColors: Record<string, string> = {
  ENTERPRISE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PREMIUM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  STANDARD: 'bg-slate-900/20 text-slate-400 border-slate-500/30',
}

const EDIT_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role || ''
  const canEdit = EDIT_ROLES.includes(userRole)
  const clientId = params.clientId as string

  const [client, setClient] = useState<Client | null>(null)
  const [tacticalData, setTacticalData] = useState<TacticalData[]>([])
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName?: string; empId?: string; department?: string; role?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tacticalLoading, setTacticalLoading] = useState(true)
  const [tacticalError, setTacticalError] = useState<Error | null>(null)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showAddSubClient, setShowAddSubClient] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedRole, setSelectedRole] = useState('ACCOUNT_MANAGER')
  const [subClientName, setSubClientName] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'subclients' | 'tactical' | 'integrations' | 'credentials'>('overview')

  // Credentials & Portal Users state
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([])
  const [credentialsLoading, setCredentialsLoading] = useState(false)
  const [portalUsersLoading, setPortalUsersLoading] = useState(false)
  const [showCredentialForm, setShowCredentialForm] = useState(false)
  const [showPortalUserForm, setShowPortalUserForm] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
  const [editingPortalUser, setEditingPortalUser] = useState<PortalUser | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'credential' | 'portalUser', id: string, name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})

  const fetchClient = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients/${clientId}`)
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Client not found' : `Failed to load client (${res.status})`)
      }
      const data = await res.json()
      setClient(data)
    } catch (err) {
      console.error('Error fetching client:', err)
      setError(err instanceof Error ? err : new Error('Failed to load client'))
    } finally {
      setLoading(false)
    }
  }, [clientId])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users?role=EMPLOYEE')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.users || data || [])
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }, [])

  const fetchTacticalData = useCallback(async () => {
    setTacticalLoading(true)
    setTacticalError(null)
    try {
      const res = await fetch(`/api/clients/${clientId}/tactical-data`)
      if (!res.ok) {
        throw new Error(`Failed to load tactical data (${res.status})`)
      }
      const data = await res.json()
      setTacticalData(data)
    } catch (err) {
      console.error('Error fetching tactical data:', err)
      setTacticalError(err instanceof Error ? err : new Error('Failed to load tactical data'))
    } finally {
      setTacticalLoading(false)
    }
  }, [clientId])

  const fetchCredentials = useCallback(async () => {
    setCredentialsLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/credentials`)
      if (res.ok) {
        const data = await res.json()
        setCredentials(data.credentials || [])
      }
    } catch (err) {
      console.error('Error fetching credentials:', err)
    } finally {
      setCredentialsLoading(false)
    }
  }, [clientId])

  const fetchPortalUsers = useCallback(async () => {
    setPortalUsersLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/portal-users`)
      if (res.ok) {
        const data = await res.json()
        setPortalUsers(data.portalUsers || [])
      }
    } catch (err) {
      console.error('Error fetching portal users:', err)
    } finally {
      setPortalUsersLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchClient()
    fetchEmployees()
    fetchTacticalData()
  }, [fetchClient, fetchEmployees, fetchTacticalData])

  // Fetch credentials and portal users when tab is active
  useEffect(() => {
    if (activeTab === 'credentials') {
      fetchCredentials()
      fetchPortalUsers()
    }
  }, [activeTab, fetchCredentials, fetchPortalUsers])

  // Credential handlers
  async function handleSaveCredential(credential: Partial<Credential>) {
    const isEdit = !!editingCredential
    const url = `/api/clients/${clientId}/credentials`
    const method = isEdit ? 'PUT' : 'POST'
    const body = isEdit ? { id: editingCredential.id, ...credential } : credential

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to save credential')
    }

    fetchCredentials()
    setEditingCredential(null)
  }

  async function handleDeleteCredential(id: string) {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/credentials?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCredentials()
      }
    } catch (error) {
      console.error('Error deleting credential:', error)
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(null)
    }
  }

  // Portal user handlers
  async function handleSavePortalUser(user: { email: string; name: string; phone?: string | null; role: 'PRIMARY' | 'SECONDARY' | 'VIEWER'; isActive?: boolean }) {
    const isEdit = !!editingPortalUser
    const url = `/api/clients/${clientId}/portal-users`
    const method = isEdit ? 'PUT' : 'POST'
    const body = isEdit ? { id: editingPortalUser.id, ...user } : user

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to save user')
    }

    fetchPortalUsers()
    setEditingPortalUser(null)
  }

  async function handleDeactivatePortalUser(id: string) {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/portal-users?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchPortalUsers()
      }
    } catch (error) {
      console.error('Error deactivating portal user:', error)
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(null)
    }
  }

  function togglePasswordVisibility(credentialId: string) {
    setShowPassword(prev => ({ ...prev, [credentialId]: !prev[credentialId] }))
  }

  async function handleAddTeamMember() {
    if (!selectedEmployee || !selectedRole) return

    try {
      const res = await fetch(`/api/clients/${clientId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedEmployee, role: selectedRole }),
      })

      if (res.ok) {
        fetchClient()
        setShowAddTeam(false)
        setSelectedEmployee('')
        setSelectedRole('ACCOUNT_MANAGER')
      }
    } catch (error) {
      console.error('Error adding team member:', error)
    }
  }

  async function handleRemoveTeamMember(memberId: string) {
    if (!confirm('Remove this team member?')) return

    try {
      const res = await fetch(`/api/clients/${clientId}/team?memberId=${memberId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchClient()
      }
    } catch (error) {
      console.error('Error removing team member:', error)
    }
  }

  async function handleAddSubClient() {
    if (!subClientName.trim()) return

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subClientName,
          parentClientId: clientId,
          status: 'ACTIVE',
        }),
      })

      if (res.ok) {
        fetchClient()
        setShowAddSubClient(false)
        setSubClientName('')
      }
    } catch (error) {
      console.error('Error adding sub-client:', error)
    }
  }

  if (loading) {
    return <ClientDetailSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <Link href="/clients" className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white">Client Details</h1>
        </div>
        <ErrorState
          title="Failed to load client"
          message={error.message}
          onRetry={fetchClient}
          variant="full"
        />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <Link href="/clients" className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white">Client Details</h1>
        </div>
        <ErrorState
          title="Client not found"
          message="The client you're looking for doesn't exist or has been removed."
          variant="full"
        />
      </div>
    )
  }

  const handleLogoUpdate = async (newUrl: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/logo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: newUrl }),
      })
      if (res.ok) {
        setClient(prev => prev ? { ...prev, logoUrl: newUrl || null } : null)
      }
    } catch (error) {
      console.error('Failed to update logo:', error)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Clients', href: '/clients' },
        { label: client.brandName || client.name },
      ]} />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Client Logo */}
          <ProfilePicture
            src={client.logoUrl}
            name={client.name}
            size="xl"
            editable
            onEdit={handleLogoUpdate}
            type="client"
            className="border-2 border-white/20"
          />
          <div>
            <div className="flex items-center gap-3">
              <Link href="/clients" className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              {client.parentClient && (
                <span className="text-sm text-slate-400">
                  (under <Link href={`/clients/${client.parentClient.id}`} className="text-blue-400 hover:text-blue-300">{client.parentClient.name}</Link>)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${tierColors[client.tier]}`}>
                {client.tier}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${healthColors[client.healthStatus || 'WARNING']}`}>
                {client.healthScore ? `${client.healthScore}/100` : 'No Score'}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${client.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                  client.status === 'ON_HOLD' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                }`}>
                {client.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">

          {canEdit && (
            <button
              onClick={() => setShowAddSubClient(true)}
              className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-medium hover:bg-purple-500/30 transition-colors"
            >
              + Sub-Client
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 backdrop-blur-sm p-1 rounded-xl w-fit flex-wrap">
        {(['overview', 'team', 'subclients', 'tactical', 'credentials', 'integrations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'team' && `Team (${client.teamMembers.length})`}
            {tab === 'subclients' && `Sub-Clients (${client.subClients.length})`}
            {tab === 'tactical' && 'Tactical Data'}
            {tab === 'credentials' && 'Credentials & Access'}
            {tab === 'integrations' && 'Integrations'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase">Contact Name</p>
                <p className="text-white">{client.contactName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Email</p>
                <p className="text-white">{client.contactEmail || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Phone</p>
                <p className="text-white">{client.contactPhone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">WhatsApp</p>
                <p className="text-white">{client.whatsapp || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Website</p>
                {client.websiteUrl ? (
                  <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                    {client.websiteUrl}
                  </a>
                ) : (
                  <p className="text-slate-400">-</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Business Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase">Industry</p>
                <p className="text-white">{client.industry || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Segment</p>
                <p className="text-white">{client.clientSegment}</p>
              </div>
              {/* Financial data - only visible to ACCOUNTS, MANAGER, SUPER_ADMIN */}
              {client._canSeeFinancials && (
                <>
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Monthly Fee</p>
                    <p className="text-emerald-400 font-semibold">
                      {client.monthlyFee ? `₹${client.monthlyFee.toLocaleString()}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Payment Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${client.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                        client.paymentStatus === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                      }`}>
                      {client.paymentStatus}
                    </span>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-slate-400 uppercase">Start Date</p>
                <p className="text-white">
                  {client.startDate ? format(new Date(client.startDate), 'MMM d, yyyy') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{client._count.tasks}</p>
                <p className="text-xs text-slate-400">Tasks</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{client._count.meetings}</p>
                <p className="text-xs text-slate-400">Meetings</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{client._count.dailyTasks}</p>
                <p className="text-xs text-slate-400">Daily Tasks</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{client.subClients.length}</p>
                <p className="text-xs text-slate-400">Sub-Clients</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Team Members</h3>
            {canEdit && (
              <button
                onClick={() => setShowAddTeam(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                + Add Member
              </button>
            )}
          </div>

          {canEdit && showAddTeam && (
            <div className="p-5 bg-blue-500/10 border-b border-white/10">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.department || emp.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white"
                  >
                    {CLIENT_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddTeamMember}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddTeam(false)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-white/5">
            {client.teamMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No team members assigned yet
              </div>
            ) : (
              client.teamMembers.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={{
                        id: member.user.id,
                        firstName: member.user.firstName,
                        lastName: member.user.lastName,
                        email: member.user.email,
                        department: member.user.department || undefined,
                        role: member.user.role,
                        empId: member.user.employeeId,
                        profile: member.user.profile
                      }}
                      size="md"
                      showPreview={true}
                    />
                    <div>
                      <p className="text-white font-medium">
                        {member.user.firstName} {member.user.lastName}
                        {member.isPrimary && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">Primary</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-400">{member.user.employeeId} &bull; {member.user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-slate-300">
                      {CLIENT_ROLES.find(r => r.value === member.role)?.label || member.role}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => handleRemoveTeamMember(member.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sub-Clients Tab */}
      {activeTab === 'subclients' && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Sub-Clients / Brands</h3>
            {canEdit && (
              <button
                onClick={() => setShowAddSubClient(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                + Add Sub-Client
              </button>
            )}
          </div>

          {canEdit && showAddSubClient && (
            <div className="p-5 bg-purple-500/10 border-b border-white/10">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Sub-Client / Brand Name</label>
                  <input
                    type="text"
                    value={subClientName}
                    onChange={(e) => setSubClientName(e.target.value)}
                    placeholder="e.g., KarmaTMS, Dr. Ritesh"
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
                <button
                  onClick={handleAddSubClient}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddSubClient(false)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-white/5">
            {client.subClients.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No sub-clients yet</p>
                <p className="text-sm mt-1">Add sub-brands like KarmaTMS, Karma Docs under Karma</p>
              </div>
            ) : (
              client.subClients.map((subClient) => (
                <Link
                  key={subClient.id}
                  href={`/clients/${subClient.id}`}
                  className="p-4 flex items-center justify-between hover:bg-white/5 block"
                >
                  <div className="flex items-center gap-3">
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      <ClientAvatar
                        client={{
                          id: subClient.id,
                          name: subClient.name,
                          brandName: subClient.brandName,
                          status: subClient.status
                        }}
                        size="md"
                        square={true}
                        showPreview={true}
                      />
                    </div>
                    <div>
                      <p className="text-white font-medium">{subClient.name}</p>
                      {subClient.brandName && (
                        <p className="text-sm text-slate-400">{subClient.brandName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${subClient.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900/20 text-slate-400'
                      }`}>
                      {subClient.status}
                    </span>
                    {subClient.teamMembers.length > 0 && (
                      <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <UserAvatarGroup
                          users={subClient.teamMembers.map(m => ({
                            id: m.user.id,
                            firstName: m.user.firstName,
                            lastName: m.user.lastName,
                            department: m.user.department || undefined,
                            empId: m.user.employeeId,
                            profile: m.user.profile
                          }))}
                          max={3}
                          size="xs"
                          showPreview={true}
                        />
                      </div>
                    )}
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tactical Data Tab */}
      {activeTab === 'tactical' && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Tactical Data & Progress</h3>
              <p className="text-sm text-slate-400 mt-1">Daily tasks and activities logged by team members for this client</p>
            </div>
            {tacticalError && (
              <button
                onClick={fetchTacticalData}
                className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Retry
              </button>
            )}
          </div>

          {tacticalLoading ? (
            <div className="p-5">
              <SkeletonTable rows={5} columns={7} />
            </div>
          ) : tacticalError ? (
            <div className="p-5">
              <ErrorState
                title="Failed to load tactical data"
                message={tacticalError.message}
                onRetry={fetchTacticalData}
                variant="inline"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 backdrop-blur-sm">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Team Member</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Department</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Activity</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Hours</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tacticalData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        No tactical data logged yet. Team members&apos; daily tasks for this client will appear here.
                      </td>
                    </tr>
                  ) : (
                    tacticalData.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/5">
                        <td className="px-5 py-4 text-sm text-white">
                          {format(new Date(entry.date), 'MMM d')}
                        </td>
                        <td className="px-5 py-4 text-sm text-white">{entry.userName}</td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-white/10 backdrop-blur-sm text-slate-300">
                            {entry.department}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">{entry.activityType}</td>
                        <td className="px-5 py-4 text-sm text-slate-400 max-w-xs truncate">{entry.description}</td>
                        <td className="px-5 py-4 text-sm text-white">{entry.hours}h</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${entry.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                              entry.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-900/20 text-slate-400'
                            }`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Credentials & Access Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          {/* Client Credentials Section */}
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Client Credentials</h3>
                <p className="text-sm text-slate-400 mt-1">Platform access credentials stored for this client</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => { setEditingCredential(null); setShowCredentialForm(true) }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Credential
                </button>
              )}
            </div>

            {credentialsLoading ? (
              <div className="p-8 flex justify-center">
                <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : credentials.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <p>No credentials stored yet</p>
                <p className="text-sm mt-1">Add platform credentials for easy team access</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {credentials.map((cred) => (
                  <div key={cred.id} className={`p-4 hover:bg-white/5 transition-colors ${!cred.isActive ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{cred.platform}</p>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 backdrop-blur-sm text-slate-400">{cred.category}</span>
                            {!cred.isActive && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">Inactive</span>
                            )}
                          </div>
                          {cred.url && (
                            <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
                              {cred.url}
                            </a>
                          )}
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingCredential(cred); setShowCredentialForm(true) }}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm({ type: 'credential', id: cred.id, name: cred.platform })}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {cred.username && (
                        <div>
                          <p className="text-xs text-slate-400 uppercase">Username</p>
                          <p className="text-white">{cred.username}</p>
                        </div>
                      )}
                      {cred.email && (
                        <div>
                          <p className="text-xs text-slate-400 uppercase">Email</p>
                          <p className="text-white">{cred.email}</p>
                        </div>
                      )}
                      {cred.password && (
                        <div>
                          <p className="text-xs text-slate-400 uppercase">Password</p>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-mono">
                              {showPassword[cred.id] ? cred.password : '********'}
                            </p>
                            <button
                              onClick={() => togglePasswordVisibility(cred.id)}
                              className="text-slate-400 hover:text-white"
                            >
                              {showPassword[cred.id] ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {cred.notes && (
                        <div className="col-span-2">
                          <p className="text-xs text-slate-400 uppercase">Notes</p>
                          <p className="text-slate-400">{cred.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portal Users Section */}
          <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Portal Users</h3>
                <p className="text-sm text-slate-400 mt-1">Users who can access the client portal</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => { setEditingPortalUser(null); setShowPortalUserForm(true) }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add User
                </button>
              )}
            </div>

            {portalUsersLoading ? (
              <div className="p-8 flex justify-center">
                <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : portalUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No portal users yet</p>
                <p className="text-sm mt-1">Add users to grant them access to the client portal</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {portalUsers.map((user) => (
                  <div key={user.id} className={`p-4 hover:bg-white/5 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={{ id: user.id, firstName: user.name }} size="md" showPreview={false} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{user.name}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'PRIMARY' ? 'bg-purple-500/20 text-purple-400' :
                                user.role === 'SECONDARY' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-slate-900/20 text-slate-400'
                              }`}>
                              {user.role}
                            </span>
                            {!user.isActive && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">Inactive</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          {user.phone && <p className="text-slate-400">{user.phone}</p>}
                          {user.lastLoginAt && (
                            <p className="text-xs text-slate-400">
                              Last login: {format(new Date(user.lastLoginAt), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingPortalUser(user); setShowPortalUserForm(true) }}
                              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {user.isActive && (
                              <button
                                onClick={() => setShowDeleteConfirm({ type: 'portalUser', id: user.id, name: user.name })}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Deactivate"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credential Form Modal */}
          <CredentialForm
            isOpen={showCredentialForm}
            onClose={() => { setShowCredentialForm(false); setEditingCredential(null) }}
            onSave={handleSaveCredential}
            credential={editingCredential}
            mode={editingCredential ? 'edit' : 'create'}
          />

          {/* Portal User Form Modal */}
          <PortalUserForm
            isOpen={showPortalUserForm}
            onClose={() => { setShowPortalUserForm(false); setEditingPortalUser(null) }}
            onSave={handleSavePortalUser}
            user={editingPortalUser}
            mode={editingPortalUser ? 'edit' : 'create'}
          />

          {/* Delete/Deactivate Confirmation */}
          <ConfirmModal
            isOpen={!!showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(null)}
            onConfirm={() => {
              if (showDeleteConfirm?.type === 'credential') {
                handleDeleteCredential(showDeleteConfirm.id)
              } else if (showDeleteConfirm?.type === 'portalUser') {
                handleDeactivatePortalUser(showDeleteConfirm.id)
              }
            }}
            title={showDeleteConfirm?.type === 'credential' ? 'Delete Credential' : 'Deactivate User'}
            message={showDeleteConfirm?.type === 'credential'
              ? `Are you sure you want to delete the credential for "${showDeleteConfirm?.name}"? This action cannot be undone.`
              : `Are you sure you want to deactivate "${showDeleteConfirm?.name}"? They will no longer be able to log in to the client portal.`
            }
            confirmLabel={showDeleteConfirm?.type === 'credential' ? 'Delete' : 'Deactivate'}
            variant="danger"
            loading={deleteLoading}
          />
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Platform Integrations</h3>
              <p className="text-sm text-slate-400 mt-1">Connect analytics and social media accounts for automated reporting</p>
            </div>
            <Link
              href={`/clients/${clientId}/integrations`}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Integrations
            </Link>
          </div>

          <div className="p-5">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Google Platform Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-white">Google</h4>
                    <p className="text-xs text-slate-400">Analytics, Search Console, Ads</p>
                  </div>
                </div>
                <Link
                  href={`/clients/${clientId}/integrations`}
                  className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm text-center rounded-lg transition-colors"
                >
                  Connect
                </Link>
              </div>

              {/* Meta Platform Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-white">Meta</h4>
                    <p className="text-xs text-slate-400">Facebook, Instagram, Ads</p>
                  </div>
                </div>
                <Link
                  href={`/clients/${clientId}/integrations`}
                  className="block w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm text-center rounded-lg transition-colors"
                >
                  Connect
                </Link>
              </div>

              {/* LinkedIn Platform Card */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-white">LinkedIn</h4>
                    <p className="text-xs text-slate-400">Company Pages, Ads</p>
                  </div>
                </div>
                <Link
                  href={`/clients/${clientId}/integrations`}
                  className="block w-full px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm text-center rounded-lg transition-colors"
                >
                  Connect
                </Link>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <p className="text-slate-400 text-sm">
                <strong className="text-slate-300">How it works:</strong> Connect your analytics and social platforms to automatically sync metrics daily. Reports will populate with real data - no manual entry needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Skeleton loader for client detail page
 */
function ClientDetailSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-12 w-96 rounded-xl" />

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={`skeleton-${i}`} className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
