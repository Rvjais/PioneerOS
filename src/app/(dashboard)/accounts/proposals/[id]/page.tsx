'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface Service {
  serviceId: string
  name: string
  price: number
  isRequired: boolean
  isSelected: boolean
}

interface ScopeItem {
  id: string
  category: string
  item: string
  quantity: number
  isModifiable: boolean
  min: number
  max: number
  unit?: string
}

interface Proposal {
  id: string
  token: string
  prospectName: string
  prospectEmail: string
  prospectPhone: string | null
  prospectCompany: string | null
  services: Service[]
  scopeItems: ScopeItem[]
  basePrice: number
  gstPercentage: number
  totalPrice: number
  allowServiceModification: boolean
  allowScopeModification: boolean
  status: string
  entityType: string
  expiresAt: string
  viewedAt: string | null
  acceptedAt: string | null
  clientId: string | null
  clientName: string | null
  clientEmail: string | null
  clientPhone: string | null
  clientCompany: string | null
  clientGst: string | null
  selectedServices: Service[] | null
  selectedScope: ScopeItem[] | null
  finalPrice: number | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-900/20 text-slate-400 border-slate-500/30',
  SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  VIEWED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ACCEPTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CONVERTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)

  const fetchProposal = useCallback(async () => {
    try {
      const res = await fetch(`/api/accounts/proposals/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProposal(data.proposal)
      } else {
        router.push('/accounts/proposals')
      }
    } catch (error) {
      console.error('Error fetching proposal:', error)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchProposal()
  }, [fetchProposal])

  const copyLink = async () => {
    if (!proposal) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/proposal/${proposal.token}`)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const sendProposal = async () => {
    try {
      const res = await fetch(`/api/accounts/proposals/${id}/send`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        await navigator.clipboard.writeText(data.proposalUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
        fetchProposal()
      } else {
        toast.error('Failed to send proposal')
      }
    } catch (error) {
      console.error('Error sending proposal:', error)
      toast.error('Failed to send proposal')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Proposal not found</p>
        <Link href="/accounts/proposals" className="text-emerald-400 hover:underline mt-2 inline-block">
          Back to Proposals
        </Link>
      </div>
    )
  }

  const isExpired = new Date(proposal.expiresAt) < new Date()
  const displayServices = proposal.selectedServices || proposal.services
  const displayScope = proposal.selectedScope || proposal.scopeItems
  const displayPrice = proposal.finalPrice || proposal.totalPrice

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/accounts/proposals" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to Proposals
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{proposal.prospectName}</h1>
            <span className={`px-2 py-1 text-xs rounded-full border ${statusColors[proposal.status]}`}>
              {proposal.status}
            </span>
          </div>
          <p className="text-slate-400 mt-1">{proposal.prospectEmail}</p>
        </div>

        <div className="flex gap-2">
          {proposal.status === 'DRAFT' && (
            <button
              onClick={sendProposal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Send Proposal
            </button>
          )}
          {['SENT', 'VIEWED'].includes(proposal.status) && (
            <button
              onClick={copyLink}
              className={`px-4 py-2 ${copiedLink ? 'bg-emerald-600' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'} text-white rounded-lg transition-colors`}
            >
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      {proposal.status !== 'DRAFT' && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Timeline</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-300">Sent</span>
              <span className="text-xs text-slate-400">{formatDateDDMMYYYY(proposal.createdAt)}</span>
            </div>
            {proposal.viewedAt && (
              <>
                <div className="flex-1 h-px bg-white/10 backdrop-blur-sm" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-slate-300">Viewed</span>
                  <span className="text-xs text-slate-400">{formatDateDDMMYYYY(proposal.viewedAt)}</span>
                </div>
              </>
            )}
            {proposal.acceptedAt && (
              <>
                <div className="flex-1 h-px bg-white/10 backdrop-blur-sm" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Accepted</span>
                  <span className="text-xs text-slate-400">{formatDateDDMMYYYY(proposal.acceptedAt)}</span>
                </div>
              </>
            )}
            {proposal.status === 'CONVERTED' && (
              <>
                <div className="flex-1 h-px bg-white/10 backdrop-blur-sm" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-slate-300">Converted</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Client Details (if accepted) */}
      {proposal.clientName && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-emerald-400 mb-4">Client Submitted Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Name</p>
              <p className="text-white">{proposal.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-white">{proposal.clientEmail}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Phone</p>
              <p className="text-white">{proposal.clientPhone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Company</p>
              <p className="text-white">{proposal.clientCompany || '-'}</p>
            </div>
            {proposal.clientGst && (
              <div>
                <p className="text-sm text-slate-400">GST Number</p>
                <p className="text-white">{proposal.clientGst}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {proposal.selectedServices ? 'Final Selected Services' : 'Proposed Services'}
        </h2>
        <div className="space-y-3">
          {displayServices.filter(s => s.isSelected).map(service => (
            <div key={service.serviceId} className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
              <span className="text-white">{service.name}</span>
              <span className="text-emerald-400">Rs.{service.price.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scope */}
      {displayScope.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Scope of Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayScope.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                <span className="text-slate-300">{item.item}</span>
                <span className="text-white">
                  {item.quantity} {item.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Pricing</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Base Price</span>
            <span className="text-white">Rs.{proposal.basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">GST ({proposal.gstPercentage}%)</span>
            <span className="text-white">Rs.{((proposal.basePrice * proposal.gstPercentage) / 100).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
            <span className="text-white font-semibold">Total</span>
            <span className="text-emerald-400 font-bold text-lg">Rs.{displayPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Expiry Warning */}
      {isExpired && ['SENT', 'VIEWED'].includes(proposal.status) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400">
            This proposal expired on {formatDateDDMMYYYY(proposal.expiresAt)}.
            Consider extending the validity or creating a new proposal.
          </p>
        </div>
      )}

      {/* Actions */}
      {proposal.clientId && (
        <div className="flex justify-end">
          <Link
            href={`/clients/${proposal.clientId}`}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            View Client Profile
          </Link>
        </div>
      )}
    </div>
  )
}
