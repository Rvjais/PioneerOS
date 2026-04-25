'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LeaveActionButtonsProps {
  requestId: string
  onAction?: (status: 'approved' | 'rejected') => void
}

export function LeaveActionButtons({ requestId, onAction }: LeaveActionButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hr/leave/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'approve' ? 'APPROVED' : 'REJECTED' }),
      })
      if (res.ok) {
        onAction?.(action === 'approve' ? 'approved' : 'rejected')
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating leave request:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading}
        title="Approve"
        className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading}
        title="Reject"
        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
