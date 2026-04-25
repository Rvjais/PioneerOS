'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface Handover {
  id: string
  status: 'PENDING' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'COMPLETED'
  paymentTerms: string | null
  servicesAgreed: string | null
  specialTerms: string | null
  proposalUrl: string | null
  dealValue: number | null
  notes: string | null
  createdAt: string
  acknowledgedAt: string | null
  completedAt: string | null
  lead: {
    id: string
    companyName: string
    contactName: string
    contactEmail: string | null
    contactPhone: string | null
    pipeline: string | null
    value: number | null
    primaryObjective: string | null
    budgetRange: string | null
  }
  salesUser: {
    id: string
    firstName: string
    lastName: string | null
  }
  accountsUser: {
    id: string
    firstName: string
    lastName: string | null
  } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  ACKNOWLEDGED: { label: 'Acknowledged', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  COMPLETED: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
}

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'ACKNOWLEDGED',
  ACKNOWLEDGED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
}

const ACTION_LABELS: Record<string, string> = {
  PENDING: 'Acknowledge',
  ACKNOWLEDGED: 'Start Progress',
  IN_PROGRESS: 'Mark Complete',
}

export default function SalesHandoversPage() {
  const [handovers, setHandovers] = useState<Handover[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchHandovers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res = await fetch(`/api/sales/handover?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setHandovers(data)
      } else {
        toast.error('Failed to fetch handovers')
      }
    } catch {
      toast.error('Failed to fetch handovers')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    setLoading(true)
    fetchHandovers()
  }, [fetchHandovers])

  const handleStatusUpdate = async (handoverId: string, currentStatus: string) => {
    const nextStatus = NEXT_STATUS[currentStatus]
    if (!nextStatus) return

    setUpdatingId(handoverId)
    try {
      const res = await fetch('/api/sales/handover', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: handoverId, status: nextStatus }),
      })

      if (res.ok) {
        toast.success(`Handover ${nextStatus.toLowerCase().replace(/_/g, ' ')}`)
        fetchHandovers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update handover')
      }
    } catch {
      toast.error('Failed to update handover')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatValue = (value: number | null) => {
    if (!value) return '--'
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${value.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const statusCounts = {
    all: handovers.length,
    PENDING: handovers.filter(h => h.status === 'PENDING').length,
    ACKNOWLEDGED: handovers.filter(h => h.status === 'ACKNOWLEDGED').length,
    IN_PROGRESS: handovers.filter(h => h.status === 'IN_PROGRESS').length,
    COMPLETED: handovers.filter(h => h.status === 'COMPLETED').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Sales Handovers</h1>
        <p className="text-slate-400 mt-1">Manage deal handovers from sales to accounts team</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'PENDING', label: 'Pending' },
          { key: 'ACKNOWLEDGED', label: 'Acknowledged' },
          { key: 'IN_PROGRESS', label: 'In Progress' },
          { key: 'COMPLETED', label: 'Completed' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === key
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/10">
              {statusCounts[key as keyof typeof statusCounts] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Handover Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : handovers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-400 text-lg">No handovers found</p>
          <p className="text-slate-500 text-sm mt-1">
            {filterStatus !== 'all' ? 'Try a different filter' : 'Handovers will appear here when deals are won'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {handovers.map((handover) => {
            const statusConfig = STATUS_CONFIG[handover.status]
            const canAdvance = NEXT_STATUS[handover.status]

            return (
              <div
                key={handover.id}
                className={`bg-white/5 border ${statusConfig.border} rounded-xl p-5 space-y-4 hover:bg-white/[0.07] transition-all`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold truncate">{handover.lead.companyName}</h3>
                    <p className="text-slate-400 text-sm truncate">{handover.lead.contactName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} whitespace-nowrap ml-2`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {handover.dealValue && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Deal Value</span>
                      <span className="text-white font-medium">{formatValue(handover.dealValue)}</span>
                    </div>
                  )}
                  {handover.lead.pipeline && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pipeline</span>
                      <span className="text-slate-300">{handover.lead.pipeline}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sales Rep</span>
                    <span className="text-slate-300">{handover.salesUser.firstName} {handover.salesUser.lastName || ''}</span>
                  </div>
                  {handover.accountsUser && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Accounts</span>
                      <span className="text-slate-300">{handover.accountsUser.firstName} {handover.accountsUser.lastName || ''}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created</span>
                    <span className="text-slate-300">{formatDate(handover.createdAt)}</span>
                  </div>
                </div>

                {/* Notes */}
                {handover.notes && (
                  <p className="text-slate-400 text-sm bg-white/5 rounded-lg p-3 line-clamp-2">{handover.notes}</p>
                )}

                {/* Action Button */}
                {canAdvance && (
                  <button
                    onClick={() => handleStatusUpdate(handover.id, handover.status)}
                    disabled={updatingId === handover.id}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      handover.status === 'PENDING'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : handover.status === 'ACKNOWLEDGED'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {updatingId === handover.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      ACTION_LABELS[handover.status]
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
