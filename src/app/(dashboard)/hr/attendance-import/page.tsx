'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AttendanceImportTable } from '@/client/components/hr/AttendanceImportTable'

type SourceType = 'MYZEN' | 'BIOMETRIC'

interface Employee {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  department: string
}

interface ParsedRecord {
  employeeName: string
  employeeId?: string
  matchedUserId?: string
  matchConfidence: number
  date: string
  checkIn?: string
  checkOut?: string
  totalHours?: number
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'WFH' | 'LEAVE'
  isLate?: boolean
  rawLine: string
}

interface ParseSummary {
  totalRecords: number
  matched: number
  unmatched: number
  present: number
  absent: number
  wfh: number
  late: number
}

interface ImportBatch {
  id: string
  source: string
  recordCount: number
  savedCount: number
  status: string
  importedBy: string
  createdAt: string
}

export default function AttendanceImportPage() {
  const [activeTab, setActiveTab] = useState<SourceType>('MYZEN')
  const [rawData, setRawData] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([])
  const [summary, setSummary] = useState<ParseSummary | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [batchId, setBatchId] = useState<string | null>(null)
  const [recentBatches, setRecentBatches] = useState<ImportBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
    fetchRecentBatches()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/hr/employees')
      const data = await res.json()
      setEmployees(data.employees || [])
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    }
  }

  const fetchRecentBatches = async () => {
    try {
      const res = await fetch('/api/hr/attendance-import?limit=5')
      const data = await res.json()
      setRecentBatches(data.batches || [])
    } catch (err) {
      console.error('Failed to fetch batches:', err)
    }
  }

  const handleParse = async () => {
    if (!rawData.trim()) {
      setError('Please paste attendance data')
      return
    }

    setParsing(true)
    setError(null)
    setWarnings([])
    setParsedRecords([])
    setSummary(null)
    setBatchId(null)

    try {
      const res = await fetch('/api/hr/attendance-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: activeTab,
          rawData
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse data')
      }

      setParsedRecords(data.records || [])
      setSummary(data.summary || null)
      setWarnings(data.warnings || [])
      setBatchId(data.batchId || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
    } finally {
      setParsing(false)
    }
  }

  const handleSave = async () => {
    if (!batchId || parsedRecords.length === 0) {
      setError('No records to save')
      return
    }

    const validRecords = parsedRecords.filter(r => r.matchedUserId)
    if (validRecords.length === 0) {
      setError('No records with matched employees to save')
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch(`/api/hr/attendance-import/${batchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: parsedRecords
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save records')
      }

      setSuccessMessage(`Successfully saved ${data.created} new records and updated ${data.updated} existing records`)
      fetchRecentBatches()

      // Clear form after successful save
      setTimeout(() => {
        setRawData('')
        setParsedRecords([])
        setSummary(null)
        setBatchId(null)
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save records')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => {
    setRawData('')
    setParsedRecords([])
    setSummary(null)
    setWarnings([])
    setBatchId(null)
    setError(null)
    setSuccessMessage(null)
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Import</h1>
          <p className="text-slate-400 mt-1">Import attendance data from MyZen or Biometric systems</p>
        </div>
        <Link
          href="/hr/attendance-import/analyze"
          className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analyze Data
        </Link>
      </div>

      {/* Source Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { value: 'MYZEN', label: 'MyZen (Computer Activity)', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )},
          { value: 'BIOMETRIC', label: 'Biometric (Office Presence)', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          )},
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as SourceType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeTab === tab.value
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-red-300 font-medium">Error</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-emerald-300 font-medium">Success</p>
            <p className="text-emerald-400 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-amber-300 font-medium">Warnings ({warnings.length})</p>
          </div>
          <ul className="text-sm text-amber-400 space-y-1 ml-7">
            {warnings.slice(0, 5).map((w, i) => (
              <li key={`warning-${w}-${i}`}>{w}</li>
            ))}
            {warnings.length > 5 && (
              <li className="text-amber-500">...and {warnings.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Input Area */}
      {parsedRecords.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Paste {activeTab === 'MYZEN' ? 'MyZen' : 'Biometric'} Data
              </label>
              <textarea
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder={`Paste your ${activeTab === 'MYZEN' ? 'MyZen activity' : 'biometric attendance'} data here...

Example format:
Employee Name    Date        Check In    Check Out   Hours   Status
Priya Sharma     25/03/2024  10:45       19:30       8.5     Present
Rahul Kumar      25/03/2024  -           -           0       Absent`}
                className="w-full h-64 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Supported formats: Tab-separated, CSV, space-separated
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleParse}
                  disabled={parsing || !rawData.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {parsing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Parsing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Parse Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {[
            { label: 'Total Records', value: summary.totalRecords, color: 'text-white' },
            { label: 'Matched', value: summary.matched, color: 'text-emerald-400' },
            { label: 'Unmatched', value: summary.unmatched, color: 'text-red-400' },
            { label: 'Present', value: summary.present, color: 'text-emerald-400' },
            { label: 'Absent', value: summary.absent, color: 'text-red-400' },
            { label: 'WFH', value: summary.wfh, color: 'text-purple-400' },
            { label: 'Late', value: summary.late, color: 'text-orange-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Parsed Records Table */}
      {parsedRecords.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Parsed Records</h2>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !parsedRecords.some(r => r.matchedUserId)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save to Database
                  </>
                )}
              </button>
            </div>
          </div>

          <AttendanceImportTable
            records={parsedRecords}
            employees={employees}
            onRecordsChange={setParsedRecords}
          />
        </div>
      )}

      {/* Recent Imports */}
      {recentBatches.length > 0 && parsedRecords.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Recent Imports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Source</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Records</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Saved</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Imported By</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        batch.source === 'MYZEN'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {batch.source}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-white">{batch.recordCount}</td>
                    <td className="px-5 py-3 text-sm text-white">{batch.savedCount}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        batch.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : batch.status === 'FAILED'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">{batch.importedBy}</td>
                    <td className="px-5 py-3 text-sm text-slate-400">{formatDate(batch.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
