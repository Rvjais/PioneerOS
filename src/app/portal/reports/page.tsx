'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import PageGuide from '@/client/components/ui/PageGuide'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface Report {
  id: string
  title: string
  type: string
  month: string
  status: string
  fileUrl: string | null
  createdAt: string
}

interface Summary {
  total: number
  byType: Record<string, number>
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [selectedType])

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedType) params.append('type', selectedType)

      const res = await fetch(`/api/client-portal/reports?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
        setSummary(data.summary || null)
        setTypes(data.types || [])
      } else {
        setError('Failed to load reports')
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SEO':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
      case 'SOCIAL_MEDIA':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        )
      case 'ADS':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr)
    return formatDateDDMMYYYY(date)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}-${month}-${d.getFullYear()}`
  }

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="portal-reports"
        title="Reports"
        description="Access performance reports and analytics for your account"
        steps={[
          { label: 'Select report type', description: 'Use the dropdown filter to narrow reports by type such as SEO, Social Media, or Ads' },
          { label: 'Choose date range', description: 'Reports are organized by month so you can easily find the period you need' },
          { label: 'Download PDF/Excel', description: 'Click the Download button next to any report to save it locally' },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-slate-300 mt-1">View and download your monthly performance reports</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 shadow-none border border-white/10">
            <p className="text-sm text-slate-400">Total Reports</p>
            <p className="text-2xl font-bold text-white">{summary.total}</p>
          </div>
          {Object.entries(summary.byType).map(([type, count]) => (
            <div key={type} className="glass-card rounded-xl p-4 shadow-none border border-white/10">
              <p className="text-sm text-slate-400">{type.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-blue-400">{count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-white/20 rounded-lg text-slate-200 glass-card"
          style={{ colorScheme: 'dark' }}
        >
          <option value="" className="bg-slate-800 text-white">All Types</option>
          {types.map((type) => (
            <option key={type} value={type} className="bg-slate-800 text-white">{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {selectedType && (
          <button
            onClick={() => setSelectedType('')}
            className="px-4 py-2 text-slate-300 hover:text-white"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Error State */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => { setError(null); fetchReports() }} className="px-4 py-2 bg-orange-500 text-white rounded-lg">Try Again</button>
        </div>
      ) : null}

      {/* Reports List */}
      {!error && loading ? (
        <PortalPageSkeleton titleWidth="w-32" statCards={0} listItems={5} />
      ) : !error && reports.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border border-white/10">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-1">No Reports Found</h3>
          <p className="text-slate-400">Your reports will appear here once they're generated.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/10">
            {reports.map((report) => (
              <div key={report.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-900/40 transition-colors">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  report.type === 'SEO' ? 'bg-green-500/20 text-green-400' :
                  report.type === 'SOCIAL_MEDIA' ? 'bg-blue-500/20 text-blue-400' :
                  report.type === 'ADS' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-slate-800/50 text-slate-300'
                }`}>
                  {getTypeIcon(report.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{report.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-400">{formatMonth(report.month)}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-sm text-slate-400">Created {formatDate(report.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    report.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                    report.status === 'SENT' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-800/50 text-slate-200'
                  }`}>
                    {report.status}
                  </span>
                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
