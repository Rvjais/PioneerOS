'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SignaturePad } from '@/client/components/accounts/SignaturePad'

// SLA URL Input Modal Component
function SlaUrlModal({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string) => void
  isProcessing: boolean
}) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }
    try {
      new URL(url)
      setError('')
      onSubmit(url.trim())
    } catch {
      setError('Please enter a valid URL')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 rounded-xl shadow-none w-full max-w-md mx-4 p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Add SLA Document Link</h3>
        <p className="text-sm text-slate-400 mb-4">
          Upload your SLA document to Google Drive or Dropbox and paste the shareable link below.
        </p>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError('')
          }}
          placeholder="https://drive.google.com/..."
          className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-slate-600'
          }`}
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? 'Uploading...' : 'Add Document'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Client {
  id: string
  name: string
  contactName: string
  contactEmail: string
  contactPhone: string
  tier: string
  monthlyFee: number
  onboardingStatus: string
  slaSigned: boolean
  slaSignedAt: string | null
  slaDocumentUrl: string
  sowSigned: boolean
  sowSignedAt: string | null
  sowDocumentUrl: string
  initialPaymentConfirmed: boolean
  initialPaymentDate: string | null
  lifecycleStage: string
}

interface Contract {
  id: string
  type: string
  title: string
  startDate: string
  endDate: string
  value: number
  status: string
  documentUrl: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  total: number
  status: string
  dueDate: string
}

interface Event {
  id: string
  fromStage: string
  toStage: string
  notes: string
  createdAt: string
}

interface Props {
  client: Client
  contracts: Contract[]
  invoices: Invoice[]
  events: Event[]
}

export function ContractManager({ client, contracts, invoices, events }: Props) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [showSlaUrlModal, setShowSlaUrlModal] = useState(false)
  const [signatureType, setSignatureType] = useState<'sla' | 'sow'>('sla')

  const handleUploadSLA = async (slaUrl: string) => {
    setIsProcessing(true)
    try {
      await fetch(`/api/accounts/sla/${client.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slaDocumentUrl: slaUrl }),
      })
      setShowSlaUrlModal(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to upload SLA:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignSLA = async (signatureData: string) => {
    setIsProcessing(true)
    try {
      await fetch(`/api/accounts/sla/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed: true, signatureData }),
      })
      setShowSignatureModal(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to sign SLA:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true)
    try {
      await fetch(`/api/accounts/payment/${client.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true }),
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to confirm payment:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStepStatus = (step: number) => {
    if (step === 1) return client.slaDocumentUrl ? 'complete' : 'current'
    if (step === 2) return client.slaSigned ? 'complete' : client.slaDocumentUrl ? 'current' : 'pending'
    if (step === 3) return client.initialPaymentConfirmed ? 'complete' : client.slaSigned ? 'current' : 'pending'
    if (step === 4) return client.lifecycleStage === 'ACTIVE' ? 'complete' : client.initialPaymentConfirmed ? 'current' : 'pending'
    return 'pending'
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/accounts/contracts" className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-block">
            Back to Contracts
          </Link>
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-slate-400 mt-1">{client.contactName} - {client.contactEmail}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          client.tier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
          client.tier === 'PREMIUM' ? 'bg-blue-500/20 text-blue-400' :
          'bg-slate-600 text-slate-300'
        }`}>
          {client.tier}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="font-semibold text-white mb-6">Onboarding Progress</h2>
        <div className="flex items-center">
          {[
            { step: 1, label: 'Upload SLA' },
            { step: 2, label: 'Client Signs' },
            { step: 3, label: 'Payment' },
            { step: 4, label: 'Activate' },
          ].map((item, index) => {
            const status = getStepStatus(item.step)
            return (
              <div key={item.step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      status === 'complete' ? 'bg-green-500 text-white' :
                      status === 'current' ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' :
                      'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {status === 'complete' ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      item.step
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    status === 'current' ? 'text-blue-400' :
                    status === 'complete' ? 'text-green-400' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    status === 'complete' ? 'bg-green-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* SLA Section */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="font-semibold text-white mb-4">Service Level Agreement</h3>

            {!client.slaDocumentUrl ? (
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-slate-400 mb-2">Add SLA document link for client signature</p>
                <p className="text-xs text-slate-400 mb-4">Upload to Google Drive/Dropbox and paste the link</p>
                <button
                  onClick={() => setShowSlaUrlModal(true)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Add SLA Link
                </button>
              </div>
            ) : !client.slaSigned ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-emerald-400">SLA document uploaded</span>
                </div>
                <button
                  onClick={() => {
                    setSignatureType('sla')
                    setShowSignatureModal(true)
                  }}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Collect Client Signature
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <span className="text-green-400 font-medium">SLA Signed</span>
                  <p className="text-sm text-green-400/70">
                    Signed on {client.slaSignedAt && new Date(client.slaSignedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="font-semibold text-white mb-4">Initial Payment</h3>

            {!client.slaSigned ? (
              <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-center">
                <p className="text-slate-400">SLA must be signed before confirming payment</p>
              </div>
            ) : !client.initialPaymentConfirmed ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400">
                    Monthly Fee: <span className="font-bold">₹{(client.monthlyFee / 1000).toFixed(0)}K</span>
                  </p>
                  <p className="text-sm text-amber-400/70 mt-1">
                    Confirm payment once received via bank transfer
                  </p>
                </div>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Payment Received'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <span className="text-green-400 font-medium">Payment Confirmed</span>
                  <p className="text-sm text-green-400/70">
                    Received on {client.initialPaymentDate && new Date(client.initialPaymentDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="font-semibold text-white mb-4">Client Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  client.lifecycleStage === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                  client.lifecycleStage === 'ONBOARDING' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {client.lifecycleStage}
                </span>
              </div>
              <div>
                <p className="text-slate-400">Monthly Fee</p>
                <p className="font-medium text-white">
                  ₹{(client.monthlyFee / 1000).toFixed(0)}K/month
                </p>
              </div>
              <div>
                <p className="text-slate-400">Contact</p>
                <p className="font-medium text-white">{client.contactPhone}</p>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
            {events.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="text-sm">
                    <p className="text-slate-300">
                      Stage changed to <span className="font-medium text-white">{event.toStage}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(event.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <SignaturePad
          title={signatureType === 'sla' ? 'Sign Service Level Agreement' : 'Sign Statement of Work'}
          clientName={client.name}
          onClose={() => setShowSignatureModal(false)}
          onSign={handleSignSLA}
          isProcessing={isProcessing}
        />
      )}

      {/* SLA URL Input Modal */}
      <SlaUrlModal
        isOpen={showSlaUrlModal}
        onClose={() => setShowSlaUrlModal(false)}
        onSubmit={handleUploadSLA}
        isProcessing={isProcessing}
      />
    </div>
  )
}
