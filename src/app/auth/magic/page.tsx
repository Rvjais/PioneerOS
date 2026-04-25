'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import Image from 'next/image'
import { BRAND } from '@/shared/constants/constants'

function MagicLinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Invalid or missing token')
      return
    }

    verifyToken(token)
  }, [token])

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch('/api/auth/magic-link/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 410) {
          setStatus('expired')
        } else {
          setStatus('error')
          setError(data.error || 'Verification failed')
        }
        return
      }

      // Token is valid, sign in with credentials
      setStatus('success')

      const result = await signIn('magic-link', {
        token,
        redirect: false,
      })

      if (result?.ok) {
        // Role-based redirect after login
        const session = await getSession()
        const redirectMap: Record<string, string> = {
          SUPER_ADMIN: '/dashboard',
          MANAGER: '/dashboard',
          SALES: '/sales',
          ACCOUNTS: '/accounts',
          FREELANCER: '/my-day',
          INTERN: '/intern',
        }
        const redirectTo = redirectMap[session?.user?.role ?? ''] || '/dashboard'
        router.push(redirectTo)
        router.refresh()
      } else {
        setStatus('error')
        setError('Failed to sign in')
      }
    } catch (err) {
      setStatus('error')
      setError('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-none">
              <Image
                src={BRAND.logo}
                alt={BRAND.logoAlt}
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-bold text-white">
              Pioneer<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">OS</span>
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#141A25] rounded-2xl border border-white/10 p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verifying your link...</h1>
              <p className="text-slate-400">Please wait while we sign you in</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verified!</h1>
              <p className="text-slate-400">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Link Expired</h1>
              <p className="text-slate-400 mb-6">This login link has expired. Please request a new one.</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Back to Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-slate-400 mb-6">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  )
}
