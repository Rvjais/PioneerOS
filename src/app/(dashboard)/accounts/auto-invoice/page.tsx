'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  status: string
  monthlyFee: number | null
  billingType: string | null
  haltReminders: boolean
  contactEmail: string | null
  whatsapp: string | null
}

interface AutoInvoiceConfig {
  id: string
  clientId: string
  client: Client
  isEnabled: boolean
  generateOnDay: number
  sendOnDay: number
  sendViaWhatsApp: boolean
  sendViaEmail: boolean
  useClientMonthlyFee: boolean
  customAmount: number | null
  includeGST: boolean
  gstPercentage: number
  invoicePrefix: string | null
  defaultNotes: string | null
  lastGeneratedAt: string | null
  lastSentAt: string | null
  nextScheduledAt: string | null
}

interface UpcomingInvoice {
  clientId: string
  clientName: string
  generateOnDay: number
  sendOnDay: number
  amount: number | null
  channels: {
    whatsApp: boolean
    email: boolean
  }
}

interface Summary {
  total: number
  enabled: number
  disabled: number
  haltedReminders: number
}

const ALLOWED_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']

export default function AutoInvoicePage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role as string | undefined
  const canManage = !!userRole && ALLOWED_ROLES.includes(userRole)
  const [configs, setConfigs] = useState<AutoInvoiceConfig[]>([])
  const [clientsWithoutConfig, setClientsWithoutConfig] = useState<Client[]>([])
  const [upcomingInvoices, setUpcomingInvoices] = useState<UpcomingInvoice[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AutoInvoiceConfig | null>(null)
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all')

  const [configForm, setConfigForm] = useState({
    clientId: '',
    isEnabled: true,
    generateOnDay: 1,
    sendOnDay: 1,
    sendViaWhatsApp: true,
    sendViaEmail: true,
    useClientMonthlyFee: true,
    customAmount: '',
    includeGST: true,
    gstPercentage: 18,
    invoicePrefix: '',
    defaultNotes: ''
  })

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/accounts/auto-invoice/config')
      if (res.ok) {
        const data = await res.json()
        setConfigs(data.configs || [])
        setClientsWithoutConfig(data.clientsWithoutConfig || [])
        setUpcomingInvoices(data.upcomingInvoices || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    if (!configForm.clientId && !editingConfig) {
      toast.error('Please select a client')
      return
    }

    try {
      const url = editingConfig
        ? `/api/accounts/auto-invoice/config/${editingConfig.clientId}`
        : '/api/accounts/auto-invoice/config'

      const res = await fetch(url, {
        method: editingConfig ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...configForm,
          customAmount: configForm.customAmount ? parseFloat(configForm.customAmount) : null
        })
      })

      if (res.ok) {
        setShowConfigModal(false)
        setEditingConfig(null)
        resetForm()
        fetchConfigs()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save config')
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      toast.error('Failed to save config')
    }
  }

  const handleToggleEnabled = async (config: AutoInvoiceConfig) => {
    try {
      const res = await fetch(`/api/accounts/auto-invoice/config/${config.clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !config.isEnabled })
      })

      if (res.ok) {
        fetchConfigs()
      }
    } catch (error) {
      console.error('Failed to toggle config:', error)
    }
  }

  const handleEdit = (config: AutoInvoiceConfig) => {
    setEditingConfig(config)
    setConfigForm({
      clientId: config.clientId,
      isEnabled: config.isEnabled,
      generateOnDay: config.generateOnDay,
      sendOnDay: config.sendOnDay,
      sendViaWhatsApp: config.sendViaWhatsApp,
      sendViaEmail: config.sendViaEmail,
      useClientMonthlyFee: config.useClientMonthlyFee,
      customAmount: config.customAmount?.toString() || '',
      includeGST: config.includeGST,
      gstPercentage: config.gstPercentage,
      invoicePrefix: config.invoicePrefix || '',
      defaultNotes: config.defaultNotes || ''
    })
    setShowConfigModal(true)
  }

  const resetForm = () => {
    setConfigForm({
      clientId: '',
      isEnabled: true,
      generateOnDay: 1,
      sendOnDay: 1,
      sendViaWhatsApp: true,
      sendViaEmail: true,
      useClientMonthlyFee: true,
      customAmount: '',
      includeGST: true,
      gstPercentage: 18,
      invoicePrefix: '',
      defaultNotes: ''
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount.toFixed(0)}`
  }

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  const filteredConfigs = configs.filter(c => {
    if (filter === 'enabled') return c.isEnabled
    if (filter === 'disabled') return !c.isEnabled
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Auto-Invoice</h1>
          <p className="text-slate-400 text-sm mt-1">Configure automatic invoice generation and delivery</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/accounts"
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Dashboard
          </Link>
          {canManage && (
            <button
              onClick={() => {
                resetForm()
                setEditingConfig(null)
                setShowConfigModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Config
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-slate-400 text-sm">Total Configs</p>
            <p className="text-2xl font-bold text-white mt-1">{summary.total}</p>
          </div>
          <div className="glass-card rounded-xl border border-green-200 p-4">
            <p className="text-green-400 text-sm">Enabled</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{summary.enabled}</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-slate-400 text-sm">Disabled</p>
            <p className="text-2xl font-bold text-slate-300 mt-1">{summary.disabled}</p>
          </div>
          <div className="glass-card rounded-xl border border-amber-200 p-4">
            <p className="text-amber-400 text-sm">Halted Reminders</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{summary.haltedReminders}</p>
          </div>
        </div>
      )}

      {/* Upcoming Invoices */}
      {upcomingInvoices.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Upcoming This Month</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingInvoices.slice(0, 6).map((inv) => (
              <div key={inv.clientId} className="glass-card rounded-lg p-3 border border-blue-100">
                <p className="font-medium text-white">{inv.clientName}</p>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-slate-400">Generate: {getOrdinal(inv.generateOnDay)}</span>
                  <span className="font-medium text-blue-400">{formatCurrency(inv.amount)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {inv.channels.whatsApp && (
                    <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">WhatsApp</span>
                  )}
                  {inv.channels.email && (
                    <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">Email</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clients Without Config */}
      {canManage && clientsWithoutConfig.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-amber-800">Clients Without Auto-Invoice</h3>
            <span className="text-sm text-amber-400">{clientsWithoutConfig.length} clients</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {clientsWithoutConfig.slice(0, 10).map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  setConfigForm({ ...configForm, clientId: client.id })
                  setShowConfigModal(true)
                }}
                className="px-3 py-1.5 text-sm glass-card border border-amber-200 text-amber-800 rounded-lg hover:bg-amber-500/20"
              >
                {client.name}
              </button>
            ))}
            {clientsWithoutConfig.length > 10 && (
              <span className="px-3 py-1.5 text-sm text-amber-400">
                +{clientsWithoutConfig.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'enabled', 'disabled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm rounded-lg ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Configs Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Schedule</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Channels</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Last Sent</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="text-slate-400">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No auto-invoice configurations found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredConfigs.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{config.client.name}</p>
                        <p className="text-xs text-slate-400">{config.client.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {canManage ? (
                        <button
                          onClick={() => handleToggleEnabled(config)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config.isEnabled ? 'bg-green-500' : 'bg-white/20'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full glass-card transition-transform ${
                              config.isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded ${config.isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-slate-400'}`}>
                          {config.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                      {config.client.haltReminders && (
                        <span className="block text-xs text-amber-400 mt-1">Reminders halted</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm">
                        <p className="text-slate-200">Generate: {getOrdinal(config.generateOnDay)}</p>
                        <p className="text-slate-400 text-xs">Send: {getOrdinal(config.sendOnDay)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium text-white">
                        {config.useClientMonthlyFee
                          ? formatCurrency(config.client.monthlyFee)
                          : formatCurrency(config.customAmount)
                        }
                      </span>
                      {config.includeGST && (
                        <span className="block text-xs text-slate-400">+{config.gstPercentage}% GST</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {config.sendViaWhatsApp && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">WA</span>
                        )}
                        {config.sendViaEmail && (
                          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">Email</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-slate-400">
                        {config.lastSentAt
                          ? new Date(config.lastSentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {canManage && (
                        <button
                          onClick={() => handleEdit(config)}
                          className="px-3 py-1 text-xs bg-slate-800/50 text-slate-200 rounded hover:bg-white/10"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingConfig ? 'Edit Auto-Invoice Config' : 'Add Auto-Invoice Config'}
              </h2>
              <button
                onClick={() => {
                  setShowConfigModal(false)
                  setEditingConfig(null)
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {!editingConfig && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Client *</label>
                  <select
                    value={configForm.clientId}
                    onChange={(e) => setConfigForm({ ...configForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  >
                    <option value="">Select Client</option>
                    {clientsWithoutConfig.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({formatCurrency(c.monthlyFee)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.isEnabled}
                    onChange={(e) => setConfigForm({ ...configForm, isEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-blue-400"
                  />
                  <span className="text-sm text-slate-200">Enable auto-invoice</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Generate On Day</label>
                  <select
                    value={configForm.generateOnDay}
                    onChange={(e) => setConfigForm({ ...configForm, generateOnDay: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{getOrdinal(d)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Send On Day</label>
                  <select
                    value={configForm.sendOnDay}
                    onChange={(e) => setConfigForm({ ...configForm, sendOnDay: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{getOrdinal(d)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Send Via</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configForm.sendViaWhatsApp}
                      onChange={(e) => setConfigForm({ ...configForm, sendViaWhatsApp: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 text-green-400"
                    />
                    <span className="text-sm text-slate-200">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configForm.sendViaEmail}
                      onChange={(e) => setConfigForm({ ...configForm, sendViaEmail: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 text-blue-400"
                    />
                    <span className="text-sm text-slate-200">Email</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Amount</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={configForm.useClientMonthlyFee}
                      onChange={() => setConfigForm({ ...configForm, useClientMonthlyFee: true })}
                      className="w-4 h-4 border-white/20 text-blue-400"
                    />
                    <span className="text-sm text-slate-200">Use client monthly fee</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!configForm.useClientMonthlyFee}
                      onChange={() => setConfigForm({ ...configForm, useClientMonthlyFee: false })}
                      className="w-4 h-4 border-white/20 text-blue-400"
                    />
                    <span className="text-sm text-slate-200">Custom amount</span>
                  </label>
                  {!configForm.useClientMonthlyFee && (
                    <input
                      type="number"
                      value={configForm.customAmount}
                      onChange={(e) => setConfigForm({ ...configForm, customAmount: e.target.value })}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.includeGST}
                    onChange={(e) => setConfigForm({ ...configForm, includeGST: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-blue-400"
                  />
                  <span className="text-sm text-slate-200">Include GST</span>
                </label>
                {configForm.includeGST && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={configForm.gstPercentage}
                      onChange={(e) => setConfigForm({ ...configForm, gstPercentage: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 border border-white/10 rounded text-sm"
                    />
                    <span className="text-sm text-slate-400">%</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Invoice Prefix (optional)</label>
                <input
                  type="text"
                  value={configForm.invoicePrefix}
                  onChange={(e) => setConfigForm({ ...configForm, invoicePrefix: e.target.value })}
                  placeholder="e.g., BP-"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Default Notes (optional)</label>
                <textarea
                  value={configForm.defaultNotes}
                  onChange={(e) => setConfigForm({ ...configForm, defaultNotes: e.target.value })}
                  placeholder="Notes to include in invoice..."
                  rows={3}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfigModal(false)
                  setEditingConfig(null)
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                {editingConfig ? 'Update Config' : 'Create Config'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
