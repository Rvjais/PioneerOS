'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface ClientAccount {
  id: string
  name: string
  totalBilling: number
  totalPayments: number
  outstandingBalance: number
  lastPaymentDate?: string
  lastPaymentAmount?: number
  currentPaymentStatus: string
  monthlyFee?: number
}

const statusColors = {
  PAID: 'text-emerald-400',
  PENDING: 'text-amber-400',
  OVERDUE: 'text-red-400',
  PARTIAL: 'text-blue-400'
}

export default function AccountsViewPage() {
  const [accounts, setAccounts] = useState<ClientAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'outstanding' | 'totalBilling'>('outstanding')

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts/client-accounts')
      if (res.ok) {
        const data = await res.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAccounts = accounts
    .filter(acc => acc.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'outstanding') return b.outstandingBalance - a.outstandingBalance
      if (sortBy === 'totalBilling') return b.totalBilling - a.totalBilling
      return 0
    })

  const totals = {
    billing: accounts.reduce((sum, acc) => sum + acc.totalBilling, 0),
    payments: accounts.reduce((sum, acc) => sum + acc.totalPayments, 0),
    outstanding: accounts.reduce((sum, acc) => sum + acc.outstandingBalance, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Client Accounts</h1>
            <InfoTooltip
              title="Client Accounts"
              steps={[
                'Track financial status of all clients',
                'View total billing and payments',
                'Monitor outstanding balances',
                'Quick access to payment history'
              ]}
              tips={[
                'Sort by outstanding to prioritize follow-ups',
                'Check last payment date for dormant accounts'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Client financial accounts overview</p>
        </div>
      </div>

      {/* Totals */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <p className="text-blue-400 text-sm">Total Billing</p>
          <p className="text-3xl font-bold text-white mt-1">
            Rs. {totals.billing.toLocaleString()}
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <p className="text-emerald-400 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-white mt-1">
            Rs. {totals.payments.toLocaleString()}
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <p className="text-amber-400 text-sm">Total Outstanding</p>
          <p className="text-3xl font-bold text-white mt-1">
            Rs. {totals.outstanding.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client..."
            className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="outstanding">Sort by Outstanding</option>
          <option value="totalBilling">Sort by Total Billing</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Accounts Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/4" />
                <div className="h-4 bg-white/10 rounded w-1/6" />
                <div className="h-4 bg-white/10 rounded w-1/6" />
                <div className="h-4 bg-white/10 rounded w-1/6" />
                <div className="h-4 bg-white/10 rounded w-1/6" />
              </div>
            ))}
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No accounts found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Client</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Monthly Fee</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Total Billing</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Total Payments</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Outstanding</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Last Payment</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${account.id}`}
                        className="font-medium text-white hover:text-emerald-400 transition-colors"
                      >
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {account.monthlyFee ? `Rs. ${account.monthlyFee.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-blue-400">
                      Rs. {account.totalBilling.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-emerald-400">
                      Rs. {account.totalPayments.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={account.outstandingBalance > 0 ? 'text-red-400 font-medium' : 'text-emerald-400'}>
                        Rs. {account.outstandingBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {account.lastPaymentDate ? (
                        <div className="text-sm">
                          <p className="text-slate-300">{formatDateDDMMYYYY(account.lastPaymentDate)}</p>
                          {account.lastPaymentAmount && (
                            <p className="text-slate-400">Rs. {account.lastPaymentAmount.toLocaleString()}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${statusColors[account.currentPaymentStatus as keyof typeof statusColors] || 'text-slate-400'}`}>
                        {account.currentPaymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/accounts/ledger?client=${account.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="View Ledger"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/accounts/invoices?client=${account.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="View Invoices"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
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
