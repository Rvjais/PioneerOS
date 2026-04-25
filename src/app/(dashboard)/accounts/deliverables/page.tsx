'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Deliverable {
  id: string
  title: string
  type: string
  client: { id: string; name: string }
  project?: { id: string; name: string }
  status: 'pending' | 'in_progress' | 'completed' | 'delivered'
  billingStatus: 'not_billable' | 'pending_billing' | 'billed' | 'paid'
  amount?: number
  completedAt?: string
  billedAt?: string
  paidAt?: string
}

const statusColors = {
  pending: 'bg-slate-900/20 text-slate-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-amber-500/20 text-amber-400',
  delivered: 'bg-emerald-500/20 text-emerald-400'
}

const billingStatusColors = {
  not_billable: 'bg-slate-900/20 text-slate-400 border-slate-500/30',
  pending_billing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  billed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
}

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [billingFilter, setBillingFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchDeliverables()
  }, [])

  const fetchDeliverables = async () => {
    try {
      const res = await fetch('/api/deliverables?includeBilling=true')
      if (res.ok) {
        const data = await res.json()
        setDeliverables(data.deliverables || data || [])
      }
    } catch (error) {
      console.error('Error fetching deliverables:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBillingStatus = async (id: string, billingStatus: Deliverable['billingStatus']) => {
    try {
      const res = await fetch(`/api/deliverables/${id}/billing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingStatus })
      })
      if (res.ok) {
        fetchDeliverables()
      }
    } catch (error) {
      console.error('Error updating billing status:', error)
    }
  }

  const filteredDeliverables = deliverables
    .filter(d => billingFilter === 'all' || d.billingStatus === billingFilter)
    .filter(d => statusFilter === 'all' || d.status === statusFilter)

  const stats = {
    completed: deliverables.filter(d => d.status === 'completed' || d.status === 'delivered').length,
    pendingBilling: deliverables.filter(d => d.billingStatus === 'pending_billing').length,
    billed: deliverables.filter(d => d.billingStatus === 'billed').length,
    pendingAmount: deliverables
      .filter(d => d.billingStatus === 'pending_billing')
      .reduce((sum, d) => sum + (d.amount || 0), 0),
    billedAmount: deliverables
      .filter(d => d.billingStatus === 'billed' || d.billingStatus === 'paid')
      .reduce((sum, d) => sum + (d.amount || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Deliverables</h1>
            <InfoTooltip
              title="Deliverables - Billing View"
              steps={[
                'Track completed deliverables for billing',
                'Mark deliverables as billed when invoiced',
                'Update to paid when payment received',
                'Monitor pending billing amounts'
              ]}
              tips={[
                'Bill completed deliverables promptly',
                'Coordinate with project team for completion status'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Completed deliverables tied to billing</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-emerald-300">{stats.completed}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Pending Billing</p>
          <p className="text-2xl font-bold text-amber-300">{stats.pendingBilling}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Billed</p>
          <p className="text-2xl font-bold text-blue-300">{stats.billed}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Pending Amount</p>
          <p className="text-xl font-bold text-amber-300">Rs. {stats.pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Billed Amount</p>
          <p className="text-xl font-bold text-blue-300">Rs. {stats.billedAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delivered">Delivered</option>
        </select>

        <select
          value={billingFilter}
          onChange={e => setBillingFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Billing Status</option>
          <option value="pending_billing">Pending Billing</option>
          <option value="billed">Billed</option>
          <option value="paid">Paid</option>
          <option value="not_billable">Not Billable</option>
        </select>
      </div>

      {/* Deliverables Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredDeliverables.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No deliverables found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Deliverable</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Billing</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDeliverables.map(deliverable => (
                  <tr key={deliverable.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{deliverable.title}</p>
                      {deliverable.project && (
                        <p className="text-sm text-slate-400">{deliverable.project.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${deliverable.client.id}`}
                        className="text-slate-300 hover:text-emerald-400"
                      >
                        {deliverable.client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {deliverable.type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[deliverable.status]}`}>
                        {deliverable.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {deliverable.amount ? `Rs. ${deliverable.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${billingStatusColors[deliverable.billingStatus]}`}>
                        {deliverable.billingStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(deliverable.status === 'completed' || deliverable.status === 'delivered') && (
                        <select
                          value={deliverable.billingStatus}
                          onChange={e => updateBillingStatus(deliverable.id, e.target.value as Deliverable['billingStatus'])}
                          className="px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded text-xs text-slate-300"
                        >
                          <option value="not_billable">Not Billable</option>
                          <option value="pending_billing">Pending Billing</option>
                          <option value="billed">Billed</option>
                          <option value="paid">Paid</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Billing Alert */}
      {stats.pendingBilling > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-400">
                {stats.pendingBilling} deliverables pending billing
              </p>
              <p className="text-sm text-amber-300">
                Total value: Rs. {stats.pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
