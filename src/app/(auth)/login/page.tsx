'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND } from '@/shared/constants/constants'
import PageGuide from '@/client/components/ui/PageGuide'

const fallbackQuote = { text: "Work like an owner. Lead like a pioneer.", author: "Pioneer OS" }

type IdentifierStep = 'choose' | 'magic' | 'password'
type SendStep = 'identifier' | 'sent' | 'error'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auth mode selection
  const [identifierStep, setIdentifierStep] = useState<IdentifierStep>('choose')

  // Magic link state
  const [identifier, setIdentifier] = useState('')
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL')
  const [sendStep, setSendStep] = useState<SendStep>('identifier')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [validationError, setValidationError] = useState('')
  const [loading, setLoading] = useState(false)

  // Password login state
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Quote
  const [quoteOfDay, setQuoteOfDay] = useState(fallbackQuote)

  useEffect(() => {
    fetch('/api/quotes?mode=qotd')
      .then(res => res.json())
      .then(data => { if (data.quote) setQuoteOfDay(data.quote) })
      .catch(() => { })
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Handle error from URL (NextAuth redirects here on error)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'NoPassword') {
        setError('No password set. Please set up your password first.')
      } else if (errorParam === 'InvalidPassword') {
        setError('Invalid phone number or password')
      } else if (errorParam === 'CredentialsSignin') {
        setError('Invalid phone number or password')
      } else if (errorParam === 'User not found') {
        setError('No account found with this phone number')
      } else {
        setError(errorParam || 'Login failed')
      }
      setIdentifierStep('password')
    }
  }, [searchParams])

  // Magic link handlers
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    const trimmedIdentifier = identifier.trim()

    if (!trimmedIdentifier) {
      setValidationError(channel === 'EMAIL'
        ? 'Please enter your email or Employee ID'
        : 'Please enter your phone number or Employee ID')
      return
    }

    const isEmployeeId = /^BP-\d{3,}$/i.test(trimmedIdentifier)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier)
    const isPhone = /^[+]?[\d\s-]{10,}$/.test(trimmedIdentifier)

    if (channel === 'EMAIL') {
      if (!isEmployeeId && !isEmail) {
        setValidationError('Please enter a valid email address or Employee ID (BP-XXX)')
        return
      }
    } else {
      if (!isEmployeeId && !isPhone) {
        setValidationError('Please enter a valid phone number or Employee ID (BP-XXX)')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429 || data.error?.includes('rate limit') || data.error?.includes('Too many')) {
          setError('Too many attempts. Please wait before trying again.')
          setCountdown(60)
        } else {
          setError(data.error || 'Failed to send login link')
        }
        setSendStep('error')
        setLoading(false)
        return
      }

      setMessage(data.message)
      setSendStep('sent')
      setCountdown(60)
    } catch {
      setError('Something went wrong. Please try again.')
      setSendStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setSendStep('identifier')
    setError('')
    setMessage('')
  }

  // Password login handler - uses NextAuth directly
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setError('')

    if (!phone.trim()) {
      setPasswordError('Please enter your phone number')
      return
    }

    if (!password) {
      setPasswordError('Please enter your password')
      return
    }

    setPasswordLoading(true)
    setError('')

    try {
      // Use NextAuth's signIn directly - it calls our password provider
      const result = await signIn('password', {
        phone,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Handle specific errors
        if (result.error === 'CredentialsSignin') {
          setError('Invalid phone number or password')
        } else if (result.status === 429) {
          setError('Too many attempts. Please wait before trying again.')
        } else {
          setError(result.error || 'Login failed')
        }
        return
      }

      if (result?.ok) {
        // Role-based redirect
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Left Pane — Brand */}
      <div className="hidden md:flex flex-col flex-1 bg-slate-50 border-r border-slate-200 p-12 items-start justify-center">
        <div className="w-full max-w-md">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl mb-8">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
            PioneerOS
          </h1>
          <p className="text-base text-slate-500 leading-relaxed mb-12">
            Agency operations platform. Elevating digital marketing through radical transparency.
          </p>

          {/* Quote */}
          <div className="border border-slate-200 rounded-xl p-6 bg-white">
            <p className="text-slate-700 text-lg leading-relaxed italic">
              &ldquo;{quoteOfDay.text}&rdquo;
            </p>
            <p className="text-slate-400 text-sm mt-3 font-medium">
              — {quoteOfDay.author}
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane — Auth */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        {/* Mobile Header */}
        <div className="md:hidden text-center mb-8 w-full">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <Image
              src={BRAND.logo}
              alt={BRAND.logoAlt}
              fill
              sizes="48px"
              className="object-contain rounded-xl"
              priority
            />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">PioneerOS</h2>
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Auth Mode Selection */}
          {identifierStep === 'choose' && (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">Sign in</h2>
                <p className="text-slate-500 text-sm">Choose your preferred login method</p>
              </div>

              <div className="space-y-3">
                {/* Magic Link Option */}
                <button
                  onClick={() => {
                    setIdentifierStep('magic')
                  }}
                  className="w-full p-4 border border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Magic Link</p>
                      <p className="text-sm text-slate-500">Receive a link via email or WhatsApp</p>
                    </div>
                  </div>
                </button>

                {/* Password Login Option */}
                <button
                  onClick={() => {
                    setIdentifierStep('password')
                  }}
                  className="w-full p-4 border border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Phone & Password</p>
                      <p className="text-sm text-slate-500">Log in with your phone number and password</p>
                    </div>
                  </div>
                </button>

                {/* First Time / Set Up Password Option */}
                <Link
                  href="/auth/register-password"
                  className="w-full p-4 border border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-left block cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">First Time?</p>
                      <p className="text-sm text-slate-500">Set up your password for the first time</p>
                    </div>
                  </div>
                </Link>
              </div>

              <p className="text-center text-slate-400 text-xs">
                Are you a client?{' '}
                <a href="/client-login" className="text-slate-900 font-medium hover:underline">
                  Client Portal
                </a>
              </p>
            </>
          )}

          {/* Magic Link Flow */}
          {identifierStep === 'magic' && (
            <>
              {/* Back button */}
              <button
                onClick={() => setIdentifierStep('choose')}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <PageGuide
                pageKey="login"
                title="Welcome to Pioneer OS"
                description="Sign in using your email, phone number, or employee ID. You'll receive a magic link - no password needed."
                steps={[
                  { label: 'Enter your identifier', description: 'Use your registered email, phone number, or employee ID (e.g., BP-XXX)' },
                  { label: 'Choose delivery method', description: 'Select Email or WhatsApp to receive your login link' },
                  { label: 'Click the magic link', description: 'Check your inbox/WhatsApp and click the link to log in (valid for 30 minutes)' },
                  { label: 'First time?', description: 'Contact your manager or HR to get your account set up in the system' },
                ]}
              />

              {sendStep === 'identifier' && (
                <form onSubmit={handleSendLink} className="space-y-4">
                  {/* Channel Toggle */}
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => { setChannel('EMAIL'); setIdentifier('') }}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                        channel === 'EMAIL'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => { setChannel('WHATSAPP'); setIdentifier('') }}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                        channel === 'WHATSAPP'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      WhatsApp
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setValidationError('') }}
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors ${
                        validationError ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder={channel === 'EMAIL' ? "Email or Employee ID (BP-XXX)" : "Phone number or Employee ID"}
                    />
                    {validationError && (
                      <p className="text-red-500 text-sm mt-1.5">{validationError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 active:bg-slate-950 transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Login Link'}
                  </button>
                </form>
              )}

              {sendStep === 'sent' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 mx-auto bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Check your {channel === 'WHATSAPP' ? 'WhatsApp' : 'inbox'}</h2>
                    <p className="text-slate-500 text-sm mt-1">{message}</p>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Tap the link in your {channel === 'WHATSAPP' ? 'WhatsApp message' : 'email'} to sign in.
                    <br />The link expires in 30 minutes.
                  </p>
                  {countdown > 0 ? (
                    <p className="text-slate-400 text-sm">
                      Resend in <span className="text-slate-700 font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button onClick={handleResend} className="text-slate-900 text-sm font-medium hover:underline">
                      Send again
                    </button>
                  )}
                </div>
              )}

              {sendStep === 'error' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 mx-auto bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  </div>
                  {countdown > 0 ? (
                    <p className="text-slate-400 text-sm">
                      Try again in <span className="text-slate-700 font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button onClick={handleResend} className="text-slate-900 text-sm font-medium hover:underline">
                      Try again
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Password Login Flow */}
          {identifierStep === 'password' && (
            <>
              {/* Back button */}
              <button
                onClick={() => setIdentifierStep('choose')}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-slate-500 text-sm">Enter your credentials to sign in</p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPasswordError('') }}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                    placeholder="Enter your password"
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1.5">{passwordError}</p>
                  )}
                  {error && (
                    <p className="text-red-500 text-sm mt-1.5">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 active:bg-slate-950 transition-colors"
                >
                  {passwordLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <a href="/auth/forgot-password" className="text-center text-sm text-slate-900 font-medium hover:underline">
                Forgot password?
              </a>

              <p className="text-center text-slate-400 text-xs">
                Are you a client?{' '}
                <a href="/client-login" className="text-slate-900 font-medium hover:underline">
                  Client Portal
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-slate-900 border-t-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}