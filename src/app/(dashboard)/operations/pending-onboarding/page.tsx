'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'

interface Service {
  serviceId: string
  name: string
  isSelected: boolean
}

interface Client {
  id: string
  name: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  selectedServices: Service[]
  paymentConfirmedAt: string
  onboardingStatus: string
  entityType: string
  tier: string
  checklist: {
    completionPercentage: number
    status: string
    selectedServices: Service[]
    scopeItems: Array<{ item: string; quantity: number }>
    operationsAssignedAt: string | null
    kickoffScheduledAt: string | null
  } | null
}

export default function PendingOnboardingPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/operations/pending-onboarding')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceBadgeColor = (serviceId: string) => {
    const colors: Record<string, string> = {
      seo: 'bg-blue-500/20 text-blue-400',
      social: 'bg-pink-500/20 text-pink-400',
      ads: 'bg-amber-500/20 text-amber-400',
      web: 'bg-purple-500/20 text-purple-400',
      content: 'bg-emerald-500/20 text-emerald-400',
    }
    return colors[serviceId] || 'bg-slate-900/20 text-slate-400'
  }

  const stats = {
    total: clients.length,
    notStarted: clients.filter(c => !c.checklist || c.checklist.completionPercentage === 0).length,
    inProgress: clients.filter(c => c.checklist && c.checklist.completionPercentage > 0 && c.checklist.completionPercentage < 100).length,
    awaitingKickoff: clients.filter(c => c.checklist && !c.checklist.kickoffScheduledAt).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Pending Onboarding</h1>
        <p className="text-slate-400 mt-1">New clients ready to be onboarded after payment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/10 border border-slate-500/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Pending</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Not Started</p>
          <p className="text-2xl font-bold text-white">{stats.notStarted}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-purple-400 text-sm">Awaiting Kickoff</p>
          <p className="text-2xl font-bold text-white">{stats.awaitingKickoff}</p>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No clients pending onboarding
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {clients.map(client => (
              <div key={client.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-white">{client.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        client.entityType === 'ATZ_MEDAPPZ' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {client.entityType === 'ATZ_MEDAPPZ' ? 'ATZ' : 'BP'}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-900/20 text-slate-400">
                        {client.tier}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {client.selectedServices
                        .filter(s => s.isSelected)
                        .map(service => (
                          <span
                            key={service.serviceId}
                            className={`px-2 py-0.5 text-xs rounded-full ${getServiceBadgeColor(service.serviceId)}`}
                          >
                            {service.name}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{client.contactName}</span>
                      <span>{client.contactEmail}</span>
                      <span>Paid: {formatDateDDMMYYYY(client.paymentConfirmedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Progress */}
                    <div className="text-right">
                      <p className="text-sm text-slate-400 mb-1">Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${client.checklist?.completionPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-white font-medium text-sm">
                          {client.checklist?.completionPercentage || 0}%
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/operations/onboarding/${client.id}`}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Start Onboarding
                    </Link>
                  </div>
                </div>

                {/* Scope Preview */}
                {client.checklist?.scopeItems && client.checklist.scopeItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-slate-400 mb-2">Scope:</p>
                    <div className="flex flex-wrap gap-2">
                      {client.checklist.scopeItems.slice(0, 5).map((item, i) => (
                        <span key={item.item} className="px-2 py-0.5 text-xs bg-white/5 backdrop-blur-sm rounded text-slate-400">
                          {item.item}: {item.quantity}
                        </span>
                      ))}
                      {client.checklist.scopeItems.length > 5 && (
                        <span className="px-2 py-0.5 text-xs bg-white/5 backdrop-blur-sm rounded text-slate-400">
                          +{client.checklist.scopeItems.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
