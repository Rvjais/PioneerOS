'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ViewAsData {
  viewingAs: boolean
  userId?: string
  name?: string
  role?: string
  department?: string
}

export function ImpersonationBanner() {
  const router = useRouter()
  const [data, setData] = useState<ViewAsData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/view-as')
      .then((r) => r.ok ? r.json() : { viewingAs: false })
      .then(setData)
      .catch(() => setData({ viewingAs: false }))
  }, [])

  const handleEndView = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/view-as?redirectTo=/admin/users', { method: 'DELETE' })
      if (res.ok) {
        window.location.href = '/admin/users'
      }
    } catch (error) {
      console.error('Error ending view:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!data?.viewingAs) return null

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>
          <strong>Admin Preview:</strong> Viewing as{' '}
          <strong>{data.name}</strong>
          {data.role && <span className="opacity-75 ml-1">({data.role}{data.department ? ` - ${data.department}` : ''})</span>}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/accounts"
          className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
        >
          Finance
        </Link>
        <Link
          href="/sales"
          className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
        >
          Sales
        </Link>
        <Link
          href="/hr"
          className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
        >
          HR
        </Link>
        <Link
          href="/seo"
          className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
        >
          SEO
        </Link>
        <Link
          href="/web"
          className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
        >
          Web
        </Link>
        <Link
          href="/ads"
          className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
        >
          Ads
        </Link>
        <Link
          href="/social"
          className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
        >
          Social
        </Link>
        <button
          onClick={handleEndView}
          disabled={loading}
          className="px-3 py-1 bg-white hover:bg-white/90 text-purple-700 rounded-lg text-xs font-medium disabled:opacity-50"
        >
          {loading ? 'Exiting...' : 'Exit Preview'}
        </button>
      </div>
    </div>
  )
}
