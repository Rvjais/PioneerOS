'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  whatsapp?: string
  onboardingStatus: string
  lifecycleStage: string
  tier?: string
  monthlyFee?: number
  services?: string
  createdAt: string
  portal?: {
    logoUrl?: string
  }
  teamMembers?: Array<{
    role: string
    user: {
      id: string
      firstName: string
      lastName?: string
      profile?: {
        profilePicture?: string
      }
    }
  }>
}

interface ChecklistItem {
  key: string
  label: string
  completed: boolean
}

const checklistCategories = [
  {
    name: 'Pre-Kickoff',
    items: [
      { key: 'contractSigned', label: 'Contract Signed' },
      { key: 'invoicePaid', label: 'First PI Paid' },
      { key: 'ndaSigned', label: 'NDA Signed' },
    ]
  },
  {
    name: 'Discovery & Access',
    items: [
      { key: 'kickoffMeetingDone', label: 'Kickoff Meeting Done' },
      { key: 'brandGuidelinesReceived', label: 'Brand Guidelines Received' },
      { key: 'websiteAccessGranted', label: 'Website Access Granted' },
      { key: 'analyticsAccessGranted', label: 'Analytics Access Granted' },
      { key: 'socialMediaAccess', label: 'Social Media Access' },
      { key: 'adsAccountAccess', label: 'Ads Account Access' },
    ]
  },
  {
    name: 'Technical Setup',
    items: [
      { key: 'trackingSetup', label: 'Tracking Setup' },
      { key: 'pixelsInstalled', label: 'Pixels Installed' },
      { key: 'crmIntegrated', label: 'CRM Integrated' },
      { key: 'reportingDashboardReady', label: 'Reporting Dashboard Ready' },
    ]
  },
  {
    name: 'Team & Communication',
    items: [
      { key: 'accountManagerAssigned', label: 'Account Manager Assigned' },
      { key: 'teamIntroductionDone', label: 'Team Introduction Done' },
      { key: 'communicationChannelSetup', label: 'Communication Channel Setup' },
      { key: 'firstStrategyCallDone', label: 'First Strategy Call Done' },
    ]
  },
  {
    name: 'Deliverables Setup',
    items: [
      { key: 'contentCalendarShared', label: 'Content Calendar Shared' },
      { key: 'firstDeliverablesApproved', label: 'First Deliverables Approved' },
      { key: 'monthlyReportingSchedule', label: 'Monthly Reporting Schedule Set' },
    ]
  }
]

const ONBOARDING_EDIT_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']

