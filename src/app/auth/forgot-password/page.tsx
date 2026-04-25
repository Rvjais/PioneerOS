'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BRAND } from '@/shared/constants/constants'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP')
  const [step, setStep] = useState<'form' | 'sent' | 'error'>('form')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    setError('')

    if (!phone.trim()) {
      setValidationError('Please enter your phone number')
      return
    }

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setValidationError('Please enter a valid phone number')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, channel }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429 || data.error?.includes('rate limit')) {
          setError('Too many attempts. Please wait before trying again.')
        } else {
          setError(data.error || 'Failed to send reset link')
        }
        setStep('error')
        return
      }

      setStep('sent')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('error')
    } finally {
      setLoading(false)
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
          <p className="text-base text-slate-500 leading-relaxed">
            Agency operations platform. Elevating digital marketing through radical transparency.
          </p>
        </div>
      </div>

      {/* Right Pane */}
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
          {/* Back Link */}
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to login
          </Link>

          {step === 'form' && (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">Reset password</h2>
                <p className="text-slate-500 text-sm">
                  Enter your phone number and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Channel Toggle */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setChannel('WHATSAPP')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      channel === 'WHATSAPP'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('EMAIL')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      channel === 'EMAIL'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Email
                  </button>
                </div>

                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setValidationError('') }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors ${
                      validationError ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter your phone number"
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {step === 'sent' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 mx-auto bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Check your {channel === 'WHATSAPP' ? 'WhatsApp' : 'inbox'}</h2>
                <p className="text-slate-500 text-sm mt-1">
                  We&apos;ve sent a password reset link to your {channel === 'WHATSAPP' ? 'WhatsApp' : 'email'}.
                </p>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click the link in the message to reset your password.
                <br />The link expires in 30 minutes.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}

          {step === 'error' && (
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
              <button
                onClick={() => setStep('form')}
                className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}