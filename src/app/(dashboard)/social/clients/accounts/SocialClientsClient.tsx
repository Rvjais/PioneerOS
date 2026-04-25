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
  socialManager: string
}

interface Props {
  clients: Client[]
  isManager: boolean
}

export function SocialClientsClient({ clients, isManager }: Props) {
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
      case 'PREMIUM': return 'bg-pink-500/20 text-pink-400'
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
          <h1 className="text-2xl font-bold text-white">My Social Media Clients</h1>
          <p className="text-slate-400 mt-1">
            {isManager ? 'All social media clients' : 'Clients assigned to you'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Total Clients</p>
          <p className="text-2xl font-bold text-white">{clients.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-pink-500 text-white'
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
              ? 'bg-pink-500 text-white'
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

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center text-slate-400">
          No clients assigned to you yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{client.name}</h3>
                  <p className="text-sm text-slate-400">{client.industry}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getTierColor(client.tier)}`}>
                  {client.tier}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="text-sm">
                  <span className="text-slate-400">Manager: </span>
                  <span className="text-slate-300">{client.socialManager}</span>
                </div>
                <span className={`font-semibold text-sm ${getHealthColor(client.healthScore)}`}>
                  {client.healthScore}/100
                </span>
              </div>

              <Link
                href={`/clients/${client.id}`}
                className="mt-4 block w-full text-center px-4 py-2 bg-pink-500/20 text-pink-400 rounded-lg text-sm font-medium hover:bg-pink-500/30 transition-colors"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
