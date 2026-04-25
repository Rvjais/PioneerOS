'use client'

import { useState, useEffect, use } from 'react'

interface ClientData {
  name: string
  email: string
  status: string
}

export default function PaymentSuccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [loading, setLoading] = useState(true)
  const [clientData, setClientData] = useState<ClientData | null>(null)

  useEffect(() => {
    fetchData()
  }, [token])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/proposal/${token}`)
      if (res.ok) {
        const data = await res.json()
        setClientData({
          name: data.proposal.clientName || data.proposal.prospectName,
          email: data.proposal.clientEmail || data.proposal.prospectEmail,
          status: data.proposal.status,
        })
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-lg w-full text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-slate-400 mb-6">
            Thank you, {clientData?.name}! Your payment has been received and confirmed.
          </p>

          {/* What's Next */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-left mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-medium">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Account Setup</p>
                  <p className="text-sm text-slate-400">Our team will set up your account within 24 hours</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-medium">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Kickoff Call</p>
                  <p className="text-sm text-slate-400">We&apos;ll schedule a kickoff call to understand your needs</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 font-medium">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Get Started</p>
                  <p className="text-sm text-slate-400">Start receiving deliverables as per your scope</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm">
              A confirmation email has been sent to <span className="font-medium">{clientData?.email}</span>.
              If you have any questions, reach out to us at hello@brandingpioneers.in
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <a
              href="/"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
