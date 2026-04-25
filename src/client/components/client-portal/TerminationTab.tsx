'use client'

import { useState, useEffect } from 'react'

interface TerminationData {
  hasActiveTermination: boolean
  client: {
    id: string
    name: string
    monthlyFee: number
    startDate: string | null
  }
  preview?: {
    noticeStartDate: string
    noticeEndDate: string
    noticePeriodDays: number
    totalProRata: number
    pendingDues: number
    totalDue: number
    formatted: {
      totalProRata: string
      pendingDues: string
      totalDue: string
    }
  }
  termination?: {
    id: string
    status: string
    noticeStartDate: string
    noticeEndDate: string
    totalProRata: number
    pendingDues: number
    totalDue: number
    amountPaid: number
    reason: string
    daysElapsed: number
    daysRemaining: number
    progress: number
    isPaid: boolean
    isNoticePeriodComplete: boolean
    canAccessHandover: boolean
    formatted: {
      totalProRata: string
      pendingDues: string
      totalDue: string
      amountPaid: string
      balanceDue: string
      noticeStartDate: string
      noticeEndDate: string
    }
  }
}

interface Props {
  isPrimary: boolean
}

export default function TerminationTab({ isPrimary }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TerminationData | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTerminationData()
  }, [])

  const fetchTerminationData = async () => {
    try {
      const res = await fetch('/api/client-portal/termination', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (err) {
      console.error('Failed to fetch termination data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestTermination = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for termination')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/client-portal/termination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      })

      if (res.ok) {
        setShowConfirm(false)
        setReason('')
        fetchTerminationData()
      } else {
        const err = await res.json()
        setError(err.error || 'Failed to submit termination request')
      }
    } catch (err) {
      setError('Failed to submit termination request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelTermination = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/client-portal/termination', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        fetchTerminationData()
      }
    } catch (err) {
      console.error('Failed to cancel:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isPrimary) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Restricted Access</h3>
        <p className="text-slate-400">Only the primary account holder can manage service termination.</p>
      </div>
    )
  }

  // Active termination in progress
  if (data?.hasActiveTermination && data.termination) {
    const t = data.termination
    const statusColors: Record<string, string> = {
      PENDING: 'bg-amber-500/20 text-amber-400',
      ACTIVE: 'bg-blue-500/20 text-blue-400',
      HANDOVER: 'bg-purple-500/20 text-purple-400',
      COMPLETED: 'bg-green-500/20 text-green-400',
      CANCELLED: 'bg-slate-500/20 text-slate-400',
    }

    return (
      <div className="space-y-6">
        {/* Status Header */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white">Termination In Progress</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Your service termination request is being processed. The notice period ends on{' '}
                <strong className="text-white">{t.formatted.noticeEndDate}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Notice Period Progress</h4>
          <div className="relative">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(t.progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{t.formatted.noticeStartDate}</span>
              <span className="text-white font-medium">{t.daysElapsed} of 30 days</span>
              <span>{t.formatted.noticeEndDate}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Settlement Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Pro-rata for notice period</span>
              <span className="text-white font-medium">{t.formatted.totalProRata}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Pending dues</span>
              <span className="text-white font-medium">{t.formatted.pendingDues}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-white font-semibold">Total Due</span>
              <span className="text-xl font-bold text-white">{t.formatted.totalDue}</span>
            </div>
            {t.amountPaid > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-green-400">Amount Paid</span>
                <span className="text-green-400 font-medium">- {t.formatted.amountPaid}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-white font-semibold">Balance Due</span>
              <span className={`text-xl font-bold ${t.isPaid ? 'text-green-400' : 'text-amber-400'}`}>
                {t.isPaid ? '₹0 (Paid)' : t.formatted.balanceDue}
              </span>
            </div>
          </div>

          {/* Payment Instructions */}
          {!t.isPaid && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm font-medium mb-2">Payment Instructions</p>
              <p className="text-slate-400 text-xs mb-3">
                Pay anytime during or after the notice period. Handover materials will be available after full settlement.
              </p>
              <div className="flex gap-2">
                <a
                  href={`mailto:accounts@company.com?subject=Termination Settlement - ${data?.client.name}&body=Client: ${data?.client.name}%0AAmount Due: ${t.formatted.balanceDue}%0A%0APlease share payment details.`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Request Payment Link
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Handover Status */}
        <div className={`rounded-xl p-6 ${t.canAccessHandover ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-800/50'}`}>
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Handover Status</h4>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.canAccessHandover ? 'bg-green-500/20' : 'bg-slate-700'}`}>
              {t.canAccessHandover ? (
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              {t.canAccessHandover ? (
                <>
                  <p className="text-green-400 font-medium">Handover Available</p>
                  <p className="text-slate-400 text-sm">You can now download your handover materials.</p>
                  <button className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                    Download Handover Package
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white font-medium">Handover Locked</p>
                  <p className="text-slate-400 text-sm">
                    Available after:
                    {!t.isNoticePeriodComplete && <span className="text-amber-400"> Notice period completion</span>}
                    {!t.isNoticePeriodComplete && !t.isPaid && <span> + </span>}
                    {!t.isPaid && <span className="text-amber-400"> Full payment</span>}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reason */}
        {t.reason && (
          <div className="bg-slate-800/50 rounded-xl p-6">
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Reason for Termination</h4>
            <p className="text-white">{t.reason}</p>
          </div>
        )}

        {/* Cancel Button */}
        {t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
          <div className="flex justify-end">
            <button
              onClick={handleCancelTermination}
              disabled={submitting}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Cancelling...' : 'Cancel Termination Request'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // No active termination - show request form
  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-slate-800/50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Service Termination</h3>
            <p className="text-slate-400 text-sm">
              If you wish to end your services with us, you can submit a termination request here.
              A 30-day notice period applies, during which services will continue as normal.
            </p>
          </div>
        </div>
      </div>

      {/* Preview of charges */}
      {data?.preview && (
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Estimated Settlement (if terminated today)
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Notice period</span>
              <span className="text-white">{data.preview.noticePeriodDays} days</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Pro-rata charges</span>
              <span className="text-white font-medium">{data.preview.formatted.totalProRata}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Pending dues</span>
              <span className="text-white font-medium">{data.preview.formatted.pendingDues}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-white font-semibold">Estimated Total</span>
              <span className="text-xl font-bold text-white">{data.preview.formatted.totalDue}</span>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Termination Button */}
      {/* How it works */}
      <div className="bg-slate-800/50 rounded-xl p-6">
        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">How Termination Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Submit Request</p>
              <p className="text-slate-400 text-xs">No payment required now</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-amber-400 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">30-Day Notice</p>
              <p className="text-slate-400 text-xs">Services continue normally</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-400 font-bold text-sm">3</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Pay & Get Handover</p>
              <p className="text-slate-400 text-xs">Access files after settlement</p>
            </div>
          </div>
        </div>
      </div>

      {!showConfirm ? (
        <div className="flex justify-center">
          <button
            onClick={() => setShowConfirm(true)}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-colors font-medium"
          >
            Request Service Termination
          </button>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-2">Submit Termination Request</h4>
          <p className="text-slate-400 text-sm mb-4">
            Please tell us why you&apos;re leaving. This helps us improve our services.
            <span className="block mt-1 text-xs text-slate-500">
              No payment required now — you can settle dues anytime during the notice period.
            </span>
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for termination..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {/* Terms acknowledgement */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4 text-sm">
            <p className="text-slate-300 mb-2">By submitting this request, you acknowledge:</p>
            <ul className="text-slate-400 space-y-1 text-xs">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                A 30-day notice period starts from today
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Services continue during notice period (charges apply)
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Handover materials provided after notice period + settlement
              </li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowConfirm(false)
                setReason('')
                setError('')
              }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestTermination}
              disabled={submitting}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
