'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'

type TestClient = {
  id: string
  clientId: string
  clientName: string
  userName: string
  email: string
  role: string
  hasMarketingAccess: boolean
  hasWebsiteAccess: boolean
  serviceSegment: string
}

export default function ClientLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showTestLogins, setShowTestLogins] = useState(process.env.NODE_ENV === 'development')
  const [searchQuery, setSearchQuery] = useState('')
  const [testClients, setTestClients] = useState<TestClient[]>([])
  const [loadingTest, setLoadingTest] = useState(true)
  const [loggingIn, setLoggingIn] = useState<string | null>(null)

  // Fetch test logins
  useEffect(() => {
    const fetchTestLogins = async () => {
      try {
        const res = await fetch('/api/auth/test-login')
        const data = await res.json()
        setTestClients(data.clients || [])
      } catch { /* ignore */ }
      setLoadingTest(false)
    }
    fetchTestLogins()
  }, [])

  // Separate clients by portal access type
  const webClients = testClients.filter(c => c.hasWebsiteAccess)
  const marketingClients = testClients.filter(c => c.hasMarketingAccess && !c.hasWebsiteAccess)
  const standardClients = testClients.filter(c => !c.hasMarketingAccess && !c.hasWebsiteAccess)

  const filteredWebClients = webClients.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredMarketingClients = marketingClients.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredStandardClients = standardClients.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'request-otp' }),
      })

      const data = await res.json()

      if (res.ok) {
        setStep('otp')
        setMessage('OTP sent to your registered phone number')
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, action: 'verify-otp' }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/client-portal')
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async (clientUserId: string) => {
    setLoggingIn(clientUserId)
    try {
      const res = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: clientUserId, type: 'client' }),
      })
      const data = await res.json()
      if (data.loginUrl) {
        window.location.href = data.loginUrl
      } else {
        toast.error('Login failed: ' + (data.error || 'Unknown error'))
        setLoggingIn(null)
      }
    } catch (err) {
      toast.error('Login failed')
      setLoggingIn(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="w-full max-w-md">
        <PageGuide
          title="Client Login"
          description="Enter your registered email to receive a one-time login code."
          pageKey="client-login"
        />

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Client Portal</h1>
          <p className="text-slate-400 mt-2">Access your project dashboard and reports</p>
        </div>

        {/* TEST MODE BANNER */}
        {showTestLogins && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              TEST MODE ENABLED
            </div>
            <p className="text-amber-200/80 text-sm">Click any client below to login directly. No OTP required.</p>
          </div>
        )}

        {/* Quick Test Logins */}
        {showTestLogins && (
          <div className="bg-white/10 backdrop-blur-sm backdrop-blur-xl rounded-2xl border border-white/20 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Quick Login (Clients)</h3>
              <button
                onClick={() => setShowTestLogins(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Hide
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full px-4 py-2 mb-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {loadingTest ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 mt-2">Loading clients...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {/* Web Portal Clients */}
                {filteredWebClients.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-900/90 backdrop-blur py-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-semibold text-blue-400">Web Portal</span>
                      <span className="text-xs text-slate-500">({filteredWebClients.length})</span>
                    </div>
                    <div className="grid gap-2">
                      {filteredWebClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => handleTestLogin(client.id)}
                          disabled={loggingIn === client.id}
                          className="w-full p-3 rounded-xl text-left transition-all disabled:opacity-70 bg-gradient-to-r from-blue-900/40 to-cyan-900/30 border border-blue-500/40 hover:border-blue-400"
                        >
                          <div className="flex items-center gap-3">
                            {loggingIn === client.id && (
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{client.clientName}</span>
                                <div className="flex gap-1">
                                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded-full">Web</span>
                                  {client.hasMarketingAccess && (
                                    <span className="px-2 py-0.5 bg-pink-500/30 text-pink-300 text-xs rounded-full">+Marketing</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 truncate">{client.userName}</span>
                                <span className="text-xs text-slate-500">|</span>
                                <span className={`text-xs ${client.role === 'PRIMARY' ? 'text-amber-400' : 'text-slate-400'}`}>
                                  {client.role}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marketing Portal Clients */}
                {filteredMarketingClients.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-900/90 backdrop-blur py-1">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      <span className="text-sm font-semibold text-pink-400">Marketing Portal</span>
                      <span className="text-xs text-slate-500">({filteredMarketingClients.length})</span>
                    </div>
                    <div className="grid gap-2">
                      {filteredMarketingClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => handleTestLogin(client.id)}
                          disabled={loggingIn === client.id}
                          className="w-full p-3 rounded-xl text-left transition-all disabled:opacity-70 bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 hover:border-pink-400"
                        >
                          <div className="flex items-center gap-3">
                            {loggingIn === client.id && (
                              <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{client.clientName}</span>
                                <span className="px-2 py-0.5 bg-pink-500/30 text-pink-300 text-xs rounded-full">Marketing</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 truncate">{client.userName}</span>
                                <span className="text-xs text-slate-500">|</span>
                                <span className={`text-xs ${client.role === 'PRIMARY' ? 'text-amber-400' : 'text-slate-400'}`}>
                                  {client.role}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standard Clients */}
                {filteredStandardClients.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-900/90 backdrop-blur py-1">
                      <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                      <span className="text-sm font-semibold text-slate-400">Standard Portal</span>
                      <span className="text-xs text-slate-500">({filteredStandardClients.length})</span>
                    </div>
                    <div className="grid gap-2">
                      {filteredStandardClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => handleTestLogin(client.id)}
                          disabled={loggingIn === client.id}
                          className="w-full p-3 rounded-xl text-left transition-all disabled:opacity-70 bg-slate-800/50 border border-slate-700/50 hover:border-slate-600"
                        >
                          <div className="flex items-center gap-3">
                            {loggingIn === client.id && (
                              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{client.clientName}</span>
                                <span className="px-2 py-0.5 bg-slate-500/30 text-slate-300 text-xs rounded-full">
                                  {client.serviceSegment || 'Standard'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 truncate">{client.userName}</span>
                                <span className="text-xs text-slate-500">|</span>
                                <span className={`text-xs ${client.role === 'PRIMARY' ? 'text-amber-400' : 'text-slate-400'}`}>
                                  {client.role}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredWebClients.length === 0 && filteredMarketingClients.length === 0 && filteredStandardClients.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No clients found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/20 backdrop-blur-sm"></div>
          <span className="text-slate-400 text-sm">or use OTP</span>
          <div className="flex-1 h-px bg-white/20 backdrop-blur-sm"></div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-sm backdrop-blur-xl rounded-2xl border border-white/20 p-8">
          {step === 'email' ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                  <InfoTip text="Use the email registered during onboarding" type="action" />
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  autoFocus
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Get OTP
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-3">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-green-400 text-sm">{message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter OTP
                  <InfoTip text="Check your email for the 6-character code" type="action" />
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otp.trim()}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setError('')
                  setMessage('')
                }}
                className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                ← Use different email
              </button>
            </form>
          )}
        </div>

        {/* Employee Login Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Are you an employee?{' '}
            <a href="/login" className="text-blue-400 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
