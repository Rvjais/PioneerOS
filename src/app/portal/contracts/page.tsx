'use client'

import { useState, useEffect } from 'react'
import { getContractStatusColor, getContractStatusLabel } from '@/shared/constants/portal'
import PageGuide from '@/client/components/ui/PageGuide'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

function getServiceLabel(service: string | Record<string, unknown>): string {
  if (typeof service === 'string') return service
  if (typeof service === 'object' && service !== null) {
    return (service.name as string) || (service.serviceId as string) || String(service)
  }
  return String(service)
}

interface Signature {
  name: string | null
  signedAt: string | null
  isSigned: boolean
}

interface Contract {
  id: string
  entityType: string
  entityName: string
  entityAddress: string | null
  clientName: string
  clientAddress: string | null
  clientGstNumber: string | null
  servicesScope: (string | Record<string, unknown>)[]
  customScope: string | null
  monthlyRetainer: number | null
  advanceAmount: number | null
  contractDuration: string | null
  contractDurationFormatted: string
  commencementDate: string | null
  endDate: string | null
  poNumber: string | null
  paymentTerms: string | null
  slaMetrics: string | null
  signatures: {
    client: Signature
    agency: Signature
  }
  status: string
  isFullySigned: boolean
  documentUrl: string | null
  createdAt: string
  updatedAt: string
}

interface ActiveContract {
  id: string
  entityName: string
  servicesScope: (string | Record<string, unknown>)[]
  customScope: string | null
  monthlyRetainer: number | null
  contractDuration: string | null
  contractDurationFormatted: string
  commencementDate: string | null
  endDate: string | null
  isFullySigned: boolean
  documentUrl: string | null
  status: string
}

