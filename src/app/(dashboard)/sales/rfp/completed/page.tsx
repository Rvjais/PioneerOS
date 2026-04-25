'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RFP {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  rfpStatus: string | null
  rfpCompletedAt: string | null
  stage: string
  pipeline: string | null
  primaryObjective: string | null
  budgetRange: string | null
  timeline: string | null
  isHealthcare: boolean
  createdAt: string
}

export default function CompletedRFPsPage() {
  const [rfps, setRfps] = useState<RFP[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRfps()
  }, [])

  const fetchRfps = async () => {
    try {
      const res = await fetch('/api/sales/rfp?status=COMPLETED')
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
    })
  }

  const formatBudget = (budget: string | null) => {
    if (!budget) return 'N/A'
    const map: Record<string, string> = {
      'UNDER_25K': '< 25K',
      '25K-50K': '25K-50K',
      '50K-1L': '50K-1L',
      '1L-2.5L': '1L-2.5L',
      'ABOVE_2.5L': '2.5L+',
    }
    return map[budget] || budget
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
          <h1 className="text-xl font-semibold text-white">Completed RFPs</h1>
          <p className="text-sm text-slate-400">RFP forms that have been filled by leads</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/sales/rfp/pending"
            className="px-4 py-2 border border-white/10 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-900/40 transition-colors"
          >
            View Pending
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No completed RFPs yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rfps.map(rfp => (
            <div
              key={rfp.id}
              className="glass-card rounded-lg border border-white/10 p-4 hover:shadow-none transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/sales/leads/${rfp.id}`}
                      className="font-semibold text-orange-600 hover:underline"
                    >
                      {rfp.companyName}
                    </Link>
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
                      Completed
                    </span>
                    {rfp.isHealthcare && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-teal-500/20 text-teal-400">
                        Healthcare
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {rfp.contactName} | {rfp.contactEmail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Completed {formatDate(rfp.rfpCompletedAt)}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                    rfp.stage === 'RFP_COMPLETED'
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {rfp.stage.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Objective:</span>
                  <p className="text-slate-200 font-medium">{rfp.primaryObjective?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Budget:</span>
                  <p className="text-slate-200 font-medium">{formatBudget(rfp.budgetRange)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Timeline:</span>
                  <p className="text-slate-200 font-medium">{rfp.timeline?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Pipeline:</span>
                  <p className="text-slate-200 font-medium">{rfp.pipeline?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Link
                  href={`/sales/leads/${rfp.id}`}
                  className="px-3 py-1.5 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-500/10"
                >
                  View Details
                </Link>
                <Link
                  href={`/sales/nurturing?leadId=${rfp.id}`}
                  className="px-3 py-1.5 text-sm text-slate-300 border border-white/10 rounded-lg hover:bg-slate-900/40"
                >
                  Start Nurturing
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
