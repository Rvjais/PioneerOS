'use client'

import { useState } from 'react'

interface Lead {
  id: string
  companyName: string
  contactName: string
  stage: string
  value?: number | null
}

interface LeadDropdownProps {
  leads: Lead[]
  selectedLeadId: string | null
  onSelect: (leadId: string | null) => void
  onQuickAdd?: () => void
  disabled?: boolean
}

const STAGE_COLORS: Record<string, string> = {
  LEAD_RECEIVED: 'bg-slate-800/50 text-slate-200',
  RFP_SENT: 'bg-blue-500/20 text-blue-400',
  RFP_COMPLETED: 'bg-indigo-500/20 text-indigo-400',
  PROPOSAL_SHARED: 'bg-purple-500/20 text-purple-400',
  FOLLOW_UP_ONGOING: 'bg-amber-500/20 text-amber-400',
  MEETING_SCHEDULED: 'bg-cyan-100 text-cyan-700',
  PROPOSAL_DISCUSSION: 'bg-pink-500/20 text-pink-400',
  WON: 'bg-green-500/20 text-green-400',
  LOST: 'bg-red-500/20 text-red-400',
}

export function LeadDropdown({
  leads,
  selectedLeadId,
  onSelect,
  onQuickAdd,
  disabled = false,
}: LeadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedLead = leads.find(l => l.id === selectedLeadId)
  const filteredLeads = leads.filter(lead =>
    lead.companyName.toLowerCase().includes(search.toLowerCase()) ||
    lead.contactName.toLowerCase().includes(search.toLowerCase())
  )

  const formatStage = (stage: string) => {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-400 mb-1">Lead</label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border rounded-lg flex items-center justify-between ${
          disabled ? 'bg-slate-800/50 cursor-not-allowed' : 'glass-card hover:border-slate-400'
        } border-white/10`}
      >
        <span className={selectedLead ? 'text-white' : 'text-slate-400'}>
          {selectedLead ? (
            <span className="flex items-center gap-2">
              <span>{selectedLead.companyName}</span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded ${STAGE_COLORS[selectedLead.stage] || 'bg-slate-800/50'}`}>
                {formatStage(selectedLead.stage)}
              </span>
            </span>
          ) : (
            'Select lead...'
          )}
        </span>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full glass-card border border-white/10 rounded-lg shadow-none max-h-64 overflow-hidden">
            {/* Search + Quick Add */}
            <div className="p-2 border-b border-white/5 flex gap-2">
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-white/10 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {onQuickAdd && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onQuickAdd()
                  }}
                  className="px-2 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Add
                </button>
              )}
            </div>

            {/* Options */}
            <div className="overflow-y-auto max-h-48">
              {/* Clear option */}
              {selectedLeadId && (
                <button
                  type="button"
                  onClick={() => {
                    onSelect(null)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-900/40"
                >
                  Clear selection
                </button>
              )}

              {filteredLeads.length === 0 ? (
                <div className="p-3 text-sm text-slate-400 text-center">
                  No leads found
                </div>
              ) : (
                filteredLeads.map(lead => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => {
                      onSelect(lead.id)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-900/40 ${
                      lead.id === selectedLeadId ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{lead.companyName}</p>
                        <p className="text-xs text-slate-400">{lead.contactName}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded ${STAGE_COLORS[lead.stage] || 'bg-slate-800/50'}`}>
                        {formatStage(lead.stage)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
