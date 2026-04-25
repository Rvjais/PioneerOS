'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Script from 'next/script'

interface Invoice {
  id: string
  number: string
  amount: number
  tax: number
  total: number
  status: string
}

interface ProposalData {
  id: string
  clientName: string
  clientEmail: string
  clientCompany: string | null
  entityType: string
  status: string
  finalPrice: number
  invoice: Invoice | null
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
  }
  theme: {
    color: string
  }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export default function PaymentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [proposalData, setProposalData] = useState<ProposalData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online')
  const [processing, setProcessing] = useState(false)
  const [offlineSubmitted, setOfflineSubmitted] = useState(false)
  const [razorpayReady, setRazorpayReady] = useState(false)

  useEffect(() => {
    fetchProposalData()
  }, [token])

  const fetchProposalData = async () => {
    try {
      const res = await fetch(`/api/proposal/${token}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load payment details')
        return
      }

      // Check if proposal was accepted
      if (!['ACCEPTED', 'CONVERTED'].includes(data.proposal.status)) {
        router.push(`/proposal/${token}`)
        return
      }

      setProposalData(data.proposal)
    } catch (err) {
      console.error('Error fetching proposal:', err)
      setError('Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  const handleOnlinePayment = async () => {
    if (!proposalData) return

    setProcessing(true)
    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          amount: proposalData.finalPrice,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create payment order')
        setProcessing(false)
        return
      }

      // Initialize Razorpay
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: proposalData.entityType === 'ATZ_MEDAPPZ' ? 'ATZ Medappz' : 'Branding Pioneers',
        description: `Invoice Payment - ${proposalData.invoice?.number || 'Proforma Invoice'}`,
        order_id: orderData.orderId,
        handler: async function (response: RazorpayResponse) {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verifyRes.ok) {
            router.push(`/proposal/${token}/success`)
          } else {
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: proposalData.clientName,
          email: proposalData.clientEmail,
        },
        theme: {
          color: '#10b981',
        },
      }

      if (!window.Razorpay) {
        toast.error('Payment gateway is still loading. Please try again in a moment.')
        setProcessing(false)
        return
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('Payment error:', err)
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleOfflinePayment = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/payments/offline-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (res.ok) {
        setOfflineSubmitted(true)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit offline payment request')
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Failed to submit request')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Error</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  if (offlineSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Offline Payment Request Submitted</h1>
          <p className="text-slate-400 mb-4">
            Our accounts team will share bank details with you shortly. Once you make the payment,
            we&apos;ll confirm and activate your account.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-left">
            <p className="text-blue-400 text-sm font-medium mb-2">What happens next?</p>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>1. You&apos;ll receive bank details via email/WhatsApp</li>
              <li>2. Make the payment via NEFT/IMPS/UPI</li>
              <li>3. Share payment confirmation</li>
              <li>4. Account will be activated within 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={() => setRazorpayReady(true)}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

        <div className="relative min-h-screen flex flex-col">
          {/* Header */}
          <header className="p-6 border-b border-white/10">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-white font-semibold text-xl">
                  {proposalData?.entityType === 'ATZ_MEDAPPZ' ? 'ATZ Medappz' : 'Branding Pioneers'}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 py-8 px-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
                <p className="text-slate-400 mt-2">
                  Hello {proposalData?.clientName}, please complete the payment to get started
                </p>
              </div>

              {/* Invoice Summary */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Payment Summary</h2>

                <div className="space-y-3">
                  {proposalData?.invoice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Invoice Number</span>
                      <span className="text-white">{proposalData.invoice.number}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Client</span>
                    <span className="text-white">{proposalData?.clientCompany || proposalData?.clientName}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Amount Due</span>
                      <span className="text-emerald-400 font-bold text-xl">
                        Rs.{proposalData?.finalPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      paymentMethod === 'online'
                        ? 'bg-emerald-600/20 border-emerald-500'
                        : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'online' ? 'border-emerald-500' : 'border-white/30'
                      }`}>
                        {paymentMethod === 'online' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">Pay Online</p>
                        <p className="text-sm text-slate-400">Credit/Debit Card, UPI, Net Banking</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('offline')}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      paymentMethod === 'offline'
                        ? 'bg-emerald-600/20 border-emerald-500'
                        : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'offline' ? 'border-emerald-500' : 'border-white/30'
                      }`}>
                        {paymentMethod === 'offline' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">Pay Offline</p>
                        <p className="text-sm text-slate-400">Bank Transfer (NEFT/IMPS)</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={paymentMethod === 'online' ? handleOnlinePayment : handleOfflinePayment}
                disabled={processing || (paymentMethod === 'online' && !razorpayReady)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === 'online' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay Rs.{proposalData?.finalPrice?.toLocaleString()} Now
                  </>
                ) : (
                  'Request Bank Details'
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                Secured by Razorpay. Your payment information is encrypted and secure.
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