export default function ClientOnboardingPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role || ''
  const canEdit = ONBOARDING_EDIT_ROLES.includes(userRole)

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?onboarding=true')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChecklist = async (clientId: string) => {
    try {
      const res = await fetch(`/api/accounts/client-onboarding/${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setChecklist(data.items || {})
        setNotes(data.managerNotes || '')
      } else {
        setChecklist({})
        setNotes('')
      }
    } catch (error) {
      console.error('Failed to fetch checklist:', error)
      setChecklist({})
    }
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId)
    fetchChecklist(clientId)
  }

  const handleChecklistToggle = async (key: string) => {
    const newValue = !checklist[key]
    setChecklist(prev => ({ ...prev, [key]: newValue }))

    if (selectedClient) {
      setSaving(true)
      try {
        await fetch(`/api/accounts/client-onboarding/${selectedClient}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: newValue })
        })
      } catch (error) {
        console.error('Failed to update checklist:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleNotesUpdate = async () => {
    if (!selectedClient) return

    setSaving(true)
    try {
      await fetch(`/api/accounts/client-onboarding/${selectedClient}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerNotes: notes })
      })
    } catch (error) {
      console.error('Failed to update notes:', error)
    } finally {
      setSaving(false)
    }
  }

  const calculateProgress = () => {
    const totalItems = checklistCategories.reduce((sum, cat) => sum + cat.items.length, 0)
    const completedItems = Object.values(checklist).filter(Boolean).length
    return Math.round((completedItems / totalItems) * 100)
  }

  const getSelectedClient = () => clients.find(c => c.id === selectedClient)

  const getClientProgress = (clientId: string) => {
    // This would need to be fetched from the API in a real implementation
    return 0
  }

  const filteredClients = clients.filter(client => {
    if (filter === 'all') return true
    if (filter === 'pending') return client.onboardingStatus === 'PENDING'
    if (filter === 'in_progress') return client.onboardingStatus === 'IN_PROGRESS'
    if (filter === 'completed') return client.onboardingStatus === 'COMPLETED'
    return true
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-slate-800/50 text-slate-200',
      'IN_PROGRESS': 'bg-blue-500/20 text-blue-400',
      'AWAITING_SLA': 'bg-amber-500/20 text-amber-400',
      'AWAITING_PAYMENT': 'bg-purple-500/20 text-purple-400',
      'COMPLETED': 'bg-green-500/20 text-green-400',
    }
    return colors[status] || 'bg-slate-800/50 text-slate-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/accounts" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
          &larr; Back to Accounts
        </Link>
        <h1 className="text-2xl font-bold text-white">Client Onboarding Checklist</h1>
        <p className="text-slate-400">Track and manage client onboarding progress</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Clients' },
          { key: 'pending', label: 'Pending' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Clients</h2>
            <p className="text-sm text-slate-400">{filteredClients.length} clients</p>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => handleClientSelect(client.id)}
                className={`w-full p-4 text-left hover:bg-slate-900/40 transition-colors ${
                  selectedClient === client.id ? 'bg-blue-500/10 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Client Avatar */}
                  {client.portal?.logoUrl ? (
                    <img
                      src={client.portal.logoUrl}
                      alt={client.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {client.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{client.name}</p>
                    {client.contactName && (
                      <p className="text-sm text-slate-400 truncate">{client.contactName}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(client.onboardingStatus || 'PENDING')}`}>
                        {(client.onboardingStatus || 'PENDING').replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(client.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {filteredClients.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No clients found
              </div>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="glass-card rounded-xl border border-white/10">
              {/* Client Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Client Logo/Avatar */}
                    {getSelectedClient()?.portal?.logoUrl ? (
                      <img
                        src={getSelectedClient()?.portal?.logoUrl}
                        alt={getSelectedClient()?.name}
                        className="w-14 h-14 rounded-xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {getSelectedClient()?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="font-semibold text-white text-lg">{getSelectedClient()?.name}</h2>
                      <p className="text-sm text-slate-400">{getSelectedClient()?.contactName}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        {getSelectedClient()?.contactEmail && (
                          <span>{getSelectedClient()?.contactEmail}</span>
                        )}
                        {getSelectedClient()?.contactPhone && (
                          <span>{getSelectedClient()?.contactPhone}</span>
                        )}
                      </div>
                      {getSelectedClient()?.services && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(JSON.parse(getSelectedClient()?.services || '[]') as string[]).map((service: string) => (
                            <span key={service} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                              {service}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{calculateProgress()}%</div>
                    <p className="text-xs text-slate-400">Complete</p>
                    {getSelectedClient()?.monthlyFee && (
                      <p className="text-sm text-slate-300 mt-1">
                        ₹{(getSelectedClient()?.monthlyFee || 0).toLocaleString()}/mo
                      </p>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                {getSelectedClient()?.teamMembers && getSelectedClient()!.teamMembers!.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Team:</span>
                    <div className="flex -space-x-2">
                      {getSelectedClient()!.teamMembers!.slice(0, 5).map((tm, idx) => (
                        <div key={tm.user.firstName || `tm-${idx}`} className="relative group">
                          {tm.user.profile?.profilePicture ? (
                            <img
                              src={tm.user.profile.profilePicture}
                              alt={tm.user.firstName}
                              className="w-7 h-7 rounded-full border-2 border-white object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-xs font-medium text-slate-300">
                              {tm.user.firstName.charAt(0)}
                            </div>
                          )}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                            {tm.user.firstName} - {tm.role}
                          </div>
                        </div>
                      ))}
                    </div>
                    {getSelectedClient()!.teamMembers!.length > 5 && (
                      <span className="text-xs text-slate-400">
                        +{getSelectedClient()!.teamMembers!.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                {saving && (
                  <p className="text-xs text-blue-400 mt-2">Saving...</p>
                )}
              </div>

              {/* Checklist Items */}
              <div className="p-4 space-y-6">
                {checklistCategories.map(category => (
                  <div key={category.name}>
                    <h3 className="font-medium text-slate-200 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-800/50 rounded flex items-center justify-center text-xs">
                        {category.items.filter(item => checklist[item.key]).length}/{category.items.length}
                      </span>
                      {category.name}
                    </h3>
                    <div className="space-y-2">
                      {category.items.map(item => (
                        <div key={item.key} className="space-y-1">
                          <div
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                              checklist[item.key]
                                ? 'bg-green-500/10 border-green-200'
                                : 'glass-card border-white/10 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checklist[item.key] || false}
                              onChange={() => handleChecklistToggle(item.key)}
                              disabled={!canEdit}
                              className={`w-5 h-5 rounded border-white/20 text-green-400 focus:ring-green-500 ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                            />
                            <span className={`flex-1 ${checklist[item.key] ? 'text-green-400' : 'text-slate-200'}`}>
                              {item.label}
                            </span>
                            {itemNotes[item.key] && (
                              <span className="text-xs text-slate-400 max-w-[150px] truncate">
                                {itemNotes[item.key]}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (canEdit) setEditingItem(editingItem === item.key ? null : item.key)
                              }}
                              disabled={!canEdit}
                              className={`p-1 hover:bg-slate-800/50 rounded transition-colors ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                              title="Add details"
                            >
                              <svg className="w-4 h-4 text-slate-400 hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {checklist[item.key] && (
                              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {editingItem === item.key && (
                            <div className="ml-8 p-3 bg-slate-900/40 rounded-lg border border-white/10">
                              <label className="block text-xs font-medium text-slate-300 mb-1">
                                Notes for {item.label}
                              </label>
                              <input
                                type="text"
                                value={itemNotes[item.key] || ''}
                                onChange={(e) => setItemNotes(prev => ({ ...prev, [item.key]: e.target.value }))}
                                placeholder="Add details, links, dates..."
                                className="w-full px-3 py-1.5 text-sm border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="px-3 py-1 text-xs text-slate-300 hover:bg-white/10 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Manager Notes */}
                <div className="pt-4 border-t border-white/10">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Manager Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesUpdate}
                    disabled={!canEdit}
                    rows={3}
                    placeholder="Add any notes about this client's onboarding..."
                    className={`w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                  />
                </div>

                {/* Share with Client */}
                <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Client View</h4>
                  <p className="text-sm text-blue-400 mb-3">
                    Clients can view their onboarding progress in the client portal.
                  </p>
                  <Link
                    href={`/clients/${selectedClient}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-400"
                  >
                    View Client Details
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-medium text-white mb-1">Select a Client</h3>
              <p className="text-sm text-slate-400">
                Choose a client from the list to view and update their onboarding checklist.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
