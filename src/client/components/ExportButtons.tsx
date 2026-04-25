'use client'

import { useState } from 'react'

interface ExportButtonsProps {
  onExportPDF?: () => void
  onExportCSV?: () => void
  onExportExcel?: () => void
  loading?: boolean
  size?: 'sm' | 'md'
}

export function ExportButtons({
  onExportPDF,
  onExportCSV,
  onExportExcel,
  loading = false,
  size = 'md',
}: ExportButtonsProps) {
  const [exportingType, setExportingType] = useState<string | null>(null)

  const handleExport = async (type: 'pdf' | 'csv' | 'excel', handler?: () => void) => {
    if (!handler) return
    setExportingType(type)
    try {
      await handler()
    } finally {
      setExportingType(null)
    }
  }

  const baseClasses = size === 'sm'
    ? 'px-2 py-1 text-xs font-medium rounded flex items-center gap-1'
    : 'px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5'

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div className="flex items-center gap-2">
      {onExportPDF && (
        <button
          onClick={() => handleExport('pdf', onExportPDF)}
          disabled={loading || exportingType !== null}
          className={`${baseClasses} bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
        >
          {exportingType === 'pdf' ? (
            <LoadingSpinner className={iconSize} />
          ) : (
            <PDFIcon className={iconSize} />
          )}
          PDF
        </button>
      )}

      {onExportCSV && (
        <button
          onClick={() => handleExport('csv', onExportCSV)}
          disabled={loading || exportingType !== null}
          className={`${baseClasses} bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50`}
        >
          {exportingType === 'csv' ? (
            <LoadingSpinner className={iconSize} />
          ) : (
            <CSVIcon className={iconSize} />
          )}
          CSV
        </button>
      )}

      {onExportExcel && (
        <button
          onClick={() => handleExport('excel', onExportExcel)}
          disabled={loading || exportingType !== null}
          className={`${baseClasses} bg-green-600 text-white hover:bg-green-700 disabled:opacity-50`}
        >
          {exportingType === 'excel' ? (
            <LoadingSpinner className={iconSize} />
          ) : (
            <ExcelIcon className={iconSize} />
          )}
          Excel
        </button>
      )}
    </div>
  )
}

function PDFIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

function CSVIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ExcelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// Standalone export button for simple use cases
interface SingleExportButtonProps {
  type: 'pdf' | 'csv' | 'excel'
  onClick: () => void
  loading?: boolean
  size?: 'sm' | 'md'
  label?: string
}

export function SingleExportButton({
  type,
  onClick,
  loading = false,
  size = 'md',
  label,
}: SingleExportButtonProps) {
  const baseClasses = size === 'sm'
    ? 'px-2 py-1 text-xs font-medium rounded flex items-center gap-1'
    : 'px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5'

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  const colorClasses = {
    pdf: 'bg-red-600 text-white hover:bg-red-700',
    csv: 'bg-emerald-600 text-white hover:bg-emerald-700',
    excel: 'bg-green-600 text-white hover:bg-green-700',
  }

  const icons = {
    pdf: <PDFIcon className={iconSize} />,
    csv: <CSVIcon className={iconSize} />,
    excel: <ExcelIcon className={iconSize} />,
  }

  const labels = {
    pdf: 'Export PDF',
    csv: 'Export CSV',
    excel: 'Export Excel',
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${baseClasses} ${colorClasses[type]} disabled:opacity-50`}
    >
      {loading ? <LoadingSpinner className={iconSize} /> : icons[type]}
      {label || labels[type]}
    </button>
  )
}
