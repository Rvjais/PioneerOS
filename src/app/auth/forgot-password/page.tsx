'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BRAND } from '@/shared/constants/constants'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp' | 'password' | 'success' | 'error'>('phone')
  const [phone, setPhone] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/password/reset-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-otp', phone }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError('Too many attempts. Please wait before trying again.')
        } else {
          setError(data.error || 'Failed to send OTP')
        }
        setStep('error')
        return
      }

      setMaskedPhone(data.maskedPhone || phone.slice(0, 2) + '****' + phone.slice(-4))
      setStep('otp')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.length < 8) {
      setError('Please enter the complete OTP')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/password/reset-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', phone, otp: otp.toUpperCase() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid OTP')
        return
      }

      setResetToken(data.resetToken)
      setStep('password')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      return
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/password/reset-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', resetToken, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 410) {
          setError('Session expired. Please request a new OTP.')
          return
        }
        setError(data.error || 'Failed to reset password')
        return
      }

      setStep('success')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderBackButton = () => (
    <Link
      href="/login"
      className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to login
    </Link>
  )

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
          {renderBackButton()}

          {/* Step 1: Phone */}
          {step === 'phone' && (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">Reset password</h2>
                <p className="text-slate-500 text-sm">
                  Enter your registered phone number to receive a one-time OTP.
                </p>
              </div>

              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError('') }}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                    placeholder="Enter your phone number"
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1.5">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 active:bg-slate-950 transition-colors"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">Enter OTP</h2>
                <p className="text-slate-500 text-sm">
                  We&apos;ve sent an OTP to {maskedPhone}
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.toUpperCase()); setError('') }}
                    maxLength={8}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors text-center text-xl tracking-widest"
                    placeholder="Enter 8-character OTP"
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1.5">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 8}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 active:bg-slate-950 transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                  Use different phone number
                </button>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">Set new password</h2>
                <p className="text-slate-500 text-sm">
                  Create a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                    placeholder="At least 8 characters with uppercase, lowercase, and number"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                    placeholder="Re-enter your password"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 active:bg-slate-950 transition-colors"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('otp'); setPassword(''); setConfirmPassword(''); setError('') }}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                  ← Back to OTP entry
                </button>
              </form>
            </>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 mx-auto bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Password reset!</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Your password has been changed successfully.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Error */}
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
                onClick={() => { setStep('phone'); setError('') }}
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
