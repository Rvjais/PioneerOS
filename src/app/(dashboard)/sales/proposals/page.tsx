'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Proposal {
  id: string
  title: string
  value: number
  services: string | null
  validUntil: string
  status: string
  documentUrl: string | null
  createdAt: string
  lead: {
    id: string
    companyName: string
    contactName: string
    contactEmail: string | null
    pipeline: string | null
  }
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-800/50 text-slate-200',
  SENT: 'bg-blue-500/20 text-blue-400',
  VIEWED: 'bg-purple-500/20 text-purple-400',
  ACCEPTED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState({ status: '' })
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    setError(null)
    try {
      const res = await fetch('/api/sales/proposals')
      if (!res.ok) throw new Error('Failed to load proposals')
      const data = await res.json()
      setProposals(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch proposals:', err)
      setError('Failed to load proposals. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    const previousProposals = [...proposals]
    // Optimistic update
    setProposals(proposals.map(p => p.id === id ? { ...p, status } : p))
    try {
      const res = await fetch('/api/sales/proposals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        // Rollback on failure
        setProposals(previousProposals)
      }
    } catch (err) {
      console.error('Failed to update proposal:', err)
      setProposals(previousProposals)
    } finally {
      setUpdatingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const filteredProposals = proposals.filter(p => {
    if (filter.status && p.status !== filter.status) return false
    if (search) {
      const q = search.toLowerCase()
      const titleMatch = p.title.toLowerCase().includes(q)
      const companyMatch = p.lead?.companyName?.toLowerCase().includes(q) ?? false
      if (!titleMatch && !companyMatch) return false
    }
    return true
  })

  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'DRAFT').length,
    sent: proposals.filter(p => p.status === 'SENT').length,
    accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
    totalValue: proposals.reduce((sum, p) => sum + p.value, 0),
    acceptedValue: proposals.filter(p => p.status === 'ACCEPTED').reduce((sum, p) => sum + p.value, 0),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Proposals</h1>
          <p className="text-sm text-slate-400">Manage and track proposals</p>
        </div>
        <Link
          href="/sales/proposals/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Proposal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-lg border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Proposals</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass-card rounded-lg border border-white/10 p-4">
          <p className="text-sm text-slate-400">Draft</p>
          <p className="text-2xl font-bold text-slate-300">{stats.draft}</p>
        </div>
        <div className="glass-card rounded-lg border border-white/10 p-4">
          <p className="text-sm text-slate-400">Sent</p>
          <p className="text-2xl font-bold text-blue-400">{stats.sent}</p>
        </div>
        <div className="glass-card rounded-lg border border-white/10 p-4">
          <p className="text-sm text-slate-400">Accepted</p>
          <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
        </div>
        <div className="glass-card rounded-lg border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Value</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 p-3 rounded-lg border border-white/10">
        <input
          type="text"
          placeholder="Search by title or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
          className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="" className="bg-slate-900">All Status</option>
          <option value="DRAFT" className="bg-slate-900">Draft</option>
          <option value="SENT" className="bg-slate-900">Sent</option>
          <option value="VIEWED" className="bg-slate-900">Viewed</option>
          <option value="ACCEPTED" className="bg-slate-900">Accepted</option>
          <option value="REJECTED" className="bg-slate-900">Rejected</option>
        </select>
        {(filter.status || search) && (
          <button
            onClick={() => { setFilter({ status: '' }); setSearch('') }}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Proposals Table */}
      <div className="glass-card rounded-lg border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-slate-900/40 border-b border-white/10">
              <th className="text-left px-4 py-3 font-medium text-slate-300">Proposal</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Lead</th>
              <th className="text-right px-4 py-3 font-medium text-slate-300">Value</th>
              <th className="text-center px-4 py-3 font-medium text-slate-300">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Valid Until</th>
              <th className="text-center px-4 py-3 font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredProposals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-white font-medium">
                      {search || filter.status ? 'No Matching Proposals' : 'No Proposals Yet'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {search
                        ? `No results found for "${search}". Try adjusting your search terms.`
                        : filter.status
                          ? `No proposals with status "${filter.status}".`
                          : 'Create your first proposal to get started.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProposals.map(proposal => (
                <tr key={proposal.id} className="hover:bg-slate-900/40 group">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{proposal.title}</div>
                    <div className="text-xs text-slate-400">Created {formatDate(proposal.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/sales/leads/${proposal.lead.id}`}
                      className="text-orange-600 hover:underline font-medium"
                    >
                      {proposal.lead.companyName}
                    </Link>
                    <div className="text-xs text-slate-400">{proposal.lead.contactName}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-white">
                    {formatCurrency(proposal.value)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={proposal.status}
                      onChange={(e) => handleStatusChange(proposal.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded cursor-pointer ${STATUS_COLORS[proposal.status]}`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SENT">Sent</option>
                      <option value="VIEWED">Viewed</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatDate(proposal.validUntil)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {proposal.documentUrl && (
                        <a
                          href={proposal.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-500/10 rounded"
                          title="View Document"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      <Link
                        href={`/sales/proposals/${proposal.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
  )
}
