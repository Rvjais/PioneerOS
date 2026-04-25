'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
  contactName: string | null
  contactPhone: string | null
  services: string | null
  serviceSegment: string
  billingType: string
  billingAmount: number | null
  monthlyFee: number | null
  currentPaymentStatus: string | null
  pendingAmount: number | null
  status: string
  isLost: boolean
  stoppedServices: boolean
  concernedPerson: string | null
  concernedPersonPhone: string | null
  upsellPotential: string | null
  linkedClientId: string | null
  notes: string | null
  invoiceDayOfMonth: number | null
}

const PAYMENT_STATUS_OPTIONS = [
  { value: 'DONE', label: 'Done', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-500/20 text-amber-800' },
  { value: 'PARTIAL', label: 'Partial', color: 'bg-blue-500/20 text-blue-800' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-500/20 text-red-800' },
  { value: 'WIP', label: 'WIP', color: 'bg-purple-500/20 text-purple-800' },
  { value: 'HOLD', label: 'Hold', color: 'bg-slate-800/50 text-white' },
]

const CLIENT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-500/20 text-green-800' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-500/20 text-amber-800' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-500/20 text-red-800' },
  { value: 'ONBOARDING', label: 'Onboarding', color: 'bg-blue-500/20 text-blue-800' },
]

const BILLING_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'ONE_TIME', label: 'One-time' },
]

const SEGMENT_OPTIONS = [
  { value: 'MARKETING', label: 'Marketing Retainer' },
  { value: 'WEBSITE', label: 'Website Project' },
  { value: 'AI_TOOLS', label: 'AI Tools' },
  { value: 'AMC', label: 'AMC' },
]

