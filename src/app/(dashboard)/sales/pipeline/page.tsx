'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactPhone: string | null
  stage: string
  value: number | null
  leadPriority: string
  updatedAt: string
}

const SIMPLE_STAGES = [
  { value: 'NEW', label: 'New', color: 'bg-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-200' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { value: 'NEGOTIATING', label: 'Negotiating', color: 'bg-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-200' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-200' },
]

// Map old stages to simplified stages
const STAGE_MAPPING: Record<string, string> = {
  'LEAD_RECEIVED': 'NEW',
  'RFP_SENT': 'CONTACTED',
  'RFP_COMPLETED': 'CONTACTED',
  'PROPOSAL_SHARED': 'NEGOTIATING',
  'FOLLOW_UP_ONGOING': 'NEGOTIATING',
  'MEETING_SCHEDULED': 'NEGOTIATING',
  'PROPOSAL_DISCUSSION': 'NEGOTIATING',
  'WON': 'CLOSED',
  'LOST': 'CLOSED',
}

function getSimplifiedStage(stage: string): string {
  return STAGE_MAPPING[stage] || stage
}

export default function SalesPipelinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SalesPipelineContent />
    </Suspense>
  )
}

function SalesPipelineContent() {
  const searchParams = useSearchParams()
  const filterStage = searchParams.get('stage') || ''

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)

  useEffect(() => {
    fetchLeads()

    // Auto-refresh every 30 seconds to keep pipeline values up-to-date
    const interval = setInterval(fetchLeads, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/sales/leads')
      if (res.ok) {
        const data = await res.json()
        setLeads(Array.isArray(data) ? data : data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (newStage: string) => {
    if (!draggedLead) return

    // Determine the actual stage to set
    let actualStage = newStage
    if (newStage === 'NEW') actualStage = 'LEAD_RECEIVED'
    if (newStage === 'CONTACTED') actualStage = 'RFP_SENT'
    if (newStage === 'NEGOTIATING') actualStage = 'PROPOSAL_SHARED'
    if (newStage === 'CLOSED') actualStage = 'WON'

    try {
      const res = await fetch(`/api/sales/leads/${draggedLead.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: actualStage }),
      })

      if (res.ok) {
        setLeads(leads.map(l => l.id === draggedLead.id ? { ...l, stage: actualStage } : l))
      }
    } catch (error) {
      console.error('Failed to update stage:', error)
    }

    setDraggedLead(null)
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  const getLeadsByStage = (stage: string) => {
    return leads.filter(lead => {
      const simplified = getSimplifiedStage(lead.stage)
      return simplified === stage
    })
  }

  const getStageValue = (stage: string) => {
    return getLeadsByStage(stage).reduce((sum, l) => sum + (l.value || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const totalPipeline = leads.filter(l => !['WON', 'LOST'].includes(l.stage)).reduce((sum, l) => sum + (l.value || 0), 0)

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Sales Pipeline</h1>
          <p className="text-sm text-slate-400">
            {leads.length} leads | Pipeline value: {formatCurrency(totalPipeline)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/sales/leads"
            className="px-3 py-2 text-slate-300 text-sm font-medium rounded-lg border border-white/10 hover:bg-slate-900/40 transition-colors"
          >
            List View
          </Link>
          <Link
            href="/sales/leads?action=new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </Link>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-220px)]">
        {SIMPLE_STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage.value)
          const stageValue = getStageValue(stage.value)
          const isHighlighted = filterStage === stage.value

          return (
            <div
              key={stage.value}
              className={`flex flex-col rounded-xl border ${isHighlighted ? 'border-orange-400 ring-2 ring-orange-200' : stage.borderColor} ${stage.bgColor} overflow-hidden`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.value)}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-white/10 bg-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="font-semibold text-white">{stage.label}</span>
                    <span className="px-2 py-0.5 text-xs bg-white/10 text-slate-300 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {formatCurrency(stageValue)}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    No leads
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead)}
                      className={`glass-card rounded-lg border border-white/10 p-3 shadow-none hover:shadow-none transition-all cursor-grab active:cursor-grabbing ${
                        draggedLead?.id === lead.id ? 'opacity-50' : ''
                      }`}
                    >
                      <Link href={`/sales/leads/${lead.id}`} className="block">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-white text-sm hover:text-orange-600 transition-colors">
                            {lead.companyName}
                          </h3>
                          {lead.leadPriority === 'HOT' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded">
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{lead.contactName}</p>
                        {lead.value && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-400">
                              {formatCurrency(lead.value)}
                            </span>
                            {stage.value === 'CLOSED' && (
                              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                                lead.stage === 'WON' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {lead.stage}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
