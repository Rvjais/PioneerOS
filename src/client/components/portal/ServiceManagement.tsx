'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter, ConfirmModal } from '@/client/components/ui/Modal'

interface ProRataMonth {
  month: string
  daysServed: number
  daysInMonth: number
  amount: number
}

interface TerminationData {
  id: string
  status: string
  statusLabel: string
  reason: string | null
  feedback: string | null
  noticeStartDate: string
  noticeEndDate: string
  lastServiceDate: string
  daysElapsed: number
  daysRemaining: number
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
  handoverCallNotes: string | null
  dataExportEnabled: boolean
  dataExportedAt: string | null
  dataExportUrl: string | null
  formatted: {
    noticeStartDate: string
    noticeEndDate: string
    lastServiceDate: string
    monthlyFee: string
    proRataAmount: string
    pendingDues: string
    totalDue: string
    amountPaid: string
    amountRemaining: string
    handoverCallDate: string | null
  }
  requestedAt: string
  createdAt: string
}

interface PreviewData {
  noticeStartDate: string
  noticeEndDate: string
  noticePeriodDays: number
  proRataBreakdown: ProRataMonth[]
  totalProRata: number
  pendingDues: number
  totalDue: number
  formatted: {
    totalProRata: string
    pendingDues: string
    totalDue: string
  }
}

interface ClientData {
  id: string
  name: string
  monthlyFee: number
  startDate: string | null
}

interface TerminationResponse {
  hasActiveTermination: boolean
  termination?: TerminationData
  preview?: PreviewData
  client: ClientData
}

interface ServiceManagementProps {
  isPrimaryUser: boolean
  clientStartDate: string | null
}

const TERMINATION_REASONS = [
  { value: 'BUDGET', label: 'Budget constraints' },
  { value: 'IN_HOUSE', label: 'Moving to in-house team' },
  { value: 'SWITCHING_PROVIDER', label: 'Switching to another provider' },
  { value: 'BUSINESS_CLOSED', label: 'Business closing/restructuring' },
  { value: 'SERVICE_QUALITY', label: 'Service quality concerns' },
  { value: 'NOT_NEEDED', label: 'Services no longer needed' },
  { value: 'OTHER', label: 'Other reason' },
]

