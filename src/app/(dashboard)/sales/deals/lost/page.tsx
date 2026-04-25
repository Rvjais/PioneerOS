'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Deal {
  id: string
  lead: {
    id: string
    companyName: string
    contactName: string
    contactEmail: string | null
    contactPhone: string | null
    pipeline: string | null
    lostReason: string | null
  }
  dealValue: number
  servicesSold: string
  lossReason: string | null
  closedAt: string
}

const LOSS_REASONS: Record<string, { label: string; color: string }> = {
  BUDGET_ISSUE: { label: 'Budget Issue', color: 'bg-amber-500/20 text-amber-400' },
  CHOSE_ANOTHER_AGENCY: { label: 'Chose Another Agency', color: 'bg-purple-500/20 text-purple-400' },
  NOT_READY: { label: 'Not Ready for Marketing', color: 'bg-blue-500/20 text-blue-400' },
  NO_RESPONSE: { label: 'No Response', color: 'bg-slate-800/50 text-slate-200' },
}

export default function DealsLostPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/sales/deals?status=LOST')
      if (res.ok) {
        const data = await res.json()
        setDeals(data)
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReEngage = async (deal: Deal) => {
    if (!confirm(`Re-engage ${deal.lead.companyName}? This will move them back to the active pipeline.`)) return

    try {
      const res = await fetch(`/api/sales/leads/${deal.lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'NURTURING',
          lostReason: null,
        }),
      })

      if (res.ok) {
        // Remove from lost deals list
        setDeals(deals.filter(d => d.id !== deal.id))
        toast.success(`${deal.lead.companyName} moved back to nurturing pipeline.`)
      } else {
        toast.error('Failed to re-engage lead. Please try again.')
      }
    } catch (error) {
      console.error('Failed to re-engage:', error)
      toast.error('Network error. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const lostValue = deals.reduce((sum, d) => sum + d.dealValue, 0)

  // Group by loss reason
  const reasonStats = deals.reduce((acc, deal) => {
    const reason = deal.lossReason || deal.lead.lostReason || 'NO_RESPONSE'
    acc[reason] = (acc[reason] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Deals Lost</h1>
          <p className="text-sm text-slate-400">{deals.length} opportunities not converted</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-400">Lost Value</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(lostValue)}</p>
          </div>
          <Link
            href="/sales/deals/won"
            className="px-4 py-2 border border-white/10 text-slate-300 text-sm rounded-lg hover:bg-slate-900/40"
          >
            View Won
          </Link>
        </div>
      </div>

      {/* Loss Reason Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(reasonStats).map(([reason, count]) => {
          const reasonInfo = LOSS_REASONS[reason] || { label: reason, color: 'bg-slate-800/50 text-slate-200' }
          return (
            <div
              key={reason}
              className={`rounded-lg p-4 ${reasonInfo.color.replace('text-', 'bg-').replace('700', '50').replace('100', '50')}`}
            >
              <p className="text-3xl font-bold">{count}</p>
              <p className="text-sm">{reasonInfo.label}</p>
            </div>
          )
        })}
      </div>

      {/* Deals Table */}
      <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-red-500/10 border-b border-red-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-red-800">Company</th>
              <th className="text-left px-4 py-3 font-medium text-red-800">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-red-800">Pipeline</th>
              <th className="text-left px-4 py-3 font-medium text-red-800">Lost Value</th>
              <th className="text-left px-4 py-3 font-medium text-red-800">Loss Reason</th>
              <th className="text-left px-4 py-3 font-medium text-red-800">Lost On</th>
              <th className="text-center px-4 py-3 font-medium text-red-800">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No deals lost
                </td>
              </tr>
            ) : (
              deals.map(deal => {
                const reason = deal.lossReason || deal.lead.lostReason || 'NO_RESPONSE'
                const reasonInfo = LOSS_REASONS[reason] || { label: reason, color: 'bg-slate-800/50 text-slate-200' }
                return (
                  <tr key={deal.id} className="hover:bg-red-500/10">
                    <td className="px-4 py-3">
                      <Link
                        href={`/sales/leads/${deal.lead.id}`}
                        className="font-medium text-orange-600 hover:underline"
                      >
                        {deal.lead.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{deal.lead.contactName}</p>
                      <p className="text-xs text-slate-400">{deal.lead.contactPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        deal.lead.pipeline === 'BRANDING_PIONEERS'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {deal.lead.pipeline === 'BRANDING_PIONEERS' ? 'Branding' : 'Rainmindz'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-red-400">{formatCurrency(deal.dealValue)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${reasonInfo.color}`}>
                        {reasonInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(deal.closedAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleReEngage(deal)}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Re-engage
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
