'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ClientSatisfaction {
  id: string
  name: string
  accountManager: string
  services: string[]
  satisfactionScore: number
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL'
  lastFeedback: string | null
  escalations: number
  appreciations: number
}

const CLIENTS: ClientSatisfaction[] = [
  { id: '1', name: 'Apollo Hospitals', accountManager: 'Priya Sharma', services: ['SEO', 'Ads', 'Social'], satisfactionScore: 45, status: 'CRITICAL', lastFeedback: 'Delays in deliverables', escalations: 3, appreciations: 0 },
  { id: '2', name: 'MedPlus Clinics', accountManager: 'Rahul Verma', services: ['SEO', 'Web'], satisfactionScore: 62, status: 'AT_RISK', lastFeedback: 'Communication needs improvement', escalations: 2, appreciations: 1 },
  { id: '3', name: 'HealthFirst Labs', accountManager: 'Anita Desai', services: ['Ads', 'Social'], satisfactionScore: 78, status: 'HEALTHY', lastFeedback: 'Good work on campaigns', escalations: 0, appreciations: 2 },
  { id: '4', name: 'CareConnect', accountManager: 'Vikram Singh', services: ['SEO', 'Ads', 'Web'], satisfactionScore: 85, status: 'HEALTHY', lastFeedback: 'Excellent SEO results', escalations: 0, appreciations: 4 },
  { id: '5', name: 'WellnessHub', accountManager: 'Neha Gupta', services: ['Social', 'Web'], satisfactionScore: 55, status: 'AT_RISK', lastFeedback: 'Website updates delayed', escalations: 1, appreciations: 1 },
  { id: '6', name: 'MaxCare Hospital', accountManager: 'Priya Sharma', services: ['SEO', 'Ads'], satisfactionScore: 92, status: 'HEALTHY', lastFeedback: 'Great ROI on ad campaigns', escalations: 0, appreciations: 5 },
]

export default function ClientSatisfactionPage() {
  const [filter, setFilter] = useState<'all' | 'HEALTHY' | 'AT_RISK' | 'CRITICAL'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClients = CLIENTS.filter(client => {
    if (filter !== 'all' && client.status !== filter) return false
    if (searchTerm && !client.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const healthyCount = CLIENTS.filter(c => c.status === 'HEALTHY').length
  const atRiskCount = CLIENTS.filter(c => c.status === 'AT_RISK').length
  const criticalCount = CLIENTS.filter(c => c.status === 'CRITICAL').length
  const avgScore = CLIENTS.length > 0 ? Math.round(CLIENTS.reduce((sum, c) => sum + c.satisfactionScore, 0) / CLIENTS.length) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Client Satisfaction</h1>
          <p className="text-sm text-slate-400">Monitor client health and satisfaction scores</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Avg. Score</p>
          <p className="text-3xl font-bold text-white">{avgScore}%</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Healthy</p>
          <p className="text-3xl font-bold text-green-400">{healthyCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">At Risk</p>
          <p className="text-3xl font-bold text-amber-400">{atRiskCount}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Critical</p>
          <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="flex gap-2">
          {(['all', 'HEALTHY', 'AT_RISK', 'CRITICAL'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
              }`}
            >
              {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Client Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">ACCOUNT MANAGER</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">SERVICES</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">SCORE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ESCALATIONS</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">LAST FEEDBACK</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <p className="font-medium text-white">{client.name}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-slate-300">{client.accountManager}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {client.services.map(service => (
                      <span key={service} className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">
                        {service}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          client.satisfactionScore >= 80 ? 'bg-green-500' :
                          client.satisfactionScore >= 60 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${client.satisfactionScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{client.satisfactionScore}%</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    client.status === 'HEALTHY' ? 'bg-green-500/20 text-green-400' :
                    client.status === 'AT_RISK' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {client.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-medium ${client.escalations > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {client.escalations}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-slate-400 truncate max-w-[200px]">
                    {client.lastFeedback || 'No feedback'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-800 mb-2">Satisfaction Score Calculation</h3>
        <ul className="text-sm text-purple-400 space-y-1">
          <li>- Feedback surveys (40%)</li>
          <li>- Escalation frequency (30%)</li>
          <li>- Appreciation received (20%)</li>
          <li>- Engagement level (10%)</li>
        </ul>
      </div>
    </div>
  )
}
