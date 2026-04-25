'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  month: number
  year: number
}

export function SyncMyZenButton({ month, year }: Props) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)

    try {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)

      const res = await fetch('/api/hr/attendance/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'all',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          success: true,
          message: `Synced ${data.attendance?.synced || 0} attendance records`,
        })
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to sync',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
      >
        {syncing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync MyZen
          </>
        )}
      </button>

      {result && (
        <div className={`absolute top-full right-0 mt-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
          result.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {result.message}
        </div>
      )}
    </div>
  )
}
