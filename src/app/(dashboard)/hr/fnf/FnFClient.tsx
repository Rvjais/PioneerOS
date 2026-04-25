'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'
import { formatMoney } from '@/shared/utils/money'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

// ── Types ──────────────────────────────────────────

interface LineItem {
  id: string
  type: string
  description: string
  amount: number
  isDeduction: boolean
}

interface Settlement {
  id: string
  userId: string
  exitProcessId: string
  status: string
  totalAmount: number
  netPayable: number
  approvedByHR: string | null
  approvedByFinance: string | null
  approvedByLeadership: string | null
  paidAt: string | null
  createdAt: string
  user: {
    id: string
    empId: string
    firstName: string
    lastName: string | null
    department: string
    email?: string | null
    joiningDate?: string
  }
  exitProcess: {
    id: string
    type: string
    noticeDate: string
    lastWorkingDate: string | null
    status: string
  }
  lineItems: LineItem[]
}

interface ExitProcess {
  id: string
  userId: string
  type: string
  noticeDate: string
  lastWorkingDate: string | null
  status: string
  user: {
    id: string
    firstName: string
    lastName: string | null
    empId: string
    department: string
  }
}

interface CustomLineItem {
  type: string
  description: string
  amount: number
  isDeduction: boolean
}

interface Props {
  initialSettlements: Settlement[]
  exitProcesses: ExitProcess[]
  currentUserRole: string
  currentUserName: string
}

// ── Status config ──────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', step: 1 },
  HR_APPROVED: { label: 'HR Approved', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', step: 2 },
  FINANCE_APPROVED: { label: 'Finance Approved', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', step: 3 },
  LEADERSHIP_APPROVED: { label: 'Leadership OK', color: 'bg-green-500/20 text-green-300 border-green-500/30', step: 4 },
  PAID: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', step: 5 },
}

const lineTypeLabels: Record<string, string> = {
  SALARY_DUES: 'Salary Dues',
  LEAVE_ENCASHMENT: 'Leave Encashment',
  RBC_PAYOUT: 'RBC Payout',
  BONUS: 'Bonus',
  TDS: 'TDS',
  ADVANCE_RECOVERY: 'Advance Recovery',
  ASSET_DAMAGE: 'Asset Damage',
  OTHER: 'Other',
}

// ── Approval logic ─────────────────────────────────

function canApprove(status: string, role: string): boolean {
  const map: Record<string, string[]> = {
    DRAFT: ['HR', 'SUPER_ADMIN', 'MANAGER'],
    HR_APPROVED: ['ACCOUNTS', 'SUPER_ADMIN'],
    FINANCE_APPROVED: ['MANAGER', 'SUPER_ADMIN'],
    LEADERSHIP_APPROVED: ['ACCOUNTS', 'SUPER_ADMIN'],
  }
  return (map[status] || []).includes(role)
}

function approvalLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'Approve (HR)',
    HR_APPROVED: 'Approve (Finance)',
    FINANCE_APPROVED: 'Approve (Leadership)',
    LEADERSHIP_APPROVED: 'Mark as Paid',
  }
  return map[status] || 'Approve'
}

// ── Component ──────────────────────────────────────