export default function ServiceManagement({ isPrimaryUser, clientStartDate }: ServiceManagementProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TerminationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Termination request modal state
  const [showTerminateModal, setShowTerminateModal] = useState(false)
  const [terminationForm, setTerminationForm] = useState({
    reason: '',
    feedback: '',
    acknowledgeNoticePeriod: false,
    acknowledgeDues: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Handover scheduling modal state
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [handoverForm, setHandoverForm] = useState({
    preferredDate: '',
    preferredTime: '14:00',
    notes: '',
  })
  const [schedulingHandover, setSchedulingHandover] = useState(false)

  // Cancel termination modal
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  // Export state
  const [exportingData, setExportingData] = useState(false)

  useEffect(() => {
    fetchTerminationStatus()
  }, [])

  const fetchTerminationStatus = async () => {
    try {
      const res = await fetch('/api/client-portal/termination')
      if (res.ok) {
        const responseData = await res.json()
        setData(responseData)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch termination status')
      }
    } catch (err) {
      console.error('Failed to fetch termination status:', err)
      setError('Failed to load service management data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTermination = async () => {
    if (!terminationForm.acknowledgeNoticePeriod || !terminationForm.acknowledgeDues) {
      setSubmitError('Please acknowledge both conditions')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/client-portal/termination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(terminationForm),
      })

      if (res.ok) {
        setShowTerminateModal(false)
        setTerminationForm({
          reason: '',
          feedback: '',
          acknowledgeNoticePeriod: false,
          acknowledgeDues: false,
        })
        fetchTerminationStatus()
      } else {
        const errorData = await res.json()
        setSubmitError(errorData.error || 'Failed to submit termination request')
      }
    } catch (err) {
      console.error('Failed to submit termination:', err)
      setSubmitError('Failed to submit termination request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleScheduleHandover = async () => {
    if (!handoverForm.preferredDate) {
      return
    }

    setSchedulingHandover(true)

    try {
      const res = await fetch('/api/client-portal/termination/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handoverForm),
      })

      if (res.ok) {
        setShowHandoverModal(false)
        setHandoverForm({ preferredDate: '', preferredTime: '14:00', notes: '' })
        fetchTerminationStatus()
      } else {
        const errorData = await res.json()
        console.error('Failed to schedule handover:', errorData)
      }
    } catch (err) {
      console.error('Failed to schedule handover:', err)
    } finally {
      setSchedulingHandover(false)
    }
  }

  const handleCancelTermination = async () => {
    if (!data?.termination?.id) return

    setCancelling(true)

    try {
      const res = await fetch(`/api/client-portal/termination?id=${data.termination.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason || 'Cancelled by client' }),
      })

      if (res.ok) {
        setShowCancelModal(false)
        setCancelReason('')
        fetchTerminationStatus()
      }
    } catch (err) {
      console.error('Failed to cancel termination:', err)
    } finally {
      setCancelling(false)
    }
  }

  const handleDataExport = async () => {
    setExportingData(true)

    try {
      const res = await fetch('/api/client-portal/termination/export')
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'termination_export.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
        fetchTerminationStatus()
      }
    } catch (err) {
      console.error('Failed to export data:', err)
    } finally {
      setExportingData(false)
    }
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

  if (loading) {
    return (
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading service management...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <div className="text-center py-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchTerminationStatus}
            className="mt-2 text-blue-400 hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Active termination view
  if (data?.hasActiveTermination && data.termination) {
    const t = data.termination
    const isCompleted = t.status === 'COMPLETED'
    const isCancelled = t.status === 'CANCELLED'

    return (
      <>
        <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Service Termination In Progress</h3>
                <p className="text-white/80 text-sm mt-1">Status: {t.statusLabel}</p>
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                {t.status}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Timeline */}
            <div>
              <h4 className="text-sm font-medium text-slate-200 mb-3">Timeline</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-300">{t.progress}%</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Started: {t.formatted.noticeStartDate}</span>
                <span>Day {t.daysElapsed} of 30</span>
                <span>Ends: {t.formatted.noticeEndDate}</span>
              </div>
            </div>

            {/* Status Steps */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  t.daysElapsed > 0 ? 'bg-green-500 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs text-slate-400 mt-1">Started</span>
              </div>
              <div className="flex-1 h-0.5 bg-white/10 mx-2" />
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  t.handoverCallCompleted ? 'bg-green-500 text-white' :
                  t.handoverCallScheduled ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-400 mt-1">Handover</span>
              </div>
              <div className="flex-1 h-0.5 bg-white/10 mx-2" />
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  t.paymentCleared ? 'bg-green-500 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-400 mt-1">Payment</span>
              </div>
              <div className="flex-1 h-0.5 bg-white/10 mx-2" />
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs text-slate-400 mt-1">Complete</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-slate-900/40 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-200 mb-3">Payment Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-400">Total Due</p>
                  <p className="text-lg font-semibold text-white">{t.formatted.totalDue}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Paid</p>
                  <p className="text-lg font-semibold text-green-400">{t.formatted.amountPaid}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Remaining</p>
                  <p className="text-lg font-semibold text-amber-400">{t.formatted.amountRemaining}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                    t.paymentCleared ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {t.paymentCleared ? 'Cleared' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Handover Call */}
            <div className="bg-slate-900/40 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-200 mb-3">Handover Call</h4>
              {t.handoverCallScheduled ? (
                <div>
                  <p className="text-sm text-slate-300">
                    Scheduled for: <span className="font-medium">{t.formatted.handoverCallDate}</span>
                  </p>
                  {t.handoverCallCompleted && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                      Completed
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-400 mb-3">Schedule a handover call to discuss transition details.</p>
                  {isPrimaryUser && (
                    <button
                      onClick={() => setShowHandoverModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Schedule Handover Call
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Data Export */}
            <div className="bg-slate-900/40 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-200 mb-3">Data Export</h4>
              {t.dataExportEnabled ? (
                <div>
                  <p className="text-sm text-green-400 mb-3">Data export is available. Download all your data.</p>
                  {t.dataExportedAt && (
                    <p className="text-xs text-slate-400 mb-2">Last exported: {formatDate(t.dataExportedAt)}</p>
                  )}
                  <button
                    onClick={handleDataExport}
                    disabled={exportingData}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {exportingData ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Data
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-400">
                    Data export will be available after payment is cleared.
                  </p>
                  <button
                    disabled
                    className="mt-3 px-4 py-2 bg-white/20 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Download Data (Locked)
                  </button>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            {!isCompleted && !isCancelled && isPrimaryUser && (
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-400 hover:text-red-400 text-sm font-medium"
                >
                  Cancel Termination Request
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Handover Scheduling Modal */}
        <Modal
          isOpen={showHandoverModal}
          onClose={() => setShowHandoverModal(false)}
          title="Schedule Handover Call"
        >
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  value={handoverForm.preferredDate}
                  onChange={(e) => setHandoverForm({ ...handoverForm, preferredDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  max={data?.termination?.noticeEndDate?.split('T')[0]}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Preferred Time</label>
                <select
                  value={handoverForm.preferredTime}
                  onChange={(e) => setHandoverForm({ ...handoverForm, preferredTime: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="10:00" className="bg-slate-800 text-white">10:00 AM</option>
                  <option value="11:00" className="bg-slate-800 text-white">11:00 AM</option>
                  <option value="14:00" className="bg-slate-800 text-white">2:00 PM</option>
                  <option value="15:00" className="bg-slate-800 text-white">3:00 PM</option>
                  <option value="16:00" className="bg-slate-800 text-white">4:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
                <textarea
                  value={handoverForm.notes}
                  onChange={(e) => setHandoverForm({ ...handoverForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Any specific topics to discuss during handover..."
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setShowHandoverModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleHandover}
              disabled={schedulingHandover || !handoverForm.preferredDate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {schedulingHandover && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Schedule Call
            </button>
          </ModalFooter>
        </Modal>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Termination Request"
        >
          <ModalBody>
            <div className="space-y-4">
              <p className="text-slate-300">Are you sure you want to cancel your termination request? Your services will continue as normal.</p>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Reason (optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={2}
                  placeholder="Why are you cancelling?"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
            >
              Keep Request
            </button>
            <button
              onClick={handleCancelTermination}
              disabled={cancelling}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {cancelling && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Cancel Termination
            </button>
          </ModalFooter>
        </Modal>
      </>
    )
  }

  // No active termination - show normal state
  return (
    <>
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Service Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Status</span>
            <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded">Active</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Monthly Fee</span>
            <span className="font-medium text-white">
              {data?.client?.monthlyFee ? formatCurrency(data.client.monthlyFee) : '-'}
            </span>
          </div>
          {clientStartDate && (
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Client Since</span>
              <span className="font-medium text-white">{formatDate(clientStartDate)}</span>
            </div>
          )}

          {isPrimaryUser && (
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => setShowTerminateModal(true)}
                className="text-red-400 hover:text-red-400 text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Terminate Services
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Termination Request Modal */}
      <Modal
        isOpen={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        title="Request Service Termination"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-6">
            {/* Warning */}
            <div className="bg-amber-500/10 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-medium text-amber-800">Important Notice</h4>
                  <p className="text-sm text-amber-400 mt-1">A 30-day notice period applies to all service terminations.</p>
                </div>
              </div>
            </div>

            {/* Notice Period Info */}
            {data?.preview && (
              <div className="bg-slate-900/40 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Notice Period</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Notice Start</p>
                    <p className="font-medium text-white">{formatDate(data.preview.noticeStartDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Last Service Date</p>
                    <p className="font-medium text-white">{formatDate(data.preview.noticeEndDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pro-rata Charges */}
            {data?.preview && (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <div className="bg-slate-900/40 px-4 py-2 border-b border-white/10">
                  <h4 className="font-medium text-white">Pro-Rata Charges</h4>
                </div>
                <div className="p-4 space-y-3">
                  {data.preview.proRataBreakdown.map((month, idx) => (
                    <div key={month.month} className="flex justify-between text-sm">
                      <span className="text-slate-300">
                        {month.month} ({month.daysServed} days)
                      </span>
                      <span className="font-medium text-white">{formatCurrency(month.amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Subtotal</span>
                      <span className="font-medium text-white">{data.preview.formatted.totalProRata}</span>
                    </div>
                    {data.preview.pendingDues > 0 && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-300">Pending Dues</span>
                        <span className="font-medium text-amber-400">{data.preview.formatted.pendingDues}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base mt-2 pt-2 border-t border-white/10">
                      <span className="font-medium text-white">Total Due</span>
                      <span className="font-bold text-white">{data.preview.formatted.totalDue}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-500/10 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-400">{submitError}</p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Reason for leaving</label>
              <select
                value={terminationForm.reason}
                onChange={(e) => setTerminationForm({ ...terminationForm, reason: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" className="bg-slate-800 text-white">Select a reason...</option>
                {TERMINATION_REASONS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-slate-800 text-white">{r.label}</option>
                ))}
              </select>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Additional Feedback (optional)</label>
              <textarea
                value={terminationForm.feedback}
                onChange={(e) => setTerminationForm({ ...terminationForm, feedback: e.target.value })}
                rows={3}
                placeholder="Help us improve by sharing your experience..."
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Acknowledgments */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terminationForm.acknowledgeNoticePeriod}
                  onChange={(e) => setTerminationForm({ ...terminationForm, acknowledgeNoticePeriod: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-400 border-white/20 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">I understand the 30-day notice period and that services will continue until the last service date</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terminationForm.acknowledgeDues}
                  onChange={(e) => setTerminationForm({ ...terminationForm, acknowledgeDues: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-400 border-white/20 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">I understand that all dues must be cleared before data export is available</span>
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setShowTerminateModal(false)}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitTermination}
            disabled={submitting || !terminationForm.acknowledgeNoticePeriod || !terminationForm.acknowledgeDues}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Submit Termination Request
          </button>
        </ModalFooter>
      </Modal>
    </>
  )
}
