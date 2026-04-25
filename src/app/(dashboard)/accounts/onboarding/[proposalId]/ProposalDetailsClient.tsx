'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Copy, Check, ExternalLink, Clock, CheckCircle,
  AlertCircle, CreditCard, FileText, Users, Building2, Loader2,
  Mail, Phone, MapPin, RefreshCw
} from 'lucide-react'

interface ProposalData {
  id: string
  token: string
  status: string
  currentStep: number
  url: string

  // Prospect
  prospectName: string
  prospectEmail: string
  prospectPhone: string | null
  prospectCompany: string | null

  // Client
  clientName: string | null
  clientEmail: string | null
  clientPhone: string | null
  clientCompany: string | null
  clientGst: string | null
  clientAddress: string | null
  clientCity: string | null
  clientState: string | null

  // Services
  services: Array<{ serviceId: string; name: string; price?: number }>
  basePrice: number
  gstPercentage: number
  totalPrice: number
  advanceAmount: number | null

  // Entity
  entity: {
    id: string
    name: string
    legalName: string
  }

  // SLA
  slaAccepted: boolean
  slaAcceptedAt: string | null
  slaSignerName: string | null

  // Invoice
  invoiceGenerated: boolean
  invoiceNumber: string | null

  // Payment
  paymentConfirmed: boolean
  paymentConfirmedAt: string | null
  paymentMethod: string | null
  paymentReference: string | null
  paymentConfirmedByUser: { id: string; name: string } | null

  // Onboarding
  accountOnboardingCompleted: boolean
  accountOnboardingCompletedAt: string | null
  onboardingDetails: Record<string, unknown> | null

  // Activation
  managerReviewed: boolean
  portalActivated: boolean
  portalActivatedAt: string | null
  client: { id: string; name: string } | null

  // Meta
  createdBy: { id: string; name: string; email: string | null } | null
  createdAt: string
  expiresAt: string
  viewedAt: string | null
}

interface Props {
  proposal: ProposalData
}

