'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageGuide from '@/client/components/ui/PageGuide'
import DataDiscovery from '@/client/components/ui/DataDiscovery'

interface Lead {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  source: string
  stage: string
  status: string
  value: number | null
  notes: string | null
  nextFollowUp: string | null
  createdAt: string
  assignedTo?: {
    id: string
    firstName: string
    lastName: string | null
  } | null
}

const SOURCES = ['WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_CALL', 'EVENT', 'INBOUND', 'PARTNER']
// All possible stages including legacy/other values
const STAGES = ['LEAD', 'LEAD_RECEIVED', 'NEW', 'QUALIFIED', 'DISCOVERY_CALL', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']

// Stage display names and grouping
const STAGE_DISPLAY: Record<string, string> = {
  'LEAD': 'Lead',
  'LEAD_RECEIVED': 'Lead',
  'NEW': 'New',
  'QUALIFIED': 'Qualified',
  'DISCOVERY_CALL': 'Discovery',
  'PROPOSAL_SENT': 'Proposal',
  'NEGOTIATION': 'Negotiation',
  'WON': 'Won',
  'LOST': 'Lost',
}

const INDUSTRIES: Record<string, string[]> = {
  'Healthcare': ['Clinic', 'Hospital', 'Doctor', 'Lab/Diagnostics', 'Pharmacy', 'Mental Health'],
  'Real Estate': ['Residential', 'Commercial', 'Builder', 'Broker', 'Interior'],
  'Education': ['School', 'Coaching', 'University', 'EdTech', 'Training'],
  'E-commerce': ['Fashion', 'Electronics', 'Food', 'Beauty', 'General'],
  'Finance': ['Bank', 'NBFC', 'Insurance', 'Investment', 'CA/Tax'],
  'Hospitality': ['Hotel', 'Restaurant', 'Cafe', 'Event Venue', 'Travel'],
  'Technology': ['SaaS', 'IT Services', 'App Dev', 'Consulting', 'AI/ML'],
  'Manufacturing': ['Textile', 'Food Processing', 'Automotive', 'Electronics', 'Chemicals'],
  'Services': ['Legal', 'HR', 'Marketing Agency', 'Logistics', 'Security'],
  'Other': ['Startup', 'NGO', 'Government', 'Other']
}

const TICKET_SIZES: Record<string, string[]> = {
  'Healthcare': ['< 50 Beds', '50-100 Beds', '100-200 Beds', '200+ Beds', 'Single Clinic', 'Multi-Location'],
  'Real Estate': ['< 50L Project', '50L-2Cr', '2Cr-10Cr', '10Cr+', 'Individual Agent'],
  'Education': ['< 500 Students', '500-2000', '2000-5000', '5000+', 'Online Only'],
  'E-commerce': ['< 10L GMV', '10L-50L', '50L-2Cr', '2Cr+', 'Marketplace'],
  'Finance': ['< 100 Clients', '100-1000', '1000-10000', '10000+', 'Enterprise'],
  'default': ['Small (< 10L/yr)', 'Medium (10L-50L)', 'Large (50L-2Cr)', 'Enterprise (2Cr+)']
}

const stageColors: Record<string, string> = {
  LEAD: 'bg-slate-800/50 text-slate-200 border-white/10',
  LEAD_RECEIVED: 'bg-slate-800/50 text-slate-200 border-white/10',
  NEW: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  QUALIFIED: 'bg-teal-500/20 text-teal-400 border-teal-200',
  DISCOVERY_CALL: 'bg-blue-500/20 text-blue-400 border-blue-200',
  PROPOSAL_SENT: 'bg-purple-500/20 text-purple-400 border-purple-200',
  NEGOTIATION: 'bg-amber-500/20 text-amber-400 border-amber-200',
  WON: 'bg-green-500/20 text-green-400 border-green-200',
  LOST: 'bg-red-500/20 text-red-400 border-red-200',
}

// Helper to format notes - parse JSON if needed
function formatNotes(notes: string | null): string {
  if (!notes) return '-'
  // Try to parse as JSON
  try {
    const parsed = JSON.parse(notes)
    // If it's an object, format key-value pairs
    if (typeof parsed === 'object' && parsed !== null) {
      const parts: string[] = []
      if (parsed.campaign) parts.push(`Campaign: ${parsed.campaign}`)
      if (parsed.adGroup) parts.push(`Ad Group: ${parsed.adGroup}`)
      if (parsed.keyword) parts.push(`Keyword: ${parsed.keyword}`)
      if (parsed.industry) parts.push(`Industry: ${parsed.industry}`)
      if (parsed.source) parts.push(`Source: ${parsed.source}`)
      if (parsed.notes) parts.push(parsed.notes)
      if (parsed.message) parts.push(parsed.message)
      // Add any remaining string values
      Object.entries(parsed).forEach(([key, val]) => {
        if (typeof val === 'string' && !['campaign', 'adGroup', 'keyword', 'industry', 'source', 'notes', 'message'].includes(key)) {
          parts.push(`${key}: ${val}`)
        }
      })
      return parts.join(' | ') || '-'
    }
    return String(parsed)
  } catch {
    // Not JSON, return as-is
    return notes
  }
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ stage: '', source: '', search: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Lead>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [newLead, setNewLead] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    source: 'WEBSITE',
    value: '',
    notes: '',
    industry: '',
    subIndustry: '',
    ticketSize: ''
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/crm/leads')
      if (res.ok) {
        const data = await res.json()
        setLeads(Array.isArray(data) ? data : (Array.isArray(data.leads) ? data.leads : []))
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLead = async () => {
    if (!newLead.companyName || !newLead.contactName) return

    const notesArr: string[] = []
    if (newLead.industry) notesArr.push(`Industry: ${newLead.industry}`)
    if (newLead.subIndustry) notesArr.push(`Sub-Industry: ${newLead.subIndustry}`)
    if (newLead.ticketSize) notesArr.push(`Ticket Size: ${newLead.ticketSize}`)
    if (newLead.notes) notesArr.push(newLead.notes)

    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          notes: notesArr.join(' | '),
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setLeads([created, ...leads])
        setNewLead({
          companyName: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          source: 'WEBSITE',
          value: '',
          notes: '',
          industry: '',
          subIndustry: '',
          ticketSize: ''
        })
        setSelectedIndustry('')
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Failed to add lead:', error)
    }
  }

  const handleUpdateLead = async (id: string) => {
    try {
      const res = await fetch(`/api/crm/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, ...editData } : l))
        setEditingId(null)
        setEditData({})
      }
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return

    try {
      const res = await fetch(`/api/crm/leads/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete lead:', error)
    }
  }

  const startEdit = (lead: Lead) => {
    setEditingId(lead.id)
    setEditData(lead)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry)
    setNewLead({
      ...newLead,
      industry,
      subIndustry: '',
      ticketSize: ''
    })
  }

  const filteredLeads = leads.filter(l => {
    if (filter.stage && l.stage !== filter.stage) return false
    if (filter.source && l.source !== filter.source) return false
    if (filter.search) {
      const search = filter.search.toLowerCase()
      if (!l.companyName.toLowerCase().includes(search) &&
          !l.contactName.toLowerCase().includes(search)) return false
    }
    return true
  })

  const pipelineValue = leads.filter(l => !['WON', 'LOST'].includes(l.stage))
    .reduce((sum, l) => sum + (l.value || 0), 0)
  const wonValue = leads.filter(l => l.stage === 'WON')
    .reduce((sum, l) => sum + (l.value || 0), 0)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return `${amount}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      <PageGuide
        pageKey="crm"
        title="CRM Pipeline"
        description="Manage leads, track deal stages, and log sales activities."
        steps={[
          { label: 'View lead pipeline', description: 'See all leads organized by stage from new to won' },
          { label: 'Track deal stages', description: 'Move leads through qualification, proposal, and negotiation' },
          { label: 'Manage contacts', description: 'Add and edit lead contact details and company info' },
          { label: 'Log activities', description: 'Record calls, meetings, and follow-ups for each lead' },
        ]}
      />
      <DataDiscovery dataType="leads" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Sales CRM</h1>
          <p className="text-sm text-slate-400">
            {filteredLeads.length} leads | Pipeline: {formatCurrency(pipelineValue)} | Won: {formatCurrency(wonValue)}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-6 gap-2">
        {STAGES.map(stage => {
          const count = leads.filter(l => l.stage === stage).length
          return (
            <button
              key={stage}
              onClick={() => setFilter({ ...filter, stage: filter.stage === stage ? '' : stage })}
              className={`p-2 rounded-lg border text-center transition-colors ${
                filter.stage === stage ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-slate-900/40'
              }`}
            >
              <p className="text-lg font-bold text-white">{count}</p>
              <p className="text-xs text-slate-400">{stage.replace(/_/g, ' ')}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-slate-900/40 p-3 rounded-lg border border-white/10">
        <input
          type="text"
          placeholder="Search company or contact..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="px-3 py-1.5 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
        <select
          value={filter.source}
          onChange={(e) => setFilter({ ...filter, source: e.target.value })}
          className="px-3 py-1.5 text-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ colorScheme: 'dark' }}
        >
          <option value="" className="bg-slate-800 text-white">All Sources</option>
          {SOURCES.map(src => (
            <option key={src} value={src} className="bg-slate-800 text-white">{src}</option>
          ))}
        </select>
        {(filter.search || filter.stage || filter.source) && (
          <button
            onClick={() => setFilter({ stage: '', source: '', search: '' })}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Add Lead Form */}
      {isAdding && (
        <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Add New Lead</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Company Name *"
              value={newLead.companyName}
              onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="Contact Name *"
              value={newLead.contactName}
              onChange={(e) => setNewLead({ ...newLead, contactName: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newLead.contactEmail}
              onChange={(e) => setNewLead({ ...newLead, contactEmail: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newLead.contactPhone}
              onChange={(e) => setNewLead({ ...newLead, contactPhone: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <select
              value={newLead.industry}
              onChange={(e) => handleIndustryChange(e.target.value)}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-slate-800 text-white">Select Industry</option>
              {Object.keys(INDUSTRIES).map(ind => (
                <option key={ind} value={ind} className="bg-slate-800 text-white">{ind}</option>
              ))}
            </select>
            <select
              value={newLead.subIndustry}
              onChange={(e) => setNewLead({ ...newLead, subIndustry: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedIndustry}
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-slate-800 text-white">Sub-Industry</option>
              {selectedIndustry && INDUSTRIES[selectedIndustry]?.map(sub => (
                <option key={sub} value={sub} className="bg-slate-800 text-white">{sub}</option>
              ))}
            </select>
            <select
              value={newLead.ticketSize}
              onChange={(e) => setNewLead({ ...newLead, ticketSize: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedIndustry}
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-slate-800 text-white">Ticket Size</option>
              {(TICKET_SIZES[selectedIndustry] || TICKET_SIZES.default).map(size => (
                <option key={size} value={size} className="bg-slate-800 text-white">{size}</option>
              ))}
            </select>
            <select
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'dark' }}
            >
              {SOURCES.map(src => (
                <option key={src} value={src} className="bg-slate-800 text-white">{src}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <input
              type="number"
              placeholder="Deal Value"
              value={newLead.value}
              onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Notes"
              value={newLead.notes}
              onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
              className="px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
            />
            <button
              onClick={handleAddLead}
              disabled={!newLead.companyName || !newLead.contactName}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-white/20 disabled:cursor-not-allowed transition-colors"
            >
              Add Lead
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40 border-b border-white/10">
                <th className="text-left px-4 py-3 font-medium text-slate-300 w-48">Company</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300 w-40">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300 w-32">Source</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300 w-36">Stage</th>
                <th className="text-right px-4 py-3 font-medium text-slate-300 w-24">Value</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Notes</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No leads found. Click "Add Lead" to create one.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/40 group">
                    {editingId === lead.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editData.companyName || ''}
                            onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editData.contactName || ''}
                            onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={editData.source || ''}
                            onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ colorScheme: 'dark' }}
                          >
                            {SOURCES.map(src => (
                              <option key={src} value={src} className="bg-slate-800 text-white">{src}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <select
                            value={editData.stage || ''}
                            onChange={(e) => setEditData({ ...editData, stage: e.target.value })}
                            className="px-2 py-1.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ colorScheme: 'dark' }}
                          >
                            {STAGES.map(stg => (
                              <option key={stg} value={stg} className="bg-slate-800 text-white">{stg.replace(/_/g, ' ')}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editData.value || ''}
                            onChange={(e) => setEditData({ ...editData, value: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editData.notes || ''}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleUpdateLead(lead.id)}
                              className="p-1.5 text-green-400 hover:bg-green-500/20 rounded"
                              title="Save"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-slate-400 hover:bg-slate-800/50 rounded"
                              title="Cancel"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <Link href={`/crm/${lead.id}`} className="text-blue-400 hover:underline font-medium">
                            {lead.companyName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <div>{lead.contactName}</div>
                          {lead.contactPhone && (
                            <div className="text-xs text-slate-400">{lead.contactPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800/50 text-slate-300">
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${stageColors[lead.stage] || 'bg-slate-800/50 text-slate-200 border-white/10'}`}>
                            {STAGE_DISPLAY[lead.stage] || lead.stage.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {lead.value ? `${formatCurrency(lead.value)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-xs" title={lead.notes || ''}>
                          {formatNotes(lead.notes)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(lead)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-400 px-1">
        <span>Showing {filteredLeads.length} of {leads.length} leads</span>
        <div className="flex gap-4">
          <span>Pipeline: <strong className="text-white">{formatCurrency(pipelineValue)}</strong></span>
          <span>Won: <strong className="text-green-400">{formatCurrency(wonValue)}</strong></span>
        </div>
      </div>
    </div>
  )
}
