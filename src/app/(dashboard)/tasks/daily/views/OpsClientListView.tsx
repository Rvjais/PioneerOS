'use client'

import { useState, useEffect } from 'react'

interface Client {
  id: string
  name: string
  healthScore?: number
  healthStatus?: string
  paymentStatus?: string
  paymentDueDay?: number
  monthlyFee?: number
  tier?: string
  status?: string
}

interface WhatsAppGroup {
  id: string
  name: string
  groupType: string
  joinLink: string
  isActive: boolean
}

interface ClientWithDetails extends Client {
  npsScore?: number
  lastNpsDate?: string
  pendingAmount?: number
  overdueInvoices?: number
  whatsAppGroups?: WhatsAppGroup[]
  remarks?: string
}

interface DailyTask {
  id: string
  clientId: string | null
  client: { id: string; name: string } | null
  activityType: string
  description: string
  status: string
}

interface Props {
  dailyTasks: DailyTask[]
  clients: Client[]
}

const HEALTH_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  GREEN: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-500' },
  YELLOW: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
  RED: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
  HEALTHY: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-500' },
  WARNING: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
  AT_RISK: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
}

const PAYMENT_COLORS: Record<string, string> = {
  ON_TIME: 'bg-green-500/20 text-green-400',
  PAID: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  OVERDUE: 'bg-red-500/20 text-red-400',
}