export function FnFClient({ initialSettlements, exitProcesses, currentUserRole, currentUserName }: Props) {
  const [settlements, setSettlements] = useState<Settlement[]>(initialSettlements)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)
  const [loading, setLoading] = useState(false)

  // Create modal state
  const [selectedExitId, setSelectedExitId] = useState('')
  const [customItems, setCustomItems] = useState<CustomLineItem[]>([])
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [newItemType, setNewItemType] = useState('OTHER')
  const [newItemIsDeduction, setNewItemIsDeduction] = useState(false)

  // ── Filtering ──

  const filtered = settlements.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = `${s.user.firstName} ${s.user.lastName || ''}`.toLowerCase()
      const empId = s.user.empId.toLowerCase()
      if (!name.includes(q) && !empId.includes(q)) return false
    }
    return true
  })

  // ── Stats ──

  const pendingCount = settlements.filter((s) => s.status !== 'PAID').length
  const paidCount = settlements.filter((s) => s.status === 'PAID').length
  const totalPaid = settlements
    .filter((s) => s.status === 'PAID')
    .reduce((sum, s) => sum + s.netPayable, 0)

  // ── API calls ──

  async function refreshSettlements() {
    try {
      const res = await fetch('/api/hr/fnf')
      if (res.ok) {
        const data = await res.json()
        setSettlements(data)
      }
    } catch {
      // silent
    }
  }

  async function handleCreate() {
    if (!selectedExitId) {
      toast.error('Please select an exit process')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/hr/fnf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exitProcessId: selectedExitId,
          customLineItems: customItems.length > 0 ? customItems : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create settlement')
        return
      }
      toast.success('Settlement created as Draft')
      setShowCreateModal(false)
      resetCreateForm()
      await refreshSettlements()
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleApproval(id: string, action: 'approve' | 'reject') {
    setLoading(true)
    try {
      const res = await fetch(`/api/hr/fnf/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || `Failed to ${action}`)
        return
      }
      toast.success(action === 'approve' ? 'Approved successfully' : 'Rejected — reset to Draft')
      setSelectedSettlement(data)
      await refreshSettlements()
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  function resetCreateForm() {
    setSelectedExitId('')
    setCustomItems([])
    setNewItemDesc('')
    setNewItemAmount('')
    setNewItemType('OTHER')
    setNewItemIsDeduction(false)
  }

  function addCustomItem() {
    if (!newItemDesc.trim() || !newItemAmount) return
    setCustomItems((prev) => [
      ...prev,
      {
        type: newItemType,
        description: newItemDesc.trim(),
        amount: parseFloat(newItemAmount) || 0,
        isDeduction: newItemIsDeduction,
      },
    ])
    setNewItemDesc('')
    setNewItemAmount('')
    setNewItemType('OTHER')
    setNewItemIsDeduction(false)
  }

  function removeCustomItem(idx: number) {
    setCustomItems((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Helpers ──

  function computeTotals(items: LineItem[]) {
    const earnings = items.filter((li) => !li.isDeduction)
    const deductions = items.filter((li) => li.isDeduction)
    const totalEarnings = earnings.reduce((s, li) => s + li.amount, 0)
    const totalDeductions = deductions.reduce((s, li) => s + li.amount, 0)
    return { earnings, deductions, totalEarnings, totalDeductions, netPayable: totalEarnings - totalDeductions }
  }

  function formatDate(d: string | null) {
    if (!d) return 'N/A'
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // ── Render ──

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="fnf-settlement"
        title="F&F Settlement Guide"
        description="Full & Final settlement processing for exiting employees. Create settlements, manage line items, and follow the multi-stage approval workflow."
        steps={[
          { label: 'Create Settlement', description: 'Select an employee with an active exit process to auto-generate salary dues and leave encashment.' },
          { label: 'Review Line Items', description: 'Verify auto-calculated amounts and add custom earnings or deductions as needed.' },
          { label: 'Approval Workflow', description: 'Settlement passes through HR, Finance, and Leadership approval before being marked as Paid.' },
          { label: 'Track Status', description: 'Use filters to monitor settlements across all stages of the pipeline.' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              F&F Settlement
            </h1>
            <p className="text-slate-400 mt-1">Full & Final settlement processing</p>
          </div>
          <InfoTip text="Create settlements from exit processes. Earnings include salary dues and leave encashment. TDS is auto-deducted at 10%." />
        </div>
        {['SUPER_ADMIN', 'MANAGER', 'HR'].includes(currentUserRole) && (
          <button
            onClick={() => { resetCreateForm(); setShowCreateModal(true) }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition"
          >
            + Create Settlement
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{settlements.length}</p>
          <p className="text-sm text-slate-400">Total Settlements</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
          <p className="text-sm text-slate-400">Pending</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-emerald-400">{paidCount}</p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-purple-400">{formatMoney(totalPaid)}</p>
          <p className="text-sm text-slate-400">Total Paid</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([key, info]) => (
            <option key={key} value={key}>{info.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-64"
        />
        <span className="text-xs text-slate-500">{filtered.length} result(s)</span>
      </div>

      {/* Settlement Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-slate-400">No settlements found</p>
          </div>
        ) : (
          filtered.map((settlement) => {
            const config = statusConfig[settlement.status] || statusConfig.DRAFT
            const { earnings, deductions, totalEarnings, totalDeductions, netPayable } = computeTotals(settlement.lineItems)

            return (
              <div
                key={settlement.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition"
                onClick={() => setSelectedSettlement(settlement)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={{ id: settlement.user.id || settlement.id, firstName: settlement.user.firstName, lastName: settlement.user.lastName, empId: settlement.user.empId, department: settlement.user.department }} size="lg" showPreview={false} />
                      <div>
                        <h3 className="font-semibold text-white">{settlement.user.firstName} {settlement.user.lastName || ''}</h3>
                        <p className="text-xs text-slate-400">{settlement.user.empId} &middot; {settlement.user.department}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Approval Pipeline */}
                  <div className="flex items-center gap-1 mb-4">
                    {Object.entries(statusConfig).map(([key, info]) => (
                      <div key={key} className="flex-1">
                        <div className={`h-2 rounded-full ${info.step <= config.step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/10'}`} />
                        <p className="text-[10px] text-slate-500 mt-1 text-center">{info.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Summary Row */}
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Exit Type</p>
                      <p className="text-white">{settlement.exitProcess.type.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">LWD</p>
                      <p className="text-white">{formatDate(settlement.exitProcess.lastWorkingDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Earnings</p>
                      <p className="text-emerald-400 font-medium">{formatMoney(totalEarnings)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Net Payable</p>
                      <p className="text-white font-bold">{formatMoney(netPayable)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ──────────── Detail Modal ──────────── */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSettlement(null)}>
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar user={{ id: selectedSettlement.user.id || selectedSettlement.id, firstName: selectedSettlement.user.firstName, lastName: selectedSettlement.user.lastName, empId: selectedSettlement.user.empId, department: selectedSettlement.user.department }} size="md" showPreview={false} />
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedSettlement.user.firstName} {selectedSettlement.user.lastName || ''}</h2>
                    <p className="text-xs text-slate-400">{selectedSettlement.user.empId} &middot; {selectedSettlement.user.department}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSettlement(null)} className="text-slate-400 hover:text-white text-xl">&times;</button>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${(statusConfig[selectedSettlement.status] || statusConfig.DRAFT).color}`}>
                  {(statusConfig[selectedSettlement.status] || statusConfig.DRAFT).label}
                </span>
                <span className="text-xs text-slate-500">Created {formatDate(selectedSettlement.createdAt)}</span>
              </div>

              {/* Line Items Table */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Line Items</h3>
                <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 text-xs">
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Description</th>
                        <th className="text-right p-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSettlement.lineItems.map((li) => (
                        <tr key={li.id} className="border-b border-white/5">
                          <td className="p-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${li.isDeduction ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {lineTypeLabels[li.type] || li.type}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">{li.description}</td>
                          <td className={`p-3 text-right font-medium ${li.isDeduction ? 'text-red-400' : 'text-emerald-400'}`}>
                            {li.isDeduction ? '-' : '+'}{formatMoney(li.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              {(() => {
                const { totalEarnings, totalDeductions, netPayable } = computeTotals(selectedSettlement.lineItems)
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400">Total Earnings</p>
                      <p className="text-lg font-bold text-emerald-400">{formatMoney(totalEarnings)}</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400">Total Deductions</p>
                      <p className="text-lg font-bold text-red-400">{formatMoney(totalDeductions)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400">Net Payable</p>
                      <p className="text-lg font-bold text-white">{formatMoney(netPayable)}</p>
                    </div>
                  </div>
                )
              })()}

              {/* Approval History */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Approval History</h3>
                <div className="space-y-2">
                  {[
                    { label: 'HR Approval', value: selectedSettlement.approvedByHR },
                    { label: 'Finance Approval', value: selectedSettlement.approvedByFinance },
                    { label: 'Leadership Approval', value: selectedSettlement.approvedByLeadership },
                    { label: 'Payment', value: selectedSettlement.paidAt ? `Paid on ${formatDate(selectedSettlement.paidAt)}` : null },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg text-sm">
                      <span className="text-slate-400">{item.label}</span>
                      {item.value ? (
                        <span className="text-emerald-400 text-xs">{item.value}</span>
                      ) : (
                        <span className="text-slate-600 text-xs">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval / Reject Actions */}
              {selectedSettlement.status !== 'PAID' && canApprove(selectedSettlement.status, currentUserRole) && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={loading}
                    onClick={() => handleApproval(selectedSettlement.id, 'approve')}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : approvalLabel(selectedSettlement.status)}
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleApproval(selectedSettlement.id, 'reject')}
                    className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────── Create Modal ──────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Create F&F Settlement</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xl">&times;</button>
              </div>

              {/* Exit Process Selection */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Select Exit Process <InfoTip text="Only exit processes without an existing settlement are shown." />
                </label>
                {exitProcesses.length === 0 ? (
                  <p className="text-sm text-slate-500">No eligible exit processes found.</p>
                ) : (
                  <select
                    value={selectedExitId}
                    onChange={(e) => setSelectedExitId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="">-- Choose employee --</option>
                    {exitProcesses.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        {ep.user.firstName} {ep.user.lastName || ''} ({ep.user.empId}) - {ep.type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
                Salary dues, leave encashment (PL), and TDS (10%) will be auto-calculated when you save.
              </div>

              {/* Custom Line Items */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Add Custom Line Items <InfoTip text="Add additional earnings or deductions such as bonuses, advance recovery, asset damage, etc." />
                </label>

                {customItems.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {customItems.map((item, idx) => (
                      <div key={`custom-${item.description}-${idx}`} className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.isDeduction ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {item.isDeduction ? 'Deduction' : 'Earning'}
                          </span>
                          <span className="text-slate-300">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={item.isDeduction ? 'text-red-400' : 'text-emerald-400'}>
                            {item.isDeduction ? '-' : '+'}{formatMoney(item.amount)}
                          </span>
                          <button onClick={() => removeCustomItem(idx)} className="text-slate-500 hover:text-red-400 text-xs">
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-12 gap-2">
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    className="col-span-3 px-2 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="BONUS">Bonus</option>
                    <option value="RBC_PAYOUT">RBC Payout</option>
                    <option value="ADVANCE_RECOVERY">Advance Recovery</option>
                    <option value="ASSET_DAMAGE">Asset Damage</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="col-span-4 px-2 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="col-span-2 px-2 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <label className="col-span-2 flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemIsDeduction}
                      onChange={(e) => setNewItemIsDeduction(e.target.checked)}
                      className="rounded border-white/20 bg-slate-800"
                    />
                    Deduction
                  </label>
                  <button
                    onClick={addCustomItem}
                    className="col-span-1 px-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={loading || !selectedExitId}
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Save as Draft'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