export default function ProposalDetailsClient({ proposal }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: '',
    notes: '',
  })
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(proposal.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isExpired = new Date() > new Date(proposal.expiresAt) && !proposal.portalActivated

  const handleConfirmPayment = async () => {
    if (!paymentForm.transactionReference.trim()) {
      setError('Transaction reference is required')
      return
    }

    setIsConfirming(true)
    setError('')

    try {
      const res = await fetch(`/api/accounts/onboarding/${proposal.id}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to confirm payment')
      }

      // Reload page to show updated status
      router.refresh()
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsConfirming(false)
    }
  }

  const getStepStatus = (step: number) => {
    if (proposal.currentStep > step) return 'completed'
    if (proposal.currentStep === step) return 'current'
    return 'pending'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/accounts/onboarding"
            className="inline-flex items-center text-sm text-gray-400 hover:text-gray-200 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Onboarding
          </Link>
          <h1 className="text-2xl font-bold text-white">{proposal.prospectName}</h1>
          <p className="text-gray-400">{proposal.prospectEmail}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={copyLink}
            className="inline-flex items-center px-3 py-2 border border-white/20 rounded-lg hover:bg-gray-900/40"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </button>
          <a
            href={proposal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Link
          </a>
        </div>
      </div>

      {/* Status Banner */}
      {isExpired && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <p className="font-medium text-red-800">Link Expired</p>
            <p className="text-sm text-red-400">
              This link expired on {formatDate(proposal.expiresAt)}
            </p>
          </div>
          <Link
            href={`/api/accounts/onboarding/${proposal.id}/resend`}
            className="ml-auto px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-200 text-sm"
          >
            Extend Link
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Progress</h2>
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: 'Details', icon: FileText },
                { step: 2, label: 'SLA', icon: FileText },
                { step: 3, label: 'Payment', icon: CreditCard },
                { step: 4, label: 'Onboarding', icon: Users },
                { step: 5, label: 'Review', icon: Clock },
                { step: 6, label: 'Active', icon: CheckCircle },
              ].map((item, index) => {
                const status = getStepStatus(item.step)
                return (
                  <div key={item.step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          status === 'completed'
                            ? 'bg-green-500'
                            : status === 'current'
                            ? 'bg-blue-500'
                            : 'bg-white/10'
                        }`}
                      >
                        {status === 'completed' ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <item.icon className={`w-5 h-5 ${status === 'current' ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <span className={`text-xs mt-1 ${status === 'current' ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </div>
                    {index < 5 && (
                      <div className={`w-12 h-0.5 mx-1 ${status === 'completed' ? 'bg-green-500' : 'bg-white/10'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Client Details */}
          <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-gray-400" />
              Client Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Company Name</p>
                <p className="font-medium">{proposal.clientName || proposal.prospectName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Contact Person</p>
                <p className="font-medium">{proposal.clientCompany || proposal.prospectCompany || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                  {proposal.clientEmail || proposal.prospectEmail}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  {proposal.clientPhone || proposal.prospectPhone}
                </p>
              </div>
              {proposal.clientAddress && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {proposal.clientAddress}, {proposal.clientCity}, {proposal.clientState}
                  </p>
                </div>
              )}
              {proposal.clientGst && (
                <div>
                  <p className="text-sm text-gray-400">GST Number</p>
                  <p className="font-medium">{proposal.clientGst}</p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Services & Pricing</h2>
            <div className="space-y-2 mb-4">
              {proposal.services.map(service => (
                <div key={service.serviceId} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-200">{service.name}</span>
                  <span className="font-medium">{service.price ? formatCurrency(service.price) : '-'}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>{formatCurrency(proposal.basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">GST ({proposal.gstPercentage}%)</span>
                <span>{formatCurrency(proposal.basePrice * proposal.gstPercentage / 100)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(proposal.totalPrice)}</span>
              </div>
              {proposal.advanceAmount && proposal.advanceAmount !== proposal.totalPrice && (
                <div className="flex justify-between text-blue-400 font-medium">
                  <span>Advance Due</span>
                  <span>{formatCurrency(proposal.advanceAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Action */}
          {proposal.slaAccepted && !proposal.paymentConfirmed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">Payment Pending Confirmation</h3>
                  <p className="text-sm text-yellow-600">
                    {proposal.paymentReference
                      ? `Client submitted reference: ${proposal.paymentReference}`
                      : 'Waiting for client to submit payment info'}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          )}

          {/* Payment Confirmed */}
          {proposal.paymentConfirmed && (
            <div className="bg-green-500/10 border border-green-200 rounded-xl p-6">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <div>
                  <h3 className="font-semibold text-green-800">Payment Confirmed</h3>
                  <p className="text-sm text-green-400">
                    {proposal.paymentMethod} | Ref: {proposal.paymentReference}
                    {proposal.paymentConfirmedByUser && ` | By: ${proposal.paymentConfirmedByUser.name}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Entity</p>
                <p className="font-medium">{proposal.entity.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Invoice No</p>
                <p className="font-medium">{proposal.invoiceNumber || 'Not Generated'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Created</p>
                <p className="font-medium">{formatDate(proposal.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Expires</p>
                <p className={`font-medium ${isExpired ? 'text-red-400' : ''}`}>
                  {formatDate(proposal.expiresAt)}
                </p>
              </div>
              {proposal.viewedAt && (
                <div>
                  <p className="text-xs text-gray-400">First Viewed</p>
                  <p className="font-medium">{formatDate(proposal.viewedAt)}</p>
                </div>
              )}
              {proposal.createdBy && (
                <div>
                  <p className="text-xs text-gray-400">Created By</p>
                  <p className="font-medium">{proposal.createdBy.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4">Timeline</h3>
            <div className="space-y-4">
              {[
                { label: 'Created', date: proposal.createdAt, done: true },
                { label: 'Viewed', date: proposal.viewedAt, done: !!proposal.viewedAt },
                { label: 'SLA Signed', date: proposal.slaAcceptedAt, done: proposal.slaAccepted },
                { label: 'Payment Confirmed', date: proposal.paymentConfirmedAt, done: proposal.paymentConfirmed },
                { label: 'Onboarding Done', date: proposal.accountOnboardingCompletedAt, done: proposal.accountOnboardingCompleted },
                { label: 'Portal Activated', date: proposal.portalActivatedAt, done: proposal.portalActivated },
              ].map((item, index) => (
                <div key={item.label} className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${item.done ? 'bg-green-500' : 'bg-white/20'}`} />
                  <div>
                    <p className={`text-sm ${item.done ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {item.label}
                    </p>
                    {item.done && item.date && (
                      <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl shadow-none p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Payment</h3>

            {error && (
              <div className="bg-red-500/10 border border-red-200 rounded-lg p-3 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Transaction Reference *
                </label>
                <input
                  type="text"
                  value={paymentForm.transactionReference}
                  onChange={e => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg"
                  placeholder="UTR / Reference Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-white/20 text-gray-200 rounded-lg hover:bg-gray-900/40"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
