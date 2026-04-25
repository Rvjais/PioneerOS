'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'

interface ProRataMonth {
  month: string
  daysServed: number
  daysInMonth: number
  amount: number
}

interface Client {
  id: string
  name: string
  tier: string
  monthlyFee: number | null
  contactName: string | null
  contactEmail: string | null
  whatsapp: string | null
}

interface Termination {
  id: string
  client: Client
  status: string
  statusLabel: string
  reason: string | null
  feedback: string | null
  noticeStartDate: string
  noticeEndDate: string
  lastServiceDate: string
  daysRemaining: number
  daysElapsed: number
  progress: number
  monthlyFee: number
  proRataBreakdown: ProRataMonth[]
  proRataAmount: number
  pendingDues: number
  totalDue: number
  amountPaid: number
  amountRemaining: number
  paymentCleared: boolean
  paymentClearedAt: string | null
  handoverCallScheduled: boolean
  handoverCallDate: string | null
  handoverCallCompleted: boolean
  dataExportEnabled: boolean
  dataExportedAt: string | null
  adminNotes: string | null
  processedBy: string | null
  processedAt: string | null
  formatted: {
    noticeStartDate: string
    noticeEndDate: string
    totalDue: string
    amountPaid: string
    amountRemaining: string
  }
  requestedAt: string
  createdAt: string
}

