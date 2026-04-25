'use client'

import { useState } from 'react'
import CSVImporter from './CSVImporter'
import ManualEntryForm from './ManualEntryForm'
import { Account, ImportBatch } from './types'

type ImportMethod = 'csv' | 'excel' | 'manual' | 'paste'

interface Props {
  clientId: string
  accounts: Account[]
  selectedAccount: Account | null
  onClose: () => void
  onImportCompleted: (batch: ImportBatch) => void
}

const IMPORT_METHODS = [
  { key: 'csv', name: 'CSV Upload', icon: 'File', description: 'Upload a CSV file' },
  { key: 'excel', name: 'Excel Upload', icon: 'Table', description: 'Upload an Excel file' },
  { key: 'paste', name: 'Paste Data', icon: 'Clipboard', description: 'Paste from spreadsheet' },
  { key: 'manual', name: 'Manual Entry', icon: 'Edit', description: 'Enter data manually' },
] as const

export default function ImportDataModal({
  clientId,
  accounts,
  selectedAccount,
  onClose,
  onImportCompleted,
}: Props) {
  const [method, setMethod] = useState<ImportMethod | null>(null)
  const [account, setAccount] = useState<Account | null>(selectedAccount)

  // If no accounts, show message
  if (accounts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No Accounts Available</h2>
            <p className="text-slate-400 text-sm mb-6">
              Please add a platform account first before importing data.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Method selection view
  if (!method) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-lg font-semibold text-white">Import Data</h2>
              <p className="text-slate-400 text-sm">Choose an import method</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Account Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Account
              </label>
              <select
                value={account?.id || ''}
                onChange={(e) => {
                  const acc = accounts.find((a) => a.id === e.target.value)
                  setAccount(acc || null)
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" className="bg-slate-800 text-white">Select an account...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-800 text-white">
                    {acc.accountName} ({acc.platform.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-2 gap-3">
              {IMPORT_METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => account && setMethod(m.key as ImportMethod)}
                  disabled={!account}
                  className={`p-4 border rounded-xl text-left transition-colors ${
                    account
                      ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                      : 'border-white/10 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center mb-3">
                    {m.key === 'csv' && (
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {m.key === 'excel' && (
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    {m.key === 'paste' && (
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    {m.key === 'manual' && (
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </div>
                  <p className="font-medium text-white">{m.name}</p>
                  <p className="text-slate-400 text-sm">{m.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Import method views
  const handleBack = () => setMethod(null)
  const handleComplete = (batch: ImportBatch) => {
    onImportCompleted(batch)
    onClose()
  }

  if (method === 'csv' || method === 'paste') {
    return (
      <CSVImporter
        clientId={clientId}
        account={account!}
        isPaste={method === 'paste'}
        onBack={handleBack}
        onClose={onClose}
        onComplete={handleComplete}
      />
    )
  }

  if (method === 'manual') {
    return (
      <ManualEntryForm
        clientId={clientId}
        account={account!}
        onBack={handleBack}
        onClose={onClose}
        onComplete={handleComplete}
      />
    )
  }

  // Excel - similar to CSV but with file upload
  return (
    <CSVImporter
      clientId={clientId}
      account={account!}
      isPaste={false}
      isExcel={true}
      onBack={handleBack}
      onClose={onClose}
      onComplete={handleComplete}
    />
  )
}
