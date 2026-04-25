'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface Contract {
  id: string
  type: string
  startDate: string
  endDate: string
  renewalDate: string | null
  amount: number
  status: string
  autoRenew: boolean
  notes: string | null
  domainName: string | null
  domainRegistrar: string | null
  domainExpiryDate: string | null
  serverProvider: string | null
  serverExpiryDate: string | null
  serverPlan: string | null
  billingCycle: string
  nextBillingDate: string | null
  daysUntilDomainExpiry: number | null
  daysUntilServerExpiry: number | null
  daysUntilContractEnd: number
  urgency: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'OK'
}

interface ContractsData {
  contracts: Contract[]
  expiredContracts: Contract[]
  summary: {
    total: number
    active: number
    expiring: number
    expired: number
  }
}

const contractTypeLabels: Record<string, string> = {
  MONTHLY_MAINTENANCE: 'Maintenance',
  ANNUAL_HOSTING: 'Hosting',
  DOMAIN_RENEWAL: 'Domain',
}

const urgencyColors: Record<string, { bg: string; text: string; border: string }> = {
  EXPIRED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-200' },
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-200' },
  WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-200' },
  OK: { bg: 'glass-card', text: 'text-slate-300', border: 'border-white/10' },
}

function getDaysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `${days} days remaining`
}

