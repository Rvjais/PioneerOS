'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Lead {
  id: string
  companyName: string
  contactName: string
  stage: string
  pipeline: string | null
  value: number | null
  lastContactedAt: string | null
  nextFollowUp: string | null
  updatedAt: string
  _count?: {
    nurturingActions: number
  }
}

interface DailyStats {
  leadsReceived: number
  rfpsSent: number
  rfpsCompleted: number
  proposalsShared: number
  meetingsScheduled: number
  dealsWon: number
  dealsLost: number
  pipelineValue: number
}

export default function SalesDailyMeetingPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/sales/leads')
      if (res.ok) {
        const json = await res.json()
        setLeads(Array.isArray(json) ? json : json.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  // Calculate daily stats
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const stats: DailyStats = {
    leadsReceived: leads.filter(l => new Date(l.updatedAt) >= startOfToday && l.stage === 'LEAD_RECEIVED').length,
    rfpsSent: leads.filter(l => l.stage === 'RFP_SENT').length,
    rfpsCompleted: leads.filter(l => l.stage === 'RFP_COMPLETED').length,
    proposalsShared: leads.filter(l => l.stage === 'PROPOSAL_SHARED').length,
    meetingsScheduled: leads.filter(l => l.stage === 'MEETING_SCHEDULED').length,
    dealsWon: leads.filter(l => l.stage === 'WON').length,
    dealsLost: leads.filter(l => l.stage === 'LOST').length,
    pipelineValue: leads.filter(l => !['WON', 'LOST'].includes(l.stage)).reduce((sum, l) => sum + (l.value || 0), 0),
  }

  // Leads requiring action today
  const followUpsToday = leads.filter(l => {
    if (!l.nextFollowUp) return false
    const followUpDate = new Date(l.nextFollowUp)
    return followUpDate <= new Date()
  })

  // Hot leads (in negotiation stages)
  const hotLeads = leads.filter(l =>
    ['PROPOSAL_DISCUSSION', 'MEETING_SCHEDULED', 'FOLLOW_UP_ONGOING'].includes(l.stage)
  )

  // Stale leads (no activity in 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const staleLeads = leads.filter(l => {
    const lastUpdate = new Date(l.updatedAt)
    return lastUpdate < sevenDaysAgo && !['WON', 'LOST'].includes(l.stage)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Daily Sales Meeting</h1>
          <p className="text-sm text-slate-400">{today}</p>
        </div>
        <Link
          href="/sales/pipeline"
          className="px-4 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-500/10"
        >
          View Full Pipeline
        </Link>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-4 text-white">
          <p className="text-sm text-orange-100">Pipeline Value</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.pipelineValue)}</p>
          <p className="text-xs text-orange-100 mt-1">Active deals</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">New Leads</p>
          <p className="text-3xl font-bold text-white">{stats.leadsReceived}</p>
          <p className="text-xs text-green-400 mt-1">Today</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">RFPs Pending</p>
          <p className="text-3xl font-bold text-blue-400">{stats.rfpsSent}</p>
          <p className="text-xs text-slate-400 mt-1">{stats.rfpsCompleted} completed</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Deals Won</p>
          <p className="text-3xl font-bold text-green-400">{stats.dealsWon}</p>
          <p className="text-xs text-red-400 mt-1">{stats.dealsLost} lost</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Follow-ups Today */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-amber-500/10 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="font-semibold text-amber-800">Follow-ups Due ({followUpsToday.length})</h2>
          </div>
          <div className="divide-y divide-white/10 max-h-64 overflow-y-auto">
            {followUpsToday.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No follow-ups due</div>
            ) : (
              followUpsToday.map(lead => (
                <Link
                  key={lead.id}
                  href={`/sales/leads/${lead.id}`}
                  className="block p-3 hover:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{lead.companyName}</p>
                      <p className="text-xs text-slate-400">{lead.contactName}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800/50 text-slate-300">
                      {lead.stage.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Hot Leads */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-orange-500/10 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <h2 className="font-semibold text-orange-800">Hot Leads ({hotLeads.length})</h2>
          </div>
          <div className="divide-y divide-white/10 max-h-64 overflow-y-auto">
            {hotLeads.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No hot leads</div>
            ) : (
              hotLeads.map(lead => (
                <Link
                  key={lead.id}
                  href={`/sales/leads/${lead.id}`}
                  className="block p-3 hover:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{lead.companyName}</p>
                      <p className="text-xs text-slate-400">
                        {lead.contactName} | {lead.value ? formatCurrency(lead.value) : 'No value'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                      {lead.stage.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h2 className="font-semibold text-white mb-4">Pipeline by Stage</h2>
        <div className="grid grid-cols-9 gap-2">
          {['LEAD_RECEIVED', 'RFP_SENT', 'RFP_COMPLETED', 'PROPOSAL_SHARED', 'FOLLOW_UP_ONGOING', 'MEETING_SCHEDULED', 'PROPOSAL_DISCUSSION', 'WON', 'LOST'].map(stage => {
            const count = leads.filter(l => l.stage === stage).length
            const isWon = stage === 'WON'
            const isLost = stage === 'LOST'
            return (
              <div
                key={stage}
                className={`p-3 rounded-lg text-center ${
                  isWon ? 'bg-green-500/10 border border-green-200' :
                  isLost ? 'bg-red-500/10 border border-red-200' :
                  'bg-slate-900/40 border border-white/10'
                }`}
              >
                <p className={`text-2xl font-bold ${
                  isWon ? 'text-green-400' :
                  isLost ? 'text-red-400' :
                  'text-white'
                }`}>
                  {count}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  {stage.replace(/_/g, ' ')}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stale Leads Warning */}
      {staleLeads.length > 0 && (
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="font-semibold text-red-800">Stale Leads ({staleLeads.length})</h2>
            <span className="text-xs text-red-400">No activity in 7+ days</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {staleLeads.slice(0, 10).map(lead => (
              <Link
                key={lead.id}
                href={`/sales/leads/${lead.id}`}
                className="px-3 py-1.5 glass-card rounded-lg border border-red-200 text-sm text-red-400 hover:bg-red-500/20"
              >
                {lead.companyName}
              </Link>
            ))}
            {staleLeads.length > 10 && (
              <span className="px-3 py-1.5 text-sm text-red-500">
                +{staleLeads.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
