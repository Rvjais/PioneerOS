'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { getWorkCategoriesForUser } from '@/shared/constants/departmentActivities'

interface ClientScope {
  id: string
  client: string
  scope: string[]
  status: 'ACTIVE' | 'ON_HOLD' | 'CHURNED'
  accountManager: string
  monthlyRetainer: number
}

interface Deliverable {
  id: string
  clientId: string
  category: string
  workItem: string
  description: string | null
  month: string
  proofUrl: string | null
  kpi: string | null
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUIRED'
  submittedBy: { id: string; firstName: string; lastName: string } | null
  reviewedBy: { id: string; firstName: string; lastName: string } | null
  createdBy: { id: string; firstName: string; lastName: string } | null
  clientVisible: boolean
}

interface TacticalTrackerClientProps {
  initialClients: ClientScope[]
  userRole?: string
  userDepartment?: string
}

// All available categories
const ALL_CATEGORIES = [
  { id: 'SOCIAL_VIDEOS', label: 'Social - Videos' },
  { id: 'SOCIAL_POSTS', label: 'Social - Posts' },
  { id: 'SOCIAL_STORIES', label: 'Social - Stories' },
  { id: 'SOCIAL_CAROUSELS', label: 'Social - Carousels' },
  { id: 'YOUTUBE', label: 'YouTube' },
  { id: 'GBP', label: 'GBP' },
  { id: 'GOOGLE_ADS', label: 'Google Ads' },
  { id: 'META_ADS', label: 'Meta Ads' },
  { id: 'LINKEDIN_ADS', label: 'LinkedIn Ads' },
  { id: 'SEO_ONPAGE', label: 'SEO - On-Page' },
  { id: 'SEO_TECHNICAL', label: 'SEO - Technical' },
  { id: 'SEO_BLOG', label: 'SEO - Blog/Content' },
  { id: 'SEO_LINKS', label: 'SEO - Link Building' },
  { id: 'LINKEDIN', label: 'LinkedIn' },
  { id: 'WEB', label: 'Web Development' },
  { id: 'DESIGN', label: 'Design' },
  { id: 'VIDEO_EDITING', label: 'Video Editing' },
  { id: 'MOTION_GRAPHICS', label: 'Motion Graphics' },
  { id: 'OTHER', label: 'Other' },
]

