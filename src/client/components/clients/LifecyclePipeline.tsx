'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

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

type Stage = {
  id: string
  name: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}

const stages: Stage[] = [
  { id: 'LEAD', name: 'Lead', color: 'text-slate-200', bgColor: 'bg-slate-800/50', borderColor: 'border-white/20', description: 'Initial contact' },
  { id: 'WON', name: 'Won', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-300', description: 'Deal closed' },
  { id: 'ONBOARDING', name: 'Onboarding', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-300', description: 'Setup in progress' },
  { id: 'ACTIVE', name: 'Active', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30', description: 'Delivering services' },
  { id: 'RETENTION', name: 'Retention', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-300', description: 'Renewal focus' },
  { id: 'AT_RISK', name: 'At Risk', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30', description: 'Needs attention' },
  { id: 'CHURNED', name: 'Churned', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-300', description: 'Lost client' },
]

const tierColors: Record<string, string> = {
  ENTERPRISE: 'bg-purple-500/20 text-purple-400',
  GROWTH: 'bg-blue-500/20 text-blue-400',
  STARTER: 'bg-slate-800/50 text-slate-200',
}

const TIERS = ['STARTER', 'GROWTH', 'ENTERPRISE']

type EditingClient = {
  id: string
  name: string
  tier: string
  contactName: string | null
  monthlyFee: number | null
  healthScore: number | null
}

export default function LifecyclePipeline({ clients: initialClients }: { clients: Client[] }) {
  const [clients, setClients] = useState(initialClients)
  const [draggingClient, setDraggingClient] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingClient, setEditingClient] = useState<EditingClient | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      return () => container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [])

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const getClientsForStage = (stageId: string) => {
    return clients.filter((c) => c.lifecycleStage === stageId)
  }

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    setDraggingClient(clientId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', clientId)
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDragEnd = () => {
    setDraggingClient(null)
    setDragOverStage(null)
  }

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault()
    setDragOverStage(null)

    if (!draggingClient) return

    const client = clients.find((c) => c.id === draggingClient)
    if (!client || client.lifecycleStage === newStage) {
      setDraggingClient(null)
      return
    }

    // Optimistic update
    setClients(prev => prev.map(c =>
      c.id === draggingClient ? { ...c, lifecycleStage: newStage, daysInStage: 0 } : c
    ))

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/clients/${draggingClient}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!response.ok) {
        // Revert on error
        setClients(initialClients)
        throw new Error('Failed to update stage')
      }
    } catch (error) {
      console.error('Error updating lifecycle stage:', error)
      toast.error('Failed to update client stage')
    } finally {
      setIsUpdating(false)
      setDraggingClient(null)
    }
  }

  const openEditModal = (client: Client) => {
    setEditingClient({
      id: client.id,
      name: client.name,
      tier: client.tier,
      contactName: client.contactName,
      monthlyFee: client.monthlyFee,
      healthScore: client.healthScore,
    })
  }

  const saveClientEdit = async () => {
    if (!editingClient) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingClient.name,
          tier: editingClient.tier,
          contactName: editingClient.contactName,
          monthlyFee: editingClient.monthlyFee,
          healthScore: editingClient.healthScore,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update client')
      }

      // Update local state
      setClients(prev => prev.map(c =>
        c.id === editingClient.id ? {
          ...c,
          name: editingClient.name,
          tier: editingClient.tier,
          contactName: editingClient.contactName,
          monthlyFee: editingClient.monthlyFee,
          healthScore: editingClient.healthScore,
        } : c
      ))

      setEditingClient(null)
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error('Failed to update client')
    } finally {
      setIsSaving(false)
    }
  }

  const getHealthColor = (score: number | null) => {
    if (score === null) return 'bg-white/10'
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Scroll Navigation Buttons */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={`p-2 rounded-full glass-card shadow-none border border-white/10 transition-all ${
            canScrollLeft ? 'hover:bg-slate-900/40 opacity-100' : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={`p-2 rounded-full glass-card shadow-none border border-white/10 transition-all ${
            canScrollRight ? 'hover:bg-slate-900/40 opacity-100' : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Pipeline Container with proper scrolling */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 px-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {stages.map((stage) => {
            const stageClients = getClientsForStage(stage.id)
            const totalValue = stageClients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0)
            const isDropTarget = dragOverStage === stage.id

            return (
              <div
                key={stage.id}
                className="w-72 flex-shrink-0"
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className={`p-3 rounded-t-lg border-2 ${stage.borderColor} ${stage.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${stage.color}`}>{stage.name}</span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-white/70 backdrop-blur-sm rounded-full">
                        {stageClients.length}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                  <p className="text-xs font-medium text-slate-300 mt-1">
                    Total: {formatCurrency(totalValue)}/mo
                  </p>
                </div>

                {/* Client Cards */}
                <div
                  className={`min-h-[400px] p-2 rounded-b-lg border-2 border-t-0 ${stage.borderColor} transition-colors ${
                    isDropTarget ? 'bg-blue-500/10 ring-2 ring-blue-400 ring-inset' : 'bg-slate-900/40'
                  }`}
                >
                  <div className="space-y-2">
                    {stageClients.map((client) => (
                      <div
                        key={client.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, client.id)}
                        onDragEnd={handleDragEnd}
                        className={`glass-card rounded-lg border border-white/10 p-3 cursor-grab active:cursor-grabbing hover:shadow-none transition-all group ${
                          draggingClient === client.id ? 'opacity-50 scale-95 rotate-1' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/clients/${client.id}`}
                            className="font-medium text-white hover:text-blue-400 text-sm line-clamp-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {client.name}
                          </Link>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditModal(client)
                              }}
                              className="p-1 text-slate-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Edit client"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${tierColors[client.tier]}`}>
                              {client.tier}
                            </span>
                          </div>
                        </div>

                        {client.contactName && (
                          <p className="text-xs text-slate-400 mt-1 truncate">{client.contactName}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium text-slate-300">
                            {formatCurrency(client.monthlyFee)}/mo
                          </span>
                          {client.healthScore !== null && (
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getHealthColor(client.healthScore)}`} />
                              <span className="text-xs text-slate-400">{client.healthScore}%</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-slate-400">
                            {client.daysInStage} days in stage
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {client.lastActivity}
                          </span>
                        </div>
                      </div>
                    ))}

                    {stageClients.length === 0 && (
                      <div className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${
                        isDropTarget ? 'border-blue-400 bg-blue-500/10' : 'border-white/10'
                      }`}>
                        <p className="text-xs text-slate-400">
                          {isDropTarget ? 'Drop here' : 'No clients in this stage'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Scroll hint for mobile/touch */}
      <div className="flex justify-center mt-2 gap-1">
        {stages.map((_, idx) => (
          <div key={`dot-${idx}`} className="w-2 h-2 rounded-full bg-white/10" />
        ))}
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl shadow-none w-full max-w-md">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Edit Client</h3>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1 text-slate-400 hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={editingClient.contactName || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, contactName: e.target.value || null })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Primary contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Tier
                </label>
                <select
                  value={editingClient.tier}
                  onChange={(e) => setEditingClient({ ...editingClient, tier: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ colorScheme: 'dark' }}
                >
                  {TIERS.map((tier) => (
                    <option key={tier} value={tier} className="bg-slate-800 text-white">{tier}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Monthly Fee
                  </label>
                  <input
                    type="number"
                    value={editingClient.monthlyFee || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, monthlyFee: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Health Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingClient.healthScore || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, healthScore: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0-100"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setEditingClient(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveClientEdit}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
