'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">We encountered an unexpected error. Please try again.</p>
        <button onClick={reset} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition mr-3">
          Try Again
        </button>
        <a href="/" className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition">
          Go Home
        </a>
      </div>
    </div>
  )
}
