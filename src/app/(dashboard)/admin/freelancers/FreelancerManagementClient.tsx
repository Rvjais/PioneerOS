'use client'

import { useState, useMemo } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  status: string
}

interface WorkReport {
  id: string
  periodStart: string
  periodEnd: string
  submittedAt: string
  projectName: string
  clientId: string | null
  description: string
  hoursWorked: number
  billableAmount: number
  status: string
}

interface Payment {
  id: string
  amount: number
  paymentDate: string
  periodStart: string
  periodEnd: string
  paymentMethod: string
  transactionRef: string | null
  status: string
}

interface FreelancerProfile {
  id: string
  userId: string
  hourlyRate: number | null
  totalEarned: number
  pendingAmount: number
  skills: string | null
  user: User
  workReports: WorkReport[]
  payments: Payment[]
}

interface Props {
  freelancers: FreelancerProfile[]
}

export function FreelancerManagementClient({ freelancers: initialFreelancers }: Props) {
  const router = useRouter()
  const [freelancers, setFreelancers] = useState(initialFreelancers)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'instructions'>('pending')

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const formatDate = (date: string) =>
    formatDateDDMMYYYY(date)

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  }

  // Generate last 12 months for navigation
  const months = useMemo(() => {
    const result: string[] = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      result.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    }
    return result
  }, [])

  // Filter reports by selected month
  const getReportsForMonth = (reports: WorkReport[], month: string) => {
    const [year, mon] = month.split('-').map(Number)
    return reports.filter((r) => {
      const date = new Date(r.periodStart)
      return date.getFullYear() === year && date.getMonth() + 1 === mon
    })
  }

  // Calculate monthly stats for a freelancer
  const getMonthlyStats = (freelancer: FreelancerProfile, month: string) => {
    const reports = getReportsForMonth(freelancer.workReports, month)
    const totalAmount = reports.reduce((sum, r) => sum + r.billableAmount, 0)
    const totalHours = reports.reduce((sum, r) => sum + r.hoursWorked, 0)
    const pendingAmount = reports.filter((r) => r.status !== 'PAID' && r.status !== 'REJECTED').reduce((sum, r) => sum + r.billableAmount, 0)
    const paidAmount = reports.filter((r) => r.status === 'PAID').reduce((sum, r) => sum + r.billableAmount, 0)
    const pendingReports = reports.filter((r) => r.status === 'SUBMITTED').length
    const reviewedReports = reports.filter((r) => r.status === 'REVIEWED').length
    const approvedReports = reports.filter((r) => r.status === 'APPROVED').length

    return { reports, totalAmount, totalHours, pendingAmount, paidAmount, pendingReports, reviewedReports, approvedReports }
  }

  // Bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedReports.length === 0) return

    setProcessing(true)
    try {
      const res = await fetch('/api/freelancer/work-reports/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportIds: selectedReports, status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
        setSelectedReports([])
        // Update local state
        setFreelancers((prev) =>
          prev.map((f) => ({
            ...f,
            workReports: f.workReports.map((r) =>
              selectedReports.includes(r.id) ? { ...r, status: newStatus } : r
            ),
          }))
        )
      }
    } finally {
      setProcessing(false)
    }
  }

  // Process payment
  const handleProcessPayment = async (freelancerId: string, amount: number, reportIds: string[]) => {
    setProcessing(true)
    try {
      const [year, month] = selectedMonth.split('-').map(Number)
      const periodStart = new Date(year, month - 1, 1)
      const periodEnd = new Date(year, month, 0)

      const res = await fetch('/api/freelancer/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerProfileId: freelancerId,
          amount,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'BANK_TRANSFER',
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          workReportIds: reportIds,
        }),
      })

      if (res.ok) {
        // Mark reports as paid
        await handleBulkStatusUpdate('PAID')
        setShowPaymentModal(false)
        router.refresh()
      }
    } finally {
      setProcessing(false)
    }
  }

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    )
  }

  const selectAllPendingReports = (freelancerId: string) => {
    const freelancer = freelancers.find((f) => f.id === freelancerId)
    if (!freelancer) return

    const monthReports = getReportsForMonth(freelancer.workReports, selectedMonth)
    const pendingIds = monthReports
      .filter((r) => r.status !== 'PAID' && r.status !== 'REJECTED')
      .map((r) => r.id)

    setSelectedReports(pendingIds)
  }

  const statusColors: Record<string, string> = {
    SUBMITTED: 'bg-yellow-500/20 text-yellow-400',
    REVIEWED: 'bg-blue-500/20 text-blue-400',
    APPROVED: 'bg-green-500/20 text-green-400',
    PAID: 'bg-emerald-500/20 text-emerald-400',
    REJECTED: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-purple-600 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Work Review
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-purple-600 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Payment History
        </button>
        <button
          onClick={() => setActiveTab('instructions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'instructions'
              ? 'border-purple-600 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Application Instructions
        </button>
      </div>

      {/* Instructions Tab */}
      {activeTab === 'instructions' && (
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">How to Apply as a Freelancer</h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3">Requirements</h3>
              <ul className="space-y-2 text-sm text-purple-400">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Portfolio with at least 3 relevant projects
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Proficiency in required skills (Web Dev, Design, Content, etc.)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Availability of at least 20 hours per week
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  Bank account details for payment processing
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-xl border border-white/10 p-6">
              <h3 className="font-semibold text-white mb-3">Application Process</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold">1</div>
                  <div>
                    <p className="font-medium text-white">Submit Application</p>
                    <p className="text-sm text-slate-400">Fill out the freelancer application form with your details and portfolio links</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold">2</div>
                  <div>
                    <p className="font-medium text-white">Skills Assessment</p>
                    <p className="text-sm text-slate-400">Complete a small test project to demonstrate your skills</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold">3</div>
                  <div>
                    <p className="font-medium text-white">Interview</p>
                    <p className="text-sm text-slate-400">Brief call to discuss rates, availability, and work expectations</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 font-bold">4</div>
                  <div>
                    <p className="font-medium text-white">Onboarding</p>
                    <p className="text-sm text-slate-400">Get access to the freelancer dashboard and start logging work</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-6">
              <h3 className="font-semibold text-amber-800 mb-3">Payment Terms</h3>
              <ul className="space-y-2 text-sm text-amber-400">
                <li>- Payments are processed on the 5th of every month for the previous month</li>
                <li>- Minimum payout threshold: Rs. 5,000</li>
                <li>- Payment method: Bank Transfer (NEFT/IMPS)</li>
                <li>- Work must be reviewed and approved before payment</li>
                <li>- Submit all work reports by the last day of the month</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <a
                href="/join?type=freelancer"
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                Apply as Freelancer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Work Review Tab */}
      {activeTab === 'pending' && (
        <>
          {/* Month Navigation */}
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-200">Select Month</h3>
              <span className="text-lg font-semibold text-purple-400">{getMonthName(selectedMonth)}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => {
                    setSelectedMonth(month)
                    setSelectedReports([])
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedMonth === month
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {getMonthName(month)}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedReports.length > 0 && (
            <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4 flex items-center justify-between">
              <span className="text-sm text-purple-400">
                <span className="font-semibold">{selectedReports.length}</span> reports selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('REVIEWED')}
                  disabled={processing}
                  className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('APPROVED')}
                  disabled={processing}
                  className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('REJECTED')}
                  disabled={processing}
                  className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={processing}
                  className="px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  Process Payment
                </button>
                <button
                  onClick={() => setSelectedReports([])}
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 glass-card border border-white/20 rounded-lg hover:bg-slate-900/40"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Freelancer Cards */}
          <div className="space-y-4">
            {freelancers.map((freelancer) => {
              const stats = getMonthlyStats(freelancer, selectedMonth)
              const isExpanded = selectedFreelancer === freelancer.id

              return (
                <div key={freelancer.id} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                  {/* Freelancer Header */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/40"
                    onClick={() => setSelectedFreelancer(isExpanded ? null : freelancer.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg">
                        {freelancer.user.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {freelancer.user.firstName} {freelancer.user.lastName}
                        </p>
                        <p className="text-sm text-slate-400">{freelancer.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Total Due</p>
                        <p className="font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Paid</p>
                        <p className="font-bold text-emerald-600">{formatCurrency(stats.paidAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Reports</p>
                        <p className="font-bold text-white">{stats.reports.length}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {stats.pendingReports > 0 && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                            {stats.pendingReports} pending
                          </span>
                        )}
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {/* Quick Actions */}
                      <div className="px-4 py-3 bg-slate-900/40 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            selectAllPendingReports(freelancer.id)
                          }}
                          className="text-sm text-purple-400 hover:text-purple-400 font-medium"
                        >
                          Select All Pending
                        </button>
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            Hours: <span className="font-semibold">{stats.totalHours}h</span>
                          </span>
                          <span>
                            Rate: <span className="font-semibold">{formatCurrency(freelancer.hourlyRate || 500)}/hr</span>
                          </span>
                        </div>
                      </div>

                      {/* Reports Table */}
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="w-10 px-3 py-2">
                              <input
                                type="checkbox"
                                checked={
                                  stats.reports.length > 0 &&
                                  stats.reports.every((r) => selectedReports.includes(r.id))
                                }
                                onChange={() => {
                                  const reportIds = stats.reports.map((r) => r.id)
                                  if (reportIds.every((id) => selectedReports.includes(id))) {
                                    setSelectedReports((prev) => prev.filter((id) => !reportIds.includes(id)))
                                  } else {
                                    setSelectedReports((prev) => [...new Set([...prev, ...reportIds])])
                                  }
                                }}
                                className="rounded border-white/20"
                              />
                            </th>
                            <th className="text-left px-3 py-2 font-medium text-slate-300">Date</th>
                            <th className="text-left px-3 py-2 font-medium text-slate-300">Project</th>
                            <th className="text-left px-3 py-2 font-medium text-slate-300">Description</th>
                            <th className="text-center px-3 py-2 font-medium text-slate-300">Hours</th>
                            <th className="text-right px-3 py-2 font-medium text-slate-300">Amount</th>
                            <th className="text-center px-3 py-2 font-medium text-slate-300">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {stats.reports.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                No work reports for {getMonthName(selectedMonth)}
                              </td>
                            </tr>
                          ) : (
                            stats.reports.map((report) => (
                              <tr
                                key={report.id}
                                className={`hover:bg-slate-900/40 ${
                                  selectedReports.includes(report.id) ? 'bg-purple-500/10' : ''
                                }`}
                              >
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedReports.includes(report.id)}
                                    onChange={() => toggleReportSelection(report.id)}
                                    className="rounded border-white/20"
                                  />
                                </td>
                                <td className="px-3 py-2 text-slate-300">{formatDate(report.periodStart)}</td>
                                <td className="px-3 py-2 text-slate-200 font-medium">{report.projectName}</td>
                                <td className="px-3 py-2 text-slate-300 truncate max-w-[200px]">{report.description}</td>
                                <td className="px-3 py-2 text-center text-slate-200">{report.hoursWorked}h</td>
                                <td className="px-3 py-2 text-right font-medium text-white">
                                  {formatCurrency(report.billableAmount)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[report.status]}`}>
                                    {report.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {/* Summary */}
                      {stats.reports.length > 0 && (
                        <div className="px-4 py-3 bg-slate-900/40 border-t border-white/10 flex items-center justify-between">
                          <div className="text-sm text-slate-300">
                            Total: <span className="font-semibold">{formatCurrency(stats.totalAmount)}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-emerald-600">
                              Paid: <span className="font-semibold">{formatCurrency(stats.paidAmount)}</span>
                            </span>
                            <span className="text-yellow-600">
                              Due: <span className="font-semibold">{formatCurrency(stats.pendingAmount)}</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {freelancers.length === 0 && (
              <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
                <p className="text-slate-400">No freelancers found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payment History Tab */}
      {activeTab === 'history' && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900/40 border-b border-white/10">
            <h3 className="font-semibold text-white">Payment History</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Freelancer</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Period</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Payment Date</th>
                <th className="text-right px-4 py-3 font-medium text-slate-300">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Method</th>
                <th className="text-left px-4 py-3 font-medium text-slate-300">Reference</th>
                <th className="text-center px-4 py-3 font-medium text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {freelancers.flatMap((f) =>
                f.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-medium text-white">
                      {f.user.firstName} {f.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{formatDate(payment.paymentDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{payment.paymentMethod}</td>
                    <td className="px-4 py-3 text-slate-300">{payment.transactionRef || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          payment.status === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-400'
                            : payment.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-800/50 text-slate-200'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {freelancers.every((f) => f.payments.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No payment history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedReports.length > 0 && (
        <PaymentModal
          freelancers={freelancers}
          selectedReports={selectedReports}
          onClose={() => setShowPaymentModal(false)}
          onProcess={handleProcessPayment}
          processing={processing}
        />
      )}
    </div>
  )
}

// Payment Modal Component
function PaymentModal({
  freelancers,
  selectedReports,
  onClose,
  onProcess,
  processing,
}: {
  freelancers: FreelancerProfile[]
  selectedReports: string[]
  onClose: () => void
  onProcess: (freelancerId: string, amount: number, reportIds: string[]) => Promise<void>
  processing: boolean
}) {
  // Find reports and calculate totals
  const reportDetails = freelancers.flatMap((f) =>
    f.workReports
      .filter((r) => selectedReports.includes(r.id))
      .map((r) => ({ ...r, freelancer: f }))
  )

  // Group by freelancer
  const byFreelancer = reportDetails.reduce((acc, r) => {
    if (!acc[r.freelancer.id]) {
      acc[r.freelancer.id] = { freelancer: r.freelancer, reports: [], total: 0 }
    }
    acc[r.freelancer.id].reports.push(r)
    acc[r.freelancer.id].total += r.billableAmount
    return acc
  }, {} as Record<string, { freelancer: FreelancerProfile; reports: typeof reportDetails; total: number }>)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card rounded-2xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Process Payment</h2>

        <div className="space-y-4 mb-6">
          {Object.values(byFreelancer).map(({ freelancer, reports, total }) => (
            <div key={freelancer.id} className="bg-slate-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-white">
                  {freelancer.user.firstName} {freelancer.user.lastName}
                </p>
                <p className="font-bold text-emerald-600">{formatCurrency(total)}</p>
              </div>
              <p className="text-sm text-slate-400">{reports.length} work reports</p>
              <button
                onClick={() => onProcess(freelancer.id, total, reports.map((r) => r.id))}
                disabled={processing}
                className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-slate-300 bg-slate-800/50 rounded-lg text-sm font-medium hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
