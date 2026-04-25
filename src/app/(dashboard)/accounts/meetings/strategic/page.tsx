'use client'

import { useState, useEffect } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface StrategicMetrics {
  revenueGrowth: number
  previousPeriodRevenue: number
  currentPeriodRevenue: number
  revenueByService: Array<{ service: string; amount: number; percentage: number }>
  clientRetention: number
  clientsLost: number
  clientsGained: number
  contractsRenewed: number
  contractsExpiring: number
  avgLifetimeValue: number
  topClients: Array<{ name: string; revenue: number; status: string }>
}

export default function StrategicMeetingPage() {
  const [metrics, setMetrics] = useState<StrategicMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'quarter' | 'year'>('quarter')

  useEffect(() => {
    fetchMetrics()
  }, [selectedPeriod])

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`/api/accounts/meetings/strategic?period=${selectedPeriod}`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
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
            <h1 className="text-2xl font-bold text-white">Strategic Meeting</h1>
            <InfoTooltip
              title="Strategic Meeting"
              steps={[
                'Long-term business performance review',
                'Revenue growth and trends',
                'Client retention analysis',
                'Strategic planning insights'
              ]}
              tips={[
                'Hold quarterly with leadership',
                'Focus on big picture trends'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Long-term business performance</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('quarter')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'quarter'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'year'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white'
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Revenue Growth */}
          <div className={`rounded-2xl p-6 border ${
            (metrics?.revenueGrowth || 0) >= 0
              ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/30'
              : 'bg-gradient-to-r from-red-600/20 to-rose-600/20 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${(metrics?.revenueGrowth || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Revenue Growth ({selectedPeriod === 'quarter' ? 'QoQ' : 'YoY'})
                </p>
                <p className="text-5xl font-bold text-white">
                  {(metrics?.revenueGrowth || 0) >= 0 ? '+' : ''}{metrics?.revenueGrowth || 0}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Current Period</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics?.currentPeriodRevenue || 0)}</p>
                <p className="text-sm text-slate-400 mt-2">Previous Period</p>
                <p className="text-xl text-slate-300">{formatCurrency(metrics?.previousPeriodRevenue || 0)}</p>
              </div>
            </div>
          </div>

          {/* Key Strategic Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 text-sm">Client Retention</p>
              <p className="text-3xl font-bold text-white">{metrics?.clientRetention || 0}%</p>
              <p className="text-xs text-slate-400 mt-1">
                {metrics?.clientsLost || 0} lost / {metrics?.clientsGained || 0} gained
              </p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-400 text-sm">Contracts Renewed</p>
              <p className="text-3xl font-bold text-white">{metrics?.contractsRenewed || 0}</p>
              <p className="text-xs text-slate-400 mt-1">{metrics?.contractsExpiring || 0} expiring soon</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-amber-400 text-sm">Avg Lifetime Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(metrics?.avgLifetimeValue || 0)}</p>
              <p className="text-xs text-slate-400 mt-1">Per client</p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <p className="text-cyan-400 text-sm">Net Client Growth</p>
              <p className="text-3xl font-bold text-white">
                {(metrics?.clientsGained || 0) - (metrics?.clientsLost || 0) >= 0 ? '+' : ''}
                {(metrics?.clientsGained || 0) - (metrics?.clientsLost || 0)}
              </p>
              <p className="text-xs text-slate-400 mt-1">This {selectedPeriod}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue by Service */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Revenue by Service</h3>
              {metrics?.revenueByService && metrics.revenueByService.length > 0 ? (
                <div className="space-y-4">
                  {metrics.revenueByService.map((service, index) => (
                    <div key={service.service}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{service.service}</span>
                        <span className="text-white font-medium">{formatCurrency(service.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              index === 0 ? 'bg-emerald-500' :
                              index === 1 ? 'bg-blue-500' :
                              index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${service.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-10">{service.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">No data available</p>
              )}
            </div>

            {/* Top Clients */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Top Revenue Clients</h3>
              {metrics?.topClients && metrics.topClients.length > 0 ? (
                <div className="space-y-3">
                  {metrics.topClients.map((client, index) => (
                    <div key={client.name} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-500 text-white' :
                          index === 1 ? 'bg-slate-400 text-white' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-white/10 backdrop-blur-sm text-slate-300'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-white">{client.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatCurrency(client.revenue)}</p>
                        <p className={`text-xs ${
                          client.status === 'PAID' ? 'text-emerald-400' :
                          client.status === 'OVERDUE' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {client.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* Strategic Meeting Agenda */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Strategic Meeting Agenda</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm">1</span>
                  <span>Revenue growth analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm">2</span>
                  <span>Revenue by service breakdown</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm">3</span>
                  <span>Client retention and churn</span>
                </li>
              </ol>
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm">4</span>
                  <span>Contract renewals pipeline</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm">5</span>
                  <span>Lifetime value optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm">6</span>
                  <span>Strategic initiatives for next {selectedPeriod}</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Key Strategic Insights</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <p className="text-4xl font-bold text-indigo-400">
                  {metrics?.clientRetention || 0}%
                </p>
                <p className="text-sm text-slate-400">Client Retention</p>
                <p className="text-xs text-slate-400 mt-1">
                  {(metrics?.clientRetention || 0) >= 90 ? 'Excellent' :
                   (metrics?.clientRetention || 0) >= 75 ? 'Good - Room to improve' : 'Needs attention'}
                </p>
              </div>
              <div className="text-center p-4">
                <p className="text-4xl font-bold text-purple-400">
                  {metrics?.contractsRenewed || 0}/{(metrics?.contractsRenewed || 0) + (metrics?.contractsExpiring || 0)}
                </p>
                <p className="text-sm text-slate-400">Renewal Rate</p>
                <p className="text-xs text-slate-400 mt-1">
                  {metrics?.contractsExpiring} contracts need attention
                </p>
              </div>
              <div className="text-center p-4">
                <p className="text-4xl font-bold text-cyan-400">
                  {formatCurrency(metrics?.avgLifetimeValue || 0)}
                </p>
                <p className="text-sm text-slate-400">Avg Client LTV</p>
                <p className="text-xs text-slate-400 mt-1">
                  Target: Increase by 20% next {selectedPeriod}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
