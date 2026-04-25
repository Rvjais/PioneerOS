'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface ClientRetention {
  id: string
  name: string
  status: 'ACTIVE' | 'AT_RISK' | 'CHURNED' | 'RECOVERED'
  tenure: number // months
  monthlyValue: number
  services: string[]
  lastRenewal: string
  nextRenewal: string
  satisfactionScore: number
  accountManager: string
}

const CLIENTS: ClientRetention[] = [
  { id: '1', name: 'Apollo Hospitals', status: 'AT_RISK', tenure: 18, monthlyValue: 150000, services: ['SEO', 'Ads', 'Social'], lastRenewal: '2023-09-01', nextRenewal: '2024-09-01', satisfactionScore: 45, accountManager: 'Priya Sharma' },
  { id: '2', name: 'MaxCare Hospital', status: 'ACTIVE', tenure: 24, monthlyValue: 200000, services: ['SEO', 'Ads'], lastRenewal: '2024-01-01', nextRenewal: '2025-01-01', satisfactionScore: 92, accountManager: 'Rahul Verma' },
  { id: '3', name: 'MedPlus Clinics', status: 'AT_RISK', tenure: 12, monthlyValue: 80000, services: ['SEO', 'Web'], lastRenewal: '2023-03-01', nextRenewal: '2024-03-01', satisfactionScore: 62, accountManager: 'Anita Desai' },
  { id: '4', name: 'HealthFirst Labs', status: 'ACTIVE', tenure: 8, monthlyValue: 60000, services: ['Ads', 'Social'], lastRenewal: '2023-07-01', nextRenewal: '2024-07-01', satisfactionScore: 78, accountManager: 'Vikram Singh' },
  { id: '5', name: 'CareConnect', status: 'RECOVERED', tenure: 14, monthlyValue: 120000, services: ['SEO', 'Ads', 'Web'], lastRenewal: '2023-12-01', nextRenewal: '2024-12-01', satisfactionScore: 85, accountManager: 'Neha Gupta' },
  { id: '6', name: 'WellnessHub', status: 'CHURNED', tenure: 6, monthlyValue: 45000, services: ['Social', 'Web'], lastRenewal: '2023-06-01', nextRenewal: '-', satisfactionScore: 35, accountManager: 'Priya Sharma' },
]

export default function ClientRetentionPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredClients = filter === 'all'
    ? CLIENTS
    : CLIENTS.filter(c => c.status === filter)

  const activeCount = CLIENTS.filter(c => c.status === 'ACTIVE').length
  const atRiskCount = CLIENTS.filter(c => c.status === 'AT_RISK').length
  const churnedCount = CLIENTS.filter(c => c.status === 'CHURNED').length
  const recoveredCount = CLIENTS.filter(c => c.status === 'RECOVERED').length

  const totalMRR = CLIENTS.filter(c => c.status !== 'CHURNED').reduce((sum, c) => sum + c.monthlyValue, 0)
  const retentionRate = CLIENTS.length > 0 ? ((CLIENTS.length - churnedCount) / CLIENTS.length * 100).toFixed(0) : '0'

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`
    }
    return `${(amount / 1000).toFixed(0)}K`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Retention</h1>
            <p className="text-emerald-100">Monitor client lifecycle and prevent churn</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Retention Rate</p>
              <p className="text-3xl font-bold">{retentionRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Active MRR</p>
              <p className="text-3xl font-bold">{formatCurrency(totalMRR)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setFilter(filter === 'ACTIVE' ? 'all' : 'ACTIVE')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'ACTIVE' ? 'border-green-500 bg-green-500/10' : 'border-white/10 glass-card hover:border-green-300'
          }`}
        >
          <p className="text-sm text-slate-400">Active</p>
          <p className="text-3xl font-bold text-green-400">{activeCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'AT_RISK' ? 'all' : 'AT_RISK')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'AT_RISK' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <p className="text-sm text-slate-400">At Risk</p>
          <p className="text-3xl font-bold text-amber-400">{atRiskCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'RECOVERED' ? 'all' : 'RECOVERED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'RECOVERED' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 glass-card hover:border-blue-300'
          }`}
        >
          <p className="text-sm text-slate-400">Recovered</p>
          <p className="text-3xl font-bold text-blue-400">{recoveredCount}</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'CHURNED' ? 'all' : 'CHURNED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'CHURNED' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <p className="text-sm text-slate-400">Churned</p>
          <p className="text-3xl font-bold text-red-400">{churnedCount}</p>
        </button>
      </div>

      {/* Client Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TENURE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">MONTHLY VALUE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">SATISFACTION</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">NEXT RENEWAL</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">ACCOUNT MANAGER</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <p className="font-medium text-white">{client.name}</p>
                  <div className="flex gap-1 mt-1">
                    {client.services.map(service => (
                      <span key={service} className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">
                        {service}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                    client.status === 'AT_RISK' ? 'bg-amber-500/20 text-amber-400' :
                    client.status === 'RECOVERED' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {client.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-medium text-white">{client.tenure} mo</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-medium text-white">{formatCurrency(client.monthlyValue)}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-12 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          client.satisfactionScore >= 80 ? 'bg-green-500' :
                          client.satisfactionScore >= 60 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${client.satisfactionScore}%` }}
                      />
                    </div>
                    <span className="text-sm">{client.satisfactionScore}%</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">
                    {client.nextRenewal !== '-'
                      ? formatDateDDMMYYYY(client.nextRenewal)
                      : '-'
                    }
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-slate-300">{client.accountManager}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Retention Tips */}
      <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4">
        <h3 className="font-semibold text-emerald-800 mb-3">Retention Strategies</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-emerald-700">
          <div>
            <p className="font-medium mb-1">For At-Risk Clients</p>
            <ul className="space-y-1">
              <li>- Schedule urgent review meeting</li>
              <li>- Identify pain points</li>
              <li>- Offer value-adds</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">For Active Clients</p>
            <ul className="space-y-1">
              <li>- Regular check-ins</li>
              <li>- Quarterly business reviews</li>
              <li>- Proactive reporting</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">For Churned Clients</p>
            <ul className="space-y-1">
              <li>- Exit interview analysis</li>
              <li>- Win-back campaigns</li>
              <li>- Learn and improve</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
