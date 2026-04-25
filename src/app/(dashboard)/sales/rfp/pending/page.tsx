'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RFP {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  rfpToken: string | null
  rfpStatus: string | null
  rfpSentAt: string | null
  pipeline: string | null
  createdAt: string
}

export default function PendingRFPsPage() {
  const [rfps, setRfps] = useState<RFP[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRfps()
  }, [])

  const fetchRfps = async () => {
    try {
      const res = await fetch('/api/sales/rfp?status=SENT')
      if (res.ok) {
        const data = await res.json()
        setRfps(data)
      }
    } catch (error) {
      console.error('Failed to fetch RFPs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/rfp-v2?token=${token}`
    navigator.clipboard.writeText(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Pending RFPs</h1>
          <p className="text-sm text-slate-400">RFP forms sent but not yet completed</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/sales/rfp/completed"
            className="px-4 py-2 border border-white/10 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-900/40 transition-colors"
          >
            View Completed
          </Link>
          <Link
            href="/sales/rfp/send"
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Send New RFP
          </Link>
        </div>
      </div>

      {rfps.length === 0 ? (
        <div className="glass-card rounded-lg border border-white/10 p-12 text-center text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No pending RFPs</p>
          <Link href="/sales/rfp/send" className="text-orange-600 hover:underline mt-2 inline-block">
            Send a new RFP
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/40 border-b border-white/10">
                <th className="text-left px-4 py-3 font-medium text-slate-300">Company</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Pipeline</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Sent At</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rfps.map(rfp => (
                <tr key={rfp.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <Link href={`/sales/leads/${rfp.id}`} className="text-orange-600 hover:underline font-medium">
                      {rfp.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{rfp.contactName}</div>
                    <div className="text-xs text-slate-400">{rfp.contactEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    {rfp.pipeline && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        rfp.pipeline === 'BRANDING_PIONEERS'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {rfp.pipeline.replace(/_/g, ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {formatDate(rfp.rfpSentAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => rfp.rfpToken && copyLink(rfp.rfpToken)}
                        className="px-3 py-1 text-xs text-orange-600 bg-orange-500/10 rounded hover:bg-orange-500/20"
                        title="Copy RFP Link"
                      >
                        Copy Link
                      </button>
                      <button
                        className="px-3 py-1 text-xs text-slate-300 bg-slate-800/50 rounded hover:bg-white/10"
                        title="Resend"
                      >
                        Resend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
