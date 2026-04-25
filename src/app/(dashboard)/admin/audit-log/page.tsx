'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, Search, Calendar, Filter, RefreshCw,
  AlertTriangle, Bell, UserCheck, LogIn, LogOut,
  ArrowUpDown, ChevronLeft, ChevronRight,
} from 'lucide-react'

type AuditEntry = {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
  category: string
}

const ACTION_COLORS: Record<string, string> = {
  TASK: 'bg-blue-500/20 text-blue-400',
  MEETING: 'bg-purple-500/20 text-purple-400',
  PAYMENT: 'bg-green-500/20 text-green-400',
  REPORT: 'bg-yellow-500/20 text-yellow-400',
  LEAVE: 'bg-orange-500/20 text-orange-400',
  GENERAL: 'bg-zinc-500/20 text-zinc-400',
  IMPERSONATION: 'bg-red-500/20 text-red-400',
  USER_UPDATE: 'bg-teal-500/20 text-teal-400',
  LOGIN: 'bg-emerald-500/20 text-emerald-400',
  LOGOUT: 'bg-slate-500/20 text-slate-400',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  NOTIFICATION: <Bell className="w-4 h-4" />,
  SECURITY: <AlertTriangle className="w-4 h-4" />,
  ONBOARDING: <UserCheck className="w-4 h-4" />,
  AUTH: <LogIn className="w-4 h-4" />,
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`
}

const PAGE_SIZE = 25

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [actionTypes, setActionTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sortAsc, setSortAsc] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (actionFilter !== 'ALL') params.set('actionType', actionFilter)
      params.set('limit', '500')

      const res = await fetch(`/api/admin/audit-log?${params}`)
      if (!res.ok) throw new Error('Failed to fetch audit log')
      const data = await res.json()
      setEntries(data.entries || [])
      setActionTypes(data.actionTypes || [])
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, actionFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = entries.filter((e) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      e.user.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    return sortAsc ? diff : -diff
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const loginCount = entries.filter(e => e.action === 'LOGIN').length
  const securityCount = entries.filter(e => e.category === 'SECURITY').length
  const uniqueUsers = new Set(entries.map(e => e.user)).size

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Shield className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Audit Log</h1>
            <p className="text-zinc-400 text-sm">Track system activities, logins, and security events</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 bg-zinc-900 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Total Events</p>
          <p className="text-2xl font-bold text-white">{entries.length}</p>
        </div>
        <div className="rounded-xl p-4 bg-zinc-900 border border-zinc-800">
          <p className="text-zinc-400 text-sm flex items-center gap-1"><LogIn className="w-3 h-3" /> Logins</p>
          <p className="text-2xl font-bold text-emerald-400">{loginCount}</p>
        </div>
        <div className="rounded-xl p-4 bg-zinc-900 border border-zinc-800">
          <p className="text-zinc-400 text-sm flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Security</p>
          <p className="text-2xl font-bold text-red-400">{securityCount}</p>
        </div>
        <div className="rounded-xl p-4 bg-zinc-900 border border-zinc-800">
          <p className="text-zinc-400 text-sm">Unique Users</p>
          <p className="text-2xl font-bold text-purple-400">{uniqueUsers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Action Type
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="ALL">All Actions</option>
            {actionTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-zinc-400 flex items-center gap-1">
            <Search className="w-3 h-3" /> Search
          </label>
          <input
            type="text"
            placeholder="Search user, action, or details..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 text-left">
                <th className="px-4 py-3 font-medium w-10"></th>
                <th className="px-4 py-3 font-medium">
                  <button
                    onClick={() => setSortAsc(!sortAsc)}
                    className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                  >
                    Timestamp <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading audit entries...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    No audit entries found
                  </td>
                </tr>
              ) : (
                paginated.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-500">
                      {entry.action === 'LOGOUT'
                        ? <LogOut className="w-4 h-4" />
                        : CATEGORY_ICONS[entry.category] || <Bell className="w-4 h-4" />}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 whitespace-nowrap font-mono text-xs">
                      {formatDate(entry.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-zinc-200 whitespace-nowrap">{entry.user}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[entry.action] || 'bg-zinc-700 text-zinc-300'}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-md truncate">{entry.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-t border-zinc-800">
            <span className="text-xs text-zinc-500">
              {(page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-400">Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