export default function AccountsManagePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'marketing' | 'website' | 'lost' | 'all'>('marketing')
  const [updating, setUpdating] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setError(null)
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : data.clients || [])
      } else {
        setError('Failed to load clients. Please try again.')
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err)
      setError('Failed to load clients. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateClient = async (clientId: string, field: string, value: string | number | boolean | null) => {
    setUpdating(clientId)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (res.ok) {
        setClients(prev => prev.map(c =>
          c.id === clientId ? { ...c, [field]: value } : c
        ))
      }
    } catch (error) {
      console.error('Failed to update:', error)
      toast.error('Failed to save changes')
    } finally {
      setUpdating(null)
      setEditingCell(null)
    }
  }

  const parseServices = (services: string | null): string[] => {
    if (!services) return []
    try {
      return JSON.parse(services)
    } catch {
      return []
    }
  }

  const getStatusColor = (status: string | null) => {
    return PAYMENT_STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-slate-800/50 text-slate-300'
  }

  const filteredClients = clients.filter(client => {
    // Search filter
    if (searchQuery && !client.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Tab filter
    switch (activeTab) {
      case 'marketing':
        return client.serviceSegment === 'MARKETING' && !client.isLost
      case 'website':
        return ['WEBSITE', 'AI_TOOLS', 'AMC'].includes(client.serviceSegment) && !client.isLost
      case 'lost':
        return client.isLost || client.stoppedServices
      case 'all':
        return true
    }
    return true
  })

  // Calculate totals
  const marketingClients = clients.filter(c => c.serviceSegment === 'MARKETING' && !c.isLost)
  const websiteClients = clients.filter(c => ['WEBSITE', 'AI_TOOLS', 'AMC'].includes(c.serviceSegment) && !c.isLost)
  const lostClients = clients.filter(c => c.isLost || c.stoppedServices)

  const marketingRevenue = marketingClients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0)
  const marketingPending = marketingClients.filter(c => c.currentPaymentStatus === 'PENDING').length
  const websitePending = websiteClients.filter(c => c.currentPaymentStatus === 'PENDING' || c.currentPaymentStatus === 'PARTIAL').reduce((sum, c) => sum + (c.pendingAmount || c.monthlyFee || 0), 0)
  const lostDues = lostClients.reduce((sum, c) => sum + (c.pendingAmount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); fetchClients() }} className="text-red-400 hover:text-red-300 text-sm font-medium underline">
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts Management</h1>
          <p className="text-slate-400 text-sm mt-1">Quick inline editing for all client accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-white/10 rounded-lg text-sm w-64"
          />
          <Link
            href="/accounts/payment-tracker"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
          >
            Daily Tracker
          </Link>
          <Link
            href="/accounts"
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Marketing Retainers</p>
          <p className="text-2xl font-bold text-blue-800">{marketingClients.length}</p>
          <p className="text-xs text-blue-500 mt-1">
            MRR: ₹{(marketingRevenue / 1000).toFixed(0)}K | {marketingPending} pending
          </p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">Website/AI/AMC</p>
          <p className="text-2xl font-bold text-purple-800">{websiteClients.length}</p>
          <p className="text-xs text-purple-500 mt-1">
            Pending: ₹{(websitePending / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Lost/Stopped</p>
          <p className="text-2xl font-bold text-red-800">{lostClients.length}</p>
          <p className="text-xs text-red-500 mt-1">
            Dues: ₹{(lostDues / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <p className="text-sm text-emerald-600">Total Clients</p>
          <p className="text-2xl font-bold text-emerald-800">{clients.length}</p>
          <p className="text-xs text-emerald-500 mt-1">
            Active: {clients.filter(c => c.status === 'ACTIVE').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[
          { key: 'marketing', label: 'Marketing Retainers', count: marketingClients.length },
          { key: 'website', label: 'Website / AI / AMC', count: websiteClients.length },
          { key: 'lost', label: 'Lost / Stopped', count: lostClients.length },
          { key: 'all', label: 'All Clients', count: clients.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'marketing' | 'website' | 'lost' | 'all')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? tab.key === 'lost'
                  ? 'bg-red-500/20 text-red-800 border-b-2 border-red-500'
                  : 'bg-blue-500/20 text-blue-800 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-900/40 z-10 w-48">
                  Client
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-24">
                  Services
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-24">
                  Segment
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-24">
                  Billing
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-20">
                  Fee
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-24">
                  Payment
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-24">
                  Status
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                  Concerned
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-48">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredClients.map((client) => {
                const services = parseServices(client.services)
                const isLost = client.isLost || client.stoppedServices
                const isUpdatingThis = updating === client.id

                return (
                  <tr
                    key={client.id}
                    className={`transition-colors ${
                      isLost
                        ? 'bg-red-500/10 hover:bg-red-500/20'
                        : client.upsellPotential
                        ? 'bg-amber-500/10 hover:bg-amber-500/20'
                        : 'hover:bg-blue-500/10'
                    }`}
                  >
                    {/* Client Name */}
                    <td className={`px-3 py-2 sticky left-0 z-10 ${isLost ? 'bg-red-500/10' : client.upsellPotential ? 'bg-amber-500/10' : 'glass-card'}`}>
                      <div className="flex items-center gap-2">
                        {isLost && (
                          <span className="w-2 h-2 bg-red-500 rounded-full" title="Lost/Stopped"></span>
                        )}
                        {client.upsellPotential && (
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="Upsell Potential"></span>
                        )}
                        <div>
                          <Link href={`/clients/${client.id}`} className="text-sm font-medium text-white hover:text-blue-400 truncate max-w-[160px] block">
                            {client.name}
                          </Link>
                          {client.linkedClientId && (
                            <span className="text-[10px] text-purple-400">Linked</span>
                          )}
                          {client.contactPhone && (
                            <a href={`tel:${client.contactPhone}`} className="text-[10px] text-blue-400 hover:underline">
                              {client.contactPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Services */}
                    <td className="px-2 py-2 text-center">
                      <div className="flex flex-wrap justify-center gap-0.5">
                        {services.map(s => (
                          <span key={s} className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                            s === 'SEO' ? 'bg-emerald-500/20 text-emerald-400' :
                            s === 'SM' ? 'bg-blue-500/20 text-blue-400' :
                            s === 'ADS' ? 'bg-amber-500/20 text-amber-400' :
                            s === 'WEB' ? 'bg-purple-500/20 text-purple-400' :
                            s === 'GMB' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-800/50 text-slate-300'
                          }`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Segment Dropdown */}
                    <td className="px-2 py-2 text-center">
                      <select
                        value={client.serviceSegment}
                        onChange={(e) => updateClient(client.id, 'serviceSegment', e.target.value)}
                        disabled={isUpdatingThis}
                        className="text-[10px] px-1 py-1 border border-white/10 rounded glass-card hover:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer disabled:opacity-50"
                      >
                        {SEGMENT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Billing Type Dropdown */}
                    <td className="px-2 py-2 text-center">
                      <select
                        value={client.billingType}
                        onChange={(e) => updateClient(client.id, 'billingType', e.target.value)}
                        disabled={isUpdatingThis}
                        className="text-[10px] px-1 py-1 border border-white/10 rounded glass-card hover:border-blue-400 focus:ring-1 focus:ring-blue-400 cursor-pointer disabled:opacity-50"
                      >
                        {BILLING_TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Fee (Editable) */}
                    <td className="px-2 py-2 text-center">
                      {editingCell?.id === client.id && editingCell?.field === 'monthlyFee' ? (
                        <input
                          type="number"
                          autoFocus
                          defaultValue={client.monthlyFee || ''}
                          onBlur={(e) => updateClient(client.id, 'monthlyFee', parseFloat(e.target.value) || null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateClient(client.id, 'monthlyFee', parseFloat((e.target as HTMLInputElement).value) || null)
                            }
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          className="w-16 text-xs px-1 py-1 border border-blue-400 rounded text-center"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingCell({ id: client.id, field: 'monthlyFee' })}
                          className="text-xs text-slate-200 hover:text-blue-400"
                        >
                          {client.monthlyFee ? `₹${(client.monthlyFee / 1000).toFixed(0)}K` : '-'}
                        </button>
                      )}
                    </td>

                    {/* Payment Status Dropdown */}
                    <td className="px-2 py-2 text-center">
                      <select
                        value={client.currentPaymentStatus || ''}
                        onChange={(e) => updateClient(client.id, 'currentPaymentStatus', e.target.value || null)}
                        disabled={isUpdatingThis}
                        className={`text-[10px] px-2 py-1 border rounded font-bold cursor-pointer disabled:opacity-50 ${getStatusColor(client.currentPaymentStatus)}`}
                      >
                        <option value="">-</option>
                        {PAYMENT_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Client Status Dropdown */}
                    <td className="px-2 py-2 text-center">
                      <select
                        value={client.status}
                        onChange={(e) => updateClient(client.id, 'status', e.target.value)}
                        disabled={isUpdatingThis}
                        className={`text-[10px] px-2 py-1 border rounded font-bold cursor-pointer disabled:opacity-50 ${
                          CLIENT_STATUS_OPTIONS.find(s => s.value === client.status)?.color || ''
                        }`}
                      >
                        {CLIENT_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Concerned Person (Editable) */}
                    <td className="px-2 py-2">
                      {editingCell?.id === client.id && editingCell?.field === 'concernedPerson' ? (
                        <input
                          type="text"
                          autoFocus
                          defaultValue={client.concernedPerson || ''}
                          onBlur={(e) => updateClient(client.id, 'concernedPerson', e.target.value || null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateClient(client.id, 'concernedPerson', (e.target as HTMLInputElement).value || null)
                            }
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          className="w-full text-xs px-1 py-1 border border-blue-400 rounded"
                          placeholder="Name"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingCell({ id: client.id, field: 'concernedPerson' })}
                          className="text-xs text-slate-300 hover:text-blue-400 truncate max-w-[120px] block text-left"
                        >
                          {client.concernedPerson || <span className="text-slate-400">+ Add</span>}
                        </button>
                      )}
                    </td>

                    {/* Notes (Editable) */}
                    <td className="px-2 py-2">
                      {editingCell?.id === client.id && editingCell?.field === 'notes' ? (
                        <input
                          type="text"
                          autoFocus
                          defaultValue={client.notes || ''}
                          onBlur={(e) => updateClient(client.id, 'notes', e.target.value || null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateClient(client.id, 'notes', (e.target as HTMLInputElement).value || null)
                            }
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          className="w-full text-xs px-1 py-1 border border-blue-400 rounded"
                          placeholder="Notes..."
                        />
                      ) : (
                        <button
                          onClick={() => setEditingCell({ id: client.id, field: 'notes' })}
                          className="text-xs text-slate-400 hover:text-blue-400 truncate max-w-[180px] block text-left"
                          title={client.notes || ''}
                        >
                          {client.notes || <span className="text-slate-400">+ Add note</span>}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Quick Guide</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span>Lost/Stopped Client</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></span>
            <span>Upsell Potential</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-bold">LINKED</span>
            <span>Has linked website project</span>
          </div>
          <div className="text-slate-400">Click on any field to edit inline</div>
        </div>
      </div>
    </div>
  )
}
