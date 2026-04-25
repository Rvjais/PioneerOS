'use client'

import { useState } from 'react'
import LifecyclePipeline from '@/client/components/clients/LifecyclePipeline'

type Client = {
  id: string
  name: string
  tier: string
  monthlyFee: number | null
  healthScore: number | null
  lifecycleStage: string
  daysInStage: number
  contactName: string | null
  lastActivity: string
}

interface Props {
  clients: Client[]
}

export function LifecycleClient({ clients }: Props) {
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline')

  // Count clients by lifecycle stage - include operational stages as "active"
  const activeStages = ['ACTIVE', 'RETENTION', 'WON']
  const atRiskStages = ['AT_RISK']

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => activeStages.includes(c.lifecycleStage)).length,
    atRiskClients: clients.filter((c) => atRiskStages.includes(c.lifecycleStage)).length,
    totalMRR: clients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0),
    avgHealthScore: clients.filter((c) => c.healthScore !== null).length > 0
      ? Math.round(
          clients.filter((c) => c.healthScore !== null).reduce((sum, c) => sum + (c.healthScore || 0), 0) /
          clients.filter((c) => c.healthScore !== null).length
        )
      : 0,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Lifecycle</h1>
          <p className="text-slate-400 mt-1">Track and manage client journey stages</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'pipeline'
                ? 'bg-blue-600 text-white'
                : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Pipeline
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'glass-card border border-white/10 text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
          <p className="text-sm text-slate-400">Total Clients</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{stats.activeClients}</p>
          <p className="text-sm text-slate-400">Active Clients</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-orange-600">{stats.atRiskClients}</p>
          <p className="text-sm text-slate-400">At Risk</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalMRR)}</p>
          <p className="text-sm text-slate-400">Total MRR</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-purple-400">{stats.avgHealthScore}%</p>
          <p className="text-sm text-slate-400">Avg Health Score</p>
        </div>
      </div>

      {/* Pipeline or List View */}
      {view === 'pipeline' ? (
        <div className="glass-card rounded-xl border border-white/10 p-4 overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300 font-medium">
                Sales is everyone's role - keep client statuses updated!
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag cards between stages or click the edit icon to update details
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Drag to move
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Hover to edit
              </span>
            </div>
          </div>
          <LifecyclePipeline clients={clients} />
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-white/10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Tier</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Stage</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">MRR</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Health</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Days in Stage</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-300">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No clients yet
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div>
                        <a href={`/clients/${client.id}`} className="font-medium text-white hover:text-blue-400">
                          {client.name}
                        </a>
                        {client.contactName && (
                          <p className="text-xs text-slate-400">{client.contactName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        client.tier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
                        client.tier === 'GROWTH' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-800/50 text-slate-200'
                      }`}>
                        {client.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        client.lifecycleStage === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                        client.lifecycleStage === 'AT_RISK' ? 'bg-orange-500/20 text-orange-400' :
                        client.lifecycleStage === 'CHURNED' ? 'bg-red-500/20 text-red-400' :
                        client.lifecycleStage === 'RETENTION' ? 'bg-purple-500/20 text-purple-400' :
                        client.lifecycleStage === 'ONBOARDING' ? 'bg-blue-500/20 text-blue-400' :
                        client.lifecycleStage === 'WON' ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-800/50 text-slate-200'
                      }`}>
                        {client.lifecycleStage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {client.monthlyFee ? formatCurrency(client.monthlyFee) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {client.healthScore !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                client.healthScore >= 80 ? 'bg-green-500' :
                                client.healthScore >= 60 ? 'bg-yellow-500' :
                                client.healthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${client.healthScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{client.healthScore}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{client.daysInStage} days</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{client.lastActivity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
