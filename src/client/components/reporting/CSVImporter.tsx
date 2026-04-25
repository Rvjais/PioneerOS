'use client'

import { useState, useRef } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { Account, ImportBatch } from './types'

interface PreviewRow {
  rowNumber: number
  date: Date
  metrics: Array<{ metricType: string; value: number }>
  errors: string[]
}

interface PreviewData {
  headers: string[]
  preview: PreviewRow[]
  totalRows: number
  validRows: number
}

interface Props {
  clientId: string
  account: Account
  isPaste?: boolean
  isExcel?: boolean
  onBack: () => void
  onClose: () => void
  onComplete: (batch: ImportBatch) => void
}

export default function CSVImporter({
  clientId,
  account,
  isPaste = false,
  isExcel = false,
  onBack,
  onClose,
  onComplete,
}: Props) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [result, setResult] = useState<ImportBatch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const title = isPaste ? 'Paste Data' : isExcel ? 'Excel Import' : 'CSV Import'

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)

    if (!isExcel) {
      // Read CSV content
      const reader = new FileReader()
      reader.onload = (event) => {
        setContent(event.target?.result as string)
      }
      reader.readAsText(selectedFile)
    }
  }

  const handlePreview = async () => {
    if ((!content && !isExcel) || (isExcel && !file)) {
      setError('Please provide data to import')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let res: Response

      if (isExcel && file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('accountId', account.id)

        res = await fetch(`/api/clients/${clientId}/import/excel?preview=true`, {
          method: 'POST',
          body: formData,
        })
      } else {
        const endpoint = isPaste ? 'paste' : 'csv'
        res = await fetch(`/api/clients/${clientId}/import/${endpoint}?preview=true`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: account.id,
            content,
            fileName: file?.name,
          }),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to preview data')
      }

      setPreview(data)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    setStep('importing')
    setError(null)

    try {
      let res: Response

      if (isExcel && file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('accountId', account.id)

        res = await fetch(`/api/clients/${clientId}/import/excel`, {
          method: 'POST',
          body: formData,
        })
      } else {
        const endpoint = isPaste ? 'paste' : 'csv'
        res = await fetch(`/api/clients/${clientId}/import/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: account.id,
            content,
            fileName: file?.name,
          }),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import data')
      }

      setResult({
        id: data.batchId,
        platform: account.platform,
        importType: isExcel ? 'EXCEL' : isPaste ? 'PASTE' : 'CSV',
        status: data.failedRows === data.totalRows ? 'FAILED' : 'COMPLETED',
        totalRows: data.totalRows,
        successRows: data.successRows,
        failedRows: data.failedRows,
        createdAt: new Date().toISOString(),
        errorLog: data.errors,
      })
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data')
      setStep('preview')
    }
  }

  const handleDone = () => {
    if (result) {
      onComplete(result)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-slate-400 text-sm">{account.accountName}</p>
            </div>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              {isPaste ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Paste Data
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your data here (tab or comma separated)..."
                    className="w-full h-64 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    First row should be headers. Supports tab-separated (Excel) or comma-separated (CSV) data.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Upload {isExcel ? 'Excel' : 'CSV'} File
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-slate-600 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={isExcel ? '.xlsx,.xls' : '.csv'}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    {file ? (
                      <p className="text-white font-medium">{file.name}</p>
                    ) : (
                      <>
                        <p className="text-white">Click to upload or drag and drop</p>
                        <p className="text-slate-400 text-sm mt-1">
                          {isExcel ? '.xlsx, .xls files' : '.csv files'}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <a
                      href={`/api/clients/${clientId}/import/templates/${account.platform}?format=${isExcel ? 'excel' : 'csv'}`}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download template
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Preview</p>
                  <p className="text-slate-400 text-sm">
                    {preview.validRows} of {preview.totalRows} rows valid
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                    {preview.validRows} valid
                  </span>
                  {preview.totalRows - preview.validRows > 0 && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                      {preview.totalRows - preview.validRows} errors
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-3 py-2 text-left text-slate-400 font-medium">Row</th>
                        <th className="px-3 py-2 text-left text-slate-400 font-medium">Date</th>
                        <th className="px-3 py-2 text-left text-slate-400 font-medium">Metrics</th>
                        <th className="px-3 py-2 text-left text-slate-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {preview.preview.map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="px-3 py-2 text-slate-300">{row.rowNumber}</td>
                          <td className="px-3 py-2 text-white">
                            {formatDateDDMMYYYY(row.date)}
                          </td>
                          <td className="px-3 py-2 text-slate-300">
                            {row.metrics.map((m) => `${m.metricType}: ${m.value}`).join(', ')}
                          </td>
                          <td className="px-3 py-2">
                            {row.errors.length > 0 ? (
                              <span className="text-red-400" title={row.errors.join(', ')}>
                                {row.errors.length} error(s)
                              </span>
                            ) : (
                              <span className="text-emerald-400">Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {preview.totalRows > 5 && (
                <p className="text-slate-400 text-sm">
                  Showing first 5 rows of {preview.totalRows}
                </p>
              )}
            </div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Importing data...</p>
              <p className="text-slate-400 text-sm">This may take a moment</p>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && result && (
            <div className="text-center py-8">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  result.status === 'COMPLETED'
                    ? 'bg-emerald-500/20'
                    : 'bg-amber-500/20'
                }`}
              >
                {result.status === 'COMPLETED' ? (
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {result.status === 'COMPLETED' ? 'Import Complete!' : 'Import Completed with Errors'}
              </h3>

              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{result.successRows}</p>
                  <p className="text-slate-400 text-sm">Imported</p>
                </div>
                {result.failedRows > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{result.failedRows}</p>
                    <p className="text-slate-400 text-sm">Failed</p>
                  </div>
                )}
              </div>

              {result.errorLog && result.errorLog.length > 0 && (
                <div className="mt-4 text-left max-h-32 overflow-y-auto bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-400 text-sm mb-2">Errors:</p>
                  {result.errorLog.slice(0, 5).map((err, i) => (
                    <p key={`err-${err.row}`} className="text-red-400 text-xs">
                      Row {err.row}: {err.message}
                    </p>
                  ))}
                  {result.errorLog.length > 5 && (
                    <p className="text-slate-400 text-xs mt-1">
                      +{result.errorLog.length - 5} more errors
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          {step === 'upload' && (
            <>
              <button
                onClick={onBack}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePreview}
                disabled={isLoading || (!content && !file)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isLoading ? 'Loading...' : 'Preview'}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('upload')}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={!preview || preview.validRows === 0}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Import {preview?.validRows} Rows
              </button>
            </>
          )}

          {step === 'complete' && (
            <button
              onClick={handleDone}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
