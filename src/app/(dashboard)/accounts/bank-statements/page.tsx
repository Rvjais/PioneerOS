'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import { HelpContent } from '@/shared/constants/helpContent'
import InfoTip from '@/client/components/ui/InfoTip'

interface BankStatement {
  id: string
  entityId: string
  bankName: string
  accountType: string
  accountNumber: string | null
  statementMonth: string
  fileName: string
  fileUrl: string | null
  status: string
  openingBalance: number | null
  closingBalance: number | null
  totalCredits: number | null
  totalDebits: number | null
  matchedCount: number
  unmatchedCount: number
  transactionCount: number
  processedAt: string | null
  createdAt: string
}

interface Summary {
  total: number
  processed: number
  pending: number
  failed: number
  totalCredits: number
  totalDebits: number
}

interface Entity {
  id: string
  code: string
  name: string
}

const BANKS = ['HDFC', 'AXIS', 'KOTAK', 'ICICI', 'SBI', 'YES', 'INDUSIND']
const ACCOUNT_TYPES = ['CURRENT', 'SAVINGS', 'CREDIT_CARD']
const STATUSES = ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED']

export default function BankStatementsPage() {
  const [statements, setStatements] = useState<BankStatement[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processStatementId, setProcessStatementId] = useState<string | null>(null)
  const [statementText, setStatementText] = useState('')
  const [processResult, setProcessResult] = useState<{ summary?: { totalTransactions?: number; autoMatched?: number; unmatched?: number; totalCredits?: number; totalDebits?: number } } | null>(null)

  // Filters
  const [entityFilter, setEntityFilter] = useState('')
  const [bankFilter, setBankFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    entityId: '',
    bankName: '',
    accountType: 'CURRENT',
    accountNumber: '',
    statementMonth: new Date().toISOString().slice(0, 7),
    fileName: '',
    fileUrl: '',
    openingBalance: '',
    closingBalance: ''
  })

  useEffect(() => {
    fetchStatements()
    fetchEntities()
  }, [entityFilter, bankFilter, monthFilter, statusFilter])

  const fetchStatements = async () => {
    try {
      const params = new URLSearchParams()
      if (entityFilter) params.append('entityId', entityFilter)
      if (bankFilter) params.append('bankName', bankFilter)
      if (monthFilter) params.append('month', monthFilter)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/accounts/bank-statements?${params}`)
      if (res.ok) {
        const data = await res.json()
        setStatements(data.statements || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Failed to fetch statements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEntities = async () => {
    try {
      const res = await fetch('/api/admin/entities')
      if (res.ok) {
        const data = await res.json()
        setEntities(data.entities || [])
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error)
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.entityId || !uploadForm.bankName || !uploadForm.fileName) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const res = await fetch('/api/accounts/bank-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadForm,
          openingBalance: uploadForm.openingBalance ? parseFloat(uploadForm.openingBalance) : null,
          closingBalance: uploadForm.closingBalance ? parseFloat(uploadForm.closingBalance) : null
        })
      })

      if (res.ok) {
        setShowUploadModal(false)
        setUploadForm({
          entityId: '',
          bankName: '',
          accountType: 'CURRENT',
          accountNumber: '',
          statementMonth: new Date().toISOString().slice(0, 7),
          fileName: '',
          fileUrl: '',
          openingBalance: '',
          closingBalance: ''
        })
        fetchStatements()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to upload statement')
      }
    } catch (error) {
      console.error('Failed to upload:', error)
      toast.error('Failed to upload statement')
    }
  }

  const openProcessModal = (id: string) => {
    setProcessStatementId(id)
    setStatementText('')
    setProcessResult(null)
    setShowProcessModal(true)
  }

  const handleProcess = async () => {
    if (!processStatementId || !statementText.trim()) {
      toast.error('Please paste your bank statement transaction data')
      return
    }

    setProcessingId(processStatementId)
    try {
      const res = await fetch(`/api/accounts/bank-statements/${processStatementId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statementText })
      })

      const data = await res.json()

      if (res.ok) {
        setProcessResult(data)
        fetchStatements()
      } else {
        toast.error(data.error || 'Failed to process statement')
      }
    } catch (error) {
      console.error('Failed to process:', error)
      toast.error('Failed to process statement')
    } finally {
      setProcessingId(null)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-'
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount.toFixed(0)}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      UPLOADED: 'bg-amber-500/20 text-amber-800 border-amber-300',
      PROCESSING: 'bg-blue-500/20 text-blue-800 border-blue-300',
      PROCESSED: 'bg-green-500/20 text-green-800 border-green-300',
      FAILED: 'bg-red-500/20 text-red-800 border-red-300'
    }
    return styles[status] || 'bg-slate-800/50 text-white'
  }

  const getEntityName = (entityId: string) => {
    const entity = entities.find(e => e.id === entityId || e.code === entityId)
    return entity?.code || entityId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Bank Statements</h1>
            <InfoTooltip
              title={HelpContent.accounts.bankStatements.title}
              steps={HelpContent.accounts.bankStatements.steps}
              tips={HelpContent.accounts.bankStatements.tips}
            />
          </div>
          <p className="text-slate-400 text-sm mt-1">Upload and process bank statements for reconciliation</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/accounts"
            className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-900/40 text-sm"
          >
            Dashboard
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Statement
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-slate-400 text-sm">Total Statements</p>
            <p className="text-2xl font-bold text-white mt-1">{summary.total}</p>
          </div>
          <div className="glass-card rounded-xl border border-green-200 p-4">
            <p className="text-green-400 text-sm">Processed</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{summary.processed}</p>
          </div>
          <div className="glass-card rounded-xl border border-amber-200 p-4">
            <p className="text-amber-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{summary.pending}</p>
          </div>
          <div className="glass-card rounded-xl border border-red-200 p-4">
            <p className="text-red-400 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{summary.failed}</p>
          </div>
          <div className="glass-card rounded-xl border border-emerald-200 p-4">
            <p className="text-emerald-600 text-sm">Total Credits</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(summary.totalCredits)}</p>
          </div>
          <div className="glass-card rounded-xl border border-purple-200 p-4">
            <p className="text-purple-400 text-sm">Total Debits</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(summary.totalDebits)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Entity</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="">All Entities</option>
              {entities.map(e => (
                <option key={e.id} value={e.id}>{e.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Bank</label>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="">All Banks</option>
              {BANKS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Month</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statements Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Month</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Bank</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Account</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Credits</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Debits</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Transactions</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {statements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="text-slate-400">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No bank statements found</p>
                      <p className="text-sm mt-1">Upload a statement to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                statements.map((stmt) => (
                  <tr key={stmt.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{formatDate(stmt.statementMonth)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">{getEntityName(stmt.entityId)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-slate-800/50 text-slate-200 rounded">
                        {stmt.bankName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">
                        {stmt.accountType} {stmt.accountNumber && `(...${stmt.accountNumber})`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-green-400">{formatCurrency(stmt.totalCredits)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-red-400">{formatCurrency(stmt.totalDebits)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-slate-300">
                        {stmt.transactionCount}
                        {stmt.status === 'PROCESSED' && (
                          <span className="text-xs text-slate-400 ml-1">
                            ({stmt.matchedCount} matched)
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(stmt.status)}`}>
                        {stmt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {stmt.status === 'UPLOADED' && (
                          <button
                            onClick={() => openProcessModal(stmt.id)}
                            disabled={processingId === stmt.id}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {processingId === stmt.id ? 'Processing...' : 'Process'}
                          </button>
                        )}
                        {stmt.status === 'PROCESSED' && (
                          <Link
                            href={`/accounts/bank-statements/${stmt.id}`}
                            className="px-3 py-1 text-xs bg-slate-800/50 text-slate-200 rounded hover:bg-white/10"
                          >
                            View Transactions
                          </Link>
                        )}
                        {stmt.status === 'FAILED' && (
                          <button
                            onClick={() => openProcessModal(stmt.id)}
                            disabled={processingId === stmt.id}
                            className="px-3 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Upload Bank Statement</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Entity * <InfoTip text="Which company bank account this statement is for." /></label>
                  <select
                    value={uploadForm.entityId}
                    onChange={(e) => setUploadForm({ ...uploadForm, entityId: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  >
                    <option value="">Select Entity</option>
                    {entities.map(e => (
                      <option key={e.id} value={e.id}>{e.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Bank *</label>
                  <select
                    value={uploadForm.bankName}
                    onChange={(e) => setUploadForm({ ...uploadForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  >
                    <option value="">Select Bank</option>
                    {BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Account Type</label>
                  <select
                    value={uploadForm.accountType}
                    onChange={(e) => setUploadForm({ ...uploadForm, accountType: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  >
                    {ACCOUNT_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Account Number (Last 4)</label>
                  <input
                    type="text"
                    value={uploadForm.accountNumber}
                    onChange={(e) => setUploadForm({ ...uploadForm, accountNumber: e.target.value })}
                    maxLength={4}
                    placeholder="e.g., 1234"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Statement Month * <InfoTip text="Which month this statement covers." /></label>
                <input
                  type="month"
                  value={uploadForm.statementMonth}
                  onChange={(e) => setUploadForm({ ...uploadForm, statementMonth: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">File Name *</label>
                <input
                  type="text"
                  value={uploadForm.fileName}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                  placeholder="e.g., HDFC_Mar2024.pdf"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">File URL (optional)</label>
                <input
                  type="url"
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Opening Balance</label>
                  <input
                    type="number"
                    value={uploadForm.openingBalance}
                    onChange={(e) => setUploadForm({ ...uploadForm, openingBalance: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Closing Balance</label>
                  <input
                    type="number"
                    value={uploadForm.closingBalance}
                    onChange={(e) => setUploadForm({ ...uploadForm, closingBalance: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Upload Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Modal - Paste Transaction Data */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">Process Bank Statement</h2>
                <InfoTooltip
                  title={HelpContent.accounts.bankStatements.title}
                  steps={HelpContent.accounts.bankStatements.steps}
                  tips={HelpContent.accounts.bankStatements.tips}
                  position="center"
                />
              </div>
              <button
                onClick={() => setShowProcessModal(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!processResult ? (
              <>
                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    How to use this
                  </h3>
                  <ol className="text-sm text-blue-400 space-y-1 list-decimal list-inside">
                    <li>Open your bank statement PDF or online banking</li>
                    <li>Select the transaction table (date, description, amount columns)</li>
                    <li>Copy it (Ctrl+C or Cmd+C)</li>
                    <li>Paste it in the box below (Ctrl+V or Cmd+V)</li>
                    <li>Click "Process Transactions"</li>
                  </ol>
                </div>

                {/* Text Area */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Paste your transaction data here: <InfoTip text="Copy-paste transaction data from your bank portal, or upload the statement PDF." type="action" />
                  </label>
                  <textarea
                    value={statementText}
                    onChange={(e) => setStatementText(e.target.value)}
                    placeholder={`Example format:\n15-Jan-2024    NEFT CR-ACME CORP UTR12345    50000.00    250000.00\n16-Jan-2024    IMPS DR-VENDOR PAYMENT        15000.00    235000.00\n...\n\nJust copy from your bank statement and paste here!`}
                    className="w-full h-64 px-3 py-2 border border-white/10 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Works with any bank format - HDFC, ICICI, SBI, Axis, Kotak, etc.
                  </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowProcessModal(false)}
                    className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcess}
                    disabled={processingId !== null || !statementText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {processingId ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Process Transactions
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Results View */
              <div>
                <div className="bg-green-500/10 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    Processing Complete!
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-400">Total Transactions</p>
                      <p className="text-2xl font-bold text-green-800">{processResult.summary?.totalTransactions || 0}</p>
                    </div>
                    <div>
                      <p className="text-green-400">Auto-Matched</p>
                      <p className="text-2xl font-bold text-green-800">{processResult.summary?.autoMatched || 0}</p>
                    </div>
                    <div>
                      <p className="text-amber-400">Needs Review</p>
                      <p className="text-2xl font-bold text-amber-400">{processResult.summary?.unmatched || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-900/40 rounded-lg p-3">
                    <p className="text-sm text-slate-300">Total Credits</p>
                    <p className="text-lg font-bold text-green-400">
                      ₹{(processResult.summary?.totalCredits || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3">
                    <p className="text-sm text-slate-300">Total Debits</p>
                    <p className="text-lg font-bold text-red-400">
                      ₹{(processResult.summary?.totalDebits || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowProcessModal(false)}
                    className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 text-sm"
                  >
                    Close
                  </button>
                  <Link
                    href={`/accounts/bank-statements/${processStatementId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View Transactions →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
