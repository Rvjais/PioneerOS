'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QuickAddModal, CLIENT_FIELDS } from '@/client/components/QuickAddModal'
import { QuickAllocateModal } from '@/client/components/admin/QuickAllocateModal'
import { formatStatusLabel } from '@/shared/utils/utils'
import { ProfilePicture } from '@/client/components/ui/ProfilePicture'
import { UserAvatarGroup } from '@/client/components/ui/UserAvatar'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'
import DataDiscovery from '@/client/components/ui/DataDiscovery'

interface Client {
  id: string
  name: string
  brandName?: string | null
  logoUrl?: string | null
  industry?: string | null
  tier: string
  status: string
  clientSegment: string
  clientType?: string // ONE_TIME, RECURRING
  isWebTeamClient?: boolean
  healthScore?: number | null
  healthStatus?: string | null
  paymentStatus: string
  teamMembers: Array<{
    id: string
    user: {
      id: string
      firstName: string
      lastName: string | null
      email?: string | null
      department?: string | null
      role?: string
      profile?: { profilePicture: string | null } | null
    }
  }>
  subClients?: Client[]
  _count: { tasks: number; meetings: number }
}

interface Props {
  clients: Client[]
  stats: {
    total: number
    active: number
    healthy: number
    atRisk: number
  }
}

const healthColors: Record<string, string> = {
  HEALTHY: 'bg-green-500/20 text-green-400',
  WARNING: 'bg-yellow-500/20 text-yellow-400',
  AT_RISK: 'bg-red-500/20 text-red-400',
}

const tierColors: Record<string, string> = {
  ENTERPRISE: 'bg-purple-500/20 text-purple-400',
  PREMIUM: 'bg-blue-500/20 text-blue-400',
  STANDARD: 'bg-slate-800/50 text-slate-200',
}

