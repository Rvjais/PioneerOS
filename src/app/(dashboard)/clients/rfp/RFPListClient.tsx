'use client'

import { useState, useMemo } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface RFP {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  websiteUrl: string | null
  industry: string | null
  monthlyBudget: number | null
  budgetRange: string | null
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  REVIEWED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  CONVERTED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'NEW', label: 'New' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'REJECTED', label: 'Rejected' },
]

export function RFPTableClient({ rfps }: { rfps: RFP[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return rfps.filter(rfp => {
      if (statusFilter && rfp.status !== statusFilter) return false
      if (q && !rfp.companyName.toLowerCase().includes(q)) return false
      return true
    })
  }, [rfps, search, statusFilter])

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Search + Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-white/5">
        <input
          type="text"
          placeholder="Search by company name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
          ))}
        </select>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('') }}
            className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 backdrop-blur-sm">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Company</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Contact</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Industry</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Budget</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                  {search || statusFilter ? 'No RFPs match your filters.' : (
                    <>
                      <svg className="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      No RFP submissions yet. Send an RFP form to leads and their responses will appear here.
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((rfp) => (
                <tr key={rfp.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium">{rfp.companyName}</p>
                    {rfp.websiteUrl && <p className="text-xs text-blue-400">{rfp.websiteUrl}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-white">{rfp.contactName}</p>
                    <p className="text-xs text-slate-400">{rfp.contactEmail || rfp.contactPhone}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{rfp.industry || '\u2014'}</td>
                  <td className="px-5 py-4 text-sm text-slate-300">
                    {rfp.monthlyBudget ? `\u20B9${rfp.monthlyBudget.toLocaleString('en-IN')}` : rfp.budgetRange || '\u2014'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[rfp.status] || statusColors.NEW}`}>
                      {rfp.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">
                    {formatDateDDMMYYYY(rfp.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
