'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SalesDashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  followUps: Array<{
    id: string
    company: string
    contact: string
    time: string
    type: string
    status: string
  }>
  recentLeads: Array<{
    id: string
    company: string
    source: string
    value: number
    time: string
  }>
  pipeline: Array<{
    stage: string
    count: number
    value: number
  }>
  stats: {
    newLeads: number
    followUpsToday: number
    proposalsSent: number
    dealsWon: number
    pipelineValue: number
    conversionRate: number
  }
}

const stageColors: Record<string, string> = {
  'NEW': 'bg-white/5',
  'CONTACTED': 'bg-blue-500/100',
  'QUALIFIED': 'bg-cyan-500',
  'PROPOSAL': 'bg-purple-500/100',
  'NEGOTIATION': 'bg-amber-500/100',
  'WON': 'bg-green-500/100',
}

export default function SalesDashboard({
  user,
  followUps: initialFollowUps,
  recentLeads,
  pipeline,
  stats
}: SalesDashboardProps) {
  const router = useRouter()
  const [followUps, setFollowUps] = useState(initialFollowUps)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [newTime, setNewTime] = useState('')

  const handleMarkComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/crm/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONTACTED' })
      })
      if (!res.ok) throw new Error('Failed')
      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'completed' } : f))
      toast.success('Follow-up completed')
    } catch {
      toast.error('Failed to update follow-up')
      // Don't update local state on failure
    }
  }

  const handleReschedule = async (id: string) => {
    if (!newTime) return
    try {
      const res = await fetch(`/api/crm/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpTime: newTime })
      })
      if (!res.ok) throw new Error('Failed')
      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, time: newTime } : f))
      toast.success('Follow-up rescheduled')
    } catch {
      toast.error('Failed to reschedule follow-up')
    }
    setRescheduleId(null)
    setNewTime('')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const maxPipelineCount = Math.max(...pipeline.map(p => p.count), 1)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-orange-100">Track leads, manage pipeline, close deals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.newLeads}</p>
          <p className="text-sm text-slate-400">New Leads</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.followUpsToday}</p>
          <p className="text-sm text-slate-400">Follow-ups Today</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-purple-400">{stats.proposalsSent}</p>
          <p className="text-sm text-slate-400">Proposals Sent</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{stats.dealsWon}</p>
          <p className="text-sm text-slate-400">Deals Won (MTD)</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.pipelineValue)}</p>
          <p className="text-sm text-slate-400">Pipeline Value</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.conversionRate}%</p>
          <p className="text-sm text-slate-400">Conversion Rate</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Follow-ups */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Today&apos;s Follow-ups</h2>
            <Link href="/crm" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {followUps.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">No follow-ups scheduled</p>
            ) : (
              followUps.map((followUp) => (
                <div key={followUp.id} className={`p-3 rounded-lg border ${followUp.status === 'completed' ? 'bg-green-500/10 border-green-100' : 'glass-card border-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{followUp.company}</p>
                      <p className="text-xs text-slate-400">{followUp.contact}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-300">{followUp.time}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        followUp.type === 'Call' ? 'bg-blue-500/20 text-blue-400' :
                        followUp.type === 'Email' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {followUp.type}
                      </span>
                    </div>
                  </div>
                  {followUp.status === 'pending' && (
                    <>
                      {rescheduleId === followUp.id ? (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="flex-1 px-2 py-1.5 text-xs border border-white/10 rounded"
                          />
                          <button
                            onClick={() => handleReschedule(followUp.id)}
                            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setRescheduleId(null)}
                            className="px-3 py-1.5 text-xs bg-white/5 text-slate-300 rounded hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleMarkComplete(followUp.id)}
                            className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            title="Mark this follow-up as completed"
                            aria-label={`Mark follow-up with ${followUp.company} as completed`}
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => setRescheduleId(followUp.id)}
                            className="px-3 py-1.5 text-xs bg-white/5 text-slate-300 rounded hover:bg-white/10"
                            title="Reschedule this follow-up"
                            aria-label={`Reschedule follow-up with ${followUp.company}`}
                          >
                            Reschedule
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pipeline */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Pipeline Overview</h2>
            <Link href="/crm" className="text-sm text-blue-400 hover:underline">Full Pipeline</Link>
          </div>
          <div className="space-y-4">
            {pipeline.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">No leads in pipeline</p>
            ) : (
              pipeline.map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stageColors[stage.stage.toUpperCase().replace(' ', '_')] || 'bg-white/5'}`} />
                      <span className="text-sm font-medium text-slate-200">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-slate-300">{stage.count} leads</span>
                      <span className="text-xs text-slate-400 ml-2">{formatCurrency(stage.value)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stageColors[stage.stage.toUpperCase().replace(' ', '_')] || 'bg-white/5'}`}
                      style={{ width: `${(stage.count / maxPipelineCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Leads</h2>
            <Link href="/crm" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">No recent leads</p>
            ) : (
              recentLeads.map((lead) => (
                <Link key={lead.id} href={`/crm/${lead.id}`} className="block p-3 border border-white/5 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{lead.company}</p>
                      <p className="text-xs text-slate-400">via {lead.source}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-400">{formatCurrency(lead.value)}</p>
                      <p className="text-xs text-slate-400">{lead.time}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/crm/new" className="p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors text-center">
              <svg className="w-6 h-6 text-blue-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium text-blue-400">Add Lead</span>
            </Link>
            <Link href="/proposals/create" className="p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors text-center">
              <svg className="w-6 h-6 text-purple-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-purple-400">Create Proposal</span>
            </Link>
            <Link href="/crm" className="p-4 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors text-center">
              <svg className="w-6 h-6 text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-green-400">View Pipeline</span>
            </Link>
            <Link href="/reports/sales" className="p-4 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors text-center">
              <svg className="w-6 h-6 text-amber-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-amber-400">Sales Report</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
