'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { HelpContent } from '@/shared/constants/helpContent'

interface FollowUp {
  status: string
  notes: string | null
}

interface Client {
  id: string
  name: string
  phone: string | null
  services: string[]
  invoiceDay: number | null
  invoiceStatus: string | null
  currentStatus: string | null
  pendingAmount: number | null
  notes: string | null
  status: string
  followUps: Record<string, FollowUp>
}

const STATUS_OPTIONS = [
  { value: 'DONE', label: 'Done', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-300' },
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-500/20 text-amber-800 border-amber-300' },
  { value: 'REMIND', label: 'Remind', color: 'bg-blue-500/20 text-blue-800 border-blue-300' },
  { value: 'IN_PROCESS', label: 'In Process', color: 'bg-purple-500/20 text-purple-800 border-purple-300' },
  { value: 'CALL_NOT_PICKED', label: 'No Answer', color: 'bg-slate-800/50 text-slate-300 border-white/20' },
  { value: 'WILL_PAY', label: 'Will Pay', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { value: 'PAYMENT_RECEIVED', label: 'Received', color: 'bg-green-500/20 text-green-800 border-green-300' },
  { value: 'WIP', label: 'WIP', color: 'bg-orange-500/20 text-orange-400 border-orange-300' },
  { value: 'PARTIAL', label: 'Partial', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-300' },
  { value: 'HOLD', label: 'Hold', color: 'bg-red-500/20 text-red-800 border-red-300' },
]

interface Escalation {
  client: {
    id: string
    name: string
    monthlyFee: number | null
    pendingAmount: number | null
    tier: string
    preferredContact: string | null
  }
  reason: string
  suggestedAction: string
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  daysOverdue: number
}

interface AutomationData {
  escalations: Escalation[]
  todayDue: Array<{ id: string; name: string; monthlyFee: number | null; paymentDueDay: number | null }>
  upcomingDue: Array<{ id: string; name: string; monthlyFee: number | null; daysUntilDue: number }>
  summary: {
    totalClients: number
    paidThisMonth: number
    pendingCount: number
    urgentCount: number
    highCount: number
    dueToday: number
    upcomingIn3Days: number
    totalExpected: number
    totalCollected: number
    collectionRate: number
    haltedReminders: number
  }
}

export default function PaymentTrackerPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [updating, setUpdating] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ clientId: string; date: string } | null>(null)
  const [filter, setFilter] = useState<string>('ALL')
  const tableRef = useRef<HTMLDivElement>(null)
  const [automation, setAutomation] = useState<AutomationData | null>(null)
  const [showAutomation, setShowAutomation] = useState(true)

  useEffect(() => {
    fetchData()
    fetchAutomation()
  }, [month])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/accounts/follow-ups?month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
        setDates(data.dates)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAutomation = async () => {
    try {
      const res = await fetch('/api/accounts/payment-automation')
      if (res.ok) {
        const data = await res.json()
        setAutomation(data)
      }
    } catch (error) {
      console.error('Failed to fetch automation:', error)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '₹0'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-slate-800/50 text-slate-300 border-white/20'
    }
  }

  const updateFollowUp = async (clientId: string, date: string, status: string, notes?: string) => {
    setUpdating(`${clientId}-${date}`)
    try {
      const res = await fetch('/api/accounts/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, date, status, notes }),
      })

      if (res.ok) {
        // Update local state
        setClients(prev => prev.map(client => {
          if (client.id === clientId) {
            return {
              ...client,
              currentStatus: status,
              followUps: {
                ...client.followUps,
                [date]: { status, notes: notes || null },
              }
            }
          }
          return client
        }))
        setEditingCell(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string | null) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-slate-900/40 text-slate-400'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.getDate()
  }

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().slice(0, 10)
  }

  const filteredClients = clients.filter(client => {
    if (filter === 'ALL') return true
    if (filter === 'PENDING') return ['PENDING', 'PARTIAL', 'WIP', 'IN_PROCESS'].includes(client.currentStatus || '')
    if (filter === 'DONE') return client.currentStatus === 'DONE'
    if (filter === 'OVERDUE') return client.pendingAmount && client.pendingAmount > 0
    return true
  })

  // Get dates for current week (7 days from today)
  const today = new Date().toISOString().slice(0, 10)
  const todayIndex = dates.indexOf(today)
  const visibleDates = dates.slice(Math.max(0, todayIndex - 3), Math.min(dates.length, todayIndex + 8))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Payment Follow-up Tracker</h1>
            <InfoTooltip
              title={HelpContent.accounts.paymentTracker.title}
              steps={HelpContent.accounts.paymentTracker.steps}
              tips={HelpContent.accounts.paymentTracker.tips}
            />
          </div>
          <p className="text-slate-400 text-sm mt-1">Track daily payment conversations with clients</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm"
          >
            <option value="ALL">All Clients</option>
            <option value="PENDING">Pending</option>
            <option value="DONE">Done</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <Link
            href="/accounts"
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Back to Accounts
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Clients</p>
          <p className="text-2xl font-bold text-white">{clients.length}</p>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
          <p className="text-sm text-emerald-600">Paid</p>
          <p className="text-2xl font-bold text-emerald-700">
            {clients.filter(c => c.currentStatus === 'DONE').length}
          </p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Pending</p>
          <p className="text-2xl font-bold text-amber-400">
            {clients.filter(c => ['PENDING', 'PARTIAL', 'WIP'].includes(c.currentStatus || '')).length}
          </p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Process</p>
          <p className="text-2xl font-bold text-blue-400">
            {clients.filter(c => c.currentStatus === 'IN_PROCESS').length}
          </p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">On Hold</p>
          <p className="text-2xl font-bold text-red-400">
            {clients.filter(c => c.status === 'ON_HOLD').length}
          </p>
        </div>
      </div>

      {/* Automation Insights Panel */}
      {automation && (automation.escalations.length > 0 || automation.todayDue.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAutomation(!showAutomation)}
              className="flex items-center gap-2 text-sm font-semibold text-white"
            >
              <svg className={`w-4 h-4 transition-transform ${showAutomation ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Smart Insights
              {automation.summary.urgentCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                  {automation.summary.urgentCount} urgent
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Collection: <span className={`font-bold ${automation.summary.collectionRate >= 80 ? 'text-emerald-400' : automation.summary.collectionRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{automation.summary.collectionRate}%</span></span>
              <span>{formatCurrency(automation.summary.totalCollected)} / {formatCurrency(automation.summary.totalExpected)}</span>
            </div>
          </div>

          {showAutomation && (
            <div className="space-y-3">
              {/* Due Today */}
              {automation.todayDue.length > 0 && (
                <div className="glass-card rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                  <h4 className="text-xs font-semibold text-blue-400 mb-2">Due Today ({automation.todayDue.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {automation.todayDue.map(c => (
                      <span key={c.id} className="px-2 py-1 text-xs bg-blue-500/10 text-blue-300 rounded-lg border border-blue-500/20">
                        {c.name} {c.monthlyFee ? `(${formatCurrency(c.monthlyFee)})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming in 3 days */}
              {automation.upcomingDue.length > 0 && (
                <div className="glass-card rounded-xl border border-slate-500/20 p-3">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Due in Next 3 Days ({automation.upcomingDue.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {automation.upcomingDue.map(c => (
                      <span key={c.id} className="px-2 py-1 text-xs bg-slate-800/50 text-slate-300 rounded-lg border border-white/10">
                        {c.name} (in {c.daysUntilDue}d)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Escalations */}
              {automation.escalations.length > 0 && (
                <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/10 bg-slate-900/40">
                    <h4 className="text-xs font-semibold text-white">Action Required ({automation.escalations.length})</h4>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[240px] overflow-y-auto">
                    {automation.escalations.slice(0, 10).map((esc, i) => (
                      <div key={`esc-${esc.client.name}-${i}`} className="px-4 py-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border shrink-0 ${getPriorityColor(esc.priority)}`}>
                            {esc.priority}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">{esc.client.name}</p>
                            <p className="text-[11px] text-slate-400">{esc.reason}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-amber-400 font-medium">{formatCurrency(esc.client.pendingAmount || esc.client.monthlyFee)}</p>
                          <p className="text-[10px] text-slate-400">{esc.suggestedAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden shadow-none">
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-900/40 border-b border-white/10 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-900 z-20 border-r border-white/10 w-48">
                  Client
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-16 border-r border-white/5">
                  Services
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-16 border-r border-white/5">
                  Inv Day
                </th>
                <th className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-20 border-r border-white/5">
                  Status
                </th>
                {visibleDates.map(date => (
                  <th
                    key={date}
                    className={`px-1 py-3 text-xs font-semibold uppercase tracking-wider text-center w-16 border-r border-white/5 ${
                      isToday(date) ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    <div>{formatDate(date)}</div>
                    <div className="text-[10px] font-normal">
                      {new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-500/10 transition-colors">
                  <td className="px-3 py-2 sticky left-0 bg-slate-900 border-r border-white/10 z-10">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[140px]" title={client.name}>
                          {client.name}
                        </p>
                        {client.phone && (
                          <a href={`tel:${client.phone}`} className="text-[10px] text-blue-400 hover:underline">
                            {client.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center border-r border-white/5">
                    <div className="flex flex-wrap justify-center gap-0.5">
                      {client.services.map(s => (
                        <span key={s} className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-800/50 text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-xs text-slate-300 border-r border-white/5">
                    {client.invoiceDay ? `${client.invoiceDay}${getOrdinal(client.invoiceDay)}` : '-'}
                  </td>
                  <td className="px-2 py-2 text-center border-r border-white/5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(client.currentStatus)}`}>
                      {client.currentStatus || 'N/A'}
                    </span>
                  </td>
                  {visibleDates.map(date => {
                    const followUp = client.followUps[date]
                    const isEditing = editingCell?.clientId === client.id && editingCell?.date === date
                    const isUpdatingThis = updating === `${client.id}-${date}`

                    return (
                      <td
                        key={date}
                        className={`px-1 py-1 text-center border-r border-white/5 ${
                          isToday(date) ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        {isEditing ? (
                          <select
                            autoFocus
                            className="w-full text-[10px] px-1 py-1 border border-blue-400 rounded glass-card"
                            defaultValue={followUp?.status || ''}
                            onChange={(e) => updateFollowUp(client.id, date, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                          >
                            <option value="">-</option>
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setEditingCell({ clientId: client.id, date })}
                            disabled={isUpdatingThis}
                            className={`w-full min-h-[24px] text-[9px] font-medium px-1 py-1 rounded border transition-all hover:ring-2 hover:ring-blue-200 ${
                              followUp?.status
                                ? getStatusColor(followUp.status)
                                : 'border-transparent hover:border-white/10 text-slate-300'
                            } ${isUpdatingThis ? 'opacity-50' : ''}`}
                            title={followUp?.notes || 'Click to update'}
                          >
                            {isUpdatingThis ? '...' : followUp?.status ? STATUS_OPTIONS.find(s => s.value === followUp.status)?.label || followUp.status : '-'}
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <span key={opt.value} className={`text-xs font-medium px-2 py-1 rounded-full border ${opt.color}`}>
              {opt.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
