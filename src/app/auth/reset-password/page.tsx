'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND } from '@/shared/constants/constants'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'form' | 'success' | 'expired' | 'error'>('form')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ password?: string; confirm?: string }>({})

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-14 h-14 mx-auto bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Invalid Link</h2>
          <p className="text-slate-500 text-sm">This password reset link is invalid. Please request a new one.</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  const validatePassword = (pwd: string): string | undefined => {
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
    return undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    setError('')

    const passwordError = validatePassword(password)
    if (passwordError) {
      setValidationErrors({ password: passwordError })
      return
    }

    if (password !== confirmPassword) {
      setValidationErrors({ confirm: 'Passwords do not match' })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 410) {
          setStep('expired')
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
                <h2 className="text-2xl font-semibold text-slate-900 mb-1">Set new password</h2>
                <p className="text-slate-500 text-sm">
                  Create a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setValidationErrors({}) }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors ${
                      validationErrors.password ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="At least 8 characters with uppercase, lowercase, and number"
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1.5">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setValidationErrors({}) }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors ${
                      validationErrors.confirm ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Re-enter your password"
                  />
                  {validationErrors.confirm && (
                    <p className="text-red-500 text-sm mt-1.5">{validationErrors.confirm}</p>
                  )}
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
              </form>
            </>
          )}

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

          {step === 'expired' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 mx-auto bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Link Expired</h2>
                <p className="text-slate-500 text-sm mt-1">
                  This password reset link has expired. Please request a new one.
                </p>
              </div>
              <Link
                href="/auth/forgot-password"
                className="inline-block w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Request New Link
              </Link>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-slate-900 border-t-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}