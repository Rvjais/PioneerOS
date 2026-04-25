'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { downloadCSV } from '@/client/utils/downloadCSV'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'
import DataDiscovery from '@/client/components/ui/DataDiscovery'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  source: string
  leadPriority: string
  stage: string
  value: number | null
  createdAt: string
  updatedAt: string
}

const PRIORITIES = ['HOT', 'WARM', 'COLD']
const SIMPLE_STAGES = ['NEW', 'CONTACTED', 'NEGOTIATING', 'CLOSED']

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

export default function LeadsCRMPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    }>
      <LeadsCRMContent />
    </Suspense>
  )
}

const LEADS_CREATE_ROLES = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'SALES', 'ACCOUNTS']

function LeadsCRMContent() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role || ''
  const canCreateLead = LEADS_CREATE_ROLES.includes(userRole)

  const searchParams = useSearchParams()
  const showNewModal = searchParams.get('action') === 'new'

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(showNewModal && canCreateLead)
  const [showActionModal, setShowActionModal] = useState<{ leadId: string; type: string } | null>(null)
  const [actionNote, setActionNote] = useState('')

  // Filters
  const [filterStage, setFilterStage] = useState<string>(searchParams.get('stage') || '')
  const [filterPriority, setFilterPriority] = useState<string>(searchParams.get('priority') || '')
  const [search, setSearch] = useState('')

  // New Lead Form
  const [newLead, setNewLead] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    source: 'WEBSITE',
    leadPriority: 'WARM',
    value: '',
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

  const createLead = async () => {
    try {
      const res = await fetch('/api/sales/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          value: newLead.value ? parseInt(newLead.value) : null,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setLeads([created, ...leads])
        setShowAddModal(false)
        setNewLead({
          companyName: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          source: 'WEBSITE',
          leadPriority: 'WARM',
          value: '',
        })
      }
    } catch (error) {
      console.error('Failed to create lead:', error)
    }
  }

  const logActivity = async () => {
    if (!showActionModal || !actionNote.trim()) return

    try {
      await fetch(`/api/sales/leads/${showActionModal.leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: showActionModal.type,
          title: `${showActionModal.type} - ${actionNote.slice(0, 50)}`,
          notes: actionNote,
        }),
      })
      setShowActionModal(null)
      setActionNote('')
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  // Filter leads (memoized to avoid recalculating on every render)
  const filteredLeads = useMemo(() => leads.filter(lead => {
    if (filterStage && getSimplifiedStage(lead.stage) !== filterStage) return false
    if (filterPriority && lead.leadPriority !== filterPriority) return false
    if (search) {
      const searchLower = search.toLowerCase()
      if (
        !lead.companyName.toLowerCase().includes(searchLower) &&
        !lead.contactName.toLowerCase().includes(searchLower) &&
        !(lead.contactEmail?.toLowerCase().includes(searchLower))
      ) return false
    }
    return true
  }), [leads, filterStage, filterPriority, search])

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}-${month}-${d.getFullYear()}`
  }

  const getStageColor = (stage: string) => {
    const simplified = getSimplifiedStage(stage)
    switch (simplified) {
      case 'NEW': return 'bg-blue-500/20 text-blue-400'
      case 'CONTACTED': return 'bg-yellow-500/20 text-yellow-400'
      case 'NEGOTIATING': return 'bg-purple-500/20 text-purple-400'
      case 'CLOSED': return stage === 'WON' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HOT': return 'bg-red-500/20 text-red-400'
      case 'WARM': return 'bg-amber-500/20 text-amber-400'
      case 'COLD': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageGuide
        pageKey="leads"
        title="Leads CRM"
        description="Track and manage sales leads through the pipeline."
        steps={[
          { label: 'Add new leads', description: 'Create entries for incoming prospects' },
          { label: 'Track pipeline stages', description: 'Move leads from New to Closed' },
          { label: 'Log activities', description: 'Record calls, emails, and meetings' },
        ]}
      />

      <DataDiscovery dataType="leads" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-400">{filteredLeads.length} of {leads.length} leads</p>
        </div>
        <div className="flex items-center gap-2">
        <button
          onClick={() => downloadCSV(filteredLeads.map(l => ({
            'Company Name': l.companyName,
            Contact: l.contactName,
            Email: l.contactEmail || '',
            Phone: l.contactPhone || '',
            Source: l.source,
            Stage: getSimplifiedStage(l.stage),
            Value: l.value ?? '',
            'Assigned To': '',
            'Created Date': formatDateDDMMYYYY(l.createdAt),
          })), 'leads.csv')}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition"
        >
          Export CSV
        </button>
        {canCreateLead && (
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
          <InfoTip text="Create a new lead entry" type="action" />
        </button>
        )}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-lg border border-white/10 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Stages</option>
            {SIMPLE_STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {(search || filterStage || filterPriority) && (
            <button
              onClick={() => { setSearch(''); setFilterStage(''); setFilterPriority(''); }}
              className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Company</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Contact</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Stage</th>
                <th className="text-right px-4 py-3 font-medium text-slate-300">Value</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Last Activity</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <Link href={`/sales/leads/${lead.id}`} className="font-medium text-orange-600 hover:underline">
                        {lead.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{lead.contactName}</div>
                      <div className="text-xs text-slate-400">{lead.contactPhone || lead.contactEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStageColor(lead.stage)}`}>
                        {getSimplifiedStage(lead.stage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-200">
                      {lead.value ? formatCurrency(lead.value) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(lead.leadPriority)}`}>
                        {lead.leadPriority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDate(lead.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {/* 5 Quick Actions */}
                      <div className="flex items-center justify-center gap-1">
                        {/* Call */}
                        <button
                          onClick={() => setShowActionModal({ leadId: lead.id, type: 'CALL' })}
                          className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Log Call"
                          aria-label={`Log call for ${lead.companyName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        {/* WhatsApp */}
                        <a
                          href={lead.contactPhone ? `https://wa.me/${lead.contactPhone.replace(/\D/g, '')}` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="WhatsApp"
                          aria-label={`WhatsApp ${lead.companyName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </a>
                        {/* Email */}
                        <a
                          href={lead.contactEmail ? `mailto:${lead.contactEmail}` : '#'}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Send Email"
                          aria-label={`Email ${lead.companyName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                        {/* Meeting */}
                        <Link
                          href={`/sales/meetings?leadId=${lead.id}`}
                          className="p-1.5 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="Schedule Meeting"
                          aria-label={`Schedule meeting with ${lead.companyName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </Link>
                        {/* Note */}
                        <button
                          onClick={() => setShowActionModal({ leadId: lead.id, type: 'NOTE' })}
                          className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Add Note"
                          aria-label={`Add note for ${lead.companyName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Edit in CRM */}
                        <Link
                          href={`/crm/${lead.id}`}
                          className="p-1.5 text-slate-400 hover:bg-slate-500/10 rounded-lg transition-colors"
                          title="Edit in CRM"
                          aria-label={`Edit ${lead.companyName} in CRM`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Add New Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name * <InfoTip text="Full business name of the potential client. Use the name they go by publicly." /></label>
                  <input
                    type="text"
                    value={newLead.companyName}
                    onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ABC Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name * <InfoTip text="Decision-maker or primary contact person you're speaking with." /></label>
                  <input
                    type="text"
                    value={newLead.contactName}
                    onChange={(e) => setNewLead({ ...newLead, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email <InfoTip text="Email of the contact person. Verify it's the right person before adding." /></label>
                  <input
                    type="email"
                    value={newLead.contactEmail}
                    onChange={(e) => setNewLead({ ...newLead, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone <InfoTip text="WhatsApp-enabled number with country code. Used for follow-up calls." /></label>
                  <input
                    type="tel"
                    value={newLead.contactPhone}
                    onChange={(e) => setNewLead({ ...newLead, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority <InfoTip text="HOT = ready to buy soon, WARM = interested but not urgent, COLD = early stage or unresponsive." /></label>
                  <select
                    value={newLead.leadPriority}
                    onChange={(e) => setNewLead({ ...newLead, leadPriority: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Value <InfoTip text="Expected monthly retainer if they convert. Helps prioritize pipeline." /></label>
                  <input
                    type="number"
                    value={newLead.value}
                    onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="50000"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createLead}
                disabled={!newLead.companyName || !newLead.contactName}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-white/20 disabled:cursor-not-allowed"
              >
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                {showActionModal.type === 'CALL' ? 'Log Call' : 'Add Note'}
              </h2>
              <button onClick={() => setShowActionModal(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Action Notes <InfoTip text="What was discussed, agreed upon, and next steps. Be specific for your future self." /></label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-32"
                placeholder={showActionModal.type === 'CALL' ? 'What was discussed on the call?' : 'Add your note here...'}
              />
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowActionModal(null)}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={logActivity}
                disabled={!actionNote.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-white/20 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
