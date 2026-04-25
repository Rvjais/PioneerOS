'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { formatDateShort } from '@/shared/utils/cn'
import { useSearchParams } from 'next/navigation'

interface Deal {
  id: string
  dealValue: number | null
  status: string
  closedAt: string | null
  lead: {
    id: string
    companyName: string
    contactName: string
    contactEmail: string | null
  } | null
  user: { id: string; firstName: string; lastName: string | null } | null
}

export default function DealsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    }>
      <DealsContent />
    </Suspense>
  )
}

function DealsContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'won'

  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'won' | 'lost' | 'all'>(initialTab as 'won' | 'lost' | 'all')

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/sales/deals')
      if (res.ok) {
        const json = await res.json()
        const data = Array.isArray(json) ? json : json.deals || []
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

  const formatDate = (dateStr: string | null) => formatDateShort(dateStr)

  const filteredDeals = deals.filter(deal => {
    if (activeTab === 'won') return deal.status === 'WON'
    if (activeTab === 'lost') return deal.status === 'LOST'
    return true
  })

  const wonDeals = deals.filter(d => d.status === 'WON')
  const lostDeals = deals.filter(d => d.status === 'LOST')
  const totalWonValue = wonDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0)
  const totalLostValue = lostDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Deals</h1>
          <p className="text-sm text-slate-400">Track won and lost deals</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{wonDeals.length}</p>
              <p className="text-sm text-green-400">Deals Won</p>
            </div>
          </div>
          <p className="mt-2 text-lg font-semibold text-green-400">{formatCurrency(totalWonValue)}</p>
        </div>

        <div className="bg-red-500/10 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{lostDeals.length}</p>
              <p className="text-sm text-red-400">Deals Lost</p>
            </div>
          </div>
          <p className="mt-2 text-lg font-semibold text-red-400">{formatCurrency(totalLostValue)}</p>
        </div>

        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-200">
                {deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-sm text-slate-300">Win Rate</p>
            </div>
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-200">{deals.length} Total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="border-b border-white/10">
          <div className="flex">
            <button
              onClick={() => setActiveTab('won')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'won'
                  ? 'text-green-400 border-b-2 border-green-600 bg-green-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Won ({wonDeals.length})
            </button>
            <button
              onClick={() => setActiveTab('lost')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'lost'
                  ? 'text-red-400 border-b-2 border-red-600 bg-red-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lost ({lostDeals.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-white border-b-2 border-white/10 bg-slate-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({deals.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Company</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Contact</th>
                <th className="text-right px-4 py-3 font-medium text-slate-300">Value</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Closed Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Sales Rep</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No deals found
                  </td>
                </tr>
              ) : (
                filteredDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{deal.lead?.companyName || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-300">{deal.lead?.contactName || '-'}</div>
                      <div className="text-xs text-slate-400">{deal.lead?.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {deal.dealValue ? formatCurrency(deal.dealValue) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        deal.status === 'WON'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(deal.closedAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {deal.user
                        ? `${deal.user.firstName} ${deal.user.lastName || ''}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/sales/leads/${deal.lead?.id || deal.id}`}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
