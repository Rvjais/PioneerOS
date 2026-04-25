'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { downloadCSV } from '@/client/utils/downloadCSV'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  servicePackage?: string
  monthlyFee?: number
  billingCycle: string
  paymentMethod?: string
  currentPaymentStatus: string
  onboardingStatus: string
  accountManager?: { id: string; firstName: string; lastName?: string }
  pendingAmount?: number
  createdAt: string
}

const statusColors = {
  PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
  PARTIAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
}

const onboardingColors = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  AWAITING_SLA: 'bg-purple-500/20 text-purple-400',
  AWAITING_PAYMENT: 'bg-red-500/20 text-red-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400'
}

export default function AccountsClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'pendingAmount' | 'monthlyFee'>('name')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setError(null)
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Failed to load clients')
      const data = await res.json()
      setClients(data.clients || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Failed to load clients. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                           c.email?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || c.currentPaymentStatus === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'pendingAmount') return (b.pendingAmount || 0) - (a.pendingAmount || 0)
      if (sortBy === 'monthlyFee') return (b.monthlyFee || 0) - (a.monthlyFee || 0)
      return 0
    })

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.onboardingStatus === 'ACTIVE' || c.onboardingStatus === 'COMPLETED').length,
    paid: clients.filter(c => c.currentPaymentStatus === 'PAID').length,
    overdue: clients.filter(c => c.currentPaymentStatus === 'OVERDUE').length,
    totalPending: clients.reduce((sum, c) => sum + (c.pendingAmount || 0), 0),
    totalMonthly: clients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <InfoTooltip
              title="Client Management"
              steps={[
                'View all clients and their financial status',
                'Track service packages and billing cycles',
                'Monitor payment status and pending amounts',
                'Access client details for account management'
              ]}
              tips={[
                'Focus on overdue clients first',
                'Update payment method if client requests'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Master list of all client accounts</p>
        </div>

        <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (!filteredClients.length) return
            const rows = filteredClients.map(c => ({
              Name: c.name,
              Email: c.email || '',
              Phone: c.phone || '',
              'Service Package': c.servicePackage || '',
              'Monthly Fee': c.monthlyFee ?? '',
              'Billing Cycle': c.billingCycle || 'Monthly',
              'Payment Status': c.currentPaymentStatus,
              'Pending Amount': c.pendingAmount ?? 0,
              'Onboarding Status': c.onboardingStatus,
            }))
            downloadCSV(rows, 'clients.csv')
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
        <Link
          href="/accounts/onboarding/create"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Client
        </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Clients</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-emerald-300">{stats.active}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Paid</p>
          <p className="text-2xl font-bold text-emerald-300">{stats.paid}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">Overdue</p>
          <p className="text-2xl font-bold text-red-300">{stats.overdue}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Total Pending</p>
          <p className="text-xl font-bold text-amber-300">Rs. {stats.totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Monthly Revenue</p>
          <p className="text-xl font-bold text-blue-300">Rs. {stats.totalMonthly.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            aria-label="Search clients by name or email"
            className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by payment status"
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PARTIAL">Partial</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          aria-label="Sort clients by"
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="name">Sort by Name</option>
          <option value="pendingAmount">Sort by Pending</option>
          <option value="monthlyFee">Sort by Monthly Fee</option>
        </select>
      </div>

      {/* Clients Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchClients} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Package</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Monthly Fee</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Billing</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Payment Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Pending</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Onboarding</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{client.name}</p>
                        {client.email && (
                          <p className="text-sm text-slate-400">{client.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {client.servicePackage || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {client.monthlyFee ? `Rs. ${client.monthlyFee.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {client.billingCycle || 'Monthly'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${statusColors[client.currentPaymentStatus as keyof typeof statusColors] || statusColors.PENDING}`}>
                        {client.currentPaymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {client.pendingAmount && client.pendingAmount > 0 ? (
                        <span className="text-red-400 font-medium">
                          Rs. {client.pendingAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-400">Cleared</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${onboardingColors[client.onboardingStatus as keyof typeof onboardingColors] || 'bg-slate-900/20 text-slate-400'}`}>
                        {client.onboardingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clients/${client.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="View Details"
                          aria-label={`View details for ${client.name}`}
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/accounts/contracts/${client.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Contract"
                          aria-label={`View contract for ${client.name}`}
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
