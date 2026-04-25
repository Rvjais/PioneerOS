'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/login', redirect: true })
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: direct navigation to sign out endpoint
      window.location.href = '/api/auth/signout?callbackUrl=/login'
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
        {isLoading ? 'Signing out...' : 'Sign out and use a different account'}
      </button>
      {/* Fallback link if button doesn't work */}
      <a
        href="/api/auth/signout?callbackUrl=/login"
        className="block text-center text-xs text-slate-500 hover:text-slate-400 underline"
      >
        Click here if sign out doesn&apos;t work
      </a>
    </div>
  )
}
