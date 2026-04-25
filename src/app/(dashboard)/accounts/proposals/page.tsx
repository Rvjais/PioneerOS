'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Service {
  serviceId: string
  name: string
  price: number
  isRequired: boolean
  isSelected: boolean
}

interface Proposal {
  id: string
  token: string
  prospectName: string
  prospectEmail: string
  prospectPhone: string | null
  prospectCompany: string | null
  services: Service[]
  basePrice: number
  gstPercentage: number
  totalPrice: number
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'CONVERTED'
  entityType: string
  expiresAt: string
  viewedAt: string | null
  acceptedAt: string | null
  clientId: string | null
  createdAt: string
}

const statusColors = {
  DRAFT: 'bg-slate-900/20 text-slate-400 border-slate-500/30',
  SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  VIEWED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ACCEPTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CONVERTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const entityColors: Record<string, string> = {
  BRANDING_PIONEERS: 'bg-blue-500/20 text-blue-400',
  ATZ_MEDAPPZ: 'bg-purple-500/20 text-purple-400',
}

const PROPOSAL_CREATE_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']

export default function ProposalsPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role || ''
  const canCreateProposal = PROPOSAL_CREATE_ROLES.includes(userRole)

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchProposals()
  }, [filter, search])

  const fetchProposals = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      if (search) params.append('search', search)

      const res = await fetch(`/api/accounts/proposals?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProposals(data.proposals || [])
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendProposal = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/proposals/${id}/send`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        copyToClipboard(data.proposalUrl, id)
        fetchProposals()
      }
    } catch (error) {
      console.error('Error sending proposal:', error)
    }
  }

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const deleteProposal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return

    try {
      const res = await fetch(`/api/accounts/proposals/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchProposals()
      }
    } catch (error) {
      console.error('Error deleting proposal:', error)
    }
  }

  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'DRAFT').length,
    sent: proposals.filter(p => p.status === 'SENT').length,
    viewed: proposals.filter(p => p.status === 'VIEWED').length,
    accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
    converted: proposals.filter(p => p.status === 'CONVERTED').length,
    totalValue: proposals.filter(p => !['DRAFT'].includes(p.status)).reduce((sum, p) => sum + p.totalPrice, 0),
    acceptedValue: proposals.filter(p => ['ACCEPTED', 'CONVERTED'].includes(p.status)).reduce((sum, p) => sum + p.totalPrice, 0),
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Client Proposals</h1>
            <InfoTooltip
              title="Client Proposals"
              steps={[
                'Create proposal with services & pricing',
                'Send link to client for review',
                'Client reviews and accepts proposal',
                'Convert to client after payment',
              ]}
              tips={[
                'Set appropriate validity period',
                'Follow up before expiry',
                'Check if client has viewed the proposal',
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Create and manage client proposals</p>
        </div>

        {canCreateProposal && (
          <Link
            href="/accounts/proposals/new"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Proposal
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-slate-900/10 border border-slate-500/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/10 border border-slate-500/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Draft</p>
          <p className="text-2xl font-bold text-white">{stats.draft}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Sent</p>
          <p className="text-2xl font-bold text-white">{stats.sent}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Viewed</p>
          <p className="text-2xl font-bold text-white">{stats.viewed}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Accepted</p>
          <p className="text-2xl font-bold text-white">{stats.accepted}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-purple-400 text-sm">Converted</p>
          <p className="text-2xl font-bold text-white">{stats.converted}</p>
        </div>
        <div className="bg-slate-900/10 border border-slate-500/30 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pipeline Value</p>
          <p className="text-xl font-bold text-white">Rs.{(stats.totalValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Won Value</p>
          <p className="text-xl font-bold text-white">Rs.{(stats.acceptedValue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or company..."
          className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="VIEWED">Viewed</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="CONVERTED">Converted</option>
        </select>
      </div>

      {/* Proposals Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {search || filter !== 'all' ? 'No proposals found matching your filters' : 'No proposals yet. Create your first proposal!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Prospect</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Company</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Services</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Entity</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Expires</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {proposals.map(proposal => (
                  <tr key={proposal.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{proposal.prospectName}</p>
                      <p className="text-xs text-slate-400">{proposal.prospectEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {proposal.prospectCompany || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {proposal.services.slice(0, 2).map(s => s.name).join(', ')}
                      {proposal.services.length > 2 && ` +${proposal.services.length - 2}`}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-emerald-400 font-medium">Rs.{proposal.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Base: Rs.{proposal.basePrice.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${entityColors[proposal.entityType] || 'bg-slate-900/20 text-slate-400'}`}>
                        {proposal.entityType === 'BRANDING_PIONEERS' ? 'BP' : 'ATZ'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={isExpired(proposal.expiresAt) && proposal.status === 'SENT' ? 'text-red-400' : 'text-slate-300'}>
                        {formatDateDDMMYYYY(proposal.expiresAt)}
                      </span>
                      {isExpired(proposal.expiresAt) && proposal.status === 'SENT' && (
                        <p className="text-xs text-red-400">Expired</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${statusColors[proposal.status]}`}>
                        {proposal.status}
                      </span>
                      {proposal.viewedAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          Viewed: {formatDateDDMMYYYY(proposal.viewedAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {canCreateProposal && proposal.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => sendProposal(proposal.id)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            >
                              Send
                            </button>
                            <Link
                              href={`/accounts/proposals/${proposal.id}`}
                              className="px-2 py-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs rounded transition-colors"
                            >
                              Edit
                            </Link>
                          </>
                        )}
                        {['SENT', 'VIEWED'].includes(proposal.status) && (
                          <button
                            onClick={() => copyToClipboard(`${window.location.origin}/proposal/${proposal.token}`, proposal.id)}
                            className={`px-2 py-1 ${copiedId === proposal.id ? 'bg-emerald-600' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'} text-white text-xs rounded transition-colors`}
                          >
                            {copiedId === proposal.id ? 'Copied!' : 'Copy Link'}
                          </button>
                        )}
                        {proposal.status === 'ACCEPTED' && (
                          <Link
                            href={`/accounts/proposals/${proposal.id}`}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                          >
                            View Details
                          </Link>
                        )}
                        {proposal.status === 'CONVERTED' && proposal.clientId && (
                          <Link
                            href={`/clients/${proposal.clientId}`}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
                          >
                            View Client
                          </Link>
                        )}
                        {canCreateProposal && ['DRAFT', 'SENT'].includes(proposal.status) && (
                          <button
                            onClick={() => deleteProposal(proposal.id)}
                            className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
