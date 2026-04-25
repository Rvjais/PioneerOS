'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  stage: string
  leadPriority: string
  value: number | null
  lastContactedAt: string | null
}

interface NurturingAction {
  id: string
  leadId: string
  actionType: string
  contentTitle: string
  channel: string | null
  response: string | null
  createdAt: string
  lead: { companyName: string }
}

const ACTION_TYPES = [
  { value: 'EBOOK', label: 'eBook', icon: '📘' },
  { value: 'CASE_STUDY', label: 'Case Study', icon: '📊' },
  { value: 'VIDEO', label: 'Video', icon: '🎥' },
  { value: 'TESTIMONIAL', label: 'Testimonial', icon: '⭐' },
  { value: 'WEBSITE_EXAMPLE', label: 'Website Example', icon: '🌐' },
  { value: 'INDUSTRY_INSIGHTS', label: 'Industry Insights', icon: '💡' },
  { value: 'FREE_CONSULTATION', label: 'Free Consultation', icon: '🤝' },
]

const CHANNELS = ['WHATSAPP', 'EMAIL', 'LINKEDIN', 'PHONE']

const stageLabels: Record<string, string> = {
  LEAD_RECEIVED: 'New', RFP_SENT: 'RFP Sent', RFP_COMPLETED: 'RFP Done',
  PROPOSAL_SHARED: 'Proposal Shared', FOLLOW_UP_ONGOING: 'Follow-up',
  MEETING_SCHEDULED: 'Meeting Set', PROPOSAL_DISCUSSION: 'Discussion',
}

