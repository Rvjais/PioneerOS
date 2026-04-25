'use client'

import { useState, useMemo } from 'react'

interface Column {
  key: string
  label: string
  type: string
  sortable?: boolean
}

interface Row {
  id: string
  [key: string]: string | number | boolean | null
}

interface Props {
  columns: Column[]
  rows: Row[]
  pageSize?: number
}

export default function DataTable({ columns, rows, pageSize = 10 }: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setCurrentPage(1)
  }

  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows]

    // Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((row) =>
        Object.values(row).some(
          (val) => val !== null && String(val).toLowerCase().includes(term)
        )
      )
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]

        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }

        const aStr = String(aVal)
        const bStr = String(bVal)
        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
      })
    }

    return result
  }, [rows, searchTerm, sortKey, sortDir])

  const totalPages = Math.ceil(filteredAndSortedRows.length / pageSize)
  const paginatedRows = filteredAndSortedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const formatValue = (value: string | number | boolean | null, type: string) => {
    if (value === null || value === undefined) return '-'

    switch (type) {
      case 'date':
        return new Date(String(value)).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(Number(value))
      case 'percentage':
        return `${Number(value).toFixed(2)}%`
      case 'number':
        return Number(value).toLocaleString()
      case 'duration':
        const secs = Number(value)
        const mins = Math.floor(secs / 60)
        const remSecs = Math.round(secs % 60)
        return `${mins}m ${remSecs}s`
      default:
        return String(value)
    }
  }

  if (rows.length === 0) {
    return (
      <div className="glass-card border border-white/10 rounded-xl p-8 text-center">
        <p className="text-slate-400 text-sm">No data available for the selected filters.</p>
        <p className="text-slate-500 text-xs mt-2">Try adjusting your date range or search criteria.</p>
      </div>
    )
  }

  return (
    <div className="glass-card border border-white/10 rounded-xl overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search..."
          className="w-full max-w-xs px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-sm font-medium text-slate-400 ${
                    col.sortable !== false ? 'cursor-pointer hover:text-white' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortKey !== col.key && (
                      <svg className="w-3 h-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    )}
                    {sortKey === col.key && (
                      <svg
                        className={`w-4 h-4 ${sortDir === 'asc' ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedRows.map((row) => (
              <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-white">
                    {formatValue(row[col.key], col.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <p className="text-sm text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredAndSortedRows.length)} of{' '}
            {filteredAndSortedRows.length}
          </p>

          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white rounded text-sm transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i
                if (pageNum > totalPages) pageNum = totalPages - (4 - i)
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600/80 text-white border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white rounded text-sm transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