export default function ContractsPage() {
  const [data, setData] = useState<ContractsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/web-portal/contracts')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
      setError('Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  const filteredContracts = data?.contracts.filter(c =>
    searchQuery === '' ||
    (c.domainName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.serverProvider?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contractTypeLabels[c.type] || c.type).toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const filteredExpired = data?.expiredContracts.filter(c =>
    searchQuery === '' ||
    (c.domainName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.serverProvider?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contractTypeLabels[c.type] || c.type).toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-slate-800/50 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-stat-${i}`} className="glass-card rounded-xl border border-white/10 p-5">
              <div className="h-3 w-24 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-8 w-12 bg-slate-800/50 rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>
        <div className="glass-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <div className="h-5 w-40 bg-slate-800/50 rounded animate-pulse" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-section-${i}`} className="p-6 border-b border-white/10 last:border-0">
              <div className="h-5 w-32 bg-slate-800/50 rounded animate-pulse" />
              <div className="grid grid-cols-3 gap-4 mt-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="bg-slate-800/30 rounded-lg p-3 space-y-2">
                    <div className="h-3 w-16 bg-slate-800/50 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-slate-800/50 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchContracts(); }} className="mt-4 text-red-400 underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/portal/web" className="text-slate-400 hover:text-teal-600">Dashboard</Link>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-white font-medium">Contracts & Renewals</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Contracts & Renewals</h1>
        <p className="text-slate-400 mt-1">Track your domain, hosting, and maintenance contracts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <span className="text-sm text-slate-400">Total Contracts</span>
          <p className="text-2xl font-bold text-white mt-1">{data?.summary.total || 0}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <span className="text-sm text-slate-400">Active</span>
          <p className="text-2xl font-bold text-green-400 mt-1">{data?.summary.active || 0}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <span className="text-sm text-slate-400">Expiring Soon</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{data?.summary.expiring || 0}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <span className="text-sm text-slate-400">Expired</span>
          <p className="text-2xl font-bold text-red-400 mt-1">{data?.summary.expired || 0}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contracts by domain, provider, or type..."
          className="w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-lg bg-slate-900/40 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Active Contracts */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Active Contracts</h2>
        </div>

        {filteredContracts.length > 0 ? (
          <div className="divide-y divide-white/10">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className={`p-6 ${urgencyColors[contract.urgency].bg}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-white">
                        {contractTypeLabels[contract.type] || contract.type}
                      </span>
                      {contract.autoRenew && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                          Auto-renew
                        </span>
                      )}
                      {contract.urgency !== 'OK' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          contract.urgency === 'EXPIRED' || contract.urgency === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {contract.urgency === 'EXPIRED' ? 'Expired' :
                           contract.urgency === 'CRITICAL' ? 'Critical' : 'Expiring Soon'}
                        </span>
                      )}
                    </div>

                    {/* Contract Details */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Domain Info */}
                      {contract.domainName && (
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                          <span className="text-xs text-slate-400 uppercase tracking-wide">Domain</span>
                          <p className="font-medium text-white mt-1">{contract.domainName}</p>
                          {contract.domainRegistrar && (
                            <p className="text-sm text-slate-400">{contract.domainRegistrar}</p>
                          )}
                          {contract.daysUntilDomainExpiry !== null && (
                            <p className={`text-sm mt-1 ${
                              contract.daysUntilDomainExpiry <= 7 ? 'text-red-400' :
                              contract.daysUntilDomainExpiry <= 30 ? 'text-amber-400' :
                              'text-green-400'
                            }`}>
                              {getDaysLabel(contract.daysUntilDomainExpiry)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Server Info */}
                      {contract.serverProvider && (
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                          <span className="text-xs text-slate-400 uppercase tracking-wide">Hosting</span>
                          <p className="font-medium text-white mt-1">{contract.serverProvider}</p>
                          {contract.serverPlan && (
                            <p className="text-sm text-slate-400">{contract.serverPlan} Plan</p>
                          )}
                          {contract.daysUntilServerExpiry !== null && (
                            <p className={`text-sm mt-1 ${
                              contract.daysUntilServerExpiry <= 7 ? 'text-red-400' :
                              contract.daysUntilServerExpiry <= 30 ? 'text-amber-400' :
                              'text-green-400'
                            }`}>
                              {getDaysLabel(contract.daysUntilServerExpiry)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Contract Period */}
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Contract Period</span>
                        <p className="font-medium text-white mt-1">
                          {formatDateDDMMYYYY(contract.startDate)} - {formatDateDDMMYYYY(contract.endDate)}
                        </p>
                        <p className="text-sm text-slate-400">{contract.billingCycle} billing</p>
                        <p className={`text-sm mt-1 ${
                          contract.daysUntilContractEnd <= 7 ? 'text-red-400' :
                          contract.daysUntilContractEnd <= 30 ? 'text-amber-400' :
                          'text-green-400'
                        }`}>
                          {getDaysLabel(contract.daysUntilContractEnd)}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="mt-4 flex items-center gap-4">
                      <span className="text-slate-400">Amount:</span>
                      <span className="text-lg font-semibold text-white">
                        {contract.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                      </span>
                      <span className="text-slate-400">/{contract.billingCycle.toLowerCase()}</span>
                    </div>

                    {contract.notes && (
                      <p className="text-sm text-slate-400 mt-3">{contract.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-1">No active contracts</h3>
            <p className="text-slate-400">You don't have any active contracts at the moment</p>
          </div>
        )}
      </div>

      {/* Expired/Cancelled Contracts */}
      {filteredExpired.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Past Contracts</h2>
          </div>
          <div className="divide-y divide-white/10">
            {filteredExpired.map((contract) => (
              <div key={contract.id} className="p-6 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white">
                      {contractTypeLabels[contract.type] || contract.type}
                    </span>
                    <span className="text-sm text-slate-400 ml-2">
                      {formatDateDDMMYYYY(contract.startDate)} - {formatDateDDMMYYYY(contract.endDate)}
                    </span>
                  </div>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    contract.status === 'EXPIRED' ? 'bg-red-500/20 text-red-400' :
                    contract.status === 'CANCELLED' ? 'bg-slate-800/50 text-slate-300' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {contract.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-teal-500/10 rounded-xl border border-teal-500/20 p-6">
        <div className="flex items-start gap-4">
          <svg className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-teal-300">Need to renew?</h3>
            <p className="text-teal-200/80 text-sm mt-1">
              Contact our team to renew your domain, hosting, or maintenance contracts.
              We'll handle the technical details and ensure uninterrupted service.
            </p>
            <a
              href="/portal/web/support"
              className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-teal-400 hover:text-teal-300"
            >
              Contact Support
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
