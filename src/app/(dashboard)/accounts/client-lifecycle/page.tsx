'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Client {
  id: string
  name: string
  lifecycleStage: string
  onboardingStatus: string
  currentPaymentStatus: string
  monthlyFee?: number
  contractSignedAt?: string
  firstPaymentAt?: string
  createdAt: string
}

const stages = [
  { id: 'LEAD_CONVERTED', name: 'Lead Converted', color: 'bg-purple-500', description: 'Client converted from lead' },
  { id: 'ONBOARDING', name: 'Client Onboarding', color: 'bg-blue-500', description: 'Onboarding process started' },
  { id: 'CONTRACT_SIGNED', name: 'Contract Signed', color: 'bg-cyan-500', description: 'SLA/Contract signed' },
  { id: 'PAYMENT_SETUP', name: 'Payment Setup', color: 'bg-amber-500', description: 'Payment method configured' },
  { id: 'FIRST_INVOICE', name: 'First Invoice Sent', color: 'bg-orange-500', description: 'First invoice generated' },
  { id: 'ACTIVE', name: 'Active Client', color: 'bg-emerald-500', description: 'Fully active client' },
  { id: 'RENEWAL', name: 'Renewal Stage', color: 'bg-pink-500', description: 'Contract up for renewal' }
]

export default function ClientLifecyclePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?includeLifecycle=true')
      if (res.ok) {
        const data = await res.json()
        // Map onboarding status to lifecycle stages
        const mapped = data.map((c: Client) => ({
          ...c,
          lifecycleStage: mapOnboardingToLifecycle(c.onboardingStatus, c)
        }))
        setClients(mapped)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const mapOnboardingToLifecycle = (status: string, client: Client): string => {
    if (status === 'COMPLETED' || status === 'ACTIVE') {
      // Check if contract is expiring soon
      if (client.contractSignedAt) {
        const contractDate = new Date(client.contractSignedAt)
        const yearLater = new Date(contractDate)
        yearLater.setFullYear(yearLater.getFullYear() + 1)
        const now = new Date()
        const monthFromNow = new Date()
        monthFromNow.setMonth(monthFromNow.getMonth() + 1)
        if (yearLater <= monthFromNow) return 'RENEWAL'
      }
      return 'ACTIVE'
    }
    if (status === 'AWAITING_PAYMENT') return 'FIRST_INVOICE'
    if (status === 'PAYMENT_SETUP') return 'PAYMENT_SETUP'
    if (status === 'AWAITING_SLA') return 'CONTRACT_SIGNED'
    if (status === 'IN_PROGRESS') return 'ONBOARDING'
    return 'LEAD_CONVERTED'
  }

  const getClientsInStage = (stageId: string) => {
    return clients.filter(c => c.lifecycleStage === stageId)
  }

  const stageStats = stages.map(stage => ({
    ...stage,
    count: getClientsInStage(stage.id).length
  }))

  const selectedClients = selectedStage ? getClientsInStage(selectedStage) : []
  const selectedStageInfo = stages.find(s => s.id === selectedStage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Client Lifecycle</h1>
            <InfoTooltip
              title="Client Lifecycle"
              steps={[
                'Track clients through their financial journey',
                'From lead conversion to active client',
                'Monitor contract renewals',
                'Identify clients needing attention'
              ]}
              tips={[
                'Move clients through stages promptly',
                'Watch for clients stuck in onboarding'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Track where clients are in their financial lifecycle</p>
        </div>
      </div>

      {/* Pipeline View */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {stageStats.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              <button
                onClick={() => setSelectedStage(stage.id === selectedStage ? null : stage.id)}
                className={`flex flex-col items-center min-w-[120px] p-4 rounded-xl transition-all ${
                  selectedStage === stage.id ? 'bg-white/10 backdrop-blur-sm ring-2 ring-white/20' : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-12 h-12 ${stage.color} rounded-full flex items-center justify-center text-white font-bold text-lg mb-2`}>
                  {stage.count}
                </div>
                <span className="text-sm font-medium text-white text-center">{stage.name}</span>
              </button>

              {index < stages.length - 1 && (
                <svg className="w-8 h-8 text-slate-300 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stage Details */}
      {selectedStage && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className={`p-4 ${selectedStageInfo?.color} flex items-center justify-between`}>
            <div>
              <h3 className="text-lg font-bold text-white">{selectedStageInfo?.name}</h3>
              <p className="text-white/80 text-sm">{selectedStageInfo?.description}</p>
            </div>
            <span className="text-2xl font-bold text-white">{selectedClients.length} clients</span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : selectedClients.length > 0 ? (
            <div className="divide-y divide-white/5">
              {selectedClients.map(client => (
                <div key={client.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${selectedStageInfo?.color} rounded-full flex items-center justify-center text-white font-bold`}>
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-sm text-slate-400">
                        {client.monthlyFee ? `Rs. ${client.monthlyFee.toLocaleString()}/month` : 'Fee not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Payment Status</p>
                      <p className={`font-medium ${
                        client.currentPaymentStatus === 'PAID' ? 'text-emerald-400' :
                        client.currentPaymentStatus === 'OVERDUE' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {client.currentPaymentStatus}
                      </p>
                    </div>

                    <Link
                      href={`/clients/${client.id}`}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              No clients in this stage
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Active Clients</p>
          <p className="text-3xl font-bold text-white">{stageStats.find(s => s.id === 'ACTIVE')?.count || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 text-sm">In Onboarding</p>
          <p className="text-3xl font-bold text-white">
            {(stageStats.find(s => s.id === 'LEAD_CONVERTED')?.count || 0) +
             (stageStats.find(s => s.id === 'ONBOARDING')?.count || 0) +
             (stageStats.find(s => s.id === 'CONTRACT_SIGNED')?.count || 0) +
             (stageStats.find(s => s.id === 'PAYMENT_SETUP')?.count || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-xl p-4">
          <p className="text-pink-400 text-sm">Up for Renewal</p>
          <p className="text-3xl font-bold text-white">{stageStats.find(s => s.id === 'RENEWAL')?.count || 0}</p>
        </div>
      </div>
    </div>
  )
}
