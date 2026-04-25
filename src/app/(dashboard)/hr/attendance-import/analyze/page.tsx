'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AttendanceAnalysisSummary } from '@/client/components/hr/AttendanceAnalysisSummary'

interface ImportBatch {
  id: string
  source: string
  recordCount: number
  status: string
  createdAt: string
}

interface EmployeeStats {
  user: {
    id: string
    empId: string
    firstName: string
    lastName: string | null
    department: string
  }
  stats: {
    officeDays: number
    wfhDays: number
    absentDays: number
    discrepancyDays: number
    lateDays: number
    totalDeductions: number
  }
}

interface AnalysisResult {
  summary: {
    totalRecords: number
    office: number
    wfh: number
    absent: number
    discrepancy: number
    totalDeductions: number
  }
  dateRange: {
    start: string
    end: string
  }
  byEmployee: EmployeeStats[]
}

export default function AttendanceAnalyzePage() {
  const [myzenBatchId, setMyzenBatchId] = useState('')
  const [biometricBatchId, setBiometricBatchId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [batches, setBatches] = useState<ImportBatch[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBatches()
    // Set default date range to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/hr/attendance-import?limit=50')
      const data = await res.json()
      setBatches(data.batches || [])
    } catch (err) {
      console.error('Failed to fetch batches:', err)
    }
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const res = await fetch('/api/hr/attendance-import/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myzenBatchId: myzenBatchId || undefined,
          biometricBatchId: biometricBatchId || undefined,
          startDate,
          endDate
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze data')
      }

      setAnalysisResult({
        summary: data.summary,
        dateRange: data.dateRange,
        byEmployee: data.byEmployee
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze data')
    } finally {
      setLoading(false)
    }
  }

  const myzenBatches = batches.filter(b => b.source === 'MYZEN' && b.status === 'COMPLETED')
  const biometricBatches = batches.filter(b => b.source === 'BIOMETRIC' && b.status === 'COMPLETED')

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Analysis</h1>
          <p className="text-slate-400 mt-1">Merge MyZen and Biometric data for comprehensive attendance analysis</p>
        </div>
        <Link
          href="/hr/attendance-import"
          className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Import
        </Link>
      </div>

      {/* Configuration */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Analysis Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Batch Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              MyZen Batch
              <span className="text-slate-500 font-normal ml-1">(optional)</span>
            </label>
            <select
              value={myzenBatchId}
              onChange={(e) => setMyzenBatchId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Use saved attendance data</option>
              {myzenBatches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {formatDate(batch.createdAt)} - {batch.recordCount} records
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Biometric Batch
              <span className="text-slate-500 font-normal ml-1">(optional)</span>
            </label>
            <select
              value={biometricBatchId}
              onChange={(e) => setBiometricBatchId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Use saved attendance data</option>
              {biometricBatches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {formatDate(batch.createdAt)} - {batch.recordCount} records
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logic Explanation */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Attendance Logic</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-400">MyZen + Biometric</span>
              <span className="text-emerald-400 font-medium">= Office</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-slate-400">MyZen only</span>
              <span className="text-purple-400 font-medium">= WFH</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-400">Biometric only</span>
              <span className="text-amber-400 font-medium">= Discrepancy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-400">Neither</span>
              <span className="text-red-400 font-medium">= Absent</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !startDate || !endDate}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Run Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-red-300 font-medium">Analysis Failed</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <AttendanceAnalysisSummary
          employees={analysisResult.byEmployee}
          summary={analysisResult.summary}
          dateRange={analysisResult.dateRange}
        />
      )}

      {/* Empty State */}
      {!analysisResult && !loading && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No Analysis Yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Select a date range and optionally choose specific import batches, then click "Run Analysis"
            to merge MyZen and Biometric data for a comprehensive attendance report.
          </p>
        </div>
      )}
    </div>
  )
}
