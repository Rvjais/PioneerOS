'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  industry: string
  tier: string
  status: string
  healthScore: number
  seoExecutive: string
  accountManager: string
}

interface Props {
  clients: Client[]
  isManager: boolean
}

export function SeoClientsClient({ clients, isManager }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const filteredClients = filter === 'all'
    ? clients
    : clients.filter(c => c.tier === filter)

  const tierCounts = {
    ENTERPRISE: clients.filter(c => c.tier === 'ENTERPRISE').length,
    PREMIUM: clients.filter(c => c.tier === 'PREMIUM').length,
    STANDARD: clients.filter(c => c.tier === 'STANDARD').length,
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ENTERPRISE': return 'bg-purple-500/20 text-purple-400'
      case 'PREMIUM': return 'bg-blue-500/20 text-blue-400'
      case 'STANDARD': return 'bg-slate-900/20 text-slate-400'
      default: return 'bg-slate-900/20 text-slate-400'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My SEO Clients</h1>
          <p className="text-slate-400 mt-1">
            {isManager ? 'All SEO clients' : 'Clients assigned to you'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-400">Total Clients</p>
            <p className="text-2xl font-bold text-white">{clients.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-teal-500 text-white'
              : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:bg-white/10'
          }`}
        >
          All ({clients.length})
        </button>
        <button
          onClick={() => setFilter('ENTERPRISE')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'ENTERPRISE'
              ? 'bg-purple-500 text-white'
              : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:bg-white/10'
          }`}
        >
          Enterprise ({tierCounts.ENTERPRISE})
        </button>
        <button
          onClick={() => setFilter('PREMIUM')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'PREMIUM'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:bg-white/10'
          }`}
        >
          Premium ({tierCounts.PREMIUM})
        </button>
        <button
          onClick={() => setFilter('STANDARD')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'STANDARD'
              ? 'bg-slate-900/40 text-white'
              : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:bg-white/10'
          }`}
        >
          Standard ({tierCounts.STANDARD})
        </button>
      </div>

      {/* Client List */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No clients assigned to you yet.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Client</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Industry</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Tier</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">SEO Executive</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Health</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-white/5">
                  <td className="py-4 px-4">
                    <p className="font-medium text-white">{client.name}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-400">{client.industry}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getTierColor(client.tier)}`}>
                      {client.tier}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-300">{client.seoExecutive}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-semibold ${getHealthColor(client.healthScore)}`}>
                      {client.healthScore}/100
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/seo/clients/${client.id}`}
                      className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
