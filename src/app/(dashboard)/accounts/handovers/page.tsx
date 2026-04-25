'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'

interface Handover {
  id: string
  status: string
  paymentTerms: string | null
  servicesAgreed: string | null
  specialTerms: string | null
  proposalUrl: string | null
  dealValue: number | null
  rfpSummary: string | null
  nurturingHistory: string | null
  keyContacts: string | null
  notes: string | null
  acknowledgedAt: string | null
  completedAt: string | null
  createdAt: string
  lead: {
    id: string
    companyName: string
    contactName: string
    contactEmail: string | null
    contactPhone: string | null
    pipeline: string | null
    value: number | null
    primaryObjective: string | null
    budgetRange: string | null
  }
  salesUser: {
    firstName: string
    lastName: string | null
  }
  accountsUser: {
    firstName: string
    lastName: string | null
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  ACKNOWLEDGED: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
}

export default function AccountsHandoversPage() {
  const [handovers, setHandovers] = useState<Handover[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHandover, setSelectedHandover] = useState<Handover | null>(null)

  useEffect(() => {
    fetchHandovers()
  }, [])

  const fetchHandovers = async () => {
    try {
      const res = await fetch('/api/sales/handover')
      if (res.ok) {
        const data = await res.json()
        setHandovers(data)
      }
    } catch (error) {
      console.error('Failed to fetch handovers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch('/api/sales/handover', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'ACKNOWLEDGED' }),
      })

      if (res.ok) {
        setHandovers(handovers.map(h =>
          h.id === id ? { ...h, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() } : h
        ))
      }
    } catch (error) {
      console.error('Failed to acknowledge handover:', error)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch('/api/sales/handover', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'COMPLETED' }),
      })

      if (res.ok) {
        setHandovers(handovers.map(h =>
          h.id === id ? { ...h, status: 'COMPLETED', completedAt: new Date().toISOString() } : h
        ))
        setSelectedHandover(null)
      }
    } catch (error) {
      console.error('Failed to complete handover:', error)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
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

  const pendingHandovers = handovers.filter(h => h.status === 'PENDING')
  const activeHandovers = handovers.filter(h => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(h.status))
  const completedHandovers = handovers.filter(h => h.status === 'COMPLETED')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Accounts', href: '/accounts' },
        { label: 'Handovers' },
      ]} />
      <div>
        <h1 className="text-xl font-semibold text-white">Client Handovers</h1>
        <p className="text-sm text-slate-400">Receive and process handovers from Sales team</p>
      </div>

      {/* Pending Handovers */}
      {pendingHandovers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Pending Handovers ({pendingHandovers.length})
          </h2>
          <div className="space-y-3">
            {pendingHandovers.map(handover => (
              <div
                key={handover.id}
                className="bg-amber-500/10 rounded-lg border border-amber-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{handover.lead.companyName}</h3>
                    <p className="text-sm text-slate-300">
                      {handover.lead.contactName} | {handover.lead.contactEmail}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Handed over by {handover.salesUser.firstName} {handover.salesUser.lastName} on {formatDate(handover.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(handover.dealValue)}
                    </p>
                    <button
                      onClick={() => handleAcknowledge(handover.id)}
                      className="mt-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Handovers */}
      {activeHandovers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-blue-400 mb-3">
            In Progress ({activeHandovers.length})
          </h2>
          <div className="space-y-3">
            {activeHandovers.map(handover => (
              <div
                key={handover.id}
                className="glass-card rounded-lg border border-white/10 p-4 hover:shadow-none transition-shadow cursor-pointer"
                onClick={() => setSelectedHandover(handover)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{handover.lead.companyName}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${STATUS_COLORS[handover.status]}`}>
                        {handover.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {handover.lead.contactName} | {handover.lead.contactEmail}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(handover.dealValue)}
                  </p>
                </div>

                {handover.servicesAgreed && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {JSON.parse(handover.servicesAgreed).map((service: string) => (
                      <span
                        key={service}
                        className="px-2 py-0.5 text-xs bg-slate-800/50 text-slate-300 rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedHandovers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-green-400 mb-3">
            Completed ({completedHandovers.length})
          </h2>
          <div className="space-y-3">
            {completedHandovers.slice(0, 5).map(handover => (
              <div
                key={handover.id}
                className="bg-green-500/10 rounded-lg border border-green-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{handover.lead.companyName}</h3>
                    <p className="text-sm text-slate-400">{handover.lead.contactName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{formatCurrency(handover.dealValue)}</p>
                    <p className="text-xs text-slate-400">
                      Completed {handover.completedAt ? formatDate(handover.completedAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {handovers.length === 0 && (
        <div className="glass-card rounded-lg border border-white/10 p-12 text-center text-slate-400">
          No handovers yet
        </div>
      )}

      {/* Handover Detail Modal */}
      {selectedHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass-card rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-lg">{selectedHandover.lead.companyName}</h3>
                  <p className="text-emerald-100 text-sm">{selectedHandover.lead.contactName}</p>
                </div>
                <button
                  onClick={() => setSelectedHandover(null)}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="font-medium text-slate-200 mb-2">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Email:</span>{' '}
                    <a href={`mailto:${selectedHandover.lead.contactEmail}`} className="text-emerald-600 hover:underline">
                      {selectedHandover.lead.contactEmail}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>{' '}
                    <a href={`tel:${selectedHandover.lead.contactPhone}`} className="text-emerald-600 hover:underline">
                      {selectedHandover.lead.contactPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Deal Info */}
              <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <h4 className="font-medium text-emerald-700 mb-2">Deal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Deal Value:</span>{' '}
                    <span className="font-bold text-emerald-700">{formatCurrency(selectedHandover.dealValue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment Terms:</span>{' '}
                    <span className="text-slate-200">{selectedHandover.paymentTerms || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              {selectedHandover.servicesAgreed && (
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">Services Agreed</h4>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(selectedHandover.servicesAgreed).map((service: string) => (
                      <span
                        key={service}
                        className="px-3 py-1 text-sm bg-slate-800/50 text-slate-200 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* RFP Summary */}
              {selectedHandover.rfpSummary && (
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">RFP Summary</h4>
                  <p className="text-sm text-slate-300 bg-slate-900/40 p-3 rounded-lg">
                    {selectedHandover.rfpSummary}
                  </p>
                </div>
              )}

              {/* Special Terms */}
              {selectedHandover.specialTerms && (
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">Special Terms</h4>
                  <p className="text-sm text-slate-300 bg-amber-500/10 p-3 rounded-lg border border-amber-200">
                    {selectedHandover.specialTerms}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedHandover.notes && (
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">Handover Notes</h4>
                  <p className="text-sm text-slate-300 bg-slate-900/40 p-3 rounded-lg">
                    {selectedHandover.notes}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3">
                {selectedHandover.proposalUrl && (
                  <a
                    href={selectedHandover.proposalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-500/10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Proposal
                  </a>
                )}
                <Link
                  href={`/accounts/clients/onboard?leadId=${selectedHandover.lead.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 border border-white/10 rounded-lg hover:bg-slate-900/40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Start Onboarding
                </Link>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-between bg-slate-900/40">
              <button
                onClick={() => setSelectedHandover(null)}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Close
              </button>
              {selectedHandover.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleComplete(selectedHandover.id)}
                  className="px-6 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
