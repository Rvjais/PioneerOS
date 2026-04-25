'use client'

import { useState } from 'react'

interface Lead {
  id: string
  company: string
  contact: string
  stage: 'LEAD_RECEIVED' | 'RFP_SENT' | 'PROPOSAL_SHARED' | 'FOLLOW_UP' | 'MEETING_SCHEDULED'
  value: number
  services: string[]
  owner: string
  lastActivity: string
  source: string
}

const LEADS: Lead[] = [
  { id: '1', company: 'Fortis Healthcare', contact: 'Dr. Mehta', stage: 'PROPOSAL_SHARED', value: 200000, services: ['SEO', 'Ads', 'Social'], owner: 'Abhishek', lastActivity: '2024-03-10', source: 'Referral' },
  { id: '2', company: 'Manipal Hospitals', contact: 'Mr. Sharma', stage: 'MEETING_SCHEDULED', value: 350000, services: ['SEO', 'Web', 'AI'], owner: 'Abhishek', lastActivity: '2024-03-11', source: 'Website' },
  { id: '3', company: 'Narayana Health', contact: 'Ms. Gupta', stage: 'RFP_SENT', value: 150000, services: ['Social', 'Ads'], owner: 'Sales Team', lastActivity: '2024-03-09', source: 'LinkedIn' },
  { id: '4', company: 'Medanta Hospital', contact: 'Dr. Verma', stage: 'FOLLOW_UP', value: 280000, services: ['SEO', 'Ads', 'Web'], owner: 'Abhishek', lastActivity: '2024-03-08', source: 'Cold Outreach' },
  { id: '5', company: 'KIMS Hospital', contact: 'Mr. Reddy', stage: 'LEAD_RECEIVED', value: 120000, services: ['SEO'], owner: 'Sales Team', lastActivity: '2024-03-10', source: 'Website' },
]

export default function ManagerSalesPipelinePage() {
  const [stageFilter, setStageFilter] = useState<string>('all')

  const filteredLeads = stageFilter === 'all' ? LEADS : LEADS.filter(l => l.stage === stageFilter)

  const totalValue = LEADS.reduce((sum, l) => sum + l.value, 0)
  const proposalValue = LEADS.filter(l => l.stage === 'PROPOSAL_SHARED' || l.stage === 'MEETING_SCHEDULED').reduce((sum, l) => sum + l.value, 0)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'LEAD_RECEIVED': return 'bg-slate-800/50 text-slate-200'
      case 'RFP_SENT': return 'bg-blue-500/20 text-blue-400'
      case 'PROPOSAL_SHARED': return 'bg-purple-500/20 text-purple-400'
      case 'FOLLOW_UP': return 'bg-amber-500/20 text-amber-400'
      case 'MEETING_SCHEDULED': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const stageOrder = ['LEAD_RECEIVED', 'RFP_SENT', 'PROPOSAL_SHARED', 'FOLLOW_UP', 'MEETING_SCHEDULED']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sales Pipeline Overview</h1>
            <p className="text-orange-100">Active leads and opportunities</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-orange-100 text-sm">Pipeline Value</p>
              <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-sm">Hot Leads</p>
              <p className="text-3xl font-bold">{formatCurrency(proposalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Stats */}
      <div className="grid grid-cols-5 gap-4">
        {stageOrder.map(stage => {
          const count = LEADS.filter(l => l.stage === stage).length
          const value = LEADS.filter(l => l.stage === stage).reduce((sum, l) => sum + l.value, 0)
          return (
            <button
              key={stage}
              onClick={() => setStageFilter(stageFilter === stage ? 'all' : stage)}
              className={`p-4 rounded-xl border-2 transition-all ${
                stageFilter === stage ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 glass-card hover:border-orange-300'
              }`}
            >
              <p className="text-xs text-slate-400">{stage.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-sm text-slate-400">{formatCurrency(value)}</p>
            </button>
          )
        })}
      </div>

      {/* Leads Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">COMPANY</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STAGE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">VALUE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">SERVICES</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">OWNER</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">LAST ACTIVITY</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <p className="font-medium text-white">{lead.company}</p>
                  <p className="text-sm text-slate-400">{lead.contact}</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStageColor(lead.stage)}`}>
                    {lead.stage.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-medium text-white">{formatCurrency(lead.value)}/mo</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex gap-1 justify-center flex-wrap">
                    {lead.services.map(s => (
                      <span key={s} className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">{lead.owner}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-400">
                    {new Date(lead.lastActivity).toLocaleDateString('en-IN')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sales Insights */}
      <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
        <h3 className="font-semibold text-orange-800 mb-3">Pipeline Insights</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-orange-700">
          <div>
            <p className="font-medium mb-1">Hot Opportunities</p>
            <ul className="space-y-1">
              <li>- Manipal: Meeting scheduled, 3.5L</li>
              <li>- Fortis: Proposal shared, 2L</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Needs Attention</p>
            <ul className="space-y-1">
              <li>- Medanta: No activity in 3 days</li>
              <li>- KIMS: New lead, needs RFP</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">This Week Target</p>
            <ul className="space-y-1">
              <li>- Close 2 deals (5.5L potential)</li>
              <li>- Send 3 new proposals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
