'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

interface AuditLog {
  id: string
  credentialId: string
  action: string
  userId: string
  userIp: string | null
  success: boolean
  errorMessage: string | null
  createdAt: string
  provider?: string
}

const actionColors: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: 'bg-green-500/20', text: 'text-green-400' },
  UPDATE: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  DELETE: { bg: 'bg-red-500/20', text: 'text-red-400' },
  ROTATE: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  VERIFY: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  VIEW: { bg: 'bg-slate-800/50', text: 'text-slate-200' },
}

export function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [limit] = useState(25)

  useEffect(() => {
    fetchLogs()
  }, [page])

  async function fetchLogs() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(page * limit),
      })

      const response = await fetch(`/api/admin/api-credentials/audit-log?${params}`)
      if (!response.ok) throw new Error('Failed to fetch audit log')
      const data = await response.json()
      setLogs(data.logs)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading && logs.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-400">Loading audit log...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">Audit Log</h2>
        <p className="text-sm text-slate-400">
          Track all credential access and changes ({total} total entries)
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Provider</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Action</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">User</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No audit log entries found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-3 px-4 text-sm text-slate-200">
                    <div>
                      <p>{formatDateDDMMYYYY(log.createdAt)}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-200">
                    {log.provider || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColors[log.action]?.bg || 'bg-slate-800/50'} ${actionColors[log.action]?.text || 'text-slate-200'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-200">
                    <div>
                      <p>{log.userId}</p>
                      {log.userIp && (
                        <p className="text-xs text-slate-400">{log.userIp}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400 max-w-xs truncate">
                    {log.errorMessage || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-400">
            Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800/50 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i
                if (pageNum >= totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 text-sm rounded ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800/50 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
