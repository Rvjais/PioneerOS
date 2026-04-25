'use client'

import { useState } from 'react'
import { ImportBatch } from './types'

interface Props {
  batches: ImportBatch[]
  clientId: string
  onBatchDeleted: (batchId: string) => void
}

export default function ImportHistory({ batches, clientId, onBatchDeleted }: Props) {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [deletingBatch, setDeletingBatch] = useState<string | null>(null)

  const handleDelete = async (batchId: string) => {
    if (!confirm('Delete this import batch and all its data?')) return

    setDeletingBatch(batchId)
    try {
      const res = await fetch(
        `/api/clients/${clientId}/import/batches?batchId=${batchId}`,
        { method: 'DELETE' }
      )

      if (res.ok) {
        onBatchDeleted(batchId)
      }
    } catch (error) {
      console.error('Failed to delete batch:', error)
    } finally {
      setDeletingBatch(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'FAILED':
        return 'bg-red-500/20 text-red-400'
      case 'PROCESSING':
        return 'bg-blue-500/20 text-blue-400'
      default:
        return 'bg-slate-900/20 text-slate-400'
    }
  }

  const getImportTypeLabel = (type: string) => {
    switch (type) {
      case 'CSV':
        return 'CSV Upload'
      case 'EXCEL':
        return 'Excel Upload'
      case 'PASTE':
        return 'Pasted Data'
      case 'MANUAL':
        return 'Manual Entry'
      default:
        return type
    }
  }

  if (batches.length === 0) {
    return null
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Imports</h2>

      <div className="space-y-3">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="border border-slate-700 rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
              onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {batch.platform.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {getImportTypeLabel(batch.importType)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{formatDate(batch.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                  <p className="text-slate-400 text-sm mt-1">
                    {batch.successRows}/{batch.totalRows} rows
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    expandedBatch === batch.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedBatch === batch.id && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-700/50">
                <div className="grid grid-cols-3 gap-4 py-3">
                  <div>
                    <p className="text-slate-400 text-xs">Total Rows</p>
                    <p className="text-white font-medium">{batch.totalRows}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Success</p>
                    <p className="text-emerald-400 font-medium">{batch.successRows}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Failed</p>
                    <p className="text-red-400 font-medium">{batch.failedRows}</p>
                  </div>
                </div>

                {batch.errorLog && batch.errorLog.length > 0 && (
                  <div className="mt-2 bg-slate-900/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-2">Errors:</p>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {batch.errorLog.slice(0, 10).map((err, i) => (
                        <p key={`err-${err.row}`} className="text-red-400 text-xs">
                          Row {err.row}: {err.message}
                        </p>
                      ))}
                      {batch.errorLog.length > 10 && (
                        <p className="text-slate-400 text-xs">
                          +{batch.errorLog.length - 10} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(batch.id)
                    }}
                    disabled={deletingBatch === batch.id}
                    className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {deletingBatch === batch.id ? 'Deleting...' : 'Delete Import'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