const priorityColors: Record<string, string> = {
  HOT: 'bg-red-500/10 text-red-400 border-red-500/20',
  WARM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  COLD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export default function SalesNurturingPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [recentActions, setRecentActions] = useState<NurturingAction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendForm, setSendForm] = useState({
    leadId: '',
    actionType: 'CASE_STUDY',
    contentTitle: '',
    contentUrl: '',
    channel: 'WHATSAPP',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [leadsRes, actionsRes] = await Promise.all([
        fetch('/api/sales/leads?stage=active&limit=100'),
        fetch('/api/sales/nurturing/content'),
      ])
      if (leadsRes.ok) {
        const data = await leadsRes.json()
        // Filter to active leads only (not WON/LOST)
        const activeLeads = (data.leads || []).filter((l: Lead) => !['WON', 'LOST'].includes(l.stage))
        setLeads(activeLeads)
      }
      if (actionsRes.ok) {
        const data = await actionsRes.json()
        setRecentActions(data.actions || [])
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendNurture() {
    if (!sendForm.leadId || !sendForm.contentTitle) {
      toast.error('Select a lead and enter content title')
      return
    }
    try {
      const res = await fetch(`/api/sales/leads/${sendForm.leadId}/nurture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendForm),
      })
      if (!res.ok) throw new Error('Failed to send')
      toast.success('Nurturing action recorded')
      setShowSendModal(false)
      setSendForm({ leadId: '', actionType: 'CASE_STUDY', contentTitle: '', contentUrl: '', channel: 'WHATSAPP', notes: '' })
      fetchData()
    } catch {
      toast.error('Failed to record nurturing action')
    }
  }

  // Group leads by priority for campaign targeting
  const hotLeads = leads.filter(l => l.leadPriority === 'HOT')
  const warmLeads = leads.filter(l => l.leadPriority === 'WARM')
  const coldLeads = leads.filter(l => l.leadPriority === 'COLD')

  // Leads not contacted in 7+ days
  const staleLeads = leads.filter(l => {
    if (!l.lastContactedAt) return true
    const daysSince = Math.floor((Date.now() - new Date(l.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= 7
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Nurturing</h1>
          <p className="text-slate-400 mt-1">Send targeted content to move leads through the pipeline</p>
        </div>
        <div className="flex gap-3">
          <Link href="/sales/nurturing/content" className="px-4 py-2 border border-white/20 text-slate-200 rounded-xl hover:bg-slate-900/40 transition-colors">
            Content Library
          </Link>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Content
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-red-500/20 p-4">
          <p className="text-2xl font-bold text-red-400">{hotLeads.length}</p>
          <p className="text-xs text-slate-400">Hot Leads to Nurture</p>
        </div>
        <div className="glass-card rounded-xl border border-yellow-500/20 p-4">
          <p className="text-2xl font-bold text-yellow-400">{warmLeads.length}</p>
          <p className="text-xs text-slate-400">Warm Leads</p>
        </div>
        <div className="glass-card rounded-xl border border-blue-500/20 p-4">
          <p className="text-2xl font-bold text-blue-400">{coldLeads.length}</p>
          <p className="text-xs text-slate-400">Cold Leads</p>
        </div>
        <div className="glass-card rounded-xl border border-orange-500/20 p-4">
          <p className="text-2xl font-bold text-orange-400">{staleLeads.length}</p>
          <p className="text-xs text-slate-400">Stale (7+ days)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stale Leads - Need Nurturing */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Leads Needing Attention</h2>
            <span className="text-xs text-slate-400">{staleLeads.length} leads not contacted in 7+ days</span>
          </div>
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {staleLeads.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">All leads are recently contacted</div>
            ) : (
              staleLeads.map(lead => {
                const daysSince = lead.lastContactedAt
                  ? Math.floor((Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
                  : null
                return (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs border ${priorityColors[lead.leadPriority] || ''}`}>
                        {lead.leadPriority}
                      </span>
                      <div>
                        <Link href={`/sales/leads/${lead.id}`} className="font-medium text-white hover:text-orange-400 text-sm">
                          {lead.companyName}
                        </Link>
                        <p className="text-xs text-slate-400">{lead.contactName} · {stageLabels[lead.stage] || lead.stage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-red-400">
                        {daysSince !== null ? `${daysSince}d ago` : 'Never contacted'}
                      </span>
                      <button
                        onClick={() => {
                          setSendForm({ ...sendForm, leadId: lead.id })
                          setShowSendModal(true)
                        }}
                        className="px-3 py-1 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg hover:bg-orange-500/20"
                      >
                        Send Content
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Nurturing Actions */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Recent Actions</h2>
          </div>
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {recentActions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No nurturing actions yet</div>
            ) : (
              recentActions.slice(0, 15).map(action => {
                const typeInfo = ACTION_TYPES.find(a => a.value === action.actionType)
                return (
                  <div key={action.id} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{typeInfo?.icon || '📎'}</span>
                      <span className="text-sm text-white font-medium truncate">{action.contentTitle}</span>
                    </div>
                    <p className="text-xs text-slate-400">{action.lead?.companyName} · {action.channel || 'N/A'}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(action.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Suggested Content by Stage */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Suggested Nurturing by Stage</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 p-4">
          <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <h3 className="font-medium text-blue-400 mb-2">Early Stage (New / RFP)</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2">📊 Industry case studies</li>
              <li className="flex items-center gap-2">💡 Market insights & trends</li>
              <li className="flex items-center gap-2">🌐 Portfolio website examples</li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">{leads.filter(l => ['LEAD_RECEIVED', 'RFP_SENT', 'RFP_COMPLETED'].includes(l.stage)).length} leads in this stage</p>
          </div>
          <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
            <h3 className="font-medium text-purple-400 mb-2">Mid Stage (Proposal / Follow-up)</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2">⭐ Client testimonials</li>
              <li className="flex items-center gap-2">🎥 Demo videos & walkthroughs</li>
              <li className="flex items-center gap-2">📘 Service deep-dives</li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">{leads.filter(l => ['PROPOSAL_SHARED', 'FOLLOW_UP_ONGOING'].includes(l.stage)).length} leads in this stage</p>
          </div>
          <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
            <h3 className="font-medium text-orange-400 mb-2">Late Stage (Meeting / Discussion)</h3>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2">🤝 Free consultation offer</li>
              <li className="flex items-center gap-2">📊 ROI case studies</li>
              <li className="flex items-center gap-2">⭐ Similar client success stories</li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">{leads.filter(l => ['MEETING_SCHEDULED', 'PROPOSAL_DISCUSSION'].includes(l.stage)).length} leads in this stage</p>
          </div>
        </div>
      </div>

      {/* Send Content Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Send Nurturing Content</h2>
              <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Lead *</label>
              <select
                value={sendForm.leadId}
                onChange={e => setSendForm({ ...sendForm, leadId: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select lead</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.companyName} - {l.contactName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Content Type</label>
                <select
                  value={sendForm.actionType}
                  onChange={e => setSendForm({ ...sendForm, actionType: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {ACTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Channel</label>
                <select
                  value={sendForm.channel}
                  onChange={e => setSendForm({ ...sendForm, channel: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CHANNELS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Content Title *</label>
              <input
                type="text"
                value={sendForm.contentTitle}
                onChange={e => setSendForm({ ...sendForm, contentTitle: e.target.value })}
                placeholder="e.g., Healthcare Marketing ROI Case Study"
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Content URL</label>
              <input
                type="url"
                value={sendForm.contentUrl}
                onChange={e => setSendForm({ ...sendForm, contentUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
              <textarea
                value={sendForm.notes}
                onChange={e => setSendForm({ ...sendForm, notes: e.target.value })}
                rows={2}
                placeholder="Any context about this outreach..."
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 border border-white/10 text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNurture}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Record & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