// Get reporting month based on current date
// If it's the 1st-5th of the month, default to previous month (typical reporting period)
// Otherwise default to current month
function getDefaultReportingMonth(): string {
  const now = new Date()
  const dayOfMonth = now.getDate()

  // If early in the month (1st-5th), user is likely reporting on previous month
  if (dayOfMonth <= 5) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
  }

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Format month for display
function formatMonthDisplay(month: string): string {
  const [year, m] = month.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${monthNames[parseInt(m) - 1]} ${year}`
}

// Get month options with labels indicating reporting context
function getMonthOptions(): { value: string; label: string; isReportingPeriod: boolean }[] {
  const months: { value: string; label: string; isReportingPeriod: boolean }[] = []
  const now = new Date()
  const dayOfMonth = now.getDate()

  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const isCurrentMonth = i === 0
    const isPreviousMonth = i === 1

    // Determine if this is the reporting period
    const isReportingPeriod = dayOfMonth <= 5 ? isPreviousMonth : isCurrentMonth

    let label = formatMonthDisplay(value)
    if (isReportingPeriod) {
      label += ' (Reporting Period)'
    } else if (isPreviousMonth && dayOfMonth > 5) {
      label += ' (Last Month)'
    }

    months.push({ value, label, isReportingPeriod })
  }

  return months
}

export function TacticalTrackerClient({ initialClients, userRole, userDepartment }: TacticalTrackerClientProps) {
  const [clients] = useState(initialClients)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [selectedClient, setSelectedClient] = useState<string>(initialClients[0]?.id || '')
  const [selectedMonth, setSelectedMonth] = useState<string>(getDefaultReportingMonth())
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ proofUrl: string; kpi: string }>({ proofUrl: '', kpi: '' })

  // Get role-specific categories
  const userCategories = useMemo(() => {
    const role = userRole || ''
    const dept = userDepartment || ''
    return getWorkCategoriesForUser(role, dept)
  }, [userRole, userDepartment])

  const [newItem, setNewItem] = useState({
    category: '',
    workItem: '',
    description: '',
    proofUrl: '',
    kpi: '',
  })

  const isManager = userRole && ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(userRole)
  const monthOptions = getMonthOptions()

  // Fetch deliverables when client or month changes
  useEffect(() => {
    if (selectedClient) {
      fetchDeliverables()
    }
  }, [selectedClient, selectedMonth])

  const fetchDeliverables = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/client-deliverables?clientId=${selectedClient}&month=${selectedMonth}`)
      if (res.ok) {
        const data = await res.json()
        setDeliverables(data.deliverables || [])
      }
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    const currentClient = clients.find(c => c.id === selectedClient)
    const clientDeliverables = deliverables.filter(d => d.clientId === selectedClient)

    // Create CSV content
    const headers = ['Category', 'Work Item', 'Description', 'Proof URL', 'KPI', 'Status']
    const rows = clientDeliverables.map(item => [
      item.category,
      item.workItem,
      item.description || '',
      item.proofUrl || '',
      item.kpi || '',
      item.status,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentClient?.client || 'client'}-${selectedMonth}-tactical-report.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddWorkItem = async () => {
    if (!newItem.category || !newItem.workItem) return

    setSaving(true)
    try {
      const res = await fetch('/api/client-deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          category: newItem.category,
          workItem: newItem.workItem,
          description: newItem.description,
          month: selectedMonth,
          proofUrl: newItem.proofUrl,
          kpi: newItem.kpi,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setDeliverables(prev => [...prev, data.deliverable])
        setNewItem({ category: '', workItem: '', description: '', proofUrl: '', kpi: '' })
        setShowAddModal(false)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to add item')
      }
    } catch (error) {
      console.error('Failed to add work item:', error)
      toast.error('Failed to add work item')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateDeliverable = async (id: string, updates: { proofUrl?: string; kpi?: string; status?: string }) => {
    try {
      const res = await fetch('/api/client-deliverables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      if (res.ok) {
        const data = await res.json()
        setDeliverables(prev => prev.map(d => d.id === id ? data.deliverable : d))
        setEditingId(null)
      }
    } catch (error) {
      console.error('Failed to update deliverable:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/client-deliverables?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDeliverables(prev => prev.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete deliverable:', error)
    }
  }

  const startEdit = (item: Deliverable) => {
    setEditingId(item.id)
    setEditData({
      proofUrl: item.proofUrl || '',
      kpi: item.kpi || '',
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    await handleUpdateDeliverable(editingId, editData)
  }

  const currentClient = clients.find(c => c.id === selectedClient)
  const clientDeliverables = deliverables.filter(d => d.clientId === selectedClient)

  const getScopeColor = (scope: string) => {
    const colors: Record<string, string> = {
      'SOCIAL': 'bg-pink-500/20 text-pink-400',
      'YOUTUBE': 'bg-red-500/20 text-red-800',
      'GBP': 'bg-green-500/20 text-green-800',
      'SERP_SEO': 'bg-blue-500/20 text-blue-800',
      'SEO': 'bg-blue-500/20 text-blue-800',
      'GOOGLE_ADS': 'bg-amber-500/20 text-amber-800',
      'META_ADS': 'bg-indigo-500/20 text-indigo-400',
      'ADS': 'bg-amber-500/20 text-amber-800',
      'LINKEDIN': 'bg-sky-100 text-sky-800',
      'PRINT': 'bg-slate-800/50 text-white',
      'BOOSTING': 'bg-purple-500/20 text-purple-800',
      'WEB': 'bg-cyan-100 text-cyan-800',
    }
    return colors[scope] || 'bg-slate-800/50 text-white'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-800'
      case 'ON_HOLD': return 'bg-amber-500/20 text-amber-800'
      case 'CHURNED': return 'bg-red-500/20 text-red-800'
      default: return 'bg-slate-800/50 text-white'
    }
  }

  const getDeliverableStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/20 text-green-800'
      case 'SUBMITTED': return 'bg-blue-500/20 text-blue-800'
      case 'REVISION_REQUIRED': return 'bg-red-500/20 text-red-800'
      default: return 'bg-slate-800/50 text-white'
    }
  }

  const getCategoryColor = (category: string) => {
    if (category.includes('SOCIAL')) return 'bg-pink-50 border-pink-200'
    if (category.includes('YOUTUBE')) return 'bg-red-500/10 border-red-200'
    if (category.includes('GBP')) return 'bg-green-500/10 border-green-200'
    if (category.includes('LINKEDIN')) return 'bg-sky-50 border-sky-200'
    if (category.includes('SEO')) return 'bg-blue-500/10 border-blue-200'
    if (category.includes('ADS')) return 'bg-amber-500/10 border-amber-200'
    if (category.includes('VIDEO')) return 'bg-purple-500/10 border-purple-200'
    if (category.includes('DESIGN')) return 'bg-indigo-50 border-indigo-200'
    if (category.includes('WEB')) return 'bg-cyan-50 border-cyan-200'
    return 'bg-slate-900/40 border-white/10'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold">Client Tactical Tracker</h1>
              <p className="text-indigo-200">Monthly work items, proof links & KPIs</p>
            </div>
            <InfoTooltip
              title="How to use this tracker"
              steps={[
                "Select a client from the list below",
                "Choose the month you want to track",
                "Add work items with proof links",
                "Manager will review and approve submitted work",
              ]}
              tips={[
                "Add proof links to get your work approved",
                "Work marked as approved becomes visible to clients",
              ]}
            />
          </div>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 glass-card text-indigo-600 rounded-lg font-medium hover:bg-indigo-50"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Client Selector */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h2 className="font-semibold text-white mb-3">Select Client</h2>
        {clients.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="font-medium">No clients assigned</p>
            <p className="text-sm mt-1">Please contact your manager to get assigned to clients</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedClient === client.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
                }`}
              >
                {client.client}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Client Details */}
      {currentClient && (
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{currentClient.client}</h2>
              <p className="text-slate-300">Account Manager: {currentClient.accountManager}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(currentClient.status)}`}>
                {currentClient.status}
              </span>
              <p className="text-slate-300 mt-1">
                {currentClient.monthlyRetainer > 0
                  ? `Rs.${(currentClient.monthlyRetainer / 1000).toFixed(0)}K/month`
                  : 'Fee not set'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-300 mr-2">Scope:</span>
            {currentClient.scope.length > 0 ? (
              currentClient.scope.map(s => (
                <span key={s} className={`px-2 py-1 text-xs font-medium rounded ${getScopeColor(s)}`}>
                  {s.replace(/_/g, ' ')}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">No services defined</span>
            )}
          </div>
        </div>
      )}

      {/* Month Selector */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Select Reporting Month</h2>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {monthOptions.map(month => (
            <button
              key={month.value}
              onClick={() => setSelectedMonth(month.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                selectedMonth === month.value
                  ? 'bg-indigo-600 text-white'
                  : month.isReportingPeriod
                    ? 'bg-indigo-500/10 text-indigo-400 border-2 border-indigo-300 hover:bg-indigo-500/20'
                    : 'glass-card text-slate-200 border border-white/10 hover:border-indigo-300'
              }`}
            >
              {month.label}
              {month.isReportingPeriod && selectedMonth !== month.value && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Tactical reports are due by the 3rd of each month for the previous month&apos;s data.
        </p>
      </div>

      {/* Work Items Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-semibold text-white">Work Items & KPIs - {formatMonthDisplay(selectedMonth)}</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            + Add Work Item
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-300">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading...
          </div>
        ) : clientDeliverables.length === 0 ? (
          <div className="p-8 text-center text-slate-300">
            <p>No work items yet for this client in {formatMonthDisplay(selectedMonth)}.</p>
            <p className="text-sm mt-1">Click &quot;Add Work Item&quot; to start tracking deliverables.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Work Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">Proof</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">KPI</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-200 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clientDeliverables.map(item => (
                  <tr key={item.id} className={`${getCategoryColor(item.category)} border-l-4`}>
                    <td className="px-4 py-3 text-sm font-medium text-white">{item.category.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-white">{item.workItem}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {editingId === item.id ? (
                        <input
                          type="url"
                          value={editData.proofUrl}
                          onChange={e => setEditData(prev => ({ ...prev, proofUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full px-2 py-1 text-sm border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        />
                      ) : item.proofUrl ? (
                        <a
                          href={item.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View Proof
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">No proof</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editData.kpi}
                          onChange={e => setEditData(prev => ({ ...prev, kpi: e.target.value }))}
                          placeholder="KPI value"
                          className="w-20 px-2 py-1 text-sm border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">{item.kpi || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getDeliverableStatusColor(item.status)}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-slate-900/40 text-white text-xs rounded hover:bg-slate-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(item)}
                              className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                            >
                              Edit
                            </button>
                            {isManager && (
                              <>
                                {item.status === 'SUBMITTED' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateDeliverable(item.id, { status: 'APPROVED' })}
                                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDeliverable(item.id, { status: 'REVISION_REQUIRED' })}
                                      className="px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700"
                                    >
                                      Revise
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Work Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-md shadow-none">
            <h3 className="text-lg font-semibold text-white mb-4">Add Work Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Category *</label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white glass-card"
                >
                  <option value="">Select category...</option>
                  {/* Show role-specific categories for non-managers, all for managers */}
                  {isManager ? (
                    ALL_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))
                  ) : (
                    userCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Work Item Name *</label>
                <input
                  type="text"
                  value={newItem.workItem}
                  onChange={e => setNewItem({ ...newItem, workItem: e.target.value })}
                  placeholder="e.g., Video Post 1, Blog Article 2"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="e.g., Views + Engagement"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Proof URL</label>
                <input
                  type="url"
                  value={newItem.proofUrl}
                  onChange={e => setNewItem({ ...newItem, proofUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">KPI Value</label>
                <input
                  type="text"
                  value={newItem.kpi}
                  onChange={e => setNewItem({ ...newItem, kpi: e.target.value })}
                  placeholder="e.g., 5000 views, 200 clicks"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg font-medium hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWorkItem}
                disabled={saving || !newItem.category || !newItem.workItem}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