interface TerminationsResponse {
  terminations: Termination[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  counts: Record<string, number>
  statuses: string[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  ACTIVE: { bg: 'bg-blue-500/20', text: 'text-blue-800' },
  HANDOVER: { bg: 'bg-purple-500/20', text: 'text-purple-800' },
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-800' },
  CANCELLED: { bg: 'bg-slate-800/50', text: 'text-white' },
}

export default function TerminationsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TerminationsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  // Detail modal
  const [selectedTermination, setSelectedTermination] = useState<Termination | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [recordingPayment, setRecordingPayment] = useState(false)

  // Admin notes modal
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchTerminations()
  }, [statusFilter, page])

  const fetchTerminations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: '20',
      })
      const res = await fetch(`/api/admin/terminations?${params}`)
      if (res.ok) {
        const responseData = await res.json()
        setData(responseData)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch terminations')
      }
    } catch (err) {
      console.error('Failed to fetch terminations:', err)
      setError('Failed to load terminations')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (terminationId: string, action: string, actionData: Record<string, unknown> = {}) => {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/admin/terminations/${terminationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...actionData }),
      })

      if (res.ok) {
        fetchTerminations()
        setShowDetailModal(false)
        setShowPaymentModal(false)
        setShowNotesModal(false)
      } else {
        const errorData = await res.json()
        console.error('Action failed:', errorData)
      }
    } catch (err) {
      console.error('Action failed:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedTermination || !paymentAmount) return
    setRecordingPayment(true)
    await handleAction(selectedTermination.id, 'RECORD_PAYMENT', { amount: parseFloat(paymentAmount) })
    setPaymentAmount('')
    setRecordingPayment(false)
  }

  const handleSaveNotes = async () => {
    if (!selectedTermination) return
    setSavingNotes(true)
    await handleAction(selectedTermination.id, 'UPDATE_NOTES', { adminNotes })
    setSavingNotes(false)
  }

  const openDetailModal = (termination: Termination) => {
    setSelectedTermination(termination)
    setAdminNotes(termination.adminNotes || '')
    setShowDetailModal(true)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchTerminations}
          className="mt-2 text-blue-400 hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Terminations</h1>
          <p className="text-slate-400 mt-1">Manage client service termination requests</p>
        </div>
        <Link
          href="/accounts"
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Status Tabs */}
      {data?.counts && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'ACTIVE', 'HANDOVER', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              <span className="ml-2 px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs">
                {data.counts[status] || 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Terminations List */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        {data?.terminations.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400">No termination requests found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Requested</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">End Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount Due</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data?.terminations.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-white">{t.client.name}</p>
                      <p className="text-sm text-slate-400">{t.client.tier}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300">
                    {t.formatted.noticeStartDate}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300">
                    {t.formatted.noticeEndDate}
                    <span className="block text-xs text-slate-400">
                      {t.daysRemaining} days left
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-white">{t.formatted.totalDue}</p>
                      {t.amountPaid > 0 && (
                        <p className="text-xs text-green-400">Paid: {t.formatted.amountPaid}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 w-20">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{t.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      STATUS_COLORS[t.status]?.bg || 'bg-slate-800/50'
                    } ${STATUS_COLORS[t.status]?.text || 'text-white'}`}>
                      {t.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => openDetailModal(t)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} terminations
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
              className="px-3 py-1.5 text-sm font-medium bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Termination: ${selectedTermination?.client.name}`}
        size="lg"
      >
        {selectedTermination && (
          <>
            <ModalBody>
              <div className="space-y-6">
                {/* Client Info */}
                <div className="bg-slate-900/40 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">Client Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Client</p>
                      <p className="font-medium text-white">{selectedTermination.client.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Tier</p>
                      <p className="font-medium text-white">{selectedTermination.client.tier}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Contact</p>
                      <p className="font-medium text-white">{selectedTermination.client.contactName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Email</p>
                      <p className="font-medium text-white">{selectedTermination.client.contactEmail || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-slate-900/40 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">Notice Period</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${selectedTermination.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{selectedTermination.progress}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Started: {selectedTermination.formatted.noticeStartDate}</span>
                    <span>Day {selectedTermination.daysElapsed} of 30</span>
                    <span>Ends: {selectedTermination.formatted.noticeEndDate}</span>
                  </div>
                </div>

                {/* Reason & Feedback */}
                {(selectedTermination.reason || selectedTermination.feedback) && (
                  <div className="bg-slate-900/40 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Reason & Feedback</h4>
                    {selectedTermination.reason && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-400">Reason</p>
                        <p className="text-sm text-white">{selectedTermination.reason}</p>
                      </div>
                    )}
                    {selectedTermination.feedback && (
                      <div>
                        <p className="text-xs text-slate-400">Feedback</p>
                        <p className="text-sm text-white">{selectedTermination.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Details */}
                <div className="bg-slate-900/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Payment Details</h4>
                    {!selectedTermination.paymentCleared && (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="text-sm text-blue-400 hover:text-blue-400"
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-400">Total Due</p>
                      <p className="text-lg font-semibold text-white">{selectedTermination.formatted.totalDue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Paid</p>
                      <p className="text-lg font-semibold text-green-400">{selectedTermination.formatted.amountPaid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Remaining</p>
                      <p className="text-lg font-semibold text-amber-400">{selectedTermination.formatted.amountRemaining}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      selectedTermination.paymentCleared ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedTermination.paymentCleared ? 'Payment Cleared' : 'Payment Pending'}
                    </span>
                  </div>
                </div>

                {/* Pro-rata Breakdown */}
                {selectedTermination.proRataBreakdown.length > 0 && (
                  <div className="border border-white/10 rounded-lg overflow-hidden">
                    <div className="bg-slate-900/40 px-4 py-2 border-b border-white/10">
                      <h4 className="font-medium text-white">Pro-Rata Breakdown</h4>
                    </div>
                    <div className="p-4 space-y-2">
                      {selectedTermination.proRataBreakdown.map((month, idx) => (
                        <div key={month.month} className="flex justify-between text-sm">
                          <span className="text-slate-300">
                            {month.month} ({month.daysServed} of {month.daysInMonth} days)
                          </span>
                          <span className="font-medium text-white">{formatCurrency(month.amount)}</span>
                        </div>
                      ))}
                      {selectedTermination.pendingDues > 0 && (
                        <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                          <span className="text-slate-300">Pending Dues</span>
                          <span className="font-medium text-amber-400">{formatCurrency(selectedTermination.pendingDues)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Handover Status */}
                <div className="bg-slate-900/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Handover Call</h4>
                    {selectedTermination.handoverCallScheduled && !selectedTermination.handoverCallCompleted && (
                      <button
                        onClick={() => handleAction(selectedTermination.id, 'COMPLETE_HANDOVER')}
                        disabled={actionLoading === 'COMPLETE_HANDOVER'}
                        className="text-sm text-green-400 hover:text-green-400 disabled:opacity-50"
                      >
                        {actionLoading === 'COMPLETE_HANDOVER' ? 'Marking...' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
                  <div className="text-sm">
                    {selectedTermination.handoverCallScheduled ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">
                          Scheduled: {selectedTermination.handoverCallDate ? formatDate(selectedTermination.handoverCallDate) : '-'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          selectedTermination.handoverCallCompleted ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {selectedTermination.handoverCallCompleted ? 'Completed' : 'Scheduled'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-slate-400">Not scheduled yet</p>
                    )}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="bg-slate-900/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Admin Notes</h4>
                    <button
                      onClick={() => setShowNotesModal(true)}
                      className="text-sm text-blue-400 hover:text-blue-400"
                    >
                      {selectedTermination.adminNotes ? 'Edit' : 'Add'} Notes
                    </button>
                  </div>
                  {selectedTermination.adminNotes ? (
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{selectedTermination.adminNotes}</pre>
                  ) : (
                    <p className="text-sm text-slate-400">No admin notes</p>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2">
                  {!selectedTermination.dataExportEnabled && (
                    <button
                      onClick={() => handleAction(selectedTermination.id, 'ENABLE_DATA_EXPORT')}
                      disabled={actionLoading === 'ENABLE_DATA_EXPORT'}
                      className="px-3 py-1.5 text-sm font-medium text-amber-400 border border-amber-300 rounded-lg hover:bg-amber-500/10 disabled:opacity-50"
                    >
                      Enable Export
                    </button>
                  )}
                  {selectedTermination.status === 'ACTIVE' || selectedTermination.status === 'HANDOVER' ? (
                    <button
                      onClick={() => handleAction(selectedTermination.id, 'COMPLETE_TERMINATION')}
                      disabled={actionLoading === 'COMPLETE_TERMINATION'}
                      className="px-3 py-1.5 text-sm font-medium text-green-400 border border-green-300 rounded-lg hover:bg-green-500/10 disabled:opacity-50"
                    >
                      Complete Termination
                    </button>
                  ) : null}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-300 mb-2">
                Outstanding: <span className="font-semibold">{selectedTermination?.formatted.amountRemaining}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Payment Amount (INR)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setShowPaymentModal(false)}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRecordPayment}
            disabled={recordingPayment || !paymentAmount}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {recordingPayment && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Record Payment
          </button>
        </ModalFooter>
      </Modal>

      {/* Admin Notes Modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="Admin Notes"
      >
        <ModalBody>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={5}
              placeholder="Add internal notes about this termination..."
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setShowNotesModal(false)}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingNotes && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Save Notes
          </button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
