'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Filter, Eye, Copy, Check, Clock, CheckCircle,
  AlertCircle, Users, CreditCard, FileText, Rocket, MoreVertical,
  ExternalLink, RefreshCw
} from 'lucide-react'

interface Proposal {
  id: string
  token: string
  status: string
  currentStep: number
  prospectName: string
  prospectEmail: string
  prospectCompany: string | null
  entityType: string
  totalPrice: number
  advanceAmount: number | null
  slaAccepted: boolean
  paymentConfirmed: boolean
  accountOnboardingCompleted: boolean
  managerReviewed: boolean
  portalActivated: boolean
  createdAt: string
  expiresAt: string
  viewedAt: string | null
  createdByName: string | null
  url: string
}

interface Props {
  initialProposals: Proposal[]
  stats: {
    total: number
    pendingPayment: number
    pendingOnboarding: number
    pendingReview: number
    activated: number
  }
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SENT: { label: 'Sent', color: 'gray', icon: Clock },
  VIEWED: { label: 'Viewed', color: 'blue', icon: Eye },
  DETAILS_CONFIRMED: { label: 'Details Confirmed', color: 'indigo', icon: FileText },
  SLA_SIGNED: { label: 'SLA Signed', color: 'purple', icon: FileText },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', color: 'yellow', icon: CreditCard },
  PAYMENT_CONFIRMED: { label: 'Payment Confirmed', color: 'green', icon: CheckCircle },
  ONBOARDING_COMPLETED: { label: 'Onboarding Done', color: 'teal', icon: Users },
  ACTIVATED: { label: 'Activated', color: 'emerald', icon: Rocket },
  EXPIRED: { label: 'Expired', color: 'red', icon: AlertCircle },
}

export default function OnboardingListClient({ initialProposals, stats }: Props) {
  const [proposals, setProposals] = useState(initialProposals)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusBadge = (proposal: Proposal) => {
    // Check for expiration
    if (new Date() > new Date(proposal.expiresAt) && !proposal.portalActivated) {
      const config = statusConfig.EXPIRED
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          <config.icon className="w-3 h-3 mr-1" />
          {config.label}
        </span>
      )
    }

    const config = statusConfig[proposal.status] || statusConfig.SENT
    const colorClasses: Record<string, string> = {
      gray: 'bg-gray-800/50 text-gray-200',
      blue: 'bg-blue-500/20 text-blue-400',
      indigo: 'bg-indigo-500/20 text-indigo-400',
      purple: 'bg-purple-500/20 text-purple-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
      green: 'bg-green-500/20 text-green-400',
      teal: 'bg-teal-500/20 text-teal-400',
      emerald: 'bg-emerald-500/20 text-emerald-400',
      red: 'bg-red-500/20 text-red-400',
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  // Filter proposals
  const filteredProposals = proposals.filter(p => {
    const matchesSearch =
      p.prospectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prospectEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.prospectCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'pending_payment') return matchesSearch && p.slaAccepted && !p.paymentConfirmed
    if (statusFilter === 'pending_onboarding') return matchesSearch && p.paymentConfirmed && !p.accountOnboardingCompleted
    if (statusFilter === 'pending_review') return matchesSearch && p.accountOnboardingCompleted && !p.managerReviewed
    if (statusFilter === 'activated') return matchesSearch && p.portalActivated
    return matchesSearch && p.status === statusFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Onboarding</h1>
          <p className="text-gray-400">Manage client onboarding proposals and payments</p>
        </div>
        <Link
          href="/accounts/onboarding/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Link
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'gray' },
          { label: 'Pending Payment', value: stats.pendingPayment, color: 'yellow' },
          { label: 'Pending Onboarding', value: stats.pendingOnboarding, color: 'blue' },
          { label: 'Pending Review', value: stats.pendingReview, color: 'purple' },
          { label: 'Activated', value: stats.activated, color: 'green' },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-lg border border-white/10 p-4">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-lg border border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="pending_onboarding">Pending Onboarding</option>
              <option value="pending_review">Pending Review</option>
              <option value="activated">Activated</option>
              <option value="SENT">Sent</option>
              <option value="VIEWED">Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Step</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No proposals found
                  </td>
                </tr>
              ) : (
                filteredProposals.map(proposal => (
                  <tr key={proposal.id} className="hover:bg-gray-900/40">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{proposal.prospectName}</p>
                        <p className="text-sm text-gray-400">{proposal.prospectEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-300">
                        {proposal.entityType === 'BRANDING_PIONEERS' ? 'BP' : 'ATZ'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{formatCurrency(proposal.totalPrice)}</p>
                      {proposal.advanceAmount && proposal.advanceAmount !== proposal.totalPrice && (
                        <p className="text-xs text-gray-400">Adv: {formatCurrency(proposal.advanceAmount)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(proposal)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5, 6].map(step => (
                          <div
                            key={step}
                            className={`w-2 h-2 rounded-full ${
                              step <= proposal.currentStep ? 'bg-blue-500' : 'bg-white/10'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-gray-400">{proposal.currentStep}/6</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-300">{formatDate(proposal.createdAt)}</p>
                      {proposal.viewedAt && (
                        <p className="text-xs text-gray-400">Viewed</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyLink(proposal.url, proposal.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded"
                          title="Copy Link"
                        >
                          {copiedId === proposal.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={proposal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded"
                          title="Open Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/accounts/onboarding/${proposal.id}`}
                          className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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
    </div>
  )
}
