'use client'

import { useState, useEffect } from 'react'
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
  }
  dealValue: number
  servicesSold: string
  contractDuration: number | null
  startDate: string | null
  billingCycle: string | null
  paymentTerms: string | null
  closedAt: string
}

export default function DealsWonPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/sales/deals?status=WON')
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

  const totalValue = deals.reduce((sum, d) => sum + d.dealValue, 0)

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
          <h1 className="text-xl font-semibold text-white">Deals Won</h1>
          <p className="text-sm text-slate-400">{deals.length} deals closed successfully</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-400">Total Value</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalValue)}</p>
          </div>
          <Link
            href="/sales/deals/lost"
            className="px-4 py-2 border border-white/10 text-slate-300 text-sm rounded-lg hover:bg-slate-900/40"
          >
            View Lost
          </Link>
        </div>
      </div>

      {/* Deals Table */}
      <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-500/10 border-b border-green-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-green-800">Client</th>
              <th className="text-left px-4 py-3 font-medium text-green-800">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-green-800">Pipeline</th>
              <th className="text-left px-4 py-3 font-medium text-green-800">Services</th>
              <th className="text-left px-4 py-3 font-medium text-green-800">Value</th>
              <th className="text-left px-4 py-3 font-medium text-green-800">Duration</th>
              <th className="text-left px-4 py-3 font-medium text-green-800">Closed On</th>
              <th className="text-center px-4 py-3 font-medium text-green-800">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No deals won yet
                </td>
              </tr>
            ) : (
              deals.map(deal => {
                const services = deal.servicesSold ? JSON.parse(deal.servicesSold) : []
                return (
                  <tr key={deal.id} className="hover:bg-green-500/10">
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
                      <div className="flex flex-wrap gap-1">
                        {services.slice(0, 2).map((s: string, i: number) => (
                          <span key={`service-${s}`} className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">
                            {s}
                          </span>
                        ))}
                        {services.length > 2 && (
                          <span className="px-2 py-0.5 text-xs text-slate-400">
                            +{services.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-400">{formatCurrency(deal.dealValue)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {deal.contractDuration ? `${deal.contractDuration} months` : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(deal.closedAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/sales/handovers?dealId=${deal.id}`}
                        className="text-xs text-orange-600 hover:underline"
                      >
                        Handover
                      </Link>
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
