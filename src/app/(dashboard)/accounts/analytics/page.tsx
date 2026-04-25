'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  services: string | null
  serviceSegment: string
  billingType: string
  monthlyFee: number | null
  currentPaymentStatus: string | null
  status: string
  isLost: boolean
}

interface ServiceBreakdown {
  service: string
  clients: number
  revenue: number
  pending: number
  collected: number
}

export default function AccountsAnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setError(null)
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : data.clients || [])
      } else {
        setError('Failed to load clients. Please try again.')
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err)
      setError('Failed to load clients. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const parseServices = (services: string | null): string[] => {
    if (!services) return []
    try {
      return JSON.parse(services)
    } catch {
      return []
    }
  }

  // Calculate service breakdown
  const activeClients = clients.filter(c => c.status === 'ACTIVE' && !c.isLost)
  const serviceMap: Record<string, ServiceBreakdown> = {}

  const services = ['SEO', 'SM', 'ADS', 'WEB', 'GMB', 'AMC', 'AI_TOOLS']
  services.forEach(service => {
    const serviceClients = activeClients.filter(c => {
      const clientServices = parseServices(c.services)
      if (service === 'AMC') return c.serviceSegment === 'AMC'
      if (service === 'AI_TOOLS') return c.serviceSegment === 'AI_TOOLS'
      return clientServices.includes(service)
    })

    const collected = serviceClients
      .filter(c => c.currentPaymentStatus === 'DONE')
      .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

    const pending = serviceClients
      .filter(c => c.currentPaymentStatus !== 'DONE')
      .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

    serviceMap[service] = {
      service,
      clients: serviceClients.length,
      revenue: collected + pending,
      collected,
      pending,
    }
  })

  // Calculate segment breakdown
  const segments = [
    { key: 'MARKETING', label: 'Marketing Retainers', color: 'blue' },
    { key: 'WEBSITE', label: 'Website Projects', color: 'purple' },
    { key: 'AMC', label: 'AMC', color: 'cyan' },
    { key: 'AI_TOOLS', label: 'AI Tools', color: 'amber' },
  ]

  const segmentData = segments.map(seg => {
    const segClients = activeClients.filter(c => c.serviceSegment === seg.key)
    const collected = segClients
      .filter(c => c.currentPaymentStatus === 'DONE')
      .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)
    const pending = segClients
      .filter(c => c.currentPaymentStatus !== 'DONE')
      .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

    return {
      ...seg,
      clients: segClients.length,
      revenue: collected + pending,
      collected,
      pending,
    }
  })

  // Calculate billing type breakdown
  const billingTypes = [
    { key: 'MONTHLY', label: 'Monthly' },
    { key: 'QUARTERLY', label: 'Quarterly' },
    { key: 'ANNUAL', label: 'Annual' },
    { key: 'ONE_TIME', label: 'One-time' },
  ]

  const billingData = billingTypes.map(bt => {
    const btClients = activeClients.filter(c => c.billingType === bt.key)
    return {
      ...bt,
      clients: btClients.length,
      revenue: btClients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0),
    }
  })

  // Total calculations
  const totalRevenue = activeClients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0)
  const totalCollected = activeClients
    .filter(c => c.currentPaymentStatus === 'DONE')
    .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)
  const totalPending = totalRevenue - totalCollected
  const lostDues = clients
    .filter(c => c.isLost)
    .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); fetchClients() }} className="text-red-400 hover:text-red-300 text-sm font-medium underline">
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Revenue breakdown by service, segment, and billing type</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/accounts/manage"
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Manage Clients
          </Link>
          <Link
            href="/accounts"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <p className="text-emerald-100 text-sm">Total Expected</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-emerald-200 text-xs mt-2">{activeClients.length} active clients</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <p className="text-green-100 text-sm">Collected</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalCollected)}</p>
          <p className="text-green-200 text-xs mt-2">
            {Math.round((totalCollected / totalRevenue) * 100) || 0}% collection rate
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <p className="text-amber-100 text-sm">Pending</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalPending)}</p>
          <p className="text-amber-200 text-xs mt-2">
            {activeClients.filter(c => c.currentPaymentStatus !== 'DONE').length} clients
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
          <p className="text-red-100 text-sm">Lost Client Dues</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(lostDues)}</p>
          <p className="text-red-200 text-xs mt-2">
            {clients.filter(c => c.isLost).length} lost clients
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Service</h3>
          <div className="space-y-4">
            {Object.values(serviceMap)
              .filter(s => s.clients > 0)
              .sort((a, b) => b.revenue - a.revenue)
              .map((service) => (
                <div key={service.service} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        service.service === 'SEO' ? 'bg-emerald-500/20 text-emerald-400' :
                        service.service === 'SM' ? 'bg-blue-500/20 text-blue-400' :
                        service.service === 'ADS' ? 'bg-amber-500/20 text-amber-400' :
                        service.service === 'WEB' ? 'bg-purple-500/20 text-purple-400' :
                        service.service === 'GMB' ? 'bg-red-500/20 text-red-400' :
                        service.service === 'AMC' ? 'bg-cyan-100 text-cyan-700' :
                        'bg-slate-800/50 text-slate-200'
                      }`}>
                        {service.service}
                      </span>
                      <span className="text-sm text-slate-300">{service.clients} clients</span>
                    </div>
                    <span className="font-semibold text-white">{formatCurrency(service.revenue)}</span>
                  </div>
                  <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                      style={{ width: `${(service.collected / service.revenue) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Collected: {formatCurrency(service.collected)}</span>
                    <span>Pending: {formatCurrency(service.pending)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Revenue by Segment */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Segment</h3>
          <div className="space-y-4">
            {segmentData
              .filter(s => s.clients > 0)
              .sort((a, b) => b.revenue - a.revenue)
              .map((segment) => (
                <div key={segment.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded bg-${segment.color}-100 text-${segment.color}-700`}>
                        {segment.label}
                      </span>
                      <span className="text-sm text-slate-300">{segment.clients} clients</span>
                    </div>
                    <span className="font-semibold text-white">{formatCurrency(segment.revenue)}</span>
                  </div>
                  <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${segment.color}-400 to-${segment.color}-500`}
                      style={{ width: `${(segment.collected / segment.revenue) * 100 || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Collected: {formatCurrency(segment.collected)}</span>
                    <span>Pending: {formatCurrency(segment.pending)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Billing Type Distribution */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {billingData.map((bt) => (
            <div key={bt.key} className={`p-4 rounded-xl border ${
              bt.key === 'MONTHLY' ? 'bg-blue-500/10 border-blue-200' :
              bt.key === 'QUARTERLY' ? 'bg-purple-500/10 border-purple-200' :
              bt.key === 'ANNUAL' ? 'bg-emerald-500/10 border-emerald-500/30' :
              'bg-amber-500/10 border-amber-200'
            }`}>
              <p className="text-sm font-medium text-slate-300">{bt.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{bt.clients}</p>
              <p className="text-sm text-slate-400 mt-1">{formatCurrency(bt.revenue)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Economics Note */}
      <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Coming Soon: Unit Economics</h3>
        <p className="text-amber-400 text-sm">
          Once employee salaries and department expenses are configured, this page will show:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-amber-400">
          <li>• Cost per department (salaries + freelancers + tools)</li>
          <li>• ROI per service line</li>
          <li>• Profit margin per client</li>
          <li>• Break-even analysis</li>
        </ul>
        <Link
          href="/finance/expenses"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-500/20 text-amber-800 rounded-lg hover:bg-amber-200 text-sm font-medium"
        >
          Configure Expenses
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