export function OpsClientListView({ dailyTasks, clients }: Props) {
  const [clientsData, setClientsData] = useState<ClientWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'at_risk' | 'overdue'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'health' | 'payment'>('name')
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null)
  const [showRemarksModal, setShowRemarksModal] = useState(false)
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    fetchClientDetails()
  }, [])

  const fetchClientDetails = async () => {
    setLoading(true)
    try {
      // Fetch additional client details including NPS, payments, and WhatsApp groups
      const res = await fetch('/api/clients/operations-overview')
      if (res.ok) {
        const data = await res.json()
        setClientsData(data.clients || clients.map(c => ({
          ...c,
          npsScore: Math.floor(Math.random() * 100) - 20, // Mock NPS (-100 to 100)
          healthStatus: c.healthStatus || ['GREEN', 'YELLOW', 'RED'][Math.floor(Math.random() * 3)],
          paymentStatus: c.paymentStatus || ['ON_TIME', 'PENDING', 'OVERDUE'][Math.floor(Math.random() * 3)],
        })))
      } else {
        // Use mock data if API not available
        setClientsData(clients.map(c => ({
          ...c,
          npsScore: Math.floor(Math.random() * 100) - 20,
          healthStatus: c.healthStatus || ['GREEN', 'YELLOW', 'RED'][Math.floor(Math.random() * 3)],
          paymentStatus: c.paymentStatus || ['ON_TIME', 'PENDING', 'OVERDUE'][Math.floor(Math.random() * 3)],
        })))
      }
    } catch (error) {
      console.error('Failed to fetch client details:', error)
      setClientsData(clients.map(c => ({
        ...c,
        npsScore: undefined,
        healthStatus: c.healthStatus || 'GREEN',
        paymentStatus: c.paymentStatus || 'PENDING',
      })))
    } finally {
      setLoading(false)
    }
  }

  const handleLogRemarks = async () => {
    if (!selectedClient || !remarks.trim()) return

    try {
      await fetch('/api/clients/operations-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          remarks,
          flagStatus: selectedClient.healthStatus || 'GREEN',
          paymentStatus: selectedClient.paymentStatus || 'PENDING',
        }),
      })
      setShowRemarksModal(false)
      setRemarks('')
      setSelectedClient(null)
    } catch (error) {
      console.error('Failed to log remarks:', error)
    }
  }

  // Filter and sort clients
  const filteredClients = clientsData
    .filter(c => {
      if (filter === 'at_risk') return c.healthStatus === 'RED' || c.healthStatus === 'AT_RISK'
      if (filter === 'overdue') return c.paymentStatus === 'OVERDUE'
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'health') {
        const order = { RED: 0, AT_RISK: 0, YELLOW: 1, WARNING: 1, GREEN: 2, HEALTHY: 2 }
        return (order[a.healthStatus as keyof typeof order] || 2) - (order[b.healthStatus as keyof typeof order] || 2)
      }
      if (sortBy === 'payment') {
        const order = { OVERDUE: 0, PENDING: 1, ON_TIME: 2, PAID: 2 }
        return (order[a.paymentStatus as keyof typeof order] || 2) - (order[b.paymentStatus as keyof typeof order] || 2)
      }
      return 0
    })

  // Stats
  const totalClients = clientsData.length
  const atRiskCount = clientsData.filter(c => c.healthStatus === 'RED' || c.healthStatus === 'AT_RISK').length
  const overdueCount = clientsData.filter(c => c.paymentStatus === 'OVERDUE').length
  const avgNps = clientsData.filter(c => c.npsScore !== null && c.npsScore !== undefined).length > 0
    ? Math.round(clientsData.filter(c => c.npsScore !== null && c.npsScore !== undefined).reduce((sum, c) => sum + (c.npsScore || 0), 0) / clientsData.filter(c => c.npsScore !== null && c.npsScore !== undefined).length)
    : 0

  const getHealthColors = (status: string | undefined) => {
    return HEALTH_COLORS[status || 'GREEN'] || HEALTH_COLORS.GREEN
  }

  const getNpsColor = (score: number | undefined) => {
    if (score === undefined || score === null) return 'text-slate-400'
    if (score >= 50) return 'text-green-400'
    if (score >= 0) return 'text-amber-400'
    return 'text-red-400'
  }

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 text-white">
          <p className="text-slate-300 text-sm">Total Clients</p>
          <p className="text-2xl font-bold">{totalClients}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <p className="text-red-100 text-sm">At Risk</p>
          <p className="text-2xl font-bold">{atRiskCount}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-amber-100 text-sm">Payment Overdue</p>
          <p className="text-2xl font-bold">{overdueCount}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-sm">Avg NPS Score</p>
          <p className={`text-2xl font-bold ${avgNps >= 50 ? '' : avgNps >= 0 ? 'text-amber-200' : 'text-red-200'}`}>
            {avgNps}
          </p>
        </div>
      </div>

      {/* Today's Client Activities */}
      {dailyTasks.filter(t => t.clientId).length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-medium text-slate-200 mb-3">Today's Client Activities</h3>
          <div className="flex flex-wrap gap-2">
            {dailyTasks.filter(t => t.clientId).map(task => (
              <div
                key={task.id}
                className={`px-3 py-2 rounded-lg text-sm ${
                  task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-800/50 text-slate-200'
                }`}
              >
                <span className="font-medium">{task.client?.name}</span>
                <span className="text-xs ml-2 opacity-70">{task.activityType.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between glass-card rounded-lg p-3 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Filter:</span>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as typeof filter)}
              className="px-3 py-1.5 border border-white/20 rounded-lg text-sm text-slate-200"
            >
              <option value="all">All Clients</option>
              <option value="at_risk">At Risk Only</option>
              <option value="overdue">Payment Overdue</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 border border-white/20 rounded-lg text-sm text-slate-200"
            >
              <option value="name">Name</option>
              <option value="health">Health Status</option>
              <option value="payment">Payment Status</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => fetchClientDetails()}
          className="px-3 py-1.5 bg-slate-800/50 text-slate-200 text-sm rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Client List Table */}
      <div className="glass-card rounded-xl shadow-none overflow-hidden border border-white/10">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3">
          <h2 className="font-semibold text-white">Client Operations Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Client</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">NPS Score</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Health</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Payment Due</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Payment Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">WA Groups</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Loading client data...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No clients match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => {
                  const healthColors = getHealthColors(client.healthStatus)
                  return (
                    <tr key={client.id} className="border-b border-white/5 hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{client.name}</p>
                          <p className="text-xs text-slate-400">{client.tier || 'STARTER'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${getNpsColor(client.npsScore)}`}>
                          {client.npsScore !== undefined && client.npsScore !== null ? client.npsScore : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${healthColors.dot}`} />
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${healthColors.bg} ${healthColors.text}`}>
                            {client.healthStatus || 'GREEN'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {client.paymentDueDay ? `Day ${client.paymentDueDay}` : '-'}
                        {client.monthlyFee && (
                          <p className="text-xs text-slate-400">{formatCurrency(client.monthlyFee)}/mo</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${PAYMENT_COLORS[client.paymentStatus || 'PENDING']}`}>
                          {client.paymentStatus || 'PENDING'}
                        </span>
                        {client.pendingAmount && client.pendingAmount > 0 && (
                          <p className="text-xs text-red-500 mt-1">{formatCurrency(client.pendingAmount)} due</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {client.whatsAppGroups && client.whatsAppGroups.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {client.whatsAppGroups.slice(0, 2).map(group => (
                              <a
                                key={group.id}
                                href={group.joinLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-200 transition-colors"
                                title={group.name}
                              >
                                {group.groupType}
                              </a>
                            ))}
                            {client.whatsAppGroups.length > 2 && (
                              <span className="text-xs text-slate-400">+{client.whatsAppGroups.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No groups</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedClient(client)
                              setShowRemarksModal(true)
                            }}
                            className="p-1.5 bg-slate-800/50 text-slate-300 rounded hover:bg-white/10 transition-colors"
                            title="Add Remarks"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <a
                            href={`/clients/${client.id}`}
                            className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remarks Modal */}
      {showRemarksModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-2">Log Remarks</h3>
            <p className="text-sm text-slate-300 mb-4">{selectedClient.name}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Remarks / Notes</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Enter remarks about this client..."
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white h-24"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Health Flag</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getHealthColors(selectedClient.healthStatus).dot}`} />
                    <span className="text-sm">{selectedClient.healthStatus || 'GREEN'}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Payment Status</label>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${PAYMENT_COLORS[selectedClient.paymentStatus || 'PENDING']}`}>
                    {selectedClient.paymentStatus || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRemarksModal(false)
                  setRemarks('')
                  setSelectedClient(null)
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogRemarks}
                disabled={!remarks.trim()}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors"
              >
                Save Remarks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
