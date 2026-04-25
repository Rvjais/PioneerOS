'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { extractArrayData } from '@/server/apiResponse'

interface FinanceStats {
  monthlyRevenue: number
  totalReceivables: number
  totalCollected: number
  outstandingPayments: number
  expenses: number
  collectionRate: number
  overdueAmount: number
  thisWeekCollections: number
}

interface RecentPayment {
  id: string
  client: { name: string }
  grossAmount: number
  collectedAt: string
}

interface TopClient {
  id: string
  name: string
  monthlyFee: number
  pendingAmount: number
  paymentStatus: string
}

export default function FinanceOverviewPage() {
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [topClients, setTopClients] = useState<TopClient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchData()
  }, [selectedPeriod])

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes, clientsRes] = await Promise.all([
        fetch(`/api/accounts/finance-stats?period=${selectedPeriod}`),
        fetch('/api/accounts/payments?limit=10'),
        fetch('/api/clients?sortBy=monthlyFee&limit=5')
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setRecentPayments(data.payments || [])
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json()
        const clientsArray = extractArrayData<TopClient>(data)
        setTopClients(clientsArray.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `Rs. ${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(2)} L`
    return `Rs. ${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Finance Overview</h1>
            <InfoTooltip
              title="Finance Overview"
              steps={[
                'Real-time financial summary',
                'Track revenue and collections',
                'Monitor outstanding payments',
                'View expense breakdown'
              ]}
              tips={[
                'Check collection rate weekly',
                'Follow up on high outstanding amounts'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Financial summary and key metrics</p>
        </div>

        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-6">
              <p className="text-emerald-400 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </p>
              <p className="text-xs text-emerald-400 mt-2">Expected this month</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-6">
              <p className="text-blue-400 text-sm">Total Collected</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatCurrency(stats?.totalCollected || 0)}
              </p>
              <p className="text-xs text-blue-400 mt-2">This {selectedPeriod}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-6">
              <p className="text-amber-400 text-sm">Outstanding</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatCurrency(stats?.outstandingPayments || 0)}
              </p>
              <p className="text-xs text-amber-400 mt-2">Pending collection</p>
            </div>

            <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/30 rounded-2xl p-6">
              <p className="text-red-400 text-sm">Overdue</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatCurrency(stats?.overdueAmount || 0)}
              </p>
              <p className="text-xs text-red-400 mt-2">Past due date</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Collection Rate</p>
              <p className="text-2xl font-bold text-white">{stats?.collectionRate || 0}%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Total Receivables</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalReceivables || 0)}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <p className="text-slate-400 text-sm">This Week</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats?.thisWeekCollections || 0)}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Expenses</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats?.expenses || 0)}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white">Recent Payments</h3>
                <Link href="/accounts/ledger" className="text-sm text-emerald-400 hover:text-emerald-300">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {recentPayments.length > 0 ? (
                  recentPayments.map(payment => (
                    <div key={payment.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{payment.client.name}</p>
                        <p className="text-sm text-slate-400">
                          {formatDateDDMMYYYY(payment.collectedAt)}
                        </p>
                      </div>
                      <p className="text-emerald-400 font-medium">
                        {formatCurrency(payment.grossAmount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    No recent payments
                  </div>
                )}
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white">Top Clients by Revenue</h3>
                <Link href="/accounts/clients" className="text-sm text-emerald-400 hover:text-emerald-300">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {topClients.length > 0 ? (
                  topClients.map((client, index) => (
                    <div key={client.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-500 text-white' :
                          index === 1 ? 'bg-slate-400 text-white' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-white/10 backdrop-blur-sm text-slate-300'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-white">{client.name}</p>
                          <p className={`text-xs ${
                            client.paymentStatus === 'PAID' ? 'text-emerald-400' :
                            client.paymentStatus === 'OVERDUE' ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {client.paymentStatus}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatCurrency(client.monthlyFee || 0)}</p>
                        <p className="text-xs text-slate-400">/month</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    No client data
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/accounts/invoices"
              className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors text-center"
            >
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              <p className="text-blue-400 font-medium">Invoices</p>
            </Link>

            <Link
              href="/accounts/ledger"
              className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors text-center"
            >
              <svg className="w-8 h-8 text-emerald-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-emerald-400 font-medium">Payment Ledger</p>
            </Link>

            <Link
              href="/accounts/contracts"
              className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors text-center"
            >
              <svg className="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-purple-400 font-medium">Contracts</p>
            </Link>

            <Link
              href="/accounts/expenses"
              className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition-colors text-center"
            >
              <svg className="w-8 h-8 text-amber-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-amber-400 font-medium">Expenses</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