export function ClientsClient({ clients: initialClients, stats }: Props) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showQuickAllocate, setShowQuickAllocate] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RECURRING' | 'ONE_TIME'>('ALL')

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'ALL' ||
      c.clientType === typeFilter ||
      (typeFilter === 'RECURRING' && !c.clientType) // Default to RECURRING if not set
    return matchesSearch && matchesType
  })

  const handleQuickAddClient = async (data: Record<string, string>) => {
    const res = await fetch('/api/admin/quick-add/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to add client')
    router.refresh()
  }

  const handleLogoUpdate = async (clientId: string, newUrl: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/logo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: newUrl }),
      })
      if (res.ok) {
        setClients(prev => prev.map(c => {
          if (c.id === clientId) {
            return { ...c, logoUrl: newUrl || null }
          }
          // Also check subClients
          if (c.subClients) {
            return {
              ...c,
              subClients: c.subClients.map(sub =>
                sub.id === clientId ? { ...sub, logoUrl: newUrl || null } : sub
              )
            }
          }
          return c
        }))
      }
    } catch (error) {
      console.error('Failed to update logo:', error)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="clients"
        title="Clients"
        description="Manage all client accounts, health scores, and team assignments."
        steps={[
          { label: 'Search and filter', description: 'Find clients by name, industry, or type' },
          { label: 'Monitor health scores', description: 'Keep track of at-risk clients' },
          { label: 'Manage team allocation', description: 'Assign team members to client accounts' },
        ]}
      />

      <DataDiscovery dataType="clients" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-slate-400 mt-1">Manage your client portfolio</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowQuickAllocate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Allocate
          </button>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quick Add
          </button>
          <Link
            href="/accounts/onboarding/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Full Onboarding
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Total Clients</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">{stats.active}</p>
          <p className="text-sm text-slate-400">Active</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">{stats.healthy}</p>
          <p className="text-sm text-slate-400">Healthy</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-red-400">{stats.atRisk}</p>
          <p className="text-sm text-slate-400">At Risk</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4 space-y-4">
        {/* Type Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              typeFilter === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Clients
          </button>
          <button
            onClick={() => setTypeFilter('RECURRING')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              typeFilter === 'RECURRING'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            Recurring
          </button>
          <button
            onClick={() => setTypeFilter('ONE_TIME')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              typeFilter === 'ONE_TIME'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
            }`}
          >
            One-Time
          </button>
          <Link
            href="/web/clients"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Web Team
          </Link>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name or industry..."
            aria-label="Search clients"
            className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <InfoTip text="Filter clients by name, email, or company" type="action" />
        </div>
      </div>

      {/* Client List */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Logo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Tier</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Health</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Team</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Tasks</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Payment</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    No clients found. Add your first client to get started.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <Fragment key={client.id}>
                    <tr className={`hover:bg-slate-900/40 transition-colors ${
                      client.isWebTeamClient ? 'bg-teal-500/5' : ''
                    }`}>
                      <td className="px-5 py-4">
                        <ProfilePicture
                          src={client.logoUrl}
                          name={client.name}
                          size="md"
                          type="client"
                          editable
                          onEdit={(url) => handleLogoUpdate(client.id, url)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/clients/${client.id}`} className="block">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white hover:text-blue-400">{client.name}</p>
                            {client.subClients && client.subClients.length > 0 && (
                              <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
                                +{client.subClients.length} sub
                              </span>
                            )}
                            {/* Client Type Badge */}
                            {client.clientType === 'ONE_TIME' && (
                              <span className="px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded">
                                One-Time
                              </span>
                            )}
                            {client.isWebTeamClient && (
                              <span className="px-1.5 py-0.5 text-xs bg-teal-500/20 text-teal-400 rounded flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                Web
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{client.industry || 'N/A'} • {client.clientSegment}</p>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${tierColors[client.tier]}`}>
                          {client.tier}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {client.healthScore != null ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${healthColors[client.healthStatus || 'WARNING']}`}>
                            {client.healthScore}/100
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {client.teamMembers.length > 0 ? (
                          <UserAvatarGroup
                            users={client.teamMembers.map(m => m.user)}
                            max={3}
                            size="sm"
                            showPreview={true}
                          />
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{client._count.tasks}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          client.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' :
                          client.paymentStatus === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {formatStatusLabel(client.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link
                          href={`/clients/${client.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                    {/* Sub-clients */}
                    {client.subClients?.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-900/40 transition-colors bg-slate-900/40">
                        <td className="px-5 py-3 pl-8">
                          <ProfilePicture
                            src={sub.logoUrl}
                            name={sub.brandName || sub.name}
                            size="sm"
                            type="client"
                            editable
                            onEdit={(url) => handleLogoUpdate(sub.id, url)}
                          />
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/clients/${sub.id}`} className="block pl-6">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">└</span>
                              <p className="font-medium text-slate-200 hover:text-blue-400">{sub.brandName || sub.name}</p>
                            </div>
                            <p className="text-xs text-slate-400 pl-5">{sub.industry || 'N/A'} • {sub.tier}</p>
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${tierColors[sub.tier] || 'bg-slate-800/50 text-slate-300'}`}>
                            {sub.tier}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {sub.healthScore != null ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${healthColors[sub.healthStatus || 'WARNING']}`}>
                              {sub.healthScore}/100
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {sub.teamMembers && sub.teamMembers.length > 0 ? (
                            <UserAvatarGroup
                              users={sub.teamMembers.map(m => m.user)}
                              max={3}
                              size="xs"
                              showPreview={true}
                            />
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-400">{sub._count?.tasks || 0}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            sub.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' :
                            sub.paymentStatus === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {formatStatusLabel(sub.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Link
                            href={`/clients/${sub.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        title="Quick Add Client"
        fields={CLIENT_FIELDS}
        onSubmit={handleQuickAddClient}
        submitLabel="Add Client"
      />

      {/* Quick Allocate Modal */}
      <QuickAllocateModal
        isOpen={showQuickAllocate}
        onClose={() => setShowQuickAllocate(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