interface Summary {
  total: number
  signed: number
  pending: number
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [activeContract, setActiveContract] = useState<ActiveContract | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedContract, setExpandedContract] = useState<string | null>(null)

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/client-portal/contracts')
      if (res.ok) {
        const data = await res.json()
        setContracts(data.contracts || [])
        setActiveContract(data.activeContract || null)
        setSummary(data.summary || null)
        setError(null)
      } else if (res.status === 401) {
        setError('Please log in to view contracts')
      } else {
        setError('Failed to load contracts. Please try again.')
      }
    } catch (err) {
      console.error('Failed to fetch contracts:', err)
      setError('Unable to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}-${month}-${d.getFullYear()}`
  }

  if (loading) {
    return <PortalPageSkeleton titleWidth="w-36" statCards={2} listItems={3} />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contracts & SLA</h1>
          <p className="text-slate-300 mt-1">View your service level agreements and contracts</p>
        </div>
        <div className="glass-card rounded-xl p-8 text-center border border-white/10">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-1">{error}</h3>
          <button
            onClick={() => { setError(null); setLoading(true); fetchContracts() }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            aria-label="Retry loading contracts"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="portal-contracts"
        title="Your Contracts"
        description="View active contracts and service agreements"
        steps={[
          { label: 'View contract terms', description: 'Expand any contract to see full details including scope and payment terms' },
          { label: 'Check renewal dates', description: 'See start and end dates for each contract and SLA' },
          { label: 'Download documents', description: 'Download signed contract PDFs using the download button' },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Contracts & SLA</h1>
        <p className="text-slate-300 mt-1">View your service level agreements and contracts</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Total Contracts</p>
            <p className="text-2xl font-bold text-white">{summary.total}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Signed</p>
            <p className="text-2xl font-bold text-green-400">{summary.signed}</p>
          </div>
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-amber-400">{summary.pending}</p>
          </div>
        </div>
      )}

      {/* Active SLA Card */}
      {activeContract && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-none overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium opacity-90">Active SLA</span>
                </div>
                <h3 className="text-xl font-bold">{activeContract.entityName}</h3>
                <p className="text-white/80 mt-1">{activeContract.contractDurationFormatted} Contract</p>
              </div>
              {activeContract.isFullySigned && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <svg className="w-4 h-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-white">Fully Signed</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {activeContract.monthlyRetainer && (
                <div>
                  <p className="text-xs text-white/70">Monthly Retainer</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(activeContract.monthlyRetainer)}</p>
                </div>
              )}
              {activeContract.commencementDate && (
                <div>
                  <p className="text-xs text-white/70">Start Date</p>
                  <p className="text-lg font-semibold text-white">{formatDate(activeContract.commencementDate)}</p>
                </div>
              )}
              {activeContract.endDate && (
                <div>
                  <p className="text-xs text-white/70">End Date</p>
                  <p className="text-lg font-semibold text-white">{formatDate(activeContract.endDate)}</p>
                </div>
              )}
              {activeContract.servicesScope.length > 0 && (
                <div>
                  <p className="text-xs text-white/70">Services</p>
                  <p className="text-lg font-semibold text-white">{activeContract.servicesScope.length} included</p>
                </div>
              )}
            </div>

            {activeContract.servicesScope.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/70 mb-2">Services Scope</p>
                <div className="flex flex-wrap gap-2">
                  {activeContract.servicesScope.map((service, index) => (
                    <span
                      key={`${service}-${index}`}
                      className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded"
                    >
                      {getServiceLabel(service)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeContract.documentUrl && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <a
                  href={activeContract.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 glass-card text-blue-400 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download SLA Document
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract History */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Contract History</h3>
        </div>

        {contracts.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-1">No Contracts Found</h3>
            <p className="text-slate-400">Your contracts and SLA documents will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {contracts.map((contract) => (
              <div key={contract.id}>
                <div
                  className="px-6 py-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
                  onClick={() => setExpandedContract(expandedContract === contract.id ? null : contract.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        contract.isFullySigned ? 'bg-green-500/20' : 'bg-slate-800/50'
                      }`}>
                        <svg className={`w-6 h-6 ${
                          contract.isFullySigned ? 'text-green-400' : 'text-slate-400'
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{contract.entityName}</h4>
                        <p className="text-sm text-slate-400 mt-1">
                          {contract.contractDurationFormatted}
                          {contract.monthlyRetainer && ` | ${formatCurrency(contract.monthlyRetainer)}/month`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getContractStatusColor(contract.status, contract.isFullySigned)}`}>
                        {getContractStatusLabel(contract.status, contract.isFullySigned)}
                      </span>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedContract === contract.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedContract === contract.id && (
                  <div className="px-6 py-4 border-t border-white/5 bg-slate-900/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contract Details */}
                      <div>
                        <h5 className="text-sm font-medium text-slate-200 mb-3">Contract Details</h5>
                        <div className="space-y-3">
                          {contract.commencementDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Start Date</span>
                              <span className="text-white">{formatDate(contract.commencementDate)}</span>
                            </div>
                          )}
                          {contract.endDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">End Date</span>
                              <span className="text-white">{formatDate(contract.endDate)}</span>
                            </div>
                          )}
                          {contract.monthlyRetainer && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Monthly Retainer</span>
                              <span className="text-white font-medium">{formatCurrency(contract.monthlyRetainer)}</span>
                            </div>
                          )}
                          {contract.advanceAmount && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Advance Amount</span>
                              <span className="text-white">{formatCurrency(contract.advanceAmount)}</span>
                            </div>
                          )}
                          {contract.poNumber && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">PO Number</span>
                              <span className="text-white">{contract.poNumber}</span>
                            </div>
                          )}
                          {contract.paymentTerms && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Payment Terms</span>
                              <span className="text-white">{contract.paymentTerms}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Signature Status */}
                      <div>
                        <h5 className="text-sm font-medium text-slate-200 mb-3">Signature Status</h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                contract.signatures.client.isSigned ? 'bg-green-500/20' : 'bg-amber-500/20'
                              }`}>
                                {contract.signatures.client.isSigned ? (
                                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">Client Signature</p>
                                {contract.signatures.client.name && (
                                  <p className="text-xs text-slate-400">{contract.signatures.client.name}</p>
                                )}
                              </div>
                            </div>
                            {contract.signatures.client.signedAt ? (
                              <span className="text-xs text-green-400">{formatDate(contract.signatures.client.signedAt)}</span>
                            ) : (
                              <span className="text-xs text-amber-400">Pending</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between p-3 glass-card rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                contract.signatures.agency.isSigned ? 'bg-green-500/20' : 'bg-amber-500/20'
                              }`}>
                                {contract.signatures.agency.isSigned ? (
                                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">Agency Signature</p>
                                {contract.signatures.agency.name && (
                                  <p className="text-xs text-slate-400">{contract.signatures.agency.name}</p>
                                )}
                              </div>
                            </div>
                            {contract.signatures.agency.signedAt ? (
                              <span className="text-xs text-green-400">{formatDate(contract.signatures.agency.signedAt)}</span>
                            ) : (
                              <span className="text-xs text-amber-400">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services Scope */}
                    {contract.servicesScope.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h5 className="text-sm font-medium text-slate-200 mb-2">Services Scope</h5>
                        <div className="flex flex-wrap gap-2">
                          {contract.servicesScope.map((service, index) => (
                            <span
                              key={`${service}-${index}`}
                              className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded"
                            >
                              {getServiceLabel(service)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {contract.customScope && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h5 className="text-sm font-medium text-slate-200 mb-2">Custom Scope</h5>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{contract.customScope}</p>
                      </div>
                    )}

                    {/* Download Button */}
                    {contract.documentUrl && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <a
                          href={contract.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Document
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
